import {expect,it} from 'vitest';
import {scheduled,chapters,countdown,duration,frameAt,cues,climaxStart,blackoutAt,countdownStart,narrativeCuts} from './timeline';
it('preserves all 66 locked cues, nine chapters, no overlapping speech',()=>{
 expect(scheduled).toHaveLength(66);expect(chapters).toHaveLength(9);
 expect(new Set(scheduled.map(c=>c.id)).size).toBe(66);
 for(let i=0;i<scheduled.length;i++){expect(scheduled[i].spoken_text).toBe(cues[i].spoken_text);if(i)expect(scheduled[i].start).toBeGreaterThanOrEqual(scheduled[i-1].end);}
 expect(duration).toBeGreaterThan(300);expect(duration).toBeLessThanOrEqual(600);
});
it('derives countdown and silent climax from the master clock',()=>{
 expect(countdown(0)).toBe(480);expect(countdown(countdownStart)).toBe(480);expect(countdown(climaxStart)).toBe(10);expect(countdown(blackoutAt)).toBe(0);expect(countdown(duration)).toBe(0);
 for(let t=climaxStart;t<blackoutAt;t+=.2)expect(frameAt(t).cue).toBeUndefined();
 expect(blackoutAt-climaxStart).toBeCloseTo(10,6);expect(frameAt(blackoutAt).restored).toBe(true);
 for(let t=countdownStart+.25;t<blackoutAt;t+=.25){const drop=countdown(t-.25)-countdown(t);expect(drop).toBeGreaterThanOrEqual(0);if(!narrativeCuts.some(c=>c.time>t-.25&&c.time<=t))expect(drop).toBeLessThanOrEqual(1);}
});
it('reconstructs scenes deterministically after arbitrary seeks',()=>{
 const expected=frameAt(250);frameAt(500);frameAt(1);expect(frameAt(250)).toEqual(expected);
});
