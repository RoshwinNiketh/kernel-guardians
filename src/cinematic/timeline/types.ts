export type ActorId =
  | "kernel"
  | "patch"
  | "firewall"
  | "vex"
  | "mira"
  | "elara"
  | "axiom"
  | "citizen"
  | "technician";
export type SpeakerId = Exclude<ActorId, "citizen" | "technician"> | "narrator";
export type LocationId =
  | "city"
  | "command"
  | "street"
  | "gateway"
  | "apartment"
  | "dawn";
export type ConceptId =
  | "none"
  | "cia"
  | "threat"
  | "updater"
  | "trojan"
  | "malware"
  | "virus"
  | "buffer"
  | "ports"
  | "worm"
  | "botnet"
  | "identity"
  | "chain"
  | "policy"
  | "containment"
  | "layers"
  | "ids"
  | "backups"
  | "filter"
  | "proxy"
  | "tunnel"
  | "response"
  | "standby"
  | "tcsec";
export type Framing =
  | "wide"
  | "two-shot"
  | "close"
  | "insert"
  | "broadcast"
  | "crt"
  | "split"
  | "city"
  | "climax"
  | "aftermath";
export interface CameraKey {
  x: number;
  y: number;
  zoom: number;
}
export interface CameraTrack {
  from: CameraKey;
  to: CameraKey;
}
export interface Shot {
  id: string;
  scene: number;
  start: number;
  end: number;
  location: LocationId;
  framing: Framing;
  focus?: ActorId;
  concept: ConceptId;
  camera: CameraTrack;
  visible?: ActorId[];
  note: string;
  threat: number;
}
export interface ActorTrack {
  id: string;
  actor: ActorId;
  scene: number;
  start: number;
  end: number;
  location: LocationId;
  x: number;
  footY: number;
  height: number;
  depth: number;
  pose: string;
  mode: "physical" | "comms" | "hologram" | "crt";
  entrance: "cut" | "left" | "right";
  arrivalDuration: number;
  exit?: "left" | "right";
  gaze: "left" | "right" | "camera";
}
export interface ActorFrame extends ActorTrack {
  pose: string;
  speaking: boolean;
  visible: boolean;
  arrival: number;
  exitProgress: number;
  offsetX: number;
  offsetY: number;
}
export interface DialoguePlacement {
  owner: SpeakerId;
  kind:
    | "bubble"
    | "comms"
    | "offscreen"
    | "narration"
    | "broadcast"
    | "archive";
  actorTrackId?: string;
  x: number;
  y: number;
  width: number;
  tailX?: number;
  color: string;
}
export type SoundKind =
  | "city"
  | "room"
  | "gateway"
  | "apartment"
  | "dawn"
  | "intrusion"
  | "message"
  | "scan"
  | "click"
  | "lock"
  | "impact"
  | "contain"
  | "gate"
  | "flood"
  | "crt"
  | "static"
  | "alarm"
  | "restore"
  | "tick"
  | "score";
export interface SoundCue {
  id: string;
  kind: SoundKind;
  start: number;
  end: number;
  gain: number;
  bus: "music" | "sfx";
  pan?: number;
  loop?: boolean;
  duck?: boolean;
}
export interface NarrativeCut {
  time: number;
  skip: number;
  label: string;
}
