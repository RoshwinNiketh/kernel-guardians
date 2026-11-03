import { useArtwork } from "./artworkLoader";
import { actorArt, televisionArt } from "./assets";
import { cueById } from "../timeline/edit";
import type { ActorFrame } from "../timeline/types";
export function Television({
  actor,
  time,
  close,
  reduced,
}: {
  actor: ActorFrame;
  time: number;
  close: boolean;
  reduced: boolean;
}) {
  const artwork = useArtwork();
  const cue = cueById("S05_ELARA_003"),
    running = time >= cue.start && time < cue.end;
  const foundAt = cue.start - 1.05,
    discovered = time >= foundAt;
  const boot = Math.max(0, Math.min(1, (time - foundAt) / 0.65));
  const jitter = reduced ? 0 : running ? Math.sin(time * 4.1) * 0.75 : 0;
  return (
    <div
      className={`archive-tv ${close ? "tv-close" : ""}`}
      data-mode="crt"
      data-actor="elara"
      data-speaking={running}
      data-track={actor.id}
      data-recording={running ? "playing" : "held"}
      style={{ opacity: 1 }}
      aria-label="Dr. Elara Trace in a recovered recording on a cathode ray television"
    >
      <img
        className="tv-housing"
        src={artwork(televisionArt)}
        alt="Illustrated cathode ray television"
      />
      <div
        className="tv-glass"
        style={{ transform: `translateX(${jitter}px)` }}
      >
        {discovered && (
          <>
            <div className="archive-room" />
            <img
              className="archive-portrait"
              style={{ opacity: boot }}
              src={artwork(actorArt("elara", actor.pose).file)}
              alt="Dr. Elara Trace, recorded archive"
            />
            <div
              className="crt-raster"
              style={{ backgroundPositionY: reduced ? 0 : time * 16 }}
            />
            <div
              className="crt-band"
              style={{ top: `${reduced ? 35 : ((time * 13) % 110) - 10}%` }}
            />
            <div className="archive-caption">
              <span>E. TRACE</span>
              <span>{running ? "RECOVERED ARCHIVE" : "RECORDING HELD"}</span>
            </div>
          </>
        )}
        {!discovered && (
          <div className="archive-dormant">
            {time >= foundAt - 0.8 ? "LOCAL ARCHIVE DETECTED" : "STANDBY"}
          </div>
        )}
      </div>
      <div className="tv-source">Recovered recording · Local playback</div>
    </div>
  );
}
