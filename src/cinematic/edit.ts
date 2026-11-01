import source from '../story/production/dialogue_cues.json' with {type:'json'};
import measured from '../story/production/timing.json' with {type:'json'};
import type { NarrativeCut } from './types';

export const names:Record<string,string>={kernel:'Commander Kernel',patch:'Agent Patch',firewall:'Captain Firewall',vex:'Vex Null',mira:'Mira Vale',elara:'Dr. Elara Trace',axiom:'Auditor Axiom',narrator:'Narrator',citizen:'Citizen',technician:'Technician'};
export const cues=source.cues;
export type Cue=typeof cues[number]&{start:number;end:number;duration:number;gapAfter:number};
export const titles=['The Message','The Security Problem','The Gift','Outside the Gates','Behind the Files',"Patch’s Plan",'The Gatekeeper','The Last Packet','After the Blackout'];
export const topics=['OS City','The Security Problem','Program Threats','System & Network Threats','Consequences','Implementing Defenses','Firewalling','Coordinated Response','Historical TCSEC'];
export const locations=['OS City / Aerial','Command Central','Program District','Public Gateway','Mira’s Apartment','Command Central','Public Gateway','Multiple Locations','OS City / Dawn'];
const timing=measured as Record<string,number>;
const round=(n:number)=>Math.round(n*1000)/1000;
/** Pauses are editorial beats, never chapter-window fillers. */
export const beatsAfter:Record<string,{seconds:number;action:string}>={
 S01_NARRATOR_001:{seconds:1.25,action:'District blackout; transmission carrier opens'},
 S01_VEX_002:{seconds:1.2,action:'Hold on the threat, then cut to command'},
 S02_FIREWALL_002:{seconds:.6,action:'Kernel holds a serious reaction'},
 S02_KERNEL_004:{seconds:.18,action:'Immediate reply'},
 S02_VEX_007:{seconds:.5,action:'Transmission breaks; Kernel takes control'},
 S03_PATCH_002:{seconds:.6,action:'Updater shell opens to reveal malicious access'},
 S03_PATCH_006:{seconds:.7,action:'Virus attaches to a host; independent worm comparison'},
 S03_PATCH_007:{seconds:.7,action:'Buffer boundary bursts'},
 S03_KERNEL_008:{seconds:2.1,action:'Containment ring closes on infected program'},
 S04_VEX_004:{seconds:1.2,action:'Botnet devices pivot toward the gateway'},
 S04_FIREWALL_005:{seconds:.3,action:'Patch interrupts the joke with diagnosis'},
 S04_PATCH_006:{seconds:.45,action:'Firewall sees the scale of the flood'},
 S04_FIREWALL_007:{seconds:.8,action:'Hold serious reaction, bring up alarm bed'},
 S05_MIRA_001:{seconds:.55,action:'Patch lets the distress land'},
 S05_PATCH_002:{seconds:1.15,action:'Physical CRT spools up the recovered archive'},
 S05_ELARA_003:{seconds:.8,action:'Recording glitches and holds on Elara’s face'},
 S06_FIREWALL_006:{seconds:.45,action:'Dry reaction, no comic laughter'},
 S06_KERNEL_008:{seconds:1.4,action:'Defensive layers and protected backups engage'},
 S07_VEX_004:{seconds:.7,action:'Allowed tunnel reveals hostile payload'},
 S07_FIREWALL_005:{seconds:.35,action:'Firewall stays serious'},
 S07_FIREWALL_007:{seconds:1.1,action:'Gate strains under the flood'},
 S08_VEX_006:{seconds:.35,action:'Vex loses composure'},
 S08_PATCH_007:{seconds:.8,action:'Cut into the last ten continuous seconds'},
 S08_MIRA_008:{seconds:.35,action:'Relief with unresolved file loss'},
 S08_KERNEL_009:{seconds:.45,action:'Recovery remains incomplete'},
 S08_VEX_010:{seconds:.65,action:'Carrier falls silent'},
 S08_FIREWALL_012:{seconds:.65,action:'Relieved reaction before dawn'},
 S09_FIREWALL_005:{seconds:.35,action:'Kernel’s dry reply'},
 S09_KERNEL_006:{seconds:1.0,action:'The team returns to work'},
};
const intros=[3,1.2,1.5,1.4,1.6,1.2,1.6,1.0,2];
const outros=[.5,.75,0,1,.7,.6,.4,1.2,4];
export const scheduled:Cue[]=[];
export const chapters:{id:number;title:string;topic:string;location:string;start:number;end:number}[]=[];
let cursor=0;let lastTenStart=0;
for(let scene=1;scene<=9;scene++){
 const start=cursor;cursor+=intros[scene-1];
 for(const c of cues.filter(c=>c.scene===scene)){
  if(c.id==='S08_MIRA_008'){lastTenStart=cursor;cursor+=10;}
  const duration=timing[c.id]??Math.max(1.2,c.spoken_text.split(/\s+/).length/2.7);
  const gapAfter=beatsAfter[c.id]?.seconds??(c.character==='narrator'?.4:.24);
  scheduled.push({...c,start:round(cursor),end:round(cursor+duration),duration,gapAfter});cursor+=duration+gapAfter;
 }
 cursor+=outros[scene-1];chapters.push({id:scene,title:titles[scene-1],topic:topics[scene-1],location:locations[scene-1],start:round(start),end:round(cursor)});
}
export const climaxStart=round(lastTenStart);
export const blackoutAt=round(climaxStart+10);
export const duration=round(cursor);
export const countdownStart=chapters[1].start;
const ellipsis=480-(blackoutAt-countdownStart);
if(ellipsis<0)throw new Error('Locked audio exceeds the fictional countdown window; an editorial timing decision is required.');
const cutWeights=[.16,.22,.14,.12,.18,.12,.06];
export const narrativeCuts:NarrativeCut[]=[...chapters.slice(2,8).map((c,i)=>({time:c.start,skip:ellipsis*cutWeights[i],label:c.location})),{time:climaxStart,skip:ellipsis*cutWeights[6],label:'The last ten seconds'}];
export function countdown(t:number){if(t<countdownStart)return 480;if(t>=blackoutAt)return 0;return Math.max(0,Math.ceil(480-(t-countdownStart)-narrativeCuts.filter(c=>c.time<=t).reduce((sum,c)=>sum+c.skip,0)-1e-7));}
export function cueAt(t:number){return scheduled.find(c=>t>=c.start&&t<c.end);}
export function cueById(id:string){const c=scheduled.find(c=>c.id===id);if(!c)throw Error(`Unknown cue ${id}`);return c;}
export function chapterAt(t:number){return chapters.find(c=>t>=c.start&&t<c.end)??(t<0?chapters[0]:chapters.at(-1)!);}
