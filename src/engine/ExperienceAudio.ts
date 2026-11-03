import type { AudioSync } from './StoryEngine';
import { introDuration } from '../cinematic/introTiming';
import { duration } from '../cinematic/edit';
import dialogueUrl from './generated-audio/intro-dialogue.m4a?url';
import musicUrl from './generated-audio/music.m4a?url';
import sfxUrl from './generated-audio/sfx.m4a?url';
import clickUrl from './generated-audio/ui-click.wav?url';
import sliderUrl from './generated-audio/ui-slider.wav?url';
import toggleUrl from './generated-audio/ui-toggle.wav?url';

const tracks = { voice: dialogueUrl, music: musicUrl, sfx: sfxUrl };
const uiEffects = { click: clickUrl, slider: sliderUrl, toggle: toggleUrl };
type Track = keyof typeof tracks;
type Effect = keyof typeof uiEffects;

async function download(url: string, retry: boolean) {
  const abort = new AbortController();
  let timer: ReturnType<typeof setTimeout>;
  const reset = () => {
    clearTimeout(timer);
    timer = setTimeout(() => abort.abort(), 45000);
  };
  reset();
  try {
    const response = await fetch(url, { signal: abort.signal, cache: retry ? 'reload' : 'default' });
    if (!response.ok || !response.body) throw new Error(`Audio request failed (${response.status})`);
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      reset();
      chunks.push(value);
      size += value.length;
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    return bytes.buffer;
  } finally {
    clearTimeout(timer!);
  }
}

export class ExperienceAudio implements AudioSync {
  readonly context = new AudioContext({ sampleRate: 24000 });
  readonly voice = this.context.createGain();
  readonly music = this.context.createGain();
  readonly sfx = this.context.createGain();
  readonly master = this.context.createGain();
  private readonly compressor = this.context.createDynamicsCompressor();
  private readonly buffers = new Map<Track, AudioBuffer>();
  private readonly uiBuffers = new Map<Effect, Promise<AudioBuffer>>();
  private readonly sources = new Map<Track, AudioBufferSourceNode>();
  private readonly introGain = this.context.createGain();
  private readonly speechGain = this.context.createGain();
  private playback?: { offset: number; started: number; rate: number };
  private lastSlider = -Infinity;
  private failedTracks = new Set<Track>();
  private theme?: AudioBuffer;
  private themePromise?: Promise<void>;
  themeUnavailable = false;
  private menuNodes = new Set<{ source: AudioBufferSourceNode; gain: GainNode }>();
  private timer?: ReturnType<typeof setInterval>;
  private nextMenu = 0;
  private menuRequested = false;

  constructor() {
    this.introGain.connect(this.music);
    this.speechGain.connect(this.voice);
    for (const gain of [this.voice, this.music, this.sfx]) gain.connect(this.compressor);
    this.compressor.threshold.value = -6;
    this.compressor.knee.value = 10;
    this.compressor.ratio.value = 8;
    this.compressor.attack.value = .003;
    this.compressor.release.value = .15;
    this.compressor.connect(this.master);
    this.master.connect(this.context.destination);
    this.setMix(100, 100, 100);
    for (const effect of Object.keys(uiEffects) as Effect[]) {
      void this.loadUI(effect).catch(() => {});
    }
  }

  setMix(voice: number, music: number, sfx: number, muted = false) {
    this.voice.gain.value = voice / 100;
    this.music.gain.value = music / 100;
    this.sfx.gain.value = sfx / 100;
    this.master.gain.value = muted ? 0 : .88;
  }

  async load(progress: (loaded: number, total: number) => void) {
    await this.context.resume();
    const entries = Object.entries(tracks) as [Track, string][];
    progress(this.buffers.size, entries.length);
    const results = await Promise.allSettled(entries.map(async ([track, url]) => {
      if (this.buffers.has(track)) return;
      try {
        const buffer = await this.context.decodeAudioData(await download(url, this.failedTracks.has(track)));
        if (Math.abs(buffer.duration - introDuration - duration) > .12) {
          throw new Error(`Unexpected length for ${track}`);
        }
        this.buffers.set(track, buffer);
        this.failedTracks.delete(track);
        progress(this.buffers.size, entries.length);
      } catch (error) {
        this.failedTracks.add(track);
        throw error;
      }
    }));
    const failure = results.find(result => result.status === 'rejected');
    if (failure?.status === 'rejected') throw failure.reason;
  }

  private loadUI(effect: Effect) {
    let pending = this.uiBuffers.get(effect);
    if (!pending) {
      pending = download(uiEffects[effect], false)
        .then(bytes => this.context.decodeAudioData(bytes))
        .catch(error => {
          this.uiBuffers.delete(effect);
          throw error;
        });
      this.uiBuffers.set(effect, pending);
    }
    return pending;
  }

