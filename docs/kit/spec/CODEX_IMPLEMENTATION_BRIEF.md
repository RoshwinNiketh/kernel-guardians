# Codex Implementation Brief — 30-Second OS City Pilot

Create a **desktop-first, 16:9, cinematic motion comic** using this kit. Use React + TypeScript + Vite + GSAP; static assets from `/public/assets` and one reusable scene engine. Do NOT use a game engine, 3D, or back-end. The audience is college students learning OS security.

**Visual requirement:** visually rich illustrated cutscene with layered neon city art, two large original comic characters pinned to left/right edges, vivid cyan-magenta-yellow highlights, halftone accents, bold editable speech bubbles, strong cinematic transitions and subtle ongoing character motion. Avoid dashboard-like card UI during cutscene.

**First screen:** stylized game menu with title OS CITY: UNDER ATTACK, Start Story, Settings, Credits, ambient animated city art.

**Start action:** Start Story enters fullscreen-like animated story stage; narration is not available, so provide a SILENT PREVIEW mode that has timed on-screen narration. Do not synthesize or invent voiceover and do not pretend synchronization is validated.

**Timeline:** one authoritative playhead `t` governs render state, virtual vertical scroll, all GSAP animations, speech bubble cues, overlays, SFX/audio hooks, and idle loops. Build idempotent renderAt(t) so seeking to t produces the same frame regardless of previous playhead history. Avoid using independent timeouts for scenes.

**Settings:** top-right icon opens modal pause menu and stops all story progress, including idle animation, scrolling, and audio. Resume must return to exact paused playhead and visual frame. Controls: Resume, Restart (confirmation), Main Menu (confirmation), narration/SFX volume, background music volume, subtitles, playback speed 0.75/1/1.25, reduced motion.

**Seeking:** left/right arrows seek exactly -5/+5 seconds clamped to [0,duration]. Optional double-click left/right half. Add overlay seek buttons and accessible timeline slider. A seek must update scene, bubble, character pose, transforms, and scroll position exactly; audio should follow once available.

**Responsive:** primary 1920x1080 artboard scaled to any viewport using contain + tasteful letterbox. Keep characters at left/right edge; keep center clear for action and explanatory visuals. Provide mobile fallback layout. Respect reduced motion.

**Engineering:** data-driven scene definitions in `src/story`; `src/engine` for one master timeline, audio hooks, scroll controller and rendering; reusable components; asset manifest type definitions; React tests plus browser smoke tests for Start/Pause/Resume/Seek. Build must succeed without the audio files.

**Pilot:** `spec/pilot_scene.json` has a provisional five-beat, 30-second outline. Validate correctness of terms: confidentiality prevents unauthorized disclosure; integrity prevents unauthorized modification; availability keeps resources accessible to authorized users. Script on screen should not equate an attack with a threat (threat is potential, attack is an attempt).

**Deliverable:** working local project, instructions for launch/test, screenshots at t=0, 10, 20, 29s, test results and clearly labeled remaining blockers. Do not build the full eight-minute story until the pilot is approved.
