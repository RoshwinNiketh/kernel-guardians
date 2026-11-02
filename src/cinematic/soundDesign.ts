import {chapters,scheduled,climaxStart,blackoutAt,cueById,duration} from './edit.ts';
import {shots} from './director.ts';
import soundAssets from './sound-assets.json' with {type:'json'};
import type {SoundCue} from './types';
export interface MixCue extends SoundCue {file:string;purpose?:string}
export const soundCues:MixCue[]=[];
const assets=soundAssets as Record<string,{file:string;duration:number}>;
function score(id:string,name:string,start:number,end:number,gain:number,purpose:string){
 if(end-start>assets[`score-${name}`].duration)throw Error(`Score too short: ${id}`);
 soundCues.push({id,kind:'score',file:assets[`score-${name}`].file,start,end,gain,bus:'music',duck:true,purpose});
}
const c=cueById;
// Finite musical phrases. No chapter-wide looping and no music in the archive.
score('score-opening','city',0,c('S01_VEX_002').end+.4,.75,'Ordinary city interrupted by a threat');
score('score-first-intrusion','pressure',c('S02_VEX_007').start-.65,chapters[1].end,.58,'Threat interrupts command');
score('score-deceptive-gift','investigation',chapters[2].start,c('S03_KERNEL_004').end+.25,.55,'Deceptive update and payload reveal');
score('score-botnet-reveal','pressure',c('S04_VEX_004').start-.5,c('S04_FIREWALL_007').start-.2,.65,'Traffic grows; drop to room tone for the serious realization');
score('score-containment','investigation',c('S06_PATCH_003').start,c('S06_PATCH_003').end+.4,.48,'First coordinated defensive action');
score('score-permitted-danger','pressure',c('S07_VEX_004').start-.5,c('S07_FIREWALL_005').end+.3,.55,'Danger inside an allowed path');
score('score-internal-threat','pressure',chapters[7].start,c('S08_PATCH_002').end+.2,.6,'Internal compromise becomes clear');
score('score-last-response','response',c('S08_VEX_006').start-.35,blackoutAt-.22,.82,'Final response builds, then cuts with the blackout');
score('score-city-survives','dawn',c('S09_NARRATOR_004').start-.3,duration,.62,'Restrained recovery; no instant-victory fanfare');

// Ambience follows the physical shot location, including the gateway cross-cuts.
const roomFor={city:'city',street:'city',command:'room',gateway:'gateway',apartment:'apartment',dawn:'dawn'};
const runs:{file:string;start:number;end:number}[]=[];
for(const shot of shots){const file=roomFor[shot.location];const previous=runs.at(-1);if(previous?.file===file&&Math.abs(previous.end-shot.start)<.002)previous.end=shot.end;else runs.push({file,start:shot.start,end:shot.end});}
for(const [i,run]of runs.entries()){
 const segments=run.start<blackoutAt+.35&&run.end>blackoutAt-.22?[[run.start,Math.min(run.end,blackoutAt-.22)],[Math.max(run.start,blackoutAt+.35),run.end]]:[[run.start,run.end]];
 for(const [j,[start,end]]of segments.entries())if(end>start)soundCues.push({id:`ambience-${i}-${j}`,kind:run.file as SoundCue['kind'],file:assets[run.file].file,start,end,gain:run.file==='apartment'?.2:.3,bus:'sfx',loop:true,duck:true,purpose:`Physical ${run.file} room tone`});
}
function event(id:string,kind:SoundCue['kind'],time:number,gain:number,pan=0,purpose=''){
 const start=Math.max(0,time);soundCues.push({id,kind,file:assets[kind].file,start,end:start+assets[kind].duration,gain,bus:'sfx',pan,duck:true,purpose});
}
for(const cue of scheduled.filter(q=>q.character==='vex'))event(`${cue.id}-carrier`,'intrusion',cue.start-.35,.37,-.1,'Incoming public carrier; avoid a notification after every sentence');
event('district-power-loss','impact',7,.35,-.35,'Visible district outage begins');
event('cia-integrity','scan',c('S02_PATCH_005').start+c('S02_PATCH_005').duration/3,.18,.05,'Second CIA pillar illuminates');
event('cia-availability','scan',c('S02_PATCH_005').start+c('S02_PATCH_005').duration*2/3,.16,.2,'Third CIA pillar illuminates');
event('updater-install','click',c('S03_MIRA_001').start+.3,.26,-.2,'Updater action');
event('payload-reveal','lock',c('S03_PATCH_002').start+c('S03_PATCH_002').duration/3,.3,-.1,'Malicious payload is revealed');
event('buffer-boundary-break','impact',c('S03_PATCH_007').start+c('S03_PATCH_007').duration*2/3,.27,-.15,'First cell beyond the seven-cell boundary fills');
event('isolate-program','contain',c('S03_KERNEL_008').end+.15,.38,.1,'Containment after the instruction');
event('service-scan','scan',c('S04_PATCH_001').start,.22,-.2,'Port scan begins');
event('traffic-surge','flood',c('S04_FIREWALL_005').end-.8,.36,-.25,'Traffic gathers before Patch diagnoses the flood');
const archive=c('S05_ELARA_003');
event('archive-discovered','message',archive.start-1.85,.2,.35,'LOCAL ARCHIVE DETECTED appears on existing TV');
event('archive-start','crt',archive.start-1.05,.4,.35,'CRT powers on at the exact screen boot');
event('service-isolation','contain',c('S06_PATCH_003').start+1.8,.3,.1,'Isolation control engages');
event('gate-filter-engage','gate',c('S07_FIREWALL_001').start,.35,-.3,'Gate establishes its filtering boundary');
event('concealed-traffic','flood',c('S07_FIREWALL_005').start+.6,.24,-.25,'Traffic remains dangerous despite permitted connection');
event('final-gate-strain','gate',climaxStart,.48,-.35,'Cut to Firewall holding the gate');
event('final-isolation','contain',climaxStart+3.2,.42,.25,'Exact cut to Patch isolating the service');
event('final-transfer','scan',climaxStart+6.8,.28,-.1,'Exact cut to standby preparation');
for(let i=0;i<10;i++)event(`last-tick-${i}`,'tick',climaxStart+i,.22+i*.012,0,'One tick per displayed countdown second');
event('essential-services-restored','restore',blackoutAt+.12,.26,.1,'Small relay confirmation; recovery is incomplete');
soundCues.sort((a,b)=>a.start-b.start);
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
/** Playhead-derived anticipation, hold and release: small dialogue gaps never pump. */
export function speechActivityAt(t:number){let activity=0;for(const cue of scheduled){if(t<cue.start-.12||t>cue.end+.85)continue;const a=t<cue.start?clamp((t-cue.start+.12)/.12):t<=cue.end+.15?1:clamp(1-(t-cue.end-.15)/.7);activity=Math.max(activity,a);}return activity;}
export function mixEnvelope(c:MixCue,t:number,_voiceActive?:boolean){
 const attack=c.bus==='music'?1.2:c.loop?.7:.006,release=c.bus==='music'?1.8:c.loop?.5:.05;
 const fade=Math.min(clamp((t-c.start)/attack),clamp((c.end-t)/release));
 const duck=c.duck?1-speechActivityAt(t)*(c.bus==='music'?.78:.48):1;
 // The brief visible blackout is a deliberate effects/score dropout, never a voice cut.
 const blackout=t>=blackoutAt-.22&&t<blackoutAt+.12?0:1;
 return c.gain*fade*duck*blackout;
}
