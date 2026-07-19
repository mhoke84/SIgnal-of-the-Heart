#!/usr/bin/env python3
# coding: utf-8
"""
RADIO UNDERGROUND v2 - tools/sprite_intake.py
Producer sprite sheet -> validated art + generated frame table.
Sibling of intake.py (backdrops) and mask2json.py (rooms). Same rule:
the tool NEVER restyles art. It measures, reports, and FLAGS.

Usage:
    py tools\\sprite_intake.py assets/sprites/raw/MIKE.sheet.png
    py tools\\sprite_intake.py assets/sprites/raw/STYLUS.sheet.png --cell 32x32
    py tools\\sprite_intake.py ... --strict     (any WARN becomes an error)

SHEET CONTRACT (docs/SPRITE_SPEC.md is the long version)
    cell 32x48 by default. 4 rows x >=3 cols.
    rows, top to bottom, ALWAYS: down, up, left, right
    cols, left to right:  0 stand   1 stepA   2 stepB   3.. idle (optional)
    RGBA. Background fully transparent (alpha 0). No matte, no checkerboard.
    NO baked drop shadow - the engine draws the contact shadow.
    Feet sit ON the bottom row of the cell, centred: the engine anchors a
    sprite at (px,py) = bottom-centre, drawing at x=px-16, y=py-48.

WHAT IT CHECKS (each of these has a real failure mode)
    - dimensions are an exact multiple of the cell           -> misaligned slices
    - every cell has opaque pixels                           -> a missing frame
    - lowest opaque row within 2px of the cell bottom        -> character floats
    - horizontal centre of the foot pixels within 2px of mid -> character drifts
    - semi-transparent pixels (0 < a < 255)                  -> AA halo at scale
    - a dark blob under the feet                             -> baked shadow
    - colour count per character                             -> palette sanity
    - stand vs stepA vs stepB actually differ                -> copied frames

OUTPUT
    assets/sprites/<ID>.sheet.png     (copied, never altered)
    assets/sprites/<ID>.sprite.js     GENERATED - do not hand-edit
"""
import sys, os, shutil
import numpy as np
from PIL import Image

DIRS = ['down', 'up', 'left', 'right',
        'downleft', 'downright', 'upleft', 'upright']

def die(msg): print('  ERROR:', msg); sys.exit(1)

