# RADIO UNDERGROUND v2 — MASTER REFERENCE
### The Hi-Bit Sessions. Crew's single source of truth.
*Last true as of build `2026-07-16 EARBUD-CINE-A`, harness 101 green.*

---

## 0. WHO OWNS WHAT

**The producer works from four documents. The crew never edits them:**
- `radio_underground_script_edited.docx` — the script. Canon. **Rewritten on the fly, all project long.**
- `preproduction_shot_list.md` — 69 backdrops to render.
- `SONG_LIST.md` — 87 cues to compose.
- `SPRITE_SPEC.md` — everything that moves: characters, tiles, icons.
- `CHEATSHEET.md` (project root) — the one-page checklist for all three pipelines.

**The crew works from two documents:**
- `MASTER_REFERENCE.md` (this file) — architecture, pipelines, rules, status.
- `DEVLOG.md` — the tour diary. Narrative history, one entry per session.

Everything else in `docs/archive/` is superseded and kept only for provenance.
Do not read it for current truth; it contains claims that are now false.

> **Script conflict — RESOLVED (2026-07-16).** The two files had crossed: the
> **.docx** carried the long Scene 1 crawl, the **.md** a newer Scene 2. All of it
> is now reconciled. The producer rewrote and expanded **Scene 2 in the .docx**
> (2016 → 2859 chars) and the **.md was synced to it verbatim**: `script_check`
> now reports **DIVERGENT 0** across all 25 scenes (either file is safe to work
> from). Settled canon out of that rewrite: **Scene 1 crawl = the long .docx**;
> **listening-booth sign = "BE YOU"** (he changed it back from BE GENTLE);
> **Noah's footwear = one shoe untied** (his sprite's permanent state); and the
> nickname register is **Goobs / Michael / Gooby / Pops** throughout. The old
> per-scene dialogue divergences (nicknames, Izzy's lines, the "Not late!" open)
> are gone — his expanded Scene 2 is the single authoritative version.
> One standing flag on the crawl sync: the .md's old title-card outro ("held
> guitar note bends upward… TITLE CARD… ~ Signal of the Heart ~") is **not** in
> the .docx and was dropped to match canon — re-append it if wanted.

---

## 0.5 CREW SESSION START — RUN THIS FIRST, EVERY SESSION

**This section is the crew's job, not the producer's.** `script_check.py` exists
to answer *"what did the producer change while we weren't looking?"* — the
producer already knows. It runs against the working tree, and its snapshot
(`docs/.script_snapshot.json`) is committed to the repo, so it survives the
clone. It is deliberately absent from `CHEATSHEET.md`.

The producer rewrites scenes on the fly. Dialogue and stage directions are
canon, so drift has to be caught **before** the crew touches a line of it.
Do not rely on anyone remembering. Run the tool:

```powershell
py tools\script_check.py          # what changed since last session?
```

It hashes every scene in both script files and reports ADDED / REMOVED /
CHANGED, plus where the `.docx` and `.md` disagree. If it reports changes:

1. Read the changed scenes.
2. Update anything downstream that quotes them — `main.js` crawl text,
   room anchors named after props, `SONG_LIST.md` cue descriptions,
   `SPRITE_SPEC.md` protected details, and this file's §12.
3. Re-run with `--accept` to bless the new state.
4. Note the change in the DEVLOG.

Also run, when the corresponding source has moved:
```powershell
py tools\build_songs.py --check   # are all songs wired into index.html?
node tools\harness.js             # must be green before any new work
```

---

## 1. THE CONSTITUTION (never violate)

- The producer supplies backdrops **and character sprites**. The engine
  composites them. **Never generate, redraw, "improve," or restyle producer
  art.** Problems are FLAGGED in the DEVLOG and the status table below —
  never fixed unilaterally. (This extends the original constitution: sprites
  were once the crew's job via `gen_sprites.py`. They are not any more.)
- Protected canon: gameplay, the script and its string table, the beat clock,
  the cast portraits, signature idles, the named gags.
  Named gags on the protected list: the Zamfir record, **Stylus's
  immovability**, the danish tracker (Curly's choice in Scene 7 carries
  forward), Old Earl's canary line, the needle-drop minigame, the one-frame
  seven-silhouette flash, Adam's lateness gag, and the one protected line
  change ("Then let's get even instead").
- Calibrate before propagating. STORE-INT-A is the art-bible room; producer
  approval gates each phase.
- Honest capability assessment before committing to a direction. Concede
  clearly when corrected.

---

## 2. WHERE THE PROJECT STANDS

**Playable:** `index.html` at project root. Runs from `file://`, no server.
Boot → Scene 1 crawl → Scene 2 (the store floor), walkable, leitmotif playing.

**Harness:** `node tools\harness.js` → **101 green, 0 failed.** Must stay green.

**Build stamp.** `main.js` declares `const BUILD='…'`, printed bottom-left on
the title screen and to the console. *If the stamp on screen does not match
the string in your source, the browser served a cached `file://` copy or you
opened a duplicate extraction — hard-reload with Ctrl+Shift+R.* Bump `BUILD`
whenever `main.js` changes. (This exists because a stale copy once looked
exactly like a reverted file.)

**Debug keys:** `Z` beat-check / advance · `R` swap store ↔ back room ·
`T` state A/B · `Y` HUD (prints `P x,y` — the coordinates to quote in a bug report) ·
`C` cycle the player sprite through the cast (MIKE→IZZY→NOAH→SALTMAN→…) in
place — spot-check any character's walk in the real store.

**Done:** Phase 0 (intake) · Phase 1 (engine + STORE-BACK-A) · the music pipeline
(`mid2song`, `voices.js`, `build_songs`) · Scene 1 staged in full · Scene 2 room
integrated, painted, walkable · **the exit runner** (both STAFF ONLY doors connect,
with an arm-latch and an optional `face` requirement) · **per-state floors**
(`Stage.dataFor()` — state B has its own mask and occluders) · the sprite pipeline
(`sprite_intake.py`, `buildSheet()`) · `anchorview.py` · **the repainted cast**:
MIKE and IZZY both delivered as full 8-direction (cardinals + diagonals) sheets,
composited by `build_char_sheet.py`, validated, registered, and rendered in the
store through the real compositor. Both now **walk on alternating legs in all
eight directions** — via the half-cycle picker (§6.5) plus, for MIKE, per-view
`OVERRIDES` pins (§6.5 documents where and why the auto-pick fails) ·
**the contact-shadow clip** (§12): the pool is drawn up to the baseline `sy`
instead of `sy+2`, so it lives inside the sprite's occludable span and can no
longer poke past an occluder horizon at 1.5 scale · **the cast toggle**
(`C`, above) — now cycles all four delivered characters · **NOAH and SALTMAN
intake**: both delivered as full 8-direction walk cycles, composited by
`build_char_sheet.py`, validated + registered, and rendered in the store
through the real compositor (`tools/review/cast_facings_{noah,saltman}.png`).

**Known open (night twenty-four):** the four are in at `HIRES-2X` (64×96 cells,
2× detail), stands from the standing rotations, and **the producer approved the
2× cast in the store** — the Phase-2 calibration gate is passed for the
delivered four. **Mike's walks:** producer confirmed `right` fixed. The up
diagonals survived three step repins because the artifact was never in the
steps: **his montage's up-diagonal STANDS were swapped** (mirror-symmetric
middle row read as rotation order, §6.5) — proven from the producer's own
gameplay video by template-matching every rendered frame against the sheets
(the night-22 cells WERE rendering; the edits were landing, on the wrong
cells). Fixed via `MIKE_STAND_ORDER` night 23 and **VERIFIED by the producer
(night 24): Mike's walk works perfectly in all eight directions.** The
night-22 step pins stand (stepA = each source's one true wide contact), and
the stepB turn-drift residual does NOT read with correct stands — no producer
art needed for the up diagonals.
Remaining non-blocking flags: a few **back-diagonal** stands sit
a few px off-anchor (§8, cosmetic), **Noah's footwear** is still a canon call
(§12), and **Saltman's outfit** (suit vs henley) wants a canon call — his walk
and stand art are both the suit, so it's consistent either way.

**Next:** with the four approved at 2×, THE BAND continues — the rest of the cast
per SPRITE_SPEC (each built `--scale 2`), the INT-room masks, and the
**Phase-3 `dialog` port**. Mike's **talking portraits are built and stabilised**
(`TALK-PORTRAITS-A`, §12.3): neutral/angry solid, worried a subtle placeholder,
frames generated by `tools/portrait_flap.py`, look approved via the dialog test
harness. Wiring them in is part of the `dialog` port. Backdrops stay as-is unless
the producer chooses to pixel-art them.

---

## 3. ARCHITECTURE

**Resolution.** Viewport **480×270**, integer-scaled, nearest-neighbor.
Raw renders arrive 1536×1024 (3:2). Intake crops a 16:9 content window and
integer-downsamples ×2 (median-of-block) → **768×432 logical scroll rooms**
(1.6 viewports wide). Character sprite **cells are 64×96** (the `HIRES-2X`
detail build; were 32×48). The engine still draws them into a **fixed 32×48
logical box** scaled by `spriteScale` — `stage.js` does `drawImage(frame,
x, y, 32*k, 48*k)`, so a 64×96 frame is nearest-downsampled into the same
`48×72` on-screen footprint it always had. **`spriteScale` stays 1.5** (canon,
"do not revert"); the bump is pure detail, not size — the source art is
downsampled ~1.8× instead of ~3.6×, so far more of it survives. On-screen size,
shadows, walk-behind and collision are unchanged. Portraits are 48×48 PNGs
drawn at 2× (96×96) in the talk box.

*Wide scroll rooms (streets).* A 3:1 street panorama can't take a 16:9 crop —
the street *is* the room and the camera scrolls along it (the camera already
clamps to `size[0]`, any width). For these, `intake.py --wide` does the same
median /2 snap with **no crop**, preserving the full aspect. First use: the
STORE-EXT set (raw ~2048×684 → ~1024×342 logical). Grid-detect still reads px=1
on them, same as the 16:9 rooms, so /2 is the right integer snap. `size`,
`spriteScale`, and framing are then a producer/mask call — the tool only snaps.

*Why ×2 median and not grid detection:* grid detection found **px=1** on all
four Tier-1 rooms — the renders carry no true pixel grid (~80% AA residue,
100–300K colors). Integer /2 keeps edges crunchy without inventing a grid
that isn't there. Further palette quantization is an ART decision — flag,
don't fix.

**The `file://` constraint drives almost every design choice.**
The game runs off the filesystem with no server, so:
- No ES modules. `index.html` loads plain `<script src>` tags **in order**.
- No `fetch()` of JSON — CORS forbids it. Room data and songs therefore ship
  as **self-registering plain scripts** (`.data.js`, `.song.js`).
- No canvas pixel reads of backdrops (taint). Masks are baked to RLE strings
  at author time, never sampled at runtime.
- `<img src>` and `<audio src>` *do* work from `file://`. Both are used.

**Script load order** (`index.html`) — order is load-bearing:
```
font · input · audio · voices · clock · songs
assets/songs/*.song.js            (register into SONGS)
loader · camera · mask · stage · game/sprites
assets/anchors/*.data.js          (register into ROOMS)
main.js
```

**Layout**
```
ru_v2/
  index.html                 the page. script order matters.
  reference_build004.html    the approved 256x224 build: LOGIC SOURCE OF TRUTH
  src/core/   clock audio voices songs input loader camera mask stage font
  src/game/   sprites  (dialog, runner, scenes, battle, needle, maze: TODO)
  src/main.js modes, boot, frame loop, Scene 1 staging
  assets/backdrops/normalized/  what the game loads
  assets/masks/     <ID>.mask.png (floor) + <ID>.occl.png (occluders)
  assets/anchors/   <ID>.data.js  room data
  assets/songs/     <id>.song.js  (+ .song.json for diffing)
  assets/music/     streamed mp3 (title screen only)
  assets/portraits/ 13 PNGs (48×48 RGBA) + raw/<ID>.body.png crop sources
                    raw/talking/  MIKE expression grids (speaking/yelling/worried,
                    256px-cell, black) + MIKE.talking-1/2 + loop gifs; _ref/ = screenshots, NOT art
                    talking/  GENERATED MIKE.<mood>.{rest,m0,m1,m2}.png + MIKE.talk.manifest.json
  tools/      script_check.py   session start: what changed in the script?
              intake.py         raw render -> normalized 768x432 backdrop
              maskpaint.html    paint floor + occluder layers
              mask2json.py      paint -> room data
              maskview.py       review render
              mid2song.py       MIDI -> .song.js
              build_songs.py    wire every .song.js into index.html + harness
              build_char_sheet.py  walk GIFs -> <ID>.sheet.png (half-cycle picker)
              sprite_intake.py  validate a sprite sheet -> .sprite.js
              portrait_crop.py  full-body (black bg) -> 48×48 head-shoulders portrait
              portrait_flap.py  expression grids -> STABILISED 48×48 talking frames
                                (mouth-transplant onto one fixed base) + manifest; --demo
              flap_pool.py      grids -> selectable parts pool (eyes+brows unit via
                                extract_upper; mouths via extract_mouth: changed-pixel
                                overlay + solid core over the base lips — no ghosting);
                                per-character geom in POOLS[name]['geom']; --measure
                                estimates a new face's bands; --sheet --studio bakes
                                flap_studio.html
              review_cast.js    render the cast through the real compositor
              anchorview.py     draw + verify every hand-authored anchor
              doc_check.py      audit the docs against the repo (session close)
              harness.js         the suite. 101 green.
              shot.js            reads its script list FROM index.html (no drift)
              softcanvas.js      headless canvas; needs `npm install` per folder
  docs/       this file, DEVLOG.md, the producer's three, archive/
```

**The compositor** (`core/stage.js`), draw order per frame:
1. Backdrop for the room's active STATE (`states:{A:'STORE-INT-A',B:'STORE-INT-B'}`).
2. Under-overlays anchored to the room (rare).
3. **Y-sorted sprite pass** + drop shadows. Then walk-behind: re-blit the
   room's occluder strips over any sprite whose baseline is above the strip's
   horizon. Counters and bin rows occlude correctly with zero extra art.
4. Effect overlays (tube-glow, ON AIR blink, stage-light pulse, dust motes).
5. Grading tint (warm amber / Copy Cat teal) + vignette.
6. UI layer — camera-independent.

Camera: room > viewport ⇒ follow player, soft clamp.

---

## 4. CANON vs GENERATED

| | |
|---|---|
| **CANON** (hand/producer-made) | backdrops · `.mask.png` · `.occl.png` · `.mid` · `data.js` fields `states`/`spawns`/`exits`/`hotspots`/`fx`/`npcSlots` · everything in `reference_build004.html` |
| **GENERATED** (never hand-edit) | `data.js` fields **`mask`**, **`walkBehind`**, **`grid`** (owned by `mask2json.py`) · `assets/songs/*.song.js` (owned by `mid2song.py`) |

To change generated data you change its source and re-run the tool.
**Re-emit, never hand-edit.**

---

## 5. THE ROOM PIPELINE

*Author in a real tool, convert to generated data.*

Paint two layers in `tools/maskpaint.html` (loads the normalized backdrop
via file picker, so no canvas taint):

- **FLOOR** → `assets/masks/<ID>.mask.png`
  WHITE = walkable · BLACK = solid · BLUE = walkable corridor flag
  (**optional and informational only** — feet and occlusion never depend on it).
- **OCCLUDER** → `assets/masks/<ID>.occl.png`
  Paint each object the player can pass behind as one orange silhouette down
  to its floor-contact line. Each connected blob becomes one occluder;
  its horizon is the blob's bottom row.

Editor: `Tab` switches layers · on OCCLUDER, `2`/`E` erases · CLEAR LAYER
blanks the active layer (`Ctrl+Z` restores) · the toolbar badge shows the
live layer · every stroke prints `[layer + action]` · undo depth 60.

Convert: `py tools\mask2json.py <ID>` — grid defaults to 4 and is written
into the `grid:` field, which the engine follows.
Review: `py tools\maskview.py <ID>` → `tools/review/`.

**`mask2json` finds its files by convention, from the ID you pass:**
`assets/masks/<ID>.mask.png` (required), `assets/masks/<ID>.occl.png`
(optional, silently skipped if absent — watch for the
`occl: N objects -> M strip rects` line), `assets/anchors/<ID>.data.js`
(updated in place; a bare stub is created if it doesn't exist).
Paths are relative: **run from the project root**, not from `tools/`.

**Room schema** (`assets/anchors/<ID>.data.js`):
```js
window.ROOMS=window.ROOMS||{};
ROOMS['STORE-INT-A']={
  size:[768,432],
  states:{A:'STORE-INT-A',B:'STORE-INT-B'},
  grid:4,                       // GENERATED
  mask:'<RLE string>',          // GENERATED  0 solid / 1 walk / 2 corridor
  walkBehind:[{x,y,w,h,horizon,note}],   // GENERATED from occl.png
  spawns:{default:[384,352],fromBack:[124,72],fromStreet:[364,404]},
  exits:[{rect:[96,60,56,16],to:'STORE-BACK-A',spawn:'fromStore'}],
  hotspots:[{id:'zamfir',rect:[128,362,160,30],face:'down',op:'zamfir_look'}],
  fx:[{kind:'windowLight',at:[700,150],state:'AB'}],
  npcSlots:{izzy:[250,66],stylus:[64,352]}
};
```

**State variants own their floor.** `states:{A:'STORE-INT-A',B:'STORE-INT-B'}` names
backdrops. If the B backdrop's ID also has a painted `ROOMS` entry, `Stage.dataFor()`
returns *it* for mask and occluders while B is active — Scene 3's folding chairs are
solid, and A's floor would let the player walk through them. Anchors always stay on
the base (A) room. `enterRoom(id,spawn,state)` and the `T` key both re-decode.
The generated B `.data.js` is **state data only**: no spawns, exits, or hotspots.

**Doorways must disarm on arrival.** A spawn may legitimately sit inside the exit
trigger you arrived through (`STORE-INT-A.fromBack` is `[124,72]`, inside its own
`[96,60,56,16]` door). Without a latch the two rooms ping-pong forever.
`Game.flags._exitArmed` is cleared on `enterRoom` and re-set only once the player
stands clear of every trigger.

**Anchor validation** (do this every new room — it has caught real bugs):
- Every **spawn** must stand on walkable floor, or the player spawns stuck.
- Every **exit rect** must sit on *walkable floor in front of* the door.
  A trigger on the door's solid face is unreachable. Constrain it to the door's
  own width, not the whole standable band along the wall.
- **`Mask.canStand` is a foot box, not a point** — a 12px-wide, 4px-deep patch
  (`px±6`, `py-1..py-4`). The outer 6px of a doorway and the top 4 rows of any
  floor are therefore unusable. A Python single-cell check will report 100%
  walkable where the engine reports 75%. **Ask the engine.**
- Every **hotspot rect** must sit on **solid** pixels (it's pointing at
  furniture; a rect floating in open floor points at nothing) **and** have
  walkable floor on its `face` side (where the player must stand).
- Overlapping hotspots: `main.js` takes the first match, so list the smaller
  rect first (`turntable` before `counter`).
- **`fx.at` is the CENTRE of the effect**, not its corner (`FX.deskLamp` draws
  `x-26..x+26`). This bit the producer for three sessions on the since-removed
  ON AIR / tube-glow overlays because nothing said so.
- Exits accept an optional **`face`**: the player must be walking into the door.
  Without it, squeezing past a doorway toward the counter boots you out of the room.
- `py tools\anchorview.py <ID> [STATE]` draws every anchor with its numbers and
  validates it with the engine's own foot box. Run it after any hand edit.

---

## 5.5 THE CINEMATIC WALK-BY (earbud scene, and a reusable pattern)

The STORE-EXT earbud beat is staged as a **scripted cinematic**, not a walkable
room — the producer's call: a tight camera on the storefront while pedestrians
walk past, drawn large so the earbuds read. No floor mask is needed (scripted
actors follow authored paths, not `Mask.canStand`); the only room paint that
matters here is the **OCCLUDER** so people pass behind the trees.

**Occlusion honors these actors for free.** `stage.draw` y-sorts sprites (by feet
`py`) and `walkBehind` strips (by `horizon`) in one pass; a sprite whose feet sit
above a strip gets the strip redrawn over it. So once the pedestrians are rendered
as sprites in that pass, a painted tree occludes any pedestrian whose feet-Y is
behind it. **Per-person "depth (feet y)" in the choreographer is exactly that
`py`** — it decides in-front-of vs behind each tree.

**Tool:** `tools/choreographer.html` (self-contained). Per-person cycle
builder (pick good frames across a person's sheets → drop third-leg/stall/head-
turn), per-person direction/speed/scale/**depth**/start-pos/fps, a scene **camera
(zoom + focus)** that moves everyone in world space, Restart, and **Export** →
`earbud_scene.json` (camera + per-person params + each cycle as `{sheet, frame}`
source refs). This is the handoff artifact; the crew bakes exactly those frames.
Sprites live in `assets/sprites/raw/pedestrians/` (128px cells, 4×5 grid, 17
frames; see MANIFEST there). Reusable for later scenes — build out situationally.

**To wire it into the game (next session):**
1. Take the producer's `earbud_scene.json`; extract each person's `{sheet,frame}`
   list into 5 final strips; move the discards out.
2. Add a **cutscene camera** with zoom/letterbox (the normal camera is 1:1) and
   make the `walkBehind` + sprite pass render through it.
3. Register the pedestrians as scripted actors with feet-Y = their depth, walking
   authored paths; the existing occlusion pass then puts them behind the trees.
4. **Marry maskpaint + choreographer:** have the choreographer optionally load the
   room's OCCLUDER so the producer previews the walk-behind while choreographing
   (today it draws over a flat backdrop).

---

## 6. THE MUSIC PIPELINE

*Same discipline. Author in a DAW, convert to generated data.*

`.mid` → `py tools\mid2song.py <file>.mid [songId]` → `assets/songs/<id>.song.js`
→ add one `<script>` tag after `src/core/songs.js` → `Music.play('<id>')`.

Songs play **live, in real time**, sequenced against the beat clock. They are
note lists, not recordings.

- `(track, channel)` → a **part**; the voice comes from the GM program.
- **Channel 10** → the drum pattern (GM perc → `k` `s` `h` `tom`).
- tempo → `bpm` · ticks/PPQ → beats · velocity → `vel`.
- Survives: pitch, start, duration, velocity, **sustain pedal**.
- **Dropped:** pitch bend, modulation, volume and pan automation. A note list
  cannot hold continuous expression. Write expression into the notes.
- Loop length is ceilinged to whole beats. Drums are absolute across the song
  (`drLoop === len`).

**HARD RULE: one constant tempo per track.** `clock.js` computes
`beat = (audioTime − t0) / (60/bpm)` and never listens to the music.
A tempo change silently drifts the whole game off the grid, so `mid2song.py`
**refuses the file** rather than ship the bug. Bounce to a fixed tempo.

**`humanize` is the thesis of the game.** Human tracks 6–11 ms of drift.
Copy Cat / MUZAK / machine-authored music: **`humanize: 0`.** Applied at
runtime by the sequencer, so it costs nothing at compose time. Don't quantize
the humanity out of the human tracks yourself.

**Voices** (`src/core/voices.js`): `piano epiano bell organ bass strings
brass reed lead`, plus the `vDrumX()` kit. These are *ours*, new for v2.

### Replacing the crew's Build-004 music
`songs.js` declares seven original tracks: `main store copycat battle muzak
boss victory`. Every `.song.js` loads **after** `songs.js` and does
`SONGS[id]=…`, so **an imported song whose id matches a legacy name simply
overwrites it.** Verified: naming a MIDI `store` replaced `SONGS.store`
(96 bpm oscillators → 186 bpm session players, `imported:1`), with no code
change anywhere and the other six untouched.

```powershell
py tools\mid2song.py store_morning.mid store    # retires the crew's store theme
py tools\build_songs.py                         # rewires index.html + harness
node tools\harness.js
```

Use a **new** id for a genuinely new cue (e.g. `main_leitmotif`) and call it
explicitly from `main.js`. Use a **legacy** id to retire a crew track.
The oscillator code stays where it is, unused — Build 004 remains readable.

`tools/build_songs.py` owns the `<script>` tags between the `SONGS:BEGIN` /
`SONGS:END` markers in `index.html` and `tools/harness.js`. **Never hand-add
a song tag.** 87 cues is not a job for hand-editing.

**Streamed audio (`.mp3`) is permitted for non-gameplay only** — title screen,
montage plates, credits. Anything the player presses a button in time with
must be a `.mid`, because MP3 encoder padding puts the true downbeat a few ms
after where the clock expects it. The title MP3 plays through an `<audio>`
element (`Stream` in `voices.js`), entirely outside the Web Audio graph and
the beat clock, so its padding cannot hurt anything.

**Autoplay.** A browser may refuse to start the title MP3 before the first
user gesture. `main.js` attempts playback immediately and retries on the first
keydown or pointerdown. This is browser policy; there is no engine-side fix.

---

## 6.5 THE SPRITE PIPELINE

*Producer draws, engine composites. Same constitution as backdrops.*
Long form for the producer: `docs/SPRITE_SPEC.md`.

`<ID>.sheet.png` → `py tools\sprite_intake.py <path>` →
`assets/sprites/<ID>.sheet.png` + generated `<ID>.sprite.js` →
`Loader.add(ID, url)` + one `<script>` tag → `buildSheet(ID)`.

**Cell 64×96** (the `HIRES-2X` detail build; `build_char_sheet.py --scale N`
sets it, `N=2` here, `N=1` gives the old 32×48). Rows are facings in fixed
order **down, up, left, right** (the four cardinals). A sheet may add four more
rows — **downleft, downright, upleft, upright** — for diagonal (d-pad / two-key)
walking; a 4-row sheet has its diagonals aliased to a cardinal at load, so
`Player.dir` never misses. Cols are frames: `0 stand · 1 stepA · 2 stepB · 3+
optional idle`. The walk plays `stand, A, stand, B`. Minimum sheet is
`(3·CW)×(rows·CH)` — at 2× that is 192×384 (4-row) or 192×768 (8-row).

**The anchor is bottom-centre.** `stage.js` draws the frame into a fixed
`32·k × 48·k` logical box at the feet (`k = spriteScale`), so `(px,py)` is the
floor contact point and a bigger native cell just carries more detail into the
same box. Consequences the validator checks (its tolerances scale with the
cell, so a 2× sheet is not flagged twice as hard as a 1× one): feet must reach
the cell's bottom row (or the character floats), the foot pixels must centre on
the cell mid `(cw−1)/2` (31.5 at 64 wide) or the character drifts from its own
shadow, alpha must be hard (AA reads as a halo at integer scale), and no drop
shadow may be baked in — the check now keys on a dark mass that *fans wider than
the feet*, so dark footwear (Saltman's shoes) no longer reads as a shadow.

Left and right are drawn separately, never mirrored — Izzy's headphones and
Noah's guitar case would swap hands.

`buildSheet()` slices the sheet into per-frame canvases once at load, so
`stage.js` keeps calling `drawImage(frame,x,y)` unchanged. Nothing reads
pixels, so `file://` taint is a non-issue.

**Assembling a sheet from walk sources** (`tools\build_char_sheet.py`). When the
producer draws per-direction walk *cycles* rather than a packed sheet, this
compositing tool assembles the sheet — the sprite-side sibling of
`mask2json`. It reads a folder `assets/sprites/raw/<name>/` of one source per
direction, named `*-<dir>.<ext>` (`forward|up|left|right|down-left|down-right|
up-left|up-right`), in either container:
- **GIF** — every frame is one cycle frame;
- **PNG strip 512×384** — a 4×3 grid of 128px cells, row-major.
It drops junk frames (blank strip cells, and any frame carrying a baked black
matte), and picks the three columns from two sources. **Step frames** (stepA /
stepB) come from the walk cycle by the **half-cycle rule**: in a walk loop a leg
and its opposite are exactly half a cycle apart, so it compares each frame's
legs with its half-cycle partner — the pair that differ MOST are the two
contacts (stepA = argmax, stepB = half a cycle later, guaranteed opposite legs).
This replaced two earlier pickers that both read one-legged on some views: a
spread-only picker (fine on the side, inverted on front/back where a stride
LIFTS a foot instead of widening the stance) and a signed-phase picker (which
still limped on the back and three diagonals, where the contact centroid does
not track the stepping foot). The half-cycle rule needs no per-view heuristic,
**but its metric has a blind spot the earlier pickers did not** (found night 21,
by the producer): it compares leg *silhouettes*, and on a **side view** the two
true contacts — left-leg-forward vs right-leg-forward — are near-mirror
silhouettes that XOR to almost nothing, while two feet-together frames whose
torso registration differs by a couple of pixels XOR large. The argmax then
lands on a pair of **near-stands** and the walk translates without striding
("moonwalking"). Mike's `right` auto-picked `[1,6]` (both feet-together) and
his `up` picked `[4,9]` (9 is a near-stand) this way. **The tell is visual and
cheap to check: if either chosen step frame reads feet-together next to the
stand, the pick is wrong.** Pin the direction in `OVERRIDES` with the two
max-extension, opposite-leading-leg, same-facing (and eyes-open — the right
source blinks on frame 4) contacts, verified by eye against the frame strip.
When a walk source is NOT a clean single-facing loop — Mike's up-left / up-right
sources rotate toward the adjacent cardinal after ~6 frames — the picker can grab
a turned frame and the direction reads "mixed"; pin its two steps to clean
same-facing indices in `OVERRIDES[ID][dir] = (stand, [A, B])` (the stand index is
ignored when a `STANDING` rotation covers that direction). **A pin must satisfy
BOTH constraints at once** — same facing AND true opposite contacts. **And a
source that turns mid-cycle may make that impossible** (night 22): Mike's two
up-diagonal sources each hold the diagonal for only ~half a walk cycle, so each
contains exactly ONE clean wide contact — the opposite-leg contact happens
entirely inside the turned zone. Selection cannot manufacture the missing pose.
Nights 20 and 21 both re-pinned within the clean zone and both shipped a
shuffle, because every clean-zone frame on the other half-cycle is a
near-passing pose (night 20: `upleft [0,3]`, `upright [1,4]`; night 21:
`upleft [4,6]`, `upright [4,5]` — 4 and 5 are adjacent near-stands). The
least-bad pins are `upleft [2,6]`, `upright [1,8]`: stepA is the source's one
true wide contact, stepB the least-turned opposite contact. Two working rules
from the post-mortem: **judge facing by COLOR, not silhouette** (upleft f7/f8
XOR lower than f6 but show progressively more face — more turned to the eye),
and **compare each chosen step against the stand at playback footprint before
claiming anything** (a step that reads feet-together beside the stand is a
wrong pick). `right [3,10]` and `up [4,10]` stand for the metric blind spot
above. Night-24 verdict: with the stands corrected (below), the turned stepBs
do NOT read on the producer's screen — the walk is verified working in all
eight directions, and the conditional producer-art request is withdrawn.
**The stand** (`HIRES-2X` onward) comes from a dedicated **standing rotation**
via the `STANDING` config, not the walk cycle's passing frame — the passing
frame is mid-stride (one foot forward), which read as "one leg up" facing
forward and pulled the side stands off-anchor. A rotation frame is feet-together
and plants on the anchor. `ROT8` gives the canonical turnaround frame→direction
order (down, downright, right, upright, up, upleft, left, downleft) — **but a
source's actual order must be MEASURED, never assumed or eyeballed** (night 23).
MIKE's montage lays its middle row out **mirror-symmetrically** (upleft, up,
upright — the left-facing pose drawn on the left), not in rotation order; six
of eight cells coincide either way, so the error hid in exactly the two poses
hardest to read by eye (the back diagonals, face nearly hidden). His
up-diagonal stands rendered **swapped** for three sessions, and since the walk
plays stand,A,stand,B, his head snapped sides twice per cycle — the "mixed
facing" that survived three step repins (nights 20–22 all re-pinned steps; the
artifact lived in the untouched stand). `MIKE_STAND_ORDER` in
`build_char_sheet.py` carries his true order. The measurement that catches
this: face-sliver side per cell (skin-pixel centroid vs figure centre), and
masked-SSD of each stand against the character's own vs opposite diagonal walk
steps — SALTMAN's GIF measures true `ROT8`; NOAH and IZZY measure consistent.
The source is a **3×3 montage** for MIKE and IZZY
(`_mike-standing.png`, `_izzy-standing.png`, row-major, 9th cell blank)
and a **GIF turnaround** for NOAH and SALTMAN. It must be the SAME art as the
walk (matching figure proportions), not merely the same outfit: Mike's stand was
once pointed at an older, stockier Mike whose clothes matched but whose aspect
did not, and he rendered a different size than his own steps. Izzy's montage
centre (up) cell ships a baked matte, so that one direction skips the rotation
and keeps its walk-derived stand until a matte-free up frame arrives; Mike's up
cell is clean. Any direction with no clean rotation frame falls back to the
passing pose. It then scales
every frame to one constant on-screen height so the head never pops, registers
horizontally by the **torso centroid** (steady across a stride, unlike the
swinging feet), plants the feet on the baseline, and hard-snaps alpha. Output is
`(3·CW)×(rows·CH)`; it never redraws — frame *selection* and registration are
the whole job. Output goes to `assets/sprites/raw/<ID>.sheet.png`, then straight
into `sprite_intake.py`.
```powershell
py tools\build_char_sheet.py MIKE assets/sprites/raw/mike_walk --scale 2
py tools\sprite_intake.py    assets/sprites/raw/MIKE.sheet.png --cell 64x96
```

> **`font.js` is a verbatim Build-004 port.** It has no `>` glyph, and `text()`
> silently substitutes `?` for anything unknown — which is why the exit toast once
> read `EXIT -?`. New glyphs go in `src/core/font_ext.js`, the same split as
> `audio.js` / `voices.js`.

> **Superseded:** `build_mike_sheet.py` (Mike-only, hand-tuned for the first
> art) by `build_char_sheet.py` (any character, config by folder). The old
> tool's `deblink()` — transplanting open eyes onto a closed-eye stride, aligned
> by the hair — is NOT carried forward: the repaint does not blink mid-stride,
> so the crew touches no pixels. If a future sheet blinks, port `deblink` back
> and gate it per direction.

> **Retired:** `gen_sprites.py` and the pixel-string cast. `makeSprite()` and
> its row-length validator stay, still driving the Phase-1 placeholder box.

**Not sprite sheets:** corn-maze tiles (PROCEDURAL — send a seamless tile set
and a palette, not a layout), UI icons (one transparent PNG each, true pixel
size), portraits (48×48 RGBA, drawn at 2×), the one-frame seven-silhouette
flash (a single 480×270 frame).

---

## 7. THE BEAT CLOCK — the one non-negotiable

Everything reads time off the Web Audio hardware clock. Gameplay never keeps
its own tempo — **it asks the music.** On-beat criticals, the corn maze, the
needle drop: all call `Clock.msOffBeat()` and nothing else.

`WIN_PERFECT = 70 ms` · `WIN_GOOD = 125 ms`. These are **absolute**, so their
share of a beat grows with tempo:

| track | bpm | beat | PERFECT covers | GOOD covers |
|---|---|---|---|---|
| store | 96 | 625 ms | 22% | 40% |
| battle | 132 | 455 ms | 31% | 55% |
| the_journey_continues | 140 | 429 ms | 33% | 58% |
| main_leitmotif | 186 | 323 ms | **43%** | **78%** |

**Open design question.** At 186 BPM a half-beat is 161 ms — barely outside
the GOOD window — so the rhythm game becomes very forgiving. Either gameplay
scenes use slower cues, or the windows tighten at high tempo. Unresolved.

*Corollary that bit us once:* any test asserting "200 ms → OFF" is
tempo-dependent. At 186 BPM a 200 ms-late press is really 123 ms **early** for
the next beat, and scores GOOD. The harness now pins `Clock.bpm=96` for the
judgement-window block.

---

## 8. DELIVERY STATUS

*(This table replaces the old `ASSET_STATUS.md`, which the shot list still
points at by name. Statuses: NOT-DELIVERED / DELIVERED / NORMALIZED /
INTEGRATED / NEEDS-VARIANT / **FLAGGED**.)*

### Backdrops — Tier 1
| ID | Status | Notes |
|---|---|---|
| STORE-INT-A | INTEGRATED, **IP-FLAGGED** | 768×432. Painted + converted by the producer; anchors verified against the paint. `spriteScale:1.5` (front is 1:1 art; sizes the cast to the browsing bins). Real-world album art still on the walls — see below. Producer has **deprioritized** regeneration to get the basics working. |
| STORE-INT-B | INTEGRATED, **IP-FLAGGED** | State B of the store (show night). Producer-painted: own floor + 50 occluder strips, so the folding chairs are solid. `spriteScale:1.5` (matches INT-A). Inherits INT-A's wall posters. |
| STORE-BACK-A | INTEGRATED | IP clean. Producer-authored: grid 4, 9 occluder blobs, no blue. |
| STORE-BACK-B | INTEGRATED | IP clean. State B of the back room (transmitter revealed). Own floor + 14 occluder strips. **`STORE-BACK-B.data.js` is state data — DO NOT DELETE.** It has no anchors by design; spawns/exits/hotspots live on STORE-BACK-A. (An earlier revision of this file called it an orphan. It isn't, and deleting it would silently drop state B's collision and walk-behind.) |
| STORE-EXT-A | NORMALIZED (wide scroll room) | Store exterior, DAY. Wide street panorama (raw 2048×684 → **1024×342** logical, median /2, no 16:9 crop — see wide-intake note below). Radio Underground storefront centre; Cosi Bella + Angles Hair left, The Good Cat + Old Dime Store right. **Awaiting producer mask paint** (FLOOR + OCCLUDER in maskpaint) → then `mask2json`, spawns/exits/hotspots, anchor-validate. Room `size`/`spriteScale` not yet set. |
| STORE-EXT-B | NORMALIZED (wide scroll room) | A DIFFERENT street block (Garage LLC & Towing / Computer Garage & Towing, 720/722). Raw 2170×725 → **1085×362**. Scene 3's flagged pan wanted a STORE-EXT-B; whether A+B are one panning street or two rooms is a producer call. Awaiting mask paint. |
| STORE-EXT-C | NORMALIZED (spare) | Store exterior, NIGHT (band lit in the window, wet street). Raw 2067×761 → **1033×380**. Producer's bonus "in case I write a night scene." NOTE: not pixel-aligned with A (different render size/framing), so it can't be a runtime day↔night *state* of A without a matching re-render or an align/crop pass — treat as its own backdrop unless/until reconciled. |
| BATTLE-STORE · T1-TOWN · T1-BARN · T1-SILO · BATTLE-FARM | NOT-DELIVERED | |

Tiers 2–4 (56 backdrops): all NOT-DELIVERED.
Scheduling note: **CCT-OFFICE-A (Tier 2) is required by Scene 4** — promote it
to the Tier-1 batch or Phase 4 ships a flagged placeholder.

### IP flags on STORE-INT-A / STORE-INT-B
Per the shot list's own rule (no real covers, band names, logos, likenesses):
1. "THE CLASH" wall poster — top wall.
2. Pink Floyd *Dark Side of the Moon* prism — top wall.
3. "SONIC YOUTH" *Goo* cover art — top wall.
4. Purple poster with a strong Hendrix likeness — top wall.
5. Velvet Underground banana sleeve — bottom-left display bin.
6. Right-wall portrait poster — celebrity-likeness risk.
7. Skull "ORDER" poster, right wall — caution.
8. Several bin sleeves read as real covers at a glance — sweep during regen.

Clean and great: the VINYL IS FOREVER neon, STAFF ONLY, GOOD MUSIC HERE mat,
genre placards. Suggested swaps: the canon catalog (Mudflower, The Nibblers,
The Genuines, Paper Kites, invented artists).
**If regeneration moves the furniture, the painted mask and every anchor must
be redone.** Keep the composition identical.

### Sprites
| ID | Status | Notes |
|---|---|---|
| MIKE | INTEGRATED | Repainted. 8-dir, `HIRES-2X` (3×8, **192×768**, 64×96 cell). Player. Assembled by `build_char_sheet.py --scale 2` from `raw/mike_walk/`, **stands from `mike_walk/_mike-standing.png`** (3×3 montage, matches his slim ~0.36 walk art) — **via `MIKE_STAND_ORDER`, not `ROT8`**: his montage's middle row is mirror-symmetric, and reading it as `ROT8` swapped his up-diagonal stands for three sessions (night 23, §6.5) — the true cause of the "mixed facing" the producer kept reporting; verified landed-and-rendering from the producer's own video via template match before diagnosing. Step pins (night 22, kept): `upleft [2,6]` / `upright [1,8]` (each up-diagonal source holds the diagonal only ~half a cycle; stepA = its one true wide contact, stepB = least-turned opposite contact), `right [3,10]` / `up [4,10]` (side-view metric inversion, §6.5) — **right confirmed fixed by the producer**. `right` frame 4 blinks — excluded from pins. 4 intake flags — swing-foot foot-centre drift on stride frames only, **no stand flags**. **Producer approved 2× in the store, and (night 24) verified the full 8-direction walk working perfectly** — the stepB turn-drift frames (upleft f6, upright f8) do not read on-screen with correct stands; no further art needed for the walks. |
| IZZY | INTEGRATED | New. 8-dir, `HIRES-2X` (3×8, 192×768). Assembled from `raw/izzy_walk/`, stands from the 3×3 `_izzy-standing.png` montage (7 of 8; up keeps its walk stand — matte). Loaded + registered; renders in the store. Not yet placed as an NPC (Phase 3). No headphones on the base sheet (fine Scenes 1–4). |
| NOAH | INTEGRATED | New. 8-dir, `HIRES-2X` (3×8, 192×768) from `raw/noah_walk/`, stands from `_noah-standing.gif`. In the `C` cast cycle. 5 flags — swing-foot on strides plus `upleft[0]`/`upright[0]` back-diagonal stands ~4px off-anchor (cosmetic; his turnaround's frame→direction ORDER measured correct in the night-23 sweep — the offset is registration, not a facing swap). The old side-stand drift is **gone** (rotation stands are feet-together). **Footwear still unresolved in canon** (slip-on .md vs one-shoe-untied .docx, §12); the delivered walk art is the slip-ons. |
| SALTMAN | INTEGRATED | New. 8-dir, `HIRES-2X` (3×8, 192×768) from `raw/saltman_walk/`, stands from `_saltman-standing.gif`, `Al.jpg` reference. In the `C` cast cycle. 2 flags — swing-foot strides only; **all stand flags cleared**. Note: his delivered walk art AND standing rotation are both the **navy suit** (not the blue henley an earlier note assumed) — a single consistent outfit, so no stand↔walk clothing swap. Which outfit is canon is a producer call. |
| … | NOT-DELIVERED | Rest of the cast per SPRITE_SPEC. |

> **Stand frames now come from the rotation (`HIRES-2X`).** The queued "stand
> from the standing rotation" item is done: `build_char_sheet.py` takes each
> direction's STAND from a dedicated standing turnaround (`STANDING` config,
> `ROT8` order — except MIKE, whose montage's middle row is mirror-symmetric
> and reads via `MIKE_STAND_ORDER`, night 23, §6.5) — a 3×3 montage for MIKE
> and IZZY, a GIF turnaround for NOAH and SALTMAN — not the walk cycle's
> passing frame. This fixed the forward "one leg
> up" read and cleared the off-anchor side stands (feet-together rotation poses
> plant on the anchor). A small residual remains on a couple of NOAH
> back-diagonal stands (`upleft`/`upright`, a few px off the torso line —
> cosmetic, only when standing still facing away); MIKE and SALTMAN carry no
> stand flags. Izzy's up-stand still comes from her walk (her montage's up cell
> carries a baked matte; Mike's does not). **Watch the source, not just the
> outfit:** Mike's stand was briefly pointed at the *older, stockier* Mike
> (`mike_gifs/`, aspect ~0.51) whose clothes matched but whose proportions did
> not — he rendered a different size than his own walk and pulsed while moving.
> Fixed by pointing at the matching montage; the old folder is quarantined in
> `raw/_archive/`.

Raw sources live in `assets/sprites/raw/<name>_walk/` (one walk cycle per
direction, GIF or PNG-strip) plus a `_*-standing.png` reference montage. Review
renders are in `tools/review/cast_*.png` (rendered through the real compositor
by `tools/review_cast.js`).

### Songs
| id | Status | Notes |
|---|---|---|
| `title_screen` | INTEGRATED | MP3, 61 s, radio tuning. Non-gameplay. |
| `the_journey_continues` | INTEGRATED | 140 bpm, 256 beats, 6 parts, 508 drums. **Test fixture — cannot ship.** |
| `main_leitmotif` | INTEGRATED | 186 bpm, 348 beats, 8 parts, 1692 drums. Producer's MIDI. Plays in Scene 2. Was `!breezy`; re-emitted with the canonical id. |
| legacy `main store copycat battle muzak boss victory` | present | Build-004 oscillator tracks. Untouched, still route to `vNote`/`vDrum`. |

`SONG_LIST.md` holds all 87 cues. Note it names Scene 2's cue `store_morning`
and reserves `main_leitmotif` for the leitmotif itself — currently the same
file. Reconcile when the store cue is written.

---

## 9. THE PHASE PLAN

| Phase | | |
|---|---|---|
| 0 | PRE-PRODUCTION | ✅ intake, IP audit, skeleton |
| 1 | THE STAGE | ✅ engine core, compositor, camera, clock, STORE-BACK-A |
| — | THE SESSION PLAYERS | ✅ music pipeline, voices, `mid2song.py` *(unplanned; arrived when the producer retired the SNES port constraint)* |
| — | SCENE ONE & TWO | ✅ crawl staged, STORE-INT-A integrated |
| 2 | **THE BAND** ← next | **Producer draws the sheets** (`SPRITE_SPEC.md`); crew validates, slices, composites. Mike first — he is the art-bible sprite the way STORE-INT-A is the art-bible room. Drop shadows, registration shots, beat-driven idles. **Accept when the producer approves Mike standing in that store.** Calibration gate; nothing propagates until it passes. |
| 3 | ACT I OPENS (Scenes 1–3) | port `dialog` (96px portraits), `runner` (+`state`/`camera`/`fx` ops), `scenes` verbatim. *(The exit runner already landed early — see §2.)* TALK tutorial, Stylus gag, show-night overlays. Needs STORE-EXT-B (else flagged pan). |
| 4 | THE DEAL & THE BROADCAST (4–6) | BACK-A→B state swap, tube glow, ON AIR, needle-drop re-staged, listener counter. Needs CCT-OFFICE-A. |
| 5 | THE GOON SQUAD (7) | battle logic verbatim; new presentation over plates. Needs BATTLE-STORE. |
| 6 | TOWER 1 | T1-TOWN walkabout, T1-BARN, corn maze rebuilt procedurally, Jingle-Bot. |
| 7 | MASTERING | A/B against build 004, perf pass, full suite green, ship. |

**Standing rules every phase:** harness green · playable file shipped ·
DEVLOG entry in tour-diary voice · screenshots for the producer.

**What ports verbatim from build 004:** the clock, judgement windows, `SONGS`,
sfx, crackle, `audio.js` **in full**, the SCENES op-lists and all dialogue,
the runner, dialog/note/choice logic including the input-consume fix, and the
battle *logic*. Rewritten: battle/needle/maze *presentation* at 480×270.
Retired: the tile atlas, procedural rooms, 16×24 sprites (the maze keeps tiles).

> **Deviation, logged.** `audio.js` remains a byte-verbatim port and must never
> be modified. `songs.js` is **no longer verbatim**: two surgical edits let the
> sequencer carry imported songs (a `voice` field on events, and routing to
> `vVoice`/`vDrumX` when `song.imported`). Legacy tracks still take the exact
> Build-004 path. New instruments live in `voices.js`, a new file.

---

## 10. HARD-WON RULES

1. **THE PAINT IS NOT THE ROOM UNTIL CONVERTED.** Run `mask2json`. A reported
   "occlusion misaligned" bug was once just a skipped conversion.
2. **Re-emit, never hand-edit** generated data.
3. Exported filenames keep their dots: `STORE-BACK-A.mask.png` / `.occl.png`.
   The ID is case-sensitive and *is* the filename.
4. Occluder blobs within one 4px cell of each other **merge** into one horizon.
   Keep separate objects a cell apart unless they genuinely share a floor line.
5. Tools pin **utf-8** both directions. A Windows editor re-saving a `data.js`
   as cp1252 once planted a `0x97` byte that crashed the pipeline everywhere
   else. Em-dashes are banished from generated comments.
6. **Harness and shot coordinates derive from the painted data**, never from
   hardcoded geometry. So: *if a test goes red after a repaint, it found a real
   problem, not a stale anchor.* Repaints can never strand the suite.
7. All authored art flows through the validating generators. The row-length +
   unicode check in `gen_sprites.py` has caught real corruption three times.
8. **A silent no-op is worse than a crash.** A `str_replace` that fails to
   match writes nothing and says nothing; the harness caught a missing
   `Stream.setVol` that would have crashed the intro on first keypress. Verify
   the edit landed.
9. One constant tempo per track. The tool refuses the alternative.
10. **Scale over one-off.** Prefer pipelines that handle many assets repeatably
    over solutions tailored to a single case.

---

## 11. COMMAND CHEAT SHEET
*(Producer's Windows: Python 3.14 via the `py` launcher, Node 24, PowerShell.
Run everything from the project root.)*

```powershell
py -m pip install mido            # once, for mid2song
npm install                       # once, for the harness (pngjs)

py tools\script_check.py                # FIRST. what changed in the script?
py tools\script_check.py --accept       # bless the new state
py tools\mask2json.py STORE-INT-A       # paint -> room. ALWAYS after painting.
py tools\maskview.py  STORE-INT-A       # review render -> tools/review/
py tools\mid2song.py  song.mid  song_id # MIDI -> assets/songs/song_id.song.js
py tools\build_songs.py                 # rewire song <script> tags. after mid2song.
py tools\build_char_sheet.py MIKE assets/sprites/raw/mike_walk  # walk sources -> sheet
py tools\sprite_intake.py MIKE.sheet.png  # validate a sprite sheet
py tools\intake.py    <render.png>      # raw render -> normalized 768x432

node tools\harness.js                   # must stay green (95)
node tools\shot.js                      # registration shots per occluder blob
```

---

## 12. OPEN DECISIONS & RISKS

- **Script reconciliation** (.docx vs .md) — **RESOLVED (2026-07-16).** The
  producer rewrote and expanded **Scene 2 in the .docx** and the **.md was synced
  to it verbatim**; `script_check.py` now reports **DIVERGENT 0** across all 25
  scenes. Settled canon: **Scene 1 crawl = long .docx**; **listening-booth sign =
  "BE YOU"** (changed back from BE GENTLE); nickname register = **Goobs / Michael
  / Gooby / Pops**. The old hidden per-scene divergences (nicknames, Izzy's lines,
  the "Not late!" open) are gone — his expanded Scene 2 is the single source.
  (Crawl outro flag still stands: the .md's old title-card tag was dropped to
  match the .docx crawl — re-append if wanted.)
- **Noah's feet** — **RESOLVED: one shoe untied** (his sprite's permanent state,
  per the rewritten Scene 2 .docx). NOTE the delivered *walk* art still ships the
  slip-ons, so his walk sheet needs a footwear pass to match canon before he
  ships — the intake isn't blocked, but the feet now disagree with the script.
