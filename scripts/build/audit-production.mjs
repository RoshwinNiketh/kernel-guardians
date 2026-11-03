import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, basename } from "node:path";
import assert from "node:assert/strict";
import {
  duration,
  scheduled,
  chapters,
} from "../../src/cinematic/timeline/edit.ts";
import {
  shots,
  actorTracks,
  poseAt,
} from "../../src/cinematic/timeline/director.ts";
import { artworkUrls } from "../../src/cinematic/stage/assets.ts";
import { soundCues } from "../../src/playback/audio/soundDesign.ts";
const script = readFileSync("docs/story/FINAL_LOCKED_SCREENPLAY.md", "utf8");
const spoken = [
  ...script.matchAll(
    /^\*\*(?:NARRATOR|VEX NULL|KERNEL|PATCH|FIREWALL|MIRA|ELARA|AXIOM)(?: \([^\n)]*\))?:\*\* (.+)$/gm,
  ),
].map((m) => m[1].trim());
assert.equal(spoken.length, 66);
assert.deepEqual(
  scheduled.map((c) => c.spoken_text),
  spoken,
);
const files = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? files(p) : [p];
  });
const published = files("dist");
const media = JSON.parse(
  readFileSync("src/playback/audio/playback-media.json", "utf8"),
).files;
const sourcePaths = new Set(media.map((file) => file.path));
for (const file of media) {
  const bytes = readFileSync(file.path);
  assert.equal(bytes.length, file.bytes);
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    file.sha256,
    `Source audio changed: ${file.path}`,
  );
}
for (const cue of scheduled)
  assert(
    sourcePaths.has(`assets/audio/dialogue/${cue.id}.wav`),
    `Missing narration: ${cue.id}`,
  );
for (const cue of soundCues)
  assert(
    sourcePaths.has(`assets/audio/sound/${cue.file}`),
    `Missing soundtrack: ${cue.file}`,
  );
const audio = published.filter((path) =>
  /\.(wav|mp3|m4a|ogg|flac|npy)$/i.test(path),
);
const generated = [
  "intro-dialogue.m4a",
  "music.m4a",
  "sfx.m4a",
  "ui-click.wav",
  "ui-slider.wav",
  "ui-toggle.wav",
];
const theme = join("dist", "assets", "audio", "menu-theme.mp3");
assert.deepEqual(
  readFileSync(theme),
  readFileSync("public/assets/audio/menu-theme.mp3"),
);
for (const name of generated) {
  const [stem, extension] = name.split(".");
  const matches = audio.filter(
    (path) =>
      basename(path).startsWith(stem + "-") && path.endsWith("." + extension),
  );
  assert.equal(matches.length, 1, `Missing or duplicated build audio: ${name}`);
  assert.deepEqual(
    readFileSync(matches[0]),
    readFileSync(join("src/playback/audio/generated-audio", name)),
  );
}
assert.equal(
  audio.length,
  generated.length + 1,
  "Unexpected media in the build",
);
const sha = (file) =>
  createHash("sha256").update(readFileSync(file)).digest("hex");
const metrics = JSON.parse(
  readFileSync("src/cinematic/stage/art-metrics.json", "utf8"),
);
const heroFiles = ["kernel", "patch", "firewall"].flatMap((actor) =>
  files(`public/assets/characters/${actor}`),
);
assert.equal(heroFiles.length, 24);
for (const file of heroFiles) {
  const url = "/" + file.replaceAll("\\", "/").slice("public/".length);
  const metric = Object.values(metrics).find((item) => item.file === url);
  const source =
    "kg-master-handoff/assets/approved-pilot" + url.slice("/assets".length);
  assert(metric?.sourceSha256, `Missing source hash: ${url}`);
  if (existsSync(source)) {
    assert.equal(
      sha(source),
      metric.sourceSha256,
      `Original artwork changed: ${source}`,
    );
  }
}
for (const metric of Object.values(metrics)) {
  const source = readFileSync(`public${metric.file}`);
  assert.equal(
    createHash("sha256").update(source).digest("hex"),
    metric.sha256,
    `Artwork changed: ${metric.file}`,
  );
  assert.equal(
    source.readUInt32BE(16),
    metric.width,
    `Unexpected width: ${metric.file}`,
  );
  assert.equal(
    source.readUInt32BE(20),
    metric.height,
    `Unexpected height: ${metric.file}`,
  );
  assert.deepEqual(
    readFileSync(`dist${metric.file}`),
    source,
    `Build artwork differs: ${metric.file}`,
  );
}
for (const cue of scheduled)
  for (const actor of actorTracks.filter((a) => a.scene === cue.scene))
    assert(
      metrics[`${actor.actor}/${poseAt(actor, cue.start + 0.1)}`],
      `Missing pose for ${actor.actor}`,
    );
const expectedArt = artworkUrls.map((url) => url.split("?")[0]).sort();
const deployedArt = published
  .map((path) => path.replaceAll("\\", "/"))
  .filter((path) => /^dist\/assets\/.*\.(png|webp)$/i.test(path))
  .map((path) => path.slice("dist".length))
  .sort();
assert.deepEqual(
  deployedArt,
  expectedArt,
  "Missing or unused artwork in the build",
);
const regeneratedHeroPoses = Object.values(metrics).filter(
  (metric) => metric.sourceSha256 && metric.rendering === "regenerated",
).length;
const result = {
  lockedDialogueMatches: spoken.length,
  chapters: chapters.length,
  authoredShots: shots.length,
  soundEvents: soundCues.length,
  measuredActorPoses: Object.keys(metrics).length,
  publishedArtwork: deployedArt.length,
  durationSeconds: duration,
  publishedPlaybackAssets: audio.length,
  unapprovedMediaInPublicBuild: false,
  publicFiles: published.length,
  publicBytes: published.reduce((n, p) => n + statSync(p).size, 0),
  heroPosesUpscaled: heroFiles.length - regeneratedHeroPoses,
  regeneratedHeroPoses,
};
console.log(JSON.stringify(result, null, 2));
