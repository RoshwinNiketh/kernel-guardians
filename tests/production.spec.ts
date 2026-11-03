import {test,expect,type Page} from '@playwright/test';
import {scheduled,chapters,duration,climaxStart,blackoutAt} from '../src/story/production/timeline';
const readAudio=(page:Page)=>page.evaluate(()=>(window as any).__KG.audio);
const seek=async(page:Page,t:number)=>page.getByRole('slider',{name:'Story timeline'}).fill(String(Number((t+30).toFixed(3))));
async function start(page:Page){await page.goto('/');await page.getByRole('button',{name:'START STORY'}).click();await expect(page.getByText('Full narration · 66 cues',{exact:true})).toBeVisible({timeout:45000});await page.getByRole('button',{name:'Pause',exact:true}).click();}

test('all 66 dialogue cues, exact speaker ownership, pause, seek, mix and rate',async({page})=>{
 test.setTimeout(180000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{const starts:{id:string;bus:string;offset:number;rate:number}[]=[];(window as any).__starts=starts;const original=AudioBufferSourceNode.prototype.start;AudioBufferSourceNode.prototype.start=function(when=0,offset=0,dur?:number){starts.push({id:(this as any).kgCueId,bus:(this as any).kgBus,offset,rate:this.playbackRate.value});return dur===undefined?original.call(this,when,offset):original.call(this,when,offset,dur);};});
 await page.setViewportSize({width:1440,height:900});await start(page);
 const initial=await readAudio(page);expect(initial.loadedTracks.sort()).toEqual(['music','sfx','voice']);
 for(const c of scheduled){
  await seek(page,c.start+.2);const caption=page.locator('.cine-dialogue');await expect(page.locator('.full-story')).toHaveAttribute('data-cue',c.id);await expect(caption).toHaveAttribute('data-speaker',c.character);await expect(caption.locator('p')).toHaveText(c.spoken_text);
  const track=await caption.getAttribute('data-owner-track');if(track){const actor=page.locator(`[data-track="${track}"]`);await expect(actor).toHaveAttribute('data-actor',c.character);await expect(actor).toHaveAttribute('data-speaking','true');await expect(actor.locator('img').first()).toBeVisible();}
  if(c.character==='narrator')await expect(page.locator('[data-actor="vex"]:visible')).toHaveCount(0);
  await page.getByRole('button',{name:'Play',exact:true}).click();await page.waitForTimeout(66);const playing=await readAudio(page);expect(playing.active).toHaveLength(3);expect(await page.evaluate(offset=>(window as any).__starts.filter((s:any)=>s.id?.startsWith('stem:')).slice(-3).every((s:any)=>Math.abs(s.offset-offset)<.004),30+c.start+.2)).toBe(true);await page.getByRole('button',{name:'Pause',exact:true}).click();expect((await readAudio(page)).active).toEqual([]);
 }
 for(const scene of chapters){const cue=scheduled.find(c=>c.scene===scene.id)!;await seek(page,cue.start+.7);await page.screenshot({path:`.local-media/review/scene-${scene.id}.png`});}
 await seek(page,scheduled.find(c=>c.id==='S03_PATCH_002')!.start+1);await page.getByRole('button',{name:'Play',exact:true}).click();await page.waitForTimeout(80);await page.getByRole('button',{name:'Open settings and pause'}).click();
 const paused=await page.locator('.full-story').getAttribute('data-time'),camera=await page.locator('.cine-world').getAttribute('style');await page.waitForTimeout(220);await expect(page.locator('.full-story')).toHaveAttribute('data-time',paused!);await expect(page.locator('.cine-world')).toHaveAttribute('style',camera!);expect((await readAudio(page)).active).toEqual([]);
 await page.getByRole('combobox',{name:'Playback speed'}).selectOption('1.25');await page.getByLabel('narration volume').fill('30');await page.getByLabel('music volume').fill('20');await page.getByLabel('sfx volume').fill('40');await page.getByRole('button',{name:'Resume story'}).click();await page.waitForTimeout(80);
 const mixed=await readAudio(page);expect(mixed.rate).toBe(1.25);expect(mixed.voiceGain).toBeCloseTo(.3);expect(mixed.musicGain).toBeCloseTo(.2);expect(mixed.sfxGain).toBeCloseTo(.4);expect(mixed.active.map((s:any)=>s.bus)).toEqual(expect.arrayContaining(['voice','music','sfx']));
 await page.getByRole('button',{name:'Mute all audio'}).click();expect((await readAudio(page)).masterGain).toBe(0);await page.getByRole('button',{name:'Unmute all audio'}).click();expect((await readAudio(page)).masterGain).toBeCloseTo(.88);
 await page.getByRole('button',{name:'Pause',exact:true}).click();await seek(page,100.123);await page.getByRole('button',{name:'Forward 5 seconds'}).click();await expect(page.locator('.full-story')).toHaveAttribute('data-time','105.123');await page.getByRole('button',{name:'Rewind 5 seconds'}).click();await expect(page.locator('.full-story')).toHaveAttribute('data-time','100.123');
 for(const t of [climaxStart+.02,climaxStart+5,blackoutAt-.1]){await seek(page,t);await expect(page.locator('.final-ten-counter')).toBeVisible();await expect(page.locator('.full-story')).toHaveAttribute('data-cue','');}
 await seek(page,blackoutAt+.01);await expect(page.locator('.scene-foot')).toContainText('Essential services available');await page.getByRole('button',{name:'Play',exact:true}).click();await page.waitForTimeout(60);expect((await readAudio(page)).active.some((s:any)=>s.id.startsWith('last-tick-'))).toBe(false);await page.getByRole('button',{name:'Pause',exact:true}).click();
 await seek(page,duration);await expect(page.getByRole('button',{name:'Replay story'})).toBeVisible();expect(errors).toEqual([]);
 console.log('Verified cinematic duration',duration,'all 66 cue timestamps and three synchronized stems');
});

