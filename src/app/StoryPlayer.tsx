import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { SettingsIcon, FullscreenIcon } from "../components/Icons";
import { Intro, introCardAt, introDuration } from "../cinematic/intro/Intro";
import { CinematicStage } from "../cinematic/stage/CinematicStage";
import { frameAt } from "../cinematic/timeline/director";
import { names } from "../cinematic/timeline/edit";
import type { StoryEngine } from "../playback/StoryEngine";
import type { Settings } from "./settings";

interface StoryPlayerProps {
  engine: StoryEngine;
  settings: Settings;
  muted: boolean;
  modalOpen: boolean;
  toggleMute: () => void;
  openSettings: () => void;
  mainMenu: () => void;
  fullscreen: () => void;
}

const format = (time: number) =>
  `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, "0")}`;

export function StoryPlayer({
  engine,
  settings,
  muted,
  modalOpen,
  toggleMute,
  openSettings,
  mainMenu,
  fullscreen,
}: StoryPlayerProps) {
  useSyncExternalStore(engine.subscribe, engine.snapshot);
  const elapsed = engine.time;
  const total = engine.duration;
  const finished = elapsed >= total;
  const introducing = elapsed < introDuration;
  const t = Math.max(0, elapsed - introDuration);
  const card = introCardAt(elapsed);
  const fullFrame = frameAt(t);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const observer = new ResizeObserver(([{ contentRect }]) => {
      setScale(Math.min(contentRect.width / 1920, contentRect.height / 1080));
    });
    if (stageRef.current) observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="player cinematic-player" aria-label="OS City cutscene">
      <div className="stage-container" ref={stageRef}>
        <div
          className="scaled-stage"
          style={{ width: 1920, height: 1080, transform: `scale(${scale})` }}
        >
          {introducing ? (
            <Intro time={elapsed} reduced={settings.reduced} />
          ) : (
            <CinematicStage
              time={t}
              frame={fullFrame}
              reduced={settings.reduced}
              subtitles={settings.subtitles}
            />
          )}
        </div>
      </div>
      {introducing && (
        <button
          className="skip-intro"
          onClick={() => engine.seek(introDuration)}
        >
          Skip Intro →
        </button>
      )}
      <div className="mobile-story">
        {introducing ? (
          <>
            <span>Meet the cast</span>
            <h2>{card?.[1] ?? "Kernel Guardians"}</h2>
            <p>{card?.[2] ?? "Eight Minutes to Blackout"}</p>
          </>
        ) : (
          <>
            <span>{fullFrame.chapter.title}</span>
            {settings.subtitles && (
              <>
                <h2>{names[fullFrame.cue?.character ?? "narrator"]}</h2>
                <p aria-live="polite">
                  {fullFrame.cue?.spoken_text ?? fullFrame.shot.note}
                </p>
              </>
            )}
          </>
        )}
        <span className="mobile-status">
          {engine.isPlaying
            ? "Story playing"
            : finished
              ? "Story complete"
              : "Story paused"}{" "}
          · {format(elapsed)} / {format(total)}
        </span>
      </div>
      <div className="player-top">
        <button
          className="icon-button"
          onClick={openSettings}
          aria-label="Open settings and pause"
        >
          <SettingsIcon />
        </button>
      </div>
      {finished && !modalOpen && (
        <div className="end-overlay">
          <div>
            <span className="end-label">After-action review complete</span>
            <h2>
              Security is a<br />
              continuous process.
            </h2>
            <p>
              Essential services restored. Recovery and monitoring continue.
            </p>
            <button
              className="primary"
              onClick={() => {
                engine.seek(introDuration);
                engine.play();
              }}
            >
              Replay story ↻
            </button>
            <button className="text-button" onClick={mainMenu}>
              Main menu
            </button>
          </div>
        </div>
      )}
      <div className="playback">
        <div className="playback-row">
          <div className="transport">
            <button
              aria-label="Rewind 5 seconds"
              onClick={() => engine.seek(elapsed - 5)}
            >
              ↶ <span>5s</span>
            </button>
            <button
              className="play-toggle"
              aria-label={engine.isPlaying ? "Pause" : "Play"}
              disabled={finished}
              onClick={() =>
                engine.isPlaying ? engine.pause() : engine.play()
              }
            >
              {engine.isPlaying ? "Ⅱ" : "▶"}
            </button>
            <button
              aria-label="Forward 5 seconds"
              onClick={() => engine.seek(elapsed + 5)}
            >
              <span>5s</span> ↷
            </button>
          </div>
          <span className="time">
            {format(elapsed)} <span>/ {format(total)}</span>
          </span>
          <span className="playback-caption">
            {finished
              ? "Story complete"
              : introducing
                ? "Cast introduction"
                : fullFrame.chapter.title}
          </span>
          <button
            className="text-button"
            aria-label={muted ? "Unmute all audio" : "Mute all audio"}
            onClick={toggleMute}
          >
            {muted ? "Muted" : "Sound on"}
          </button>
          <button
            className="text-button fullscreen"
            onClick={fullscreen}
            aria-label="Toggle fullscreen"
          >
            <FullscreenIcon />
          </button>
        </div>
        <input
          className="timeline"
          aria-label="Story timeline"
          type="range"
          min="0"
          max={total}
          step="0.001"
          value={elapsed}
          aria-valuetext={`${elapsed.toFixed(1)} seconds of ${total}`}
          onChange={(e) => engine.seek(Number(e.target.value))}
          style={
            { "--progress": `${(elapsed / total) * 100}%` } as CSSProperties
          }
        />
        <div className="keyboard-hint">
          <span>
            ← → Seek 5s <span> / </span> Space Pause <span> / </span> Esc
            Settings
          </span>
        </div>
      </div>
    </section>
  );
}
