# V2 update — 2 November 2026

Patch now confirms “Eight minutes.” before Firewall responds. This is the user-approved addition to the previously locked script: 66 cues, 474.92 seconds. The older build routes and entry points are removed. Remote feeds are labeled by their actual locations. The apartment CRT is present from scene entry, detects a local archive, then boots the recovered recording. The earlier verification record below describes the preceding cinematic revision; the current revision passed the build, 15 unit tests and five focused Chrome checks. All 91 selected voice/sound WAVs decoded with FFmpeg, without full-scale samples. Patch’s very short new clip triggers a quiet-frame ratio warning and remains subject to listening review. Private audio remains excluded from Git and static builds.

# Cinematic edition: implementation and listening review

Reviewed 2 November 2026 on `rn/main-story-build-v1`, based on `1d26f2f` plus the uncommitted cinematic changes. No commit, upload or deployment is part of this revision. The prior implementation and its measured timings remain in `src/legacyV1` and `production-v1.md`.

## Editorial and cinematography changes

All 65 lines match the finalized screenplay exactly, in their original order. Speech totals 408.31 seconds. Runtime is 473.56 seconds (7:53.56), versus v1's 575.12 seconds. Dialogue has not been sped up to reach this duration. Long chapter-filling gaps were replaced by conversational beats of about 0.18–0.8 seconds, with separate authored pauses for containment, the CRT boot, transitions and the final response.

The countdown distinguishes fictional time from playback time. It begins at 08:00 on the command cut, skips forward only on seven explicit editorial cuts, reaches 00:10 at 381.12 seconds and runs uninterrupted to zero at 391.12 seconds. The exact cut map and all 92 shots are in `verification/cinematic/edit.json`.

| Chapter | Playback interval | Staging |
| --- | --- | --- |
| The Message | 0:00–0:15.55 | Moving city aerial, district outage, deliberate Vex transmission reveal |
| The Security Problem | 0:15.55–1:02.06 | Persistent Kernel/Patch command geography; named gateway comms |
| The Gift | 1:02.06–2:01.82 | Illustrated street, civilians, deceptive updater and payload reveal |
| Outside the Gates | 2:01.82–3:03.57 | Physical Firewall at the gate; distinct command feeds; growing packet flood |
| Behind the Files | 3:03.57–3:40.25 | Mira's apartment; physical CRT containing Elara's recovered recording |
| Patch's Plan | 3:40.25–4:42.46 | Established command positions; sequential diagnostic/response inserts |
| The Gatekeeper | 4:42.46–5:31.85 | Gate filtering, concealed traffic and a controlled serious Firewall pose |
| The Last Packet | 5:31.85–6:52.06 | Command/gateway cross-cuts, final ten-second action sequence, partial restoration |
| After the Blackout | 6:52.06–7:53.56 | Four-character dawn ensemble and repair crews; historical TCSEC debrief |

`ActorTrack` represents presence in a location independently of dialogue. Kernel's only sliding arrival is at the initial command entrance; later changes of framing are cuts. React actor nodes keep stable track keys. Pose swaps replace the image in place with per-pose alpha/foot measurements, preserving the actor's world position. Characters can be excluded from an insert without being made to walk away. Camera movement, lighting, traffic, idle drift and CRT raster all derive from the master clock and freeze in Settings.

Dialogue ownership comes directly from the locked cue. Physical speech uses a tail anchored toward the actual actor; named comms, archive, off-screen and narration plates are distinct. The narrator never gets an actor or Vex's artwork. Explanatory inserts avoid covering the speaking actor's face. Kernel remains left and Patch right in command. The climax separates holding the gate, isolating the service and switching to standby; the ending retains incomplete recovery and continued monitoring.

## Artwork

All 24 approved hero PNG files match the supplied pack byte for byte. The pilot remains accessible unchanged. Fifteen new images were generated and visually inspected as individual assets and in the film:

- Four detailed environments: command center, public gateway, Mira's apartment and dawn city (1672×941).
- Two individual poses each for Vex, Mira, Elara and Axiom (1024×1536 RGBA). Elara's waist-up art is used only within the CRT's masked glass.
- One citizen and one technician (1024×1536 RGBA) for scene scale and repair activity.
- One physical CRT television (1536×1024 RGBA).