- **Cast stand frames** — the sheets take each direction's STAND from that
  direction's own walk cycle (the feet-together frame), not from the separate
  `_*-standing.png` montage. Consistent per-direction, and it dodges the black
  matte on Izzy's montage back pose. If the producer wants the deliberate
  standing poses as the rest sprite instead, it is a small change to
  `build_char_sheet.py` (read the montage for col 0). Producer's call.
- **Izzy's headphones** — canon puts them around her neck from Scene 5 on
  (`SPRITE_SPEC`), but the delivered base sheet has none. Fine for Scenes 1-4;
  a Scene-5 variant sheet (or an overlay) is a later decision. Flagged, not fixed.
- **Portraits** — thirteen now in hand, all re-cropped from the producer's new
  full-body art by `portrait_crop.py` (48×48 RGBA): ADAM, AL, AYDEN, COACH,
  DAKOTA, DAN, EARL, IZZY, KAM, KRAMER, MIKE, NOAH, REV. EARL and REV are done.
  **DUKE is still missing** unless one of the two placeholder-named regulars
  (COACH / KRAMER) is in fact DUKE — a canon-name call for the producer (see §12
  open decisions). Portraits are not yet wired into code (Phase 3 dialogue).
- **Mike's up-diagonal walks — RESOLVED (night 24).** The three-pass "mixed
  facing" was the SWAPPED up-diagonal stands (§6.5), fixed night 23 and
  verified by the producer: the walk works perfectly in all eight directions.
  The stepB turn-drift frames do not read with correct stands — the
  conditional producer-art request (second-contact frames) is WITHDRAWN.
