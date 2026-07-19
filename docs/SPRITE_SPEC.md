# RADIO UNDERGROUND — SPRITE & ASSET SPEC
## What the crew needs from you for each character
*(Producer's working document. Companion to `preproduction_shot_list.md` (backdrops) and `SONG_LIST.md` (music). This is the third leg: everything that moves.)*

---

## FIRST: your reference sheet, marked up

The sheet you found is the right idea. Four things to correct before you build from it:

**It says "Resolution target: 480×270 (single) / 960×540 (scroll)." That is wrong.** 480×270 is right for the viewport; **scroll rooms are 768×432**, not 960×540. That line is quoting a superseded spec. Everything else on the sheet is dimensionally correct.

**"Pixel portraits 48×48" — correct, and nine are already delivered** (`assets/portraits/`): MIKE, IZZY, NOAH, DAKOTA, KAM, AYDEN, ADAM, DAN, AL. Missing and needed: **EARL, REV, DUKE**, and — depending on how far the cast goes — GLORIA, MARTHA, HOLLIS, VERA, and the henchmen.

**"Walk cycles (32×48, 4 directions)" — correct**, but the sheet doesn't say *how many frames* or *in what order*, and that's the part the engine cares about. The contract is below.

**The corn-maze tiles and UI icons are welcome but they're a different pipeline.** The maze is PROCEDURAL (it reorients on MUZAK's downbeat), so its tiles must be seamless and it needs a palette, not a layout. Icons need explicit sizes. Neither goes through the sprite tool.

---

## THE SPRITE SHEET CONTRACT

One PNG per character. `<ID>.sheet.png`, ID in caps, matching the portrait name (`MIKE.sheet.png`).

**Cell: 32 × 48.** The sheet must be an exact multiple.

**Rows — always this order, top to bottom:**

| row | facing |
|---|---|
| 0 | **down** (toward the player) |
| 1 | **up** (away) |
| 2 | **left** |
| 3 | **right** |

**Optional diagonal rows** (for d-pad / two-key walking). Add all four or none — a partial set leaves holes. If you skip them, the engine aliases each diagonal to a cardinal automatically, so the game still runs; the diagonals just reuse a side facing until you draw them.

| row | facing |
|---|---|
| 4 | **downleft** |
| 5 | **downright** |
| 6 | **upleft** |
| 7 | **upright** |

**Columns — left to right:**

| col | frame |
|---|---|
| 0 | **stand** (the idle pose, also frame 1 and 3 of the walk) |
| 1 | **stepA** (contact, one foot forward) |
| 2 | **stepB** (contact, the other foot forward) |
| 3+ | *optional* signature-idle frames |

The walk plays `stand, A, stand, B`. So the minimum sheet is **3 × 4 cells = 96 × 192 px** (cardinals only), or **3 × 8 = 96 × 384 px** with the diagonals.

**Draw left and right separately. Do not mirror.** Izzy's headphones hang on one side. Noah carries the guitar case in one hand. Mirroring makes them swap hands mid-turn.

### The five rules that will bite you

1. **Feet on the bottom row, centred.** The engine anchors a sprite at its bottom-centre: it draws at `x = px − 16, y = py − 48`, where `(px, py)` is the character's floor position. If the lowest opaque pixel isn't on row 47, the character floats. If the feet aren't centred on x = 15.5, the character drifts away from its own shadow.

2. **No baked drop shadow.** The compositor draws the contact shadow itself, matched to the painted props. A shadow in the art will double up and slide.

3. **Hard alpha only.** Every pixel is either fully opaque or fully transparent. Anti-aliased edges survive the integer scale as a grey halo. (This is the same lesson the backdrops taught us: ~80% AA residue, and the fix was to stop pretending the softness was information.)

4. **1px dark warm outline.** The backdrops outline their props the same way (roughly `#2a1a10`). A sprite without it reads as a sticker on a photograph. It must *live* in the room.

5. **Palette from the portrait.** Sample the character's own 48×48 portrait for skin, hair, and cloth. The portraits are canon and already approved; the sprite is that person, smaller.

### Delivery

```powershell
py tools\sprite_intake.py assets\sprites\raw\MIKE.sheet.png
```

The tool never touches your art. It measures and **flags**: wrong dimensions, empty cells, floating feet, off-centre anchors, semi-transparent pixels, a suspected baked shadow, cloned walk frames. It then writes `assets/sprites/MIKE.sheet.png` and the generated `MIKE.sprite.js` that the engine reads. Add `--strict` to make any flag an error.

Non-standard cells (Stylus, props) use `--cell 32x32`.

---

## PER-CHARACTER PLAYBOOK

