import { frameAt, names } from '../story/production/timeline';
import { actors } from '../story/production/assets';
import { TechnicalDiagram } from './TechnicalDiagram';
const format=(t:number)=>`${Math.floor(t/60).toString().padStart(2,'0')}:${(t%60).toString().padStart(2,'0')}`;
const diagrams:Record<number,{title:string;items:string[];note:string}>={
  1:{title:'A city built on trust.',items:['Processes','Files','Connections'],note:'One district goes dark. A public transmission interrupts the city.'},
  2:{title:'Three things to protect.',items:['Confidentiality|Private data stays private','Integrity|No unauthorized changes','Availability|Legitimate access continues'],note:'Threat: a possible violation. Attack: an attempt to cause it.'},
  3:{title:'The gift hides an attack.',items:['Fake updater → Trojan','Spyware / trapdoor','Ransomware / logic bomb','Virus → host program','Unchecked input → memory corruption'],note:'RUNNING WITH USER PERMISSIONS · Contain the Trojan; enforce least privilege.'},
  4:{title:'A flood beyond the gates.',items:['Port scan → exposed services','Worm → host to host','Compromised machines → botnet','Botnet → DDoS → service timeout'],note:'A virus attaches to a host program. A worm propagates independently. Addresses do not prove identity.'},
  5:{title:'Behind every file, a person.',items:['Documents locked','Emergency portal unavailable','Recovered archive → update service','Stolen credentials → privileged task'],note:'E. TRACE / RECOVERED ARCHIVE · A recording, not a live transmission.'},
  6:{title:'Close every link in the chain.',items:['Policy → vulnerability assessment','Isolate → revoke → patch','Least privilege → segmentation','IDS: signatures / anomalies','Protected backups → recovery'],note:'False positive: innocent activity flagged. False negative: real attack missed. Investigate alerts.'},
  7:{title:'The gate is one layer.',items:['Network firewall → boundary','Personal firewall → one computer','Proxy → protocol-aware filtering','System-call filter → operations'],note:'Allowed tunnels and spoofing complicate filtering. A firewall cannot repair an internal backdoor.'},
  8:{title:'Contain. Coordinate. Recover.',items:['Isolate the compromised service','Rotate stolen credentials','Mitigate DDoS upstream','Prepare verified clean backups','Switch essential services to standby'],note:'Restoration is partial. Investigation and recovery continue.'},
  9:{title:'Assurance is evaluated.',items:['D|Minimal evaluated protection','C1 / C2|Discretionary controls / auditing','B1 / B2 / B3|Mandatory protection / labels','A|Formal design and verification'],note:'Historical TCSEC classifications are not modern breach guarantees or incident-response tools.'},
};
export function ProductionStage({time,reduced,subtitles}:{time:number;reduced:boolean;subtitles:boolean}){
 const f=frameAt(time);const speaker=f.cue?.character??f.recent?.character;const diagram=diagrams[f.chapter.id];
 const secondary=f.chapter.id===9?'patch':f.chapter.id===7?'patch':f.chapter.id===5?'elara':f.chapter.id===4?'firewall':'patch';
 const primary=speaker&&speaker!=='narrator'?speaker:f.chapter.id===1?'vex':'kernel';
 const cast=f.chapter.id===1?[primary]:[primary,secondary===primary?'kernel':secondary];
 const local=time-f.chapter.start;const cueLocal=f.cue?time-f.cue.start:local;
 const entrance=reduced?1:Math.min(1,cueLocal/ .7);const exit=reduced?0:Math.max(0,1-(f.chapter.end-time)/.8);const idle=(n:number)=>reduced?0:Math.sin(time*2.3+n)*4;
 return <div className={`stage full-story scene-${f.chapter.id} ${f.blackout?'last-ten':''}`} data-time={time.toFixed(3)} data-scene={f.chapter.id} data-shot={f.shot?.id} data-cue={f.cue?.id??''}>
  <div className="world" style={{transform:`translateY(${reduced?0:-local*.35}px) scale(${reduced?1:1.05+local*.0002})`}}><img className="city" src={f.chapter.id===3||f.chapter.id===5?"/assets/backgrounds/program_street.webp":"/assets/backgrounds/city_panorama.png"} alt="OS City skyline"/></div><div className="stage-shade"/>
  <header className="stage-header"><span className="wordmark">KERNEL GUARDIANS</span><span className="countdown" aria-label="City blackout countdown">{format(f.countdown)}</span></header>
  <div className="chapter"><span>{f.chapter.title}</span><span>Chapter {f.chapter.id} / 9</span></div>
  {cast.map((name,i)=>{const a=actors[name];return <div key={`${name}-${i}`} className={`character ${i===0?'kernel':'patch'} ${name==='elara'?'archive-actor':''}`} data-actor={name} data-speaking={speaker===name} style={{transform:`translate(${reduced?0:(i===0?-1:1)*(1-entrance+exit)*600}px,${idle(i)}px) scale(${reduced?1:speaker===name?1.015:1})`,opacity:entrance}}><img src={speaker===name?a.talk:a.idle} alt={names[name]}/><span className="character-name">{names[name]}{name==='elara'?' · Archive':''}</span></div>;})}
  <div className="story-props" aria-hidden="true">{[f.chapter.id===3?'malware_icon':f.chapter.id===5?'encrypted_lock':f.chapter.id===7?'security_shield':'server_rack',f.chapter.id===6?'data_folder':'hologram_city'].map((prop,i)=><img key={prop+i} src={`/assets/props/${prop}.png`} style={{transform:`translateY(${idle(i)}px) rotate(${reduced?0:Math.sin(time*.5+i)*2}deg)`}}/>)}</div>
  {(f.chapter.id===4||f.chapter.id===7||f.chapter.id===8)&&<svg className="packet-stream" width="1920" height="1080" aria-hidden="true">{Array.from({length:18},(_,i)=><rect key={i} x={reduced?350+i*65:((time*90+i*107)%1200)+350} y={180+(i%3)*130} width="14" height="7" fill={i%3===0?'#ff3a9b':'#32e2f4'}/>)}</svg>}
  <section className="technical-visual" aria-label={diagram.title}><h2>{diagram.title}</h2><TechnicalDiagram scene={f.chapter.id} text={f.cue?.spoken_text??''} time={time} reduced={reduced}/><div className={`diagram diagram-${f.chapter.id}`}>{diagram.items.map((item,i)=><div key={item} className={(Math.floor(time/3)%diagram.items.length===i)?'active':''} style={{transform:`translateY(${reduced?0:Math.sin(time+i)*2}px)`}}><strong>{item.split('|')[0]}</strong>{item.includes('|')&&<span>{item.split('|')[1]}</span>}</div>)}</div><p>{diagram.note}</p></section>
  {f.blackout&&<div className="climax"><strong>{format(f.countdown)}</strong><p>Standby path ready. Holding the boundary.</p></div>}
  {subtitles&&f.cue&&<div className={`speech ${speaker==='patch'?'patch':'kernel'}`}><span>{names[f.cue.character]}{f.cue.character==='elara'?' / Recovered archive':''}</span><p>{f.cue.spoken_text}</p></div>}
  <div className="scene-foot"><span>{f.restored?'Essential services available / Recovery underway':'City status / Under attack'}</span><span>Security is a continuous process.</span></div>
 </div>;
}

