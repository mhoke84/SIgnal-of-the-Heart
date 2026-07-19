# RADIO UNDERGROUND v2 — TOUR DIARY (The Hi-Bit Sessions)

## NIGHT ZERO — PRE-PRODUCTION
The producer settled the art question the right way: the producer IS the
art department now. Painted rooms, living sprites — the PS1 FF model. We
are the rhythm section; the constitution says so in writing.

First four rooms arrived. Intake tool built and run: the renders carry no
true pixel grid (px=1, ~80% AA residue — AI paints in a pixel-art accent,
it doesn't speak grid). Design decision, logged: 16:9 content crop +
integer /2 median downsample → 768×432 scroll rooms, 480×270 viewport,
sprites 32×48 (checked against the ~65px doors — proportion holds).

**The intake audit did its job on day one:** STORE-INT-A/B are FLAGGED —
eight real-world items on the walls and in the bins (full list in
ASSET_STATUS.md). Per the constitution we flag, we do not fix; regeneration
requested with the canon catalog. STORE-BACK-A/B came back CLEAN and
gorgeous — the back room is our Phase 1 workhorse. The drop-cloth render
really does look like Chekhov's gun in a sheet, and BACK-B looks like a
chapel, exactly as ordered.

Build 004 rides along as `reference_build004.html` — every line of
dialogue, the beat clock, the battle math: that's the record we're
re-pressing, not rewriting. Plan of attack is BUILD_PLAN.md, seven phases,
one approval gate at the art-bible screen.

— crew, night zero, the van smells like fresh prints

## NIGHT ONE — THE STAGE (Phase 1)
The engine has a floor now, and the floor is real. Build 004's rhythm
section rode over verbatim — Clock, the songbook, the sequencer, the
tapped/consume input trick — byte-for-byte diffed against the record,
because you don't re-play a take that's already on tape. (One splice
bit us: an extraction pass left the songbook's liner-note comment
unterminated inside audio.js and it quietly swallowed sfx() whole.
The harness caught it on the first run. Label your tapes.)

New on the board: the loader with its ready gate, the §3 compositor,
the camera (soft-clamped, 768x432 room against the 480x270 glass),
mask.js, and the walk-behind trick — strips join the sprite y-sort at
their horizon line, so the shelf row occludes a body in the back
corridor with zero extra art. It works. There's a pixel-scan test
that proves the box-sprite vanishes behind the shelves and reappears
on the open floor.

Room data: STORE-BACK-A mask painted, mask2json'd (96x54 cells, RLE),
maskview render in tools/review/ for the producer. One revision to
the night-zero starter reads, logged not silent: the "left workbench"
walk-behind strip is gone — the box stack has no corridor behind it,
nothing to walk behind. Three strips remain: shelves, couch, sign.
Exit rect trued to the couch/sign gap; desk-lamp fx anchor moved to
the lamp's actual head.

The shot harness got rebuilt from scratch at 480x270 (the /tmp
original from the 004 sessions didn't ride along in the project zip)
— softcanvas runs the REAL scripts headless, no mock compositor to
drift out of tune. Harness suite: 34 green. Registration shots in
tools/review/shots/, including the corridor shot and both clamp
corners. T-key previews BACK-B with the tube-glow and ON AIR overlay
stubs — Phase 4 finishes those; tonight they just prove the state
swap and the fx hooks.

Store theme plays at 96 and the debug 45 spins on the one. Walk it
with arrows or WASD; Z grades your press against the clock, PERFECT
at 70ms like the law requires.

— crew, night one, the back room smells like warm dust and it's ours

### Night one, addendum — maskpaint
The producer asked the right question ("how do I edit the floor?") so
the toolbox grew one: tools/maskpaint.html. Backdrop under, mask over
at slider alpha, three legal colors and no others, painting snapped to
the engine's 8px cells, cell-grid toggle, rect fill, undo, export
straight to <ID>.mask.png. It quantizes any loaded mask to the legal
palette with the exact classifier mask2json uses (parity-tested), so
stray anti-aliasing from outside editors gets scrubbed on the way in,
not discovered on the way out. Loop: maskpaint -> export ->
mask2json -> maskview -> refresh the game.

### Night one, second addendum — occlusion goes paintable
Producer field report came back from the first maskpaint session:
walkable painted fine, blue did nothing they expected. Correct
diagnosis of a design flaw, not a user error — floor was paintable,
occlusion wasn't (it lived as hand-typed rects in the data.js), so
blue read as "this obscures" when it only meant "walkable corridor."

Fixed at the root: maskpaint grew an OCCLUDER layer (Tab to switch,
paint silhouettes in orange, SOLID erases). mask2json now ingests
<ID>.occl.png: each connected blob becomes a walk-behind occluder,
horizon = the blob's bottom row, decomposed into cell-snapped strip
rects so overlapping bounding boxes never steal each other's pixels
(the stool sits INSIDE the drop-cloth zone with its own horizon and
it composites correctly — tested). Blobs that touch, merge: keep
different objects a cell apart unless they share a floor line.

STORE-BACK-A re-authored FROM the producer's own painted mask —
their floor paint was better than night one's blanket rects (the
zone in front of the transmitter table is real floor with the stool
on it; opened). Their eight blue seeds became seven occluder blobs
(shelves+hand truck+cloth merge at a shared horizon). New corridors:
behind the crate row, behind the leaning sign, behind the little
box by the record crates. Left tall shelf stays solid — the wall is
right behind it, there's no floor to walk — but it carries an
occluder anyway, inert until something can get back there.

Harness now 43 green, including pixel proofs: body hidden / head
visible behind sign and crates, sprite NOT eaten standing in front
of the stool under the cloth's edge. Registration shots re-taken at
every new corridor.

— crew, night one still, the producer paints and the room obeys

### Night one, closing addendum — the producer takes the brushes
Session three, and the tool sessions paid off in full. The producer
re-authored STORE-BACK-A end to end: nine occluder blobs painted
against the art at the new 4px grid, floor mask opened wide, and —
their call — zero blue corridors. Blue is officially optional now;
the occluder layer carries occlusion, the floor layer carries feet,
and nothing else was ever needed.

Two bugs of ours died on the way. mask2json wrote data.js in
whatever encoding the OS felt like (cp1252 on the producer's
Windows), which planted a 0x97 byte that crashed the pipeline on
any UTF-8 machine — tools now pin utf-8 both directions, and the
em-dash that caused it is banished from generated comments. Bigger:
the harness hardcoded OUR room geometry, so every producer repaint
turned tests red for no honest reason. The harness now derives its
test coordinates from the painted data itself — it finds the floor
behind each occluder blob, teleports the box-sprite there, and
pixel-proves body-hidden / head-visible per blob. Same for shot.js:
registration shots are generated per blob, whatever the paint says.
41 green against the producer's own room. Repaints can never strand
the suite again.

One false alarm worth recording for the tour book: "occlusion
misaligned" turned out to be "forgot to run mask2json." The paint
is not the room until it's converted. It's in the workflow docs
twice now.

Phase 1 stands complete on producer-authored canon. Next stop is
Phase 2 — sprites — the moment the regenerated INT backdrops land.

— crew, end of night one for real this time

## NIGHT TWO — THE SESSION PLAYERS
The producer walked in and killed a constraint that had been quietly
shaping everything: no SNES port. Which meant the chiptune wasn't a
requirement anymore, it was just what we happened to have.

Honest assessment first, because that's the deal. There were no music
files to swap — the whole soundtrack was oscillators, generated live
from note lists in songs.js. So "upgrade the tracks" had three answers:
richer synthesis, sampled instruments, or pre-rendered audio. We laid
out all three and the producer went straight at the one caveat we'd
oversold: that pre-rendered tracks would cost the humanize mechanic.
Wrong, and they said so. Modern records are cut to a click. The beat
clock judges against a mathematical grid and never listens to the
audio, so a click-locked track compromises nothing. Conceded, logged.

Then the producer asked the better question — could we work from MIDI?
— and the answer turned out to be the whole pipeline. A MIDI file IS a
note list. Pitch, start, duration, velocity, one channel per part,
channel 10 for drums. It maps almost one to one onto the format the
sequencer already speaks.

So: tools/mid2song.py, sibling to mask2json, same constitution. Author
in a real tool, convert to generated data, never hand-edit the output.
It refuses a file with tempo changes rather than ship a silent drift
bug — the beat clock needs one bpm and won't bend. One thing had to
change: the game runs from file://, where fetch() of a .json is
CORS-blocked. So songs ship as self-registering plain scripts, exactly
the trick the room data already uses. The .json rides along for diffs.

New file, src/core/voices.js: nine instruments and a real kit, built
only from the Web Audio nodes the harness shims. audio.js stays
byte-verbatim — Build 004 is Build 004, and all seven legacy tracks
still play its oscillators, untouched. songs.js took two surgical
edits to route imported songs to the session players. That's a
deviation from "port verbatim" and it's written down where it can't
be forgotten.

Title screen gets an mp3 — a radio tuning across a dead band. Deliberately
NOT on the beat clock, deliberately outside the Web Audio graph, because
it's a sound effect and encoder padding can't hurt what nothing measures.

Harness: 52 green.

— crew, night two, the band showed up and they can actually play

## NIGHT THREE — SCENE ONE, SCENE TWO
The producer painted STORE-INT-A. Not the regenerated one — the flagged
one, IP posters and all, with eyes open: get the basics working, fix the
walls later. Their call, logged, and the risk is written down (if the
regen moves the furniture, the mask and every anchor go back in the bin).

The paint was good. 20,736 cells, half of them floor, sixty-one occluder
strips. What it also did was catch us lying. Anchors we'd guessed at from
the render — before there was any mask to check them against — turned out
to be wrong in ways only the floor could reveal. The `fromBack` spawn sat
inside a solid record bin; the player would have materialized stuck. The
exit was on top of the ROCK/PUNK bin, because there is no bead curtain in
that render, whatever the script says: the back room is behind the STAFF
ONLY door in the top-left corner. And the counter is along the TOP of the
room, not the right, so `counter` and the Zamfir hotspot had been floating
in open floor, pointing at nothing.

Two checks now do that work, and they're cheap: a hotspot must sit on
SOLID pixels (or it's aimed at air), and it must have walkable floor on
its `face` side (or the player can't stand where they'd have to stand).
Nine hotspots, all green. Zamfir on the window display where he belongs.
Stylus on the blue SALE crate, where he will remain until the heat death
of the universe.

Then the crawl. The producer flagged that the opening text was wrong, and
they were right, and the reason was worse than a bug: the .md script we'd
been handed carries a SHORT Scene 1. The long crawl — the handshake, the
chant from the stands, we are one — lives only in the .docx. The two files
have crossed: the .docx has the real crawl and an older Scene 2; the .md
has the newer Scene 2 and the wrong crawl. Somebody has to reconcile them
before Phase 3 touches a line of dialogue.

Scene 1 is staged now, to the letter of the bracket notes. The tuning ebbs
to black. The song bursts in. Thirty-eight lines rise and scroll clean off
the top. Black. "...OR SO THEY THOUGHT." fades up centre screen, and fades.
Then "THIS IS THE STORY OF THE PEOPLE WHO KNEW THE DIFFERENCE." The song
ebbs, the tuning comes back alone for five seconds, and the store opens.
Ninety seconds, and the scroll speed is DERIVED from the line count, so
editing the text can never desync the timing.

And a ghost got caught. The producer swore the intro text had reverted
between launches. It hadn't — the file was right the whole time; they'd
opened a stale copy. There is now a BUILD stamp on the title screen and in
the console. If it doesn't match your source, the browser handed you a
cached file. Cheap fix, permanent answer.

One more, and it's the harness earning its keep twice in one night. A
str_replace that didn't match wrote nothing and said nothing, leaving the
intro calling a Stream.setVol that didn't exist — a crash on the very first
keypress, and the tests found it before the producer did. Then a red on
"200ms -> OFF", which was not a bug at all: the leitmotif runs at 186 bpm,
where a beat is 323ms, and a press 200ms late is really 123ms EARLY for the
next one. GOOD, not OFF. The code was right; the test was tempo-dependent.
Pinned to 96 and written up, because it points at a real design question:
at 186 bpm, 78% of the beat scores GOOD. That is a very forgiving rhythm
game. Someone will have to decide whether that's the game we want.

The store floor is walkable. Mike's tune is playing in it, live, off the
producer's own MIDI, on the clock. Harness: 69 green.

— crew, night three, somebody buy the Zamfir record

## NIGHT THREE, ADDENDUM — THE FILING CABINET
The producer said it plainly: the project is young and already messy.
True. Six crew documents, and three of them disagreed with the code.
DEVELOPMENT_BRIEF still specified an 8px mask grid (it's 4). BUILD_PLAN
still bragged about 34 green tests (69). The brief's port table still
called songs.js verbatim (it isn't, and that deviation matters).
NEXT_SESSION described a Phase 2 blocked on art that the producer has
since decided to work around. MASKPAINT_FIXES was a closed ticket.
claude_code_hibit_prompt_v2 was the letter that started the band and
had no business being read as current spec.

All of it now folds into docs/MASTER_REFERENCE.md — constitution,
architecture, both pipelines, the schemas, the status tables, the phase
plan, the hard-won rules, the open questions. Everything else goes to
docs/archive/ for provenance, with a sign on the door saying don't read
this for truth. The producer works from three files: the script, the
shot list, the song list. The crew works from two: the reference and
this diary.

Stale docs are worse than no docs. They get believed.

— crew, still night three, the van is clean for once

## NIGHT FOUR — THREE PIPELINES AND A CONSTITUTIONAL AMENDMENT
The producer said three things that each rewired a part of the shop.

*"I plan on rewriting scenes on the fly all the way through."* So the script
is not a document, it's a moving target, and "remember to check it" is not a
process. tools/script_check.py now hashes every scene in both script files,
diffs against last session's snapshot, and reports ADDED / REMOVED / CHANGED.
It runs first, every session, and it's written into the reference where it
can't be forgotten. First run earned its keep immediately: of twenty-five
scenes, twenty-three differ only in stray punctuation between the .docx and
the .md. Exactly two truly diverge — Scene 1 (the crawl, 48% similar) and
Scene 2 (97%). And inside Scene 2 it found something nobody had noticed: the
listening booth sign says BE GENTLE in the .docx and the shot list, and BE YOU
in the .md. Somebody has to decide.

*"I plan on adding original music to replace all music originally created by
you."* Good. The path was already there and nobody had noticed: every
.song.js runs after songs.js and assigns into SONGS by id, so a converted
MIDI named `store` simply overwrites the crew's store theme. Proved it —
96 bpm oscillators became 186 bpm session players, imported:1, no code
touched, the other six legacy tracks untouched. Then tools/build_songs.py,
because eighty-seven cues is not a hand-editing job: it scans assets/songs
and owns the script tags in index.html and the harness between markers. It
also prints which Build-004 tracks are still standing. Seven, for now.

*"I would like to be able to customize the sprites for each character."*
This is the amendment. The constitution said the producer supplies backdrops
and the crew draws the cast — gen_sprites.py, pixel strings, the whole
apparatus. Not any more. The producer draws the cast too, and the crew
composites. So: tools/sprite_intake.py, sibling to intake.py and mask2json,
same rule — it never restyles art, it measures and flags. Cell 32x48, four
facings in fixed order, stand/stepA/stepB. It checks the things that are
invisible until they're catastrophic: feet on the baseline (or the character
floats), foot centre on the anchor (or they drift away from their own
shadow), hard alpha (AA reads as a halo), no baked drop shadow (the
compositor draws it), and whether the walk frames are actually different.
Tested against a deliberately broken sheet: seventeen flags, all correct.

And buildSheet() on the engine side, slicing a sheet into per-frame canvases
at load so stage.js never learns a new trick. Which is where the night's bug
lived: `const SPRITE_SHEETS = typeof SPRITE_SHEETS !== 'undefined' ? ... : {}`
is not a guard, it's a temporal-dead-zone crash — the name is dead until the
line finishes, so it can't check whether it exists. Hung the whole page.
Anchored the registry on window instead. Old trick, still sharp.

The producer sent a reference sheet they'd found. It's the right shape and
one line of it is a lie: "960x540 (scroll)". Our scroll rooms are 768x432.
That number is quoting the superseded prompt doc — the one we archived last
night with a sign on the door. Stale docs get believed, and now one of them
almost got drawn.

docs/SPRITE_SPEC.md is the playbook: what's needed per character, what's
protected, and what isn't a sprite sheet at all (the maze is procedural, and
Stylus needs exactly one pose because Stylus is never going anywhere).
Start with Mike. He's the art-bible sprite the way STORE-INT-A is the
art-bible room, and his thigh tap runs off the beat clock, not a timer.

Harness: 69 green.

— crew, night four, three tools richer and one constitution shorter

## NIGHT FIVE — DOORS, AND A GHOST THAT WASN'T
Four reports from the producer. Three were real, one was me being wrong twice
before I was right.

The pngjs crash was the simplest and the most embarrassing: node_modules never
travels in the zip, because the crew strips it before packing. Every fresh unzip
is a fresh folder and needs `npm install` once. Now softcanvas.js catches the
missing require and says exactly that instead of vomiting a stack trace, the
cheat sheet has a section for it, and node_modules rides along in the zip.

STORE-INT-B: the producer painted it, ran mask2json, and found the store floor
loaded under the show-night backdrop. Their instinct was right and their
diagnosis was right — no anchors, and the mask was A's. But the fix isn't
anchors. B is a STATE of the store, not a room: it has no doors of its own, no
spawns, no hotspots. What it does have is folding chairs, and chairs are solid.
The engine kept one mask per room, so a state swap changed the picture and not
the floor. Stage.dataFor() now resolves mask and occluders through the state's
backdrop ID, which is exactly the ROOMS entry mask2json already wrote. Paint B,
run the tool, press T, and the chairs stop the player. Anchors stay on A. Both
stub files got a header saying so, because someone will otherwise "fix" them by
adding spawns.

The back door. It reported instead of working, because Phase 1 said exits were
report-only and the INT rooms were flagged. That flag is stale — the producer
chose to move forward on the flagged art — so the runner landed early. And the
toast that read EXIT -? was not a bug in the toast: font.js is a verbatim Build
004 port and Build 004 never needed a '>' glyph, so text() substituted its
fallback '?'. Glyphs now live in font_ext.js. Verbatim stays verbatim.

Then the harness caught a bug I had just written. STORE-INT-A's fromBack spawn
is [124,72] and its doorway trigger is [96,60,56,16]: you arrive standing in the
door you came through. The two rooms ping-ponged forever. Exits now disarm on
arrival and re-arm only when the player steps clear of every trigger. Five tests
guard it, including one that just stands in the doorway for six frames and
insists nothing happens.

And the shadow. The producer said it stays visible when the character walks
behind an occluder. Twice I measured it and got answers that made no sense —
sprites that weren't drawn, chest pixels reading pure black. Both times the
cause was the same: I was sampling before the camera had finished lerping to
the player, so I was reading a frame that was still in motion. Let the camera
settle and the truth is boring: behind the counter, the shadow is erased along
with the body, zero pixels, because it is drawn inside the sprite's own y-sort
entry and the re-blitted strip takes both. In front, 89 pixels, exactly as it
should. There is now a pixel test that renders the frame, renders it again with
no sprites at the same camera, and diffs the band at the player's feet.

So either the producer saw a different occluder — one whose painted horizon sits
above the object's true floor line, which would let a player stand "in front" of
something they are visually behind — or the camera was mid-lerp on their screen
too. The HUD already prints P x,y. Next report, we'll have coordinates.

Also: shot.js had drifted. Its script list was hand-maintained and had missed
voices.js and both songs, so it would have crashed the moment anyone ran it. It
now reads the list straight out of index.html and cannot drift again. Same
disease as the stale docs; same cure.

Harness: 80 green.

— crew, night five, the doors swing both ways and the cat has not moved

## NIGHT SIX — THE DOOR WAS ON THE OTHER WALL
Two reports. Both were the crew's fault and both left something behind.

The back-room door. STORE-BACK-A's exit rect sat at the bottom of the room,
next to the GOOD MUSIC GOOD PEOPLE sign, pointing at nothing. The STAFF ONLY
door is at the top-left of that room, exactly as it is in the store — they are
two sides of the same door. Nobody had ever walked through it, because until
last night exits only printed a toast. The moment they worked, the lie showed.

Measured against the paint: the old rect was 30% walkable. The new one sits on
the floor strip in front of the door. That turned up a second thing worth
knowing: Mask.canStand is not a point test. It samples a 12px-wide, 4px-deep
foot box, so the outer six pixels of any doorway are unusable and the top four
rows of any floor are unusable. Every "100% walkable" this crew has reported
from a Python single-cell check was optimistic. The engine is the authority;
ask it.

So there is now a generic guard, not a fix: walk every room, every exit, and
insist the rect is at least 80% standable and that its target room exists with
the spawn it names. A misplaced door cannot ship again. It caught both doors
immediately, which is what it's for.

The mask2json crash. The producer painted STORE-INT-B's occluders, ran the tool,
and it refused: "no walkBehind: field found." The tool had written that stub
itself, three sessions ago, without a walkBehind field, and then declined to read
back what it had written. A tool that generates a file it cannot parse is a tool
with a hole in it. Now it inserts the field when it's absent, and the stub it
creates carries every generated field from the start. Also: a fresh run used to
need running twice — once to make the stub, once to fill it. It falls through
now. One command, one pass, occluders and all.

STORE-INT-B has its own floor and fifty occluder strips. Press T in the store and
the show-night chairs are solid.

Harness: 82 green.

— crew, night six, we finally opened the right door

## NIGHT SEVEN — GIVE THE PRODUCER THE WRENCH
The producer asked whether they could move anchors by hand. They can, and always
could — the canon/generated line has said so since the beginning. What they could
not do was SEE them. tools/review, where maskview writes its proofs, had been
deleted by the crew before zipping. Three sessions of "look at the review folder"
pointing at a folder that wasn't there.

So: tools/anchorview.py. Draws every hand-authored anchor on the backdrop with
the exact numbers to edit — spawns, exit rects with their target and facing,
hotspots with their face, fx with their footprint, npc slots. Then it checks each
one with the engine's own foot box and refuses to call a bad anchor good.

Two real bugs it immediately explained. fx.at is the CENTRE of an effect, not its
corner. Nothing had ever said so, and the ON AIR sign and the transmitter's tube
glow had been floating over empty desk for three sessions. Both now sit on their
painted objects. And the store's back door: the producer kept leaving the room
while squeezing past it toward the counter. Exits now take an optional face, so
you must be walking INTO the door. Standing in it walking sideways does nothing.

The producer also wants the door higher, up inside the doorway. That needs floor
where there is none. Paint the threshold, run mask2json, then raise the rect —
in that order, and anchorview will say whether the player can stand there. It is
their room; the crew just holds the light.

Harness: 83 green.

— crew, night seven, the sign says ON AIR and it means it

## NIGHT EIGHT — AUDITING THE AUDITORS
The producer asked whether the documentation was ready for the next session.
It was not, and the ways it was wrong are instructive.

Small: the reference still bragged about 69 green in one place and 80 in another.
It's 83.

Dangerous: the status table said STORE-BACK-B.data.js was "a bare stub with no
anchors -- safe to delete." That was true when it was written. It stopped being
true the night per-state floors landed, because that file now carries state B's
mask and fourteen occluder strips. Anyone who believed the docs would have
deleted the back room's collision and walk-behind, and the harness would have
gone green anyway, because nothing tests a file that isn't there. The open-
decisions list carried the same landmine. Both removed, with a note saying why.

Also: CHEATSHEET.md never came back in the producer's zip.

So the audit is a tool now. tools/doc_check.py walks both crew documents and
checks every command they tell someone to run, every directory they name, every
"N green" they quote, the build stamp, the song wiring, and a handful of
load-bearing code claims -- that audio.js is still verbatim, that the arm latch
exists, that mask2json can read back the stub it writes. Thirty-nine claims, all
green. Change the number in the reference to 71 and it fails, loudly, naming the
line. It runs at session close, right after the harness.

The lesson from the archive still stands and now has a second exhibit: stale docs
are worse than no docs. The first exhibit specified an 8px mask grid on a 4px
project. The second told us to delete a floor.

Harness: 83 green. Docs: 39 claims verified.

— crew, night eight, the paperwork checks itself now

## NIGHT NINE — THE FIRST FACE
The box has a face now. Mike is in the store.

The producer found the tool that does what a general image model could not:
PixelLab, sprite-trained, hard alpha and a hundred-colour palette instead of a
quarter-million and a 50%-soft edge. It only offers 8-direction rotations and
per-direction walk cycles, not a 4-row sheet — so the producer generated the
walks (forward, back, left, right) and a rotation, and the crew composited them
into the sheet the engine wants. That is the division exactly as written: the
producer draws, the crew converts. tools/build_mike_sheet.py is the converter,
sibling to mask2json: it picks stand/stepA/stepB per direction, normalises each
frame to 48px tall with feet on the baseline, and packs a 96x192 sheet. The
source GIFs live in assets/sprites/raw/mike_gifs/ so the build reproduces.

The blink. PixelArt insisted on closing Mike's eyes for most of every walk
cycle — open for the first few frames, shut for the rest. The producer would
rather not have it. So the converter de-blinks: it lifts the open-eye band from
each direction's own stand frame and stamps it onto that direction's closed-eye
stride frames, aligned by the hair silhouette so there is no seam. Done at native
GIF resolution (face ~30px) then downscaled, so the alignment is forgiving. The
back row has no face and is left alone. Verified in-engine: Mike walks with his
eyes open.

One honest flag survives intake: right[1]'s foot centre sits 2.5px off its
anchor, because that stride is the widest and averaging both feet pulls the
centroid toward the swing leg. It is a sub-pixel twitch on one frame of the
right walk, left flagged rather than hidden. The fix, if it ever annoys anyone,
is picking a less extreme right-stride frame in build_mike_sheet.py — one line.

Wiring: Loader.add('MIKE'), the sprite.js script tag before main.js, and
PlayerSpr = buildSheet('MIKE') || BOX at boot. The box placeholder stays as the
crash-proof fallback, so a missing sheet degrades to a walking crate instead of
a black screen.

STILL OPEN, and belongs to the producer:
  - the 4/4 thigh-tap idle (col 3+) — the protected beat-keeping tell, to be
    drawn by hand, never faked procedurally
  - diagonal walking — the producer wants it; it is a real chunk, not an add:
    the sheet contract and the input/anim code are both 4-direction today, and
    it needs four more generated angles first
  - Mike is the art-bible sprite; his approval gates the rest of the cast

Harness: 83 green. Mike: awake, and standing in his own store.

— crew, night nine, the placeholder finally has somebody's face

## NIGHT TEN — THE HITCH, THE PET, AND THE SIGN
Three notes from the producer once Mike was walking. All three fixed; one has
a tail that belongs to the art, not the engine.

THE HITCH. Mike lurched — worst walking toward camera and to the right. Two
causes, both in the crew's compositing, not the art. First, build_mike_sheet.py
scaled every frame independently to fill the cell, so a naturally-taller stride
(down stepB is 134px native vs 127 for the stand) got squeezed differently each
frame. Second, and the real culprit: frames were anchored on the FEET, which
swing hard mid-stride (down foot centre travels 73->84->96), so the whole body
counter-swung by ~10px a step. Fix: one shared scale for all of a character's
frames (no size pulse), and register HORIZONTALLY by the torso centroid — the
part that doesn't swing — with feet on the baseline. Torso is now steady to
within a pixel across each cycle (15.5/15.5/15.3 down). Verified in-engine: the
body stays planted and the legs do the walking.

Intake now raises two flags — down[2] and right[2] feet sit ~3-4px off centre.
These are EXPECTED and CORRECT: on a torso-registered walk the swing foot is
supposed to be off-centre mid-stride. The check still guards the thing that
matters (a drifting STAND frame would still flag). If we ever want a clean
intake, the honest refinement is to foot-check only the stand column; left as a
standing offer, not done unilaterally to the validator.

THE PET. Mike was the size of a house cat in the back room, because the back
room is painted as a smaller space (props drawn large) while the store front is
1:1. Sprites now carry a per-backdrop scale: room data gains a canon
`spriteScale` (STORE-BACK-A and -B set to 1.6), resolved per active state via
dataFor(), applied in stage.js anchored at the feet so the figure grows upward
from the floor. INT-A stays 1.0 and still looks perfect. It is one number in
the data file — tune freely.

THE SIGN. The producer asked to kill the tube glow and the ON AIR sign. Half of
that is ours: the tubeGlow and onAir FX overlays (the amber pulse and the
blinking text) are removed — both the data entries in STORE-BACK-A and the FX
definitions in stage.js, plus the two doc references that named them, so nothing
points at deleted code. The OTHER half is art: the ON AIR sign and the tube
meters are PAINTED INTO STORE-BACK-B.png. The overlays are gone; the painted
sign remains, because the crew does not repaint producer backdrops. If the
producer wants it gone entirely, that is a backdrop regen — his art, his call.

Harness: 83 green. Docs: clean. Mike walks smooth, stands right-sized, and no
longer glows.

— crew, night ten, the body stopped swinging and the sign stopped blinking

## NIGHT ELEVEN — GETTING READY TO WALK SIDEWAYS
Two housekeeping truths and one piece of forward-laying track.

THE SCALE, RECONCILED. The producer found 1.8 to be the sweet spot for the back
room and set it — but only on STORE-BACK-A. STORE-BACK-B was still carrying 2.1
from the session before, contradicting its own comment ("Matches STORE-BACK-A").
Aligned B to 1.8. Also refreshed this log's stale mention: night ten quoted the
scale at 1.6; the value in the repo is 1.8 and both back-room states now agree.

DIAGONAL-READY. The producer is drawing diagonal walk cycles for next session
and asked us to prep the engine. Done, art-agnostic and green, so the art just
slots in:
  - Movement is 8-way. Input reads the two axes independently now (you could
    only ever get a cardinal before — up beat right in the same else-if chain),
    resolves to a diagonal facing via a new pure `dir8(dx,dy)`, and normalizes
    diagonal speed to ~2px/frame instead of 2.83. Mask.at already floors, so
    fractional diagonal steps cost nothing.
  - A 4-row sheet is no longer a dead end. buildSheet, buildPlaceholder, and
    sprite_intake all take 4 OR 8 rows; the four diagonals (downleft, downright,
    upleft, upright) sit in rows 4-7. Until a character ships diagonal art, each
    diagonal ALIASES to a cardinal at load, so Player.dir can never index a
    missing facing. Diagonal movement is therefore testable today — it just
    draws a side sprite.
  - build_mike_sheet.py auto-detects the four diagonal GIFs in mike_gifs/. Drop
    them in, re-run, and it grows a 96x384 sheet; leave them out and it builds
    the same 96x192 as before. Diagonal frame picks are auto-selected by the
    foot-spread heuristic (the one that fit the side views) and de-blinked on
    the front-facing pair.
  - Eight new harness tests: dir8's eight cases, the normalized diagonal speed
    (measured 2.000), and every builder exposing all eight facings with the
    4-row aliases intact.

Spec and reference carry the diagonal rows now; docs/NEXT_SESSION.md is the
handoff with the exact GIF filenames to bring.

Harness: 91 green (was 83; +8 for diagonals). Docs: clean.

— crew, night eleven, the tracks are laid, waiting on the train

## NIGHT TWELVE — THE TRAIN ARRIVES (A REPAINTED CAST)
The train we laid track for last night pulled in carrying two whole characters.
The producer completely repainted Mike and drew Izzy from scratch, and both came
as the real thing: full eight-direction walk cycles, not the old four-plus-prep.

THE HAUL, AND ITS QUIRKS. Sixteen walk sources, and the producer had mixed the
containers on us: most directions are 11-frame GIFs, but a few diagonals arrived
as PNG frame-strips (512x384, a 4x3 grid of 128px cells), plus an eight-pose
standing montage each. Two junk-frame gotchas hid in there. Every PNG strip
carries a blank twelfth cell (11 real frames, one empty). And Izzy's up/back
walk shipped with a baked black matte on frame 0 — an opaque black box around
her, identical to the montage's back pose. Left in, that box would have shipped
as the back of her head. Both are caught generically now: drop a frame if it is
near-empty or if it carries a huge near-black opaque mass. We checked the
threshold against Mike's black-and-white jacket before trusting it — his darkest
frame is 583 near-black pixels; the matte is 8498. No honest dark clothing comes
anywhere near it.

ONE TOOL, NOT TWO. build_mike_sheet.py was Mike-shaped and hand-tuned to the
first art. With a second character in hand and Noah and Saltman behind them,
that is a one-off where the rule says build the pipeline. So build_char_sheet.py:
point it at a folder of per-direction walk sources, it maps filenames to the
eight facings, reads GIF or strip alike, drops the junk, auto-picks
stand/stepA/stepB by foot spread, and runs the same registration we fought for
on night ten — one constant height so the head never pops, torso-centroid
horizontal register so the body stays planted while the legs swing, feet on the
baseline, hard alpha. It never draws. build_mike_sheet is superseded; its
deblink trick (transplant open eyes onto a blinking stride) did NOT come along,
because this repaint doesn't blink mid-stride. No blink, no reason to touch a
pixel. If a future sheet blinks, the trick is in git.

Both sheets came out of sprite_intake clean but for the swing-foot flags we
already know to expect (left[2], right[2] and friends — the moving foot is
SUPPOSED to be off-centre mid-stride; every stand frame is dead-centre). Mike is
now a real eight-row sheet with real diagonals, where before he was four rows
with the diagonals aliased. Izzy is wired in beside him — loaded, script tag,
registered.

SEEING IS BELIEVING. We rendered both through the engine's own compositor —
not a preview canvas, the actual Stage.draw with its y-sort, walk-behind,
contact shadow, grade and vignette (review_cast.js). Mike and Izzy stand in the
store at 1:1, shadows under them, and when we tuck Izzy behind the INDIE bin her
legs vanish behind the strip exactly as they should. Screenshots are in
tools/review/ for the producer. This is the Phase-2 gate: Mike standing in that
store. He is standing in it.

Harness: 95 green (was 91; +4 for a real eight-row producer sheet slicing into
eight real facings through buildSheet, diagonals proven distinct from their
cardinals — not aliases). Docs: clean.

Two things left on the counter for the producer, flagged not fixed: we take each
direction's standing pose from its own walk cycle rather than the separate
standing montage (consistent, and it sidesteps that black matte) — say the word
if you'd rather use the drawn stands; and Izzy's canonical neck-slung headphones
(Scene 5 on) aren't on the base sheet yet.

— crew, night twelve, the band can walk

## NIGHT TWELVE, ADDENDUM — TWO LEGS AND A SIZE BUMP
Producer watched Mike walk and caught two things. Both fixed.

ONE LEG. Up, down and left read as if Mike swung the same leg twice. Real bug,
in the frame picker. The old heuristic chose the two step frames by "widest
ground contact" — which is right for SIDE views (the legs scissor apart) but
exactly WRONG for front and back views, where a stride LIFTS a foot off the
floor (narrowing the contact) while "feet together" is actually the widest
moment. So it was grabbing two same-leg frames and calling the real stride the
"stand." Replaced it with a signed gait phase: per gif we take whichever signal
swings more — the horizontal offset of the ground contact, or the left/right
foot-height asymmetry — and pick the two OPPOSITE extremes for stepA/stepB, with
the stand forced to a neutral frame distinct from both. Now every direction
alternates legs, verified frame by frame in playback order (stand, A, stand, B)
for both Mike and Izzy. Intake flags went up (5 and 9) — that is the fix
working: a real stride swings the moving foot off-centre, and the flags now come
in opposite-signed pairs (Izzy up[1] -2.5, up[2] +2.9: the two legs). No stand
frame drifts. build_char_sheet is the one tool, so Izzy got the fix for free.

TOO SMALL. At the store's native 1:1 the cast stood child-height against the
browsing bins. The store never carried a spriteScale (it defaulted to 1); the
back room has had one since night ten. Added spriteScale:1.5 to STORE-INT-A and
matched it on STORE-INT-B, chosen by rendering 1.0/1.3/1.5/1.7 against the bins
and picking the one that reads as an adult browsing the racks. One number, canon,
tune it like the back room did (1.6 -> 1.8). The pixel harness stayed green
because its coordinates derive from the painted data, not from the sprite size.

Harness: 95 green. Docs: clean. Mike walks on both legs, at grown-up height.

— crew, night twelve addendum, left foot, right foot, and taller


NIGHT THIRTEEN — THE OTHER HALF OF THE CYCLE, AND THE SHADOW OWNED UP

The taller cast walked into the store and four of the eight directions still
limped. Down, left, right, up-right read fine; up and the other three diagonals
dragged a leg. Night twelve's signed-phase picker had fixed the front and sides
by watching the ground-contact swing, but on the back and the diagonals that
signal lies — the contact centroid does not track the foot that lifts, so the
picker kept landing on two frames of the SAME leg. Watched the raw up cycle
frame by frame: the real opposite contacts were f3 and f8, five apart. That is
the tell. In a walk loop a leg and its opposite are exactly HALF A CYCLE apart,
always, on every view. So the picker stopped guessing per-view and started
counting: compare each frame's legs with its half-cycle partner, take the pair
that differ most as the two contacts (opposite legs, guaranteed), and take the
quarter-cycle passing pose between them as the stand. One rule, no heuristic,
eight directions. Rebuilt Mike and Izzy, overlaid stepA in red and stepB in
blue: every direction splits into an X now, up included, where before it was a
grey blur. Both legs, everywhere.

Then the occlusion report, the one the producer has flagged twice. Chased it
into the ground this time. It is real, and it is the scale bump wearing a
disguise. Stand one step behind the INDIE shelf and the front-most tile you can
reach puts your feet EXACTLY on the shelf's horizon line (canStand true to 272,
horizon 272). The strip erases the body down to that line — but the contact
shadow is painted at the feet and reaches a couple of pixels PAST it, below the
horizon, where no occluder strip lives to wipe it. At 1:1 that sliver was two
faint pixels nobody saw. At 1.5 the shadow is half again as wide and the sliver
reads as a shoe over the records. Proof: drop a solid green box on the same tile
and it tucks away clean (hidden from y263 down); only the shadowed sprite pokes.
Grew the occluder upward — no change, because the leak is BELOW the lip, not
above it. So the sort is right, the paint is right, and the fix is a few lines in
the compositor: clip the shadow to the sprite's own occlusion so it can't outlive
the body behind a horizon. Wrote it all into NEXT_SESSION with the reasoning, so
it survives the handoff.

Left on the bench for next session: that shadow clip, and the Mike-to-Izzy
toggle the producer asked for. Both scoped, neither started.

Harness: 95 green. Docs: clean, and the shadow report is no longer a mystery.
Build stamped WALK-HALFCYCLE.

— crew, night thirteen, counting to five instead of guessing

## NIGHT FOURTEEN — THE SHADOW STOPS AT THE SHELF, AND IZZY GETS A KEY
Two things were on the bench, both scoped and neither started. Cleared them both,
in order, exactly as night thirteen wrote it up.

THE SHADOW OWNED UP LAST NIGHT; TONIGHT IT SAT DOWN. The contact shadow was
drawing at the feet and spilling two rows past the baseline — fine on open floor,
a problem at a horizon tie, where those two rows land at and below an occluder's
lip and no walk-behind strip lives there to wipe them. Behind the INDIE shelf, feet
on py=272 and the occl-6 horizon also 272, the strips cover [260,272) and stop, so
the sub-horizon sliver survived and at 1.5 scale read as a shoe over the records.
The fix is the one the report called: draw the pool UP to the baseline instead of
down past it. Both rects now end at sy — from sy-4 and sy-2 up, not sy-2 and sy-1
down. That tucks the whole shadow inside the sprite's own occludable span, so the
same strip that erases the body erases the shadow with it; nothing can outlive the
legs behind a horizon. Built a throwaway pixel probe at the exact tie the doc
named: 52 shadow pixels below the horizon before, 0 after, and the feet band goes
fully quiet — occluded like the solid green box the producer proved it against.
Rendered crops both ways to be sure: behind the shelf the feet vanish clean at the
lip, in front the pool still pools. The harness shadow test never budged — 0 behind,
still visible in front — because the clamp only moved the pool up two rows, well
inside what that test cares about.

A KEY FOR IZZY. The producer asked to flip the player between Mike and Izzy in the
store without touching code, to watch Izzy's eight directions walk for real. Wired
C (cast) to do it: a module-level playerWho, the boot build reads from it now so
they can't drift, and the keydown swaps the sheet in place and toasts CAST -> WHO.
Both sheets were already loaded and registered from night twelve, so IZZY was one
buildSheet call away. HUD hint gained C CAST, header comment too. Ran it headless
through the real boot: MIKE -> IZZY -> MIKE, and PlayerSpr stays a valid eight-row
sheet across the flip. It's guarded on PlayerSpr existing, so a stray C before boot
is a no-op.

Refreshed the cast review shots through the fixed compositor — Izzy tucked behind
the INDIE bin, Mike walking left in front, shadows sitting where they belong.

That empties the night-thirteen bench. What's left is the producer's eye: walk the
two of them around the store, press C, and if they read right, MIKE + IZZY is the
Phase-2 gate and THE BAND opens. Noah and Saltman are next in the chair.

Harness: 95 green. Docs: clean. Build stamped SHADOW-CLIP.

— crew, night fourteen, the shadow knows its place

## NIGHT FIFTEEN — THE BAND SHOWS UP (NOAH AND SALTMAN)
The producer came back with a repaint AND two characters. First the repaint: the
STORE-INT-A mask and occluders were redone — the INDIE shelf band grew a cell
deeper (the old h:8/horizon:272 strip is now h:12/horizon:276), most horizons
shifted a few pixels, new occluders appeared on the right wall, and the walkable
floor grew with them. That is the residual occlusion the shadow clip couldn't
reach from the engine side, fixed properly in the paint where it belongs. We
verified we were building on that new file and not last session's copy — diffed
the two, watched the shelf strip deepen by a cell, then deleted the stale tree so
nothing could cross-wire.

THEN THE CAST. Noah and Saltman each arrived as eight walk GIFs plus a standing
reference — the exact shape build_char_sheet wants. Two filename quirks (a space
in "noah walking-down.gif", a "salyman" typo on Saltman's left) turned out
harmless: the tool keys on the direction token after "walking-", so both resolved
right; we tidied the names anyway on the way into the raw folders. No renaming of
the direction mapping, no OVERRIDES needed. Both built clean — 8-dir, no junk
frames dropped, hard alpha, tidy palettes (Noah 398 colours, Saltman 228). The
half-cycle picker found opposite-leg contacts in every direction on both.

Intake flagged what it always flags — swing-foot on the stride frames — but also
something new: several STAND frames on the side (and one up) views sit a few
pixels off the anchor. Mike and Izzy stood dead-centre; Noah and Saltman don't,
on those views. Cause is honest: the stand is the quarter-cycle passing pose, and
in these two cycles that pose has a foot forward rather than feet-together. It is
a frame-SELECTION question, which is the tool's job, not a pixel question — but
picking a character's rest pose is a producer call, so we flagged it with the two
levers (accept the small drift, or drop an OVERRIDES feet-together pick and
re-run) and left it. No pixels touched.

WIRED AND TOGGLEABLE. Both sheets loaded, script-tagged, registered. The C toggle
grew from a MIKE<->IZZY swap into a cast cycle — MIKE, IZZY, NOAH, SALTMAN, round
again — so the producer can flip through all four in the store without touching
code. Verified headless: C walks the whole ring and every stop is a valid 8-row
sheet. Rendered the review stills through the real compositor: all four standing
together at one height with their shadows, and a full facing rotation each. Noah
reads as Noah (blond mop, white tee), Saltman as Saltman (dark curls, blue henley,
the Al reference).

Gave the two of them the same headless structural proof Izzy got when she landed:
registered as 8 rows, sliced into all eight facings x3, diagonals distinct from
their cardinals (the art actually made it into rows 4-7, not aliased). That is the
+6 on the harness.

Harness: 101 green (was 95; +6 for Noah and Saltman through buildSheet). Docs:
clean. Build stamped CAST-NOAH-SALT. The band is in the store; the producer's eye
is the gate.

— crew, night fifteen, four in the racks

## NIGHT SIXTEEN — THIRTEEN FACES (PORTRAIT RE-CROP)
The producer is redoing every portrait in the new full-body art style and sent
thirteen full-body sprites to cut heads from — all on solid black, no alpha,
~1024×1536. Wrote `portrait_crop.py` for it. The black background is the useful
part: keying pure black to transparent naively leaves a dark rim where the
anti-aliased edge pixels are black-over-skin, so the tool unpremultiplies each
edge pixel against black before it downscales — clean silhouettes, no halo. It
anchors the crop on the reliable signals (head-top, head-centre-x, figure
height) rather than hunting for a neck, takes the top ~30% of the figure with a
little headroom, and lands a 48×48 RGBA that matches the existing portrait spec.

Ran all thirteen: nine updates (ADAM, AL, AYDEN, DAKOTA, DAN, IZZY, KAM, MIKE,
NOAH) and four new faces (COACH, EARL, KRAMER, REV). Checked every one against
its source in a labelled montage. Two that made me look twice turned out right:
`Old_Earl_sprite.png` is a grey-haired gentleman in a navy suit and scarf, and
`Coah_sprite.png` is the man in the US-flag bandana and blue henley — the crops
are faithful to the files as named, even if the pairing surprised me, so I've
flagged it for the producer to confirm rather than "correcting" a producer call.
AL (Saltman) is the suit-and-tie look here, where his walk sprite is the blue
henley — same person, different outfit; noted in case they want them reconciled.

Portraits are asset-only for now — nothing wires them until Phase 3 dialogue —
so this is pure replacement: no code touched, harness untouched (still 101),
BUILD not bumped. Handed the thirteen back as a drop-in `assets/portraits/`
folder so they merge cleanly whichever tree the producer treats as canonical.

Two asks came in the same message that I could NOT close. The regulars: portraits
and standing refs are in for Old Earl, "Coach" and "Kramer", but the last two are
the producer's own placeholders and one may be DUKE — and there's no NPC system
yet to place them, so the most I can do now is offer standing sheets + a toggle
slot to eyeball them. And the store's back door: the producer wants it raised into
the doorway and says they painted the walkway to suit, but that paint isn't in any
file I hold (no project zip this turn), and the exit they mean lives in
STORE-INT-A, not the exit-less STORE-INT-B. Both waiting on the producer.

Harness: 101 green (untouched). Docs: clean. Build stamp unchanged. Thirteen
faces in the drawer.

— crew, night sixteen, heads on straight

## NIGHT SEVENTEEN — THE DOOR GOES UP (STORE BACK EXIT RAISED)
The producer wanted the store's back-room exit lifted up into the doorway and had
been painting the walkway to allow it, but it kept not landing. This build finally
explained why. They'd extended the walkway in **STORE-INT-B** — and that edit was
here, B's floor reaches up to y=46 in the door column. But the exit lives on
**STORE-INT-A**, and A's floor still stopped at y=60. Their matching A edit never
reached us: every zip's `STORE-INT-A.mask.png`/`.data.js` hashed byte-identical to
base, so the A paint wasn't being saved into the mask before zipping (and the exit
is on A, not B — the source of the whole mix-up).

So the crew did A's edit the honest way: mirrored B's own doorway walkway into
`STORE-INT-A.mask.png` (a union in the door band, +616 walkable px, matching B
exactly — no invented level design), re-ran `mask2json`, and raised the exit.
First try `[104,48,44,12]` — full door width, up high — read 52% on `canStand`:
the doorway column is narrow (x 104–147) and the 12×4 foot box overhangs the
jambs at the edges. Probed a handful of rects and landed `[110,52,32,8]` — inset
into the opening, 100% canStand, sitting right in the door base. The player now
walks up INTO the doorway before the screen turns over, instead of triggering out
on the open floor.

Two harness gates went red on the move and came back green once fixed: "STAFF ONLY
door leads back" and the generic "every exit ≥80% walkable" — the first because
its probe still drove the player to the old doorway spot (py=70 → py=56), the
second because of the 52% rect. Both legitimate: the door moved, so its test moved
with it. Back to 101 green.

Also reconciled the trees. The producer's new zip was still the SHADOW-CLIP base
plus their B paint — none of the crew work (Noah/Saltman, the cast toggle, the
thirteen portraits) was in it. Rather than have them re-merge, the crew took its
own tree (base + all crew work) as canonical, applied the A/exit fix there, and is
handing back one build with everything in it.

Harness: 101 green. Docs: clean. Build stamped DOOR-RAISE. The back door is a door
you walk through now.

— crew, night seventeen, up and through

## NIGHT EIGHTEEN — STANDING STILL, IN HIGHER DEFINITION (STANDS + 2× DETAIL)
Two producer asks that turned out to be the same job. First, the stopped pose:
the cast had been standing on the walk cycle's passing frame — one foot
mid-swing — so Mike and Saltman read "one leg up" facing forward and the side
stands drifted off their shadows. The producer had shipped standing turnarounds
for exactly this. Taught `build_char_sheet.py` a `STANDING` map: the STAND column
comes from the rotation, the STEPS still from the walk cycle. Read the frame
order off all three GIF turnarounds by eye (they share it — down, downright,
right, upright, up, upleft, left, downleft) and cross-checked against the
labelled walk art. The automated silhouette/colour matchers waffled on front-vs-
back and left-vs-right — which is the whole reason the producer draws dedicated
rotations — so the proof was the render: every stand faces right and stands
feet-together. Noah's and Saltman's off-anchor side stands vanished; a small
residual lingers on a few back-diagonals where the rotation itself stands with
feet a hair off the torso line. Flagged, not touched.

A surprise in the drawer: `_izzy-standing.png` was logged as "a single front
pose." It isn't — it's a 3×3 montage of her whole turnaround, `ROT8` row-major,
with the UP pose in the centre cell carrying the same baked black matte her
up-WALK shipped. So Izzy got seven of eight rotation stands for free; only up
falls back to the walk stand until a matte-free frame arrives.

Then the resolution. The producer suspected the sprites would look great at full
detail on the current backdrops — the raw art is high-res imitating low-res
pixel art — and wanted a prototype before committing. Parameterized the builder
with `--scale` (scale-1 output byte-identical, so no regression to the stand
work), built Mike at 2×, and put him on the real store backdrop at matched
on-screen size. Verdict: "looks perfect." Committed. The elegant part: the engine
needed NO change. `stage.js` already draws every frame into a fixed 32·k × 48·k
box, so a 64×96 cell just gets nearest-downsampled into the same 48×72 footprint
— `spriteScale` stays 1.5 as canon demands, and shadows/walk-behind/collision
are untouched. The detail is real: source downsampled ~1.8× now, not ~3.6×.

The 2× cell shook two absolute-threshold bugs loose in intake, both the
contact-shadow lesson again. The foot-centre tolerance was a flat ±2px tuned for
a 32-cell, so it flagged twice as hard at 64; scaled every tolerance with the
cell (they reduce to the old constants at 32×48, verified). And Saltman's black
dress shoes tripped the "baked drop shadow?" heuristic — a wide dark mass at the
cell bottom. Gave that check the real discriminator: a shadow fans WIDER than the
feet; shoes don't. No character trips it now, and it still catches a genuine
baked shadow. Also fixed `sprite_intake.py`'s `--cell WxH` space form, which had
silently choked (the value leaked into the sheet path) the first time a 2× intake
tried to use it.

Rebuilt all four at `--scale 2`, re-intook at `--cell 64x96`, cell meta now
[64,96], sheets 192×768. Harness 101 green (one slice-size assertion made
resolution-agnostic — it reads the registered cell now). Cast re-rendered through
the real compositor: same size, visibly crisper. The Phase-2 calibration gate is
passed for the delivered four.

Harness: 101 green. Docs: audited. Build stamped HIRES-2X. Next up: Mike's talking
portrait (art's in) and rolling 2× across the rest of the cast.

— crew, night eighteen, still standing, twice the pixels

## NIGHT NINETEEN — WRONG MIKE (THE STAND CAME FROM THE OLD ART)
The producer caught it before it shipped far: Mike was a different size than the
rest of the cast, and worse, he changed size *as he walked*. Their instinct was
exactly right — "you may have mixed the original Mike with the updated one."

Here is what happened. Night eighteen wired the stand to come from a standing
rotation. For Mike the queued note named `mike_gifs/still-rotation.gif`, and the
crew trusted it. That folder is the ORIGINAL Mike — a stockier repaint, figure
aspect ~0.51 — while his walk art in `mike_walk/` is the newer slim Mike, ~0.36.
Same black jacket and jeans, so the outfit check at intake said nothing; the
PROPORTIONS were different. `place()` normalises every frame to one height, so at
a constant 92px the stocky stand came out ~47px wide and the slim steps ~33px
wide. The walk plays stand, A, stand, B — so Mike pulsed wide, slim, wide, slim
as he moved, and stood wider than Izzy, Noah and Saltman.

The fix was one line, because the RIGHT art was already in the tree:
`mike_walk/_mike-standing.png` is a clean 3×3 ROT8 montage in the slim style
(byte-identical to the standing sheet the producer re-sent to confirm), its up
cell matte-free. Repointed `STANDING['MIKE']` there, rebuilt at 2×, re-intook.
Mike's stand and stepA now measure 33px wide apiece — identical — and he lines up
with the cast (stands 33/33/32/30 across Mike/Noah/Saltman/Izzy). His flags
dropped 6→3, all swing-foot on strides, zero on a stand. Quarantined the old
`mike_gifs/` under `raw/_archive/` with a README so no tool can wander back into
it, and corrected every doc that had named it.

The lesson, written into §6.5 and §8: a stand source must be the SAME ART as the
walk — matching figure proportions, not just the same clothes. The outfit check
is not enough; measure the aspect. Verified visually — the walk-cycle strip holds
one size now, and the cast lineup reads as four people the same height.

Harness: 101 green. Docs: audited, mike_gifs references purged from the active
tree. Build stamped HIRES-2X-B.

— crew, night nineteen, one Mike, one size

## NIGHT TWENTY — THE DIAGONALS THAT COULDN'T DECIDE
Small one, cleanly diagnosed. Mike's up-left and up-right each had a walk frame
that looked mixed between two facings. Cause: those two walk sources aren't clean
single-facing loops — they hold the diagonal for the first ~6 frames, then the
figure TURNS toward the adjacent cardinal (up-left drifts to left, up-right to
right). The half-cycle step picker, which only reasons about legs, grabbed one of
those turned frames for stepB, so the diagonal alternated between two facings as
Mike walked.

Fix is frame selection, not redraw — exactly what `OVERRIDES` is for. Pinned both
steps to clean, same-facing, opposite-leg contacts from the good part of each
source: up-left [0,3], up-right [1,4]. (The stand still comes from the montage;
the override's stand index is ignored there.) Rebuilt, re-intook: both diagonals
now hold one facing across stand/stepA/stepB, legs still alternate, and Mike stays
at 3 flags — all swing-foot on strides, none new. Verified at on-screen size.

Wrote the gotcha into §6.5 and §8: a walk source may carry trailing turn frames;
when a diagonal reads mixed, pin its steps with OVERRIDES rather than trusting the
auto-pick. Docs squared away for the next session.

Harness: 101 green. doc_check: green. Build HIRES-2X-C.

— crew, night twenty, both diagonals facing the same way at last

## NIGHT TWENTY-ONE — THE PICKER THAT COULDN'T TELL LEFT FROM RIGHT
Night twenty said "verified." The producer walked Mike around and said no: up
diagonals still off, and walking right he "doesn't take a full stride — looks
like he is moon-walking forward." First move was to check whether the fix even
shipped: rebuilt the sheet fresh and it came out byte-identical to the one in
the zip. So the overrides were in the build. The picks themselves were wrong,
and night twenty's verification had signed off on frames it should have
squinted at harder.

Two distinct wrongs, one shared symptom. The moonwalk: the half-cycle metric
compares LEG SILHOUETTES, and on a side view the two true contacts — left leg
forward vs right leg forward — are near-mirror silhouettes that XOR to almost
nothing, while two feet-together frames registered a couple pixels apart XOR
large. The argmax inverts. Mike's right auto-picked [1,6], both near-stands, so
his legs barely moved while he translated. His up had the same disease in a
milder strain: [4,9], with 9 a near-stand. The spread-only and signed-phase
pickers each had a view they failed on; now the half-cycle rule has its own,
and it's the SIDE view — the one view the old pickers got right. There is no
free lunch in leg-reading, apparently.

The diagonals: night twenty's pins fixed the FACING mix but pinned upleft
stepA to frame 0 and upright stepA to frame 1 — both feet-together near-stands.
So the diagonals held one facing and then limped: stand, stand, stand, stride.
A pin has to satisfy both constraints at once — same facing AND true opposite
contacts — and those didn't.

Went frame by frame at 4× on the legs this time. Right: contacts at [3,10],
wide, mirrored, eyes open (frame 4 blinks — the "this repaint does not blink"
note in the builder header is now also false; avoided it rather than porting
deblink). Up: [4,10], the two sole-visible push-offs, properly mirrored.
Upleft: [4,6] — and here the honest caveat: frame 6 is the FIRST frame of the
source's turn drift, and it is the ONLY clean right-leg contact the source has.
At on-screen size it holds the diagonal to the crew's eye, but the producer's
eye is the one that caught everything else this arc, so it's flagged: if it
still reads mixed, that source needs a clean second contact drawn — nothing
better exists to select. Upright: [4,5].

Rebuilt, re-intook: 4 flags now (was 3), the new one being right stepB's
swing foot on its wide stride — same informational class as the other three,
zero on stands. Rendered the actual playback order (stand-A-stand-B, the
engine's [0,1,0,2]) at on-screen footprint for all four repinned views before
claiming anything. Legs alternate, strides are full, one facing per row.

Docs squared: §6.5 now documents the silhouette-symmetry blind spot and the
cheap tell (if a chosen step frame reads feet-together next to the stand, the
pick is wrong), §8's MIKE row carries the corrected pins and the upleft
caveat, and the §2 line crediting the picker with fixing everything got
walked back to the truth.

Harness: 101 green. doc_check: green. Build HIRES-2X-D.

— crew, night twenty-one, full stride, no moonwalk

## NIGHT TWENTY-TWO — HALF A CYCLE IS ALL YOU GET

Producer report, morning after: right walk fixed — confirmed, one for the good
column — but the up diagonals STILL wrong. Third strike on the same two rows.
Night 21's caveat had hedged on upleft frame 6; upright carried no hedge at
all, so before touching anything the crew went back to the sources and looked
at every frame the way the producer looks at the screen: in color, at size,
legs and head separately.

The finding reframes the whole problem. It was never just "the source turns
after frame ~6." Each up-diagonal source holds the diagonal for only about
HALF a walk cycle before the turn — and a half cycle contains exactly ONE
contact. Upleft's clean wide contact is f2 (its neighbors f1/f3 are the same
lead, approaching and leaving it); upright's is f1. The opposite-leg contact
in both sources happens entirely inside the turned zone. So every pin that
stayed inside the clean zone — nights 20 AND 21 — was choosing its second
"contact" from near-passing poses, because that's all the clean zone has on
that half of the cycle. Upright [4,5] was the purest case: two ADJACENT
frames, both feet-together, dressed up as opposite contacts. Rendered in
engine order they're four nearly identical cells. Of course he shuffled.

Two lessons paid for twice now, written into §6.5. One: judge facing by
COLOR, not silhouette — upleft f7/f8 XOR *lower* than f6 against a clean
frame, but show progressively more face; the eye sees paint, not masks. Two:
the tell from night 21 works, so actually USE it — put each chosen step
beside the stand at playback footprint; if it reads feet-together, the pick
is wrong, no matter what the metric said.

The repin, and its honest ceiling: stepA now takes each source's one true
wide contact (upleft f2, upright f1 — this alone kills most of the shuffle),
stepB takes the least-turned opposite contact (upleft f6 unchanged, upright
f8). Rebuilt, re-intook: 4 flags, all swing-foot drift on stride frames, no
stands, no new classes. Rendered stand-A-stand-B for up/upleft/upright from
the intook sheet before claiming anything: legs alternate, strides are full,
up untouched and still clean. What selection CANNOT do is manufacture the
missing pose — both stepBs are early turn-drift frames because nothing better
exists in either file. If the drift still reads on the producer's screen, the
ask is one clean second-contact frame per source. That's drawn, not selected.
Flagged in §2, §8, §12, and the handoff.

Harness: 101 green. doc_check: green. Build HIRES-2X-E.

— crew, night twenty-two, striding on both legs, facing where the art allows

## NIGHT TWENTY-THREE — THE STAND WAS THE SUSPECT ALL ALONG

The producer sent a video this time, with the only question that mattered:
"are the edits not landing?" Fourth pass on the same two rows. Before touching
a single frame, the crew answered THAT question with evidence: extracted the
clip at 10 fps, template-matched every video frame against every cell of both
the night-21 and night-22 sheets, masked SSD, scale 3 confirmed. Verdict: the
edits WERE landing. During the diagonal stretches the screen showed
`new:upleft:0/1/2` and `new:upright:0/1/2` — the night-22 cells, correct rows
for the movement, engine cycling stand-A-stand-B exactly as designed. Fresh
build, fresh sheet, no cache ghost.

So the fixes were real and the bug survived them — which means the bug lived
in a cell no repin ever touched. Three step repins had one constant: THE
STAND. And the walk plays stand,A,stand,B — the stand is on screen half the
time. Measured the face sliver (skin-pixel centroid vs figure centre) per
cell: upleft steps carry the face LEFT (-6.6, -5.4) and the upleft stand
carried it RIGHT (+6.4); upright the mirror. The stands were SWAPPED. Every
other frame, Mike's head snapped to the opposite side — "mixed between two
facings," the producer's exact words since night 20, immune to any choice of
step frames.

Root cause, measured at the montage: the middle row of `_mike-standing.png`
is laid out mirror-symmetrically — upleft, up, upright, the left-facing pose
drawn on the left, the natural way to draw it — while `ROT8` assumes strict
rotation order, upright, up, upleft. Six of eight cells coincide either way.
The two that don't are the two poses hardest to read by eye: back diagonals,
face nearly hidden. "Verified frame by frame against the labelled walk art,"
said the doc. Verified by the same eye that missed it, said the video. The
same cross-check (each stand vs the character's own and opposite diagonal
steps, masked SSD) cleared NOAH, IZZY and SALTMAN — Saltman's GIF really is
true rotation order. Mike alone gets `MIKE_STAND_ORDER`.

One-line fix in the STANDING config, rebuilt, re-intook: same 4 swing-foot
flags, zero stand flags, and both up-diagonal rows now measure one facing
across stand/A/B (upleft all-left, upright all-right). The night-22 step pins
stay — they were correct, just fixing the wrong half of the problem. The
stepB turn-drift residual is demoted: with the stand no longer contradicting
it twice a cycle, it may not read at all.

Two rules earned the hard way. Measure a rotation source, never eyeball it —
the cells most likely to be mislabelled are exactly the cells hardest to
read. And when a fix survives three verifications and the bug survives three
fixes, stop fixing and start proving what's actually on the screen — the
producer's video was worth more than a fourth repin.

Harness: 101 green. doc_check: green. Build HIRES-2X-F.

— crew, night twenty-three, head facing where the feet are going

## NIGHT TWENTY-FOUR — SIGNED OFF, EIGHT WAYS

Short entry, the good kind. Producer verdict on HIRES-2X-F: **Mike's walking
animation works perfectly.** All eight directions. The saga that ran from
night twenty (the picker's turned frames) through twenty-one (the wrong
contacts) through twenty-two (the half-cycle discovery) to twenty-three (the
swapped stands, the real bug all along) is closed — and the closing
confirmation carries one more finding worth logging: with the stands facing
the right way, the turn-drift stepBs (upleft f6, upright f8) don't read at
all at playback size. The conditional art request for second-contact frames
is withdrawn. The producer draws nothing; the sources were enough after all,
once the crew stopped fixing the wrong half of the frame pair.

Docs reconciled to match: §2 known-open updated, §6.5's conditional closed
with the verdict, §8 MIKE row now reads INTEGRATED with the walk verified,
§12's open decision marked RESOLVED with the art request withdrawn, and
NEXT_SESSION rewritten — the walk story compressed to context, the talking
portraits promoted to the primary task. No code touched, no pixels moved;
harness stays 101 green on the same build.

Next up: Mike learns to talk. The mouth-flap grids are staged, the crop tool
is proven, and night twenty-three's rule follows the crew there — measure the
cells, don't eyeball them.

— crew, night twenty-four, all quiet on the diagonal front

## NIGHT TWENTY-FIVE — MIKE LEARNS TO TALK (WITHOUT MOVING HIS HEAD)

Mike talks now. The saga was short and the producer drove it.

Started by sorting the pile: two expression sheets, two 9-frame GIFs, then three
fresh PixelLab grids (speaking / yelling / worried) and a couple of screenshots.
Measured everything before believing it. The GIFs read as "talking loops" but the
whole head sways ~6px through them — fine as idle loops, wrong for a dialog flap.
The grids register tight side to side (skin-cx 125–127) but drift 4–19px UP AND
DOWN cell to cell, because PixelLab redraws the whole face each time. Animate that
raw and the head bobs. The producer saw it instantly: "I wish we could just
transplant the mouth on the same face." That's the whole fix.

So `portrait_flap.py`: pick one base face, register each open-mouth donor to it on
a stable band so eyes/brows/hair line up, then the pixels that STILL differ are
the mouth — mask them, feather, composite back. Head/hair/brows/body go
pixel-identical (hairtop variance measured to 0); only the mouth moves. Neutral
and angry fell out clean. Cadence, the producer's call: don't blink back to closed
mid-word — cycle the open shapes while text types, rest closed only at line end.

Worried fought us, and the producer's eye caught it again: "his neck is moving,
not his mouth." Diagnosed by drawing the swap mask — it was sitting on the collar.
Two reasons: the ROI reached into the neck, and the worried cells DIP the head and
look down (registration kept yanking them up 6–7px). Tightened to a lip-only box
and re-anchored registration on the nose (stable whether eyes are open or shut).
That killed the neck-slide — but exposed the deeper truth: those are sad POSES,
not talking frames, so once the head is held still the mouth barely opens. Called
it honestly: worried ships as a subtle PLACEHOLDER until a purpose-made worried
*talking* set arrives (upright head, worried brows held, mouth opening) — which
drops in by editing one config row.

Then piped it into a dialog box to test: an original gold-filigree frame in the
style of the producer's reference (didn't trace it — that UI is someone else's
game), portrait framed left, name-plate, typing engine, mood switch, speed slider.
`portrait_flap.py --demo` regenerates it from the frames. Producer: "perfect."

Two rules earned. When separately-generated frames drift, don't animate them —
transplant the one thing that should change onto the one thing that shouldn't.
And a mood whose source art moves the whole head (sad, dejected) can't fake a
talking flap; that's an art call, not a compositing one — flag it, don't force it.

No game code touched; the harness stays 101 green. New tool, staged generated
frames, a manifest, and a test harness — all reproducible from the source grids.
Wiring into the real dialog box is the next session's job.

Harness: 101 green. doc_check: green. Build TALK-PORTRAITS-A.

— crew, night twenty-five, lips moving, head still

---

## NIGHT TWENTY-SIX — EYES AND BROWS, TOGETHER AT LAST

The goal was a real pipeline: not one hand-picked mood, but a POOL the producer
mixes. So we built two things — `tools/flap_pool.py` (drops in the PixelLab
grids, aligns every cell to one base, separates each into selectable parts,
dedups, sorts) and the **Flap Studio** (`flap_studio.html`): pick an eyes+brows
combo and a mouth cycle, preview the flap in a gold stand-in box, export a
self-registering `.flap.js`.

Then the long fight. The producer wanted eyebrows as their own selectable axis,
separate from eyes. Reasonable. Except PixelLab draws every cell with its own
4–19px drift, and Mike's brow sits FLUSH against his eye — no skin gap to cut on.
Every attempt to lift a brow alone did something ugly: a raised-brow donor left
the base brow underneath it (double); a closed-eye donor's lid competed with the
brow and the aligner locked onto the wrong one; a yelling donor dragged its own
under-brow shadow and its slightly-darker skin, so erasing the base brow left a
grey patch. I fixed one, uncovered the next, declared victory too early more than
once. The producer, correctly, kept catching each remnant at high zoom.

The turning point was his call, not mine: **stop separating them.** Eyes and
eyebrows are ONE unit — each unique combo is one option. The whole `UPPER` region
lifts together, exactly as the artist drew it. No brow/eye boundary, no
transplant. `extract_upper` does it: global-align on forehead+nose (skips the
variable features so a blink or an open mouth can't pull it), cover the region
SOLIDLY so no base brow bleeds a feathered edge, and erase any base-brow pixel
the donor doesn't cover with the base's own forehead skin. Two more remnants the
producer spotted after that: the base brow-top (it's at y85, up in the old
feather zone → raised the box, made the interior solid); and a "mullet" — the box
reached out to the ears, painting a donor ear slightly offset from the base's, an
outline down each side. Measured the head (face skin x81–182, ears outside that,
eye-whites only to x88–165) and carved the lower-side ear corners out of the box.
Clean.

He also fed in seven new face grids (including one with a single raised brow),
repackaged the studio to one Eyes&Brows row with a bigger preview, and the pool
settled at ~20 eyes&brows + 17 mouths, all artefact-free. The game data path is
prepped: `assets/portraits/flaps/` exists, `MIKE.neutral.flap.js` self-registers,
`index.html` includes it. The dialog RENDERER is still Phase-3 (the game has no
dialog yet — just the placeholder toast at the hotspot).

Lesson, again: when the extraction is fighting the material, the answer isn't a
cleverer mask — it's changing what you're trying to separate. And believe the
producer's zoom.

**Open for next time:** mouth ghosting — mouth parts still show a faint base-mouth
remnant where the donor mouth doesn't cover the base's closed lips (the fixed
`MOUTH` region + changed-pixel `extract_part` leaves it). Same class of bug the
brows had. Producer's steer: locate the mouth region dynamically, or give mouths
the same solid-erase-with-skin treatment `extract_upper` uses — as long as it
doesn't disturb neighbouring features. Harness 101 green, doc_check green.

---

## NIGHT TWENTY-SEVEN — THE LIPS THAT WOULDN'T LEAVE

One bug on the docket tonight, carried over with the producer's steer attached:
the mouth ghost. Every open mouth in the pool had a faint pair of closed lips
haunting it — the base's own mouth, bleeding through the transplant. His
screenshot of the studio's rest-mouth row showed it plainly.

Measured before believing, as usual. The changed-pixel extractor only carries
donor pixels that DIFFER from the base. Two ways the base lips slip through
that net: a donor lip pixel that happens to land near the base lip's luma
(dark on dark — no "change", no coverage), and the anti-aliased halo around
the lip line, too faint to clear the threshold. Counted it: 8 to 341 base-lip
pixels uncovered per mouth part, all seventeen affected, worst on the wide-open
mouths where the donor's dark interior crossed the base's dark lip line.

The producer's steer was verbatim: locate the region dynamically, or give
mouths the solid-erase treatment the brows got — as long as neighbours are
untouched. Did both at once. `extract_mouth` keeps the changed-pixel overlay,
then adds a solid core located FROM THE BASE each run: every dark-vs-skin pixel
inside a measured inner window (`MOUTH_INNER`, clear of the nose bottom, the
jaw outlines and the chin crease), row-span filled so the teeth between the lip
lines ride along, dilated three pixels to swallow the anti-aliased halo. Inside
the core the donor face lands at full alpha — the artist's pixels decide what
the lip zone looks like, not a diff mask. Feather spills only outward, the same
trick `extract_upper` earned last night.

Rebuilt the pool: same twenty eyes-and-brows, same seventeen mouths — the dedup
didn't reshuffle. Then the proof, because "looks fixed" died as a standard
around night twenty-two: every one of the 3,335 base mouth-mark pixels
(lips, teeth, halo) now sits under alpha 255 in all seventeen parts. Worst
residual: zero. Zoomed the rest-mouth and the screamers both — clean skin where
the ghost lips lived, nose and jaw and chin crease untouched, no box seam.

One honest flag: `MIKE.neutral.flap.js`, the wired fixture, still bakes
pre-fix frames — the studio export doesn't record which pool parts it used, so
the crew can't re-bake it faithfully. Thirty seconds in the rebaked Flap Studio
re-exports it clean. Producer's picks, producer's re-export.

No game code touched beyond the build stamp. Next: the Phase-3 dialog port —
three producer calls are queued in NEXT_SESSION before a line of it gets built.

Harness: 101 green. doc_check: green. Build FLAP-DEGHOST-A.

— crew, night twenty-seven, exorcising lips
---

## NIGHT TWENTY-EIGHT — THE GHOST WAS NEVER WHERE WE LOOKED

Reopened a bug I'd signed off on. Last night's log ended "worst residual: zero,"
which should have been the end of it. The producer said otherwise: the mouth
ghost is still there, under the nose, on the frames where the base and rest face
sit higher than the applied flap mouth. He was right. He is usually right about
the zoom.

So I stopped trusting my own numbers and put a ruler on the base face. Read it
top-down and the whole night-27 fix fell apart in one glance: nose and nostrils
at y122-133, a bright philtrum gap at y134-139, the closed lip line at **y140 to
y146**, then below-lip skin, then the chin crease starting around y152. And
`MOUTH_INNER`, the window my "solid core" was built on? `(152,192,…)`. That is
the CHIN. For a full night the deghost core had been faithfully reinforcing
Mike's jaw while the actual mouth ghosted through untouched. Worse, the proof I'd
been so pleased with — "every base mouth-mark pixel under alpha 255" — measured
the mark INSIDE that same chin window. I checked that the fix covered the thing
the fix defined. A closed loop. It told me nothing about the lip line eight
pixels north, which is exactly where the producer's eye went.

Measured the real thing this time, against a mark defined with no reference to
the fix: dark pixels in the true lip band. Up to a hundred of them uncovered per
part, worst on the near-closed mouths where the donor lips land lowest — the
producer's "sits higher than the flap frames," in pixels. Rendered it at 9× and
there it was, plain: a second, fainter pair of lips floating under the nose,
above the donor's open mouth. mouth.11 showed it cleanest.

The fix is the same idea DEGHOST-A wanted, finally pointed at the mouth. Move
`MOUTH_INNER` to the real lip band `(137,151,98,160)`. Find the mark with a soft
luma threshold so the anti-aliased halo comes along, not just the black core.
Row-span fill for teeth, a two-pixel dilate, and then two hard guards —
`MOUTH_NOSE_GUARD` at y135 and `MOUTH_CHIN_GUARD` at y152 — so no amount of
dilation can wander up into a nostril or down into the chin crease. Donor face
solid inside the core, feather spilling outward only, the trick the brows taught
us. The philtrum sitting bright between nose and mouth does half the work for
free: nothing connects across it.

Rebuilt the pool: same twenty eyes-and-brows, same seventeen mouths, dedup
unmoved. Residual against the independent mark: zero, all seventeen, and this
time zero means the lips. Zero solid-core alpha in the nose band. Diffed old
against new — the change is the ghost band erased, plus the chin quietly
un-reinforced where DEGHOST-A shouldn't have been pasting donor jaw in the first
place. Clean at 9× and clean at the shipped 48.

Same honest flag as last night, still true: `MIKE.neutral.flap.js` bakes pre-fix
frames; the export doesn't record pool ids, so it's a thirty-second re-export in
the rebaked studio, producer's picks. No game code touched beyond the build
stamp. Next is still the Phase-3 dialog port, three producer calls ahead of it.

Lesson, engraved deeper: a verification that reuses the fix's own definition
proves nothing. Measure the artifact the way the eye sees it, or don't claim it.

Harness: 101 green. doc_check: green. Build FLAP-DEGHOST-B.

— crew, night twenty-eight, finding the lips we'd been ignoring

---

## NIGHT TWENTY-EIGHT, LATE — TWO CANON CALLS, AND A DIFF THAT ONLY TOLD HALF

Producer came back with two calls: the opening crawl is the long `.docx` — the
FFVI opera version, hearts and handshakes and the machine that needs none — and
the listening-booth sign is `BE GENTLE`, the `.docx` value. Synced the `.md`
Scene 1 crawl to the `.docx` word for word (it now reads near-identical), and
flipped the booth sign.

Then the useful part. Flipping the sign made `script_check` surface the *next*
Scene 2 difference — because `first_diff` only ever shows one. Went looking for
the rest with a proper line-level diff, and there they were: babe/Iz/Big
Mike/Mom in the `.docx` against Michael/Gooby/Pops in the `.md`, two of Izzy's
lines reworded, and Noah's feet — one shoe untied vs slip-ons, which is the
footwear canon call we've been carrying in §12 all along. The `.md` holds the
newer dialogue, so I left it and surfaced the whole list rather than quietly
overwriting a producer's newer lines with an older file. Crew flags canon; it
doesn't pick it. One more flag: the `.md`'s old title-card outro isn't in the
`.docx`, so the crawl sync dropped it — noted for re-append if wanted.

Snapshot re-blessed. Scene 1 resolved, Scene 2 sign resolved, Scene 2 dialogue
still one producer call away and now fully visible. No game code touched. Harness
101 green, doc_check green, still build FLAP-DEGHOST-B.

Lesson: a one-line diff hides everything after the first mismatch. When it flags
a scene, read the whole scene.

— crew, night twenty-eight, reading past the first mismatch

---

## NIGHT TWENTY-NINE — THE TOOL ONLY EVER KNEW ONE FACE

Producer ran the separator on IZZY and it fell apart: every mouth option in the
pool was the same, and the base brows were showing through the whole eyes row.
He asked the right question — "are we using a similar approach to what worked for
Mike?" Yes. Exactly the same approach. That was the problem.

Went back through `flap_pool.py` with that question in hand, and the whole thing
is soaked in Mike's skull. Not just the four ROIs — the ear-carve columns
(x82/x174), the brow-erase cutoff (y98), the mouth guards, the closed-lip band,
all of it hand-measured on `MIKE.talking-1` cell 8 and pinned as module globals.
Izzy's face sits higher and runs narrower, so Mike's `mouth` band (y140–214)
drops straight onto her neck — which is why every mouth read identical, they were
all the same patch of throat — and his brow cutoff sits below where her brows
actually are, so nothing erased them and they ghosted through every option. Same
class of "the region is in the wrong place" bug as the mouth ghost, one storey up.

Lifted every one of those numbers into a per-character `geom` block. `GEOM_MIKE`
holds his exact values and is the default; the extractors and the registrar all
read geometry from the character now instead of from the module. Guard on the
whole move: rebuild Mike and diff the pool — **byte-identical, all forty files.**
The lift changed nothing for the face it was tuned on, which is the only proof
that it's a clean lift and not a rewrite.

Then built the instrument we should have had before we ever touched a second
character: `--measure`. Point it at a character's own grids and it prints where
their features actually move — eyes band high, mouth band low, the quiet nose
strip between, the face's width, the base's closed-lip row — and drafts a `geom`
block from it. Validated it on Mike: it lands the lip row dead on y140 and the
mouth band within a few px of the hand-tuned one. It's a starting estimate to
confirm at zoom, not gospel — but it stops the next face from being guessed.

What I can't do from here: actually build Izzy. Her talking grids and her POOLS
entry live on the producer's side; this tree has only her 48×48 game portrait.
So this is a hand-off: drop the `IZZY.*` grids in `raw/talking/`, tell me which
cell is her rest face, and I'll measure, set her geom, rebuild, and hold it to
the zoom standard the same way we did Mike. (He also flagged he may pull more
open-eyed source cells — his art call; the pipeline will take whatever he sends.)

No game code touched but the build stamp. Harness 101 green, doc_check green,
Mike byte-identical. Build FLAP-GEOM-A.

Lesson: "it works" always means "it works on the case we built it on." A tool
with a face's coordinates baked into it doesn't have a method, it has a memory.

— crew, night twenty-nine, teaching the tool that faces differ

---

## NIGHT THIRTY — IZZY GETS A REAL FACE (THE GEOMETRY PAYS OFF)

Producer sent Izzy's talking grids — nine 768×768 PixelLab sheets, neutral,
whisper, talking, confused, sad, screaming, yelling. First real test of last
night's per-character `geom`, and the honest answer to "did the refactor actually
help or did I just move constants around."

Measured her before touching anything. Put a ruler on her rest cell and read the
bands straight off the pixels: brows y68–82, eyes y84–108, nostrils ~y113–120,
closed lip y127–134, and — the whole point — her open scream mouth drops to y174.
She sits a full ~20px higher than Mike and runs narrower (face skin x70–184 at eye
level vs his ~x58–199). Mike's mouth band starts at y140; on Izzy that's her chin
and throat, which is exactly why every mouth in the producer's screenshot was the
same slab of neck. His brow cutoff sat below her brows, so nothing erased them and
they ghosted. Same two failures, one cause, and the cause was geometry.

(Aside: `--measure`'s auto-suggestion was itself Mike-biased — it hunts the mouth
in y134–206, so on Izzy it pinned the lip row to y135, the top of its own search
window. Told me the answer was above the window. Trusted the ruler over the robot
and measured by hand. The estimator wants wider windows before it's trusted on a
third face; noted for next time.)

Set her `geom` from the measurements, rebuilt: base + 21 eyes&brows + 16 mouths,
all real. Held it to the zoom standard both ways. Independent checks: 0 base-brow
ghost across all 21 eyes options, 0 base-lip ghost across all 16 mouths. Then the
eyeball pass at 9×: the raised-brow options carry one clean set of brows, not two;
the scream mouth is teeth-tongue-cavity sitting correctly *below* an intact nose.
The eight mouths that paint into the nostril band are the open scream/yell ones
legitimately reaching up under the nose — the nose survives, verified at zoom.

Mike rebuilds byte-identical through all of it — the second face didn't cost the
first. Studio rebaked with both (7.5 MB, MIKE + IZZY in the dropdown). Base cell
is provisional (`IZZY.neutral-1` #1, top-middle, open eyes, closed mouth) — a good
neutral, but it's the producer's call; easy to repoint.

Harness 101 green, doc_check green. Build FLAP-GEOM-B.

Lesson: a refactor earns its keep the first time a second case walks in. Last
night's per-character `geom` turned a from-scratch tool rewrite into an afternoon
of measuring one face.

— crew, night thirty, ruler in hand

---

## NIGHT THIRTY-ONE — THE STUDIO REMEMBERS

Two producer asks on the Flap Studio, both about being able to see your own work.

First: the flap-sequence row tiles were 52px, smaller than the 64px palette, so
the cycle you'd built was the hardest thing on the page to read. Bumped them to
72px — bigger than the palette now — kept the order number and the ✕, roomier
container. You can read a nine-mouth cycle at a glance.

Second, the good one: the empty space under the preview now holds a **Flap
Inventory**. Every flap you export drops in as a card — its name, frame count,
eyes combo, cps, and a little strip of the actual mouth sequence left to right.
Click a card and it loads straight back into the builder (sequence, eyes, cps,
name), so you can review, tweak, and re-export instead of rebuilding from memory.
It persists in localStorage — this is a local tool opened from disk, so the
inventory survives closing the tab — with an in-memory mirror so it still works
within a session if a browser fences off file:// storage. Seeded with whatever's
already shipped in assets/portraits/flaps/ (right now: MIKE.neutral), shown as an
"on disk" line so you know it exists even though its recipe predates the cards.

Stored the lightweight recipe only — eyes id, the mouth-id sequence, cps — never
the baked 48px frames, so the inventory stays tiny and the reload is exact.

Verified for real this time, not just by reading the diff: drove the baked studio
in a headless browser, built two flaps, exported them, and screenshotted both
cards with their strips and the enlarged sequence row. Then a round-trip test —
export a 4-mouth flap, clear the sequence to zero, click the card — sequence comes
back to 4 and the name field repopulates. Template edited, `flap_pool.py --studio`
re-bakes; the generated `flap_studio.html` is never hand-touched. Pool untouched,
Mike still byte-identical, harness 101 green, doc_check green. Build FLAP-STUDIO-B.

Lesson: a tool that can't show you what you've already made makes you hold it all
in your head. The inventory is the studio finally keeping its own notes.

— crew, night thirty-one, giving the studio a memory

---

## NIGHT THIRTY-TWO — NOAH TALKS, AND SCENE 2 FINALLY AGREES WITH ITSELF

Two deliveries from the producer in one drop: a rewrite of Scene 2, and Noah's
flap art.

**Scene 2.** He went back into the .docx and expanded the whole scene — 2016
characters to 2859 — and in doing so quietly settled every argument the two
script files had been having. The listening-booth sign is **BE YOU** again (he
changed it back from BE GENTLE). Noah's shoe is **untied**, his sprite's
permanent state. The nicknames lock to Goobs / Michael / Gooby / Pops. And the
new dialogue is *good* — the Zamfir bit grows a whole eulogy ("he tweeted the
tones of the gods"), the free-bin betrayal, the Venmo dad-joke, the "1.. 2.. 3.."
headcount. I transcribed his .docx Scene 2 into the .md verbatim. First time
ever, `script_check` comes back **DIVERGENT 0** across all 25 scenes. The files
finally tell the same story. Blessed the snapshot.

**Noah's pool.** Eight grids, a wider face than Mike's and a hair lower than
Izzy's — brows y82, closed lip y138, scream all the way to y189. Measured him by
ruler (the auto-estimator is still Mike-biased and would've under-read him), set
his geom, built: base + 11 eyes+brows + 22 mouths. The mouths came out clean
first pass — teeth, tongue, nose held above the open ones, zero lip-ghost.

The eyes fought me, and the fight taught the same lesson every new face teaches a
slightly different way. Noah's ear is dark and it sits *right* next to a bright
band of temple skin. `extract_upper` feathers the patch alpha three pixels past
the box, and out there it paints base pixels — so wherever the carve edge landed
on his dark ear, a little black nub bled through onto every eyes option. Chased
it in from x190 to x180 to x172 and it kept shrinking but wouldn't die, because
the feather was always finding *some* dark. The fix wasn't tighter — it was
*aimed*: measure the temple column by column, find the bright-skin band at
x172-178, and land the box edge there so the three-pixel feather spills onto skin
instead of ear. Nub gone. Then one last dash at the top-left off-face corner,
killed by raising the box top to y80 so the carve covers the whole height.
Couldn't reach into `extract_upper` to fix the feather globally — it's shared,
and Mike's byte-identical rebuild is the tripwire that says so. So the fix lives
where it should: in Noah's own geometry.

Verified at the producer's zoom, not just by metric: both temples, the ear
rendering as an ear, the scream with its tongue. Mike still byte-identical.
Studio rebaked — all three now in the dropdown, and the new inventory panel will
catch Noah's flaps the moment the producer authors them. Build FLAP-NOAH-A.

Lesson, filed next to Izzy's: you don't carve an artifact out by pushing the wall
in until it stops. You measure where the light is and put the seam there.

— crew, night thirty-two, three faces that talk now

---

## NIGHT THIRTY-THREE — THE STREET COMES IN

The producer sent the store exterior: STORE-EXT-A (day), STORE-EXT-B (a second
block — Garage & Towing), and a bonus STORE-EXT-C (the same storefront at night,
band lit in the window, wet reflections on the brick). These were the last
NOT-DELIVERED Act I rooms; Scene 3's earbud-pedestrian beat has been waiting on
them.

They're a new shape. Every room so far has been a 768×432 single screen cropped
16:9 from a 3:2 render. These are 3:1 street panoramas — the street *is* the room
and the camera walks along it. The 16:9 crop path would've tried to take a window
taller than the image and fallen over. But the camera already clamps to any
`size[0]`, so wide rooms are a solved problem on the engine side; the only gap was
intake. Added `intake.py --wide`: the same median-/2 snap that kills the AA on
every other render, minus the crop. Grid-detect reads px=1 on all three (same as
the 16:9 rooms — these renders carry no real pixel grid), so /2 is the honest
integer snap. Out come 1024×342, 1085×362, 1033×380.

Left the framing and `size`/`spriteScale` alone — those are the producer's, and
they follow from where he paints the sidewalk. Flagged two things in the shot
list so they don't bite later: A and C are NOT pixel-aligned (C is a taller,
separate render), so C can't be a runtime day↔night *state* of A without a
matching re-render or an align pass — it's its own backdrop for now. And whether
A+B are one panning street or two rooms is his call (Scene 3's flagged pan is the
reason B exists).

Next hop is his: load each normalized backdrop in maskpaint, paint FLOOR +
OCCLUDER, and I run mask2json + wire spawns/exits/hotspots and anchor-validate
against the engine. When his earbud-pedestrian sprites land I can wire them as
walk-by NPCs along the sidewalk. Tool-only change; harness 101 green, doc_check
green, nothing in the runtime moved.

— crew, night thirty-three, the record store finally has a curb

---

## NIGHT THIRTY-FOUR — THE STREET LEARNS TO WALK (a tool grows up)

The earbud pedestrians arrived, and the scene found its real shape: not a walkable
room but a **cinematic** — tight camera on the store, people crossing the frame
large enough that the earbuds read. Built a choreographer for it, and it grew a
lot across the session as the producer sharpened what he wanted.

The art was five people, but delivered as many takes — because (as he told me) the
multiple sheets were raw material to build ONE fluid walk each, not a set to pick
from. So the tool became a per-person frame picker: pool every frame from a
person's sheets, click the good ones into an ordered cycle, drop the third leg,
the stalls, the head-turns. I couldn't do that curation myself — my image viewer
went dark early and never came back, so I flew the whole session on measurement
and headless-render pixel checks, and handed the seeing to him. Honest is better
than pretending; the picker puts the eyes where they belong.

By the end it had: five single instances (no more clones of the same person),
per-person direction/speed/scale/**depth**/start/fps, a world-space **camera** so
zoom and focus move everyone together, a real Restart (not just pause), and an
**Export** that writes the whole scene — including each cycle as `{sheet, frame}`
source refs — to JSON. That export is the bake spec.

Then he asked the question that mattered: will the game honor the painted trees so
people walk behind them? Read `stage.draw` to be sure before answering — yes. It
y-sorts sprites by feet and walk-behind strips by horizon in one pass, so a
pedestrian whose feet sit behind a tree gets the tree redrawn over them. The
per-person depth slider I'd added is exactly that feet-Y. Nice when a control you
built for looks turns out to be the one the engine already speaks.

Wrapped for compaction: pedestrians intook to `assets/sprites/raw/pedestrians/`
(with a manifest and a `_discarded/` bin so nothing's lost), the choreographer
folded into `tools/`, the whole cinematic pipeline + wiring plan written into §5.5,
and NEXT_SESSION pointed at the bake. No runtime moved; harness 101 green,
doc_check green. Build bumped to EARBUD-CINE-A — tooling + art intake + docs; no runtime moved.

Lesson: let the producer keep telling you what the tool is. It started as "show me
a walk-by" and became a little choreography studio. Build it out when the scene
asks, not before.

— crew, night thirty-four, flying blind but measuring twice
