import { Dialog } from "../components/Dialog";
import type { Settings, StoryAction, UpdateSetting } from "./settings";

interface SettingsDialogProps {
  inStory: boolean;
  elapsed: number;
  settings: Settings;
  confirm: StoryAction | null;
  selectAction: (action: StoryAction | null) => void;
  confirmAction: () => void;
  set: UpdateSetting;
  closeModal: () => void;
}

export function SettingsDialog({
  inStory,
  elapsed,
  settings,
  confirm,
  selectAction,
  confirmAction,
  set,
  closeModal,
}: SettingsDialogProps) {
  return (
    <Dialog title={inStory ? "Story paused." : "Settings"} onClose={closeModal}>
      <p className="dialog-intro">
        {inStory
          ? `Holding your place at ${elapsed.toFixed(2)} seconds.`
          : "Make the city your own."}
      </p>
      {confirm ? (
        <div className="confirmation">
          <h3>
            {confirm === "restart"
              ? "Restart this story?"
              : "Return to the main menu?"}
          </h3>
          <p>Your current playback position will be reset.</p>
          <div className="dialog-actions">
            <button className="primary" onClick={confirmAction}>
              Confirm
            </button>
            <button onClick={() => selectAction(null)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <fieldset>
            <legend>Playback</legend>
            <label className="setting">
              Speed
              <select
                aria-label="Playback speed"
                value={settings.speed}
                onChange={(e) => set("speed", Number(e.target.value))}
              >
                <option value="0.75">0.75×</option>
                <option value="1">1× Normal</option>
                <option value="1.25">1.25×</option>
              </select>
            </label>
            <label className="setting">
              Dialogue & subtitles
              <input
                type="checkbox"
                checked={settings.subtitles}
                onChange={(e) => set("subtitles", e.target.checked)}
              />
            </label>
            <label className="setting">
              Reduced motion
              <input
                type="checkbox"
                checked={settings.reduced}
                onChange={(e) => set("reduced", e.target.checked)}
              />
            </label>
          </fieldset>
          <fieldset>
            <legend>Audio</legend>
            <p className="audio-note">
              Original score and SFX duck beneath speech.
            </p>
            {(["narration", "sfx", "music"] as const).map((key) => (
              <label className="setting volume" key={key}>
                <span>
                  {key === "sfx"
                    ? "Sound effects"
                    : key === "music"
                      ? "Background music"
                      : "Narration"}
                </span>
                <input
                  aria-label={`${key} volume`}
                  type="range"
                  min="0"
                  max="100"
                  value={settings[key]}
                  onChange={(e) => set(key, Number(e.target.value))}
                />
                <output>{settings[key]}%</output>
              </label>
            ))}
          </fieldset>
          <div className="dialog-actions">
            <button className="primary" onClick={closeModal}>
              {inStory ? "Resume story ▶" : "Done"}
            </button>
            {inStory && (
              <>
                <button onClick={() => selectAction("restart")}>Restart</button>
                <button onClick={() => selectAction("menu")}>Main menu</button>
              </>
            )}
          </div>
        </>
      )}
    </Dialog>
  );
}

export function CreditsDialog({ closeModal }: { closeModal: () => void }) {
  return (
    <Dialog title="Behind the city." onClose={closeModal}>
      <p className="dialog-intro">OS City: Under Attack / Kernel Guardians</p>
      <p>
        An educational motion comic exploring operating system security,
        starring Commander Kernel, Agent Patch, and Captain Firewall.
      </p>
      <p>
        Comic artwork and source references supplied in the OS City Pilot Asset
        Kit. Built with React, TypeScript, Vite, and GSAP.
      </p>
      <p>
        The complete locked screenplay uses local Chatterbox voices. Voice
        rights and performance approval remain outstanding. The cinematic
        edition uses detailed supporting illustrations, authored camera shots,
        original synthesized score and foley. Narration remains voice-only.
      </p>
      <button className="primary" onClick={closeModal}>
        Back to the city
      </button>
    </Dialog>
  );
}
