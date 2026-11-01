import json, math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
directory=Path('docs/verification/cinematic')
frames=json.loads((directory/'frames.json').read_text())['frames']
font=ImageFont.truetype('C:/Windows/Fonts/consola.ttf',15)
for page in range(math.ceil(len(frames)/16)):
    sheet=Image.new('RGB',(1680,1088),'#111823')
    draw=ImageDraw.Draw(sheet)
    for slot,frame in enumerate(frames[page*16:page*16+16]):
        x=(slot%4)*420;y=(slot//4)*272
        with Image.open(frame['file']) as source:
            source.thumbnail((420,236))
            sheet.paste(source,(x,y))
        draw.text((x+5,y+239),f"{frame['index']:02} {frame['time']:.2f}s {frame['shot']}",font=font,fill='#ffffff')
        draw.text((x+5,y+256),f"{frame['location']} / {frame['framing']}",font=font,fill='#a1e6eb')
    sheet.save(directory/f'contact-{page+1}.jpg',quality=93)
print('Contact sheets',math.ceil(len(frames)/16))
