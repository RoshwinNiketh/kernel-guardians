import { mkdirSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpeg from '@ffmpeg-installer/ffmpeg';
import { scheduled, duration } from '../src/cinematic/edit.ts';
import { soundCues, mixEnvelope } from '../src/cinematic/soundDesign.ts';
import soundAssets from '../src/cinematic/sound-assets.json' with { type: 'json' };
import { introDuration } from '../src/cinematic/introTiming.ts';

const sampleRate = 24000;
const channels = 2;
const channelCounts = new Map(Object.values(soundAssets).map(asset => [asset.file, asset.channels]));
const storyStart = Math.round(introDuration * sampleRate);
const frames = Math.round((introDuration + duration) * sampleRate);
const output = 'src/engine/generated-audio';
mkdirSync(output, { recursive: true });

function run(args, input) {
  const result = spawnSync(process.env.KG_FFMPEG ?? ffmpeg.path, ['-hide_banner', '-loglevel', 'error', ...args], {
    input, maxBuffer: 24 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr.toString());
  return result.stdout;
}

function decode(path, channelCount = channels) {
  const bytes = run(['-i', path, '-vn', '-ac', String(channelCount), '-ar', String(sampleRate), '-f', 'f32le', 'pipe:1']);
  if (bytes.length === 0) throw new Error(`No audio in ${path}`);
  return new Float32Array(bytes.buffer, bytes.byteOffset, bytes.length / 4);
}

function encode(name, mix, bitrate) {
  // Keep headroom across the entire stem while preserving relative levels.
  let peak = 0;
  for (const sample of mix) {
    if (!Number.isFinite(sample)) throw new Error(`Invalid sample in ${name}`);
    peak = Math.max(peak, Math.abs(sample));
  }
  if (peak > .96) {
    const gain = .96 / peak;
    for (let i = 0; i < mix.length; i++) mix[i] *= gain;
  }
  run(['-y', '-f', 'f32le', '-ar', String(sampleRate), '-ac', String(channels), '-i', 'pipe:0',
    '-c:a', 'aac', '-b:a', bitrate, '-movflags', '+faststart', `${output}/${name}.m4a`], Buffer.from(mix.buffer));
}

function renderDialogue() {
  const mix = new Float32Array(frames * channels);
  const theme = decode('public/local-music/intro-theme.mp3');
  if (theme.length / channels < storyStart) throw new Error('Intro theme is shorter than the intro');
  for (let i = 0; i < storyStart; i++) {
    const t = i / sampleRate;
    const gain = .55 * Math.min(1, t / .15, introDuration - t);
    mix[i * 2] = theme[i * 2] * gain;
    mix[i * 2 + 1] = theme[i * 2 + 1] * gain;
  }
  for (const cue of scheduled) {
    const voice = decode(`public/local-voices/${cue.id}.wav`, 1);
    let sum = 0;
    let peak = 0;
    for (const sample of voice) {
      sum += sample * sample;
      peak = Math.max(peak, Math.abs(sample));
    }
    const gain = Math.min(2, .1 / Math.max(Math.sqrt(sum / voice.length), .001), .96 / Math.max(peak, .001));
    const start = storyStart + Math.round(cue.start * sampleRate);
    const length = Math.min(voice.length, Math.round(cue.end * sampleRate) + storyStart - start, frames - start);
    for (let i = 0; i < length; i++) {
      mix[(start + i) * 2] += voice[i] * gain * Math.SQRT1_2;
      mix[(start + i) * 2 + 1] += voice[i] * gain * Math.SQRT1_2;
    }
  }
  encode('intro-dialogue', mix, '96k');
}

function renderSound(bus, bitrate) {
  const mix = new Float32Array(frames * channels);
  const decoded = new Map();
  for (const cue of soundCues.filter(cue => cue.bus === bus)) {
    const sourceChannels = channelCounts.get(cue.file);
    if (!decoded.has(cue.file)) decoded.set(cue.file, decode(`public/local-sound/${cue.file}`, sourceChannels));
    const samples = decoded.get(cue.file);
    const start = storyStart + Math.round(cue.start * sampleRate);
    const end = Math.min(frames, storyStart + Math.round(cue.end * sampleRate));
    const pan = cue.pan ?? 0;
    // Match Web Audio's stereo pan law and interpolate the existing mix envelope.
    const mono = sourceChannels === 1;
    const angle = (mono ? (pan + 1) / 2 : pan < 0 ? pan + 1 : pan) * Math.PI / 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    for (let i = start; i < end; i += 120) {
      const next = Math.min(end, i + 120);
      const gain = mixEnvelope(cue, (i - storyStart) / sampleRate);
      const step = (mixEnvelope(cue, (next - storyStart) / sampleRate) - gain) / (next - i);
      for (let j = i; j < next; j++) {
        const offset = (j - start) * sourceChannels;
        if (!cue.loop && offset >= samples.length) break;
        const left = samples[offset % samples.length];
        const level = gain + step * (j - i);
        if (mono) {
          mix[j * 2] += left * cos * level;
          mix[j * 2 + 1] += left * sin * level;
        } else {
          const right = samples[(offset + 1) % samples.length];
          mix[j * 2] += (pan < 0 ? left + right * cos : left * cos) * level;
          mix[j * 2 + 1] += (pan < 0 ? right * sin : right + left * sin) * level;
        }
      }
    }
  }
  encode(bus, mix, bitrate);
}

renderDialogue();
renderSound('music', '96k');
renderSound('sfx', '64k');
for (const [effect, source] of Object.entries({ click: 'click', slider: 'tick', toggle: 'scan' })) {
  copyFileSync(`public/local-sound/${source}.wav`, `${output}/ui-${effect}.wav`);
}
console.log('Rendered three synchronized AAC tracks and separate UI effects.');
