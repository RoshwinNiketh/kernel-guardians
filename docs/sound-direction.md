# Selective sound pass — 2 November 2026

Main was fast-forwarded to the merged `bd7cb59`, then work returned to `rn/master-story-build-v2`. No dialogue, voice recordings or artwork changed in this pass.

## Research and decisions

Composer Aaron Gilmartin's [Film Independent discussion of score and silence](https://www.filmindependent.org/blog/https-www-filmindependent-org-blog-know-the-score-film-from-formative-silence-to-modern-sound/) describes dialogue/room tone, scored scenes and silence as deliberate alternatives. This informed the main change: quiet teaching and personal scenes, with music reserved for narrative turns. These placements are our editorial choices, not prescriptions from the source.

[MDN's Web Audio documentation](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setTargetAtTime) explains gradual gain transitions and the relationship between time constants and settling time. The mixer retains short smoothing on source gain, while the authored playhead envelope now anticipates speech by 120 ms, holds for 150 ms after a line and releases over 700 ms. Nearby lines share that hold, avoiding a swell between every reply. The envelope is reconstructible on seeking and does not use an independent timer.

[Kenney Sci-fi Sounds](https://kenney.nl/assets/sci-fi-sounds) and [Interface Sounds](https://kenney.nl/assets/interface-sounds) were inspected as small CC0 alternatives. The Sci-fi download failed with repeated TLS connection resets through native and Python clients. No pack content was imported, no purchase/account was required and no stock audio is claimed. The selected implementation is original procedural composition and foley. The broad Sonniss library was considered but not downloaded as a bulk pack for a handful of effects. Research does not constitute listening approval.

## Music spotting

Previously music covered the entire film in chapter loops. It now covers **136.02 of 474.92 seconds (28.64%)**, in nine finite cues, using six newly arranged 64-second source movements. Each cue has its own fade and ends at its authored cut; nothing loops on the music bus. Changing harmony, sparse plucked motifs and restrained pulse replace a single repeated pad. Most movement energy stays below speech consonants, and the entire score ducks beneath spoken lines.

| Playback seconds | Purpose |
| --- | --- |
| 0–14.25 | Establish ordinary city life and the opening threat |
| 54.52–63.42 | Vex interrupts command |
| 63.42–88.13 | Deceptive update and malicious payload reveal |
| 144.48–161.17 | Botnet gathers; music leaves before Firewall's serious realization |
| 235.65–243.93 | First containment action |
| 308.32–322.98 | Danger concealed inside a permitted connection |
| 333.21–346.17 | Internal compromise is exposed |
| 373.02–392.26 | Final coordinated response, stopping at the visible blackout |
| 458.59–474.92 | Restrained city-survival ending |

Mira's distress, the entire Elara archive, most technical explanations and the historical classification debrief are unscored. No laugh sting, cartoon reaction or triumphant restoration fanfare was added. These are motion-comic sound choices, not claims of audience response.

## Effects and physical space

The mix has 59 authored entries: nine music cues, 14 physical ambience segments and 36 effects. Each entry records its purpose in `src/cinematic/soundDesign.ts` and the exported edit sheet. Ambience follows the actual shot location, including command-to-gateway cross-cuts, rather than staying a command-room bed for the whole eighth chapter.

Effects are tied to events, not every diagram or line: CIA pillar illumination at one-third/two-thirds of its cue; payload reveal at one-third; first overflow cell at two-thirds; CRT archive detection at 1.85 seconds before Elara and screen boot at 1.05 seconds before; gate/service/standby cuts at climax +0/+3.2/+6.8 seconds. Ten restrained ticks correspond to the displayed final seconds. The visible blackout cuts score/effects 220 ms before zero, followed by a quiet relay confirmation 120 ms after zero. Dialogue is never cut by the blackout envelope.

Foley sources now distinguish a metallic gate resonance/motor, traffic-noise surge, latch closure, degauss/relay CRT startup, short filtered interface actions and a low impact. Repetitive carrier-end messages, conceptual alarms and mid-archive static were removed. No weapon, explosion or crowd recording is introduced for actions that are not on screen.

## Local files and reproducibility

Run the existing CPU Python with `scripts/cinematic/render-sound.py` to recreate the 25 original soundtrack WAV assets. The previous files were preserved at ignored `.local-media/sound-before-spotting`; selected files remain `.local-media/sound`. Seed 420164, 24 kHz PCM16; no downloaded samples or dependencies are needed. The private voices were not regenerated.

`node scripts/cinematic/export-edit.mjs` exports the cue sheet and 100 Hz automation derived from the same live envelope. `scripts/cinematic/validate-audio.py` renders a normal-speed reference mix using that automation. It is an offline approximation, not a browser loopback recording. Local listening files are `.local-media/review/cinematic-default-mix.wav`, `firewall-humor-to-alert.wav`, `elara-archive.wav`, and `final-response.wav`.

For actual browser output, `node scripts/cinematic/record-audio.mjs` taps the final master output into a local MediaRecorder. Three normal-speed Chrome recordings were captured and decoded successfully with FFmpeg: `.local-media/review/browser-firewall.webm`, `browser-archive.webm`, and `browser-response.webm`. These include the live smoothing and compressor, and remain local. They are listening-review material, not a claim that acting or balance has been approved by ear.

The audio-enabled development preview is **http://127.0.0.1:5183/**. Existing port 5182 returned HTML for private WAV URLs, so it was left alone. Use `$env:KG_PORT='5183'` for browser tests against the dedicated server. A static preview intentionally has no private recordings or soundtrack middleware.

## Verification and limits

The build and 17 unit/React tests pass. Five standard browser checks pass on 5183, including all 66 voices and 25 soundtrack files, exact source offsets, all three volume buses, mute, pause, seek, speed and media fallback. A sixth focused browser check confirms unscored personal/teaching lines, finite response music and the blackout dropout after arbitrary seeks. The full film also passed uninterrupted playback at 1.25×: 474.92 seconds reached, all 66 cue IDs observed, ending displayed, zero JavaScript errors (6.5 minutes wall time). The earlier failed attempts on 5182 were due to the existing server returning HTML for WAV requests; the dedicated development server resolves that environment problem.

All 91 selected voice/sound WAV files decode with FFmpeg, remain finite at 24 kHz and have zero full-scale samples. The new reference mix peak is 0.51412 before the live protective compressor. FFmpeg's EBU R128 meter measured the offline reference at -22.9 LUFS integrated, 4.6 LU loudness range and -5.7 dBFS true peak. These are measurements, not a claim of compliance with a distribution platform's target.

Existing voice-transient and quiet-frame warnings remain in the private validation manifest; this sound pass does not repair or approve those recordings. Human listening must still judge balance, timbre, fatigue and musical taste. No private audio is committed or deployed.
