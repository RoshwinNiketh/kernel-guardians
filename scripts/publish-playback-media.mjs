import {readFileSync,copyFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {scheduled} from '../src/story/production/timeline.ts';
import soundAssets from '../src/cinematic/sound-assets.json' with {type:'json'};
// Publish selected playback assets only; references and auditions stay local.
const selected=[...scheduled.map(c=>({source:`.local-media/dialogue/${c.id}.wav`,path:`local-voices/${c.id}.wav`})),...[...new Set(Object.values(soundAssets).map(c=>c.file))].map(file=>({source:`.local-media/sound/${file}`,path:`local-sound/${file}`})),{source:'.local-media/music/intro-theme.mp3',path:'local-music/intro-theme.mp3'}];
const files=selected.map(({source,path})=>{const bytes=readFileSync(source);mkdirSync(`public/${path.substring(0,path.lastIndexOf('/'))}`,{recursive:true});copyFileSync(source,`public/${path}`);return {path,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};});
writeFileSync('src/cinematic/playback-media.json',JSON.stringify({files},null,2)+'\n');
console.log(`Published ${files.length} selected playback assets.`);