test('persistent staging, in-place pose swaps, CRT mask, four-character ensemble and deterministic seeking',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await start(page);const first=scheduled.find(c=>c.id==='S02_KERNEL_001')!,reply=scheduled.find(c=>c.id==='S02_PATCH_003')!;
 await seek(page,first.start+.5);const kernel=page.locator('.cine-actor[data-track="scene-2-kernel-physical"]');await kernel.evaluate(el=>{(el as any).__continuityMarker='same-node';});const x=await kernel.getAttribute('data-world-x'),foot=await kernel.getAttribute('data-foot-y');await expect(kernel).toHaveAttribute('data-arrival','1.000');
 await seek(page,reply.start+.5);await expect(kernel).toHaveAttribute('data-world-x',x!);await expect(kernel).toHaveAttribute('data-foot-y',foot!);await expect(kernel).toHaveAttribute('data-arrival','1.000');expect(await kernel.evaluate(el=>(el as any).__continuityMarker)).toBe('same-node');await expect(kernel).toHaveAttribute('data-pose','arms-crossed');await expect(page.locator('.cine-dialogue')).toHaveAttribute('data-speaker','patch');
 const archive=scheduled.find(c=>c.character==='elara')!;await seek(page,archive.start+1);await expect(page.locator('[data-actor="elara"]')).toHaveAttribute('data-mode','crt');await expect(page.locator('.archive-tv .tv-glass .archive-portrait')).toBeVisible();const tv=await page.locator('.archive-tv').boundingBox(),glass=await page.locator('.tv-glass').boundingBox();expect(glass!.x).toBeGreaterThan(tv!.x);expect(glass!.x+glass!.width).toBeLessThan(tv!.x+tv!.width);expect(await page.locator('.tv-glass').evaluate(el=>getComputedStyle(el).overflow)).toBe('hidden');
 const dawn=scheduled.find(c=>c.id==='S09_AXIOM_001')!;await seek(page,dawn.start+1);const visible=await page.locator('.cine-actor[data-visible="true"]').evaluateAll(els=>els.map(el=>el.getAttribute('data-actor')));expect(visible).toEqual(expect.arrayContaining(['kernel','patch','firewall','axiom']));
 await seek(page,first.start+.5);const expected=await page.locator('.cinematic-stage').innerHTML();await seek(page,400);await seek(page,first.start+.5);expect(await page.locator('.cinematic-stage').innerHTML()).toBe(expected);
});

test('portrait subtitles stay readable with the full soundtrack',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.emulateMedia({reducedMotion:'reduce'});
 await start(page);
 await seek(page,scheduled[20].start+.4);
 await expect(page.locator('.mobile-story')).toContainText(scheduled[20].spoken_text);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('slow and failed audio holds the stage, then retries only the missing track',async({page})=>{
 const requests:string[]=[];
 let release!:()=>void;
 const held=new Promise<void>(resolve=>{release=resolve;});
 await page.route(/\.m4a(?:\?|$)/,async route=>{
  if(route.request().resourceType()!=='fetch') return route.continue();
  const url=route.request().url();
  requests.push(url);
  if(url.includes('/sfx')&&requests.filter(path=>path===url).length===1){
   await held;
   await route.fulfill({status:503,body:'Temporary audio failure'});
  }else await route.continue();
 });
 await page.goto('/');
 await page.getByRole('button',{name:'START STORY'}).click();
 try {
  await expect(page.getByRole('status')).toHaveText('Preparing soundtrack… 2 of 3 tracks ready');
  await expect(page.locator('.cast-intro')).toHaveCount(0);
  await expect(page.getByRole('slider',{name:'Story timeline'})).toHaveCount(0);
 } finally { release(); }
 await expect(page.getByRole('alert')).toContainText('All three audio tracks');
 await expect(page.locator('.cast-intro')).toHaveCount(0);
 await page.getByRole('button',{name:'Retry audio'}).click();
 await expect(page.getByText('Full narration · 66 cues')).toBeVisible();
 expect(requests).toHaveLength(4);
 expect(new Set(requests).size).toBe(3);
});

test('only current edition is served and the archive is discovered on an existing TV',async({page})=>{
 await page.goto('/?pilot=1&edition=v1');await expect(page.getByRole('link',{name:'Original pilot'})).toHaveCount(0);await expect(page.getByRole('link',{name:'Previous build'})).toHaveCount(0);await page.getByRole('button',{name:'START STORY'}).click();await expect(page.getByText('Full narration · 66 cues',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Pause',exact:true}).click();
 const patch=scheduled.find(c=>c.id==='S02_PATCH_000')!,firewall=scheduled.find(c=>c.id==='S02_FIREWALL_002')!;expect(patch.end).toBeLessThan(firewall.start);await seek(page,patch.start+.2);await expect(page.locator('.cine-dialogue')).toHaveAttribute('data-speaker','patch');await expect(page.locator('.cine-dialogue p')).toHaveText('Eight minutes.');
 await seek(page,chapters[4].start+.2);await expect(page.locator('.tv-housing')).toBeVisible();await expect(page.locator('.archive-dormant')).toHaveText('STANDBY');await expect(page.locator('.archive-portrait')).toHaveCount(0);const elara=scheduled.find(c=>c.character==='elara')!;await seek(page,elara.start-1.4);await expect(page.locator('.archive-dormant')).toHaveText('LOCAL ARCHIVE DETECTED');await seek(page,elara.start+.2);await expect(page.locator('.archive-portrait')).toBeVisible();
});

