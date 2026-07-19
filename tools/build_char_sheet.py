#!/usr/bin/env python3
# coding: utf-8
"""
RADIO UNDERGROUND v2 - tools/build_char_sheet.py
Assemble <ID>.sheet.png from a folder of producer walk sources.

This is the character-agnostic successor to build_mike_sheet.py. It is a
COMPOSITING step (crew work), the sibling of maskpaint->mask2json for rooms:
it converts producer-supplied source (walk animations) into the sheet the
engine wants. It NEVER draws new art. Per the constitution, it only
measures, selects, trims, scales, registers, and packs.

WHY GENERAL. Two characters (Mike, Izzy) arrived with the SAME 8-direction
structure but MIXED containers - some directions as animated GIFs, some as
PNG frame-strips - and Noah/Saltman are next. Rule 10 (scale over one-off):
one builder, driven by a per-character folder, beats a tool per cast member.

INPUT. A folder assets/sprites/raw/<name>/ holding one source per direction,
named  *-<dir>.<ext>  where <dir> is one of:
    forward|down  up  left  right  down-left  down-right  up-left  up-right
Each source is a full walk CYCLE in either container:
    - GIF: every frame is one cycle frame.
    - PNG strip 512x384: a 4x3 grid of 128px cells, row-major (some cells may
      be blank - they are dropped).
A 4-source folder (cardinals only) yields a 96x192 sheet; all 8 yields 96x384.

WHAT IT DOES, per direction:
    - loads the cycle's frames from whichever container,
    - DROPS junk frames: blank cells (near-zero opaque) and any frame carrying
      a baked black matte (a huge near-black opaque mass - e.g. Izzy's back
      pose shipped with a black box on frame 0),
    - AUTO-PICKS stand / stepA / stepB from the walk cycle. Opposite legs are
      exactly half a cycle apart, so stepA / stepB are the frame whose legs
      differ MOST from their half-cycle partner and that partner (guaranteed
      opposite legs); stand is the quarter-cycle passing pose between them (feet
      together). No per-view heuristic, so the front/back walks no longer read
      one-legged. Override per character+direction below.
    - trims, scales every frame to one CONSTANT on-screen height (head never
      pops), registers HORIZONTALLY by the torso centroid (steady across a
      stride, unlike the swinging feet), plants the feet on the baseline,
      hard-snaps alpha,
    - packs cardinals-first, then diagonals: the row order the engine and
      sprite_intake.py both expect.

De-blinking (transplanting open eyes onto a closed-eye stride frame) is NOT
done here. The old Mike art blinked mid-stride; this repaint does not, so the
crew touches no pixels. If a future sheet blinks, port deblink() back from
git history for build_mike_sheet.py and gate it per direction.

The result is validated + registered by tools/sprite_intake.py, exactly like a
hand-drawn sheet. Change picks/overrides here and re-run; never hand-edit the
<ID>.sheet.png or <ID>.sprite.js.

    py tools\\build_char_sheet.py MIKE assets/sprites/raw/mike_walk
    py tools\\build_char_sheet.py IZZY assets/sprites/raw/izzy_walk
"""
import os, sys, glob
import numpy as np
from PIL import Image, ImageSequence

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CARDINALS = ['down', 'up', 'left', 'right']
DIAGONALS = ['downleft', 'downright', 'upleft', 'upright']
# Sheet row order MUST match DIRS8 in src/game/sprites.js and DIRS in
# tools/sprite_intake.py: cardinals first, then diagonals.

# filename token (after '*-walking-' or trailing) -> canonical direction
TOKEN = {
    'forward': 'down', 'down': 'down', 'up': 'up', 'back': 'up',
    'left': 'left', 'right': 'right',
    'down-left': 'downleft', 'downleft': 'downleft',
    'down-right': 'downright', 'downright': 'downright',
    'up-left': 'upleft', 'upleft': 'upleft',
    'up-right': 'upright', 'upright': 'upright',
}

