#!/usr/bin/env python3
"""
flap_pool.py  --  THE SEPARATOR (crew side of the Flap Studio pipeline).

WHAT IT IS. The producer drops a pile of expression grids into
`assets/portraits/raw/talking/`. This tool does the MECHANICAL half the producer
asked the crew to keep owning: normalise (resize/format), key the background,
then REGISTER every cell to one fixed base and SEPARATE each cell into
individually-selectable PARTS -- one base face, a set of eye options, a set of
mouth options -- all pre-aligned so any eye + any mouth drops onto the base with
no drift. It emits a POOL the browser Flap Studio loads so the producer can pick
base + eyes + mouth, preview the flap, and file it for dialog.

WHY IT EXISTS. `portrait_flap.py` bakes a FIXED crew-authored set (one CFG row
per mood). This generalises it: the crew separates, the producer assembles. Same
stabilisation trick underneath -- transplant only what changed onto one held
base, so head/hair/brows never move -- but split along TWO axes (eyes, mouth)
into a reusable pool instead of three hard-coded frames.

WHAT IT IS NOT. It does not choose which parts make a good flap -- that is the
producer's call in the studio. It does not write into the game (file:// = no
server); the studio exports a self-registering `.flap.js` the producer drops in.

Generated parts are NEVER hand-edited. Change the source grid or CFG and re-run.

    python3 tools/flap_pool.py            # build every character in POOLS
    python3 tools/flap_pool.py MIKE       # just one
    python3 tools/flap_pool.py --sheet    # also write a contact sheet per char
    python3 tools/flap_pool.py IZZY --measure   # estimate a character's face bands
                                          # (first step for any NEW character)
"""
import os, sys, json
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW  = os.path.join(ROOT, 'assets', 'portraits', 'raw', 'talking')
POOL = os.path.join(ROOT, 'assets', 'portraits', 'pool')
CELL = 256

# ---- per-character face geometry, in 256-cell space (y0,y1,x0,x1) -----------
# Every band here is measured on ONE character's base cell. These were GLOBAL
# constants (Mike-only) until 2026-07-14 -- the tool silently assumed every face
# sat exactly where Mike's does. It does not: a second face (Izzy) is centred
# higher and is narrower, so Mike's `mouth` band landed on her NECK (every mouth
# option came out identical) and Mike's brow cutoff missed her brows (the base
# brows ghosted through every eyes+brows option). Geometry now travels PER
# CHARACTER in POOLS[name]['geom']; GEOM_MIKE is Mike's verified set + the default.
#
#   nose        - registration band: nose bridge, below brows/eyes, above mouth,
#                 so NO expressive feature can perturb the alignment.
#   forehead    - registration band: stable forehead+hairline, above the brows.
#   upper       - eyes+brows unit ROI (ears carved out in extract_upper via `ear`).
#   mouth       - mouth ROI.
#   mouth_inner - must contain the whole CLOSED-MOUTH mark. On Mike, top-down:
#                 nostrils y122-133, bright philtrum y134-139, closed lip line
#                 y140-146, below-lip skin y147-151, chin crease y152+. INNER sits a
#                 hair wide of the lip line; the guards hard-cap the solid core so
#                 no dilation reaches the nostrils above or the chin below, and the
#                 x-bounds stay clear of the jaw outlines.
#   nose_guard / chin_guard - rows the mouth core may never cross.
#   ear         - (top_row, left_x, right_x): below top_row, pull UPPER's sides in
#                 off the ears/side-hair onto cheek skin.
#   brow_bottom - base-brow erase band is upper.y0 .. brow_bottom.
GEOM_MIKE = dict(
    nose=(118, 150, 96, 160),
    forehead=(58, 90, 68, 188),
    upper=(80, 146, 62, 194),
    mouth=(140, 214, 82, 174),
    mouth_inner=(137, 151, 98, 160),
    nose_guard=135,
    chin_guard=152,
    ear=(106, 82, 174),
    brow_bottom=98,
)