The supplied approved supporting reference boards remain the design references. `cinematic-assets-provenance.json` records source paths and the eleven persisted generation prompts. The four environment prompts were not persisted by the first batch and are explicitly marked absent, rather than reconstructed as exact prompts. `src/cinematic/art-metrics.json` records sizes, alpha-derived anchors and SHA-256 checksums for all 34 active actor poses.

These are detailed flattened illustrations with 2.5D motion graphics. Independent limb/hair rigs, mouth animation, and newly drawn intermediate acting frames are not present. The four generated environments and original city/street art provide six distinct locations; the film does not claim nine completely different backgrounds.

## Local voices and soundtrack

Existing references and production takes were reused. Thirteen exact-text candidates were generated offline with installed Chatterbox Standard and Nano CUDA; no references were downloaded or dependencies reinstalled. Original takes, raw NumPy arrays and float WAVs remain in the private production workspace. Candidate parameters and outputs are in:

`G:/Workspace/AI/tools/chatterbox/kernel_guardians_audio_workspace/production/cinematic/retakes.json`

| Cues | Model | Parameters | Durations (s) |
| --- | --- | --- | --- |
| S01_VEX_002 | Standard | temperature .70, exaggeration .40, cfg .55 | 2.60 |
| S02_VEX_007 | Standard | temperature .72, exaggeration .50, cfg .50 | 3.36 |
| S04_VEX_004 | Standard | temperature .70, exaggeration .45, cfg .55 | 3.52 |
| S08_VEX_006 | Standard | temperature .80, exaggeration .65, cfg .45 | 2.12 |
| S02_PATCH_003 / S04_PATCH_006 | Standard | temperature .78, exaggeration .60, cfg .50 | 6.24 / 7.24 |
| S08_KERNEL_003 | Standard | temperature .72, exaggeration .40, cfg .55 | 11.44 |
| S02_FIREWALL_002 / S04_FIREWALL_005 / S09_FIREWALL_005 | Nano | temperature .78, top_p .93 | 3.36 / 3.68 / 2.12 |
| S04_FIREWALL_007 / S07_FIREWALL_005 | Nano | temperature .65, top_p .88 | 3.48 / 9.36 |
| S05_MIRA_001 | Nano | temperature .72, top_p .92 | 7.80 |

Seed 164 is used throughout. Nano reuses zero-exaggeration, normalized reference conditioning. Standard uses the original short references directly. Semantic performance notes are recorded as intent and are never appended to the spoken words. Candidate selection means the files passed generation/duration checks; **it does not mean their emotion, complete wording or likeness was approved by listening.** The selected candidates are reversible, and the original voices still play in the v1 comparison route.

Installed model package: `chatterbox-tts` 0.1.7, recorded by pip as installed from Resemble AI commit `5de7a54aa4e5e2baadb0182dde554908b48b85c2`. CUDA verification: PyTorch 2.10.0+cu128, CUDA 12.8, RTX 5060 Laptop GPU, compute capability 12.0. A real 512×512 GPU matrix multiplication completed with finite output on `cuda:0`. All thirteen generation jobs completed; highest PyTorch-reserved memory was 3,776,970,752 bytes (3.518 GiB), below 8 GiB. This is PyTorch's allocator peak, not a measurement of every desktop process's VRAM.

Twenty-five original synthesized local assets provide six atmospheric score beds, five location ambiences and fourteen foley/transient sounds. The source is `scripts/cinematic/render-sound.py` (seed 420164); there are no external recordings or music downloads. Seventy-three sound events cover chapter beds, intrusion carriers, scans, locks, gate strain, the flood, CRT spool/static, ten final ticks and restoration. Music and effects duck beneath dialogue.

The Web Audio mixer has independent narration, music and SFX buses, a master mute and protective compressor. Defaults are 85%, 32% and 46%. Seeking reconstructs only sounds active at the destination; expired ticks/effects are not replayed. Pause stops every active source; resume uses the precise cue offset. Speed applies to the same master clock and audio sources.

## Technical audio results and listening priorities