def main():
    # Parse argv once, consuming --cell's value so it can't leak into the
    # positional sheet path. Both --cell WxH and --cell=WxH work (the docstring
    # advertises the space form; the old split-only parser silently choked on
    # it, which is why a 2x intake used to traceback).
    raw = sys.argv[1:]
    cw, chh = 32, 48
    strict = False
    args = []
    i = 0
    while i < len(raw):
        a = raw[i]
        if a == '--strict':
            strict = True; i += 1
        elif a == '--cell':
            if i + 1 >= len(raw): die('--cell needs a value, e.g. --cell 64x96')
            cw, chh = (int(x) for x in raw[i + 1].lower().split('x')); i += 2
        elif a.startswith('--cell='):
            cw, chh = (int(x) for x in a.split('=', 1)[1].lower().split('x')); i += 1
        elif a.startswith('--'):
            print(f'  WARN: unknown flag {a}'); i += 1
        else:
            args.append(a); i += 1
    if not args:
        sys.exit('usage: py tools\\sprite_intake.py <sheet.png> [--cell WxH] [--strict]')
    src = args[0]
    if not os.path.isfile(src): die(f'file not found: {src}')

    base = os.path.basename(src)
    ID = base.replace('.sheet.png', '').replace('.png', '').upper()

    im = Image.open(src)
    if im.mode != 'RGBA':
        print(f'  WARN: mode is {im.mode}, converting view to RGBA for checks')
        im = im.convert('RGBA')
    a = np.array(im)
    H, W = a.shape[:2]
    alpha = a[..., 3]

    print(f'== {ID} ==  {W}x{H}  cell {cw}x{chh}')
    warns = []

    if W % cw or H % chh:
        die(f'{W}x{H} is not a multiple of the {cw}x{chh} cell '
            f'(nearest: {W//cw*cw}x{H//chh*chh})')
    cols, rows = W // cw, H // chh
    print(f'   grid: {cols} cols x {rows} rows')
    if rows not in (4, 8):
        die(f'{rows} rows; need 4 (cardinals) or 8 (cardinals + diagonals: '
            'down, up, left, right, downleft, downright, upleft, upright)')
    if cols < 3:
        die(f'{cols} cols; need at least 3 (stand, stepA, stepB)')

    semi = int(((alpha > 0) & (alpha < 255)).sum())
    if semi:
        warns.append(f'{semi} semi-transparent pixels — anti-aliased edges will '
                     f'read as a halo at integer scale. Hard alpha only.')

    opaque_total = int((alpha == 255).sum())
    cols_used = len({tuple(p) for p in a[alpha == 255][:, :3]}) if opaque_total else 0
    print(f'   opaque px {opaque_total}   colours {cols_used}   semi-alpha {semi}')

    # Tolerances scale with the cell so a resolution bump doesn't inflate the
    # flag count on identical poses. Each reduces to its original 32x48 constant
    # (float_tol 2, foot_band 3, foot_tol 2, shadow_band 3), so scale-1 intake is
    # unchanged; at 64x96 they double, preserving the ON-SCREEN meaning of each
    # flag (the sheet is downsampled into the same box before it is drawn). This
    # is the contact-shadow lesson again: a bar tuned in absolute px on a 32-cell
    # is twice as tight on a 64-cell.
    float_tol = max(2, round(chh / 24))     # baseline float: 2 @48, 4 @96
    foot_band = max(3, round(chh / 16))     # rows counted as "foot": 3 @48, 6 @96
    foot_tol = max(2.0, cw / 16)            # foot-centre drift: 2 @32, 4 @64
    shadow_band = max(3, round(chh / 16))   # bottom rows scanned for a baked shadow

    frames = {}
    for r in range(rows):
        for c in range(cols):
            cell = a[r*chh:(r+1)*chh, c*cw:(c+1)*cw]
            al = cell[..., 3]
            tag = f'{DIRS[r]}[{c}]'
            if not (al == 255).any():
                die(f'{tag}: cell is empty')
            ys, xs = np.nonzero(al == 255)
            bottom = ys.max()
            if bottom < chh - 1 - float_tol:
                warns.append(f'{tag}: lowest pixel at row {bottom} of {chh-1} — '
                             f'character floats {chh-1-bottom}px above the baseline')
            foot = xs[ys >= bottom - foot_band]
            fc = foot.mean() if len(foot) else cw / 2
            if abs(fc - (cw - 1) / 2) > foot_tol:
                warns.append(f'{tag}: foot centre at x={fc:.1f}, want {(cw-1)/2:.1f} — '
                             f'sprite will drift {fc-(cw-1)/2:+.1f}px from its anchor')
            # Baked drop shadow: a dark opaque mass in the bottom rows that
            # fans out WIDER than the feet (a ground ellipse). Dark footwear is
            # dark and wide too, so the shoes alone must not trip this — the
            # discriminator is that a shadow sticks out past the legs/shoes,
            # while shoes are no wider than the foot silhouette just above them.
            strip = cell[chh-shadow_band:, :, :]
            sa = strip[..., 3] == 255
            if sa.sum() > cw * 1.2:
                lum = strip[..., :3][sa].mean()
                bx = np.nonzero(sa.any(axis=0))[0]
                bottom_w = bx[-1] - bx[0] + 1 if len(bx) else 0
                # foot/ankle width just ABOVE the scanned band
                above = cell[chh-2*shadow_band:chh-shadow_band, :, 3] == 255
                ax = np.nonzero(above.any(axis=0))[0]
                foot_w = ax[-1] - ax[0] + 1 if len(ax) else bottom_w
                if lum < 60 and bottom_w > foot_w * 1.4:
                    warns.append(f'{tag}: dark mass on the bottom rows fans wider '
                                 f'than the feet — drop shadow baked in? the engine '
                                 f'draws it.')
            frames[(r, c)] = cell

    for r in range(rows):
        sig = [frames[(r, c)].tobytes() for c in range(min(3, cols))]
        if sig[0] == sig[1] == sig[2]:
            warns.append(f'{DIRS[r]}: stand/stepA/stepB are identical — no walk cycle')
        elif sig[1] == sig[2]:
            warns.append(f'{DIRS[r]}: stepA and stepB are identical — the walk will limp')

    if warns:
        print(f'\n   {len(warns)} FLAG(S) — art is never fixed here, only reported:')
        for w in warns: print(f'     ! {w}')
    else:
        print('\n   clean')
    if warns and strict:
        sys.exit(1)

    outdir = os.path.join('assets', 'sprites')
    os.makedirs(outdir, exist_ok=True)
    dst = os.path.join(outdir, f'{ID}.sheet.png')
    if os.path.abspath(src) != os.path.abspath(dst):
        shutil.copyfile(src, dst)

    js = os.path.join(outdir, f'{ID}.sprite.js')
    with open(js, 'w', encoding='utf-8') as f:
        f.write(
            '// GENERATED by tools/sprite_intake.py -- DO NOT HAND-EDIT.\n'
            '// Redraw the sheet and re-run the tool instead.\n'
            f'// id={ID}  sheet={cols}x{rows} cells of {cw}x{chh}  flags={len(warns)}\n'
            '(function(){\n'
            "  var S = (typeof SPRITE_SHEETS!=='undefined') ? SPRITE_SHEETS\n"
            '        : (window.SPRITE_SHEETS = window.SPRITE_SHEETS || {});\n'
            f'  S["{ID}"] = {{cell:[{cw},{chh}],cols:{cols},rows:{rows},'
            f'url:"assets/sprites/{ID}.sheet.png",flags:{len(warns)}}};\n'
            '})();\n')
    print(f'\n   wrote {dst}')
    print(f'   wrote {js}')
    print(f'\nNEXT: Loader.add("{ID}","assets/sprites/{ID}.sheet.png")')
    print(f'      <script src="assets/sprites/{ID}.sprite.js"></script>  (before main.js)')
    print(f'      const spr = buildSheet("{ID}");   // spr.down[0..2], spr.down.idle[]')

if __name__ == '__main__':
    main()
