# RADIO UNDERGROUND v2 — DEVELOPMENT BRIEF
### The Hi-Bit Sessions: engineering spec for the pre-rendered backdrop build
*(Read me first, every session. I am the source of truth alongside
`claude_code_hibit_prompt_v2.md` and `preproduction_shot_list.md`.)*

## 0. The constitution (never violate)
- Producer supplies backdrops. Engine composites. **Never generate, redraw,
  "improve," or restyle a backdrop.** Problems get FLAGGED (DEVLOG +
  ASSET_STATUS), never fixed unilaterally.
- Protected canon: gameplay, script/string table, the beat clock, the nine
  portraits, signature idles, named gags, Stylus's immovability.
- Calibrate before propagating: STORE-INT-A is the art-bible room; producer
  approval gates each phase.

## 1. Resolution & scale decisions (settled this session)
- **Viewport: 480×270**, integer-scaled to display, nearest-neighbor.
- **Rooms:** raw renders arrive 1536×1024 (3:2). Intake crops a 16:9
  content window (1536×864) and integer-downsamples ×2 (median-of-block) →
  **768×432 logical scroll rooms** (1.6 viewports wide/tall). SINGLE rooms,
  when delivered at other sizes, normalize the same way to ≤480×270.
- Why ×2 median and not detection: grid detection found **px=1** on all four
  Tier-1 rooms — AI renders have irregular pseudo-pixels (~80% AA residue,
  100-300K colors). Integer /2 keeps edges crunchy without inventing a grid
  that isn't there. Any further palette quantization is an ART decision —
  producer's call, not ours (flag, don't fix).
- **Character sprites 32×48** — verified against furniture: doors in the
  normalized rooms are ~65px tall, so a 48px character reads correctly.
- **Portraits:** the nine 48×48 PNGs draw at **2× (96×96)** in the 480-wide
  talk box. Integer scale, still pixel-true, protected assets untouched.

## 2. Project layout
```
ru_v2/
  index.html              one page, plain <script src> tags IN ORDER (no
                          ES modules -> runs from file:// with zero server;
                          `python3 -m http.server` also works)
  reference_build004.html the approved 256x224 build: LOGIC SOURCE OF TRUTH
  src/
    core/clock.js         BeatClock + judgement windows  [PORT VERBATIM]
    core/audio.js         synth voices, sfx, crackle     [PORT VERBATIM]
    core/songs.js         the 7-song book + sequencer    [PORT VERBATIM]
    core/input.js         keys + tapped/consume pattern  [PORT + gamepad later]
    core/loader.js        manifest-driven <img> loading, ready-gate
    core/camera.js        px camera: follow(player), clamp to room, pan op
    core/stage.js         THE COMPOSITOR (see §3)
    core/mask.js          walkability + walk-behind queries from room data
    game/sprites.js       32x48 sprite compiler (see §5)
    game/dialog.js        talk box @480w, 96px portraits [PORT, re-metric]
    game/runner.js        op-list interpreter            [PORT + camera ops]
    game/scenes.js        SCENES string table            [PORT VERBATIM from
                          reference_build004.html - dialogue is canon]
    game/battle.js        Tempo battle logic [PORT] + plate presentation [NEW]
    game/needle.js        needle-drop        [PORT, re-staged]
    game/maze.js          corn maze          [PORT, procedural, T1 palettes]
    main.js               modes, boot, frame loop
  assets/
    backdrops/raw/        producer deliveries, untouched, git-ignored-large
    backdrops/normalized/ intake output, what the game loads
    masks/                painted mask PNGs (authoring only, see §4)
    anchors/              <ID>.data.js room data (see §4)
    portraits/            the nine PNGs (extract from build 004's base64)
  tools/
    intake.py             grid detect + snap + palette audit + log  [BUILT]
    mask2json.py          painted mask PNG -> RLE arrays in <ID>.data.js
    maskview.py           renders mask over backdrop for producer review
    shot.js + softcanvas.js  headless screenshot harness [PORT from /tmp,
                          re-metric to 480x270] - registration shots
    harness.js            logic playthrough harness [PORT]
    gen_sprites.py        validated sprite-string generator [EVOLVE to 32x48]
  ASSET_STATUS.md  intake_log.md  DEVLOG.md  BUILD_PLAN.md
```

