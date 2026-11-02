# Vercel deployment

Update: the user authorized deploying the supplied menu/intro theme. `public/local-music/intro-theme.mp3` is now the sole allowed audio file in the static build, verified by SHA-256. Menu and intro music work on Vercel after this update. Voice recordings and the story score/SFX remain local and excluded. The earlier exclusion description below applies to those recordings; the menu theme is now an explicit exception.

After merging `rn/master-story-build-v2` into `main`, import `RoshwinNiketh/kernel-guardians` into Vercel, or use the existing connected project. Set the production branch to `main`.

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Root directory | Repository root (`./`) |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Environment variables | None required for the current static edition |

Use the platform's supported default Node version. Do not run `prepare:voices`, sound rendering or the local Chatterbox installation during Vercel builds. The repository contains the necessary duration metadata and artwork. No Python, FFmpeg or GPU is required for the static build. This application uses query parameters rather than client-side path routes, so no SPA rewrite configuration is needed for its current routes.

Official references: [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite), [Vite static deployment](https://vite.dev/guide/static-deploy).

## What the deployed version contains

The cast intro, current story, artwork, animation, captions, settings and transport controls are included. **Narration, soundtrack WAVs and the supplied San Andreas MP3 are deliberately excluded.** Their local routes are installed through Vite's development-only `configureServer` hook, which does not run on Vercel's static CDN. The deployed version will use captions/silent fallback and may indicate missing music. It will not reproduce the fully voiced local preview.

Do not put `.local-media`, `.codex-remote-attachments` or the private Chatterbox workspace into `public`, Git or deployment uploads. Existing environment variables cannot enable these recordings: no production audio service or configurable media origin is implemented. A narrated online edition needs a separate authorized media-delivery design and code integration, preserving the current privacy restrictions. Vercel project protection alone does not create the missing media routes.

## Verify after deployment

Open the production URL, start the film and confirm the cast intro/title, Skip Intro, captions, story progression, Settings pause, seek, mute and portrait layout. Expect the current 26-second intro and 8:20.92 total experience. Confirm no private recordings or theme MP3 are included in deployment artifacts. For the complete local-audio experience, use `npm run dev -- --port 5183 --strictPort` on the prepared development machine.
