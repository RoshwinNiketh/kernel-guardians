# Vercel deployment

The repository keeps the menu theme and individual dialogue, score and sound effect clips as editing sources. Each build uses the npm-installed FFmpeg binary to render three synchronized AAC tracks: intro and dialogue, story music, and story effects. The individual WAVs live in `assets/audio/dialogue` and `assets/audio/sound`, outside the public directory. The menu theme and short UI sounds are served independently.

Use the Vite preset, repository root, `npm ci` for installation, `npm run build` for the build and `dist` for the output. Use Node 22.18 or later for the TypeScript imports in the render script. No GPU, Python, environment variables or access to the Chatterbox workspace are needed. Run `npm run dev` for the same render pipeline locally.

Playback starts only after all three tracks have downloaded and decoded. The request deadline resets as bytes arrive. If a track fails, Retry audio requests the missing track again. The browser can reuse cached audio on repeat visits and Vite fingerprints the rendered tracks when their content changes. Decoded audio stays in memory for seeking and replay within the tab.

To update audio, edit the individual source clips or cue timing, refresh the source hashes with the existing publication workflow, then rebuild. `npm run audit:production` checks source integrity and the output allowlist. With a static preview running on port 5186, `node scripts/review/verify-static-playback.mjs` checks the rendered audio and browser playback. Set `KG_VERIFY_URL` to test another preview URL.
