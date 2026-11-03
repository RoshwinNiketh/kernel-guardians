import { describe, it, expect } from "vitest";
import { StoryEngine } from "./StoryEngine";
describe("master playhead", () => {
  it("clamps seeks and preserves paused state", () => {
    const engine = new StoryEngine();
    engine.seek(20);
    expect(engine.time).toBeCloseTo(20);
    engine.pause();
    expect(engine.isPlaying).toBe(false);
    engine.seek(engine.time - 5);
    expect(engine.time).toBeCloseTo(15);
    engine.seek(-5);
    expect(engine.time).toBe(0);
    engine.seek(50);
    expect(engine.time).toBe(30);
    engine.seek(5);
    expect(engine.isPlaying).toBe(false);
    engine.destroy();
  });
});
