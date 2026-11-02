import {DialogueAudio} from './DialogueAudio';
import {introDuration} from '../cinematic/Intro';
/** Menu audio uses AudioContext time; narrative audio uses only the story engine. */
export class ExperienceAudio extends DialogueAudio {
 private theme?:AudioBuffer;private themePromise?:Promise<void>;private loadPromise?:Promise<void>;
 themeUnavailable=false;private intro?:{source:AudioBufferSourceNode;gain:GainNode;offset:number;at:number;rate:number};
 private menuNodes=new Set<{source:AudioBufferSourceNode;gain:GainNode}>();private timer?:ReturnType<typeof setInterval>;private nextMenu=0;private menuRequested=false;
 async loadTheme(){await this.context.resume();return this.themePromise??=(async()=>{try{const r=await fetch('/local-music/intro-theme.mp3',{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Missing theme');this.theme=await this.context.decodeAudioData(await r.arrayBuffer());}catch{this.themeUnavailable=true;}})();}
 override load(progress?:(n:number,total:number)=>void){return this.loadPromise??=Promise.all([super.load(progress),this.loadTheme()]).then(()=>{});}
 async startMenu(){this.menuRequested=true;await this.loadTheme();if(!this.menuRequested||!this.theme||this.timer||document.hidden)return;this.nextMenu=this.context.currentTime;const queue=()=>{if(!this.theme)return;while(this.nextMenu<this.context.currentTime+.6){const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=this.theme;source.connect(gain);gain.connect(this.music);const at=Math.max(this.nextMenu,this.context.currentTime),end=at+this.theme.duration;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.55,at+.12);gain.gain.setValueAtTime(.55,end-.12);gain.gain.linearRampToValueAtTime(0,end);const node={source,gain};this.menuNodes.add(node);source.onended=()=>{this.menuNodes.delete(node);source.disconnect();gain.disconnect();};source.start(at);this.nextMenu=end-.12;}};queue();this.timer=setInterval(queue,200);}
 stopMenu(fade=.15){this.menuRequested=false;clearInterval(this.timer);this.timer=undefined;for(const n of this.menuNodes){n.gain.gain.cancelScheduledValues(this.context.currentTime);n.gain.gain.setValueAtTime(n.gain.gain.value,this.context.currentTime);n.gain.gain.linearRampToValueAtTime(0,this.context.currentTime+fade);try{n.source.stop(this.context.currentTime+fade);}catch{}}this.menuNodes.clear();}
 override stop(){super.stop();if(this.intro){try{this.intro.source.stop();}catch{}this.intro.source.disconnect();this.intro.gain.disconnect();this.intro=undefined;}}
 override sync(t:number,playing:boolean,rate:number){
  if(!playing){this.stop();return;}
  this.stopMenu();if(t>=introDuration){if(this.intro)this.stop();super.sync(t-introDuration,true,rate);return;}
  super.stop();if(!this.theme)return;
  const n=this.intro,drift=n?Math.abs(t-(n.offset+(this.context.currentTime-n.at)*n.rate)):Infinity;
  const level=.55*Math.min(1,t/.15,Math.max(0,introDuration-t));
  if(!n||n.rate!==rate||drift>.15){this.stop();const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=this.theme;source.playbackRate.value=rate;source.connect(gain);gain.connect(this.music);gain.gain.value=level;Object.assign(source,{kgCueId:'intro-theme',kgBus:'music'});source.start(0,t);this.intro={source,gain,offset:t,at:this.context.currentTime,rate};}else n.gain.gain.setTargetAtTime(level,this.context.currentTime,.02);
 }
 override get debugState(){return{...super.debugState,themeLoaded:!!this.theme,themeUnavailable:this.themeUnavailable,menuSources:this.menuNodes.size,introActive:!!this.intro,introOffset:this.intro?this.intro.offset+(this.context.currentTime-this.intro.at)*this.intro.rate:undefined};}
}