# Optional per-character, per-direction explicit frame picks, promoted from
# review exactly like build_mike_sheet.py's JOBS. dir -> (stand, [A, B]),
# indexed into the CLEANED frame list (after junk frames are dropped).
# These pick from the WALK cycle. They control the STEP frames; the stand is
# taken from STANDING below when a standing source exists for the character.
OVERRIDES = {
    # MIKE's up-left / up-right walk sources are clean for the first several
    # frames, then the figure TURNS toward the adjacent cardinal (up-left drifts
    # to left at frame 6+, up-right drifts to right at frame 7+). Worse (found
    # night 22): each source holds the diagonal for only ~HALF a walk cycle, so
    # it contains only ONE clean wide contact; the opposite-leg contact occurs
    # entirely inside the turned zone. No pin can satisfy same-facing AND
    # true-opposite-contacts for stepB — these are the least-bad picks:
    # stepA = the true wide clean contact (upleft f2, upright f1; night 21 had
    # pinned near-passing f4s here, which is why both diagonals shuffled),
    # stepB = the least-turned opposite contact (upleft f6, upright f8 -- in
    # color, upleft f7/f8 show progressively more face and read MORE turned
    # than f6 despite lower silhouette drift; judge facing by color, not XOR).
    # If stepB's drift reads on the producer's screen, the SOURCE needs a clean
    # second contact drawn -- selection is exhausted. (The stand index here is
    # ignored -- MIKE's stand comes from the STANDING montage -- but the tuple
    # needs it.)
    'MIKE': {
        'upleft':  (0, [2, 6]),
        'upright': (0, [1, 8]),
        'right':   (0, [3, 10]),
        'up':      (0, [4, 10]),
    },
}

# Frame order of a producer standing-rotation turnaround: the figure starts
# facing the camera and rotates through its RIGHT, so frame k faces ROT8[k].
# CAUTION (night 23): "verified against the labelled walk sources" was claimed
# for all three ROT8 users and was WRONG for MIKE — his montage's middle row is
# laid out MIRROR-SYMMETRICALLY (upleft, up, upright: left-facing pose drawn on
# the left), not in rotation order (upright, up, upleft). Six of eight cells
# coincide either way, so the error hid in exactly the two poses hardest to
# read by eye (back diagonals, face nearly hidden). His up-diagonal stands
# rendered SWAPPED, and since the walk plays stand,A,stand,B, his head snapped
# sides twice per cycle — the "mixed facing" that survived three step repins.
# Verify a rotation source by MEASURING (face-sliver side vs the character's
# own walk steps), not by eye. SALTMAN's GIF measures true ROT8; NOAH and IZZY
# measure consistent with their walks.
ROT8 = ['down', 'downright', 'right', 'upright',
        'up',   'upleft',    'left',  'downleft']
# MIKE's montage true order (middle row mirror-symmetric, 9th cell blank):
MIKE_STAND_ORDER = ['down', 'downright', 'right', 'upleft',
                    'up',   'upright',   'left',  'downleft']

# Optional per-character STANDING source. When present, the STOPPED pose (sheet
# column 0) for each covered direction comes from this dedicated standing
# rotation instead of the walk cycle's quarter-cycle passing frame. That passing
# frame is mid-stride (one foot forward), which is why MIKE/SALTMAN read
# "one leg up" facing forward and why NOAH/SALTMAN's side stands sat a few px
# off-anchor (the passing foot pulls the centroid sideways). A dedicated
# feet-together rotation fixes both. STEP frames still come from the walk cycle.
#   'file'  : source, relative to project root (or absolute).
#   'order' : direction each source frame faces, in frame order. Frame count
#             MUST equal len(order) exactly, or the tool errors rather than
#             silently mis-facing a stand (Rule 8: a silent no-op is worse than
#             a crash). A single-frame source (Izzy's forward-only stand) lists
#             just the one direction it covers; her other seven keep the
#             walk-derived stand until an 8-dir rotation for her arrives.
STANDING = {
    'MIKE':    {'file': 'assets/sprites/raw/mike_walk/_mike-standing.png',
                'grid': (3, 3), 'order': MIKE_STAND_ORDER + [None]},
    # MIKE's stand is a 3x3 montage (9th cell blank, no matte), matching his
    # walk art (slim ~0.36 aspect) — but its middle row is MIRROR-SYMMETRIC,
    # not rotation order; see MIKE_STAND_ORDER above (night 23). It is NOT
    # mike_gifs/still-rotation.gif — that folder is the OLDER, stockier (~0.51
    # aspect) Mike and must not be used; pointing here once made his stand a
    # different size than his steps, so he pulsed wide/slim as he walked.
    # (see _archive/)
    'NOAH':    {'file': 'assets/sprites/raw/noah_walk/_noah-standing.gif',    'order': ROT8},
    'SALTMAN': {'file': 'assets/sprites/raw/saltman_walk/_saltman-standing.gif', 'order': ROT8},
    'IZZY':    {'file': 'assets/sprites/raw/izzy_walk/_izzy-standing.png',
                'grid': (3, 3), 'order': ROT8 + [None]},
    # IZZY's stand source is a 3x3 montage (384x384, 128px cells, row-major),
    # not the single front pose an earlier note claimed. Frames run in ROT8
    # order; the 9th cell is blank (order None -> skipped). The centre cell is
    # her UP pose and ships the SAME baked black matte her up-WALK did, so the
    # junk filter skips it and her up-stand stays walk-derived until a
    # matte-free up frame arrives. Seven of eight stands come from the montage.
}

