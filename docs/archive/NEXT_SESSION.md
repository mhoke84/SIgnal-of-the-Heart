# NEXT_SESSION — start here
Written at the end of session 3 (Phase 1 wrap + tooling). Read this,
skim the last three DEVLOG entries, then go.

## Where the project stands
- **Phase 1 (THE STAGE): COMPLETE** on producer-authored canon.
  STORE-BACK-A floor + occluders were painted by the producer (grid 4,
  9 occluder blobs, no blue corridors — blue is optional forever).
  Engine, compositor, camera, clock, input all in and verbatim ports
  byte-verified. Harness: 41 green.
- **The playable build** is index.html at project root (file:// works).
  Debug keys: T state A/B, Y HUD, Z beat-check.

## What is canon vs generated
- CANON (hand/producer-made): backdrops, mask PNGs, occl PNGs,
  data.js exits/hotspots/spawn/fx, everything in reference_build004.html.
- GENERATED (never hand-edit): data.js `mask`, `walkBehind`, `grid`
  fields — mask2json owns them.

## Command cheat sheet (producer's Windows, from project root)
    py tools\mask2json.py STORE-BACK-A     # paint -> room (ALWAYS after painting)
    py tools\maskview.py STORE-BACK-A      # review render -> tools/review/
    node tools\harness.js                  # must stay green
    node tools\shot.js                     # registration shots per occluder

## Hard-won rules (all learned the expensive way)
1. THE PAINT IS NOT THE ROOM UNTIL CONVERTED — run mask2json.
2. Exported filenames keep their dots: STORE-BACK-A.mask.png / .occl.png.
3. Occluder blobs within one 4px cell of each other MERGE (one horizon).
4. Tools write utf-8 now; if a data.js ever crashes the pipeline with
   a UnicodeDecodeError, a Windows editor re-saved it as cp1252 —
   re-run mask2json to regenerate cleanly.
5. Harness + shots derive coordinates from the painted data. If a test
   goes red after a repaint, it found a real problem, not a stale anchor.

## Phase 2 — THE BAND (next)
Goal: characters in the room. From BUILD_PLAN:
- gen_sprites.py at 32x48; Mike, Izzy, Noah, Earl, Stylus sprites
  (protected canon: signature idles, 9 portraits at 96x96).
- Masks + anchors for the regenerated STORE-INT-A/B.
- Art-bible screen = producer approval gate before integration.

**Blocked on producer:** regenerated STORE-INT-A/B (original FLAGGED:
real band posters — replace with canon sleeves: Mudflower, The
Nibblers, The Genuines, Paper Kites). Also decide whether CCT-OFFICE-A
joins the Tier-1 batch.

**Not yet delivered (later phases):** STORE-EXT-A/B, BATTLE-STORE,
T1-TOWN/BARN/SILO, BATTLE-FARM.

## Constitution reminders (never violate)
Producer supplies backdrops; engine composites; never modify or
restyle backdrops — FLAG problems, never fix. Protected canon:
gameplay, script/dialogue, beat clock, portraits, signature idles.
Per-phase standing rules: harness green, playable file shipped,
DEVLOG entry in tour-diary voice, screenshots for the producer.
