import { gsap } from 'gsap';

/** One clock for visuals, virtual scroll, idle motion and future audio. */
export class StoryEngine {
  readonly duration = 30;
  private clock = { t: 0 };
  private listeners = new Set<() => void>();
  private timeline: gsap.core.Timeline;
  private playing = false;
  private revision = 0;
  audio: AudioSync | null = null;
  constructor() {
    this.timeline = gsap.timeline({ paused: true, onUpdate: () => this.emit(), onComplete: () => { this.playing = false; this.emit(); } });
    this.timeline.to(this.clock, { t: this.duration, duration: this.duration, ease: 'none' });
  }
  private emit = () => { this.revision++; this.audio?.sync(this.time, this.playing, this.timeline.timeScale()); this.listeners.forEach(fn => fn()); };
  subscribe = (fn: () => void) => { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; };
  snapshot = () => this.revision;
  get time() { return this.clock.t; }
  get isPlaying() { return this.playing; }
  play() { if (this.time >= this.duration) return; this.playing = true; this.timeline.play(); this.emit(); }
  pause() { this.playing = false; this.timeline.pause(); this.emit(); }
  seek(t: number) {
    const wasPlaying = this.playing;
    this.timeline.time(Math.max(0, Math.min(this.duration, t)), false);
    if (!wasPlaying || this.time >= this.duration) this.pause();
    else { this.playing = true; this.timeline.play(); }
    this.emit();
  }
  restart() { this.seek(0); this.play(); }
  speed(rate: number) { this.timeline.timeScale(rate); this.emit(); }
  destroy() { this.timeline.kill(); this.audio?.stop(); this.listeners.clear(); }
}
/** Optional adapter; silent preview intentionally does not create audio. */
export interface AudioSync { sync(time: number, playing: boolean, rate: number): void; stop(): void }
