#!/usr/bin/env python3
# coding: utf-8
"""
RADIO UNDERGROUND - backdrop intake tool (pipeline steps 1 & 2)
Usage: python3 tools/intake.py assets/backdrops/raw/<ID>.png [...]
  1. GRID DETECT: finds the effective AI pixel size (tests 1..8) by
     scoring nearest-neighbor round-trip error at each scale.
  2. SNAP: downsamples to true logical resolution (median-of-block;
     kills stray anti-aliasing better than plain nearest).
  3. PALETTE AUDIT: color count before/after + gradient-residue score
     (surviving AA that will read as blur at integer scale).
  4. Writes assets/backdrops/normalized/<ID>.png + appends intake_log.md.
The tool NEVER restyles art. It only snaps and reports.
"""
import sys,os,numpy as np
from PIL import Image

def grid_score(a,s):
    small=a[::s,::s]
    up=np.repeat(np.repeat(small,s,axis=0),s,axis=1)[:a.shape[0],:a.shape[1]]
    return float(np.mean(np.abs(a.astype(int)-up.astype(int))))

def snap(a,s):
    H,W=a.shape[0]//s*s,a.shape[1]//s*s
    a=a[:H,:W]
    b=a.reshape(H//s,s,W//s,s,3).swapaxes(1,2).reshape(H//s,W//s,s*s,3)
    return np.median(b,axis=2).astype(np.uint8)

def colors(a): return len(np.unique(a.reshape(-1,3),axis=0))
def residue(a):
    d=np.abs(np.diff(a.astype(int),axis=1)).max(axis=2)
    return float(((d>0)&(d<24)).mean())

def main(paths):
    root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    outdir=os.path.join(root,'assets','backdrops','normalized')
    os.makedirs(outdir,exist_ok=True)
    with open(os.path.join(root,'intake_log.md'),'a') as log:
        for p in paths:
            name=os.path.splitext(os.path.basename(p))[0]
            a=np.array(Image.open(p).convert('RGB'))
            sc={s:grid_score(a,s) for s in range(1,9)}
            mn=min(sc.values())
            best=max(s for s,v in sc.items() if v<=mn*1.15+1e-9)
            sn=snap(a,best)
            Image.fromarray(sn).save(os.path.join(outdir,name+'.png'))
            line=(f"| {name} | {a.shape[1]}x{a.shape[0]} | px={best} "
                  f"| {sn.shape[1]}x{sn.shape[0]} | {colors(a)} -> {colors(sn)} "
                  f"| {residue(sn):.3f} |")
            print(line); log.write(line+"\n")

def normalize_wide(path,root,factor=2):
    """Wide scroll-room panorama: forced integer median downsample by `factor`,
    NO 16:9 crop (the street IS the room; the camera scrolls along it). Same
    median-of-block snap as `snap()`, so anti-aliasing is killed the same way;
    only the crop is skipped because a 3:1 street can't take a 16:9 window."""
    name=os.path.splitext(os.path.basename(path))[0]
    a=np.array(Image.open(path).convert('RGB'))
    sn=snap(a,factor)
    out=os.path.join(root,'assets','backdrops','normalized',name+'.png')
    Image.fromarray(sn).save(out)
    return name,(a.shape[1],a.shape[0]),(sn.shape[1],sn.shape[0]),factor,colors(sn),residue(sn)

if __name__=='__main__':
    if len(sys.argv)<2:
        sys.exit('usage: py tools\\intake.py assets\\backdrops\\raw\\<ID>.png [...]\n'
                 '       (add --wide for panorama scroll rooms: median /2, no 16:9 crop)\n'
                 '       the filename becomes the room ID.')
    argv=[a for a in sys.argv[1:] if a!='--wide']
    for a in argv:
        if 'normalized' in a.replace('\\','/').split('/'):
            sys.exit('refusing to re-normalize an already-normalized backdrop:\n'
                     f'   {a}\n'
                     'intake.py WRITES to assets/backdrops/normalized/. Point it at\n'
                     'the raw render in assets/backdrops/raw/ instead.')
    if '--wide' in sys.argv:
        root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        with open(os.path.join(root,'intake_log.md'),'a') as log:
            log.write("\n## wide scroll-room normalization (median /2, no crop)\n")
            log.write("| ID | raw | logical | factor | colors | residue |\n|---|---|---|---|---|---|\n")
            for p in argv:
                n,(rw,rh),(lw,lh),f,c,r=normalize_wide(p,root)
                line=f"| {n} | {rw}x{rh} | {lw}x{lh} | /{f} | {c} | {r:.3f} |"
                print(line); log.write(line+"\n")
    else:
        main(argv)

# ---- v2: content-aware 16:9 crop + integer downsample ----
def content_bbox(a,thresh=18):
    lum=a.max(axis=2)
    ys,xs=np.where(lum>thresh)
    return xs.min(),ys.min(),xs.max()+1,ys.max()+1

def normalize_v2(path,root,factor=2):
    name=os.path.splitext(os.path.basename(path))[0]
    a=np.array(Image.open(path).convert('RGB'))
    H,W=a.shape[:2]
    tw,th=W, int(W*9/16)          # 16:9 window at full width
    x0,y0,x1,y1=content_bbox(a)
    cy=(y0+y1)//2
    top=max(0,min(H-th,cy-th//2)) # center crop window on content
    crop=a[top:top+th,:,:]
    sn=snap(crop,factor)
    out=os.path.join(root,'assets','backdrops','normalized',name+'.png')
    Image.fromarray(sn).save(out)
    return name,(W,H),(top,),sn.shape[1],sn.shape[0],colors(sn),residue(sn)

if __name__=='__main__' and os.environ.get('INTAKE_V2'):
    root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    with open(os.path.join(root,'intake_log.md'),'a') as log:
        log.write("\n## v2 normalization (16:9 content crop + median /2)\n")
        log.write("| ID | raw | crop-top | logical | colors | residue |\n|---|---|---|---|---|---|\n")
        for p in sys.argv[1:]:
            n,(W,H),(t,),w,h,c,r=normalize_v2(p,root)
            line=f"| {n} | {W}x{H} | y={t} | {w}x{h} | {c} | {r:.3f} |"
            print(line); log.write(line+"\n")
