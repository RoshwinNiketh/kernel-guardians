import { readFileSync, copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { createHash } from "node:crypto";
import { scheduled } from "../../src/cinematic/timeline/edit.ts";
import soundAssets from "../../src/playback/audio/sound-assets.json" with { type: "json" };
// Publish selected playback assets only; references and auditions stay local.
const selected = [
  ...scheduled.map((c) => ({
    source: `.local-media/dialogue/${c.id}.wav`,
    path: `assets/audio/dialogue/${c.id}.wav`,
  })),
  ...[...new Set(Object.values(soundAssets).map((c) => c.file))].map(
    (file) => ({
      source: file.startsWith("score-")
        ? `.local-media/sound/${file}`
        : `assets/audio/sound/${file}`,
      path: `assets/audio/sound/${file}`,
    }),
  ),
  {
    source: ".local-media/music/intro-theme.mp3",
    path: "public/assets/audio/menu-theme.mp3",
  },
];
const files = selected.map(({ source, path }) => {
  const bytes = readFileSync(source);
  mkdirSync(dirname(path), { recursive: true });
  if (source !== path) copyFileSync(source, path);
  return {
    path,
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
});
writeFileSync(
  "src/playback/audio/playback-media.json",
  JSON.stringify({ files }, null, 2) + "\n",
);
console.log(`Published ${files.length} selected playback assets.`);
