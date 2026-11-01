"""Measure existing sprites without changing their image bytes."""
from pathlib import Path
import json,hashlib
import numpy as np
from PIL import Image
from scipy.ndimage import label,find_objects
root=Path(__file__).resolve().parents[2]
files={f'{p.parent.name}/{p.stem}':p for p in (root/'public/assets/characters').glob('*/*.png')}
for actor,poses in {'vex':['idle','command'],'mira':['worried','relieved'],'elara':['recording','alert'],'axiom':['idle','explain'],'citizen':['idle'],'technician':['idle']}.items():
 for pose in poses:files[f'{actor}/{pose}']=root/'public/assets/cinematic/characters'/f'{actor if actor in ["citizen","technician"] else actor+"-"+pose}.png'
result={}
for key,path in files.items():
 im=Image.open(path).convert('RGBA');alpha=np.array(im.getchannel('A'));components,n=label(alpha>160);sizes=np.bincount(components.ravel());sizes[0]=0;primary=components==sizes.argmax();ys,xs=np.where(primary)
 top,bottom=int(ys.min()),int(ys.max()+1);low=primary.copy();low[:int(top+(bottom-top)*.83)]=False
 foot_x=float(np.where(low)[1].mean()) if low.any() else float(xs.mean())
 result[key]={'file':'/'+path.relative_to(root/'public').as_posix(),'width':im.width,'height':im.height,'anchorX':round(foot_x,2),'footY':bottom,'top':top,'bodyHeight':bottom-top,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'transparentFraction':round(float((alpha==0).mean()),4)}
(root/'src/cinematic/art-metrics.json').write_text(json.dumps(result,indent=2)+'\n')
print('Measured',len(result),'sprite poses. No original image bytes modified.')