# ---- per-character intake ----------------------------------------------------
# grids: source files (any grid whose W,H divide by 256). base=(grid,cell) is the
# rest face everything registers to -- closed mouth, open eyes, head upright.
# eye_thr/mouth_thr: mean-abs-luma change (0..255) inside a ROI to count a cell as
# carrying an eye / mouth variant. A cell may yield BOTH.
POOLS = {
    'MIKE': dict(
        grids=['MIKE.talking-1.png', 'MIKE.speaking.png', 'MIKE.yelling.png',
               'MIKE.faces-browraise.png', 'MIKE.faces-wide.png', 'MIKE.faces-excited.png',
               'MIKE.faces-scream.png', 'MIKE.faces-worried.png', 'MIKE.faces-2.png',
               'MIKE.faces-speaking2.png'],
        base=('MIKE.talking-1.png', 8),
        eye_thr=10, mouth_thr=10,        # eyes = the whole eyes+brows unit
        eye_dup=16.0, mouth_dup=17.0,    # perceptual mean-abs-luma; below this = duplicate
        geom=GEOM_MIKE,
    ),
    'IZZY': dict(
        grids=['IZZY.neutral-1.png', 'IZZY.neutral-2.png', 'IZZY.talking-smooth.png',
               'IZZY.talking-warm.png', 'IZZY.whisper.png', 'IZZY.confused.png',
               'IZZY.sad.png', 'IZZY.screaming.png', 'IZZY.yelling.png'],
        base=('IZZY.neutral-1.png', 1),  # provisional: top-middle, open eyes, closed mouth
        eye_thr=10, mouth_thr=10,
        eye_dup=16.0, mouth_dup=17.0,
        # measured from her own grids (§ DEVLOG 30): she sits ~20px higher than Mike
        # and is narrower. brows y68-82, eyes y84-108, nostrils ~y113-120, closed lip
        # y127-134, open mouth (scream) down to ~y174; face skin x70-184 @ eye level.
        geom=dict(
            nose=(109, 121, 96, 160),      # quiet bridge/nostril band between eyes & mouth
            forehead=(40, 66, 72, 184),    # part-line + hairline: stable high-contrast anchor
            upper=(62, 116, 58, 194),      # eyes+brows unit
            mouth=(120, 180, 84, 172),     # closed y127-134, reaches open scream jaw ~y174
            mouth_inner=(125, 138, 100, 158),
            nose_guard=124, chin_guard=140,
            ear=(94, 71, 184), brow_bottom=84,
        ),
    ),
    'NOAH': dict(
        grids=['NOAH.1.png','NOAH.2.png','NOAH.3.png','NOAH.4.png',
               'NOAH.5.png','NOAH.6.png','NOAH.7.png','NOAH.8.png'],
        base=('NOAH.1.png', 1),          # provisional: top-middle, open eyes, closed smile
        eye_thr=10, mouth_thr=10,
        eye_dup=16.0, mouth_dup=17.0,
        # measured from his own grids: sits between Mike & Izzy, wider face.
        # brows y82-95, eyes y96-118, nostrils ~y122-128, closed lip y133-138,
        # open mouth (scream) to ~y189; face skin x70-198 @ eye level.
        geom=dict(
            nose=(119, 132, 96, 164),
            forehead=(62, 84, 74, 192),
            upper=(80, 124, 58, 200),
            mouth=(126, 194, 88, 176),
            mouth_inner=(131, 141, 104, 158),
            nose_guard=130, chin_guard=143,
            ear=(80, 72, 176), brow_bottom=97,
        ),
    ),
}

# =============================================================================
def load_cells(grid):
    im = Image.open(os.path.join(RAW, grid)).convert('RGBA')
    W, H = im.size
    cols, rows = W // CELL, H // CELL
    out = []
    for r in range(rows):
        for c in range(cols):
            out.append(np.asarray(im.crop((c*CELL, r*CELL, (c+1)*CELL, (r+1)*CELL))).astype(np.int16))
    return out

def luma(a):
    return a[:, :, 0]*0.299 + a[:, :, 1]*0.587 + a[:, :, 2]*0.114

