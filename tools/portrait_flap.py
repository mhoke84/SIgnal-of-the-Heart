#!/usr/bin/env python3
# coding: utf-8
"""
RADIO UNDERGROUND v2 - tools/portrait_flap.py
Build STABILISED talking-portrait frame sets from the producer's expression grids.

COMPOSITING, not art. Same constitution as portrait_crop.py: this tool only
measures, registers, keys, crops and RE-COMBINES the producer's own pixels. It
never draws or restyles. The frames it writes are GENERATED artifacts -- never
hand-edit them; change the source grid or the config below and re-run.

THE PROBLEM IT SOLVES. PixelLab regenerates each expression cell independently,
so the head/hair/brows drift a few px between cells (measured: hairline wandered
4-19px). Animated as a flap, that reads as the head bobbing -- or, on the worried
set, as the NECK sliding, because those cells also tilt the head DOWN.

THE FIX (the producer's idea: "transplant the mouth onto the same face"):
  1. pick ONE base cell (the closed-mouth rest);
  2. register each open-mouth donor to the base on a STABLE band (nose/upper
     face) so eyes/brows/hair line up -- this cancels the per-cell drift;
  3. the pixels that still differ ARE the mouth -> build a feathered mask there;
  4. composite only that region back onto the base.
Head, hair, brows and body become pixel-identical across the set; only the mouth
moves. Then key the black field and downsample to the canonical 48x48.

PER-MOOD REGISTRATION. Upright, forward sets (speaking/yelling) register on the
upper face with a wide mouth box. The worried set dips the head and looks down,
so it registers on the NOSE band (stable whether eyes are open or shut) and uses
a TIGHT lip box to keep the swap off the neck. Even so its mouths barely open
(sad grimaces, not speech), so worried is a SUBTLE PLACEHOLDER -- a purpose-made
worried *talking* set (upright head, worried brows held, mouth opening) will drop
straight in by editing its config row.

CADENCE (for the dialog port). While text types, cycle the open frames
(OPEN_SEQ); rest CLOSED when the line ends. Emitted in the manifest.

    py tools\\portrait_flap.py            # build frames + manifest
    py tools\\portrait_flap.py --demo     # also write tools/dialog_harness.html
"""
import os, sys, json, io, base64
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW  = os.path.join(ROOT, 'assets', 'portraits', 'raw', 'talking')
OUT  = os.path.join(ROOT, 'assets', 'portraits', 'talking')
CELL = 256
SIZE = 48
OPEN_SEQ = ['m0', 'm1', 'm2', 'm1']   # mouth cycle while typing

# reg windows (y0,y1,x0,x1) and mouth ROIs, in 256-cell space
UP   = (30, 145, 60, 196)
NOSE = (95, 140, 96, 160)
WIDE = (135, 220, 84, 172)
LIP  = (150, 193, 96, 160)

# per-mood: source grid, base (rest) cell, open donor cells, reg window, mouth ROI, thresholds
CFG = {
    'neutral': dict(grid='MIKE.talking-1.png', base=8, opens=[4, 5, 7], reg=UP,   roi=WIDE, thr=18, mx=7, blur=3, note='single-grid talking-1: base cell 8 + own mouths 4/5/7 (mouth cells are a placeholder pick)'),
    'angry':   dict(grid='MIKE.yelling.png',  base=7, opens=[5, 8, 6], reg=UP,   roi=WIDE, thr=18, mx=7, blur=3, note='shouting shapes'),
    'worried': dict(grid='MIKE.worried.png',  base=8, opens=[4, 5, 6], reg=NOSE, roi=LIP,  thr=16, mx=5, blur=2, note='PLACEHOLDER-subtle: source dips head; wants a worried talking set'),
}

def cell(grid, idx):
    im = Image.open(os.path.join(RAW, grid)).convert('RGBA')
    r, c = divmod(idx, 3)
    return np.asarray(im.crop((c*CELL, r*CELL, (c+1)*CELL, (r+1)*CELL))).astype(np.int16)

def luma(a):
    return a[:, :, 0]*0.299 + a[:, :, 1]*0.587 + a[:, :, 2]*0.114

def register(base, don, win):
    y0, y1, x0, x1 = win
    bl, dl = luma(base), luma(don); best = (0, 0, 1e18)
    for dy in range(-12, 13):
        for dx in range(-6, 7):
            s = np.roll(np.roll(dl, dy, 0), dx, 1)
            d = ((bl[y0:y1, x0:x1] - s[y0:y1, x0:x1])**2).mean()
            if d < best[2]: best = (dx, dy, d)
    return best[0], best[1]

