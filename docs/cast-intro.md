# Cast intro and menu theme

Eight three-second cards introduce Kernel, Patch, Firewall, Mira, Elara, Axiom, Vex, and the Narrator. The title appears at 0:24 and holds for six seconds. The story starts at 0:30 and the complete experience runs 8:24.92. Portrait layouts repeat the name and role below the artwork. Reduced motion keeps the same timing.

The supplied theme loops independently in the menu. The build also places it at the start of the intro and dialogue track and fades it out during the final second of the intro. Music volume controls both uses of the theme. Playback waits for the intro and dialogue, score, and effects tracks to finish loading before showing the first card.

The cast cards and story share one playhead. Skip Intro and Replay Story seek to the story boundary. Restart from within the intro starts at zero. The menu can still be used when its separate theme fails to load.

See the [deployment guide](vercel-deployment.md) for the audio build and delivery workflow.