def key_bg(a):
    """Transparent background from a keyed OR black-matte cell. Floods dark from
    the four corners so a black-matte cell (cell 0 in these grids) keys the same
    as an already-transparent one, without eating dark hair inside the head."""
    a = a.copy()
    l = luma(a)
    dark = l < 26
    h, w = dark.shape
    seen = np.zeros_like(dark)
    stack = [(0, 0), (0, w-1), (h-1, 0), (h-1, w-1)]
    while stack:                                   # flood dark region from corners
        y, x = stack.pop()
        if y < 0 or x < 0 or y >= h or x >= w or seen[y, x] or not dark[y, x]:
            continue
        seen[y, x] = True
        stack += [(y+1, x), (y-1, x), (y, x+1), (y, x-1)]
    a[seen, 3] = 0
    # also honour any alpha the source already carried
    a[:, :, 3] = np.minimum(a[:, :, 3], np.where(seen, 0, 255)).astype(np.int16)
    return a

def register(base, don, geom):
    """Robust global head alignment: minimise SSE over BOTH a forehead band and a
    nose band -- expression-stable, and skipping the eye/brow/mouth zone so a
    closed lid or open mouth can't pull the alignment. Handles PixelLab per-cell
    drift on arbitrary generated cells."""
    bl, dl = luma(base), luma(don); best = (0, 0, 1e18)
    bands = (geom['forehead'], geom['nose'])
    for dy in range(-14, 15):
        for dx in range(-7, 8):
            s = np.roll(np.roll(dl, dy, 0), dx, 1)
            d = sum(((bl[y0:y1, x0:x1] - s[y0:y1, x0:x1])**2).mean() for (y0, y1, x0, x1) in bands)
            if d < best[2]: best = (dx, dy, d)
    return best[0], best[1]

def register_on(base, moving, band, ry=10, rx=4):
    y0, y1, x0, x1 = band
    bl, ml = luma(base), luma(moving); best = (0, 0, 1e18)
    for dy in range(-ry, ry+1):
        for dx in range(-rx, rx+1):
            s = np.roll(np.roll(ml, dy, 0), dx, 1)
            d = ((bl[y0:y1, x0:x1] - s[y0:y1, x0:x1])**2).mean()
            if d < best[2]: best = (dx, dy, d)
    return np.roll(np.roll(moving, best[1], 0), best[0], 1)

def roi_change(base, aligned, roi):
    y0, y1, x0, x1 = roi
    d = np.abs(luma(base) - luma(aligned))
    return float(d[y0:y1, x0:x1].mean())

def extract_part(base, aligned, roi, thr=14, grow=7, blur=3):
    """Masked RGBA overlay of just the changed pixels inside a ROI, on a
    transparent 256 canvas -- composites onto the base by alpha-over."""
    y0, y1, x0, x1 = roi
    d = np.abs(luma(base) - luma(aligned))
    box = np.zeros(d.shape, bool); box[y0:y1, x0:x1] = True
    change = (d > thr) & box
    m = Image.fromarray((change*255).astype(np.uint8)) \
             .filter(ImageFilter.MaxFilter(grow)).filter(ImageFilter.GaussianBlur(blur))
    m = (np.asarray(m).astype(float)/255.0)
    part = aligned.copy().astype(float)
    part[:, :, 3] = np.clip(part[:, :, 3], 0, 255) * m
    return part.astype(np.int16)

