import { it, expect } from "vitest";
import {
  actorFramesAt,
  placeDialogue,
  shots,
  cameraAt,
  shotAt,
} from "./director";
import { scheduled, cueById, cueAt, duration } from "./edit";
import type { SpeakerId } from "./types";

function dialoguePlacementAt(time: number) {
  const cue = cueAt(time);
  if (!cue) return;
  return placeDialogue(
    cue.character as SpeakerId,
    cameraAt(shotAt(time), time),
    actorFramesAt(time),
  );
}

it("gives every exact spoken line its own speaker and never casts the narrator", () => {
  for (const c of scheduled) {
    const t = c.start + c.duration * 0.5,
      placement = dialoguePlacementAt(t)!;
    expect(placement.owner).toBe(c.character);
    const actors = actorFramesAt(t);
    expect(actors.every((a) => (a.actor as string) !== "narrator")).toBe(true);
    if (placement.actorTrackId) {
      const owner = actors.find((a) => a.id === placement.actorTrackId)!;
      expect(owner.actor).toBe(c.character);
      expect(owner.visible).toBe(true);
      expect(owner.speaking).toBe(true);
    }
    if (c.character === "narrator") {
      expect(placement.kind).toBe("narration");
      expect(actors.filter((a) => a.actor === "vex" && a.visible)).toHaveLength(
        0,
      );
      expect(placement.tailX).toBeUndefined();
    }
  }
});
it("keeps command geography and completed entrances through replies and pose changes", () => {
  const cues = scheduled.filter((c) => c.scene === 2);
  let prior: { x: number; y: number; pose: string } | undefined,
    poseChanged = false;
  for (const c of cues) {
    const actor = actorFramesAt(c.start + 0.1).find(
      (a) => a.actor === "kernel",
    )!;
    expect(actor.x).toBe(420);
    expect(actor.footY).toBe(1020);
    expect(actor.arrival).toBe(1);
    expect(actor.offsetX).toBe(0);
    if (prior && prior.pose !== actor.pose) poseChanged = true;
    prior = { x: actor.x, y: actor.footY, pose: actor.pose };
    const patch = actorFramesAt(c.start + 0.1).find(
      (a) => a.actor === "patch",
    )!;
    expect(patch.x).toBe(1450);
    expect(patch.arrival).toBe(1);
  }
  expect(poseChanged).toBe(true);
});
it("uses the real remote speaker, a CRT-only archive and an ensemble at dawn", () => {
  const remote = cueById("S04_KERNEL_002"),
    archive = cueById("S05_ELARA_003"),
    ensemble = cueById("S09_AXIOM_001");
  expect(dialoguePlacementAt(remote.start + 0.2)?.kind).toBe("comms");
  expect(
    actorFramesAt(remote.start + 0.2)
      .filter((a) => a.visible && a.speaking)
      .map((a) => a.actor),
  ).toEqual(["kernel"]);
  const elara = actorFramesAt(archive.start + 0.2).filter((a) => a.visible);
  expect(elara.map((a) => [a.actor, a.mode])).toEqual([["elara", "crt"]]);
  expect(
    actorFramesAt(ensemble.start + 0.2)
      .filter((a) => a.visible)
      .map((a) => a.actor),
  ).toEqual(expect.arrayContaining(["kernel", "patch", "firewall", "axiom"]));
});
it("covers the whole edit without shot gaps, and keeps the image within every camera frame", () => {
  expect(shots[0].start).toBe(0);
  expect(shots.at(-1)!.end).toBe(duration);
  for (let i = 0; i < shots.length; i++) {
    const s = shots[i];
    if (i) expect(s.start).toBeCloseTo(shots[i - 1].end, 3);
    for (const t of [s.start, (s.start + s.end) / 2, s.end - 0.0001]) {
      const camera = cameraAt(s, t);
      expect(camera.x - 960 / camera.zoom).toBeGreaterThanOrEqual(-0.001);
      expect(camera.x + 960 / camera.zoom).toBeLessThanOrEqual(1920.001);
      expect(camera.y - 540 / camera.zoom).toBeGreaterThanOrEqual(-0.001);
      expect(camera.y + 540 / camera.zoom).toBeLessThanOrEqual(1080.001);
      expect(shotAt(t).id).toBe(s.id);
    }
  }
});
it("reconstructs actor motion and removes idle drift in reduced motion", () => {
  const c = cueById("S03_PATCH_006"),
    t = c.start + 0.25,
    expected = actorFramesAt(t);
  actorFramesAt(duration - 1);
  actorFramesAt(0);
  expect(actorFramesAt(t)).toEqual(expected);
  expect(
    actorFramesAt(t, true).every((a) => a.offsetY === 0 && a.offsetX === 0),
  ).toBe(true);
  expect(cameraAt(shotAt(t), t, true)).toEqual(
    cameraAt(shotAt(t), t + 0.1, true),
  );
});
