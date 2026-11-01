import {environmentArt} from './assets';
import {blackoutAt,chapters,cueById} from './edit';
import type {Shot} from './types';
export function Environment({shot,time,reduced}:{shot:Shot;time:number;reduced:boolean}){
 const phase=reduced?0:time;const beforeZero=time>=blackoutAt-.22&&time<blackoutAt;
 const outage=shot.scene===1?Math.max(0,Math.min(.85,(time-7)/1.4)):0;
 return <>
  <img className="cine-environment" src={environmentArt[shot.location]} alt={`${shot.location==='command'?'Command Central':shot.location==='apartment'?'Mira’s apartment':shot.location==='gateway'?'Public network gateway':shot.location==='dawn'?'OS City at dawn':'OS City'} illustrated environment`}/>
  <svg className="environment-lights" width="1920" height="1080" aria-hidden="true">
   <defs><linearGradient id="beam"><stop stopColor="#32e2f4" stopOpacity="0"/><stop offset=".5" stopColor="#32e2f4" stopOpacity=".45"/><stop offset="1" stopColor="#32e2f4" stopOpacity="0"/></linearGradient></defs>
   {(shot.location==='command')&&<><ellipse cx="960" cy="790" rx={165+Math.sin(phase)*8} ry="32" fill="none" stroke="#32e2f4" strokeWidth="4" opacity=".5"/><path d={`M960 800L${780+Math.sin(phase*.4)*65} 340H${1120+Math.sin(phase*.4)*65}Z`} fill="url(#beam)" opacity=".18"/></>}
   {shot.location==='city'&&<path d="M0 660L530 545L590 1080H0Z" fill="#020918" opacity={outage}/>}
   {(shot.location==='gateway'||shot.scene===4||shot.scene===8)&&Array.from({length:32},(_,i)=>{const p=(phase*(shot.threat>.7?.7:.24)+i*.073)%1;return <path key={i} d={`M${900+(i%2?1:-1)*p*880} ${430+p*510}l${8+p*14} 0`} stroke={i%4===0?'#ff4b97':'#54efff'} strokeWidth={2+p*5} opacity={.3+p*.55}/>;})}
   {shot.location==='street'&&Array.from({length:12},(_,i)=><path key={i} d={`M${(i*167+phase*19)%1920} ${i*83%1000}l-8 24`} stroke="#89d8f0" strokeWidth="1.5" opacity=".2"/>)}
   {shot.location==='dawn'&&<ellipse cx="200" cy="350" rx="350" ry="300" fill="#ffdf68" opacity={.025+Math.sin(phase*.3)*.008}/>}
  </svg>
  <div className={`environment-grade grade-${shot.location}`} style={{opacity:shot.framing==='broadcast'?.72:.18+shot.threat*.1}}/>
  {beforeZero&&<div className="zero-blackout"/>}
  {shot.scene>=2&&shot.scene<=8&&time<blackoutAt&&<div className="city-alert-reflection" style={{opacity:reduced?.04:.025+.035*(1+Math.sin(time*1.8))}}/>}
  {shot.scene===1&&time<cueById('S01_VEX_002').start-.55&&<div className="skyline-life" style={{transform:`translateX(${reduced?0:(time-chapters[0].start)*12}px)`}} aria-hidden="true"><span/><span/><span/></div>}
 </>;
}
