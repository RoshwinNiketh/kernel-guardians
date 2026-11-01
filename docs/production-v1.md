# Full-story implementation and verification

## Delivered behavior

The default experience extends the approved pilot menu and 16:9 stage to the complete locked screenplay: 65 editable dialogue cues, nine chapters and all six security topics. `/?pilot=1` selects the preserved original pilot component and its 30-second data. All 24 original hero PNGs were compared with the supplied approved pack; there are zero byte differences.

One GSAP master playhead drives scenes, active dialogue, character pose/entry/exit/idle transforms, packet effects, camera scrolling, technical diagrams, archival overlay, progress, countdown and audio offsets. Editorial shot IDs are mapped to each measured chapter. The scene art uses the approved panorama and one visually reviewed optional illustrated street; diagram overlays and palette treatments distinguish locations. This is a functional motion comic with simplified staging, not nine newly illustrated environments or complete limb rigs.

AudioContext sources are reconstructed from the master time. Seeking stops the previous source before starting the new cue at its offset; pause/Settings stops audio and visual progress; playback rates affect both clock and voice rate. Volume and mute affect the voice gain. No music or SFX track is supplied; their settings are disabled rather than implying nonexistent tracks. A silent, voice-free final ten-second interval occupies 8:05–8:15. At zero, essential services become available while recovery remains explicitly incomplete.

## Timing

Actual runtime: **575.12 seconds (9:35.12)**. Selected speech totals 409.35 seconds. Normal-rate speech is preserved; inter-cue gaps fill early editorial scene windows. Chapter starts in seconds: 0, 15, 65, 145, 225, 275, 350, 415, 515.65. The countdown is clamped to eight minutes before 0:15, runs to zero at 8:15, and then holds zero. The last scene starts at 8:35.65 and runs through 9:33.12, followed by the end card. The estimate of a 9:05 total was extended to retain the post-zero recovery lines and the complete debrief. No locked dialogue was removed or rewritten.

The exact screenplay is retained in `docs/story/FINAL_LOCKED_SCREENPLAY.md`; production cue IDs and shot references are under `src/story/production`. Dialogue directions never enter the spoken text.

## Local voices and privacy

All 65 cues were generated locally using the existing RTX 5060 CUDA environment, without reinstalling voice dependencies or redownloading references. Standard is used for Grady/Fraser/Juno/Reid/Talia; Nano through the Turbo API for John/Ginger/Cillian. Known baseline settings and seed 164 are retained. Floating-point outputs and original takes remain in the private Chatterbox workspace. Playback WAVs are gain-safe, mono 24 kHz, PCM 24-bit. Elara alone receives an archival bandpass; the stage adds a CRT overlay. No voice-reference or generated recording is tracked or bundled in `dist`.

Private source: `G:/Workspace/AI/tools/chatterbox/kernel_guardians_audio_workspace/production/manifest.json`. Raw outputs, the reproducible batch script, selected WAVs, generation logs and validation results live beside that manifest. The Axiom classification paragraph initially ran unusually long; a sentence-queued retake preserves every sentence and includes documented sentence seeds. The original take is retained. Elara's first filtered take had one full-scale sample; filtering from float and applying gain afterward corrected it while preserving the original.

Run `npm run prepare:voices` to prepare local playback, then `npm run dev -- --port 5182`. The Vite development-only middleware serves a strict cue-ID WAV allowlist from `.local-media`. Static builds never copy that directory. Missing, failed or blocked audio requests switch to captions fallback. The browser creates/resumes AudioContext from the Start Story user click. Public preview builds intentionally play silently.

Rights for preset-reference reuse remain unverified. No audio was committed, uploaded or deployed. Do not publish or distribute these recordings until permissions are resolved.

## Artwork and limitations

`docs/production-assets.json` records provenance. All three supplied supporting-character boards were used as generation references. A transparent atlas was generated and visually inspected, then exported to two separate PNG poses each for Vex, Mira, Elara and Axiom. Empty cell margins were cropped using an alpha threshold for display sizing; image content was not upscaled to invent detail. The exported art is provisional: about 430px figure height, lower detail than the original 637px hero art, with small rim/alpha and pose-continuity differences. In-scene captures were reviewed at matching actor heights. Original boards are preserved in the handoff; no whole board or baked label is used as an actor.

Scenes rely on a limited number of backgrounds and two supporting poses per character. No independent hair/limb rigging, mouth animation, new music or bespoke sound effects are included. Diagram/pose choreography is simplified relative to every visual direction in the screenplay. These are explicit art/polish limits rather than missing dialogue.

No listening or ASR approval is claimed. FFmpeg decoding, sample rate, finite waveform, clipping, silence-event and duration checks were performed. Human review must verify pronunciation, complete words, repetition, speaker likeness and performance, especially the short references and Axiom's sentence joins. Automatic duration checks cannot establish intelligibility.

## Verification

Baseline build passed. Baseline unit tests passed outside the Windows sandbox after its temporary-file rename restriction blocked Vitest. Final build passes; 9 unit/React tests cover pilot rendering, production cue order/count, no speech overlap, nine chapters, countdown, final-ten-second silence and deterministic reconstruction.

Four browser regression tests passed: original pilot full playback and controls; original mobile/reduced motion; full story local loading/65 cue source starts/nine scene captures/pause/seek/rate/ending; and missing-audio portrait fallback. Browser snapshots are `docs/verification/full-scene-1.png` through `full-scene-9.png`, plus `full-mobile.png`. All 65 voices were decoded in Chrome and each was started at a seeked offset. This is technical playback evidence, not listening approval.

An opt-in uninterrupted pass is available with PowerShell `$env:KG_FULL_PLAYBACK='1'; npm run test:browser -- tests/continuous.spec.ts --workers=1`. It plays the full story at the supported 1.25× rate and verifies all 65 cues and completion. Its final result is recorded below after completion.

The public build contains 60 files, approximately 21.3 MB, including original art and new sprites. Private local voices add approximately 29.5 MB outside the public build. Google Fonts remain an optional network dependency with local font fallbacks; art and voices play locally. Native fullscreen remains browser-dependent.

Final continuous result (2 November 2026): **passed**. Chrome played the complete story uninterrupted at 1.25×, reached 575.12 seconds, observed all 65 cue IDs and displayed the final end card, with zero JavaScript exceptions. Wall time approximately eight minutes. This verifies progression and source scheduling; it is not a human listening evaluation. Final selected WAV validation: 65 decoded, all 24 kHz, zero full-scale samples. All four pilot/production browser regressions also pass.
