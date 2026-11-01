import {chapters,scheduled,climaxStart,blackoutAt,cueById} from './edit.ts';
import soundAssets from './sound-assets.json' with {type:'json'};
import type {SoundCue} from './types';
export interface MixCue extends SoundCue {file:string}
export const soundCues:MixCue[]=[];
const assets=soundAssets as Record<string,{file:string;duration:number}>;
const scores=['city','investigation','investigation','pressure','empathy','investigation','pressure','response','dawn'];
const spaces=['city','room','city','gateway','apartment','room','gateway','room','dawn'];
for(const c of chapters){
 soundCues.push({id:`score-${c.id}`,kind:'score',file:assets[`score-${scores[c.id-1]}`].file,start:c.start,end:c.end,gain:1,bus:'music',loop:true,duck:true});
 soundCues.push({id:`ambience-${c.id}`,kind:spaces[c.id-1] as SoundCue['kind'],file:assets[spaces[c.id-1]].file,start:c.start,end:c.end,gain:.58,bus:'sfx',loop:true,duck:true});
}
function event(id:string,kind:SoundCue['kind'],t:number,gain=.6,pan=0){const asset=assets[kind];soundCues.push({id,kind,file:asset.file,start:Math.max(0,t),end:Math.max(0,t)+asset.duration,gain,bus:'sfx',pan,duck:kind!=='tick'});}
for(const c of scheduled){
 if(c.character==='vex'){event(`${c.id}-carrier`,'intrusion',c.start-.35,.6,-.15);event(`${c.id}-carrier-end`,'message',c.end,.25,.1);}
 if(c.id==='S05_ELARA_003'){event('archive-start','crt',c.start-.8,.6,.25);event('archive-corruption','static',c.start+c.duration*.5,.24,.25);event('archive-stop','static',c.end,.32,.25);}
}
const authored:[string,SoundCue['kind'],number,number][]=[
 ['S02_PATCH_003','scan',.2,.35],['S02_PATCH_005','scan',3.2,.25],['S03_MIRA_001','click',.3,.4],['S03_PATCH_002','lock',2.8,.5],['S03_NARRATOR_005','lock',4.8,.4],['S03_PATCH_006','scan',.8,.3],['S03_PATCH_007','impact',4,.42],['S03_KERNEL_008','contain',4.4,.6],
 ['S04_PATCH_001','scan',.1,.35],['S04_FIREWALL_005','flood',1.5,.4],['S04_FIREWALL_007','alarm',.3,.35],['S05_MIRA_001','lock',.2,.3],['S06_PATCH_003','contain',1.8,.42],['S06_PATCH_005','scan',2.4,.25],['S06_PATCH_007','message',.5,.2],['S07_FIREWALL_001','gate',.1,.6],['S07_VEX_004','lock',2.1,.25],['S07_FIREWALL_005','flood',.6,.45],['S08_KERNEL_003','click',1,.35],['S08_NARRATOR_005','contain',2.5,.4],['S09_AXIOM_002','scan',.1,.2],
 ];
for(const[id,kind,offset,gain]of authored){const c=cueById(id);event(`${id}-${kind}`,kind,Math.min(c.end-.1,c.start+offset),gain);}
event('opening-district-blackout','impact',8.1,.5,-.4);
event('final-gate-strain','gate',climaxStart,.6,-.3);event('final-isolation','contain',climaxStart+3.4,.6,.3);event('final-transfer','scan',climaxStart+7,.5,.2);
for(let i=0;i<10;i++)event(`last-tick-${i}`,'tick',climaxStart+i,.35+i*.02);
event('essential-services-restored','restore',blackoutAt,.55,.1);
soundCues.sort((a,b)=>a.start-b.start);
export function mixEnvelope(c:MixCue,t:number,voiceActive:boolean){const fade=Math.min(1,Math.max(0,(t-c.start)/.05),Math.max(0,(c.end-t)/.12));const duck=c.duck&&voiceActive?(c.bus==='music'?.23:.45):1;return c.gain*fade*duck;}
