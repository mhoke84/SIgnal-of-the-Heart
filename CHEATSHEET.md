# RADIO UNDERGROUND — PRODUCER CHEAT SHEET
**Every command runs from the project root** (the folder with `index.html`). PowerShell.
Green harness = safe. Red harness = stop and read it; it is telling you something true.

---

## ONCE, EVER (python)
```powershell
py -m pip install mido python-docx pillow numpy
```

## ONCE PER CLONE (node)
```powershell
npm install
```
`node_modules` is not committed. **Every fresh clone of the project needs
`npm install` once**, or the harness dies with `Cannot find module 'pngjs'`.

## EVERY SESSION, BEFORE ANYTHING
```powershell
node tools\harness.js        # must be green BEFORE you start, not just after
```

**You do not run `script_check.py`.** That one is mine — it tells *me* what you
changed in the script since last session, and it runs against the tree you push.
Rewrite scenes freely; the snapshot is committed to the repo and I diff it.
The only time you'd want it: `py tools\script_check.py --show 2` prints Scene 2
from both script files, side by side, if you're trying to remember which is which.

---

## ADDING A SONG

**You make:** a `.mid` from your DAW. One constant tempo. One instrument per MIDI channel. Drums on channel 10.

| # | do this | check |
|---|---|---|
| 1 | Export MIDI. **Bounce out any tempo changes.** | — |
| 2 | `py tools\mid2song.py mytune.mid <id>` | prints `constant_tempo=True` |
| 3 | `py tools\build_songs.py` | lists your song |
| 4 | `node tools\harness.js` | green |
| 5 | Refresh the game (**Ctrl+Shift+R**) | — |

**Choosing `<id>` — this is the whole decision:**
- To **replace one of my tracks**, use its name: `main` `store` `copycat` `battle` `muzak` `boss` `victory`.
  → `py tools\mid2song.py store_morning.mid store` and it's live. Nothing else to do.
- For a **new cue**, use a new name from `SONG_LIST.md` (e.g. `walts_barn`).
  → It won't play until I wire it to a scene. **Tell me.**

**If the tool refuses:** it found a tempo change. That would drift the whole game off the beat clock. Fix it in the DAW, not here.

**Never** hand-edit `assets/songs/*.song.js`. Re-export the MIDI and re-run.

---

## ADDING A BACKDROP

**You make:** a render, named **exactly** the shot-list ID. `STORE-EXT-A.png`, not `storefront final v3.png`. The filename becomes the ID.

| # | do this | check |
|---|---|---|
| 1 | Save render to `assets\backdrops\raw\STORE-EXT-A.png` | name matches the shot list |
| 2 | `py tools\intake.py assets\backdrops\raw\STORE-EXT-A.png` | writes `normalized\STORE-EXT-A.png` |
| 3 | **Send it to me.** I write the room's anchors skeleton. | — |
| 4 | Open `tools\maskpaint.html`, load the *normalized* PNG | badge shows the layer |
| 5 | Paint **FLOOR** (white = walk, black = solid). `Tab` to switch. | — |
| 6 | Paint **OCCLUDER** (orange = things you walk behind, down to the floor line) | keep separate objects ≥1 cell apart or they merge |
| 7 | Export both → `assets\masks\STORE-EXT-A.mask.png` and `.occl.png` | **keep the dots in the name** |
| 8 | `py tools\mask2json.py STORE-EXT-A` | look for `occl: N objects -> M strips` |
| 9 | `py tools\maskview.py STORE-EXT-A` → open `tools\review\` | floor looks right |
| 10 | `node tools\harness.js` | green |

**State variants (a room's B backdrop — show night, raided, restored):** paint them
too, under their own ID. `STORE-INT-B.mask.png` + `.occl.png`, then
`py tools\mask2json.py STORE-INT-B`. The engine picks up B's floor automatically
when the state flips (press `T`), because Scene 3's folding chairs are solid and
A's floor would let you walk through them. **Anchors stay on the A room** — B needs
no spawns, exits, or hotspots.

> **THE PAINT IS NOT THE ROOM UNTIL YOU RUN `mask2json`.** Nine times out of ten, "the occlusion is broken" means step 8 was skipped.

**Step 3 matters.** If `<ID>.data.js` doesn't exist yet, `mask2json` writes a bare stub with **no exits, no hotspots, no spawns** — the room will load and do nothing. Send me a new backdrop *before* you paint it.

**Never** hand-edit `mask`, `walkBehind`, or `grid` in a `.data.js`. Repaint and re-run.

---

## MOVING AN ANCHOR (doors, hotspots, ON AIR signs, spawns)

**Yes — anchors are yours. Hand-edit them freely.** Open
`assets\anchors\<ID>.data.js` and change the numbers.

| you may edit by hand | never hand-edit (generated) |
|---|---|
| `spawns` `[x,y]` · `exits` `rect[x,y,w,h]` + `to`/`spawn`/`face` · `hotspots` `rect` + `face`/`op` · `fx` `at[x,y]` · `npcSlots` `[x,y]` | `mask` · `walkBehind` · `grid` |

```powershell
py tools\anchorview.py STORE-BACK-A       # state A
py tools\anchorview.py STORE-BACK-A B     # state B (fx that only exist in B)
```
Draws every anchor on the backdrop with its exact numbers, into `tools\review\`.
Edit the numbers, re-run, look again. It also checks them the way the engine does
and refuses to call a bad anchor good.

**Two gotchas it exists to catch:**
- **`fx` `at` is the CENTRE of the effect**, not its top-left corner. That's why
  the ON AIR sign and the tube glow were floating.
- **`Mask.canStand` is a 12px-wide, 4px-deep foot box** (`px±6`, `py-1..py-4`),
  not a single point. The outer 6px of a doorway and the top 4 rows of any floor
  are unusable. A spawn or exit there will read as "walkable" to the eye and fail
  in the engine.

**To move a door higher into its doorway:** the floor has to reach there first.
Paint the threshold walkable in `maskpaint`, run `mask2json`, *then* raise the
`rect`. `anchorview` will tell you if you moved it somewhere the player can't
stand. Doors can also take `face:'up'` — the player must be walking into the
door, so squeezing past it sideways no longer boots you out of the room.

---

## ADDING A SPRITE

**You make:** one PNG per character, `MIKE.sheet.png`. **Cell 32×48.** Full spec: `docs\SPRITE_SPEC.md`.

```
       col 0     col 1     col 2     col 3+