- **Judgement windows at high tempo** — see §7.
- **STORE-INT-A regeneration** — deferred by the producer. Every mask and
  anchor in that room is a bet that the regen preserves composition.
- **CCT-OFFICE-A** — promote to Tier 1, or Phase 4 ships a flagged placeholder.
- **`the_journey_continues`** — a copyrighted test fixture currently wired into
  the opening. Must be replaced before anything ships.
- **The contact-shadow / front-edge occlusion bug — RESOLVED (night fourteen).**
  The producer saw a sprite draw over an occluder at the closest edge of the
  walk path. Root cause (night thirteen): the **contact shadow**, exposed by the
  1.5 sprite scale. When the sprite stands one step behind an occluder, at the
  front-most walkable spot its baseline `py` sits **exactly on** the occluder's
  horizon (behind the INDIE shelf, `canStand` is true to py=272 and the occl-6
  horizon is 272; its strips cover [260,272), bottom-exclusive). The strip
  re-blit erased the body up to the horizon, but the shadow was drawn at the feet
  and reached rows sy, sy+1 — at/below the horizon, outside every strip — so a
  sliver survived. At 1.5 the shadow is 1.5× wider (18→27 px) and the sliver read
  as feet over the shelf. **Fix (engine-only, `stage.js`):** clamp the shadow to
  end at the baseline `sy` (draw the two rects from `sy-4`/`sy-2` up to `sy`
  instead of down to `sy+2`/`sy+1`), so the whole pool lives inside the sprite's
  occludable span [sy-h, sy); the same strip that erases the body now erases the
  shadow. Proven with a disposable pixel probe at the py=272 tie: sub-horizon
  shadow px **52 → 0**, feet band fully occluded, and render crops show the feet
  vanish at the shelf line while the in-front shadow still draws. The harness
  shadow test stays green both ways (behind 0 px, in front 78 px). No art touched;
  `spriteScale:1.5` preserved.
