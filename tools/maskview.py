#!/usr/bin/env python3
# coding: utf-8
"""
RADIO UNDERGROUND v2 — maskview.py
Renders the painted mask at 40% alpha over the normalized backdrop,
plus the hand-authored anchors (walk-behind rects/horizons, spawns,
exits, hotspots, fx points) so the producer can review room data
against the art in one image.
Usage: python3 tools/maskview.py <ID>
Writes tools/review/<ID>.maskview.png
Legend: GREEN=walk  BLUE=walk-behind corridor  (solid stays untinted)
        ORANGE rect=walk-behind strip (line=horizon)  YELLOW=spawn
        RED rect=exit  CYAN rect=hotspot  MAGENTA x=fx anchor
"""
import sys,os,re,json
import numpy as np
from PIL import Image,ImageDraw

def load_room(ID):
    src=open(f"assets/anchors/{ID}.data.js",encoding='utf-8').read()
    src=re.sub(r"//[^\n]*","",src)                      # strip comments
    m=re.search(r"ROOMS\['"+ID+r"'\]=(\{.*\});",src,re.S)
    js=m.group(1)
    js=re.sub(r"([{,]\s*)([A-Za-z_]\w*)\s*:",r'\1"\2":',js)  # quote keys
    js=js.replace("'",'"')
    js=re.sub(r",\s*([}\]])",r"\1",js)                  # trailing commas
    return json.loads(js)

def main():
    ID=sys.argv[1]
    room=load_room(ID)
    bg=Image.open(f"assets/backdrops/normalized/{ID}.png").convert('RGB')
    mask=np.array(Image.open(f"assets/masks/{ID}.mask.png").convert('RGB'))
    over=np.zeros((*mask.shape[:2],4),dtype=np.uint8)
    walk=(mask[...,0]>200)&(mask[...,1]>200)&(mask[...,2]>200)
    behind=(mask[...,2]>150)&(mask[...,0]<100)
    over[walk]=[80,220,90,102];over[behind]=[70,140,255,102]   # 40% alpha
    img=Image.alpha_composite(bg.convert('RGBA'),Image.fromarray(over))
    op=f"assets/masks/{ID}.occl.png"
    if os.path.exists(op):
        oc=np.array(Image.open(op).convert('RGBA'))
        on=(oc[...,3]>128)&(oc[...,0]>150)&(oc[...,2]<120)
        o2=np.zeros_like(oc);o2[on]=[255,150,40,90]
        img=Image.alpha_composite(img,Image.fromarray(o2))
    d=ImageDraw.Draw(img)
    for wb in room.get('walkBehind',[]):
        x,y,w,h,hz=wb['x'],wb['y'],wb['w'],wb['h'],wb['horizon']
        d.rectangle([x,y,x+w,y+h],outline=(255,150,40,255),width=2)
        d.line([x,hz,x+w,hz],fill=(255,150,40,255),width=2)
        d.text((x+3,y+3),wb.get('note','strip'),fill=(255,220,160,255))
    for name,(sx,sy) in room.get('spawns',{}).items():
        d.ellipse([sx-4,sy-4,sx+4,sy+4],outline=(255,235,60,255),width=2)
        d.text((sx+6,sy-6),name,fill=(255,235,60,255))
    for ex in room.get('exits',[]):
        x,y,w,h=ex['rect']
        d.rectangle([x,y,x+w,y+h],outline=(230,60,60,255),width=2)
        d.text((x,y-11),'-> '+ex['to'],fill=(230,60,60,255))
    for hs in room.get('hotspots',[]):
        x,y,w,h=hs['rect']
        d.rectangle([x,y,x+w,y+h],outline=(60,220,230,255),width=1)
        d.text((x+2,y+2),hs['id'],fill=(60,220,230,255))
    for fx in room.get('fx',[]):
        x,y=fx['at']
        d.line([x-5,y-5,x+5,y+5],fill=(240,70,220,255),width=2)
        d.line([x-5,y+5,x+5,y-5],fill=(240,70,220,255),width=2)
        d.text((x+7,y-4),fx['kind']+'/'+fx.get('state','AB'),fill=(240,70,220,255))
    os.makedirs('tools/review',exist_ok=True)
    out=f"tools/review/{ID}.maskview.png"
    img.convert('RGB').save(out)
    print('wrote',out)

if __name__=='__main__':main()