For each character I need: **the 48×48 portrait** (if not already delivered), **the 32×48 sheet**, and **one line of movement character** — how they carry themselves, which I'll translate into the idle.

Protected canon is marked. These details are load-bearing and must survive every redraw.

### TIER 1 — needed for Scenes 1–7 (the vertical slice)

**MIKE** — *the player character.* Short sandy crop, stubble, red flannel over a dark tee. Portrait delivered.
→ **Protected idle: the 4/4 thigh tap.** He keeps time without knowing he's doing it. Give me at least two idle frames (hand down, hand up) and it will be driven off the beat clock, not a timer. This is the single most important animation in the game and nobody will consciously notice it.

**IZZY** — long brown hair, grey cardigan. Portrait delivered.
→ **Protected: headphones around her neck, always, from Scene 5 onward.** Not on her ears. Around the neck. If they vanish in one facing, the whole cast's continuity is suspect.
→ Idle: a slow sway. Two frames.

**NOAH** — blond mop with a fringe, white band tee, **slip-on shoes** (his sprite's permanent state).
*Script conflict, unresolved:* the `.md` says slip-ons, the `.docx` says "one shoe untied." Tell me which is canon before you draw the feet.
→ Idle: restless feet. He cannot stand still.
→ He enters Scene 2 **at a dead run, guitar case first.** That's a bespoke frame, not a walk cycle. Flag it when you get there.

**OLD EARL** — the game's canary. Bespoke build: stoop, cane.
→ Portrait needed. His silhouette must read as *old* at 32×48 without a face, because at that size there is barely a face.
→ Idle: leaning on the cane, shifting weight. He never taps the beat. That's the point.

**STYLUS** — the cat. `--cell 32x32` or whatever the pose needs.
→ **Protected: Stylus sits on the SALE crate and cannot be moved by any means for the entire game.** He needs exactly one pose, plus optional idle frames (tail flick, blink, an ear). He does not need facings. He does not need a walk cycle. He will never use one.

### TIER 2 — recruitment and the road (Scenes 8–17)

**DAKOTA** (portrait delivered) · **KAM** (delivered) · **AYDEN** (delivered) · **ADAM** (delivered — *protected: the lateness gag*) · **DAN** (delivered).
Each needs a 32×48 sheet. One line of movement character each.

**REV** — the defector. Portrait needed. New character; the script marks him as such.

**DUKE** — **never fully seen. A silhouette in a hat. Keep it dark.**
→ He needs a sheet, but it's a shape, not a person: no face pixels, no palette beyond two or three values. If you can read his expression, it's wrong. Portrait: a silhouette, or none at all.

### THE OPPOSITION

**AL SALTMAN** — dark curls, blue henley. Portrait delivered (`AL.png`; the producer's reference photo is the source).
→ He is the only villain who gets a real idle. He should look tired.

**LARRY, CURLY & MOE** — the henchmen. *Protected: the danish tracker — Curly's choice in Scene 7 carries forward all game.* Curly therefore needs a variant with a danish and one without.

**PRESIDENT DIP STICK** · **M.U.Z.A.K. PRIME** — machine and mascot. MUZAK is architecture, not a body; it will be handled as room art plus overlays, not a sprite sheet.

---

## WHAT IS *NOT* A SPRITE SHEET

**Corn maze tiles** — PROCEDURAL. The maze reorients on MUZAK's downbeat, so it's built from tiles at runtime. What I need from you is a **seamless tile set and a palette**, not a layout. Any cell must be able to sit next to any other.

**UI / icons** — heart, vinyl, cassette, antenna, shield, cat, coin, gear. Send them as one PNG each, transparent, at their true pixel size, and tell me that size. They are drawn on the camera-independent UI layer and never scale.

**Portraits** — 48×48 RGBA, drawn at 2× (96×96) in the talk box. Already the right format; just keep making them the same way.

**The one-frame seven-silhouette flash** *(protected gag)* — one 480×270 frame, drawn once. Not a sheet.

---

## SUMMARY: WHAT I NEED PER CHARACTER

1. `<ID>.sheet.png` — 32×48 cells, 4 rows (down/up/left/right), ≥3 cols (stand/stepA/stepB), hard alpha, feet on the baseline, no baked shadow, 1px warm outline.
2. `<ID>.png` — the 48×48 portrait, if not already in `assets/portraits/`.
3. One sentence: **how do they carry themselves?** That becomes the idle.
4. Anything protected about them, said out loud, so it goes in the file header and survives every future redraw.

Run `py tools\sprite_intake.py` before you send them. It will tell you what's wrong faster than I can.

**Start with MIKE.** He's the art-bible sprite the way STORE-INT-A is the art-bible room — the producer approval gate for Phase 2. Nothing else propagates until he's approved standing in that store.
