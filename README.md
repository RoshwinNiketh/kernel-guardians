# Kernel Guardians

**OS City: Under Attack**

Kernel Guardians is an interactive motion-comic project designed to explain Operating System security concepts through cinematic storytelling.

The experience combines vibrant 2D comic artwork, animated characters, synchronized dialogue, automatic scrolling, and game-inspired playback controls.

### Educational Coverage

- The Security Problem
- Program Threats
- System and Network Threats
- Implementing Security Defenses
- Firewalling to Protect Systems and Networks
- Computer-Security Classifications

### Planned Features

- Gamified main menu
- Automated cinematic storytelling
- Scroll-driven scene transitions
- Character entrance, exit, and idle animations
- Synchronized dialogue and narration
- Pause and resume from the exact story position
- Five-second rewind and forward
- Customizable audio and playback settings

### Project Status

**In development:** Initial asset production and 30-second cutscene prototype.

### Technology

React, TypeScript, Vite, GSAP, and Tailwind CSS.
## Run the 30-second pilot

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://127.0.0.1:5173).

```sh
npm run build
npm run preview
npm test
npm run test:browser
```

Browser tests use an installed Google Chrome through Playwright; no separate browser download is required. They capture the menu and story frames at 0, 10, 20, and 29 seconds in `docs/verification/` and play the complete pilot in real time.

### Controls

- **Start Story** begins the pilot after all 48 illustration assets load.
- **Space** pauses or plays. **Left / Right** seek exactly five seconds when not editing a control.
- **Settings / Escape** freezes the master playhead, including idle motion, effects, and automatic camera scrolling. Closing Settings preserves the prior playing or paused state.
- The timeline slider reconstructs the entire scene at its chosen time. Seeking is clamped to 0–30 seconds.
- Settings includes playback speed, dialogue/subtitles, reduced motion, and reserved audio levels. Restart and Main Menu require confirmation in the pause menu.
- The fullscreen button requests native browser fullscreen; the stage also fits the browser window without it.
- Portrait phones show readable live dialogue below the letterboxed artwork.
- Switching away from the browser pauses playback; press Play when returning.

### Story and assets

`src/story/pilot_scene.json` is the editable dialogue and five-beat scene outline. `src/story/asset_manifest.json` maps the original PNG art. Edit the live text here rather than modifying artwork. `src/engine/renderAt.ts` derives the complete visual state from the playhead; `StoryEngine.ts` supplies the single GSAP clock. The original kit documentation, mockup, catalog, and reference sheets are preserved under `docs/kit/`.

The current pilot is explicitly silent. No voiceover, music, or sound effects are fabricated. Audio settings are reserved for future recordings; `AudioSync` defines the future synchronization hook. Timing is provisional until recordings are approved. Independent limb or hair animation is unavailable because the character poses are flattened PNGs. Final production art continuity/alpha QA and the longer story remain future work.

## Full local narrated story

The complete nine-chapter edition is now the default experience. The original pilot remains at `/?pilot=1`.

```sh
npm run prepare:voices
npm run dev -- --port 5182
```

Open http://127.0.0.1:5182/. `prepare:voices` reads the existing private production manifest from the Chatterbox workspace, copies the 65 selected WAVs into ignored `.local-media/dialogue`, and writes duration-only timing metadata. Set `KG_VOICE_WORKSPACE` to override the local source directory. Missing voices produce a captions fallback rather than a broken story.

The final measured story duration is **9:35.12**. The fictional countdown remains 08:00 at story time 0:15 and reaches zero at 8:15. Recovery dialogue continues after zero, and the historical TCSEC debrief starts at 8:35.65. Dialogue is never sped up to force an editorial window.

`npm run build` produces a captions-capable public bundle with **no private voice media**. The private audio route exists only on the local development server; `npm run preview` does not serve it. Do not copy `.local-media`, the private Chatterbox workspace, or voice references into hosting artifacts. No deployment or commit was performed.

See `docs/production.md` for implementation details, tests, artwork status, and remaining speech-review requirements.
