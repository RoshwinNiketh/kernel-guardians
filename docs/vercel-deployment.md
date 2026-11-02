# Vercel deployment

The user authorized publishing the selected generated narration, score and SFX in addition to the supplied menu theme. Development and production now serve identical committed files from `public/local-voices`, `public/local-sound` and `public/local-music`. The 66 dialogue WAVs and all soundtrack assets actually used by the film are included. Voice references, auditions, intermediate renders and the Chatterbox workspace remain local.

Merge `rn/master-story-build-v2` into `main` to trigger the connected Vercel production deployment. Framework: Vite; root: repository root; install: `npm ci`; build: `npm run build`; output: `dist`. No environment variables, GPU, Python or audio generation are required. Do not run `prepare:voices` during deployment.

`src/cinematic/playback-media.json` records byte lengths and SHA-256 hashes. `npm run audit:production` verifies every required narration and soundtrack file in the build and rejects unapproved audio. `node scripts/publish-playback-media.mjs` refreshes the selected published assets from the prepared local workspace when intentionally updating audio.

After deployment check the 26-second intro, 8:20.92 experience, narration, score, SFX, skip, seek, pause, speed, volume and mute. Browser autoplay rules still apply; a click may be needed before audio starts. The production deployment updates only after the branch is merged into main.
