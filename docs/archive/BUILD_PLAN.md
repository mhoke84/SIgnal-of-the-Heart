# RADIO UNDERGROUND v2 — BUILD PLAN
### One phase per session (roughly). Every phase ends playable + shown.

## PHASE 0 — PRE-PRODUCTION  ✅ DONE (this session)
- Intake tool built + run: 4 backdrops normalized to 768×432.
- Grid finding: px=1 (no true grid) → design decision: 16:9 crop + /2 median.
- IP audit: **STORE-INT-A/B FLAGGED** (8 items — see ASSET_STATUS.md);
  BACK-A/B clean. Regeneration of INT-A/B requested.
- Project skeleton, this plan, DEVELOPMENT_BRIEF.md, ASSET_STATUS.md.
- Build 004 preserved as `reference_build004.html` (logic source of truth).

**Producer to-dos before Phase 2:** regenerate STORE-INT-A/B with canon
sleeves (keep composition if possible); decide whether CCT-OFFICE-A joins
the Tier-1 batch (Scene 4 needs it eventually).

## PHASE 1 — THE STAGE (engine core)  ✅ DONE (harness 34/34 green)
Build: loader (manifest + ready gate), stage compositor (§3 of brief),
camera, input, clock/audio/songs ported, mask.js, mask2json/maskview tools,
mask+anchors for **STORE-BACK-A** (clean room), placeholder 32×48 box-sprite.
**Accept when:** you can walk the back room at 480×270 with camera clamp,
walk-behind works on the shelf row, store theme plays, beat clock verified
(debug beat pulse), 60fps.
**Needs:** nothing new. BACK-A/B already in hand.

## PHASE 2 — THE BAND ON STAGE (art bible screen)
Build: gen_sprites.py at 32×48 → Mike/Izzy/Noah full facings+walks+idles,
Earl bespoke, Stylus; drop shadows; registration screenshot set (5 positions,
2 rooms) via ported shot harness.
Author masks/anchors for regenerated STORE-INT-A (+B state).
**Accept when:** PRODUCER APPROVES the composited art-bible screen —
sprites live in the room. This is the calibration gate; nothing propagates
until it passes.
**Needs:** regenerated STORE-INT-A/B.

## PHASE 3 — ACT I OPENS (Scenes 1–3)
Port dialog (96px portraits), runner (+state/camera/fx ops), SCENES verbatim.
Scene 1 crawl/title re-staged (TITLE-ART not delivered → typographic title,
flagged). Scenes 2–3 on INT-A/INT-B with state swap, TALK tutorial, Stylus
gag, string-light + stage-light-on-beat overlays for show night.
**Accept when:** Scenes 1–3 play start to chapter card, harness passes.
**Needs:** STORE-EXT-B for the street pan (else flagged silhouette pan).

## PHASE 4 — THE DEAL & THE BROADCAST (Scenes 4–6)
Scene 4 on placeholder office (FLAGGED) or CCT-OFFICE-A if delivered.
Scene 5–6 in BACK-A→BACK-B state swap: drop-cloth beat, tube-glow flicker +
ON AIR overlays, needle-drop re-staged at 480×270, town pan + listener
counter, red alert.
**Accept when:** Act I plays through the END OF ACT I card.
**Needs (ideal):** CCT-OFFICE-A, STORE-EXT-A/B.

## PHASE 5 — THE GOON SQUAD (Scene 7 + battle presentation)
Battle logic verbatim; new presentation over plates: party sprites at 32×48,
enemy staging, tempo UI at 480 width, beat vinyl, judgement text. Goon fight
incl. danish choice + Family Business + Curly's bob.
**Accept when:** Scene 7 battle plays and feels ON the beat.
**Needs:** BATTLE-STORE (else flagged interim plate).

## PHASE 6 — TOWER 1 (Harvest Junction)
T1-TOWN walkabout, T1-BARN logbook scene, corn maze REBUILT procedurally at
new res sampling T1 palettes (intake gains a palette-extract mode), Jingle-Bot
over BATTLE-FARM, T1-SILO flavor room, ring/lit-tower finale, slice end card.
**Accept when:** full slice plays end-to-end = build-004 story parity.
**Needs:** T1-TOWN, T1-BARN, T1-SILO, BATTLE-FARM.

## PHASE 7 — MASTERING
DEVLOG catch-up, ASSET_STATUS reconciliation, A/B against build 004,
perf pass, input-consume regression + full harness suite green, ship
`radio_underground_v2` + registration/AB shots.

## STANDING RULES EVERY PHASE
- Backdrops untouched; problems flagged, never fixed.
- All authored art flows through the validating generators (the unicode-ghost
  rule: three real catches so far).
- Every phase ends with: harness green, playable file shipped, DEVLOG entry
  in tour-diary voice, and screenshots for the producer.
