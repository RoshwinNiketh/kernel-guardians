import {actorArt} from './assets';
export const introDuration=26;
export const cast=[
 ['kernel','Commander Kernel','Security Commander','point','#32e2f4'],
 ['patch','Agent Patch','Threat Investigator','point','#ff70b9'],
 ['firewall','Captain Firewall','Network Defender','idle','#ffbd48'],
 ['mira','Mira Vale','Citizen of OS City','worried','#51dfcf'],
 ['elara','Dr. Elara Trace','Security Researcher','recording','#f7dc72'],
 ['axiom','Auditor Axiom','Security Auditor','idle','#ffdf5a'],
 ['vex','Vex Null','Cyber Attacker','command','#d584ff'],
 ['narrator','Narrator','Your Guide to OS City','','#f8f1e6'],
];
export function introCardAt(t:number){return t<20?cast[Math.min(7,Math.max(0,Math.floor(t/2.5)))]:undefined;}
export function Intro({time,reduced}:{time:number;reduced:boolean}){
 const card=introCardAt(time),p=(time%2.5)/2.5;
 return <div className="stage cast-intro" data-time={time.toFixed(3)} data-character={card?.[0]??'title'} style={{'--cast-color':card?.[4]??'#ffe64a'} as React.CSSProperties}>
  <img className="intro-city" src="/assets/backgrounds/city_panorama.png" alt=""/>
  <div className="intro-ink"/><span className="intro-series">KERNEL GUARDIANS / THE CAST</span>
  {card?<><div className="intro-number">{String(cast.indexOf(card)+1).padStart(2,'0')}</div>
   {card[0]!=='narrator'?<img className={`intro-portrait portrait-${card[0]}`} src={actorArt(card[0],card[3]).file} alt={card[1]} style={{transform:`translateX(${reduced?0:(1-p)*25}px) scale(${reduced?1:1+p*.025})`}}/>:<div className="intro-narrator" aria-hidden="true">OS<br/>CITY<span>EVERY SYSTEM HAS A STORY.</span></div>}
   <div className="intro-name"><span>INTRODUCING</span><h1>{card[1]}</h1><p>{card[2]}</p></div></>:<div className="intro-title"><span>OS CITY</span><h1>KERNEL<br/>GUARDIANS</h1><p>EIGHT MINUTES TO BLACKOUT</p></div>}
  <div className="intro-strip" style={{width:`${time/introDuration*100}%`}}/>
 </div>;
}
