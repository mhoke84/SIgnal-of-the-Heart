# NEXT SESSION

Build **`2026-07-16 EARBUD-CINE-A`**. Harness **101 green**, `doc_check` green,
script snapshot blessed (DIVERGENT 0). Mike's flap pool rebuilds byte-identical.
This tree is canonical.

> **Session-start protocol:** read the last two DEVLOG entries + this file, run
> `npm install`, then `node tools/harness.js` (expect 101 green) before any work.

---

## TOP PRIORITY: bake + wire the earbud walk-by cinematic

Everything is staged; it needs the producer's final export, then the wiring. Full
detail is in **MASTER_REFERENCE §5.5** — read it first. Short version:

**Waiting on the producer:** a final `earbud_scene.json` exported from
`tools/earbud_choreographer.html` (camera + per-person choreography + each walk
cycle as `{sheet, frame}` source refs). He may also, by then, have **painted the
STORE-EXT-A OCCLUDER** (trees) in maskpaint — that's all the paint this cinematic
needs (no floor mask; scripted actors don't use `Mask.canStand`).

**When the export is in hand:**
1. Extract each person's `{sheet,frame}` list into 5 final sprite strips from
   `assets/sprites/raw/pedestrians/` (see its MANIFEST). Move losers to `_discarded/`.
2. Build a **cutscene camera** (zoom + letterbox — the normal camera is 1:1) and
   render the `walkBehind` + sprite pass through it.
3. Register the 5 as scripted walk-by actors, feet-Y = their exported depth, on
   authored paths. `stage.draw`'s existing y-sort then puts them **behind the
   trees** automatically (confirmed: sprites sort by feet `py`, strips by horizon).
4. **Marry maskpaint ↔ choreographer:** load the room OCCLUDER into the
   choreographer so the producer previews walk-behind while staging (today it
   draws over a flat backdrop).

**Known constraints / notes:**
- Pedestrian cells are **128px** (bigger than the 64×96 cast) — right for the tight
  cinematic; a normal-room appearance would need a downscaled set.
- The choreographer is self-contained (embeds sprites + STORE-EXT-A). If sprites
  change, it currently needs a manual re-bake; formalizing a generator (bake from
  tree assets, à la `flap_pool.py --studio`) is a nice-to-have, not urgent.
- **Image viewer was down all of night 34** — the choreographer was verified
  functionally (headless render + pixel checks) but NOT judged by eye. If the
  viewer's back, sanity-check the sprite strips at zoom before shipping the scene.

---

## STILL OPEN (unchanged from before)
- Base-cell confirms: IZZY `IZZY.neutral-1.png`#1 and NOAH `NOAH.1.png`#1 are
  provisional rest faces — one producer nod each.
- Izzy + Noah not wired to game yet (no `.flap.js`; producer authors in studio).
- `MIKE.neutral.flap.js` still predates the mouth-ghost fix — re-export before the
  Phase-3 dialog port.
- STORE-EXT-A/B/C normalized (wide scroll rooms) but unmasked; A+B composition
  (one panning street vs two rooms) is a producer call; C not pixel-aligned with A.
- Phase-3 dialog renderer (`dialog.js`) still unbuilt; blueprint = `tools/dialog_harness.html`.
- Noah's walk art still ships slip-ons; canon = one shoe untied (footwear pass).