def transplant(base, don, win, roi, thr, mx, blur):
    dx, dy = register(base, don, win)
    dona = np.roll(np.roll(don, dy, 0), dx, 1)
    d = np.abs(luma(base) - luma(dona)); box = np.zeros(d.shape, bool)
    y0, y1, x0, x1 = roi; box[y0:y1, x0:x1] = True
    change = (d > thr) & box
    m = Image.fromarray((change*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(mx)).filter(ImageFilter.GaussianBlur(blur))
    m = (np.asarray(m).astype(float)/255.0)[:, :, None]
    return np.clip(base*(1-m) + dona*m, 0, 255).astype(np.int16), (dx, dy)

def key_ds(a):
    l = luma(a); alpha = (l > 24).astype(float)*255.0
    prD = np.array(Image.fromarray(a[:, :, :3].astype(np.uint8)).resize((SIZE, SIZE), Image.LANCZOS)).astype(float)
    paD = np.array(Image.fromarray(alpha.astype(np.uint8)).resize((SIZE, SIZE), Image.LANCZOS)).astype(float)
    with np.errstate(divide='ignore', invalid='ignore'):
        rgb = np.clip(np.where(paD[:, :, None] > 0, prD/(paD[:, :, None]/255.0), 0), 0, 255)
    return Image.fromarray(np.dstack([rgb, paD]).astype(np.uint8), 'RGBA')

def hairtop(img):
    a = np.asarray(img); m = (a[:, :, 3] > 120) & (a[:, :, :3].astype(int).max(2) > 30)
    ys = np.where(m.any(1))[0]; return int(ys.min()) if len(ys) else -1

def build():
    os.makedirs(OUT, exist_ok=True)
    manifest = {'format': '48x48 RGBA, drawn 2x in the talk box', 'open_seq': OPEN_SEQ,
                'cadence': 'cycle open_seq while text types; show rest when the line ends',
                'moods': {}}
    for mood, c in CFG.items():
        base = cell(c.get('base_grid', c['grid']), c['base'])
        frames = {'rest': key_ds(base)}; tops = [hairtop(frames['rest'])]
        for j, oi in enumerate(c['opens']):
            comp, off = transplant(base, cell(c['grid'], oi), c['reg'], c['roi'], c['thr'], c['mx'], c['blur'])
            frames[f'm{j}'] = key_ds(comp); tops.append(hairtop(frames[f'm{j}']))
        for k, im in frames.items():
            im.save(os.path.join(OUT, f'MIKE.{mood}.{k}.png'))
        stable = len(set(tops)) == 1
        manifest['moods'][mood] = {'rest': f'MIKE.{mood}.rest.png',
                                   'open': [f'MIKE.{mood}.m{j}.png' for j in range(len(c['opens']))],
                                   'note': c['note'], 'stable': stable}
        print(f"  {mood:8s} <- base:{os.path.splitext(c.get('base_grid', c['grid']))[0]:14s} mouths:{c['grid']:18s} base#{c['base']} opens{c['opens']}  hairtops={tops}  {'STABLE' if stable else 'DRIFT!'}  ({c['note']})")
    json.dump(manifest, open(os.path.join(OUT, 'MIKE.talk.manifest.json'), 'w'), indent=2)
    print(f"  manifest -> {os.path.relpath(os.path.join(OUT,'MIKE.talk.manifest.json'), ROOT)}")
    return manifest

def b64(path):
    return 'data:image/png;base64,' + base64.b64encode(open(path, 'rb').read()).decode()

def demo():
    tpl = os.path.join(os.path.dirname(__file__), '_flap_demo_template.html')
    if not os.path.isfile(tpl):
        print('  (no _flap_demo_template.html beside the tool; skipping --demo)'); return
    frames = {m: {k: b64(os.path.join(OUT, f'MIKE.{m}.{k}.png')) for k in ['rest', 'm0', 'm1', 'm2']} for m in CFG}
    html = open(tpl, encoding='utf-8').read().replace('__FRAMES__', json.dumps(frames))
    outp = os.path.join(os.path.dirname(__file__), 'dialog_harness.html')
    open(outp, 'w', encoding='utf-8').write(html)
    print(f"  demo -> {os.path.relpath(outp, ROOT)}  ({len(html)} bytes)")

if __name__ == '__main__':
    if not os.path.isdir(RAW):
        sys.exit(f'  ERROR: {RAW} not found (need the producer talking grids)')
    print('== portrait_flap: stabilised talking frames ==')
    build()
    if '--demo' in sys.argv:
        demo()
