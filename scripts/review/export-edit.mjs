import { writeFileSync, mkdirSync } from "node:fs";
import {
  scheduled,
  chapters,
  duration,
  narrativeCuts,
  climaxStart,
  blackoutAt,
} from "../../src/cinematic/timeline/edit.ts";
import { shots, actorTracks } from "../../src/cinematic/timeline/director.ts";
import {
  soundCues,
  mixEnvelope,
} from "../../src/playback/audio/soundDesign.ts";
mkdirSync(".local-media", { recursive: true });
writeFileSync(
  ".local-media/cinematic-edit.json",
  JSON.stringify(
    {
      scheduled,
      chapters,
      duration,
      narrativeCuts,
      climaxStart,
      blackoutAt,
      shots,
      actorTracks,
      soundCues,
    },
    null,
    2,
  ) + "\n",
);
writeFileSync(
  ".local-media/cinematic-envelopes.json",
  JSON.stringify(
    Object.fromEntries(
      soundCues.map((c) => [
        c.id,
        Array.from({ length: Math.ceil((c.end - c.start) * 100) + 1 }, (_, i) =>
          mixEnvelope(c, Math.min(c.end, c.start + i / 100)),
        ),
      ]),
    ),
  ),
);
mkdirSync("docs/verification/cinematic", { recursive: true });
writeFileSync(
  "docs/verification/cinematic/edit.json",
  JSON.stringify(
    {
      duration,
      chapters,
      narrativeCuts,
      climaxStart,
      blackoutAt,
      shots,
      actorTracks,
      soundCues,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "Exported",
  scheduled.length,
  "cues,",
  shots.length,
  "shots,",
  soundCues.length,
  "sound events; duration",
  duration,
);
