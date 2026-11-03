export interface Settings {
  narration: number;
  sfx: number;
  music: number;
  subtitles: boolean;
  speed: number;
  reduced: boolean;
}

export type StoryAction = "restart" | "menu";
export type UpdateSetting = <K extends keyof Settings>(
  key: K,
  value: Settings[K],
) => void;

export function initialSettings(): Settings {
  return {
    narration: 100,
    sfx: 100,
    music: 100,
    subtitles: true,
    speed: 1,
    reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
}