- **Raising the store's back door** — DONE (`DOOR-RAISE`). The producer had
  already extended the walkway into the doorway in **STORE-INT-B**; that edit was
  in the build, but the exit lives on **STORE-INT-A**, whose floor still stopped
  short (the producer's matching A edit never reached the crew — it wasn't in any
  uploaded zip; the A mask/data were byte-identical to base every time). Fix:
  mirrored B's doorway walkway into `STORE-INT-A.mask.png`, re-ran `mask2json`,
  and raised the exit rect from `[104,64,44,12]` to **`[110,52,32,8]`** — inset
  into the door opening so the 12×4 foot box clears the jambs (100% canStand;
  the full-width raised rect was only 52%). Harness door/exit gates green; the two
  STAFF-ONLY-door probes were repointed from the old py=70 to py=56. Producer can
  nudge the rect; it's hand-authored in `STORE-INT-A.data.js`.
  *(Pipeline note for the producer: paint has to be saved into `assets/masks/<ID>.mask.png`
  AND run through `mask2json` — and the exit is on INT-A, not INT-B.)*
- **Regular names** — the producer added three first-store regulars: Old Earl
  (known) plus two placeholders, **COACH** and **KRAMER**. Portraits and standing
  refs are in for all three. Real names are a canon call; one may be **DUKE**
  (the still-missing portrait, §8). Standing sheets + toggle wiring offered,
  awaiting the go-ahead and the names.
