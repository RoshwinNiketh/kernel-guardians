import {test,expect} from '@playwright/test';
import {scheduled,chapters,duration} from '../src/story/production/timeline';
test('all 65 local voices, chapter frames, exact seek, pause and rate',async({page})=>{
 test.setTimeout(180000);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{const starts:{offset:number;rate:number}[]=[];(window as any).__starts=starts;const original=AudioBufferSourceNode.prototype.start;AudioBufferSourceNode.prototype.start=function(when=0,offset=0,dur?:number){starts.push({offset,rate:this.playbackRate.value});return dur===undefined?original.call(this,when,offset):original.call(this,when,offset,dur);};});
 await page.setViewportSize({width:1440,height:900});await page.goto('/');await page.getByRole('button',{name:'START STORY'}).click();
 await expect(page.getByText('Local narration · 65 cues',{exact:true})).toBeVisible({timeout:30000});
 await page.getByRole('button',{name:'Pause',exact:true}).click();
 const slider=page.getByRole('slider',{name:'Story timeline'});
 for(const c of scheduled){await slider.fill(String(Number((c.start+.2).toFixed(3))));await expect(page.locator('.full-story')).toHaveAttribute('data-cue',c.id);await page.getByRole('button',{name:'Play',exact:true}).click();await page.waitForTimeout(45);await page.getByRole('button',{name:'Pause',exact:true}).click();}
 for(const scene of chapters){const cue=scheduled.find(c=>c.scene===scene.id)!;await slider.fill(String(Number((cue.start+.7).toFixed(3))));await page.screenshot({path:`docs/verification/full-scene-${scene.id}.png`});}
 await slider.fill('250.123');await page.getByRole('button',{name:'Open settings and pause'}).click();const frame=await page.locator('.full-story').getAttribute('data-time');await page.waitForTimeout(200);await expect(page.locator('.full-story')).toHaveAttribute('data-time',frame!);
 await page.getByRole('combobox',{name:'Playback speed'}).selectOption('1.25');await page.getByLabel('narration volume').fill('30');await page.getByRole('button',{name:'Resume story'}).click();await page.getByRole('button',{name:'Play',exact:true}).click();await page.waitForTimeout(100);await page.getByRole('button',{name:'Pause',exact:true}).click();
 expect(await page.evaluate(()=>(window as any).__starts.some((s:any)=>s.rate===1.25))).toBe(true);
 for(const t of [485,490,494.9]){await slider.fill(String(t));await expect(page.locator('.climax')).toBeVisible();await expect(page.locator('.full-story')).toHaveAttribute('data-cue','');}
 await slider.fill('495');await expect(page.locator('.scene-foot')).toContainText('Essential services available');
 await slider.fill(String(duration));await expect(page.getByRole('button',{name:'Replay story'})).toBeVisible();expect(errors).toEqual([]);
 console.log('Verified full duration',duration,'cues',scheduled.length,'audio starts',await page.evaluate(()=>(window as any).__starts.length));
});
test('full story missing-audio fallback and portrait subtitles',async({page})=>{
 await page.route('**/local-voices/**',route=>route.fulfill({status:404,body:'Missing private audio'}));await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:'START STORY'}).click();await expect(page.getByText('Captions fallback: 65 voice files unavailable',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Pause',exact:true}).click();await page.getByRole('slider',{name:'Story timeline'}).fill(String(Number((scheduled[20].start+.4).toFixed(3))));await expect(page.locator('.mobile-story')).toContainText(scheduled[20].spoken_text);await page.screenshot({path:'docs/verification/full-mobile.png'});
});