`scripts/cinematic/validate-audio.py` validated all 65 selected voice WAVs and 25 soundtrack WAVs through FFmpeg: 90 successful decodes, all 24 kHz, finite data, zero full-scale samples. No edge/silence heuristic indicated a truncated tail. The default offline reference mix peaks at 0.5151 before the live protective compressor. It is a mathematical reference mix; it is not a recording of the browser output.

Sixteen voice files triggered low-confidence review flags: fifteen have large sample-to-sample changes, and two have high fractions of quiet 20 ms frames (one overlaps both categories). These flags do not establish audible clicks or defective speech. They have not been silently removed by destructive filtering. Most transient flags involve the inherited Standard/Grady Kernel takes; two involve Patch. Prioritize Kernel's dialogue, the new emergency command, Firewall's serious flood reaction (which includes a roughly 0.9-second internal pause after “Right”), and Kernel's short final reply. The flags and exact waveform measurements are retained in ignored `.local-media/review/audio-validation.json`.

Suggested listening order, all private/local:

1. `.local-media/review/firewall-humor-to-alert.wav` — contrast between ordinary humor and the flood realization.
2. `.local-media/review/elara-archive.wav` — voice, archival processing and CRT foley together.
3. `.local-media/review/final-response.wav` — Vex's loss of control, Patch's reply and the final action sequence.
4. `.local-media/review/cinematic-default-mix.wav` — complete normal-rate reference mix.

Human review remains necessary for voice likeness, pronunciation, missing/repeated words, sentence joins, timbre and emotional contrast. No ASR or listening approval is claimed. Nano remains provisionally suitable for John's longer reference; Standard continues to support the short references that Nano rejects. This is a technical compatibility judgment, not a verdict on the acting.

## Verification evidence

| Requirement | Evidence | Result |
| --- | --- | --- |
| Locked script and original art | Production audit against screenplay and supplied hero files | 65 exact cues; 24 unchanged originals |
| Correct speaker and narration ownership | Unit and real Chrome checks at every cue | Passed |
| Persistent geography and in-place pose swaps | Stable DOM node, feet, world position and completed entrance across replies | Passed |
| CRT-only Elara and four-character dawn ensemble | Chrome mask/actor checks and visual captures | Passed |
| Tight timing and final ten continuous seconds | Timeline tests, cut map, no speech overlap | Passed |
| Exact pause/seek, speed, all three gains and all-audio mute | Real Web Audio source instrumentation in Chrome | Passed |
| All private voices and score assets | Chrome decoded 65 voices and 25 sounds; each voice started at a seek offset | Passed |
| Missing voice/music recovery and portrait captions | Separate 404 simulations and 390×844 capture | Passed |
| Pilot and v1 comparison | Original 30-second pilot completed; v1 loaded its separate 65 voices and original 575.12-second duration | Passed |
| Entire cinematic film without seeking | Opt-in real-time Chrome run at 1.25×, 473.56-second playhead, all 65 cue IDs observed and ending displayed, no JavaScript exceptions | Passed (6.5 minutes wall time) |

`npm test` passes 15 unit/React tests. `npm run build` passes TypeScript and Vite compilation. `npm run audit:production` confirms 92 authored shots, 73 sound events, 34 measured poses, 15 new illustrations and no audio/model files in the 75-file public build (about 56.6 MB, mostly lossless PNG artwork).

The full browser suite passed all eight tests in 7.5 minutes, including uninterrupted film playback and the original pilot. Final menu responsiveness and a non-spoken standby label were checked with a focused browser rerun; speech, audio and timeline timing were unchanged. Final stills also confirm the “Later” label remains visible during location slates, making the fictional countdown cuts explicit. Toolchain: Node 24.13.0, npm 11.6.2, Vite 7.3.7, Vitest 4.1.12, installed Google Chrome.

All 92 authored shots were captured in Chrome and visually reviewed through six contact sheets. The first pass found diagram/actor and CRT/link overlaps; revised captures confirmed those fixes. Detailed captures and frame metadata are under `docs/verification/cinematic`; bulk frames/contact sheets are local regenerable artifacts. Final captures also check close-ups after removing non-speaking edge fragments.

This is local playback work. Voice references, generated recordings, comparison mixes and soundtrack WAVs stay ignored under `.local-media` or the private Chatterbox workspace. The development-only allowlist middleware is absent from the static output. No public deployment or audio commit was performed.
