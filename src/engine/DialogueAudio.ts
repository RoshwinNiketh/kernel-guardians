import {scheduled,cueAt} from '../cinematic/edit';
import {soundCues,mixEnvelope} from '../cinematic/soundDesign';
import soundAssets from '../cinematic/sound-assets.json' with {type:'json'};
import type {AudioSync} from './StoryEngine';
interface PlayingSource {source:AudioBufferSourceNode;gain:GainNode;pan:StereoPannerNode;anchor:number;started:number;rate:number;bus:string}
interface AudioSpec {id:string;key:string;start:number;end:number;loop?:boolean;pan?:number;bus:'voice'|'music'|'sfx'}
/** Voices, score and foley are outputs of one authoritative story playhead. */
export class DialogueAudio implements AudioSync {
 readonly context=new AudioContext();
 readonly voice=this.context.createGain();readonly music=this.context.createGain();readonly sfx=this.context.createGain();
 readonly master=this.context.createGain();readonly compressor=this.context.createDynamicsCompressor();
 readonly buffers=new Map<string,AudioBuffer>();readonly failures:string[]=[];readonly soundFailures:string[]=[];
 readonly voiceLevels=new Map<string,number>();
 private playingSources=new Map<string,PlayingSource>();
 private lastTime=0;private lastRate=1;
 constructor(){
  this.voice.connect(this.compressor);this.music.connect(this.compressor);this.sfx.connect(this.compressor);
  this.compressor.threshold.value=-6;this.compressor.knee.value=10;this.compressor.ratio.value=8;this.compressor.attack.value=.003;this.compressor.release.value=.15;
  this.compressor.connect(this.master);this.master.gain.value=.88;this.master.connect(this.context.destination);
  this.voice.gain.value=.85;this.music.gain.value=.32;this.sfx.gain.value=.46;
 }
 async load(onProgress?:(loaded:number,total:number)=>void){
  await this.context.resume();let loaded=0;const soundNames=Object.keys(soundAssets);const total=scheduled.length+soundNames.length;
  const fetchBuffer=async(key:string,url:string,failed:string[])=>{
   try{const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(String(r.status));const b=await this.context.decodeAudioData(await r.arrayBuffer());this.buffers.set(key,b);
    if(key.startsWith('voice:')){const data=b.getChannelData(0);let sum=0,peak=0;for(const value of data){sum+=value*value;peak=Math.max(peak,Math.abs(value));}const rms=Math.sqrt(sum/data.length);this.voiceLevels.set(key,Math.min(2,.1/Math.max(rms,.001),.96/Math.max(peak,.001)));}
   }catch{failed.push(key.replace('voice:','').replace('sound:',''));}
   loaded++;onProgress?.(loaded,total);
  };
  await Promise.all([...scheduled.map(c=>fetchBuffer(`voice:${c.id}`,`/local-voices/${c.id}.wav`,this.failures)),...soundNames.map(name=>fetchBuffer(`sound:${name}.wav`,`/local-sound/${name}.wav`,this.soundFailures))]);
 }
 private remove(id:string){const node=this.playingSources.get(id);if(!node)return;try{node.source.stop();}catch{/* Natural end or already stopped. */}node.source.disconnect();node.gain.disconnect();node.pan.disconnect();this.playingSources.delete(id);}
 private renderSource(spec:AudioSpec,t:number,rate:number,gain:number){
  const buffer=this.buffers.get(spec.key);if(!buffer){this.remove(spec.id);return;}
  const offset=t-spec.start;if(offset<0||t>=spec.end||!spec.loop&&offset>=buffer.duration){this.remove(spec.id);return;}
  let node=this.playingSources.get(spec.id);
  const drift=node?Math.abs(offset-(node.anchor+(this.context.currentTime-node.started)*node.rate)):Infinity;
  if(!node||node.rate!==rate||drift>.15){
   this.remove(spec.id);const source=this.context.createBufferSource(),level=this.context.createGain(),pan=this.context.createStereoPanner();
   source.buffer=buffer;source.loop=!!spec.loop;source.playbackRate.value=rate;level.gain.value=gain;pan.pan.value=spec.pan??0;
   source.connect(level);level.connect(pan);pan.connect(spec.bus==='voice'?this.voice:spec.bus==='music'?this.music:this.sfx);
   Object.assign(source,{kgCueId:spec.id,kgBus:spec.bus});
   node={source,gain:level,pan,anchor:offset,started:this.context.currentTime,rate,bus:spec.bus};this.playingSources.set(spec.id,node);
   source.start(0,spec.loop?offset%buffer.duration:offset);
  }else node.gain.gain.setTargetAtTime(gain,this.context.currentTime,.025);
 }
 sync(t:number,playing:boolean,rate:number){
  this.lastTime=t;this.lastRate=rate;if(!playing){this.stop();return;}
  const active=new Set<string>();const cue=cueAt(t);
  if(cue){const key=`voice:${cue.id}`;active.add(key);this.renderSource({id:key,key,start:cue.start,end:cue.end,bus:'voice'},t,rate,this.voiceLevels.get(key)??1);}
  for(const c of soundCues){if(t<c.start||t>=c.end)continue;active.add(c.id);this.renderSource({id:c.id,key:`sound:${c.file}`,start:c.start,end:c.end,bus:c.bus,loop:c.loop,pan:c.pan},t,rate,mixEnvelope(c,t,!!cue));}
  for(const id of this.playingSources.keys())if(!active.has(id))this.remove(id);
 }
 setMix(voice:number,music:number,sfx:number,muted=false){this.voice.gain.value=voice/100;this.music.gain.value=music/100;this.sfx.gain.value=sfx/100;this.master.gain.value=muted?0:.88;}
 get debugState(){return{time:this.lastTime,rate:this.lastRate,contextState:this.context.state,loadedVoices:[...this.buffers.keys()].filter(k=>k.startsWith('voice:')).length,loadedSounds:[...this.buffers.keys()].filter(k=>k.startsWith('sound:')).length,voiceGain:this.voice.gain.value,musicGain:this.music.gain.value,sfxGain:this.sfx.gain.value,masterGain:this.master.gain.value,active:[...this.playingSources.entries()].map(([id,n])=>({id,bus:n.bus,offset:n.anchor+(this.context.currentTime-n.started)*n.rate,gain:n.gain.gain.value,rate:n.rate}))};}
 stop(){for(const id of [...this.playingSources.keys()])this.remove(id);}
 dispose(){this.stop();void this.context.close();}
}
