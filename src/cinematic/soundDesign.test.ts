import {it,expect} from 'vitest';
import {soundCues,mixEnvelope,speechActivityAt} from './soundDesign';
import {climaxStart,blackoutAt,chapters,cueById,scheduled,duration} from './edit';
it('leaves distress, archive and teaching unscored, with finite music below half the film',()=>{
 const music=soundCues.filter(c=>c.bus==='music');expect(music.every(c=>!c.loop)).toBe(true);expect(music.reduce((s,c)=>s+c.end-c.start,0)).toBeLessThan(duration*.5);
 for(const id of ['S05_MIRA_001','S05_ELARA_003','S03_PATCH_006','S09_AXIOM_002','S04_FIREWALL_007']){const cue=cueById(id);expect(music.filter(c=>c.start<cue.end&&c.end>cue.start)).toHaveLength(0);}
 expect(soundCues.filter(c=>c.loop).length).toBeGreaterThanOrEqual(chapters.length);
});
it('hits the CRT boot, buffer overflow and final action cuts exactly',()=>{
 const buffer=cueById('S03_PATCH_007');expect(soundCues.find(c=>c.id==='buffer-boundary-break')?.start).toBeCloseTo(buffer.start+buffer.duration*2/3);
 expect(soundCues.find(c=>c.id==='archive-start')?.start).toBe(cueById('S05_ELARA_003').start-1.05);
 expect(soundCues.filter(c=>c.kind==='tick').map(c=>c.start)).toEqual(Array.from({length:10},(_,i)=>climaxStart+i));
 const music=soundCues.find(c=>c.id==='score-last-response')!;expect(mixEnvelope(music,blackoutAt-.1)).toBe(0);
});
it('anticipates speech, holds through short gaps and reconstructs ducking after seeking',()=>{
 const opening=cueById('S01_NARRATOR_001');expect(speechActivityAt(opening.start-.06)).toBeCloseTo(.5);const cue=cueById('S02_PATCH_000'),next=scheduled[scheduled.indexOf(cue)+1];expect(speechActivityAt((cue.end+next.start)/2)).toBeGreaterThan(.8);
 const music=soundCues.find(c=>c.id==='score-opening')!;const t=5.2,expected=mixEnvelope(music,t);mixEnvelope(music,400);expect(mixEnvelope(music,t)).toBe(expected);expect(mixEnvelope(music,music.start)).toBe(0);expect(mixEnvelope(music,music.end)).toBe(0);
});