def extract_mouth(base, aligned, roi, geom, thr=14, grow=7, blur=3, soft=140, pad=2):
    """Mouth = the changed-pixel overlay (extract_part) PLUS a solid core that
    always covers the base's OWN closed-mouth mark. The changed-pixel mask alone
    left the base lips wherever a donor pixel happened to match their luma, and
    at anti-aliased lip edges below thr -- the 'mouth ghost' (same class of bug
    the brows had), visible under the nose whenever the donor's mouth sat LOWER
    than the base's closed lips. The core is located DYNAMICALLY from the base:
    pixels below a SOFT luma threshold (`soft`, so the anti-aliased lip halo is
    caught, not just the <100 core the previous version used) inside geom's
    mouth_inner -- which bounds the ACTUAL closed lip line (y140-146 on Mike), not
    the chin the old value mis-measured. Row-span filled so any teeth between the
    lip lines ride along, dilated `pad` for the remaining halo, then hard-clamped
    between geom's nose_guard and chin_guard so no dilation reaches the nostrils or
    the chin crease. Inside the core the donor face replaces the base at full
    alpha -- the donor, not a mask edge, decides what the lip zone looks like.
    Feather spills only OUTWARD (same trick as extract_upper); nothing outside
    the guarded INNER is solidified, so nose, jaw outline and chin are untouched."""
    part = extract_part(base, aligned, roi, thr=thr, grow=grow, blur=blur)
    iy0, iy1, ix0, ix1 = geom['mouth_inner']
    bl = luma(base)
    mark = np.zeros(bl.shape, bool)
    mark[iy0:iy1, ix0:ix1] = bl[iy0:iy1, ix0:ix1] < soft   # lip line + AA halo
    core = np.zeros_like(mark)
    for y in np.where(mark.any(1))[0]:                     # row-span fill: lips AND teeth
        xs = np.where(mark[y])[0]
        core[y, xs.min():xs.max()+1] = True
    core = np.asarray(Image.fromarray((core*255).astype(np.uint8))
                      .filter(ImageFilter.MaxFilter(2*pad+1))) > 0
    guard = np.zeros_like(mark)                            # never reach the nose or chin
    guard[max(geom['nose_guard'], iy0-pad):min(geom['chin_guard'], iy1+pad),
          ix0-pad:ix1+pad] = True
    core &= guard
    part[core, :3] = aligned[core, :3]                     # donor face, solid
    soft_a = np.asarray(Image.fromarray((core*255).astype(np.uint8))
                        .filter(ImageFilter.GaussianBlur(blur))).astype(float)/255.0
    part[:, :, 3] = np.maximum(part[:, :, 3], np.maximum(core*255, soft_a*255)).astype(np.int16)
    return part

