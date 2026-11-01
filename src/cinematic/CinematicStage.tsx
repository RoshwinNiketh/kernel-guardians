import {actorFramesAt,cameraAt,frameAt} from './director';
import {cueAt,chapters,blackoutAt,climaxStart,duration,scheduled} from './edit';
import {Actor,Comms} from './Actor';
import {Environment} from './Environment';
import {Television} from './Television';
import {Hologram} from './Hologram';
import {Dialogue} from './Dialogue';
import {actorArt} from './assets';
const format=(n:number)=>`${Math.floor(n/60).toString().padStart(2,'0')}:${Math.floor(n%60).toString().padStart(2,'0')}`;
export function CinematicStage({time,reduced,subtitles}:{time:number;reduced:boolean;subtitles:boolean}){
 const f=frameAt(time),shot=f.shot,camera=cameraAt(shot,time,reduced),actors=actorFramesAt(time,reduced),cue=cueAt(time);
 const broadcast=actors.find(a=>a.actor==='vex'&&a.visible);
 const tv=actors.find(a=>a.mode==='crt'&&a.visible);
 const preCarrier=scheduled.some(c=>c.character==='vex'&&time>=c.start-.4&&time<c.start);
 const chapterIntro=time-f.chapter.start<Math.min(2.6,scheduled.find(c=>c.scene===f.chapter.id)!.start-f.chapter.start+.8);
 const blackoutFlash=time>=blackoutAt-.18&&time<blackoutAt;
 return <div className={`stage full-story cinematic-stage scene-${f.chapter.id} framing-${shot.framing} ${reduced?'motion-reduced':''} ${f.blackout?'last-ten':''}`} data-time={time.toFixed(3)} data-scene={f.chapter.id} data-shot={shot.id} data-cue={cue?.id??''} data-speaker={cue?.character??''} data-location={shot.location} data-countdown={f.countdown}>
  <div className="cine-world" data-camera={JSON.stringify(camera)} style={{transform:`translate(${960-camera.x*camera.zoom}px,${540-camera.y*camera.zoom}px) scale(${camera.zoom})`}}>
   <Environment shot={shot} time={time} reduced={reduced}/>
   {actors.filter(a=>a.mode==='physical'||a.mode==='hologram').map(a=><Actor key={a.id} actor={a}/>)}
  </div>
  <div className="cine-depth-vignette"/>
  <Hologram shot={shot} time={time} reduced={reduced}/>
  {actors.filter(a=>a.mode==='comms'&&a.actor!=='vex'&&a.visible).map(a=><Comms key={a.id} actor={a} time={time} reduced={reduced}/>)}
  {tv&&<Television actor={tv} time={time} close={shot.framing==='crt'} reduced={reduced}/>}
  {(broadcast||preCarrier)&&<div className={`vex-transmission ${broadcast?'carrier-open':'carrier-arriving'}`} data-mode="broadcast" data-actor={broadcast?'vex':undefined} data-track={broadcast?.id} data-speaking={cue?.character==='vex'} aria-label={broadcast?'Vex Null public transmission':'Incoming transmission carrier'}>
   <div className="transmission-noise" style={{backgroundPositionY:reduced?0:time*19}}/>
   {broadcast&&<><img src={actorArt('vex',broadcast.pose).file} alt="Vex Null speaking through a public transmission" style={{transform:`translateX(-50%) translateY(${reduced?0:Math.sin(time*1.7)*2}px)`}}/><div className="transmission-id"><span>Signal override</span><strong>VEX NULL</strong><small>Public transmission</small></div></>}
   <div className="signal-tear" style={{top:`${reduced?40:(time*9)%90}%`}}/>
  </div>}
  {f.blackout&&<div className="final-ten-counter" aria-label="Final ten continuous seconds"><strong>{format(f.countdown)}</strong><span>{time<climaxStart+3.2?'Hold the gate':time<climaxStart+6.8?'Isolate the service':'Switch to standby'}</span></div>}
  {blackoutFlash&&<div className="zero-blackout"/>}
  {time>=blackoutAt&&time<blackoutAt+.8&&<div className="restoration-card"><span>ESSENTIAL SERVICES AVAILABLE</span><small>Recovery and investigation continue.</small></div>}
  <div className="cine-letterbox top"/><div className="cine-letterbox bottom"/>
  <header className="cine-head"><span>KERNEL GUARDIANS</span><div className={`countdown-display ${f.countdown<=30?'urgent':''}`} aria-label="City blackout countdown"><small>{time<chapters[1].start?'Transmission incoming':f.restored?'Contained · Recovery underway':'Until blackout'}</small><strong>{format(f.countdown)}</strong></div></header>
  {chapterIntro&&<div className="location-slate"><span>{f.chapter.location}</span><h1>{f.chapter.title}</h1></div>}
  {f.narrativeCut&&<span className="narrative-cut-label">{f.narrativeCut.label} · Later</span>}
  {subtitles&&<Dialogue time={time} reduced={reduced}/>}
  <footer className="scene-foot cine-status"><span>{f.restored?'Essential services available / Recovery underway':f.blackout?'Standby path ready / Final response':shot.location==='dawn'?'City status / Repair crews active':'City status / Under attack'}</span><span>{f.chapter.topic}</span></footer>
  {time>=duration-2&&<div className="cine-last-frame">Security is a continuous process.</div>}
 </div>;
}
