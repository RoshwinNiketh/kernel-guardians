import {test,expect} from '@playwright/test';
import {duration} from '../src/story/production/timeline';
test('uninterrupted full narrated story at 1.25x',async({page})=>{
 test.skip(!process.env.KG_FULL_PLAYBACK,'Opt-in real-time full narration check');test.setTimeout(600000);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{(window as any).__seenCues=new Set<string>();new MutationObserver(()=>{const id=document.querySelector('.full-story')?.getAttribute('data-cue');if(id)(window as any).__seenCues.add(id);}).observe(document,{subtree:true,attributes:true,childList:true});});
 await page.goto('/');await page.getByRole('button',{name:'Settings',exact:true}).click();await page.getByRole('combobox',{name:'Playback speed'}).selectOption('1.25');await page.getByRole('button',{name:'Done',exact:true}).click();await page.getByRole('button',{name:'START STORY'}).click();await expect(page.getByText('Local narration · 66 cues',{exact:true})).toBeVisible();
 let previous=0;
 while(!(await page.getByRole('button',{name:'Replay story'}).isVisible())){await page.waitForTimeout(30000);const time=Number(await page.locator('.full-story').getAttribute('data-time'));expect(time).toBeGreaterThan(previous);previous=time;console.log('Continuous playback',time,'/',duration);}
 expect(await page.evaluate(()=>(window as any).__seenCues.size)).toBe(66);expect(errors).toEqual([]);await page.screenshot({path:'docs/verification/cinematic/full-complete.png'});
});
