import {actorArt} from './assets';
import {actorColors} from './director';
import {names} from './edit';
import type {ActorFrame} from './types';

/** Image swaps never own entrance animation. The feet are measured per pose. */
export function Actor({actor}:{actor:ActorFrame}){
 const art=actorArt(actor.actor,actor.pose),scale=actor.height/art.bodyHeight;
 const mirror=actor.gaze==='left';
 return <div className={`cine-actor ${actor.depth===0?'background-citizen':''} ${actor.mode==='hologram'?'holographic':''}`} data-actor={actor.actor} data-track={actor.id} data-pose={actor.pose} data-speaking={actor.speaking} data-present="true" data-visible={actor.visible} data-world-x={actor.x} data-foot-y={actor.footY} data-arrival={actor.arrival.toFixed(3)} style={{left:actor.x+actor.offsetX,top:actor.footY+actor.offsetY,zIndex:actor.depth,visibility:actor.visible?'visible':'hidden',opacity:actor.arrival, '--actor-color':actorColors[actor.actor]} as React.CSSProperties}>
  <div className="actor-ground"/>
  <img className="actor-art" src={art.file} alt={`${names[actor.actor]} — ${actor.pose}`} draggable={false} style={{width:art.width*scale,height:art.height*scale,left:-art.anchorX*scale,top:-art.footY*scale,transform:mirror?'scaleX(-1)':undefined,transformOrigin:`${art.anchorX*scale}px ${art.footY*scale}px`}}/>
  {actor.mode==='hologram'&&<div className="hologram-projector"/>}
 </div>;
}

export function Comms({actor,time,reduced}:{actor:ActorFrame;time:number;reduced:boolean}){
 const art=actorArt(actor.actor,actor.pose);
 return <aside className={`cine-comms ${actor.speaking?'speaking':''}`} data-actor={actor.actor} data-track={actor.id} data-speaking={actor.speaking} data-mode="comms" style={{left:actor.x-170,top:actor.footY-350,'--actor-color':actorColors[actor.actor]} as React.CSSProperties} aria-label={`${names[actor.actor]} on communications link`}>
  <div className="comms-feed" style={{backgroundPositionY:reduced?0:time*8}}><img src={art.file} alt={names[actor.actor]}/><span className="comms-raster"/></div>
  <div className="comms-identity"><i/>{names[actor.actor]}<small>{actor.location==='gateway'?'Live from the gateway':actor.location==='apartment'?'Call from Mira’s apartment':'Live from Command Central'}</small></div>
 </aside>;
}
