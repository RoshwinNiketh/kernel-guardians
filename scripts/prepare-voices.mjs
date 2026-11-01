import {readFileSync,mkdirSync,copyFileSync,writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
const root=process.env.KG_VOICE_WORKSPACE??'G:/Workspace/AI/tools/chatterbox/kernel_guardians_audio_workspace';
const manifest=JSON.parse(readFileSync(join(root,'production/manifest.json'),'utf8'));
const cues=JSON.parse(readFileSync('src/story/production/dialogue_cues.json','utf8')).cues;
mkdirSync('.local-media/dialogue',{recursive:true});
const timing={};
for(const c of cues){const audio=manifest.cues[c.id];if(audio?.status!=='generated'||!existsSync(audio.path))throw Error(`Missing voice: ${c.id}`);if(c.spoken_text!==audio.spoken_text)throw Error(`Dialogue changed: ${c.id}`);copyFileSync(audio.path,join('.local-media/dialogue',`${c.id}.wav`));timing[c.id]=audio.duration;}
writeFileSync('src/story/production/timing.json',JSON.stringify(timing,null,2)+'\n');
console.log(`Prepared ${cues.length} local-only voices; public builds never copy .local-media.`);