def extract_upper(base, aligned, roi, geom, dark=88, feather=3):
    """Eyes + eyebrows as ONE unit, base brows guaranteed erased, and the base's
    EARS / side-hair protected. The whole UPPER region is covered solidly (no base-
    brow bleed), but near the edges we never overwrite base facial skin with the
    donor's warm hair/ear tone -- that was painting a 'mullet' down the sides.
    The central eyes+brows still replace fully."""
    y0, y1, x0, x1 = roi
    H, W = luma(base).shape
    bl, dl = luma(base), luma(aligned)
    box = np.zeros((H, W), bool); box[y0:y1, x0:x1] = True
    # carve the ears out: below the brow band, pull the sides in onto cheek skin
    # (ears live outside `ear` left_x/right_x; face skin at eye level sits between).
    et, elx, erx = geom['ear']
    box[et:y1, x0:elx] = False
    box[et:y1, erx:x1] = False
    win = base[max(0, y0-16):y0+4, :, :3].astype(float)
    winl = win[:, :, 0]*0.299 + win[:, :, 1]*0.587 + win[:, :, 2]*0.114
    skin = win[np.argmax(winl, 0), np.arange(W)]

    part = np.zeros((H, W, 4), float)
    part[:, :, :3] = base[:, :, :3]
    part[box, :3] = aligned[box, :3]                                 # donor eyes+brows

    # protect base ears/side-hair: in the peripheral band, don't let the donor's
    # warm hair/ear tone overwrite base facial skin. Central eyes+brows untouched.
    periph = np.zeros((H, W), bool)
    periph[y0:y1, x0:x0+16] = True; periph[y0:y1, x1-16:x1] = True; periph[y0:y0+10, x0:x1] = True
    warm = (aligned[:, :, 0] > 88) & (aligned[:, :, 0] - aligned[:, :, 2] > 22) & (dl > 38) & (dl < 150)
    protect = box & periph & warm & (bl > 150)
    part[protect, :3] = base[protect, :3]

    hole = box & (aligned[:, :, 3] < 128)
    part[hole, :3] = skin[np.where(hole)[1]]
    brow = np.zeros((H, W), bool); brow[y0:geom['brow_bottom'], x0:x1] = True
    erase = brow & (bl < dark) & (dl >= dark)
    part[erase, :3] = skin[np.where(erase)[1]]

    hard = box.astype(np.float32)
    soft = np.asarray(Image.fromarray((box*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(feather))).astype(float)/255.0
    part[:, :, 3] = 255 * np.maximum(hard, soft)
    return part.astype(np.int16)

def gray_roi(arr, roi):
    y0, y1, x0, x1 = roi
    g = luma(arr)[y0:y1, x0:x1]
    im = Image.fromarray(np.clip(g, 0, 255).astype(np.uint8)).resize((24, 24), Image.LANCZOS)
    return np.asarray(im).astype(float)

def comp_over(base, part):
    b = base.astype(float); o = part.astype(float)
    a = np.clip(o[:, :, 3:4], 0, 255) / 255.0
    out = b.copy(); out[:, :, :3] = b[:, :, :3]*(1-a) + o[:, :, :3]*a
    return out

def fp(base, part, roi):
    """Perceptual fingerprint of what the part actually looks like ON the base,
    inside its ROI -- so near-identical results collapse regardless of which grid
    they came from."""
    return gray_roi(comp_over(base, part), roi)

def dist(a, b):
    return float(np.abs(a - b).mean())

def save_png(arr, path):
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGBA').save(path)

def measure_geom(name, cfg):
    """Estimate where a character's face bands actually sit, from their own grids.
    This is the instrument that stops the geometry from being hand-guessed (which
    is how Mike's numbers got silently applied to Izzy). It reports a per-row
    change profile (features move when talking -> eyes band high in the upper
    face, mouth band high in the lower face), the face's horizontal extent, and
    the base's closed-lip row -- then prints a SUGGESTED geom block. The suggestion
    is a starting estimate to confirm at zoom, not a finished answer: set it in
    POOLS[name]['geom'], rebuild with --sheet, and check the contact sheet."""
    base = key_bg(load_cells(cfg['base'][0])[cfg['base'][1]])
    cells = [key_bg(c) for g in cfg['grids'] for c in load_cells(g)]
    bl = luma(base)
    face = base[:, :, 3] > 128                                   # opaque face+hair
    # face x-extent at eye level (mid-upper face), and full width (incl. ears)
    eye_rows = slice(95, 120)
    cols_face = np.where(face[eye_rows].any(0))[0]
    fx0, fx1 = (int(cols_face.min()), int(cols_face.max())) if len(cols_face) else (0, CELL)
    # per-row change across all cells (unregistered: drift is only a few px, the
    # gross band position survives) -- restricted to face columns
    prof = np.zeros(CELL)
    for c in cells:
        d = np.abs(bl - luma(c))
        d[:, :fx0] = 0; d[:, fx1+1:] = 0
        prof += d.mean(1)
    prof /= max(len(cells), 1)

    def band(lo, hi):                                            # contiguous hot band in [lo,hi)
        seg = prof[lo:hi]
        if seg.max() <= 0: return (lo, hi)
        thr = seg.max() * 0.35
        hot = np.where(seg > thr)[0]
        return (lo + int(hot.min()), lo + int(hot.max()) + 1)
    # search the two feature bands in SEPARATE windows so they can't merge and the
    # nose (the quiet strip between them) is always a valid, non-empty gap.
    eyes = band(78, 126)                                         # eyes+brows: upper face
    mouth = band(134, 206)                                       # mouth: lower face
    nose_y0, nose_y1 = eyes[1] + 2, mouth[0] - 2                 # quiet strip between
    if nose_y1 <= nose_y0: nose_y0, nose_y1 = mouth[0] - 22, mouth[0] - 4
    # closed-lip row on the base, inside the mouth band, over the face centre
    cx0, cx1 = fx0 + (fx1 - fx0) // 4, fx1 - (fx1 - fx0) // 4
    lip_prof = 255 - bl[mouth[0]:mouth[1], cx0:cx1].min(1)       # darkest row = lip line
    lip = mouth[0] + int(np.argmax(lip_prof))

    print(f"\n== measured geometry for {name} (base {cfg['base']}) ==")
    print(f"  face x-extent @ eye level : x{fx0}..{fx1}  (width {fx1-fx0})")
    print(f"  eyes+brows band (change)  : y{eyes[0]}..{eyes[1]}")
    print(f"  nose quiet band           : y{nose_y0}..{nose_y1}")
    print(f"  mouth band (change)       : y{mouth[0]}..{mouth[1]}")
    print(f"  base closed-lip row       : y{lip}")
    prof_rows = ' '.join(f"{y}:{prof[y]:.0f}" for y in range(60, 210, 10))
    print(f"  change/row (y:val)        : {prof_rows}")
    ear_l = fx0 + (fx1 - fx0) // 5
    ear_r = fx1 - (fx1 - fx0) // 5
    print("  --- SUGGESTED geom (verify at zoom, then paste into POOLS) ---")
    print(f"    geom=dict(")
    print(f"        nose=({nose_y0}, {nose_y1}, {cx0}, {cx1}),")
    print(f"        forehead=({max(0,eyes[0]-22)}, {eyes[0]-2}, {fx0+6}, {fx1-6}),")
    print(f"        upper=({eyes[0]-4}, {mouth[0]-4}, {fx0-6}, {fx1+6}),")
    print(f"        mouth=({mouth[0]}, {min(CELL,mouth[1]+6)}, {ear_l}, {ear_r}),")
    print(f"        mouth_inner=({lip-3}, {lip+5}, {cx0+2}, {cx1-2}),")
    print(f"        nose_guard={mouth[0]-5}, chin_guard={lip+6},")
    print(f"        ear=({eyes[1]}, {ear_l}, {ear_r}), brow_bottom={eyes[0]+18},")
    print(f"    ),")
    return dict(eyes=eyes, mouth=mouth, nose=(nose_y0, nose_y1), lip=lip, face_x=(fx0, fx1))

def build_char(name, cfg, want_sheet=False):
    outdir = os.path.join(POOL, name)
    os.makedirs(outdir, exist_ok=True)
    geom = cfg.get('geom', GEOM_MIKE)                # per-character face geometry
    for f in os.listdir(outdir):                     # parts are generated; wipe & rebuild
        if f.endswith('.png') or f.endswith('.json'):
            os.remove(os.path.join(outdir, f))

    base = key_bg(load_cells(cfg['base'][0])[cfg['base'][1]])
    save_png(base, os.path.join(outdir, 'base.0.png'))

    # axis -> (roi, thr key, dup key, extractor, reg2). 'eyes' carries eyes AND
    # eyebrows as one unit (extract_upper, solid patch); 'mouth' is a changed-pixel
    # overlay plus a solid core over the base's own lips (extract_mouth) so the
    # base mouth can never ghost through.
    AX = {
        'eyes':  (geom['upper'], 'eye_thr',   'eye_dup',   extract_upper, None),
        'mouth': (geom['mouth'], 'mouth_thr', 'mouth_dup', extract_mouth, None),
    }
    parts = {a: [] for a in AX}
    fps = {a: [gray_roi(base, AX[a][0])] for a in AX}
    prov = {'base': dict(file='base.0.png', src=list(cfg['base']))}
    for a in AX: prov[a] = []

    cands = []
    for grid in cfg['grids']:
        for idx, raw in enumerate(load_cells(grid)):
            c = key_bg(raw)
            dx, dy = register(base, c, geom)
            al = np.roll(np.roll(c, dy, 0), dx, 1)
            for a, (roi, thrk, _dupk, extract, reg2) in AX.items():
                ala = register_on(base, al, reg2) if reg2 else al
                ch = roi_change(base, ala, roi)
                if ch > cfg[thrk]:
                    cands.append((a, ch, extract(base, ala, roi, geom), grid, idx, [dx, dy]))

    cands.sort(key=lambda t: -t[1])                  # most-distinct first
    for a, change, part, grid, idx, off in cands:
        roi, _thrk, dupk, _ex, _r2 = AX[a]
        f = fp(base, part, roi)
        if min(dist(f, g) for g in fps[a]) < cfg[dupk]:
            continue
        fps[a].append(f); n = len(parts[a])
        save_png(part, os.path.join(outdir, f'{a}.{n}.png'))
        prov[a].append(dict(file=f'{a}.{n}.png', src=[grid, idx],
                            change=round(change, 1), off=off))
        parts[a].append(part)

    prov['rois'] = dict(nose=geom['nose'], upper=geom['upper'],
                        mouth=geom['mouth'], mouth_inner=geom['mouth_inner'])
    json.dump(prov, open(os.path.join(outdir, 'pool.json'), 'w'), indent=2)
    print(f"  {name}: base + {len(parts['eyes'])} eyes+brows + {len(parts['mouth'])} mouth "
          f"option(s) from {len(cfg['grids'])} grid(s)"
          f" -> {os.path.relpath(outdir, ROOT)}")

    if want_sheet:
        contact_sheet(name, base, parts, outdir)
    return prov

def contact_sheet(name, base, parts, outdir):
    """base | base+each brow | base+each eye | base+each mouth -- split check."""
    TH = 128
    def comp(overlay=None):
        b = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8), 'RGBA')
        if overlay is not None:
            o = Image.fromarray(np.clip(overlay, 0, 255).astype(np.uint8), 'RGBA')
            b = Image.alpha_composite(b, o)
        bg = Image.new('RGBA', b.size, (120, 120, 120, 255))
        return Image.alpha_composite(bg, b).convert('RGB').resize((TH, TH), Image.LANCZOS)
    tiles = [('BASE', comp())]
    for a in ('eyes', 'mouth'):
        for i, p in enumerate(parts[a]):
            tiles.append((f'{a[:5]}{i}', comp(p)))
    per = max(6, int(len(tiles)**0.5) + 2)
    rows = (len(tiles) + per - 1) // per
    pad = 8
    W = per*(TH+pad)+pad; H = rows*(TH+pad+16)+pad
    s = Image.new('RGB', (W, H), (25, 25, 25)); d = ImageDraw.Draw(s)
    for k, (lab, im) in enumerate(tiles):
        r, c = divmod(k, per)
        x = pad + c*(TH+pad); y = pad + r*(TH+pad+16)
        s.paste(im, (x, y+14)); d.text((x, y), lab, fill=(230, 230, 230))
    p = os.path.join(outdir, '_contact_sheet.png')
    s.save(p); print(f"      contact sheet -> {os.path.relpath(p, ROOT)}")

