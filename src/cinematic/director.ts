import {chapters,scheduled,cueById,cueAt,chapterAt,countdown,narrativeCuts,climaxStart,blackoutAt} from './edit.ts';
import type {ActorId,ActorTrack,ActorFrame,CameraKey,CameraTrack,ConceptId,DialoguePlacement,Framing,LocationId,Shot,SpeakerId} from './types';
const sceneLocations:LocationId[]=['city','command','street','gateway','apartment','command','gateway','command','dawn'];
export const actorColors:Record<string,string>={kernel:'#32e2f4',patch:'#ff70b9',firewall:'#ffbd48',vex:'#d584ff',mira:'#51dfcf',elara:'#f7dc72',axiom:'#ffdf5a',narrator:'#f8f1e6'};
export const actorTracks:ActorTrack[]=[];
function place(scene:number,actor:ActorId,x:number,height:number,options:Partial<ActorTrack>={}){
 const c=chapters[scene-1];actorTracks.push({id:`scene-${scene}-${actor}-${options.mode??'physical'}`,actor,scene,start:c.start,end:c.end,location:sceneLocations[scene-1],x,footY:1020,height,depth:2,pose:'idle',mode:'physical',entrance:'cut',arrivalDuration:1,gaze:x<960?'right':'left',...options});
}
place(2,'kernel',420,790,{start:chapters[1].start+.12,entrance:'left'});place(2,'patch',1450,760);place(2,'firewall',1560,390,{mode:'comms',footY:535,location:'gateway'});
place(3,'kernel',390,790);place(3,'patch',1440,760);place(3,'mira',1540,400,{mode:'comms',footY:565,location:'apartment'});place(3,'citizen',925,365,{depth:0,footY:885});place(3,'technician',1650,340,{depth:0,footY:870});
place(4,'firewall',500,800);place(4,'patch',1500,390,{mode:'comms',footY:535,location:'command'});place(4,'kernel',1160,390,{mode:'comms',footY:535,location:'command'});
place(5,'mira',430,810,{pose:'worried'});place(5,'patch',1540,380,{mode:'comms',footY:520,location:'command'});place(5,'kernel',1530,380,{mode:'comms',footY:520,location:'command'});place(5,'elara',1160,670,{mode:'crt',footY:850,start:chapters[4].start,pose:'recording'});
place(6,'kernel',420,790);place(6,'patch',1450,760);place(6,'firewall',1550,400,{mode:'comms',footY:535,location:'gateway'});place(6,'technician',1040,340,{depth:0,footY:825});
place(7,'firewall',500,800);place(7,'patch',1490,410,{mode:'comms',footY:550,location:'command'});
place(8,'kernel',420,790);place(8,'patch',1450,760);place(8,'firewall',520,800,{location:'gateway'});place(8,'firewall',1550,390,{mode:'comms',footY:535,location:'gateway'});place(8,'mira',1490,410,{mode:'comms',footY:550,location:'apartment',start:cueById('S08_MIRA_008').start-.2});
place(9,'kernel',350,740);place(9,'patch',770,710);place(9,'firewall',1140,740);place(9,'axiom',1560,780,{mode:'hologram',start:chapters[8].start+.4});place(9,'technician',1000,300,{depth:0,footY:870});place(9,'citizen',600,320,{depth:0,footY:890});
for(const scene of [1,2,3,4,7,8]){const list=scheduled.filter(c=>c.scene===scene&&c.character==='vex');if(list.length)place(scene,'vex',960,900,{mode:'comms',location:'city',start:list[0].start-.55,end:list.at(-1)!.end+.4});}