row 0  stand     stepA     stepB     idle...   ← facing DOWN
row 1  stand     stepA     stepB               ← facing UP
row 2  stand     stepA     stepB               ← facing LEFT
row 3  stand     stepA     stepB               ← facing RIGHT
```
Minimum sheet = 3 × 4 cells = **96 × 192 px**. Rows are always in that order.

**The five rules:**
1. **Feet on the bottom row of the cell**, or the character floats.
2. **Feet centred left-to-right**, or the character drifts off its own shadow.
3. **Hard alpha.** Every pixel fully opaque or fully clear. No soft edges.
4. **No drop shadow in the art.** The engine draws it.
5. **Draw left and right separately.** Don't mirror — Izzy's headphones would swap sides.

| # | do this | check |
|---|---|---|
| 1 | Save to `assets\sprites\raw\MIKE.sheet.png` | ID matches the portrait name |
| 2 | `py tools\sprite_intake.py assets\sprites\raw\MIKE.sheet.png` | read every flag |
| 3 | Fix flags in your art, re-run until it says **clean** | `--strict` makes flags fail |
| 4 | **Send it to me.** I load it and put the character in the room. | — |
| 5 | `node tools\harness.js` | green |

Cat, props, odd sizes: `py tools\sprite_intake.py STYLUS.sheet.png --cell 32x32`

---

## WHEN SOMETHING'S WRONG

| symptom | almost always |
|---|---|
| `intake.py` refuses | You pointed it at `normalized\`. It **writes** there. Point it at `raw\`. |
| `Cannot find module 'pngjs'` | Run `npm install` in **this** folder. Every clone needs it once. |
| State B walks through furniture | You painted `<ID>-B`'s masks but didn't run `mask2json` on the **B** ID. |
| A door does nothing | The target room isn't painted yet, or its `.data.js` isn't in `index.html`. Or you're not facing it (`face:'up'`). |
| An overlay is off-target | `fx` `at` is the effect's CENTRE. Run `anchorview.py` and look. |
| I can't raise a door | The floor doesn't reach. Repaint the threshold, `mask2json`, then move the rect. |
| "My change didn't take / it reverted" | Cached copy. Check the **BUILD stamp**, bottom-left of the title screen. If it doesn't match `main.js`, hit **Ctrl+Shift+R**. Also check you don't have two copies of the project cloned/open. |
| Occluders look wrong | You didn't run `mask2json` after painting. |
| Two objects share one horizon | Their orange blobs touch. Leave a 4px gap. |
| Character floats / slides | `sprite_intake` told you. Re-read its flags. |
| Song is silent | It's registered but nothing calls it. New ids need me to wire them to a scene. |
| Song drifts out of time | Tempo change in the MIDI. `mid2song` should have refused it — if it didn't, tell me. |
| Harness went red after a repaint | **It found a real bug.** The tests read your painted data; they don't hardcode geometry. |
| `UnicodeDecodeError` from a tool | A Windows editor re-saved a generated file as cp1252. Re-run the tool that made it. |

---

## THE ONE RULE UNDER ALL OF IT

**Author in a real tool. Convert with a script. Never hand-edit what the script wrote.**

| you own (canon) | the tool owns (generated) |
|---|---|
| renders, `.mask.png`, `.occl.png`, `.mid`, `.sheet.png`, the script | `mask` / `walkBehind` / `grid` in `.data.js` · `*.song.js` · `*.sprite.js` |

If a generated file is wrong, the *source* is wrong. Fix the source, re-run the tool.

---

## SESSION END
```powershell
node tools\harness.js               # green
```
Then send me the folder. I run `script_check.py`, write the DEVLOG entry, update
the reference, and bump the build stamp. If the harness is red, send it anyway and
say so — a red test is information, not a failure to hide.
