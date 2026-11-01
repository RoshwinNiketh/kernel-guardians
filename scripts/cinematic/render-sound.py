"""Original synthesized score, atmospheres and foley. No sampled recordings."""
from pathlib import Path
import json
import numpy as np
import soundfile as sf
from scipy.signal import butter,sosfilt
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'.local-media/sound';OUT.mkdir(parents=True,exist_ok=True)
SR=24000;rng=np.random.default_rng(420164);manifest={}
def filt(x,cut,kind='lowpass'):
 return sosfilt(butter(3,cut,btype=kind,fs=SR,output='sos'),x).astype(np.float32)
def time(d):return np.arange(round(d*SR),dtype=np.float32)/SR
def noise(d,cut=1800):return filt(rng.normal(0,1,round(d*SR)).astype(np.float32),cut)
def fade(x,a=.02,b=.08):
 x=x.copy();na=min(len(x)//2,int(a*SR));nb=min(len(x)//2,int(b*SR));x[:na]*=np.linspace(0,1,na);x[-nb:]*=np.linspace(1,0,nb);return x
def save(name,x,peak=.32,stereo=False):
 x=fade(np.asarray(x,dtype=np.float32));x=x/max(float(np.max(np.abs(x))),1e-7)*peak
 if stereo:x=np.stack([x,np.roll(x,round(SR*.011))*.93],axis=1);x[:400]*=np.linspace(0,1,400)[:,None];x[-400:]*=np.linspace(1,0,400)[:,None]
 sf.write(OUT/f'{name}.wav',x,SR,subtype='PCM_16');manifest[name]={'file':f'{name}.wav','duration':len(x)/SR,'sampleRate':SR,'channels':2 if stereo else 1,'peak':float(np.max(abs(x))),'origin':'Original mathematical synthesis, seed 420164; no external music or sampled media'}
def pad(d,f):
 t=time(d);return (np.sin(2*np.pi*f*t)+.25*np.sin(2*np.pi*f*2.002*t)+.12*np.sin(2*np.pi*f*3.001*t))*(.72+.18*np.sin(2*np.pi*.13*t))
for name,notes,pressure in [
 ('score-city',[146.832,174.614,220,329.628],.1),
 ('score-investigation',[146.832,164.814,220,293.665],.25),
 ('score-pressure',[73.416,146.832,207.652,220],.7),
 ('score-empathy',[146.832,174.614,261.626,329.628],0),
 ('score-response',[73.416,146.832,174.614,220],.9),
 ('score-dawn',[146.832,195.998,246.942,293.665],.08)]:
 d=24;t=time(d);x=sum(pad(d,f)*(.3 if i==0 else .13) for i,f in enumerate(notes));x=filt(x,1100 if pressure<.5 else 1500)
 # Soft, sparse plucked motif. More subdivisions only in danger/response.
 step=1.5 if pressure>.5 else 3.0
 for i,start in enumerate(np.arange(0,d,step)):
  a=int(start*SR);nt=time(min(1.2,d-start));tone=np.sin(2*np.pi*notes[(i+1)%len(notes)]*2*nt)*np.exp(-nt*(4 if pressure>.5 else 2.8));tone=fade(tone,.015,.1);x[a:a+len(tone)]+=tone*(.08+.1*pressure)
 x*=np.minimum(1,t/1.8)*np.minimum(1,(d-t)/2.0);save(name,x,.19,True)
for name,low,hum in [('city',1300,55),('room',950,60),('gateway',1700,74),('apartment',650,50),('dawn',2200,70)]:
 d=16;t=time(d);x=noise(d,low)*.11+np.sin(2*np.pi*hum*t)*.025+np.sin(2*np.pi*hum*2*t)*.008
 # Distant movement, never a loud repetitive UI beep.
 if name in ['city','gateway','dawn']:x+=noise(d,350)*(.03+.025*np.sin(t*.8))
 save(name,x,.13,True)
for name in ['intrusion','message','scan','click','lock','impact','contain','gate','flood','crt','static','alarm','restore','tick']:
 d={'intrusion':1.3,'message':.65,'scan':.9,'click':.16,'lock':.45,'impact':.9,'contain':1.15,'gate':1.6,'flood':3.0,'crt':1.1,'static':.35,'alarm':1.2,'restore':1.7,'tick':.14}[name];t=time(d)
 if name=='intrusion':x=noise(d,2100)*np.exp(-t*2.3)+.3*np.sin(2*np.pi*(80*t+170*t*t))*np.exp(-t*3)
 elif name in ['message','scan','contain']:x=.35*np.sin(2*np.pi*(240*t+(-70 if name=='scan' else 170)*t*t))*np.exp(-t*4)+noise(d,1800)*.1*np.exp(-t*3)
 elif name in ['click','lock','tick']:x=noise(d,5200)*np.exp(-t*(45 if name=='click' else 22))+.3*np.sin(2*np.pi*(90 if name=='lock' else 550)*t)*np.exp(-t*32)
 elif name in ['gate','impact','flood']:x=noise(d,650 if name!='flood' else 1400)*np.exp(-t*(2.5 if name!='flood' else .7))+.3*np.sin(2*np.pi*(70*t-8*t*t))*np.exp(-t*3)
 elif name=='crt':x=noise(d,5000)*np.exp(-t*7)+.17*np.sin(2*np.pi*(120*t+500*t*t))*np.exp(-t*4)
 elif name=='static':x=filt(noise(d,6000),450,'highpass')*np.exp(-t*10)
 elif name=='alarm':x=np.sin(2*np.pi*(370*t+45*np.sin(t*7)))*np.exp(-t*2.5)+noise(d,800)*.1
 else:x=sum(np.sin(2*np.pi*f*t)*np.exp(-t*(2+i*.5)) for i,f in enumerate([293.665,369.994,440]))*.2
 save(name,x,.24 if name not in ['static','tick','click'] else .12)
(ROOT/'src/cinematic/sound-assets.json').write_text(json.dumps(manifest,indent=2)+'\n')
(OUT/'provenance.json').write_text(json.dumps({'license':'Original procedural composition and sound synthesis for this project. No third-party samples.','seed':420164,'assets':manifest},indent=2))
print('Rendered',len(manifest),'original local sound assets at',OUT)
