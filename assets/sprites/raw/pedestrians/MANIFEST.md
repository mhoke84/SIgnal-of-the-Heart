# Earbud walk-by pedestrians (cinematic extras)

Five distinct people for the "everyone's plugged in, the street's gone quiet"
walk-by outside the store (STORE-EXT). **Cinematic actors, not player sprites.**
Cells are 128×128 (bigger than the 64×96 cast) for a tight camera where earbuds
read; each walk sheet is a 4×5 grid, 17 usable frames (reading order), foot at
y≈124 in the cell.

| person | jacket | walks | walk sheets (raw material) | notes |
|---|---|---|---|---|
| A | brown | right | PED-A.walk.new (primary), PED-A.walk.alt | new sheet has no start-stall |
| B | dark  | right | PED-B.walk.1 (smoothest), .2, .3 | one frame has a "third leg" — cull via choreographer |
| C | blue  | right | PED-C.walk.noturn | producer's dedicated no-head-turn sheet (the others turned) |
| D | tan   | left  | PED-D.walk.1 (cleaner loop), .2 | |
| E | dark  | left  | PED-E.walk | |

`PED-standing-1..5.png` = 8-directional standing (3×3, 128px) — one per person,
kept for future non-cinematic use.

`_discarded/` = sheets that didn't make the cut (C's three head-turn/accidental-
left takes, E's head-turn take). Kept for reference; not for shipping.

## How the final walks get built
The producer curates each person's fluid cycle in `tools/earbud_choreographer.html`
(frame picker: pick good frames across a person's sheets, drop the third leg /
stalls / any head-turn), sets per-person choreography + camera, and **Exports**
`earbud_scene.json`. That export lists each person's cycle as `{sheet, frame}`
source references — the crew bakes exactly those frames into the 5 final strips.
Nothing is culled to final until that export is in hand.
