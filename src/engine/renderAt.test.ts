import { describe, it, expect } from 'vitest';
import { renderAt } from './renderAt';
import { StoryEngine } from './StoryEngine';
describe('deterministic story state', () => {
  it('reconstructs frames independent of seek history', () => {
    const expected = renderAt(20); renderAt(29); renderAt(0); renderAt(14);
    expect(renderAt(20)).toEqual(expected);
    expect(expected.beat.scene).toBe('concepts');
    expect(expected.principles.map(p => p.lit)).toEqual([true, true, false]);
  });
  it('uses exact beat boundaries and restores poses and camera', () => {
    expect(renderAt(3.999).kernel.opacity).toBe(0);
    expect(renderAt(4).beat.speaker).toBe('kernel');
    expect(renderAt(10).patch.opacity).toBe(1);
    expect(renderAt(25).kernel.pose).toBe('surprised');
    expect(renderAt(29).patch.pose).toBe('exit-turn');
    expect(renderAt(15).scroll).toBe(36);
    expect(renderAt(-5).t).toBe(0); expect(renderAt(50).t).toBe(30);
  });
  it('removes idle, travel, and camera motion in reduced motion', () => {
    const frame = renderAt(20, true);
    expect(frame.kernel.y).toBe(0); expect(frame.patch.rotation).toBe(0);
    expect(frame.scroll).toBe(0); expect(frame.cameraScale).toBe(1);
  });
});
describe('master playhead', () => {
  it('clamps seeks and preserves paused state', () => {
    const engine = new StoryEngine();
    engine.seek(20); expect(engine.time).toBeCloseTo(20);
    engine.pause(); const frame = renderAt(engine.time);
    expect(engine.isPlaying).toBe(false); expect(renderAt(engine.time)).toEqual(frame);
    engine.seek(engine.time - 5); expect(engine.time).toBeCloseTo(15);
    engine.seek(-5); expect(engine.time).toBe(0);
    engine.seek(50); expect(engine.time).toBe(30);
    engine.seek(5); expect(engine.isPlaying).toBe(false);
    engine.destroy();
  });
});
