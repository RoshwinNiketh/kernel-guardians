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
 sf.write(OUT/f'{name}.wav',x,SR,subtype='PCM_16');manifest[name]={'file':f'{name}.wav','duration':len(x)/SR,'sampleRate':SR,'channels':2 if stereo else 1,'peak':float(np.max(abs(x))),'origin':'Original arranged synthesis v2, seed 420164; no external recordings'}
def pad(d,f):
 t=time(d);return (np.sin(2*np.pi*f*t)+.25*np.sin(2*np.pi*f*2.002*t)+.12*np.sin(2*np.pi*f*3.001*t))*(.72+.18*np.sin(2*np.pi*.13*t))
# Finite 64-second arrangements: changing harmony, sparse motif, no baked loops.
for name,root,pressure in [('score-city',146.832,.12),('score-investigation',146.832,.22),('score-pressure',73.416,.65),('score-empathy',146.832,0),('score-response',73.416,.9),('score-dawn',146.832,.06)]:
 d=64;t=time(d);x=np.zeros(len(t),np.float32)
 progression=[[0,3,7,14],[-2,2,7,10],[-5,0,3,7],[-7,0,2,7]] if name!='score-dawn' else [[0,4,7,14],[-5,0,4,7],[-2,2,7,12],[0,4,7,14]]
 for bar in range(16):
  start=bar*4;nt=time(4);chord=progression[bar%4];body=np.zeros(len(nt),np.float32)
  for i,semitone in enumerate(chord):
   f=root*2**(semitone/12);body+=(np.sin(2*np.pi*f*nt)+.12*np.sin(2*np.pi*f*2.001*nt))*(.16 if i==0 else .08)
  body=filt(body,700+pressure*450);body=fade(body,.65,.8);x[start*SR:start*SR+len(body)]+=body
 # Quiet plucked motif answers the pad every other bar; leave room for speech.
 motif=[12,19,15,22,19,12,10,7] if name!='score-dawn' else [12,19,16,24,19,16,14,12]
 for i,start in enumerate(range(2,64,2 if pressure>.5 else 4)):
  nt=time(min(2,64-start));f=root*2**(motif[i%8]/12);note=(np.sin(2*np.pi*f*nt)+.13*np.sin(2*np.pi*f*3*nt))*np.exp(-nt*3.5);note=fade(note,.012,.2);x[start*SR:start*SR+len(note)]+=note*(.06+pressure*.035)
 if pressure>.5:
  for start in np.arange(.5,64,.75):
   nt=time(min(.45,64-start));pulse=np.sin(2*np.pi*root*.5*nt)*np.exp(-nt*15);a=round(start*SR);x[a:a+len(pulse)]+=fade(pulse,.018,.12)*.07*pressure
 x*=np.minimum(1,t/1.5)*np.minimum(1,(d-t)/2);save(name,x,.17,True)
for name,low,hum in [('city',1300,55),('room',950,60),('gateway',1700,74),('apartment',650,50),('dawn',2200,70)]:
 d=16;t=time(d);x=noise(d,low)*.11+np.sin(2*np.pi*hum*t)*.025+np.sin(2*np.pi*hum*2*t)*.008
 # Distant movement, never a loud repetitive UI beep.
 if name in ['city','gateway','dawn']:x+=noise(d,350)*(.03+.025*np.sin(t*.8))
 save(name,x,.13,True)
for name in ['intrusion','message','scan','click','lock','impact','contain','gate','flood','crt','static','alarm','restore','tick']:
 d={'intrusion':1.3,'message':.65,'scan':.9,'click':.16,'lock':.45,'impact':.9,'contain':1.15,'gate':1.6,'flood':3.0,'crt':1.1,'static':.35,'alarm':1.2,'restore':1.7,'tick':.14}[name];t=time(d)
 if name=='intrusion':x=noise(d,3300)*np.exp(-t*6)*.3+np.sin(2*np.pi*(150*t-42*t*t))*.12*np.exp(-t*4)
 elif name=='message':x=(np.sin(2*np.pi*660*t)+.45*np.sin(2*np.pi*880*t))*np.exp(-t*12)*.18
 elif name=='scan':x=np.sin(2*np.pi*(320*t+650*t*t))*np.exp(-t*6)*.2+noise(d,1800)*np.exp(-t*10)*.09
 elif name in ['click','tick']:x=noise(d,4200)*np.exp(-t*75)+np.sin(2*np.pi*(980 if name=='click' else 680)*t)*np.exp(-t*55)*.12
 elif name=='lock':x=noise(d,2700)*np.exp(-t*45)+sum(np.sin(2*np.pi*f*t)*np.exp(-t*18) for f in [210,440,790])*.12
 elif name=='gate':x=noise(d,1800)*np.exp(-t*2.5)*.2+sum(np.sin(2*np.pi*f*t)*np.exp(-t*(3+i)) for i,f in enumerate([92,173,397,741]))*.1
 elif name=='impact':x=noise(d,1200)*np.exp(-t*13)*.2+np.sin(2*np.pi*(95*t-35*t*t))*np.exp(-t*10)*.45
 elif name=='flood':x=noise(d,2000)*(1-np.exp(-t*7))*np.exp(-t*.8)*(.65+.2*np.sin(t*24))
 elif name=='contain':x=noise(d,2100)*np.exp(-t*25)*.3+np.sin(2*np.pi*(450*t-110*t*t))*np.exp(-t*7)*.2
 elif name=='crt':x=noise(d,5200)*np.exp(-t*15)*.3+np.sin(2*np.pi*120*t)*np.exp(-t*5)*.15+np.sin(2*np.pi*7200*t)*np.exp(-t*6)*.008
 elif name=='static':x=filt(noise(d,6000),450,'highpass')*np.exp(-t*15)
 elif name=='alarm':x=np.sin(2*np.pi*(370*t+8*np.sin(t*7)))*np.exp(-t*4)*.15
 else:x=noise(d,2300)*np.exp(-t*35)*.3+np.sin(2*np.pi*440*t)*np.exp(-t*10)*.12
 save(name,x,.24 if name not in ['static','tick','click'] else .12)
(ROOT/'src/cinematic/sound-assets.json').write_text(json.dumps(manifest,indent=2)+'\n')
(OUT/'provenance.json').write_text(json.dumps({'license':'Original procedural composition and sound synthesis for this project. No third-party samples.','seed':420164,'assets':manifest},indent=2))
print('Rendered',len(manifest),'original local sound assets at',OUT)