  async playUI(effect: Effect) {
    const now = performance.now();
    if (effect === 'slider' && now - this.lastSlider < 75) return;
    if (effect === 'slider') this.lastSlider = now;
    await this.context.resume();
    const buffer = await this.loadUI(effect);
    if (performance.now() - now > 500 || document.hidden) return;
    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    source.buffer = buffer;
    Object.assign(source, { kgUiEffect: effect });
    gain.gain.value = effect === 'slider' ? .22 : .4;
    source.connect(gain);
    gain.connect(this.sfx);
    source.onended = () => { source.disconnect(); gain.disconnect(); };
    source.start();
  }

  async loadTheme() {
    await this.context.resume();
    return this.themePromise ??= (async () => {
      try {
        this.theme = await this.context.decodeAudioData(await download('/local-music/intro-theme.mp3', false));
      } catch {
        this.themeUnavailable = true;
      }
    })();
  }

  async startMenu() {
    this.menuRequested = true;
    await this.loadTheme();
    if (!this.menuRequested || !this.theme || this.timer || document.hidden) return;
    this.nextMenu = this.context.currentTime;
    const queue = () => {
      if (!this.theme) return;
      while (this.nextMenu < this.context.currentTime + .6) {
        const source = this.context.createBufferSource();
        const gain = this.context.createGain();
        source.buffer = this.theme;
        source.connect(gain);
        gain.connect(this.music);
        const at = Math.max(this.nextMenu, this.context.currentTime);
        const end = at + this.theme.duration;
        gain.gain.setValueAtTime(0, at);
        gain.gain.linearRampToValueAtTime(.55, at + .12);
        gain.gain.setValueAtTime(.55, end - .12);
        gain.gain.linearRampToValueAtTime(0, end);
        const node = { source, gain };
        this.menuNodes.add(node);
        source.onended = () => { this.menuNodes.delete(node); source.disconnect(); gain.disconnect(); };
        source.start(at);
        this.nextMenu = end - .12;
      }
    };
    queue();
    this.timer = setInterval(queue, 200);
  }

  stopMenu(fade = .15) {
    this.menuRequested = false;
    clearInterval(this.timer);
    this.timer = undefined;
    const now = this.context.currentTime;
    for (const { source, gain } of this.menuNodes) {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + fade);
      source.stop(now + fade);
    }
    this.menuNodes.clear();
  }

  sync(time: number, playing: boolean, rate: number) {
    if (!playing) { this.stop(); return; }
    if (this.buffers.size !== Object.keys(tracks).length) return;
    const now = this.context.currentTime;
    const current = this.playback;
    if (current && current.rate === rate &&
        Math.abs(time - current.offset - (now - current.started) * rate) < .15) return;
    this.stop();
    this.stopMenu(0);
    const started = now + .01;
    const boundary = started + (introDuration - time) / rate;
    for (const [gain, during, after] of [[this.introGain, 1, 0], [this.speechGain, 0, 1]] as const) {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(time < introDuration ? during : after, now);
      if (boundary > started) gain.gain.setValueAtTime(after, boundary);
    }
    for (const [track, buffer] of this.buffers) {
      if (time >= buffer.duration) continue;
      const source = this.context.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = rate;
      if (track === 'voice') {
        source.connect(this.introGain);
        source.connect(this.speechGain);
      } else {
        source.connect(this[track]);
      }
      Object.assign(source, { kgCueId: `stem:${track}`, kgBus: track });
      source.start(started, time);
      this.sources.set(track, source);
    }
    this.playback = { offset: time, started, rate };
  }

  stop() {
    for (const source of this.sources.values()) {
      source.stop();
      source.disconnect();
    }
    this.sources.clear();
    this.playback = undefined;
  }

  get debugState() {
    const current = this.playback;
    const offset = current && current.offset + Math.max(0, this.context.currentTime - current.started) * current.rate;
    return {
      loadedTracks: [...this.buffers.keys()],
      rate: current?.rate,
      voiceGain: this.voice.gain.value, musicGain: this.music.gain.value,
      sfxGain: this.sfx.gain.value, masterGain: this.master.gain.value,
      active: [...this.sources.keys()].map(bus => ({ id: `stem:${bus}`, bus, offset })),
      themeLoaded: !!this.theme, themeUnavailable: this.themeUnavailable, menuSources: this.menuNodes.size,
      introActive: offset !== undefined && offset < introDuration, introOffset: offset,
    };
  }
}
