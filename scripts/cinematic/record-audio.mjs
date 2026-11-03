import {chromium} from '@playwright/test';
import {writeFileSync} from 'node:fs';
import {scheduled,blackoutAt} from '../../src/cinematic/edit.ts';
const c=id=>scheduled.find(c=>c.id===id);
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage();
 await page.addInitScript(()=>{const connect=AudioNode.prototype.connect;AudioNode.prototype.connect=function(destination,...args){if(destination instanceof AudioDestinationNode){const tap=this.context.createMediaStreamDestination();connect.call(this,tap);window.__audioTap=tap;}return connect.call(this,destination,...args);};});
 await page.goto(`http://127.0.0.1:${process.env.KG_PORT??'5183'}/`);await page.getByRole('button',{name:'START STORY'}).click();await page.getByText('Full narration · 66 cues',{exact:true}).waitFor();await page.getByRole('button',{name:'Pause',exact:true}).click();
 for(const [name,start,end]of [
 ['firewall',c('S04_FIREWALL_005').start-.3,c('S04_FIREWALL_007').end+.5],
 ['archive',c('S05_ELARA_003').start-2,c('S05_ELARA_003').end+.4],
 ['response',c('S08_VEX_006').start-.4,blackoutAt+2]]){
  await page.getByRole('slider',{name:'Story timeline'}).fill(String(Number((start+30).toFixed(3))));
  await page.evaluate(()=>{window.__chunks=[];window.__rec=new MediaRecorder(window.__audioTap.stream,{mimeType:'audio/webm;codecs=opus'});window.__rec.ondataavailable=e=>window.__chunks.push(e.data);window.__rec.start();});
  await page.getByRole('button',{name:'Play',exact:true}).click();await page.waitForTimeout((end-start)*1000);await page.getByRole('button',{name:'Pause',exact:true}).click();
  const data=await page.evaluate(()=>new Promise(resolve=>{window.__rec.onstop=async()=>{const b=new Blob(window.__chunks,{type:'audio/webm'}),reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(b);};window.__rec.stop();}));
  writeFileSync(`.local-media/review/browser-${name}.webm`,Buffer.from(data.split(',')[1],'base64'));console.log('Recorded live browser mix:',name);
 }
}finally{await browser.close();}
