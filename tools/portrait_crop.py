#!/usr/bin/env python3
# coding: utf-8
"""
RADIO UNDERGROUND v2 - tools/portrait_crop.py
Crop a 48x48 talk-box portrait from a producer full-body sprite.

COMPOSITING, not art. Same constitution as the room and sprite pipelines: this
tool only measures, crops, scales, and keys. It NEVER draws or restyles. The
producer supplies the full-body art (a single standing pose on a solid BLACK
field, ~1024x1536); this crops the head-and-shoulders, keys the black to
transparency, and downsamples to the canonical 48x48 RGBA portrait.

WHY A TOOL. Thirteen portraits to update at once (the whole delivered cast plus
the three store regulars), and the producer will re-skin again. Rule 10: build
the pipeline, not thirteen one-offs. Re-crop by changing the source and re-running.

FRAMING. Matches the nine existing portraits: head near the top, shoulders at the
bottom, figure cut out of its background. Anchored to reliable measurements only:
  - figure = pixels brighter than THR (the field is pure black), bbox gives the
    head-top and the figure height H;
  - head centre x = horizontal midpoint of the top 13% of the figure;
  - crop is a square of side SIDE_FRAC*H, centred on the head x, its top a hair
    (HEADROOM) above the head-top.
(The earlier neck-width heuristic was abandoned: hair and collars made it swing
wildly. Height and head-top are stable across kids and adults alike.)

CLEAN EDGES. The field is pure black, so the source RGB already equals the figure
colour premultiplied by coverage (colour*cov + 0*(1-cov)). We downsample that
premultiplied RGB and the coverage mask together, then un-premultiply
(rgb/coverage) - which recovers true edge colour with a smooth alpha and no dark
halo, the way the delivered portraits look.

    py tools\\portrait_crop.py <input_body.png> <ID>      # one portrait
    py tools\\portrait_crop.py --all assets/portraits/raw  # every <ID>.body.png
"""
import os, sys, glob
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, 'assets', 'portraits')

SIDE_FRAC = 0.30     # crop side as a fraction of figure height (head+shoulders)
HEADROOM  = 0.06     # blank space above the head, as a fraction of the crop side
THR       = 24       # luma above this = figure (the field is pure black)
SIZE      = 48       # output portrait is SIZE x SIZE


def crop_portrait(path):
    im = Image.open(path).convert('RGB')
    a = np.array(im).astype(float)
    luma = a[:, :, 0] * 0.299 + a[:, :, 1] * 0.587 + a[:, :, 2] * 0.114
    fig = luma > THR
    if not fig.any():
        sys.exit(f'  ERROR: {os.path.basename(path)} is all background (no figure).')
    ys = np.where(fig.any(axis=1))[0]
    xs = np.where(fig.any(axis=0))[0]
    fy0, fy1 = int(ys[0]), int(ys[-1])
    H = fy1 - fy0
    top = fig[fy0:fy0 + int(0.13 * H)]
    hx = np.where(top.any(axis=0))[0]
    head_cx = int((hx[0] + hx[-1]) / 2)

    side = int(round(SIDE_FRAC * H))
    cy0 = fy0 - int(round(HEADROOM * side))
    cx0 = head_cx - side // 2
    alpha = fig.astype(float) * 255.0

    def crop(arr):
        h, w = arr.shape[:2]
        out = np.zeros((side, side) + arr.shape[2:], arr.dtype)
        sy0, sx0 = max(0, cy0), max(0, cx0)
        sy1, sx1 = min(h, cy0 + side), min(w, cx0 + side)
        out[sy0 - cy0:sy0 - cy0 + (sy1 - sy0),
            sx0 - cx0:sx0 - cx0 + (sx1 - sx0)] = arr[sy0:sy1, sx0:sx1]
        return out

    pr = crop(a)                       # premultiplied-over-black RGB
    pa = crop(alpha[:, :, None])[:, :, 0]
    prD = np.array(Image.fromarray(pr.astype(np.uint8)).resize((SIZE, SIZE), Image.LANCZOS)).astype(float)
    paD = np.array(Image.fromarray(pa.astype(np.uint8)).resize((SIZE, SIZE), Image.LANCZOS)).astype(float)
    with np.errstate(divide='ignore', invalid='ignore'):
        rgb = np.clip(np.where(paD[:, :, None] > 0, prD / (paD[:, :, None] / 255.0), 0), 0, 255)
    return Image.fromarray(np.dstack([rgb, paD]).astype(np.uint8), 'RGBA'), (fy0, H, head_cx, side)


def one(path, ID):
    port, m = crop_portrait(path)
    os.makedirs(OUT_DIR, exist_ok=True)
    outp = os.path.join(OUT_DIR, f'{ID.upper()}.png')
    existed = os.path.exists(outp)
    port.save(outp)
    fy0, H, cx, side = m
    print(f'  {ID.upper():8s} <- {os.path.basename(path):20s} '
          f'headtop={fy0} H={H} cx={cx} side={side}  '
          f'{"updated" if existed else "NEW"}  -> {os.path.relpath(outp, ROOT)}')


def main():
    if len(sys.argv) == 3 and sys.argv[1] == '--all':
        folder = sys.argv[2]
        if not os.path.isabs(folder):
            folder = os.path.join(ROOT, folder)
        bodies = sorted(glob.glob(os.path.join(folder, '*.body.png')))
        if not bodies:
            sys.exit(f'  ERROR: no *.body.png in {folder}')
        print(f'== portrait_crop --all ==  {len(bodies)} sources')
        for b in bodies:
            ID = os.path.basename(b)[:-len('.body.png')]
            one(b, ID)
    elif len(sys.argv) == 3:
        one(sys.argv[1], sys.argv[2])
    else:
        sys.exit('usage: py tools\\portrait_crop.py <input_body.png> <ID>\n'
                 '       py tools\\portrait_crop.py --all <raw_folder>')


if __name__ == '__main__':
    main()
