# Kernel Guardians

**OS City: Eight Minutes to Blackout** is a narrated educational motion comic about operating system security. The cinematic edition preserves all 66 locked dialogue cues across nine chapters. Runtime: **7:54.92** at normal speed.

## Run locally

```powershell
npm ci
npm run dev -- --port 5182 --strictPort
```

Open [the local preview](http://127.0.0.1:5182/). Use Node 22.18 or later. Development and production builds render the three compressed tracks from the individual audio files in the repository. See [Vercel deployment](docs/vercel-deployment.md) for the build and audio update workflow.

Only the current cinematic edition is served. The former pilot and v1 selectors have been removed.

## Playback

Start Story now plays a **30-second intro**, with Skip Intro available, before the existing film. Total experience: **8:24.92**. The menu loops the supplied theme separately. The intro uses the same theme with a timed fade into the story, in the track that also carries dialogue.

The score covers 28.64% of the film. The story uses eight short effects to mark specific actions, with the rest of the effects track silent. The archive and quiet dialogue scenes have no looping ambience. [Sound direction](docs/sound-direction.md) records the mix decisions.

Start Story waits for all three tracks to download and decode before the intro appears. If a track fails to load, retry from the loading screen. Space toggles playback; left/right arrows and the transport buttons seek five seconds. The slider reconstructs any frame. Settings freezes actors, camera, effects, dialogue and every audio bus at the same master time, and resumes the prior playing/paused state.

Settings provides narration, music and SFX levels, subtitles, reduced motion, and 0.75×/1×/1.25× playback. Mute affects all audio. Portrait phones show readable dialogue beneath the artwork. Leaving the browser pauses the story. Fullscreen remains browser dependent.

The eight-minute countdown is fictional story time. Authored location cuts skip forward, while each uninterrupted sequence advances normally. The final ten seconds run continuously, ending at story time 6:31.12. Essential services return; the script explicitly leaves recovery incomplete.

## Project structure

| Location | Responsibility |
| --- | --- |
| `src/app/` | Menu, soundtrack loading, playback controls, and settings |
| `src/cinematic/` | Cast intro, story timing and dialogue data, shot direction, and stage rendering |
| `src/playback/` | Master playhead, audio cue design, audio loading, and synchronized playback |
| `src/components/`, `src/styles/` | Shared UI and styles |
| `public/assets/` | Artwork and menu theme served by the site |
| `assets/audio/` | Editable dialogue, score, and effects WAVs used by the build |
| `scripts/audio/`, `scripts/build/`, `scripts/review/` | Audio preparation, production audit, and capture tools |
| `tests/` | Browser regressions. Unit tests live beside the code they cover. |
| `docs/kit/` | Original pilot art and design references |

## Asset layout

- `public/assets/characters/<character>/<pose>.png` holds every active character pose.
- `public/assets/backgrounds/` holds the menu poster and story locations.
- `public/assets/props/` holds the CRT and artwork used in story diagrams.
- `public/assets/audio/menu-theme.mp3` is the standalone menu theme.
- `assets/audio/dialogue/` and `assets/audio/sound/` hold the editable WAVs. The build renders the playback tracks from these sources.

## Art and story

React, TypeScript, Vite, GSAP and Web Audio drive the experience. `src/cinematic/timeline/edit.ts` sequences measured recordings and short editorial beats; `director.ts` defines 93 shots and scene-long actor presence. Pose changes reuse measured foot anchors and never restart an entrance. Narration has no character avatar. Spoken text remains in `src/cinematic/timeline/data/dialogue_cues.json` and matches `docs/story/FINAL_LOCKED_SCREENPLAY.md` exactly.

All 24 hero poses use higher-resolution artwork regenerated from their original pose references. Fifteen detailed new illustrations provide four environments, individual supporting poses, two background characters and a physical CRT. Flat illustrations support camera movement, lighting, particles and pose swaps; they do not provide mouth or independent limb rigs.

See [the cinematic implementation and review report](docs/production.md), [asset provenance](docs/cinematic-assets-provenance.json), and [the preserved v1 report](docs/production-v1.md). Voice identity, pronunciation and emotional performance still require human listening. Technical validation does not establish those qualities.

## Verification

```powershell
npm test
npm run build
npm run audit:production
npm run test:browser -- --workers=1
$env:KG_FULL_PLAYBACK='1'
npm run test:browser -- tests/continuous.spec.ts --workers=1
```

Chrome is used through the installed Playwright test package. No browser download is needed on this machine.

```powershell
npm run cinematic:export
npm run cinematic:capture
& 'G:/Workspace/AI/tools/chatterbox/venv/Scripts/python.exe' scripts/review/contact-sheets.py
& 'G:/Workspace/AI/tools/chatterbox/venv/Scripts/python.exe' scripts/audio/validate-audio.py
```

The review captures every authored shot. Audio validation checks the 66 selected voices and 25 soundtrack assets with FFmpeg and writes an offline reference mix and listening excerpts to ignored `.local-media/review`. Set `KG_FFMPEG` to override the existing FFmpeg binary. These files stay local and uncommitted. Nothing is deployed automatically.
