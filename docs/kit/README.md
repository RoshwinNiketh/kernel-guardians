# OS CITY — Codex Pilot Asset Kit

This kit separates the previously generated images into individual, transparent PNG character poses, props, effects and backgrounds, and contains a starter scene specification. It is intended for a **30-second proof of concept**, not a complete eight-minute production.

## What is available
- 8 Kernel character poses
- 8 Patch character poses
- 8 Firewall character poses
- 4 environment artworks (including two transparent layers)
- 12 props/icons
- 8 effects
- Source reference sheets (for visual review)
- `spec/asset_manifest.json` with file paths and dimensions
- `spec/pilot_scene.json` with illustrative scene cues

## Rules
1. These assets are not fully rigged sprites. Use transforms for entry/exit, idle motion, speaking and parallax.
2. Speech and UI must be editable HTML/CSS or SVG with accessible live text; do not use baked dialogue.
3. Preserve aspect ratios, avoid sprite distortion and use a consistent baseline anchor for standing poses.
4. Use the main city panorama **OR** a composition of skyline and rooftop foreground; stacking all as backgrounds will double-up buildings.
5. Add voiceover later and drive the master playhead using audio timing; for a silent preview drive it with one deterministic timeline.
6. Settings pauses everything, including idle loops and music; ±5s seeking reconstructs visual state, not merely scroll pixels.
7. No real audio was generated. Timing cues are provisional.
8. Review alpha edges and continuity before declaring assets production-ready.

## Suggested pilot composition
- Base: `assets/backgrounds/city_panorama.png`.
- Alternate parallax: CSS sky gradient + `city_skyline_overlay.png` + `rooftop_foreground.png`.
- Characters: `characters/kernel/idle.png` at left, `characters/patch/idle.png` at right.
- Props: `props/security_shield.png`, `props/data_folder.png` and `props/server_rack.png`.
- Effects: `effects/scan_ring.png` and `effects/alert_pulse.png`.

Everything here is created from assets supplied/generated during this conversation. No external downloads are required.