# Output cell geometry. The engine's cell is 32x48 at scale 1; `--scale N`
# multiplies the whole render (cell AND figure) so the producer art is
# downsampled LESS and keeps more detail. On-screen size is held constant at
# the higher scale by halving spriteScale in the room (§ detail-pass prototype).
# These are set from --scale in main(); place() and the packer read them.
BASE_CELL_W, BASE_CELL_H, BASE_FIG_H = 32, 48, 46
CELL_W, CELL_H, FIG_H = BASE_CELL_W, BASE_CELL_H, BASE_FIG_H

DROP_EMPTY = 400      # opaque px below this -> a blank strip cell, dropped
DROP_MATTE = 1500     # near-black opaque above this -> a baked matte, dropped
                      # (legit dark clothing tops out ~583; a matte is ~8500)


def direction_of(fn):
    stem = os.path.splitext(os.path.basename(fn))[0].lower()
    # take everything after the last 'walking-' if present, else the tail token
    if 'walking-' in stem:
        tok = stem.split('walking-', 1)[1]
    else:
        tok = stem.split('-')[-1]
    return TOKEN.get(tok)


def raw_frames(path):
    """Every cycle frame from a GIF or a 512x384 4x3 PNG strip."""
    im = Image.open(path)
    if path.lower().endswith('.png') and im.size == (512, 384):
        a = np.array(im.convert('RGBA'))
        return [Image.fromarray(a[r*128:(r+1)*128, c*128:(c+1)*128])
                for r in range(3) for c in range(4)]
    return [f.convert('RGBA') for f in ImageSequence.Iterator(im)]


def is_junk(f):
    a = np.array(f); al = a[:, :, 3]
    opaque = int((al > 10).sum())
    if opaque < DROP_EMPTY:
        return 'blank'
    rgb = a[:, :, :3].astype(int)
    if int(((rgb.sum(2) < 40) & (al > 200)).sum()) > DROP_MATTE:
        return 'matte'
    return None


def clean_frames(path):
    kept, dropped = [], []
    for i, f in enumerate(raw_frames(path)):
        why = is_junk(f)
        (dropped if why else kept).append((i, why))
        if not why:
            kept[-1] = f
    kept = [f for f in kept if not isinstance(f, tuple)]
    return kept, dropped


def trimmed(f):
    a = np.array(f); al = a[:, :, 3] > 128
    ys = np.where(al.any(axis=1))[0]; xs = np.where(al.any(axis=0))[0]
    return f.crop((xs[0], ys[0], xs[-1] + 1, ys[-1] + 1))


