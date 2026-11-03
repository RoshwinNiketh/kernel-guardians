import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { scheduled, blackoutAt } from '../src/cinematic/edit.ts';
import { introDuration } from '../src/cinematic/introTiming.ts';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage();
  const audioRequests = [];
  page.on('request', request => {
    if (/\.m4a(?:\?|$)/.test(request.url())) audioRequests.push(request.url());
  });
  await page.addInitScript(() => {
    window.__tracks = new Map();
    window.__uiSounds = [];
    const start = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...args) {
      if (this.kgBus) window.__tracks.set(this.kgBus, { buffer: this.buffer, args });
      if (this.kgUiEffect) window.__uiSounds.push(this.kgUiEffect);
      return start.apply(this, args);
    };
  });
  await page.goto(process.env.KG_VERIFY_URL ?? 'http://127.0.0.1:5186/');
  const startButton = page.getByRole('button', { name: 'START STORY' });
  await startButton.waitFor();
  const slow = process.env.KG_VERIFY_SLOW === '1';
  const network = slow ? await page.context().newCDPSession(page) : undefined;
  if (network) {
    await network.send('Network.enable');
    await network.send('Network.setCacheDisabled', { cacheDisabled: true });
    await network.send('Network.emulateNetworkConditions', {
      offline: false, latency: 150, downloadThroughput: 180000, uploadThroughput: 180000,
    });
  }
  const started = Date.now();
  await startButton.click();
  await page.getByText('Full narration · 66 cues', { exact: true }).waitFor({ timeout: 120000 });
  const seconds = (Date.now() - started) / 1000;
  if (slow) assert(seconds > 30, 'Throttle did not exceed the former 30-second deadline');
  console.log(`All three tracks ready after ${seconds.toFixed(1)} seconds.`);
  await network?.detach();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.getByRole('slider', { name: 'Story timeline' }).fill('50');
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await page.waitForFunction(() => ['click', 'slider'].every(effect => window.__uiSounds.includes(effect)));

  const measured = await page.evaluate(({ cues, intro, blackout }) => {
    function peak(bus, start, end) {
      const { buffer } = window.__tracks.get(bus);
      const data = buffer.getChannelData(0);
      let peak = 0;
      for (let i = Math.round(start * buffer.sampleRate); i < Math.round(end * buffer.sampleRate); i++) {
        peak = Math.max(peak, Math.abs(data[i]));
      }
      return peak;
    }
    return {
      missing: cues.filter(c => peak('voice', intro + c.start, intro + c.end) < .005).map(c => c.id),
      intro: peak('voice', 1, 25),
      music: peak('music', intro, intro + 6),
      sfx: peak('sfx', intro, intro + 6),
      blackout: peak('sfx', intro + blackout - .17, intro + blackout + .07),
      offsets: [...window.__tracks.values()].map(track => track.args[1]),
    };
  }, { cues: scheduled, intro: introDuration, blackout: blackoutAt });
  assert.equal(audioRequests.length, 3);
  assert.deepEqual(measured.missing, []);
  assert(measured.intro > .01 && measured.music > .01 && measured.sfx > .001);
  assert(measured.blackout < .002, 'SFX bleed during blackout');
  assert.deepEqual(measured.offsets, [50, 50, 50]);
  console.log('Static playback verified: three requests, intro, all 66 spoken windows, music, SFX, blackout, shared seek offset and UI sounds.');
} finally {
  await browser.close();
}
