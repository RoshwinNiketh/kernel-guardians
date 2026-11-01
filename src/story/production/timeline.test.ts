import {expect,it} from 'vitest';
import {scheduled,chapters,countdown,duration,frameAt,cues} from './timeline';
it('preserves all 65 locked cues, nine chapters, no overlapping speech',()=>{
 expect(scheduled).toHaveLength(65);expect(chapters).toHaveLength(9);
 expect(new Set(scheduled.map(c=>c.id)).size).toBe(65);
 for(let i=0;i<scheduled.length;i++){expect(scheduled[i].spoken_text).toBe(cues[i].spoken_text);if(i)expect(scheduled[i].start).toBeGreaterThanOrEqual(scheduled[i-1].end);}
 expect(duration).toBeGreaterThan(300);expect(duration).toBeLessThanOrEqual(600);
});
it('derives countdown and silent climax from the master clock',()=>{
 expect(countdown(0)).toBe(480);expect(countdown(15)).toBe(480);expect(countdown(485)).toBe(10);expect(countdown(495)).toBe(0);expect(countdown(550)).toBe(0);
 for(let t=485;t<495;t+=.2)expect(frameAt(t).cue).toBeUndefined();
 expect(frameAt(495).restored).toBe(true);
});
it('reconstructs scenes deterministically after arbitrary seeks',()=>{
 const expected=frameAt(250);frameAt(500);frameAt(1);expect(frameAt(250)).toEqual(expected);
});