def b64(path):
    import base64
    return 'data:image/png;base64,' + base64.b64encode(open(path, 'rb').read()).decode()

def studio(names):
    tpl = os.path.join(os.path.dirname(__file__), '_flap_studio_template.html')
    if not os.path.isfile(tpl):
        print('  (no _flap_studio_template.html beside the tool; skipping --studio)'); return
    pool = {}
    for n in names:
        d = os.path.join(POOL, n)
        pj = os.path.join(d, 'pool.json')
        if not os.path.isfile(pj):
            print(f'  (no pool for {n}; run the separator first)'); continue
        prov = json.load(open(pj))
        def parts(axis):
            return [{'id': p['file'].rsplit('.png', 1)[0], 'src': b64(os.path.join(d, p['file']))} for p in prov.get(axis, [])]
        pool[n] = dict(
            base={'src': b64(os.path.join(d, prov['base']['file']))},
            eyes=parts('eyes'), mouth=parts('mouth'),
            disk_flaps=sorted(                       # already-exported flaps on disk (seed the inventory)
                f[len(n)+1:-len('.flap.js')]
                for f in os.listdir(os.path.join(ROOT, 'assets', 'portraits', 'flaps'))
                if f.startswith(n + '.') and f.endswith('.flap.js')
            ) if os.path.isdir(os.path.join(ROOT, 'assets', 'portraits', 'flaps')) else [],
        )
    if not pool:
        print('  (nothing to bake into the studio)'); return
    html = open(tpl, encoding='utf-8').read().replace('__POOL__', json.dumps(pool))
    outp = os.path.join(os.path.dirname(__file__), 'flap_studio.html')
    open(outp, 'w', encoding='utf-8').write(html)
    print(f"  studio -> {os.path.relpath(outp, ROOT)}  ({len(html)//1024} kB, chars: {', '.join(pool)})")

if __name__ == '__main__':
    if not os.path.isdir(RAW):
        sys.exit(f'  ERROR: {RAW} not found')
    want_sheet = '--sheet' in sys.argv
    want_studio = '--studio' in sys.argv
    want_measure = '--measure' in sys.argv
    picks = [a.upper() for a in sys.argv[1:] if not a.startswith('-')]
    names = picks or list(POOLS)
    if want_measure:
        for n in names:
            if n not in POOLS:
                print(f'  (no POOLS entry for {n}; add grids+base first)'); continue
            measure_geom(n, POOLS[n])
        sys.exit(0)
    print('== flap_pool: separating grids into selectable parts ==')
    built = []
    for n in names:
        if n not in POOLS:
            print(f'  (no POOLS entry for {n}; skipping)'); continue
        build_char(n, POOLS[n], want_sheet); built.append(n)
    if want_studio:
        studio(built)