- **Perf** — one 768×432 `drawImage` plus sprites is trivial. Dense imported
  songs (3,255 events in the leitmotif) have not yet been profiled in-browser
  under a full sprite load.

### Producer-requested (raised end of the DOOR-RAISE session)
1. **Stand frame from the standing rotation — DONE (`HIRES-2X`).** The stand is
   now taken from a dedicated standing turnaround (`STANDING` config, `ROT8`
   order) instead of the walk cycle's passing frame, for MIKE/NOAH/SALTMAN and
   7/8 of IZZY. Fixed the "one leg up" forward read and cleared the off-anchor
   side stands; small back-diagonal residual left flagged (§8). Discovery along
   the way: `_izzy-standing.png` is not a single front pose but a 3×3 montage
   (8 dirs, `ROT8` row-major) — her whole standing set was already in hand; only
   the matte'd UP cell falls back to the walk stand.
2. **Higher render resolution (detail pass) — DONE (`HIRES-2X`).** Committed at
   **2×** after the producer judged the prototype ("looks perfect"). Sprite cells
   are 64×96 (`build_char_sheet.py --scale 2`, `sprite_intake.py --cell 64x96`).
   The engine draws each frame into the SAME fixed 32·k × 48·k on-screen box, so
   **`spriteScale` stays 1.5** and nothing else moved — no VIEW_W/VIEW_H change,
   no engine edit, backdrops untouched (the producer's call: the sprites read
   correctly on the current rooms, so only the characters went up-res). The gain
   is pure detail: source downsampled ~1.8× instead of ~3.6×. Intake tolerances
   now scale with the cell so the bump didn't inflate the flag count. If the
   backdrops ever look chunky beside the crisper cast, the producer will pixel-art
   the rooms (their standing offer); not needed at 2×.
