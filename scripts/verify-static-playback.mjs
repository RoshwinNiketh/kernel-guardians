import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {scheduled} from '../src/story/production/timeline.ts';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage();
 await page.addInitScript(()=>{window.__starts=[];const original=AudioBufferSourceNode.prototype.start;AudioBufferSourceNode.prototype.start=function(...args){window.__starts.push({id:this.kgCueId,bus:this.kgBus});return original.apply(this,args);};});
 await page.goto(process.env.KG_VERIFY_URL??'http://127.0.0.1:5186/');
 await page.getByRole('button',{name:'START STORY'}).click();
 await page.getByText('Local narration · 66 cues',{exact:true}).waitFor({timeout:45000});
 await page.getByRole('button',{name:'Pause',exact:true}).click();
 for(const cue of scheduled){await page.getByRole('slider',{name:'Story timeline'}).fill(String(Number((26+cue.start+.2).toFixed(3))));await page.getByRole('button',{name:'Play',exact:true}).click();await page.waitForTimeout(50);await page.getByRole('button',{name:'Pause',exact:true}).click();}
 const starts=await page.evaluate(()=>window.__starts);
 assert.equal(new Set(starts.filter(s=>s.bus==='voice').map(s=>s.id)).size,66);
 assert(starts.some(s=>s.bus==='music'));assert(starts.some(s=>s.bus==='sfx'));
 console.log('Static production playback verified: all 66 narration sources, BGM and SFX.');
}finally{await browser.close();}
