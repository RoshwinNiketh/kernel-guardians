import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { StoryEngine } from './engine/StoryEngine';
import { Stage } from './components/Stage';
import { Dialog } from './components/Dialog';
import { SettingsIcon, FullscreenIcon } from './components/Icons';
import manifest from './story/asset_manifest.json';
import { renderAt } from './engine/renderAt';

type Settings = { narration: number; sfx: number; music: number; subtitles: boolean; speed: number; reduced: boolean };
const initial: Settings = { narration: 80, sfx: 70, music: 40, subtitles: true, speed: 1, reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches };
const format = (t: number) => `0:${String(Math.floor(t)).padStart(2, '0')}`;

export default function App() {
  const [engine] = useState(() => new StoryEngine());
  useSyncExternalStore(engine.subscribe, engine.snapshot);
  const [screen, setScreen] = useState<'menu' | 'story'>('menu');
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
  const t = engine.time;
  const finished = screen === 'story' && t >= 30;
  useEffect(() => {
    let active = true;
    setLoaded(0); setFailed(false);
    const assets = Object.values(manifest.assets);
    assets.forEach(asset => { const img = new Image(); img.onload = () => { if (active) setLoaded(n => n + 1); }; img.onerror = () => { if (active) setFailed(true); }; img.src = asset.file; });
    return () => { active = false; };
  }, [loadAttempt]);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(entry.contentRect.width / 1920, entry.contentRect.height / 1080)));
    if (stageRef.current) observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, [screen]);
  useEffect(() => { engine.speed(settings.speed); }, [settings.speed, engine]);
  useEffect(() => {
    const hide = () => { if (document.hidden) engine.pause(); };
    document.addEventListener('visibilitychange', hide);
    return () => { document.removeEventListener('visibilitychange', hide); engine.pause(); };
  }, [engine]);
  const openSettings = () => { resumeAfterModal.current = engine.isPlaying; engine.pause(); setConfirm(null); setModal('settings'); };
  const closeModal = () => { setModal(null); setConfirm(null); if (resumeAfterModal.current && screen === 'story') engine.play(); };
  const start = () => { engine.pause(); setScreen('story'); engine.restart(); };
  const mainMenu = () => { engine.pause(); engine.seek(0); setScreen('menu'); setModal(null); setConfirm(null); resumeAfterModal.current = false; };
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (modal || screen !== 'story' || /INPUT|SELECT/.test((e.target as HTMLElement).tagName)) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); engine.seek(engine.time + (e.key === 'ArrowLeft' ? -5 : 5)); }
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'BUTTON') { e.preventDefault(); engine.isPlaying ? engine.pause() : engine.play(); }
      if (e.key === 'Escape') { e.preventDefault(); openSettings(); }
    };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  });
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings(prev => ({ ...prev, [key]: value }));
  const fullscreen = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); setFullscreenError(''); } catch { setFullscreenError('Fullscreen is unavailable in this browser. The story still fits your window.'); } };
  const ready = loaded === Object.keys(manifest.assets).length && !failed;
  return <main className={`app ${settings.reduced ? 'reduced' : ''} ${modal ? 'modal-open' : ''}`}>
    {screen === 'menu' ? <section className="menu" aria-label="Main menu">
      <img className="menu-art" src="/assets/backgrounds/menu_poster.png" alt="Commander Kernel, Agent Patch and Captain Firewall overlooking OS City" />
      <div className="menu-scrim" />
      <header className="menu-header"><a href="#" onClick={e => { e.preventDefault(); mainMenu(); }} className="brand"><span className="brand-emblem">K<span>G</span></span><span>KERNEL<br />GUARDIANS</span></a><span className="edition">An operating system security story</span><button className="icon-button" aria-label="Open settings" onClick={openSettings}><SettingsIcon /></button></header>
      <div className="menu-content"><h1><span>OS CITY</span><strong>UNDER ATTACK</strong></h1><p>A digital world. Three guardians.<br />The security of an entire system.</p>
        <div className="menu-actions"><button className="start-button" disabled={!ready} onClick={start}><span>{ready ? 'START STORY' : failed ? 'ASSET LOAD FAILED' : `LOADING ${Math.round(loaded / 48 * 100)}%`}</span><span aria-hidden="true">▶</span></button>{failed && <button onClick={() => setLoadAttempt(n => n + 1)}>Retry loading artwork</button>}<div className="secondary-actions"><button onClick={openSettings}>Settings</button><span>/</span><button onClick={() => setModal('credits')}>Credits</button></div></div>
        <div className="pilot-note"><span className="signal" />30-second pilot <span>·</span> Silent preview</div>
      </div>
      <footer className="menu-footer"><span>Learn the system. Protect the city.</span><span>Best experienced in fullscreen <button className="text-button" onClick={fullscreen} aria-label="Toggle fullscreen"><FullscreenIcon /></button></span></footer>
    </section> : <section className="player" aria-label="OS City cutscene">
      <div className="stage-container" ref={stageRef}><div className="scaled-stage" style={{ width: 1920, height: 1080, transform: `scale(${scale})` }}><Stage time={t} reduced={settings.reduced} subtitles={settings.subtitles} /></div></div>
      <div className="mobile-story"><span>The security problem</span>{settings.subtitles && <><h2>{renderAt(t).beat.speaker === 'narrator' ? 'Welcome to OS City' : renderAt(t).beat.speaker === 'kernel' ? 'Commander Kernel' : 'Agent Patch'}</h2><p aria-live="polite">{renderAt(t).beat.text}</p></>}<span className="mobile-status">{engine.isPlaying ? 'Story playing' : finished ? 'Pilot complete' : 'Story paused'} · {format(t)} / 0:30</span></div>
      <div className="player-top"><button className="icon-button" onClick={openSettings} aria-label="Open settings and pause"><SettingsIcon /></button></div>
      {finished && !modal && <div className="end-overlay"><div><span className="end-label">Transmission interrupted</span><h2>The city needs<br />its guardians.</h2><p>Pilot complete. The story is just beginning.</p><button className="primary" onClick={() => engine.restart()}>Replay pilot ↻</button><button className="text-button" onClick={mainMenu}>Main menu</button></div></div>}
      <div className="playback"><div className="playback-row"><div className="transport"><button aria-label="Rewind 5 seconds" onClick={() => engine.seek(t - 5)}>↶ <span>5s</span></button><button className="play-toggle" aria-label={engine.isPlaying ? 'Pause' : 'Play'} disabled={finished} onClick={() => engine.isPlaying ? engine.pause() : engine.play()}>{engine.isPlaying ? 'Ⅱ' : '▶'}</button><button aria-label="Forward 5 seconds" onClick={() => engine.seek(t + 5)}><span>5s</span> ↷</button></div><span className="time">{format(t)} <span>/ 0:30</span></span><span className="playback-caption">{finished ? 'Pilot complete' : 'The security problem'}</span><button className="text-button fullscreen" onClick={fullscreen} aria-label="Toggle fullscreen"><FullscreenIcon /></button></div><input className="timeline" aria-label="Story timeline" type="range" min="0" max="30" step="0.001" value={t} aria-valuetext={`${t.toFixed(1)} seconds of 30`} onChange={e => engine.seek(Number(e.target.value))} style={{ '--progress': `${t / 30 * 100}%` } as React.CSSProperties} /><div className="keyboard-hint"><span>← → Seek 5s <span> / </span> Space Pause <span> / </span> Esc Settings</span><span>Silent preview · No recorded audio</span></div></div>
    </section>}
    {fullscreenError && <button className="notice" onClick={() => setFullscreenError('')}>{fullscreenError} ×</button>}
    {modal === 'settings' && <Dialog title={screen === 'story' ? 'Story paused.' : 'Settings'} onClose={closeModal}>
      <p className="dialog-intro">{screen === 'story' ? `Holding your place at ${t.toFixed(2)} seconds.` : 'Make the city your own.'}</p>
      {confirm ? <div className="confirmation"><h3>{confirm === 'restart' ? 'Restart this pilot?' : 'Return to the main menu?'}</h3><p>Your current playback position will be reset.</p><div className="dialog-actions"><button className="primary" onClick={() => { if (confirm === 'menu') mainMenu(); else { setModal(null); setConfirm(null); engine.restart(); } }}>Confirm</button><button onClick={() => setConfirm(null)}>Cancel</button></div></div> : <>
        <fieldset><legend>Playback</legend><label className="setting">Speed<select value={settings.speed} onChange={e => set('speed', Number(e.target.value))}><option value="0.75">0.75×</option><option value="1">1× Normal</option><option value="1.25">1.25×</option></select></label><label className="setting">Dialogue & subtitles<input type="checkbox" checked={settings.subtitles} onChange={e => set('subtitles', e.target.checked)} /></label><label className="setting">Reduced motion<input type="checkbox" checked={settings.reduced} onChange={e => set('reduced', e.target.checked)} /></label></fieldset>
        <fieldset><legend>Audio</legend><p className="audio-note">Silent preview. Levels apply when recordings are added.</p>{(['narration', 'sfx', 'music'] as const).map(key => <label className="setting volume" key={key}><span>{key === 'sfx' ? 'Sound effects' : key === 'music' ? 'Background music' : 'Narration'}</span><input aria-label={`${key} volume`} type="range" min="0" max="100" value={settings[key]} onChange={e => set(key, Number(e.target.value))} /><output>{settings[key]}%</output></label>)}</fieldset>
        <div className="dialog-actions"><button className="primary" onClick={closeModal}>{screen === 'story' ? 'Resume story ▶' : 'Done'}</button>{screen === 'story' && <><button onClick={() => setConfirm('restart')}>Restart</button><button onClick={() => setConfirm('menu')}>Main menu</button></>}</div>
      </>}
    </Dialog>}
    {modal === 'credits' && <Dialog title="Behind the city." onClose={closeModal}><p className="dialog-intro">OS City: Under Attack / Kernel Guardians</p><p>An educational motion comic exploring operating system security, starring Commander Kernel, Agent Patch, and Captain Firewall.</p><p>Comic artwork and source references supplied in the OS City Pilot Asset Kit. Built with React, TypeScript, Vite, and GSAP.</p><p>This 30-second concept uses provisional dialogue timing. Voiceover, sound effects, and music are not included.</p><button className="primary" onClick={closeModal}>Back to the city</button></Dialog>}
  </main>;
}

