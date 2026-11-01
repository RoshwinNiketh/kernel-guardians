import { gsap } from 'gsap';
import scene from '../story/pilot_scene.json';
const ease = gsap.parseEase('power3.out');
const clamp = (v: number) => Math.max(0, Math.min(1, v));
export function renderAt(time: number, reducedMotion = false) {
  const t = Math.max(0, Math.min(scene.durationSeconds, time));
  const beat = scene.storyBeats.find(b => t >= b.start && t < b.end) ?? scene.storyBeats.at(-1)!;
  const enter = (start: number) => reducedMotion ? Number(t >= start) : ease(clamp((t - start) / 1.1));
  const exit = reducedMotion ? Number(t >= 29.4) : ease(clamp((t - 28.6) / 1.4));
  const idle = (offset: number) => reducedMotion ? 0 : Math.sin(t * 2.3 + offset) * 4;
  return {
    t, beat, finished: t >= 30, alert: t >= 25,
    // This virtual camera scroll cannot diverge from the master playhead.
    scroll: reducedMotion ? 0 : (t < 17 ? t * 2.4 : 40.8 + (t - 17) * 1.4),
    cameraScale: reducedMotion ? 1 : 1.04 + t * .0018,
    kernel: { opacity: t >= 4 ? 1 : 0, x: -600 * (1 - enter(4)) - 600 * exit, y: idle(0), rotation: reducedMotion ? 0 : Math.sin(t * 1.2) * .35, pose: t >= 28.6 ? 'exit-turn' : t >= 25 ? 'surprised' : t < 10 ? 'talk' : 'idle' },
    patch: { opacity: t >= 10 ? 1 : 0, x: 600 * (1 - enter(10)) + 600 * exit, y: idle(1.4), rotation: reducedMotion ? 0 : Math.sin(t * 1.3 + 1) * .45, pose: t >= 28.6 ? 'exit-turn' : t >= 25 ? 'surprised' : t >= 17 ? 'point' : 'tablet' },
    bubbleProgress: reducedMotion ? 1 : ease(clamp((t - beat.start) / .45)),
    principles: [17, 19.5, 22].map(start => ({ visible: t >= 10 && t < 25, lit: t >= start, lift: reducedMotion ? 0 : Math.sin(t * 1.5 + start) * 7 })),
    pulse: reducedMotion ? .35 : .25 + (Math.sin(t * 4) + 1) * .14,
    ringRotation: reducedMotion ? 0 : t * 12,
  };
}
