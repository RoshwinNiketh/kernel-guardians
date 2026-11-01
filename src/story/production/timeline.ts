import source from './dialogue_cues.json' with {type:'json'};
import editorial from './story_timeline.json' with {type:'json'};
import measured from './timing.json' with {type:'json'};
import shots from './shot_list.json' with {type:'json'};
export const names: Record<string,string> = {kernel:'Commander Kernel',patch:'Agent Patch',firewall:'Captain Firewall',vex:'Vex Null',mira:'Mira Vale',elara:'Dr. Elara Trace',axiom:'Auditor Axiom',narrator:'Narrator'};
export const cues = source.cues;
export type Cue = typeof cues[number] & {start:number;end:number;duration:number};
const timings = measured as Record<string,number>;
export const scheduled: Cue[] = [];
export const chapters: {id:number;title:string;start:number;end:number}[]=[];
let cursor = 0;
for (const scene of editorial.scenes) {
  const list=cues.filter(c=>c.scene===scene.scene_id);
  const duration=(c:typeof cues[number])=>timings[c.id] ?? Math.max(1.3,c.spoken_text.split(/\s+/).length/2.7);
  const start=Math.max(cursor,scene.target_start_seconds);
  const pre=scene.scene_id===8?list.slice(0,7):list;
  const natural=pre.reduce((n,c)=>n+duration(c)+.6,0)+1;
  const preEnd=scene.scene_id===8?485:scene.target_end_seconds;
  const gap=Math.max(.6,(preEnd-start-1-pre.reduce((n,c)=>n+duration(c),0))/pre.length);
  cursor=start+1;
  for(const c of pre){scheduled.push({...c,start:cursor,end:cursor+duration(c),duration:duration(c)});cursor+=duration(c)+gap;}
  if(scene.scene_id===8){
    cursor=Math.max(495,cursor+10);
    for(const c of list.slice(7)){scheduled.push({...c,start:cursor,end:cursor+duration(c),duration:duration(c)});cursor+=duration(c)+.65;}
  }
  cursor=Math.max(cursor,scene.target_end_seconds,start+natural);
  chapters.push({id:scene.scene_id,title:scene.title,start,end:cursor});
}
export const duration=Number((cursor+2).toFixed(3));
export function countdown(t:number){return Math.max(0,Math.ceil(495-Math.max(15,t)));}
export function frameAt(t:number){const chapter=chapters.find(c=>t>=c.start&&t<c.end)??chapters.at(-1)!;const cue=scheduled.find(c=>t>=c.start&&t<c.end);const recent=scheduled.filter(c=>c.scene===chapter.id&&c.start<=t).at(-1);const target=editorial.scenes[chapter.id-1];const editorialTime=target.target_start_seconds+(t-chapter.start)/(chapter.end-chapter.start)*(target.target_end_seconds-target.target_start_seconds);const shot=shots.shots.find(s=>s.scene===chapter.id&&editorialTime>=s.target_start_seconds&&editorialTime<s.target_end_seconds)??shots.shots.filter(s=>s.scene===chapter.id).at(-1);return {chapter,cue,recent,shot,countdown:countdown(t),blackout:t>=485&&t<495,restored:t>=495};}


