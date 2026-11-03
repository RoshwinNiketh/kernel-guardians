import metrics from "./art-metrics.json" with { type: "json" };
export interface ArtMetric {
  file: string;
  width: number;
  height: number;
  anchorX: number;
  footY: number;
  top: number;
  bodyHeight: number;
  sha256: string;
  transparentFraction: number;
}
export const artMetrics: Record<string, ArtMetric> = Object.fromEntries(
  Object.entries(metrics).map(([key, art]) => [
    key,
    { ...art, file: art.file + "?v=" + art.sha256.slice(0, 16) },
  ]),
);
export const environmentArt = {
  city: "/assets/backgrounds/city_panorama.png",
  command: "/assets/backgrounds/command-center.png",
  street: "/assets/backgrounds/program_street.webp",
  gateway: "/assets/backgrounds/gateway.png",
  apartment: "/assets/backgrounds/mira-apartment.png",
  dawn: "/assets/backgrounds/city-dawn.png",
};
export function actorArt(actor: string, pose: string) {
  const art = artMetrics[`${actor}/${pose}`];
  if (!art) throw Error(`Unmapped actor pose ${actor}/${pose}`);
  return art;
}
export const menuArt = "/assets/backgrounds/menu_poster.png";
export const televisionArt = "/assets/props/crt-television.png";
const propNames = [
  "computer_chip",
  "data_folder",
  "encrypted_lock",
  "hologram_analytics",
  "malware_icon",
  "security_shield",
  "server_rack",
  "terminal",
  "warning_sign",
];
const props: Record<string, string> = Object.fromEntries(
  propNames.map((name) => [name, `/assets/props/${name}.png`]),
);

export function propArt(name: string) {
  const path = props[name];
  if (!path) throw new Error(`Unmapped prop: ${name}`);
  return path;
}

export const artworkUrls = [
  menuArt,
  televisionArt,
  ...Object.values(artMetrics).map((art) => art.file),
  ...Object.values(environmentArt),
  ...Object.values(props),
];
