import { useEffect, useRef, useState } from "react";
import { StoryEngine } from "../playback/StoryEngine";
import { ExperienceAudio } from "../playback/audio/ExperienceAudio";
import { artworkUrls } from "../cinematic/stage/assets";
import { introDuration } from "../cinematic/intro/introTiming";
import { duration } from "../cinematic/timeline/edit";
import { MainMenu } from "./MainMenu";
import { StoryLoading } from "./StoryLoading";
import { StoryPlayer } from "./StoryPlayer";
import { CreditsDialog, SettingsDialog } from "./StoryDialogs";
import { initialSettings, type Settings, type StoryAction } from "./settings";

export default function App() {
  const [engine] = useState(() => new StoryEngine(introDuration + duration));
  const [screen, setScreen] = useState<"menu" | "loading" | "story">("menu");
  const [modal, setModal] = useState<"settings" | "credits" | null>(null);
  const [confirm, setConfirm] = useState<StoryAction | null>(null);
  const [settings, setSettings] = useState(initialSettings);
  const [loaded, setLoaded] = useState(0);
  const [failed, setFailed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const resumeAfterModal = useRef(false);
  const [fullscreenError, setFullscreenError] = useState("");
  const [audioError, setAudioError] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [muted, setMuted] = useState(false);
  const bus = useRef<ExperienceAudio | null>(null);
  const [themeMissing, setThemeMissing] = useState(false);
  const getAudio = () => {
    if (!bus.current) {
      bus.current = new ExperienceAudio();
      engine.audio = bus.current;
      bus.current.setMix(
        settings.narration,
        settings.music,
        settings.sfx,
        muted,
      );
    }
    return bus.current;
  };
  const playUI = (effect: "click" | "slider" | "toggle") => {
    if (!muted)
      void Promise.resolve()
        .then(() => getAudio().playUI(effect))
        .catch(() => {});
  };
  const enableMusic = async () => {
    const audio = getAudio();
    await audio.startMenu();
    setThemeMissing(audio.themeUnavailable);
  };
  useEffect(() => {
    if (screen !== "menu" || muted) return;
    const activate = () => {
      void enableMusic().catch(() => {});
    };
    activate();
    window.addEventListener("pointerdown", activate);
    window.addEventListener("keydown", activate);
    return () => {
      window.removeEventListener("pointerdown", activate);
      window.removeEventListener("keydown", activate);
      bus.current?.stopMenu();
    };
  }, [screen, muted]);
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    Object.defineProperty(window, "__KG", {
      configurable: true,
      get: () => ({
        time: engine.time,
        playing: engine.isPlaying,
        audio: bus.current?.debugState,
      }),
    });
    return () => {
      delete (window as unknown as Record<string, unknown>).__KG;
    };
  }, [engine]);
  useEffect(() => {
    bus.current?.setMix(
      settings.narration,
      settings.music,
      settings.sfx,
      muted,
    );
  }, [settings.narration, settings.music, settings.sfx, muted]);
  useEffect(() => {
    let active = true;
    setLoaded(0);
    setFailed(false);
    const assets = artworkUrls;
    assets.forEach((asset) => {
      const img = new Image();
      img.onload = () => {
        if (active) setLoaded((n) => n + 1);
      };
      img.onerror = () => {
        if (active) setFailed(true);
      };
      img.src = asset;
    });
    return () => {
      active = false;
    };
  }, [loadAttempt]);
  useEffect(() => {
    engine.speed(settings.speed);
  }, [settings.speed, engine]);
  useEffect(() => {
    const hide = () => {
      if (document.hidden) {
        engine.pause();
        bus.current?.stopMenu(0);
      }
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      document.removeEventListener("visibilitychange", hide);
      engine.pause();
    };
  }, [engine]);
  const openSettings = () => {
    resumeAfterModal.current = engine.isPlaying;
    engine.pause();
    setConfirm(null);
    setModal("settings");
  };
  const closeModal = () => {
    setModal(null);
    setConfirm(null);
    if (resumeAfterModal.current && screen === "story") engine.play();
  };
  const start = async () => {
    engine.pause();
    engine.seek(0);
    setScreen("loading");
    setAudioError(false);
    try {
      const audio = getAudio();
      audio.stopMenu();
      await audio.load((loadedTracks) => setAudioProgress(loadedTracks));
      setScreen("story");
      if (!document.hidden) engine.play();
    } catch (error) {
      console.error("Story audio preparation failed", error);
      setAudioError(true);
    }
  };
  const mainMenu = () => {
    engine.pause();
    engine.seek(0);
    setScreen("menu");
    void enableMusic().catch(() => {});
    setModal(null);
    setConfirm(null);
    resumeAfterModal.current = false;
  };
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        modal ||
        screen !== "story" ||
        /INPUT|SELECT/.test((e.target as HTMLElement).tagName)
      )
        return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        playUI("click");
        engine.seek(engine.time + (e.key === "ArrowLeft" ? -5 : 5));
      }
      if (
        e.code === "Space" &&
        (e.target as HTMLElement).tagName !== "BUTTON"
      ) {
        e.preventDefault();
        playUI("click");
        engine.isPlaying ? engine.pause() : engine.play();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        playUI("click");
        openSettings();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));
  const fullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
      setFullscreenError("");
    } catch {
      setFullscreenError(
        "Fullscreen is unavailable in this browser. The story still fits your window.",
      );
    }
  };
  const ready = loaded === artworkUrls.length && !failed;
  const toggleMute = () => setMuted((value) => !value);
  const confirmAction = () => {
    if (confirm === "menu") {
      mainMenu();
    } else {
      setModal(null);
      setConfirm(null);
      engine.seek(engine.time < introDuration ? 0 : introDuration);
      engine.play();
    }
  };
  return (
    <main
      onClickCapture={(event) => {
        const target = (event.target as Element).closest(
          "button, a[href], input[type=checkbox]",
        );
        if (target && !target.matches(":disabled, input[type=checkbox]"))
          playUI("click");
      }}
      onChangeCapture={(event) => {
        const target = event.target as HTMLElement;
        if (target.matches("input[type=range]")) playUI("slider");
        if (target.matches("input[type=checkbox], select")) playUI("toggle");
      }}
      className={`app production-app cinematic-app ${settings.reduced ? "reduced" : ""} ${modal ? "modal-open" : ""}`}
    >
      {screen === "menu" ? (
        <MainMenu
          ready={ready}
          failed={failed}
          artworkProgress={Math.round((loaded / artworkUrls.length) * 100)}
          muted={muted}
          themeMissing={themeMissing}
          start={start}
          retryArtwork={() => setLoadAttempt((n) => n + 1)}
          toggleMute={toggleMute}
          openSettings={openSettings}
          openCredits={() => setModal("credits")}
          mainMenu={mainMenu}
          fullscreen={fullscreen}
        />
      ) : screen === "loading" ? (
        <StoryLoading
          audioError={audioError}
          audioProgress={audioProgress}
          start={start}
          mainMenu={mainMenu}
        />
      ) : (
        <StoryPlayer
          engine={engine}
          settings={settings}
          muted={muted}
          modalOpen={modal !== null}
          toggleMute={toggleMute}
          openSettings={openSettings}
          mainMenu={mainMenu}
          fullscreen={fullscreen}
        />
      )}
      {fullscreenError && (
        <button className="notice" onClick={() => setFullscreenError("")}>
          {fullscreenError} ×
        </button>
      )}
      {modal === "settings" && (
        <SettingsDialog
          inStory={screen === "story"}
          elapsed={engine.time}
          settings={settings}
          confirm={confirm}
          selectAction={setConfirm}
          confirmAction={confirmAction}
          set={set}
          closeModal={closeModal}
        />
      )}
      {modal === "credits" && <CreditsDialog closeModal={closeModal} />}
    </main>
  );
}