## 3. The compositor (core/stage.js) — draw order per frame
1. Backdrop image for room's ACTIVE STATE (state variants hot-swap by story
   flag: `store:{A:'STORE-INT-A',B:'STORE-INT-B'}`, `back:{A,B}`).
2. Under-overlays anchored to the room (rug shadow, floor FX) — rare.
3. **Y-sorted sprite pass:** actors + player + interactive-object sprites,
   each with drop shadow. Walk-behind: after the sprite pass, re-blit the
   room's WALK-BEHIND STRIPS (rects copied from the backdrop image) over any
   sprite whose baseline is ABOVE the strip's horizon line — counters, bin
   rows, door frames occlude correctly with zero extra art.
4. Effect overlays (drawn by us, palette-matched): tube-glow flicker +
   ON AIR blink (BACK-B), stage-light pulse on the beat (INT-B), dust motes
   in window shafts (INT-A), OPEN sign sway, listener-counter displays.
5. Grading tint (warm amber / Copy Cat teal per scene) + vignette.
6. UI layer (dialog, cards, hints) — camera-independent.
Camera: room > viewport ⇒ follow player with soft clamp; `pan` runner op
gets a camera target variant for cinematics.

## 4. Room data: masks + anchors (authoring pipeline)
Runtime never reads image pixels (avoids file:// canvas taint). All room
data ships as a JS file the page loads directly:
`assets/anchors/STORE-BACK-A.data.js` →
```js
ROOMS['STORE-BACK-A']={
  size:[768,432], states:{A:'STORE-BACK-A',B:'STORE-BACK-B'},
  grid:8,                       // mask resolution: 8px cells (96x54 cells)
  mask:'<RLE string>',          // 0 solid / 1 walk / 2 walk-behind trigger
  walkBehind:[{x:112,y:64,w:210,h:88,horizon:150}], // px rects + baseline
  spawns:{default:[380,300],fromStore:[380,300]},
  exits:[{rect:[368,296,64,24],to:'store',spawn:'fromBack'}],
  hotspots:[{id:'transmitter',rect:[430,80,190,120],
             face:'up',op:'transmitter_look'}],
  fx:[{kind:'tubeGlow',at:[520,120],state:'B'},
      {kind:'onAir',at:[598,96],state:'B'}],
  npcSlots:{izzy:[470,300],noah:[420,310]}
};
```
Authoring flow: paint `assets/masks/<ID>.mask.png` over the normalized
backdrop (WHITE=walk, BLACK=solid, BLUE=walk-behind region) → run
`mask2json.py` → it writes/updates the `.data.js`. `maskview.py` renders the
mask at 40% alpha over the backdrop for producer review. Anchors are
hand-edited JSON in the same file, keyed to the script's scene directions.

## 5. Sprites at 32×48 (game/sprites.js + tools/gen_sprites.py)
- Same proven pipeline: pixel-string rows authored in the Python generator
  (row-length + unicode validation is MANDATORY — it caught real corruption
  three times), compiled by makeSprite at load.
- 32 wide × 48 tall, 4 facings, 4-frame walks ([A,N,B,N], legs as swappable
  row-blocks), signature idles re-authored at the new size: Mike's 4/4 thigh
  tap, Izzy's sway (headphones on neck from Scene 5 canon — bake them in),
  Noah's restless feet. Palettes sampled from the portraits (skin #fcb460
  family — already sampled, values in gen_sprites.py).
- Double density = room for real faces: 4px eyes, brows, mouth, hairline.
- Named cast bespoke (Earl: stoop + cane at new size). Chorus: 4 body
  templates before any palette swap is allowed.
