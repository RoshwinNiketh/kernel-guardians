# Pilot verification

Verified on 1 November 2026 using installed Google Chrome on Windows.

- Production TypeScript + Vite build: passed.
- Vitest: 6 tests passed across deterministic scene rendering, playhead boundaries, reduced motion, and React stage output.
- Playwright: desktop complete 30-second playback, paused frame/transform equality, playing-state resume, exact five-second seeks, keyboard seeking from a focused control, replay, confirmation cancellation, and main-menu return.
- Portrait phone: readable dialogue fallback, reduced motion, and no horizontal overflow.
- Browser JavaScript errors: none during the verified desktop flow.
- Captures: `menu-desktop.png`, `menu-mobile.png`, `pilot-0s.png`, `pilot-10s.png`, `pilot-20s.png`, `pilot-29s.png`, `pilot-mobile.png`.

## Visual review

The design inspector checked 1440, 768, and 390 px widths: zero failures. The retained warnings are intentional: warm comic-paper text matches the supplied palette; eleven moving menu elements are sufficient for a single game-menu screen. The comic art requires original saturated colors, hard shadows, and a photo scrim; the single supplied poster is intentionally the only menu illustration. No external footage or stock photography is appropriate for this cutscene.

Screenshots were reviewed for composition, text hierarchy, image proportions, controls, overlap, and phone readability. Desktop: the supplied cast frames the title and the scene characters leave the security concepts and speech bubble clear. Tablet and phone: the cover crop favors the city and title; portrait story dialogue is provided separately at readable size. The t=0 frame is the exact beginning of the establishing-title fade; t=10 is the exact start of Patch's entrance; t=29 catches the final character exit.

Self-review (subjective, not an independent assessment): composition 8/10, typography 8/10, interaction 9/10, source-art continuity 7/10. Remaining limits are the supplied pose-to-pose differences and alpha fringes, plus the reduced visibility of the cast in the portrait menu crop. One neighboring-pose fragment in Kernel's talk PNG is hidden with a CSS mask; original image bytes are preserved.

## Remaining production work

Recorded narration, music, and SFX are absent. Audio volume controls are reserved and clearly labeled; no synchronization claim is made. Approved recordings require an audio adapter and retiming of the provisional cues. Full rigged animation and the remaining story chapters require additional assets and approval. No deployment was performed.

Reproduce with `npm run build`, `npm test`, and `npm run test:browser`. On this machine, Windows sandbox restrictions required running Vitest/Chrome and the local browser-test server outside the sandbox; these are environment restrictions, not application failures.
