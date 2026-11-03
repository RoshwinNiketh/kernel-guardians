import { introDuration } from "../../src/cinematic/intro/introTiming.ts";
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { shots } from "../../src/cinematic/timeline/director.ts";
import { scheduled } from "../../src/cinematic/timeline/edit.ts";
const directory = "docs/verification/cinematic";
const filter = process.argv[2] ? new RegExp(process.argv[2]) : null;
await mkdir(`${directory}/frames`, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    }),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:5182/");
  await page.getByRole("button", { name: "START STORY" }).waitFor();
  if (!filter) await page.screenshot({ path: `${directory}/menu-desktop.png` });
  await page.getByRole("button", { name: "START STORY" }).click();
  await page
    .getByRole("slider", { name: "Story timeline" })
    .waitFor({ timeout: 45000 });
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const slider = page.getByRole("slider", { name: "Story timeline" }),
    frames = [];
  for (let i = 0; i < shots.length; i++) {
    if (filter && !filter.test(shots[i].id)) continue;
    const shot = shots[i],
      time = Number(((shot.start + shot.end) / 2).toFixed(3));
    await slider.fill(String(Number((time + introDuration).toFixed(3))));
    await page.locator(".cinematic-stage").evaluate(async (el) => {
      await Promise.all(
        [...el.querySelectorAll("img")].map((img) =>
          img.decode().catch(() => {}),
        ),
      );
    });
    const file = `${directory}/frames/${String(i + 1).padStart(3, "0")}-${shot.id}.png`;
    await page.locator(".stage-container").screenshot({ path: file });
    frames.push({
      index: i + 1,
      time,
      shot: shot.id,
      framing: shot.framing,
      location: shot.location,
      cue: scheduled.find((c) => time >= c.start && time < c.end)?.id ?? null,
      file,
    });
    if (i % 12 === 0) console.log("Captured", i + 1, "/", shots.length);
  }
  if (!filter)
    await writeFile(
      `${directory}/frames.json`,
      JSON.stringify({ errors, frames }, null, 2),
    );
  console.log("Visual review frames", frames.length, "errors", errors.length);
} finally {
  await browser.close();
}
