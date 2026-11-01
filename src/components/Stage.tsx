import type { CSSProperties } from 'react';
import { renderAt } from '../engine/renderAt';
import manifestJson from '../story/asset_manifest.json';
import type { AssetManifest } from '../story/types';
const manifest: AssetManifest = manifestJson;
const asset = (id: string) => manifest.assets[id].file;
const principles = [
  { name: 'Confidentiality', text: 'Prevent unauthorized disclosure.', prop: 'encrypted_lock', short: 'Keep it private' },
  { name: 'Integrity', text: 'Prevent unauthorized modification.', prop: 'data_folder', short: 'Keep it intact' },
  { name: 'Availability', text: 'Keep resources accessible to authorized users.', prop: 'server_rack', short: 'Keep it available' },
];
export function Stage({ time, reduced, subtitles }: { time: number; reduced: boolean; subtitles: boolean }) {
  const frame = renderAt(time, reduced);
  const conceptMode = time >= 10 && time < 25;
  return <div className={`stage ${frame.alert ? 'is-alert' : ''}`} data-time={time.toFixed(3)} data-scene={frame.beat.scene}>
    <div className="world" style={{ transform: `translateY(${-frame.scroll}px) scale(${frame.cameraScale})` }}><img className="city" src={asset('backgrounds/city_panorama')} alt="The neon skyline of OS City" /></div>
    <div className="stage-shade" />
    <header className="stage-header"><span className="wordmark">OS CITY<span> / KERNEL GUARDIANS</span></span><span className="preview-label"><i /> Silent preview</span></header>
    <div className="chapter"><span>The security problem</span><span>Chapter one / Pilot</span></div>
    {time < 4 && <div className="establishing" style={{ opacity: frame.bubbleProgress }}><p>Every system has a world within.</p><h1>WELCOME TO<br /><span>OS CITY.</span></h1><span className="location">Inside your computer. Every second.</span></div>}
    {(['kernel', 'patch'] as const).map(name => { const c = frame[name]; return <div key={name} className={`character ${name}`} data-pose={c.pose} style={{ opacity: c.opacity, transform: `translate(${c.x}px, ${c.y}px) rotate(${c.rotation}deg)` }}><img src={asset(`characters/${name}/${c.pose}`)} alt={name === 'kernel' ? 'Commander Kernel' : 'Agent Patch'} /><span className="character-name">{name === 'kernel' ? 'Commander Kernel' : 'Agent Patch'}</span></div>; })}
    {conceptMode && <section className="principles" aria-label="Three security principles">{principles.map((p, index) => <div key={p.name} className={`principle ${frame.principles[index].lit ? 'illuminated' : ''}`} style={{ transform: `translateY(${frame.principles[index].lift}px)` }}><img className="principle-prop" src={asset(`props/${p.prop}`)} alt="" /><span className="principle-kicker">{p.short}</span><h2>{p.name}</h2><p>{p.text}</p></div>)}<img className="scan-ring" src={asset('effects/scan_ring')} alt="" style={{ transform: `rotate(${frame.ringRotation}deg)` }} /></section>}
    {frame.alert && <><div className="red-wash" style={{ opacity: frame.pulse }} /><div className="alert-art"><img src={asset('props/warning_sign')} alt="" /><h2>SECURITY<br />ALERT!</h2><p>Unusual activity detected.</p></div></>}
    {subtitles && time >= 4 && <div className={`speech ${frame.beat.speaker}`} style={{ '--bubble': frame.bubbleProgress, opacity: frame.bubbleProgress } as CSSProperties}><span>{frame.beat.speaker === 'kernel' ? 'Commander Kernel' : 'Agent Patch'}</span><p>{frame.beat.text}</p></div>}
    {subtitles && time < 4 && <p className="narration">{frame.beat.text}</p>}
    <div className="scene-foot"><span>{frame.alert ? 'City status / Alert' : 'City status / Online'}</span><span>Confidentiality · Integrity · Availability</span></div>
  </div>;
}
