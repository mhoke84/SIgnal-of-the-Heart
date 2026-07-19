# RADIO UNDERGROUND — SONGBOOK PRODUCTION LIST
## Every Track to Compose, Derived Scene-by-Scene from the Script
*(Producer's working document. IDs are canonical — use them as filenames, e.g. `store_morning.mid` → `store_morning.song.js`. Companion to `preproduction_shot_list.md`. `ASSET_STATUS.md` tracks these same IDs.)*

---

## THE CONTRACT — READ BEFORE YOU COMPOSE

**Deliver `.mid`, not audio.** Every gameplay track is authored in your DAW/notation tool, exported as MIDI, and run through `tools/mid2song.py`, which emits `assets/songs/<id>.song.js`. The game plays it live, in real time, on the beat clock. Generated data — never hand-edit the `.song.js`, re-export and re-run, exactly like `mask2json.py` owns room data.

**The one hard rule: ONE CONSTANT TEMPO PER TRACK.** `clock.js` computes `beat = (audioTime − t0) / (60/bpm)` and never listens to the music. A tempo change silently drifts the whole game off the grid, so `mid2song.py` refuses the file rather than ship the bug. Rubato, ritardando, and tempo ramps must be baked out before export. If a cue truly needs a tempo shift, split it into two tracks.

**Channels are parts.** One instrument per MIDI channel. Channel 10 is GM percussion and becomes the drum pattern (`k` kick / `s` snare / `h` hat / `tom`). Program-change on each channel picks the voice — the mapping lives in `tools/mid2song.py` and the voices in `src/core/voices.js`. Current palette: `piano, epiano, bell, organ, bass, strings, brass, reed, lead`.

**What survives, what doesn't.** Pitch, start, duration, velocity, and sustain pedal all survive. Pitch bend, modulation, volume swells, and pan automation are **dropped** — a note list can't hold continuous expression. Write the expression into the notes.

**Loop length is whole beats.** Compose to a clean bar count. The converter ceilings to the next whole beat and the sequencer loops there.

**`humanize` is the thesis of the game, and it is set per track, not per file.**
- Human tracks: `humanize: 6–11` (ms of drift and breath).
- Copy Cat / MUZAK / any machine-authored music: **`humanize: 0`.** No drift. No breath. Perfectly quantized, perfectly hollow. It should sound *almost* good. That "almost" is the villain.
- This is applied at runtime by the sequencer, so it costs you nothing at compose time. Do not quantize the humanity out of the human tracks yourself.

**Streamed audio (`.mp3`) is permitted for non-gameplay only** — title screen, montage plates, credits. Anything the player presses a button in time with must be a `.mid`, because MP3 encoder padding puts the downbeat a few milliseconds after where the clock expects it.

**No real songs, artists, or bands — same rule as the backdrops.** All in-world: Mudflower, The Nibblers, The Genuines, Paper Kites. The two files currently in the repo (`the_journey_continues`, and the Tifa's Theme test) are **pipeline test fixtures and cannot ship.** They prove the tool; they are not the score.

**The leitmotif discipline.** `main_leitmotif` is Mike's tune, which means it is everybody's tune by the end. It should be quoted, inverted, slowed, corrupted, and finally sung in full across the score. `copycat_pristine` is the same intervals with the life removed. `muzak_cornfield` is that corruption weaponized. Compose `main_leitmotif` **first** — it is the track the whole score answers to, exactly as STORE-INT-A is the room the whole game answers to.

---

## TIER 1 — VERTICAL SLICE (deliver first; Act I Scenes 1–7 + Tower 1)

**`main_leitmotif` — the leitmotif.** LOOP. Warm heartland, G major, ~112 BPM, `humanize: 9`. Mike's tune. A melody a stranger could hum back to you after one hearing, because by the end of the game everyone in the cast will. Every other human track in the score is allowed to quote it. Lock this before anything else. *(Reference: the current placeholder in `songs.js`.)*

**`title_screen` — title screen.** **MP3, DELIVERED.** A radio tuning itself in across a dead band. No beat clock, no gameplay. Loops under the title card until the player presses Z. *(Room: TITLE-ART)*

**`opening_crawl` — the opening text, pre-Scene 1.** LOOP, ~140 BPM, `humanize: 6`. Plays under the title cards before the store. Should state the leitmotif plainly and unadorned — a solo instrument, no kit for the first sixteen bars — then let the band find it. This is the promise the ending pays off. *(Currently stubbed with the `the_journey_continues` test fixture.)*

**`store_morning` — Radio Underground Records, main floor.** LOOP, ~96 BPM, `humanize: 11`. Morning shuffle for pricing 45s. Brushes, a lazy walking bass, an electric piano that's slightly out of tune and doesn't care. The most lived-in track in the game. *(STORE-INT-A; Scenes 1, 2, 7)*

**`store_backroom` — the back room, transmitter under the drop cloth.** LOOP, slow, sparse, `humanize: 11`. Dust motes. Two or three instruments, lots of air, a low hum that could be the building or could be the thing under the sheet. Chekhov's gun, scored. *(STORE-BACK-A; Scenes 1–5)*

**`first_broadcast` — the transmitter revealed, the first pirate signal.** ONCE→LOOP, `humanize: 9`. Render this like a chapel. Full statement of `main_leitmotif`, the first time the player hears it with the whole band behind it. Amber tube glow in sound. The most important cue in Act I. *(STORE-BACK-B; Scene 6)*

**`store_night_show` — the store, show night.** LOOP, ~104 BPM, `humanize: 10`. Folding chairs, a small PA, string lights. Half the room is talking. Diegetic — this is a band actually playing in the corner, so it should sound like a room, not a soundtrack. *(STORE-INT-B; Scene 3)*

**`battle_store` — the goon fight.** LOOP, ~132 BPM, `humanize: 7`. Per the liner notes: *the store turntable, but somebody turned it UP.* Literally `store_morning`'s changes at fight tempo with distortion and a kit that means it. *(BATTLE-STORE; Scene 7)*

**`harvest_junction` — the farm town.** LOOP, ~92 BPM, `humanize: 10`. Warm but faded, pre-liberation. A dance hall that hasn't hosted a dance in two years. Pedal steel energy without the pedal steel. *(T1-TOWN)*

**`walts_barn` — Hollis's barn, Mike's father's broadcast corner.** LOOP, very slow, `humanize: 11`. This room carries Mike's father — score it with love. Solo instrument, the leitmotif in fragments, as if half-remembered. Do not resolve the final phrase. *(T1-BARN)*

**`silo_repeater` — the silo, Copy Cat hardware on old wood.** LOOP, ~100 BPM, `humanize: 4`. The palette war in one track: a human phrase and a teal machine phrase alternating, neither winning. Drop humanize *low but not to zero* — the machine is already infecting the room. *(T1-SILO)*

**`muzak_cornfield` — the corn maze jingle.** LOOP, ~100 BPM, **`humanize: 0`.** Cold. **Its downbeat moves walls** — the maze reorients on the kick, so beat 1 of every bar must carry an unmistakable, isolated kick with nothing else on it. Gameplay-critical: the player navigates by ear. *(PROCEDURAL room; Tower 1)*

**`boss_jinglebot` — Jingle-Bot 9000.** LOOP, ~126 BPM, **`humanize: 0`.** A jingle gone feral. Take the `muzak_cornfield` motif and make it aggressive without making it human — same dead grid, more teeth. *(BATTLE-FARM)*

**`battle_farm` — general Tower 1 encounters.** LOOP, ~128 BPM, `humanize: 7`. Fields at dusk. *(BATTLE-FARM)*

**`victory_fanfare` — the win.** ONCE, ~120 BPM, `humanize: 8`, 8 beats. Earned brass. Ends on the leitmotif's first two notes and stops before the third. *(All battles)*

*Tier 1: 14 tracks.*

---

## TIER 2 — ACT I & II MAIN PATH

**`copycat_pristine` — the tower, general.** LOOP, ~120 BPM, **`humanize: 0`.** Pretty, dead, exactly on the grid. The same intervals as `main_leitmotif` with everything human removed: no swing, uniform velocity, an arpeggio that never breathes. It should sound *almost* good. *(CCT-EXT, CCT-FLOORS)*

**`saltmans_office` — the 88th floor.** LOOP, slow, `humanize: 3`. The museum of a murdered dream. `main_leitmotif` played on one warm instrument, buried under a teal ambience that keeps almost-erasing it. He kept the guitar in a glass case. Score the case, not the guitar. *(CCT-OFFICE-A; Scenes 4, 22)*

**`dakotas_garage` — the item shop.** LOOP, ~108 BPM, `humanize: 11`. Dense, joyful clutter. Bass-forward, a soft-serve machine's hum in the pad, one instrument that is clearly a CB radio. The player will hear this three hundred times — make it a friend, not a hook. *(DAKOTA-GARAGE; Scene 8)*

**`the_nibblers_rehearsal` — Ayden's garage.** LOOP, ~150 BPM, `humanize: 12`. A teenage band arguing in 4/4. Slightly too fast, drums slightly ahead of the bass. Diegetic and imperfect on purpose — this is the highest `humanize` in the game. *(AYDEN-GARAGE; Scene 9)*

**`mudflower_dust` — the old rehearsal room.** LOOP, slow, `humanize: 10`. Twelve years of dust on the good memories. A band's sound, played by nobody. Leave a hole where the vocal was. *(MUDFLOWER-ROOM; Scene 10)*

**`dukes_theme` — the rest stop, night.** LOOP, sparse, `humanize: 9`. Never fully seen: a silhouette in a hat. One instrument, low, no drums, enormous space around it. Sodium light and an empty interstate. It should imply a full band that refuses to arrive. *(RESTSTOP-NIGHT; Scene 12; reused CCT-ROOF, GREENROOM-INT)*

**`genuines_1999` — the flashback garage.** LOOP, ~124 BPM, `humanize: 12`. Period-correct, the warmest track in the game, four kids who think they're going to make it. This is what Saltman sold. It must be *good* — if the player doesn't grieve here, Act III doesn't land. *(FLASH-GARAGE; Scene 13)*

**`the_signing` — the label office, 1999.** ONCE, `humanize: 4`. `genuines_1999` slowed and hollowed out as the pen touches paper. The exact moment the humanize drains to zero, scored. *(FLASH-LABEL; Scene 13)*

**`bus_stop_rain` — 1999, rain.** ONCE, very slow, `humanize: 10`. Young Saltman's loneliest frame. One instrument, one phrase, four bars, no resolution. *(FLASH-BUSSTOP; Scene 13)*

**`summit_glass` — the platform summit.** LOOP, ~118 BPM, **`humanize: 0`.** Boardroom in the clouds. Corporate ambient: pleasant, expensive, contentless. The sound of a room where music is called *content*. *(SUMMIT-BOARDROOM; Scene 14)*

**`dip_stick_address` — the presidential podium.** LOOP, ~110 BPM, **`humanize: 0`.** A march assembled by a committee that has read about marches. Teal flags. Every screen in America. *(PODIUM-BROADCAST; Scene 15)*

**`the_raid` — the storefront, boarded.** ONCE, `humanize: 8`. The gut punch. `store_morning` with the band removed one instrument at a time until only the out-of-tune electric piano is left, playing alone, wrong. A cracked 45 on the sidewalk. *(STORE-EXT-C; Scene 16)*

**`rooftop_vows` — the marriage scene.** ONCE, `humanize: 9`. Tar roof, vent pipes, a downtown horizon where the neon has gone teal. Two instruments only, trading the leitmotif, neither of them soloing. The quietest cue in the game and the one people will remember. *(ROOFTOP-NIGHT; Scene 17)*

**`the_bside` — the mobile studio, travel theme.** LOOP, ~116 BPM, `humanize: 10`. A gutted delivery van full of rack gear and taquitos. Motion, optimism, a little rattle. Recurring from Scene 16 on. *(BSIDE-VAN)*

**`the_signal_map` — the world map.** LOOP, ~104 BPM, `humanize: 9`. Heard more than any other track. Built from the leitmotif's *bass line*, not its melody, so it never wears out. Add one new instrument per tower liberated — nine states, same track. *(PROCEDURAL map)*

*Tier 2: 15 tracks.*

---

## TIER 3 — THE TOWERS (2 through 9)

**Tower 2 — Maple Cross Galleria**
- **`t2_dead_mall`** LOOP, ~98 BPM, `humanize: 2`. A dry fountain full of pennies. Mall muzak that has been looping since the last customer left; it has begun to decay. Let a tape-wobble live in the arrangement, not in the tempo.
- **`t2_spin_city`** LOOP, slow, `humanize: 10`. Gloria's immaculate, doomed store — lights on for nobody. Sister track to `store_morning`; same species, different soul. Same chord changes, one instrument fewer.
- **`boss_kiosk`** LOOP, ~130 BPM, **`humanize: 0`.** The directory monolith. Dead franchise jingles stacked until they become a riff.
- **`battle_mall`** LOOP, ~128 BPM, `humanize: 7`.

**Tower 3 — Whitmore College**
- **`t3_campus`** LOOP, ~106 BPM, `humanize: 10`. Leafy quad, zine flyers, a radio tower with opinions.
- **`t3_library_stealth`** LOOP, ~88 BPM, `humanize: 6`. Sightlines and held breath. Percussion only until discovery; the melody enters when you're seen.
- **`junes_song`** ONCE, `humanize: 11`. The song that re-airs from the WVOX booth. It has to sound like a real person recorded it in 1974 and meant it. **The most exposed writing in the game.** *(T3-BOOTH)*
- **`battle_campus`** LOOP, ~130 BPM, `humanize: 7`.

**Tower 4 — The Majestic**
- **`t4_marquee`** LOOP, ~100 BPM, `humanize: 9`. 1927 movie palace. Pit-orchestra ghosts.
- **`t4_ghost_light`** LOOP, very slow, `humanize: 10`. An empty auditorium with one bulb burning. *(T4-STAGE, pre-show)*
- **`t4_backstage`** LOOP, ~112 BPM, `humanize: 10`. Fly rails, rigging, a poster wall where Mudflower's history hides.
- **`boss_the_bootleg`** LOOP, ~136 BPM, `humanize: 3`. A counterfeit of the party's own music — it should quote `main_leitmotif` *badly*, like a cover band that has only heard it described.
- **`battle_stage`** LOOP, ~134 BPM, `humanize: 7`.

**Tower 5 — Port Aurora**
- **`t5_harbor`** LOOP, ~90 BPM, `humanize: 11`. Shanty-town warmth gone quiet. A fishing fleet at dock.
- **`t5_lighthouse`** LOOP, ~86 BPM, `humanize: 9`. Stone spiral, rising tide. Write it to climb.
- **`t5_fog_navigation`** LOOP, ~80 BPM, **`humanize: 0`, GAMEPLAY-CRITICAL.** The player navigates fog **by ear**. Direction must be encoded in the arrangement (a foghorn on the downbeat, a bell on the offbeat). Compose this one *with* the engineer, not before them.
- **`boss_foghorn_prime`** LOOP, ~124 BPM, **`humanize: 0`.** Enormous, slow, in the bass register. Nothing above middle C for the first sixteen bars.
- **`battle_erie`** LOOP, ~126 BPM, `humanize: 7`.

**Tower 6 — Starlite Drive-In**
- **`t6_drivein_derelict`** LOOP, slow, `humanize: 8`. Ranked speaker posts, a great blank screen. Score the silence between the posts.
- **`t6_campfire`** LOOP, ~94 BPM, `humanize: 12`. The night before. Ten characters around a fire. Acoustic, diegetic, someone is playing this *badly and happily.* Let the leitmotif be sung here for the first time.
- **`dakotas_father`** ONCE, `humanize: 11`. The projection booth eulogy. Thirty years of spares. Same love as `walts_barn` — and the two cues should share one phrase, because both men are the same absence.
- **`boss_silver_nitrate`** LOOP, ~132 BPM, `humanize: 4`. The fight happens *on* the screen. Film-grain palette: everything through a band-pass, nothing modern in the kit.
- **`battle_screen`** LOOP, ~130 BPM, `humanize: 7`.

**Tower 7 — St. Cecilia**
- **`t7_nave`** LOOP, very slow, `humanize: 9`. Old wood, stained glass, teal "optimized worship" speakers bolted on intrusively. Organ, but the organ is losing.
- **`t7_choir_loft`** LOOP, `humanize: 10`. The decommissioned gospel-hour antenna corner. Voices without words.
- **`t7_belltower`** LOOP, `humanize: 8`. Carillon works and a flat bell. **Use the flat bell.** It is the truest note in the game.
- **`boss_auto_tuner`** LOOP, ~128 BPM, **`humanize: 0`.** Every pitch snapped to a perfect grid. Nothing is out of tune. Nothing is alive.
- **`battle_church`** LOOP, ~124 BPM, `humanize: 7`.

**Tower 8 — Point Breeze Park**
- **`t8_midway`** LOOP, ~112 BPM, `humanize: 8`. Lakeside park after hours. Calliope with the joy 20% drained.
- **`t8_bandstand_rigged`** LOOP, ~120 BPM, **`humanize: 0`.** The Mechanical Melodies' show. Animatronic precision.
- **`t8_bandstand_liberated`** LOOP, ~120 BPM, `humanize: 12`. **The same track, same notes, humanize cranked.** Ship them as one MIDI exported twice. The player should hear that nothing changed except that someone started breathing. *This is the game's whole argument in ninety seconds.*
- **`t8_green_room`** LOOP, ~104 BPM, `humanize: 11`. The robbed teen bands' clubhouse. A theremin in the corner, used once.
- **`boss_mechanical_melodies`** LOOP, ~134 BPM, **`humanize: 0`.**
- **`t8_funhouse`** LOOP, ~118 BPM, `humanize: 0`. Mirror maze. The melody plays retrograde in one channel. *(PROCEDURAL)*
- **`battle_bandstand`** LOOP, ~132 BPM, `humanize: 7`.

**Tower 9 — Ironvale**
- **`t9_ironvale`** LOOP, ~88 BPM, `humanize: 10`. Rust-belt main drag. A padlocked union hall.
- **`t9_mill`** LOOP, ~84 BPM, `humanize: 5`. The game's darkest palette: server racks glowing inside dead blast furnaces. Percussion from the building itself. **The art image of the whole game — score it like one.**
- **`t9_union_hall_reopened`** ONCE, `humanize: 12`. Ninety years of Fridays, and one more. Act II closer. Full band, full leitmotif, the first unambiguous joy since Scene 6.
- **`scene18_unwinnable`** LOOP, ~140 BPM, `humanize: 0` → **the track that stops.** The fight you cannot win. Compose it to loop, then deliver a second `.mid` that is the same loop with instruments dropping out one per bar until only the kick remains. *(T9-CONTROL, BATTLE-MILL; Scene 18)*
- **`battle_mill`** LOOP, ~136 BPM, `humanize: 6`.

*Tier 3: 32 tracks.*

---

## TIER 4 — ACT III & FINALE

**`cct_lobby`** LOOP, ~120 BPM, **`humanize: 0`.** Corporate cathedral. The cat logo in marble. *(CCT-LOBBY)*
**`cct_ascent`** LOOP, ~124 BPM, **`humanize: 0`.** One representative floor, eleven times. Add one dissonance per floor climbed. *(CCT-FLOORS)*
**`cct_vault`** LOOP, ~96 BPM, `humanize: 0`. Cold aisles of humming storage. Every song ever stolen is in this room, and you can hear them all at once, very quietly. *(CCT-VAULT; Scene 21)*
**`cct_mixroom`** LOOP, `humanize: 4`. A mixing console the size of a wall. The power-routing puzzle: each routed channel unmutes one stem of `main_leitmotif`. **Gameplay-critical — deliver as separated channels.** *(CCT-MIXROOM)*
**`cct_roof`** ONCE, `humanize: 9`. Duke's solo approach. `dukes_theme`, alone, in wind. *(CCT-ROOF)*
**`cct_breaker`** ONCE, short, `humanize: 8`. Adam's date with destiny and a tire iron. Ends on a hit. *(CCT-BREAKER)*
**`algorithm_core`** LOOP, ~132 BPM, **`humanize: 0`.** Cathedral-sized server array crowned with a brass phonograph horn. Every human melody in the game, quantized and stacked until they cancel. *(CCT-CORE; Scene 22)*
**`battle_core`** LOOP, ~138 BPM, three phases. **The best writing in the game.** Phase 1 `humanize: 0`, pure machine. Phase 2 the party's themes fight their way in, `humanize: 4`. Phase 3 `humanize: 12` — the machine loses the grid, and for the first time MUZAK PRIME plays *behind the beat.* *(BATTLE-CORE)*
**`core_dying`** ONCE, `humanize: 11`. Powered-down. The horn, unamplified, playing `main_leitmotif` correctly for the first and last time. *(CCT-CORE, state B; Scene 23)*
**`greenroom_eternal`** LOOP, slow, `humanize: 12`. Warm impossible light, amps to lounge on, seven mic stands. With `battle_core`, one of the two masterpiece cues. Write it at the height of your powers. **The Green Room deserves your best night.** *(GREENROOM-INT; Scene 24)*
**`battle_eternal`** LOOP, ~144 BPM, `humanize: 10`. The superboss. Legends, playing for real. *(BATTLE-ETERNAL)*
**`store2_reopening`** ONCE, ~112 BPM, `humanize: 10`. A ribbon across a door. *(STORE2-EXT; Scene 25)*
**`finale_jam`** LOOP, ~112 BPM, `humanize: 11`. Every character's motif, in counterpoint, over the leitmotif. It has been everybody's tune the whole time. *(STORE2-INT)*
**`credits`** **MP3 permitted.** ONCE. *(non-gameplay)*
**`post_credits_sting`** ONCE, 8 beats, `humanize: 9`. A radio, warm, in a dark store. *(STORE2-NIGHT)*
**`montage_plates`** **MP3 permitted.** Three short cues: `mont_trial`, `mont_dipstick` (vinyl being digitized, forever, badly — this one is a joke and should be funny), `mont_vera`.

*Tier 4: 16 tracks + 3 montage cues.*

---

## PERFORMANCES (diegetic, in-world bands)

These are performed *by characters, on stage*, and are heard as recordings within the fiction. All in-world artists. All `humanize: 10–12` — these are the human beings.

**`perf_mudflower`** — the reunion set. Twelve years of rust burning off in four bars.
**`perf_the_nibblers`** — teenage, too fast, glorious.
**`perf_the_genuines_1999`** — the demo that Saltman sold. Must be genuinely great.
**`perf_paper_kites`** — the band that never charted and didn't mind.
**`perf_battle_of_the_bands`** — the finals at the Majestic. Three short competing cues, one per round.

*Performances: 7 cues.*

---

## STINGERS & SFX (not `.mid` — these live in `audio.js`)
Already implemented and byte-verified against Build 004: `talk, ok, bump, crit, hit, miss, heal, pick, alarm`, plus the attract-mode vinyl crackle. Additions go in `voices.js`, not `audio.js`.

---

## COUNTS & PRIORITIES
Tier 1: 14. Tier 2: 15. Tier 3: 32. Tier 4: 16 (+3 montage). Performances: 7. **Total: 87 cues** (84 `.mid` + 3–5 streamed).

**Working advice:** lock `main_leitmotif` first — it is the track the whole score answers to, and everything from `walts_barn` to `battle_core` is a variation on it. Once it's approved, `copycat_pristine` is the *same melody with humanize stripped*, and `muzak_cornfield` is that corruption weaponized; write all three in one sitting so the family resemblance is real and not retrofitted. Then deliver in tier order.

Compose `t8_bandstand_rigged` and `t8_bandstand_liberated` from a single MIDI, exported twice with only `humanize` changed. If a player can hear the difference — and they will — the game has already made its argument, and everything else is just the plot catching up.

And write `greenroom_eternal` last, when you know all of them.
