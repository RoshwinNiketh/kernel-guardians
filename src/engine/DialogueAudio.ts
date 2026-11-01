import { scheduled } from '../story/production/timeline';
import type { AudioSync } from './StoryEngine';
/** Audio is an output of story time; seeking stops every previous source. */
export class DialogueAudio implements AudioSync {
  context = new AudioContext();
  voice = this.context.createGain();
  music = this.context.createGain();
  sfx = this.context.createGain();
  buffers = new Map<string,AudioBuffer>();
  failures: string[]=[];
  private source?:AudioBufferSourceNode;
  private key=''; private anchor=0; private started=0; private rate=1;
  constructor(){this.voice.connect(this.context.destination);this.music.connect(this.context.destination);this.sfx.connect(this.context.destination);}
  async load(){await this.context.resume();await Promise.all(scheduled.map(async c=>{try{const r=await fetch(`/local-voices/${c.id}.wav`,{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error(String(r.status));this.buffers.set(c.id,await this.context.decodeAudioData(await r.arrayBuffer()));}catch{this.failures.push(c.id);}}));}
  sync(t:number,playing:boolean,rate:number){
    const cue=scheduled.find(c=>t>=c.start&&t<c.end);
    if(!playing||!cue){this.stop();return;}
    const offset=t-cue.start;const buffer=this.buffers.get(cue.id);if(!buffer)return;
    const drift=Math.abs(offset-(this.anchor+(this.context.currentTime-this.started)*this.rate));
    if(this.key===cue.id&&this.rate===rate&&drift<.15)return;
    this.stop();this.key=cue.id;this.anchor=offset;this.started=this.context.currentTime;this.rate=rate;
    this.source=this.context.createBufferSource();this.source.buffer=buffer;this.source.playbackRate.value=rate;this.source.connect(this.voice);
    if(offset<buffer.duration)this.source.start(0,offset);
  }
  stop(){try{this.source?.stop();}catch{/* Already stopped. */}this.source?.disconnect();this.source=undefined;this.key='';}
  dispose(){this.stop();void this.context.close();}
}
