interface StoryLoadingProps {
  audioError: boolean;
  audioProgress: number;
  start: () => void;
  mainMenu: () => void;
}

export function StoryLoading({
  audioError,
  audioProgress,
  start,
  mainMenu,
}: StoryLoadingProps) {
  return (
    <section className="player cinematic-player" aria-label="Preparing story">
      <div className="audio-loading">
        <div className="audio-loading-panel">
          {audioError ? (
            <>
              <h2>Soundtrack download failed</h2>
              <p role="alert">
                All three audio tracks are required before the story can start.
              </p>
              <button className="primary" onClick={start}>
                Retry audio
              </button>
              <button className="text-button" onClick={mainMenu}>
                Main menu
              </button>
            </>
          ) : (
            <p role="status">
              Preparing soundtrack… {audioProgress} of 3 tracks ready
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
