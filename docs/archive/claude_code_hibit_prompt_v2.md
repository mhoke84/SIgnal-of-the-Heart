# FOLLOW-UP PROMPT FOR CLAUDE CODE — "THE HI-BIT SESSIONS, TAKE 2"
## New Art Pipeline: Producer-Provided Pre-Rendered Backdrops
*(Paste everything below the line into Claude Code. This supersedes the previous hi-bit directive's environment pipeline. The shading-language rules, NPC de-cloning, and calibration process from earlier directives still apply to everything Claude Code draws.)*

---

The art direction question is settled, and it's settled the best possible way: **the producer is the art director, and the producer is supplying the environments.** Radio Underground moves to a pre-rendered backdrop pipeline — hand-directed painted pixel scenes provided as image files, with the engine compositing sprites, overlays, and effects on top. This is the PS1 Final Fantasy model: painted rooms, living sprites. Your job shifts from *generating* environments to *engineering the stage* they become.

## Division of labor — this is the constitution of the pipeline

- **PRODUCER PROVIDES:** all room/scene backdrops as pre-rendered pixel-art images (per the shot list in `preproduction_shot_list.md`), delivered to an `/assets/backdrops/` folder with filenames matching the shot list IDs.
- **CLAUDE CODE OWNS:** normalization, compositing, walkability, state layers, all character/NPC sprite work, interactive-object overlays, animation, battle presentation, UI, and everything procedural that remains. You never generate, redraw, "improve," or restyle a backdrop. If a backdrop has a problem (grid inconsistency, missing state variant, a real-world album cover or logo that slipped in), you FLAG it in `DEVLOG.md` and to the producer — you do not fix art unilaterally. Full artistic direction stays with the producer, mechanically enforced by this rule.

## Format specs (unchanged)

- **Internal resolution 480×270**, integer-scaled, nearest-neighbor, pixels honest.
- Rooms may be single-screen (480×270 logical) or scrolling (typically 960×540 logical); the shot list marks which.
- **Character sprites ~32×48**, 4 facings, 4-frame walks, canon signature idles. Characters are drawn by you, matched to the approved 48×48 portraits, and must sit on the same pixel density as the backdrops.

## The backdrop intake pipeline (build this first)

Every incoming image passes through a normalization step before it touches the game:

1. **Grid detection & snap.** AI-assisted pixel art rarely sits on a true grid. Detect the effective pixel size, downsample with nearest-neighbor to the true logical resolution (480×270 or 960×540 per shot list), and verify crisp single-pixel edges. Build this as a small preprocessing script the producer can run on each delivery; log before/after.
2. **Palette audit.** Report the color count and flag any anti-aliased gradients that survived the snap (they read as blur at integer scale).
3. **Walkability mask.** For each backdrop, author a collision mask (a simple painted mask image or tile-grid overlay you generate and the producer can review). Include walk-behind data: regions where sprites render *behind* backdrop elements (counters, bin rows, door frames) via a priority mask or horizon lines.
4. **Anchor map.** A per-room JSON defining spawn points, exits, NPC positions, interaction hotspots (the transmitter, the listening booth, save points), and effect anchors — all keyed to the script's scene directions.
5. **Registration check.** Composite a test sprite at several positions and screenshot for the producer: scale match, palette harmony, shadow contact. A sprite must look like it lives in the room, not like a sticker on a photograph.

## State layers & overlays (how frozen paintings come alive)

Backdrops are static; the game is not. Build a layered compositing system:

- **State variants:** some rooms have multiple producer-supplied versions (store: morning / show night / raided / rebuilt). The engine hot-swaps per story flag. The shot list defines every required variant — if a scene needs a state that has no delivered variant, flag it, don't fake it.
- **Overlay sprites for anything that moves or changes:** neon flicker, the transmitter's tube glow, the OPEN sign, candle/fire light, rain, the drive-in's projected screen content, fountain water, listener-counter displays. You draw these as sprite layers matched to the backdrop's palette and grain.
- **Lighting passes:** per-scene grading (warm amber vs Copy Cat teal) as tint layers over the backdrop, plus the liberation palette-shift for town states where the producer supplies only one base image and a graded variant is acceptable — but ASK before grading any hero room; the producer may prefer to render the variant.
- **Battle backgrounds** are producer-supplied per the shot list; you composite the Tempo battle UI, actors, and effects over them.

## What stays procedural (Claude Code-drawn, matched to the backdrop style)

The shot list marks certain spaces PROCEDURAL because they're animation-heavy, state-heavy, or randomized: the corn maze (reorients on the beat), the world/Signal map, the funhouse mirror maze, long traversal connectors, and the coaster rail sequence. For these, extract a palette and texture vocabulary FROM the delivered backdrops (sample their wood, stone, and foliage ramps) so procedural spaces feel like the same artist on a deadline, not a different game.

## Sleeve lore & legal discipline (enforce at intake)

Every backdrop must contain only in-world art: no real album covers, band names, logos, or celebrity likenesses. The producer's generation prompts will aim for fictional sleeves (Mudflower, The Nibblers, The Genuines, Paper Kites — the canon catalog), but AI generation can smuggle in real covers. Your intake audit includes an IP pass: flag anything that resembles real-world commercial art and request a regeneration. This protects the project and keeps the shelves pure canon.

## Migration order

1. Build the intake pipeline + compositing/state-layer engine, keeping the current build playable with old art meanwhile.
2. Producer delivers Tier 1 of the shot list (vertical slice set).
3. Assemble the art bible screen: STORE-INT-A with Mike, Izzy, Noah, Earl, and Stylus composited at new spec. Registration screenshots to the producer. Iterate to approval.
4. Propagate: intake remaining tiers as delivered, flag gaps against the shot list, and keep a living `ASSET_STATUS.md` checklist mirroring the shot list IDs (DELIVERED / NORMALIZED / INTEGRATED / NEEDS-VARIANT / FLAGGED).

## Protected, untouchable, canon
Gameplay, script/string table, the beat clock, the nine portraits, signature idles, every named gag — and now, above all: **the producer's backdrops as delivered.** You are the engineer and the rhythm section. The producer is the artist on the sleeve. Mix accordingly.
