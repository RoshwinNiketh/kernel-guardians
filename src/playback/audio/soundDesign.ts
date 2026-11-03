import {
  chapters,
  scheduled,
  climaxStart,
  blackoutAt,
  cueById,
  duration,
} from "../../cinematic/timeline/edit.ts";
import soundAssets from "./sound-assets.json" with { type: "json" };
import type { SoundCue } from "../../cinematic/timeline/types";
export interface MixCue extends SoundCue {
  file: string;
  purpose?: string;
}
export const soundCues: MixCue[] = [];
const assets = soundAssets as Record<
  string,
  { file: string; duration: number }
>;
function score(
  id: string,
  name: string,
  start: number,
  end: number,
  gain: number,
  purpose: string,
) {
  if (end - start > assets[`score-${name}`].duration)
    throw Error(`Score too short: ${id}`);
  soundCues.push({
    id,
    kind: "score",
    file: assets[`score-${name}`].file,
    start,
    end,
    gain,
    bus: "music",
    duck: true,
    purpose,
  });
}
const c = cueById;
// Finite musical phrases. No chapter-wide looping and no music in the archive.
score(
  "score-opening",
  "city",
  0,
  c("S01_VEX_002").end + 0.4,
  0.75,
  "Ordinary city interrupted by a threat",
);
score(
  "score-first-intrusion",
  "pressure",
  c("S02_VEX_007").start - 0.65,
  chapters[1].end,
  0.58,
  "Threat interrupts command",
);
score(
  "score-deceptive-gift",
  "investigation",
  chapters[2].start,
  c("S03_KERNEL_004").end + 0.25,
  0.55,
  "Deceptive update and payload reveal",
);
score(
  "score-botnet-reveal",
  "pressure",
  c("S04_VEX_004").start - 0.5,
  c("S04_FIREWALL_007").start - 0.2,
  0.65,
  "Traffic grows; drop to silence for the serious realization",
);
score(
  "score-containment",
  "investigation",
  c("S06_PATCH_003").start,
  c("S06_PATCH_003").end + 0.4,
  0.48,
  "First coordinated defensive action",
);
score(
  "score-permitted-danger",
  "pressure",
  c("S07_VEX_004").start - 0.5,
  c("S07_FIREWALL_005").end + 0.3,
  0.55,
  "Danger inside an allowed path",
);
score(
  "score-internal-threat",
  "pressure",
  chapters[7].start,
  c("S08_PATCH_002").end + 0.2,
  0.6,
  "Internal compromise becomes clear",
);
score(
  "score-last-response",
  "response",
  c("S08_VEX_006").start - 0.35,
  blackoutAt - 0.22,
  0.82,
  "Final response builds, then cuts with the blackout",
);
score(
  "score-city-survives",
  "dawn",
  c("S09_NARRATOR_004").start - 0.3,
  duration,
  0.62,
  "Restrained recovery; no instant-victory fanfare",
);

function event(
  id: string,
  kind: SoundCue["kind"],
  time: number,
  gain: number,
  pan = 0,
  purpose = "",
) {
  const start = Math.max(0, time);
  soundCues.push({
    id,
    kind,
    file: assets[kind].file,
    start,
    end: start + assets[kind].duration,
    gain,
    bus: "sfx",
    pan,
    duck: true,
    purpose,
  });
}
// Sound marks an on-screen action. Leave space between effects for the voices.
event("district-power-loss", "impact", 7, 0.55, -0.15, "First visible district outage");
event(
  "updater-install",
  "click",
  c("S03_MIRA_001").start + 0.3,
  0.42,
  -0.12,
  "Updater button press",
);
const buffer = c("S03_PATCH_007");
event(
  "buffer-boundary-break",
  "impact",
  buffer.start + buffer.duration * 2 / 3,
  0.39,
  -0.08,
  "First overflowing cell",
);
event(
  "archive-start",
  "crt",
  c("S05_ELARA_003").start - 1.05,
  0.56,
  0.15,
  "CRT relay engages",
);
event("final-gate-strain", "gate", climaxStart, 0.63, -0.15, "Gate takes the load");
event(
  "final-isolation",
  "contain",
  climaxStart + 3.2,
  0.57,
  0.12,
  "Isolation relay locks",
);
event("final-transfer", "scan", climaxStart + 6.8, 0.45, 0, "Standby transfer engages");
event(
  "essential-services-restored",
  "restore",
  blackoutAt + 0.12,
  0.62,
  0,
  "Essential services return",
);
soundCues.sort((a, b) => a.start - b.start);
const clamp = (x: number) => Math.max(0, Math.min(1, x));
/** Playhead-derived anticipation, hold and release: small dialogue gaps never pump. */
export function speechActivityAt(t: number) {
  let activity = 0;
  for (const cue of scheduled) {
    if (t < cue.start - 0.12 || t > cue.end + 0.85) continue;
    const a =
      t < cue.start
        ? clamp((t - cue.start + 0.12) / 0.12)
        : t <= cue.end + 0.15
          ? 1
          : clamp(1 - (t - cue.end - 0.15) / 0.7);
    activity = Math.max(activity, a);
  }
  return activity;
}
export function mixEnvelope(c: MixCue, t: number, _voiceActive?: boolean) {
  const attack = c.bus === "music" ? 1.2 : 0.006,
    release = c.bus === "music" ? 1.8 : 0.025;
  const fade = Math.min(
    clamp((t - c.start) / attack),
    clamp((c.end - t) / release),
  );
  const duck = c.duck
    ? 1 - speechActivityAt(t) * (c.bus === "music" ? 0.78 : 0.62)
    : 1;
  // The brief visible blackout is a deliberate effects/score dropout, never a voice cut.
  const blackout = t >= blackoutAt - 0.22 && t < blackoutAt + 0.12 ? 0 : 1;
  return c.gain * fade * duck * blackout;
}
