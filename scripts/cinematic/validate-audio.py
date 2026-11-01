"""Private local technical validation and review mix; never publishes audio."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import json,os,subprocess,math
import numpy as np
import soundfile as sf
ROOT=Path(__file__).resolve().parents[2]
WORK=Path(os.environ.get('KG_VOICE_WORKSPACE','G:/Workspace/AI/tools/chatterbox/kernel_guardians_audio_workspace'))
FFMPEG=os.environ.get('KG_FFMPEG') or json.loads((WORK/'summary.json').read_text())['ffmpeg_path']
PRIVATE=ROOT/'.local-media';OUT=PRIVATE/'review';OUT.mkdir(exist_ok=True)
edit=json.loads((PRIVATE/'cinematic-edit.json').read_text())
retakes=json.loads((WORK/'production/cinematic/retakes.json').read_text())
files=list((PRIVATE/'dialogue').glob('*.wav'))+list((PRIVATE/'sound').glob('*.wav'))
def validate(path):
    audio,sr=sf.read(path,dtype='float32',always_2d=True)
    result=subprocess.run([FFMPEG,'-v','error','-i',str(path),'-f','null','-'],capture_output=True,text=True,timeout=60)
    frames=audio.shape[0];rms=float(np.sqrt(np.mean(audio.astype(np.float64)**2)));peak=float(np.max(np.abs(audio)))
    mono=np.max(np.abs(audio),axis=1);size=max(1,round(sr*.02));n=frames//size
    envelope=np.sqrt(np.mean(audio[:n*size].mean(axis=1).reshape(n,size)**2,axis=1))
    active=np.flatnonzero(envelope>.001)
    leading=float(active[0]*.02) if len(active) else frames/sr
    trailing=float((n-active[-1]-1)*.02) if len(active) else frames/sr
    last_rms=float(np.sqrt(np.mean(audio[-round(sr*.05):]**2)))
    step=float(np.max(np.abs(np.diff(audio,axis=0))))
    warnings=[]
    if path.parent.name=='dialogue':
        if leading>.6:warnings.append('Long leading silence; listening review required')
        if trailing>.8:warnings.append('Long trailing silence; listening review required')
        if last_rms>max(.01,rms*.4) and float(mono[-1])>.005:warnings.append('Possible abrupt ending; listening review required')
        if float(np.mean(envelope<.001))>.35:warnings.append('High silence fraction; inspect performance')
    if step>.65:warnings.append('Large sample jump; inspect transient')
    return {'file':str(path),'ffmpeg_valid':result.returncode==0,'ffmpeg_error':result.stderr.strip(),'sample_rate':sr,'channels':audio.shape[1],'duration':frames/sr,'finite':bool(np.isfinite(audio).all()),'peak':peak,'rms':rms,'full_scale_samples':int(np.sum(np.abs(audio)>=.999)),'leading_silence_seconds':leading,'trailing_silence_seconds':trailing,'silent_frame_fraction':float(np.mean(envelope<.001)),'max_sample_step':step,'warnings':warnings}
with ThreadPoolExecutor(max_workers=4) as pool:records=list(pool.map(validate,files))
assert len(records)==91
assert all(r['ffmpeg_valid'] and r['finite'] and r['full_scale_samples']==0 and r['sample_rate']==24000 for r in records)
# Offline reference of the live default mix, before its protective compressor.
SR=24000;mix=np.zeros((round((edit['duration']+.1)*SR),2),np.float32)
speech=np.zeros(len(mix),bool)
for c in edit['scheduled']:speech[round(c['start']*SR):round(c['end']*SR)]=True
def add_audio(path,start,end,gain,loop=False,pan=0,duck=None):
    audio,sr=sf.read(path,dtype='float32',always_2d=True);assert sr==SR
    begin=round(start*SR);length=round((end-start)*SR);length=min(length,len(mix)-begin)
    if loop:audio=np.tile(audio,(math.ceil(length/len(audio)),1))[:length]
    else:length=min(length,len(audio));audio=audio[:length]
    if audio.shape[1]==1:audio=np.concatenate([audio*math.cos((pan+1)*math.pi/4),audio*math.sin((pan+1)*math.pi/4)],axis=1)
    levels=np.full(length,gain,np.float32)
    if duck is not None:
        levels[speech[begin:begin+length]]*=duck
        t=np.arange(length)/SR;levels*=np.minimum(1,t/.05)*np.minimum(1,(end-start-t)/.12)
    mix[begin:begin+length]+=audio*levels[:,None]
for c in edit['scheduled']:
    path=PRIVATE/'dialogue'/f"{c['id']}.wav";data,_=sf.read(path,dtype='float32');rms=float(np.sqrt(np.mean(data*data)));peak=float(np.max(abs(data)));gain=min(2,.1/max(rms,.001),.96/max(peak,.001))
    add_audio(path,c['start'],c['end'],gain*.85)
for c in edit['soundCues']:
    add_audio(PRIVATE/'sound'/c['file'],c['start'],c['end'],c['gain']*(.32 if c['bus']=='music' else .46),c.get('loop',False),c.get('pan',0),(.23 if c['bus']=='music' else .45) if c.get('duck') else None)
mix*=.88
peak=float(np.max(abs(mix)));assert peak<1,'Default mix exceeds full scale before compressor'
sf.write(OUT/'cinematic-default-mix.wav',mix[:round(edit['duration']*SR)],SR,subtype='PCM_24')
cue=lambda id:next(c for c in edit['scheduled'] if c['id']==id)
excerpts=[('firewall-humor-to-alert',cue('S04_FIREWALL_005')['start']-.3,cue('S04_FIREWALL_007')['end']+.7),('elara-archive',cue('S05_ELARA_003')['start']-1,cue('S05_ELARA_003')['end']+.8),('final-response',cue('S08_VEX_006')['start']-.3,edit['blackoutAt']+3)]
for name,start,end in excerpts:sf.write(OUT/f'{name}.wav',mix[round(start*SR):round(end*SR)],SR,subtype='PCM_24')
mix_result=validate(OUT/'cinematic-default-mix.wav');assert mix_result['ffmpeg_valid']
report={'listening_approved':False,'checks':'FFmpeg decode, finite samples, 24 kHz, clipping, waveform edges, silence and transient heuristics. No ASR or emotional-quality approval.','files':records,'retakes':{'count':len(retakes['cues']),'variants':sorted(set(c['model'] for c in retakes['cues'].values())),'max_reserved_vram_bytes':max(c['peak_reserved_bytes'] for c in retakes['cues'].values()),'all_ffmpeg_valid':all(c['ffmpeg_valid'] for c in retakes['cues'].values())},'default_mix':{'file':str(OUT/'cinematic-default-mix.wav'),'peak_before_compressor':peak,'duration':edit['duration'],'note':'Offline reference; the live WebAudio mixer adds smoothing and protective compression. Not a browser loopback recording.','ffmpeg_valid':mix_result['ffmpeg_valid']},'review_excerpts':[str(OUT/f'{name}.wav') for name,_,_ in excerpts]}
(OUT/'audio-validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'validated_files':len(records),'decode_failures':sum(not r['ffmpeg_valid'] for r in records),'full_scale_samples':sum(r['full_scale_samples'] for r in records),'mix_peak':peak,'warnings':[{ 'file':Path(r['file']).name,'warnings':r['warnings']} for r in records if r['warnings']],'retakes':report['retakes'],'report':str(OUT/'audio-validation.json')},indent=2))
