import {it,expect} from 'vitest';
import {soundCues,mixEnvelope} from './soundDesign';
import {climaxStart,blackoutAt,chapters} from './edit';
it('covers all nine locations with score and ambience, and authors the final ten seconds',()=>{
 expect(soundCues.filter(c=>c.bus==='music')).toHaveLength(9);
 for(const chapter of chapters){expect(soundCues.some(c=>c.loop&&c.bus==='sfx'&&c.start===chapter.start&&c.end===chapter.end)).toBe(true);}
 expect(soundCues.filter(c=>c.kind==='tick').map(c=>c.start)).toEqual(Array.from({length:10},(_,i)=>climaxStart+i));
 expect(soundCues.find(c=>c.kind==='restore')?.start).toBe(blackoutAt);
 const music=soundCues.find(c=>c.bus==='music')!,middle=(music.start+music.end)/2;expect(mixEnvelope(music,middle,true)).toBeLessThan(mixEnvelope(music,middle,false));expect(mixEnvelope(music,music.start,false)).toBe(0);expect(mixEnvelope(music,music.end,false)).toBe(0);
});