3. **Animated talking portraits — PIPELINE BUILT (`FLAP-STUDIO-A`).** Two
   generations of tooling; frames build clean, wiring into the game waits on the
   Phase-3 `dialog` port.
   - **Gen 1 — single-mood stabiliser (`tools/portrait_flap.py`, kept):** keep ONE
     base face, transplant only the mouth from a donor cell. Register on a stable
     band, diff to find the mouth, feather-composite, key + downsample to 48×48.
     Output: `assets/portraits/talking/MIKE.<mood>.{rest,m0,m1,m2}.png` +
     `MIKE.talk.manifest.json`. Good for one hand-picked mood; doesn't scale to a
     pool the producer can mix.
   - **Gen 2 — the separator + Flap Studio (`tools/flap_pool.py`):** the producer
     drops PixelLab full-face expression grids into `raw/talking/` (3×3, 256px
     cells, black bg — `MIKE.talking-1/speaking/yelling` plus the `MIKE.faces-*`
     set); the tool aligns every cell to one base, separates each into selectable
     PARTS, dedups (perceptual mean-abs-luma) and sorts them into a pool. Run:
     `python3 tools/flap_pool.py MIKE --sheet --studio`. Output:
     `assets/portraits/pool/MIKE/` (`base.0.png`, `eyes.N.png`, `mouth.N.png`,
     `pool.json`, `_contact_sheet.png`) — ALL GENERATED, never hand-edit; change
     source/CFG and re-run.
   - **AXES = eyes+brows (one unit) + mouth.** Independent brow transplant was
     abandoned: PixelLab draws each cell with 4–19px per-feature drift and Mike's
     brow sits flush against his eye (no skin gap), so isolating a brow doubled it,
     shadowed it, or dragged a lid. The producer's call: **eyes and eyebrows are
     ONE packaged unit** — each unique eyes+brows combo is one option (`eyes` axis,
     region `UPPER`). Mouths stay a separate axis. The extraction must run on raw
     generator output (the producer can't hand-author clean brow-only art).
   - **`extract_upper` (the unit patch):** global align on `FOREHEAD`+`NOSE`
     (expression-stable, skips the eye/brow/mouth zone → no lid/mouth mis-lock);
     lift the whole `UPPER` region SOLIDLY (feather only spills outward into skin,
     so no base-brow bleeds a soft edge); erase any base-brow pixel the donor
     doesn't cover with the base's OWN forehead skin; and **carve the lower-side
     ear corners out of the box** (`box[106:,x0:82]` / `[106:,174:]`) so the patch
     edge lands on cheek skin, clear of the ears (the "mullet"/ear-outline fix).
     Mouths use the changed-pixel `extract_part`.
   - **Flap Studio (`tools/flap_studio.html`, baked from `_flap_studio_template.html`):**
     the producer picks an Eyes&Brows combo + a Mouth rest + a Mouth sequence,
     previews the flap in a gold stand-in box (large 176px port + 96px per-row
     readouts), names it, and exports a self-registering `<char>.<name>.flap.js`.
     Runs from `file://` (pool inlined as data-URIs).
   - **Flap format & drop-in:** export writes `window.RU_FLAPS["<char>.<name>"] =
     {char,name,cps,open_seq,cadence,eyes,frames{rest,m0…}}` (frames are 48×48
     data-URIs). Drop the file in `assets/portraits/flaps/` and add a `<script>` in
     `index.html` before `main.js`; it self-registers. An example fixture
     `assets/portraits/flaps/MIKE.neutral.flap.js` is wired and self-registers.
   - **Cadence (unchanged rule):** while text types, cycle `open_seq`; show `rest`
     (closed) at line end. The `dialog` port wires this.
   - **`tools/dialog_harness.html`** (from `portrait_flap.py --demo`) remains the
     approved gold-box BLUEPRINT for `dialog.js`; not wired into the build.
   - **Mouth ghosting — first fix MISSED, corrected (`FLAP-DEGHOST-B`).** Mouth
     parts showed a faint base-mouth remnant under the nose wherever the donor's
     mouth sat LOWER than the base's closed lips: donor pixels that happened to
     match the lip luma (diff < thr) and the anti-aliased lip edges fell outside
     the changed-pixel mask, so the base bled through. `FLAP-DEGHOST-A` added a
     "solid core" to cover it — but keyed to `MOUTH_INNER = (152,192,…)`, and
     that window is the **CHIN, not the mouth**. Re-measuring the base cell
     top-down: nose/nostrils y122-133, bright philtrum y134-139, the closed lip
     line **y140-146**, below-lip skin y147-151, chin crease y152+. So DEGHOST-A's
     core dutifully reinforced the jaw while the real mouth kept ghosting; its
     "worst residual 0" was measured against its own chin-window mark, a tautology
     that never counted the actual lip line. (Textbook "measure before claiming
     fixed" — the metric matched the fix, not the artifact the producer sees.)
     **DEGHOST-B fix (`extract_mouth`):** move `MOUTH_INNER` to the true lip band
     `(137,151,98,160)`; locate the mark with a **soft** luma threshold (≤140, so
     the anti-aliased lip halo is caught, not just the <100 core); row-span fill
     for any teeth; dilate 2 px; then hard-clamp between `MOUTH_NOSE_GUARD` (y135)
     and `MOUTH_CHIN_GUARD` (y152) so no dilation can reach the nostrils above or
     the chin crease below. Donor face solid inside the core, feather outward only
     (the `extract_upper` trick). Verified on the rebuilt pool against a mark
     defined INDEPENDENTLY of the fix (dark<140 in y138-150): **0 uncovered
     base-mouth px in all 17 parts** (was 15–101; worst mouth.16), 0 solid-core
     alpha in the nose band, pool counts unchanged (20 eyes&brows + 17 mouths),
     full-face composites clean at zoom and at the shipped 48 px. **The wired
     fixture `MIKE.neutral.flap.js` still bakes pre-fix frames** — the studio
     export doesn't record pool part ids, so the producer should re-export it (30
     seconds in the rebaked `flap_studio.html`) before the dialog port wires it.
   - **Per-character geometry — the tool is no longer Mike-only (`FLAP-GEOM-A`).**
     Every band the separator uses (`nose`, `forehead`, `upper`, `mouth`,
     `mouth_inner`, the nose/chin guards, the ear-carve columns, the brow-erase
     cutoff) was a **global constant hand-measured on Mike's base cell**. Running
     the same tool on IZZY (a second face, centred higher and narrower) put Mike's
     `mouth` band on her **neck** — every mouth option came out identical — and
     Mike's brow cutoff missed her brows, so the base brows **ghosted** through
     every eyes+brows option. Same approach as Mike, wrong coordinates. Fix: all of
     that geometry now lives per character in `POOLS[name]['geom']`; `GEOM_MIKE` is
     Mike's verified set and the default. Threaded through `register` /
     `extract_upper` / `extract_mouth` / `build_char`. **Regression-guarded:** Mike's
     pool rebuilds **byte-identical** (all 40 files) after the lift. New helper
     `python3 tools/flap_pool.py <NAME> --measure` reads a character's own grids and
     prints a per-row change profile + face extent + closed-lip row + a SUGGESTED
     `geom` block (a starting estimate to confirm at zoom, not a finished answer;
     validated to recover Mike's known bands). **IZZY is built and verified
     (`FLAP-GEOM-B`, DEVLOG 30):** nine talking grids intook to `raw/talking/`
     (`IZZY.*`; mapping in `intake_log.md`), base cell `IZZY.neutral-1.png` #1
     (provisional — producer's call). Her measured geometry sits ~20px higher than
     Mike (brows y68-82, eyes y84-108, closed lip y127-134, open scream mouth to
     ~y174; face skin x70-184 @ eye level). Pool: base + 21 eyes&brows + 16 mouths.
     Held to zoom: 0 base-brow ghost across all 21 eyes, 0 base-lip ghost across
     all 16 mouths, nose preserved under the open scream mouths. Mike stays
     byte-identical. Studio rebaked with both (MIKE + IZZY in the dropdown).
     **Not yet wired to the game** — no `IZZY.*.flap.js` exists; the producer
     authors a flap in `flap_studio.html` and exports it, same as Mike. NOTE:
     `--measure`'s auto-suggestion is still Mike-biased (searches the mouth in
     y134-206); it under-reads a face that sits higher, so measure a new face by
     ruler until the estimator's windows are widened.
   - **NOAH is built and verified (`FLAP-NOAH-A`, DEVLOG 32):** eight talking grids
     intook to `raw/talking/` (`NOAH.1..8.png`; mapping in `intake_log.md`), base
     cell `NOAH.1.png` #1 (provisional — producer's call). His face sits between
     Mike and Izzy and is wider (brows y82-95, eyes y96-118, closed lip y133-138,
     open scream to ~y189; face skin x70-198 @ eye level). Pool: base + 11
     eyes&brows + 22 mouths. Held to zoom: 0 base-brow ghost, 0 base-lip ghost,
     nose preserved under the open mouths, Mike byte-identical. **Ear/temple lesson
     (this face's one artifact class):** his ear (dark, x180+) sits right beside a
     bright temple-skin band (x172-178). `extract_upper`'s feathered alpha spills
     ~3px past the carve box showing *base* pixels, so the carve boundary must land
     on that bright skin — `ear=(80,72,176)` puts box+feather on the temple skin,
     clear of the ear, killing the black-nub. (Can't widen the feather fix into
     `extract_upper` — it's shared and guards Mike's byte-identical rebuild.)
     Studio rebaked with all three (MIKE + IZZY + NOAH). **Not yet wired to the
     game** — no `NOAH.*.flap.js`; producer authors in `flap_studio.html`.
   - **Flap Studio UI: inventory + bigger sequence tiles (`FLAP-STUDIO-B`).** The
     flap-sequence row tiles are now 72px (were 52, smaller than the palette) so a
     built cycle is legible at a glance. The empty left column below the preview
     now holds a **Flap Inventory**: every export drops in as a clickable card
     (name, frame count, eyes, cps, + a strip of its mouth sequence); clicking
     reloads it into the builder. Persisted in `localStorage` (with an in-memory
     mirror for `file://` browsers that block it), storing only the lightweight
     recipe (eyes id + mouth-id sequence + cps), never the baked frames. Seeded
     from on-disk `assets/portraits/flaps/*.flap.js` (baked per character into the
     studio pool as `disk_flaps`). Edit `tools/_flap_studio_template.html`, re-bake
     with `flap_pool.py --studio`; never hand-edit `flap_studio.html`. Verified in
     a headless render incl. an export→clear→reload round-trip.

---

## 13. SESSION CLOSE PROTOCOL

1. `py tools\script_check.py --accept` → snapshot the script as blessed.
   (Crew, not the producer. The snapshot is committed to the repo.)
2. `node tools\harness.js` → green.
2b. **`py tools\doc_check.py` → green.** Audits every command, path, number and
   code-claim these docs make against the repo. Stale docs get believed: this file
   once specified the wrong mask grid, and once told the producer to delete a file
   that carried state B's floor.
2. DEVLOG entry, in the tour-diary voice.
3. Update §2 (state), §8 (status), §12 (open decisions) of this file.
4. Bump `BUILD` in `main.js`.
5. Fold any tooling change into §5 / §6. Close and archive any open fix doc.
6. Hand the session's changes back as a git patch (or zip) for the producer to
   apply and push; note the producer's screenshots. (Repo is
   `github.com/mhoke84/SIgnal-of-the-Heart`; the crew clones it at session start
   and cannot push — the producer commits.)
