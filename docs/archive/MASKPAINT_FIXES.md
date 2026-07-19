# MASKPAINT FIXES — IMPLEMENTED (session 3)
Producer field report: can't undo/remove occluder paint, can't start
fresh files. Fixes A-D below are now IN maskpaint.html and verified
headlessly (erase, clear+undo, wrong-layer warning). What remains for
the producer: run the manual acceptance checks at the bottom in a
real browser and report the HUD text if anything still misbehaves —
every stroke now prints [layer + action], which pinpoints any residue.

## What already works but is undiscoverable (verified in producer's copy)
1. **Eraser exists.** On the OCCLUDER layer, the SOLID button (key `2`)
   erases — `fillCells()` calls `og.clearRect()` when `color===0`
   (maskpaint.html line ~166). Nothing in the UI says so except one HUD
   line that vanishes on the next action.
2. **Undo exists.** `Ctrl+Z` is wired (line ~287), layer-aware, and
   loads take a snapshot first — so one `Ctrl+Z` immediately after a
   bad LOAD OCCL restores the pre-load state. Cap: 30 steps.
3. **Blank files already happen at backdrop load.** Loading a backdrop
   initializes a blank floor mask (all solid) and a blank occl layer;
   EXPORT from that state IS "creating a new file." No one could know
   this from the UI.

## What is genuinely missing
4. **No CLEAR LAYER.** Once an .occl.png (or .mask.png) is loaded,
   there is no way to blank it — undo can't reach below the loaded
   baseline, and hand-erasing a whole layer with the brush is absurd.
5. **No visible NEW flow.** Even though (3) exists, there's no button
   that says so.

## Fixes implemented (all in tools/maskpaint.html; no engine changes)
A. DONE — on the OCCLUDER layer the SOLID button relabels itself
   `ERASE` (checkerboard swatch); key `E` = alias for key `2`.
B. DONE — CLEAR LAYER button (red, next to UNDO): confirm, snapshot,
   blank the active layer; Ctrl+Z restores. Clear + export = new file.
C. DONE — a bold EDITING: FLOOR / EDITING: OCCLUDER badge lives in
   the toolbar (green vs orange); every stroke prints [layer + action]
   in the HUD; clicking orange paint while on the FLOOR layer shows a
   HEADS-UP telling you to press Tab first.
D. DONE — undo cap raised 30 → 60.
E. REMAINS for next session: fold A-D into DEVELOPMENT_BRIEF.md
   §tooling. (Header comment note: erase = SOLID/E on OCCLUDER layer.)

## Related knowledge worth restating in the docs
- To **remove ALL occluders from a room**: clear the OCCLUDER layer,
  export, run `py tools\mask2json.py <ID>` — an empty occl.png
  legitimately generates an empty walkBehind array. To go back to
  hand-authored strips instead, delete assets/masks/<ID>.occl.png.
- Filenames must keep their dots: `STORE-BACK-A.mask.png`,
  `STORE-BACK-A.occl.png`. An underscore version is ignored.
- Occluder rule stands: separate objects ≥1 empty 8px cell apart;
  touching blobs merge into one horizon. Two objects only *partially*
  covering the same cell can still bridge it (cell threshold 0.4 is on
  the union) — align gaps to 8px boundaries when in doubt.

## Acceptance checks for next session's harness-of-hands
1. Load backdrop + producer's occl → press Tab → press 2 → drag over a
   painted blob → paint disappears; Ctrl+Z brings it back.
2. CLEAR LAYER on OCCLUDER → layer empty; Ctrl+Z restores it.
3. From a fresh page: load backdrop only → paint both layers → export
   both → mask2json runs clean on the two new files.
4. maskview shows the result; harness stays 43/43 (no engine changes).


## CLOSED (end of session 3)
All fixes shipped and field-confirmed by the producer. Also landed
since: 4px grid across the whole pipeline (paint/convert/engine via
the data.js grid field), utf-8 pinned in mask2json/maskview (cp1252
regression from Windows fixed), harness + shot.js made
geometry-agnostic (test points derived from painted room data).
Item E folded into DEVELOPMENT_BRIEF §Tooling. This file is history
now — nothing left to implement.