- Registration check (directive step 5): shot.js composites Mike at 5
  positions in STORE-BACK-A → screenshot to producer. A sprite must live in
  the room, not sticker onto it: match contact shadow softness and add a
  1px dark warm outline (the backdrops outline their props the same way).

## 6. What ports verbatim vs. what's rewritten
| From build 004 | Disposition |
|---|---|
| Clock, judgement windows, Music sequencer, SONGS, sfx, crackle | VERBATIM |
| SCENES op-lists + all dialogue | VERBATIM (string table is canon) |
| Runner interpreter | VERBATIM + new ops: `state`, `camera`, `fxOn/Off` |
| Dialog/Note/Choice logic incl. input-consume fix | VERBATIM, re-metric |
| Battle LOGIC (tempo fills, anthems, Family Business, danish charm) | VERBATIM |
| Battle/needle/maze PRESENTATION | REWRITE over plates @480×270 |
| Tile atlas / procedural rooms / 16×24 sprites | RETIRED (maze keeps tiles) |
| Portraits (9 PNGs) | UNTOUCHED — extract to assets/portraits/ |
| Harnesses (logic + softcanvas shots) | PORT, re-metric |

## 7. Interim placeholders (all pre-approved as FLAGGED, none silent)
- Scene 4 office: old procedural room at 480×270 letterbox until
  CCT-OFFICE-A (Tier 2) arrives. Card reads the same; DEVLOG flags it.
- BATTLE-STORE plate: blurred/darkened STORE-INT-A crop until delivered.
- Street/town pans (Scene 3/6): keep build-004 silhouette pans, re-metric,
  until STORE-EXT-B / T1-TOWN arrive.

## 8. Known risks & their answers
- **file:// audio autoplay**: unchanged — audio unlocks on first Z (boot).
- **768×432 rooms + 480 viewport**: camera clamp tested in Phase 1 before
  any scene work.
- **Backdrop regen may shift layout** (INT-A/B IP regeneration): do NOT
  author INT masks/anchors until regenerated art lands. BACK-A/B are clean —
  they are the Phase 1/2 workhorses.
- **Perf**: one 768×432 drawImage + sprites is trivial; overlays are small.
  If grading tints cost, pre-tint per-state once at load.


## §Tooling — room authoring (added night one, final form)
Rooms are authored by painting two PNG layers in tools/maskpaint.html
(runs from file://, load the normalized backdrop first):

- FLOOR (assets/masks/<ID>.mask.png): WHITE=walkable, BLACK=solid,
  BLUE=walkable corridor flag (OPTIONAL — informational only; feet
  and occlusion never depend on it).
- OCCLUDER (assets/masks/<ID>.occl.png): paint each object the player
  can pass behind as one orange silhouette down to its floor-contact
  line. Each connected blob becomes one occluder; horizon = the
  blob's bottom row. Keep separate objects >=1 empty 4px cell apart
  or they merge into one horizon (merging is fine for objects that
  genuinely share a floor line).

Editor: Tab switches layers; on OCCLUDER, 2/E erases; CLEAR LAYER
blanks the active layer (Ctrl+Z restores; clear+export = new file);
the toolbar badge always shows the live layer; every stroke prints
[layer + action]. Undo depth 60.

Convert with `py tools\mask2json.py <ID>` (grid defaults to 4 and is
written into the data.js grid field — engine follows automatically).
THE PAINT IS NOT THE ROOM UNTIL CONVERTED. Filenames keep their
dots. Review with `py tools\maskview.py <ID>`. data.js mask,
walkBehind, and grid fields are GENERATED — repaint, don't hand-edit.
An intentionally blank occl export removes all occluders; deleting
<ID>.occl.png returns walkBehind to hand-authoring.

Verification is paint-agnostic: tools/harness.js derives its test
coordinates from the painted data (boundary-integrity collision
probes, per-blob body-hidden/head-visible pixel proofs) and
tools/shot.js generates one registration shot behind every occluder
blob. Producer repaints can never strand the suite.
