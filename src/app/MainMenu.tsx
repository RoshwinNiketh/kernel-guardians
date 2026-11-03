import { menuArt } from "../cinematic/stage/assets";
import { SettingsIcon, FullscreenIcon } from "../components/Icons";

interface MainMenuProps {
  ready: boolean;
  failed: boolean;
  artworkProgress: number;
  muted: boolean;
  themeMissing: boolean;
  start: () => void;
  retryArtwork: () => void;
  toggleMute: () => void;
  openSettings: () => void;
  openCredits: () => void;
  mainMenu: () => void;
  fullscreen: () => void;
}

export function MainMenu({
  ready,
  failed,
  artworkProgress,
  muted,
  themeMissing,
  start,
  retryArtwork,
  toggleMute,
  openSettings,
  openCredits,
  mainMenu,
  fullscreen,
}: MainMenuProps) {
  return (
    <section className="menu" aria-label="Main menu">
      <img
        className="menu-art"
        src={menuArt}
        alt="Commander Kernel, Agent Patch and Captain Firewall overlooking OS City"
      />
      <div className="menu-scrim" />
      <header className="menu-header">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            mainMenu();
          }}
          className="brand"
        >
          <span className="brand-emblem">
            K<span>G</span>
          </span>
          <span>
            KERNEL
            <br />
            GUARDIANS
          </span>
        </a>
        <span className="edition">An operating system security story</span>
        <button
          className="icon-button"
          aria-label="Open settings"
          onClick={openSettings}
        >
          <SettingsIcon />
        </button>
      </header>
      <div className="menu-content">
        <h1>
          <span>OS CITY</span>
          <strong>EIGHT MINUTES TO BLACKOUT</strong>
        </h1>
        <p>
          A digital world. Three guardians.
          <br />
          The security of an entire system.
        </p>
        <div className="menu-actions">
          <button className="start-button" disabled={!ready} onClick={start}>
            <span>
              {ready
                ? "START STORY"
                : failed
                  ? "ASSET LOAD FAILED"
                  : `LOADING ${artworkProgress}%`}
            </span>
            <span aria-hidden="true">▶</span>
          </button>
          {failed && (
            <button onClick={retryArtwork}>Retry loading artwork</button>
          )}
          <button className="menu-music" onClick={toggleMute}>
            {muted ? "Sound off" : "Sound on"}
          </button>
          {themeMissing && <small>Menu music unavailable</small>}
          <div className="secondary-actions">
            <button onClick={openSettings}>Settings</button>
            <span>/</span>
            <button onClick={openCredits}>Credits</button>
          </div>
        </div>
        <div className="pilot-note">
          <span className="signal" />
          Cinematic edition · Original score & sound design
        </div>
      </div>
      <footer className="menu-footer">
        <span>Learn the system. Protect the city.</span>
        <span>
          Best experienced in fullscreen{" "}
          <button
            className="text-button"
            onClick={fullscreen}
            aria-label="Toggle fullscreen"
          >
            <FullscreenIcon />
          </button>
        </span>
      </footer>
    </section>
  );
}
