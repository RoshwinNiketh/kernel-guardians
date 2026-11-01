import {dialoguePlacementAt} from './director';
import {cueAt,names} from './edit';
export function Dialogue({time,reduced}:{time:number;reduced:boolean}){
 const cue=cueAt(time),p=dialoguePlacementAt(time,reduced);if(!cue||!p)return null;
 return <section className={`cine-dialogue dialogue-${p.kind}`} data-speaker={p.owner} data-owner-track={p.actorTrackId??''} data-placement={p.kind} aria-label={`${names[p.owner]} dialogue`} style={{left:p.x,width:p.width,'--speaker-color':p.color} as React.CSSProperties}>
  {p.tailX!==undefined&&<svg className="dialogue-tail" width="1240" height="45" aria-hidden="true"><path d={`M${Math.max(38,Math.min(1160,p.tailX-p.x))} 42l${p.tailX<960?-55:55} -40l${p.tailX<960?105:-105} 40Z`} fill="#fff6df" stroke="#080e24" strokeWidth="4"/></svg>}
  <header><i/><strong>{names[p.owner]}</strong>{p.kind==='comms'&&<span>Remote video call</span>}{p.kind==='offscreen'&&<span>Off-screen</span>}{p.kind==='archive'&&<span>Recovered recording</span>}{p.kind==='broadcast'&&<span>Public transmission</span>}</header>
  <p>{cue.spoken_text}</p>
 </section>;
}