interface Direction {framing:Framing;concept?:ConceptId;focus?:ActorId;location?:LocationId;visible?:ActorId[];note:string;threat?:number}
// Every spoken cue has an authored shot. Cast is never inferred from the speaker.
const directions:Record<string,Direction>={
 S01_NARRATOR_001:{framing:'city',note:'Aerial push; ordinary city life before a district goes dark',threat:.15},
 S01_VEX_002:{framing:'broadcast',focus:'vex',note:'First deliberate reveal through a public transmission',threat:.7},
 S02_PATCH_000:{framing:'two-shot',focus:'patch',note:'Patch confirms the deadline before Firewall reacts'},
 S02_KERNEL_001:{framing:'two-shot',focus:'kernel',note:'Kernel left, Patch right; establish command geography'},
 S02_FIREWALL_002:{framing:'split',focus:'firewall',note:'Gateway comms opens; Kernel holds a serious reaction'},
 S02_PATCH_003:{framing:'wide',concept:'cia',focus:'patch',note:'Three-person composition, Firewall on comms'},
 S02_KERNEL_004:{framing:'close',focus:'kernel',note:'A brief controlled reaction from Kernel'},
 S02_PATCH_005:{framing:'insert',concept:'cia',focus:'patch',visible:['patch'],note:'CIA pillars illuminate sequentially'},
 S02_NARRATOR_006:{framing:'insert',concept:'threat',visible:[],note:'Potential violation versus attempted breach; no narrator actor'},
 S02_VEX_007:{framing:'broadcast',focus:'vex',note:'Vex interrupts the same established room',threat:.75},
 S02_KERNEL_008:{framing:'wide',focus:'kernel',note:'Kernel points toward the established Patch and gateway link'},
 S03_MIRA_001:{framing:'split',focus:'mira',concept:'updater',note:'Emergency call beside the deceptive update'},
 S03_PATCH_002:{framing:'insert',concept:'trojan',focus:'patch',visible:['patch'],note:'Updater shell reveals a permission-abusing payload'},
 S03_VEX_003:{framing:'broadcast',focus:'vex',note:'A short intrusion, not a standing conversational partner',threat:.7},
 S03_KERNEL_004:{framing:'close',focus:'kernel',note:'Kernel sets a serious boundary'},
 S03_NARRATOR_005:{framing:'insert',concept:'malware',visible:[],note:'Separate theft, encryption and delayed-trigger consequences'},
 S03_PATCH_006:{framing:'insert',concept:'virus',focus:'patch',visible:['patch'],note:'Host-bound virus versus independent worm'},
 S03_PATCH_007:{framing:'insert',concept:'buffer',focus:'patch',visible:['patch'],note:'Unchecked input crosses a marked buffer boundary'},
 S03_KERNEL_008:{framing:'wide',focus:'kernel',concept:'containment',note:'Contain the program while the real actors hold their places'},
 S04_PATCH_001:{framing:'insert',concept:'ports',focus:'patch',note:'Scan for services, then follow worm propagation'},
 S04_KERNEL_002:{framing:'split',focus:'kernel',concept:'worm',note:'Kernel speaks from command, not from Firewall’s position'},
 S04_NARRATOR_003:{framing:'insert',concept:'worm',visible:[],note:'Independent propagation and dual-use scanning'},
 S04_VEX_004:{framing:'broadcast',focus:'vex',note:'Compromised machines answer the attacker',threat:.8},
 S04_FIREWALL_005:{framing:'close',focus:'firewall',note:'Relaxed Firewall as distant traffic gathers'},
 S04_PATCH_006:{framing:'split',focus:'patch',concept:'botnet',note:'Patch diagnoses the flood through the command link'},
 S04_FIREWALL_007:{framing:'close',focus:'firewall',note:'Same feet; alert pose and tighter camera',threat:.9},
 S04_NARRATOR_008:{framing:'insert',concept:'identity',visible:[],note:'Identity deception, intercepted traffic, stolen sessions'},
 S04_KERNEL_009:{framing:'split',focus:'kernel',concept:'containment',note:'Coordinate separation of critical services',threat:.7},
 S05_MIRA_001:{framing:'close',focus:'mira',note:'A personal apartment scene, locked files and a failed portal'},
 S05_PATCH_002:{framing:'split',focus:'patch',note:'Patch listens and reassures through a named communication link'},
 S05_ELARA_003:{framing:'crt',focus:'elara',visible:['elara'],note:'Push into the physical CRT; recording stays inside its glass'},
 S05_KERNEL_004:{framing:'split',focus:'kernel',concept:'chain',note:'Trace the compromised trusted update service'},
 S05_NARRATOR_005:{framing:'wide',concept:'chain',note:'Mira and the frozen archive; no narrator substitution'},
 S06_PATCH_001:{framing:'two-shot',focus:'patch',concept:'policy',note:'Return to the established command geography'},
 S06_KERNEL_002:{framing:'close',focus:'kernel',note:'Consider the gap between policy and the actual system'},
 S06_PATCH_003:{framing:'insert',focus:'patch',concept:'containment',visible:['patch'],note:'Isolation, credential revocation and patching become visible actions'},
 S06_NARRATOR_004:{framing:'insert',concept:'layers',visible:[],note:'Separate defense layers engage'},
 S06_PATCH_005:{framing:'insert',concept:'ids',focus:'patch',visible:['patch'],note:'Known patterns versus unusual behavior'},
 S06_FIREWALL_006:{framing:'split',focus:'firewall',note:'A dry comms aside while the work continues'},
 S06_PATCH_007:{framing:'insert',concept:'ids',focus:'patch',visible:['patch'],note:'Concrete false-positive and false-negative cases'},
 S06_KERNEL_008:{framing:'wide',concept:'backups',focus:'kernel',note:'Protected backups and monitoring support the layered response'},
 S07_FIREWALL_001:{framing:'wide',focus:'firewall',concept:'filter',note:'Establish the detailed physical gate and filtering paths'},
 S07_PATCH_002:{framing:'split',focus:'patch',concept:'filter',note:'Network boundary versus individual-host protection'},
 S07_FIREWALL_003:{framing:'insert',focus:'firewall',concept:'proxy',visible:['firewall'],note:'Protocol-aware proxy and system-call controls are separate tools'},
 S07_VEX_004:{framing:'broadcast',focus:'vex',note:'A permitted connection carries concealed danger',threat:.8},
 S07_FIREWALL_005:{framing:'close',focus:'firewall',concept:'tunnel',note:'Same actor location, serious pose and controlled close-up',threat:.8},
 S07_PATCH_006:{framing:'split',focus:'patch',concept:'containment',note:'Patch works inside while Firewall holds the boundary'},
 S07_FIREWALL_007:{framing:'wide',focus:'firewall',note:'The gate strains under the flood',threat:.8},
 S08_VEX_001:{framing:'broadcast',focus:'vex',note:'Threaten the compromised internal service',threat:1},
 S08_PATCH_002:{framing:'two-shot',focus:'patch',concept:'response',note:'Explain the internal access path in command'},
 S08_KERNEL_003:{framing:'wide',focus:'kernel',concept:'response',note:'Three-person coordinated command without slot swapping'},
 S08_FIREWALL_004:{framing:'close',focus:'firewall',location:'gateway',note:'Cross-cut to the responsible gatekeeper',threat:.8},
 S08_NARRATOR_005:{framing:'insert',concept:'response',visible:[],note:'Containment, upstream control and verified backup montage'},
 S08_VEX_006:{framing:'broadcast',focus:'vex',note:'A tighter unstable transmission as Vex loses control',threat:1},
 S08_PATCH_007:{framing:'close',focus:'patch',note:'Commit to containment and recovery rather than instant reversal'},
 S08_MIRA_008:{framing:'split',focus:'mira',concept:'standby',note:'The portal returns; personal files remain unresolved'},
 S08_KERNEL_009:{framing:'two-shot',focus:'kernel',note:'Refuse a premature victory claim'},
 S08_VEX_010:{framing:'broadcast',focus:'vex',note:'One last threat and then a dead carrier',threat:.45},
 S08_KERNEL_011:{framing:'wide',focus:'kernel',note:'Resume monitoring and backup protection'},
 S08_FIREWALL_012:{framing:'split',focus:'firewall',note:'A restrained release of tension over comms'},
 S09_AXIOM_001:{framing:'wide',focus:'axiom',note:'Four people at dawn; repair work continues'},
 S09_AXIOM_002:{framing:'insert',concept:'tcsec',focus:'axiom',visible:['axiom'],note:'Historical classifications unfold; no modern guarantee'},
 S09_PATCH_003:{framing:'two-shot',focus:'patch',note:'Patch puts the historic classes into context'},
 S09_NARRATOR_004:{framing:'aftermath',visible:[],note:'Return to ordinary city life and continued repairs'},
 S09_FIREWALL_005:{framing:'close',focus:'firewall',note:'A quietly self-satisfied joke'},
 S09_KERNEL_006:{framing:'close',focus:'kernel',note:'A dry response, then return to the working team'},
};
function cameraFor(d:Direction,scene:number):CameraTrack{
 let from:CameraKey={x:960,y:540,zoom:1.03},to:CameraKey={x:975,y:535,zoom:1.055};
 if(d.framing==='city'||d.framing==='aftermath'){from={x:1000,y:510,zoom:1.03};to={x:925,y:515,zoom:1.13};}
 if(d.framing==='close'){const t=actorTracks.find(a=>a.actor===d.focus&&a.scene===scene&&a.mode==='physical'&&(!d.location||a.location===d.location));if(t){from={x:t.x+(t.x<960?200:-200),y:500,zoom:1.4};to={...from,zoom:1.46};}}
 if(d.framing==='two-shot'){from={x:930,y:560,zoom:1.04};to={x:945,y:555,zoom:1.07};}
 return{from,to};
}
export const shots:Shot[]=[];
function addShot(id:string,scene:number,start:number,end:number,d:Direction){if(end-start<.001)return;shots.push({id,scene,start,end,location:d.location??sceneLocations[scene-1],framing:d.framing,focus:d.focus,concept:d.concept??'none',camera:cameraFor(d,scene),visible:d.visible??(d.framing==='insert'?(d.focus?[d.focus]:[]):undefined),note:d.note,threat:d.threat??(scene>=4&&scene<=8?.4:.08)});}
for(const chapter of chapters){
 const list=scheduled.filter(c=>c.scene===chapter.id);
 addShot(`S${chapter.id}_establish`,chapter.id,chapter.start,list[0].start,{framing:chapter.id===1?'city':'wide',note:`Establish ${chapter.location}`});
 for(const c of list){const d=directions[c.id];if(!d)throw Error(`Missing cinematography for ${c.id}`);const next=scheduled[scheduled.indexOf(c)+1];let end=Math.min(next?.start??chapter.end,chapter.end);if(c.id==='S08_PATCH_007')end=climaxStart;
  if(c.duration>8&&d.framing!=='broadcast'&&d.framing!=='crt'){const middle=c.start+c.duration*.52;addShot(`${c.id}_a`,chapter.id,c.start,middle,d);addShot(`${c.id}_b`,chapter.id,middle,end,{...d,framing:d.concept?'insert':d.framing,note:`Detail/reaction: ${d.note}`});}
  else addShot(c.id,chapter.id,c.start,end,d);
 }
}
addShot('S08_last10_gate',8,climaxStart,climaxStart+3.2,{framing:'climax',location:'gateway',focus:'firewall',concept:'response',note:'Hold the gate under the final traffic surge',threat:1});
addShot('S08_last10_service',8,climaxStart+3.2,climaxStart+6.8,{framing:'climax',location:'command',focus:'patch',concept:'containment',note:'Isolate the service and prepare standby',threat:1});
addShot('S08_last10_standby',8,climaxStart+6.8,blackoutAt,{framing:'climax',location:'command',focus:'kernel',concept:'standby',note:'Standby switches at zero; a brief blackout',threat:.9});
shots.sort((a,b)=>a.start-b.start);
export function shotAt(t:number){return shots.find(s=>t>=s.start&&t<s.end)??(t<0?shots[0]:shots.at(-1)!);}
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export function cameraAt(shot:Shot,t:number,reduced=false):CameraKey{const p=reduced?0:clamp((t-shot.start)/(shot.end-shot.start)),q=p*p*(3-2*p),a=shot.camera.from,b=shot.camera.to,zoom=a.zoom+(b.zoom-a.zoom)*q,x=a.x+(b.x-a.x)*q,y=a.y+(b.y-a.y)*q;return{x:Math.max(960/zoom,Math.min(1920-960/zoom,x)),y:Math.max(540/zoom,Math.min(1080-540/zoom,y)),zoom};}
export function poseAt(track:ActorTrack,t:number){
 const cue=cueAt(t),speaking=cue?.character===track.actor;
 if(t>=climaxStart&&t<blackoutAt){if(track.actor==='kernel')return t>=climaxStart+6.8?'point':'thinking';if(track.actor==='patch')return t>=climaxStart+3.2?'point':'tablet';}
 if(track.actor==='kernel')return speaking?(cue!.id==='S02_KERNEL_008'||cue!.id==='S08_KERNEL_003'?'point':'talk'):track.scene>=8?'thinking':'arms-crossed';
 if(track.actor==='patch')return speaking?(cue!.id==='S05_PATCH_002'?'talk':'point'):'tablet';
 if(track.actor==='firewall'){const serious=track.scene===4&&t>=cueById('S04_FIREWALL_007').start||track.scene===7&&t>=cueById('S07_FIREWALL_005').start||track.scene===8;return serious?(speaking?'radio':'shield-block'):(speaking?'talk':'idle');}
 if(track.actor==='vex')return track.scene>=7?'command':'idle';
 if(track.actor==='mira')return t>=blackoutAt?'relieved':'worried';
 if(track.actor==='elara')return speaking&&t-cue!.start>cue!.duration*.45?'alert':'recording';
 if(track.actor==='axiom')return speaking?'explain':'idle';return'idle';
}
export function actorFramesAt(t:number,reduced=false):ActorFrame[]{
 const shot=shotAt(t),cue=cueAt(t);
 return actorTracks.filter(a=>t>=a.start&&t<a.end&&a.scene===shot.scene).map(a=>{
  const physical=a.mode==='physical'||a.mode==='hologram';
  // A cut can exclude an actor without changing their position or arrival track.
  const covered=physical&&(shot.framing==='broadcast'||shot.framing==='crt'||shot.framing==='close'&&shot.scene!==9&&a.actor!==shot.focus||shot.framing==='insert'&&a.x<1320||shot.framing==='split'&&(shot.concept!=='none'||a.x>1100));
  const visible=!covered&&(shot.visible===undefined||shot.visible.includes(a.actor))&&(physical?a.location===shot.location:a.mode==='crt'?shot.scene===5:a.actor==='vex'?shot.framing==='broadcast':(shot.framing==='split'||shot.framing==='insert')&&shot.focus===a.actor);
  const arrival=a.entrance==='cut'||reduced?1:clamp((t-a.start)/a.arrivalDuration),exitProgress=a.exit&&!reduced?clamp(1-(a.end-t)/.8):0,ease=1-Math.pow(1-arrival,3);
  return{...a,pose:poseAt(a,t),speaking:cue?.character===a.actor,visible,arrival,exitProgress,offsetX:reduced?0:(a.entrance==='left'?-1:1)*(1-ease)*680+(a.exit==='left'?-1:1)*exitProgress*680,offsetY:reduced?0:Math.sin(t*1.9+a.actor.length)*2.5};
 });
}
export function dialoguePlacementAt(t:number,reduced=false):DialoguePlacement|undefined{
 const cue=cueAt(t);if(!cue)return;const owner=cue.character as SpeakerId,shot=shotAt(t),camera=cameraAt(shot,t,reduced),actors=actorFramesAt(t,reduced),actor=actors.find(a=>a.actor===owner&&a.visible),track=actor??actors.find(a=>a.actor===owner&&a.mode==='comms'),point=actor?(actor.x-camera.x)*camera.zoom+960:960;
 const kind=owner==='narrator'?'narration':owner==='vex'?'broadcast':actor?.mode==='crt'?'archive':track?.mode==='comms'?'comms':!actor?'offscreen':'bubble';
 return{owner,kind,actorTrackId:actor?.id,x:340,y:825,width:1240,tailX:kind==='bubble'?Math.max(380,Math.min(1540,point)):undefined,color:actorColors[owner]??'#fff'};
}
export function frameAt(t:number){const chapter=chapterAt(t);return{chapter,cue:cueAt(t),recent:scheduled.filter(c=>c.scene===chapter.id&&c.start<=t).at(-1),shot:shotAt(t),countdown:countdown(t),blackout:t>=climaxStart&&t<blackoutAt,restored:t>=blackoutAt,narrativeCut:narrativeCuts.find(c=>t>=c.time&&t<c.time+.9)};}


