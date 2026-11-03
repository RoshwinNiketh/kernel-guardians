import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { StoryEngine } from './engine/StoryEngine';
import { Stage } from './components/Stage';
import { Dialog } from './components/Dialog';
import { SettingsIcon, FullscreenIcon } from './components/Icons';
import { cinematicImages } from './cinematic/assets';
const imageFiles=[...new Set([...cinematicImages,'/assets/backgrounds/menu_poster.png'])];
import { renderAt } from './engine/renderAt';
import { ProductionStage } from './components/ProductionStage';
import { ExperienceAudio } from './engine/ExperienceAudio';
import {Intro,introDuration,introCardAt} from './cinematic/Intro';
import { duration, frameAt, names } from './story/production/timeline';
const pilot = false;

type Settings = { narration: number; sfx: number; music: number; subtitles: boolean; speed: number; reduced: boolean };
const initial: Settings = { narration: 100, sfx: 100, music: 100, subtitles: true, speed: 1, reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches };
const format = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

export default function App() {
  const [engine] = useState(() => new StoryEngine(introDuration+duration));
  useSyncExternalStore(engine.subscribe, engine.snapshot);
  const [screen, setScreen] = useState<'menu' | 'loading' | 'story'>('menu');
  const [modal, setModal] = useState<'settings' | 'credits' | null>(null);
  const [confirm, setConfirm] = useState<'restart' | 'menu' | null>(null);
  const [settings, setSettings] = useState<Settings>(initial);
  const [loaded, setLoaded] = useState(0);
  const [failed, setFailed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const resumeAfterModal = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [fullscreenError, setFullscreenError] = useState('');
  const [audioError, setAudioError] = useState(false);
  const audioState = screen === 'story' ? 'Full narration · 66 cues' : 'Full soundtrack required';
  const [audioProgress,setAudioProgress] = useState(0);
  const [muted,setMuted] = useState(false);
  const bus = useRef<ExperienceAudio | null>(null);
  const total = engine.duration;
  const elapsed=engine.time;
  const introducing=elapsed<introDuration;
  const t=Math.max(0,elapsed-introDuration);
  const card=introCardAt(elapsed);
  const [themeMissing,setThemeMissing]=useState(false);
  const getAudio = () => {
    if (!bus.current) {
      bus.current = new ExperienceAudio();
      engine.audio = bus.current;
      bus.current.setMix(settings.narration, settings.music, settings.sfx, muted);
    }
    return bus.current;
  };
  const playUI = (effect: 'click' | 'slider' | 'toggle') => {
    if (!muted) void Promise.resolve().then(() => getAudio().playUI(effect)).catch(() => {});
  };
  const enableMusic = async () => {
    const audio = getAudio();
    await audio.startMenu();
    setThemeMissing(audio.themeUnavailable);
  };
  useEffect(()=>{
    if(screen!=='menu'||muted)return;
    const activate=()=>{void enableMusic().catch(()=>{});};
    activate();
    window.addEventListener('pointerdown',activate);window.addEventListener('keydown',activate);
    return()=>{window.removeEventListener('pointerdown',activate);window.removeEventListener('keydown',activate);bus.current?.stopMenu();};
  },[screen,muted]);
  const fullFrame = frameAt(t);
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    Object.defineProperty(window, '__KG', {configurable:true,get:()=>({time:engine.time,playing:engine.isPlaying,audio:bus.current?.debugState})});
    return () => { delete (window as unknown as Record<string,unknown>).__KG; };
  }, [engine]);
  useEffect(() => { bus.current?.setMix(settings.narration,settings.music,settings.sfx,muted); }, [settings.narration,settings.music,settings.sfx,muted]);
  const finished = screen === 'story' && elapsed >= total;
  useEffect(() => {
    let active = true;
    setLoaded(0); setFailed(false);
    const assets = imageFiles;
    assets.forEach(asset => { const img = new Image(); img.onload = () => { if (active) setLoaded(n => n + 1); }; img.onerror = () => { if (active) setFailed(true); }; img.src = asset; });
    return () => { active = false; };
  }, [loadAttempt]);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(entry.contentRect.width / 1920, entry.contentRect.height / 1080)));
    if (stageRef.current) observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, [screen]);
  useEffect(() => { engine.speed(settings.speed); }, [settings.speed, engine]);
  useEffect(() => {
    const hide = () => { if (document.hidden) {engine.pause();bus.current?.stopMenu(0);} };
    document.addEventListener('visibilitychange', hide);
    return () => { document.removeEventListener('visibilitychange', hide); engine.pause(); };
  }, [engine]);
  const openSettings = () => { resumeAfterModal.current = engine.isPlaying; engine.pause(); setConfirm(null); setModal('settings'); };
  const closeModal = () => { setModal(null); setConfirm(null); if (resumeAfterModal.current && screen === 'story') engine.play(); };
  const start = async () => {
    engine.pause();
    engine.seek(0);
    setScreen('loading');
    setAudioError(false);
    try {
      const audio = getAudio();
      audio.stopMenu();
      await audio.load(loadedTracks => setAudioProgress(loadedTracks));
      setScreen('story');
      if (!document.hidden) engine.play();
    } catch (error) {
      console.error('Story audio preparation failed', error);
      setAudioError(true);
    }
  };
  const mainMenu = () => { engine.pause(); engine.seek(0); setScreen('menu');void enableMusic(); setModal(null); setConfirm(null); resumeAfterModal.current = false; };
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (modal || screen !== 'story' || /INPUT|SELECT/.test((e.target as HTMLElement).tagName)) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); playUI('click'); engine.seek(engine.time + (e.key === 'ArrowLeft' ? -5 : 5)); }
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'BUTTON') { e.preventDefault(); playUI('click'); engine.isPlaying ? engine.pause() : engine.play(); }
      if (e.key === 'Escape') { e.preventDefault(); playUI('click'); openSettings(); }
    };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  });
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings(prev => ({ ...prev, [key]: value }));
  const fullscreen = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); setFullscreenError(''); } catch { setFullscreenError('Fullscreen is unavailable in this browser. The story still fits your window.'); } };
  const ready = loaded === imageFiles.length && !failed;
  return <main
    onClickCapture={event => {
      const target = (event.target as Element).closest('button, a[href], input[type=checkbox]');
      if (target && !target.matches(':disabled, input[type=checkbox]')) playUI('click');
    }}
    onChangeCapture={event => {
      const target = event.target as HTMLElement;
      if (target.matches('input[type=range]')) playUI('slider');
      if (target.matches('input[type=checkbox], select')) playUI('toggle');
    }}
    className={`app production-app cinematic-app ${settings.reduced ? 'reduced' : ''} ${modal ? 'modal-open' : ''}`}>
    {screen === 'menu' ? <section className="menu" aria-label="Main menu">
      <img className="menu-art" src="/assets/backgrounds/menu_poster.png" alt="Commander Kernel, Agent Patch and Captain Firewall overlooking OS City" />
      <div className="menu-scrim" />
      <header className="menu-header"><a href="#" onClick={e => { e.preventDefault(); mainMenu(); }} className="brand"><span className="brand-emblem">K<span>G</span></span><span>KERNEL<br />GUARDIANS</span></a><span className="edition">An operating system security story</span><button className="icon-button" aria-label="Open settings" onClick={openSettings}><SettingsIcon /></button></header>
      <div className="menu-content"><h1><span>OS CITY</span><strong>{pilot ? 'UNDER ATTACK' : 'EIGHT MINUTES TO BLACKOUT'}</strong></h1><p>A digital world. Three guardians.<br />The security of an entire system.</p>
        <div className="menu-actions"><button className="start-button" disabled={!ready} onClick={start}><span>{ready ? 'START STORY' : failed ? 'ASSET LOAD FAILED' : `LOADING ${Math.round(loaded / imageFiles.length * 100)}%`}</span><span aria-hidden="true">▶</span></button>{failed && <button onClick={() => setLoadAttempt(n => n + 1)}>Retry loading artwork</button>}<button className="menu-music" onClick={()=>setMuted(!muted)}>{muted?'Sound off':'Sound on'}</button>{themeMissing&&<small>Menu music unavailable</small>}<div className="secondary-actions"><button onClick={openSettings}>Settings</button><span>/</span><button onClick={() => setModal('credits')}>Credits</button></div></div>
        <div className="pilot-note"><span className="signal" />{pilot ? '30-second pilot · Silent preview' : 'Cinematic edition · Original score & sound design'}</div>
      </div>
      <footer className="menu-footer"><span>Learn the system. Protect the city.</span><span>Best experienced in fullscreen <button className="text-button" onClick={fullscreen} aria-label="Toggle fullscreen"><FullscreenIcon /></button></span></footer>
    </section> : screen === 'loading' ? <section className="player cinematic-player" aria-label="Preparing story">
      <div className="audio-loading">
        <div className="audio-loading-panel">
          {audioError ? <>
            <h2>Soundtrack download failed</h2>
            <p role="alert">All three audio tracks are required before the story can start.</p>
            <button className="primary" onClick={start}>Retry audio</button>
            <button className="text-button" onClick={mainMenu}>Main menu</button>
          </> : <p role="status">Preparing soundtrack… {audioProgress} of 3 tracks ready</p>}
        </div>
      </div>
    </section> : <section className="player cinematic-player" aria-label="OS City cutscene">
      <div className="stage-container" ref={stageRef}><div className="scaled-stage" style={{ width: 1920, height: 1080, transform: `scale(${scale})` }}>{introducing ? <Intro time={elapsed} reduced={settings.reduced}/> : pilot ? <Stage time={t} reduced={settings.reduced} subtitles={settings.subtitles} /> : <ProductionStage time={t} reduced={settings.reduced} subtitles={settings.subtitles} />}</div></div>
      {introducing&&<button className="skip-intro" onClick={()=>engine.seek(introDuration)}>Skip Intro →</button>}<div className="mobile-story">{introducing?<><span>Meet the cast</span><h2>{card?.[1]??'Kernel Guardians'}</h2><p>{card?.[2]??'Eight Minutes to Blackout'}</p></>:<><span>{pilot ? 'The security problem' : fullFrame.chapter.title}</span>{settings.subtitles && <><h2>{pilot ? (renderAt(t).beat.speaker === 'kernel' ? 'Commander Kernel' : 'Agent Patch') : names[fullFrame.cue?.character ?? 'narrator']}</h2><p aria-live="polite">{pilot ? renderAt(t).beat.text : fullFrame.cue?.spoken_text ?? fullFrame.shot.note}</p></>}</>}<span className="mobile-status">{engine.isPlaying ? 'Story playing' : finished ? 'Story complete' : 'Story paused'} · {format(elapsed)} / {format(total)}</span></div>
      <div className="player-top"><button className="icon-button" onClick={openSettings} aria-label="Open settings and pause"><SettingsIcon /></button></div>
      {finished && !modal && <div className="end-overlay"><div><span className="end-label">After-action review complete</span><h2>Security is a<br />continuous process.</h2><p>{pilot ? 'Pilot complete. The story is just beginning.' : 'Essential services restored. Recovery and monitoring continue.'}</p><button className="primary" onClick={() => {engine.seek(introDuration);engine.play();}}>{pilot ? 'Replay pilot ↻' : 'Replay story ↻'}</button><button className="text-button" onClick={mainMenu}>Main menu</button></div></div>}
      <div className="playback"><div className="playback-row"><div className="transport"><button aria-label="Rewind 5 seconds" onClick={() => engine.seek(elapsed - 5)}>↶ <span>5s</span></button><button className="play-toggle" aria-label={engine.isPlaying ? 'Pause' : 'Play'} disabled={finished} onClick={() => engine.isPlaying ? engine.pause() : engine.play()}>{engine.isPlaying ? 'Ⅱ' : '▶'}</button><button aria-label="Forward 5 seconds" onClick={() => engine.seek(elapsed + 5)}><span>5s</span> ↷</button></div><span className="time">{format(elapsed)} <span>/ {format(total)}</span></span><span className="playback-caption">{finished ? 'Story complete' : introducing?'Cast introduction': pilot ? 'The security problem' : fullFrame.chapter.title}</span><button className="text-button" aria-label={muted ? "Unmute all audio" : "Mute all audio"} onClick={() => setMuted(!muted)}>{muted ? "Muted" : "Sound on"}</button><button className="text-button fullscreen" onClick={fullscreen} aria-label="Toggle fullscreen"><FullscreenIcon /></button></div><input className="timeline" aria-label="Story timeline" type="range" min="0" max={total} step="0.001" value={elapsed} aria-valuetext={`${elapsed.toFixed(1)} seconds of ${total}`} onChange={e => engine.seek(Number(e.target.value))} style={{ '--progress': `${elapsed / total * 100}%` } as React.CSSProperties} /><div className="keyboard-hint"><span>← → Seek 5s <span> / </span> Space Pause <span> / </span> Esc Settings</span><span>{pilot ? "Silent preview · No recorded audio" : audioState}</span></div></div>
    </section>}
    {fullscreenError && <button className="notice" onClick={() => setFullscreenError('')}>{fullscreenError} ×</button>}
    {modal === 'settings' && <Dialog title={screen === 'story' ? 'Story paused.' : 'Settings'} onClose={closeModal}>
      <p className="dialog-intro">{screen === 'story' ? `Holding your place at ${elapsed.toFixed(2)} seconds.` : 'Make the city your own.'}</p>
      {confirm ? <div className="confirmation"><h3>{confirm === 'restart' ? 'Restart this story?' : 'Return to the main menu?'}</h3><p>Your current playback position will be reset.</p><div className="dialog-actions"><button className="primary" onClick={() => { if (confirm === 'menu') mainMenu(); else { setModal(null); setConfirm(null); engine.seek(introducing?0:introDuration);engine.play(); } }}>Confirm</button><button onClick={() => setConfirm(null)}>Cancel</button></div></div> : <>
        <fieldset><legend>Playback</legend><label className="setting">Speed<select aria-label="Playback speed" value={settings.speed} onChange={e => set('speed', Number(e.target.value))}><option value="0.75">0.75×</option><option value="1">1× Normal</option><option value="1.25">1.25×</option></select></label><label className="setting">Dialogue & subtitles<input type="checkbox" checked={settings.subtitles} onChange={e => set('subtitles', e.target.checked)} /></label><label className="setting">Reduced motion<input type="checkbox" checked={settings.reduced} onChange={e => set('reduced', e.target.checked)} /></label></fieldset>
        <fieldset><legend>Audio</legend><p className="audio-note">{pilot ? "Silent preview." : audioState}. Original score and SFX duck beneath speech.</p>{(['narration', 'sfx', 'music'] as const).map(key => <label className="setting volume" key={key}><span>{key === 'sfx' ? 'Sound effects' : key === 'music' ? 'Background music' : 'Narration'}</span><input aria-label={`${key} volume`} type="range" min="0" max="100" value={settings[key]} onChange={e => set(key, Number(e.target.value))} /><output>{settings[key]}%</output></label>)}</fieldset>
        <div className="dialog-actions"><button className="primary" onClick={closeModal}>{screen === 'story' ? 'Resume story ▶' : 'Done'}</button>{screen === 'story' && <><button onClick={() => setConfirm('restart')}>Restart</button><button onClick={() => setConfirm('menu')}>Main menu</button></>}</div>
      </>}
    </Dialog>}
    {modal === 'credits' && <Dialog title="Behind the city." onClose={closeModal}><p className="dialog-intro">OS City: Under Attack / Kernel Guardians</p><p>An educational motion comic exploring operating system security, starring Commander Kernel, Agent Patch, and Captain Firewall.</p><p>Comic artwork and source references supplied in the OS City Pilot Asset Kit. Built with React, TypeScript, Vite, and GSAP.</p><p>The complete locked screenplay uses local Chatterbox voices. Voice rights and performance approval remain outstanding. The cinematic edition uses detailed supporting illustrations, authored camera shots, original synthesized score and foley. Narration remains voice-only.</p><button className="primary" onClick={closeModal}>Back to the city</button></Dialog>}
  </main>;
}