def _leg_mask(f, W=32, H=48):
    """Trim to the figure, scale to a common box, return the bottom-half
    (legs) alpha mask. Scaling to a common box aligns frames so their leg
    silhouettes can be compared directly, regardless of native crop size."""
    a = np.array(f); al = a[:, :, 3] > 128
    ys = np.where(al.any(axis=1))[0]; xs = np.where(al.any(axis=0))[0]
    if not len(ys):
        return np.zeros((H // 2, W), bool)
    crop = f.crop((xs[0], ys[0], xs[-1] + 1, ys[-1] + 1)).resize((W, H), Image.NEAREST)
    return (np.array(crop)[:, :, 3] > 128)[H // 2:]


def autopick(fs):
    """Pick stand / stepA / stepB from a walk CYCLE, view-agnostic and robust.

    The key fact: a walk loop is periodic, so a leg and its OPPOSITE are exactly
    half a cycle apart. Comparing each frame's legs with its half-cycle partner:
      - the two CONTACT frames (legs extended, opposite feet leading) differ the
        MOST from their partner  -> stepA = argmax, stepB = half a cycle later;
      - the PASSING pose (feet together, legs swinging past) differs the LEAST,
        and sits a quarter cycle from each contact -> that is the stand.
    Half-cycle spacing guarantees stepA and stepB are opposite legs, so the walk
    can never read one-legged, and it needs no per-view spread/lift heuristic
    (the earlier one worked for side views but inverted on the front and back,
    where a stride LIFTS a foot instead of widening the stance)."""
    N = len(fs)
    legs = [_leg_mask(f) for f in fs]
    d = [int((legs[i] ^ legs[(i + N // 2) % N]).sum()) for i in range(N)]
    a = int(np.argmax(d)); b = (a + N // 2) % N          # the two contacts
    q1 = (a + N // 4) % N; q2 = (a + 3 * N // 4) % N      # the two passing poses
    stand = q1 if d[q1] <= d[q2] else q2                  # feet-together neutral
    return stand, [a, b]


def place(f):
    """Scale to a CONSTANT on-screen height (head never pops), register
    horizontally by the torso centroid (steady across a stride, unlike the
    swinging feet), feet on the baseline, hard alpha. Cell geometry is CELL_W x
    CELL_H (set from --scale); the anchor x is the cell's centre."""
    t = trimmed(f); w, h = t.size
    nh = FIG_H; nw = max(1, round(w * nh / h))
    s = t.resize((nw, nh), Image.NEAREST)
    sa = np.array(s); al = sa[:, :, 3] > 128
    yy, xx = np.where(al)
    lo, hi = int(nh * 0.25), int(nh * 0.55)     # torso band (doesn't swing)
    band = (yy >= lo) & (yy <= hi)
    torso_cx = xx[band].mean() if band.any() else xx.mean()
    cell = Image.new('RGBA', (CELL_W, CELL_H), (0, 0, 0, 0))
    ox = int(round((CELL_W - 1) / 2 - torso_cx))
    oy = CELL_H - nh                             # feet on the baseline
    cell.paste(s, (ox, oy), s)
    ca = np.array(cell); a3 = ca[:, :, 3]
    a3[(a3 > 0) & (a3 < 128)] = 0
    a3[a3 >= 128] = 255
    ca[:, :, 3] = a3
    return Image.fromarray(ca)


def frames_for(ID, d, path):
    fs, dropped = clean_frames(path)
    if len(fs) < 3:
        sys.exit(f'  ERROR: {os.path.basename(path)} has only {len(fs)} usable '
                 f'frames after dropping {len(dropped)} junk; need >=3.')
    ov = OVERRIDES.get(ID, {}).get(d)
    if ov:
        si, tis = ov
    else:
        si, tis = autopick(fs)
    note = ''
    if dropped:
        note = '  (dropped ' + ','.join(f'{i}:{w}' for i, w in dropped) + ')'
    return fs[si], [fs[tis[0]], fs[tis[1]]], (si, tis), note


def load_standing(ID):
    """Return {direction: raw stand frame} from the character's standing
    source, or {} if none configured. Frames flow through the same place() as
    the walk frames, so stand and step share scale and torso registration.

    A source is either a plain rotation (GIF: one frame per direction) or a
    'grid' montage (a rows*cols PNG of equal cells, row-major). The frame count
    must equal len(order) exactly, so a dropped/added source frame errors loudly
    rather than silently mis-facing every stand. An order entry may be None (an
    unused montage cell), and any cell the junk filter flags (a baked black
    matte, e.g. Izzy's UP pose, or a blank) is skipped -> that one direction
    keeps its walk-derived stand, and the skip is reported."""
    cfg = STANDING.get(ID)
    if not cfg:
        return {}
    path = cfg['file']
    if not os.path.isabs(path):
        path = os.path.join(ROOT, path)
    if not os.path.exists(path):
        print(f'  NOTE: no standing source for {ID} ({os.path.relpath(path, ROOT)}); '
              f'stands fall back to the walk cycle.')
        return {}
    order = cfg['order']
    grid = cfg.get('grid')
    if grid:
        rows, cols = grid
        im = Image.open(path).convert('RGBA')
        cw, ch = im.width // cols, im.height // rows
        frames = [im.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))
                  for r in range(rows) for c in range(cols)]
    else:
        frames = raw_frames(path)
    if len(frames) != len(order):
        sys.exit(f'  ERROR: standing source {os.path.basename(path)} has '
                 f'{len(frames)} frames but its order lists {len(order)} '
                 f'({order}). Fix the source or the STANDING order for {ID}; '
                 f'refusing to guess which frame faces where.')
    out, skipped = {}, []
    for f, d in zip(frames, order):
        if d is None:
            continue
        why = is_junk(f)
        if why:
            skipped.append((d, why))
            continue
        out[d] = f
    if skipped:
        print('   NOTE: ' + ID + ' standing skipped ' +
              ', '.join(f'{d}({w})' for d, w in skipped) +
              ' -> those stands stay walk-derived.')
    return out


def main():
    args = [a for a in sys.argv[1:]]
    scale = 1
    if '--scale' in args:
        i = args.index('--scale')
        try:
            scale = int(args[i + 1])
        except (IndexError, ValueError):
            sys.exit('  ERROR: --scale needs an integer, e.g. --scale 2')
        del args[i:i + 2]
    if scale < 1:
        sys.exit('  ERROR: --scale must be >= 1')
    global CELL_W, CELL_H, FIG_H
    CELL_W, CELL_H, FIG_H = BASE_CELL_W * scale, BASE_CELL_H * scale, BASE_FIG_H * scale

    if len(args) < 2:
        sys.exit('usage: py tools\\build_char_sheet.py <ID> <raw_folder> [--scale N]')
    ID = args[0].upper()
    folder = args[1]
    if not os.path.isabs(folder):
        folder = os.path.join(ROOT, folder)
    if not os.path.isdir(folder):
        sys.exit(f'  ERROR: folder not found: {folder}')

    # map every non-underscore source in the folder to a direction
    by_dir = {}
    for f in sorted(glob.glob(os.path.join(folder, '*'))):
        b = os.path.basename(f)
        if b.startswith('_'):            # _*-standing.png etc: reference only
            continue
        if not f.lower().endswith(('.gif', '.png')):
            continue
        d = direction_of(f)
        if d is None:
            print(f'  NOTE: skipping unrecognized direction file {b}')
            continue
        if d in by_dir:
            sys.exit(f'  ERROR: two files map to {d}: {os.path.basename(by_dir[d])} '
                     f'and {b}')
        by_dir[d] = f

    have_diag = all(d in by_dir for d in DIAGONALS)
    have_diag_any = any(d in by_dir for d in DIAGONALS)
    if have_diag_any and not have_diag:
        missing = [d for d in DIAGONALS if d not in by_dir]
        sys.exit(f'  ERROR: partial diagonal set (missing {missing}); an 8-row '
                 f'sheet must have all four or none.')
    order = CARDINALS + (DIAGONALS if have_diag else [])

    for d in CARDINALS:
        if d not in by_dir:
            sys.exit(f'  ERROR: no source for cardinal direction {d}')

    print(f'== build {ID} ==  {len(order)} directions '
          f'({"8-dir" if have_diag else "4-dir"}), scale x{scale} '
          f'(cell {CELL_W}x{CELL_H}, figure {FIG_H}px)')
    stands = load_standing(ID)
    sheet = Image.new('RGBA', (CELL_W * 3, CELL_H * len(order)), (0, 0, 0, 0))
    for r, d in enumerate(order):
        stand, steps, picks, note = frames_for(ID, d, by_dir[d])
        src = os.path.basename(by_dir[d])
        if d in stands:                      # dedicated feet-together rest pose
            stand = stands[d]
            stand_src = 'ROT'
        else:
            stand_src = f'walk[{picks[0]}]'
        print(f'   {d:9s} <- {src:32s} stand={stand_src} steps={picks[1]}{note}')
        for c, f in enumerate([stand] + steps):
            sheet.paste(place(f), (c * CELL_W, r * CELL_H), place(f))

    # 2x is the committed project resolution (night eighteen). The sheet is
    # named <ID>.sheet.png at any scale; the cell size is self-describing (PNG
    # dims / 3 cols / rows) and is recorded in the generated .sprite.js meta.
    out = os.path.join(ROOT, 'assets', 'sprites', 'raw', f'{ID}.sheet.png')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    sheet.save(out)
    print(f'\n   wrote {os.path.relpath(out, ROOT)} '
          f'({CELL_W * 3}x{CELL_H * len(order)}, figure height {FIG_H}px)')
    cell_arg = '' if scale == 1 else f' --cell {CELL_W}x{CELL_H}'
    print(f'   NEXT: py tools/sprite_intake.py '
          f'{os.path.relpath(out, ROOT)}{cell_arg}')


if __name__ == '__main__':
    main()
