# ASSET_STATUS — mirrors preproduction_shot_list.md IDs
Statuses: NOT-DELIVERED / DELIVERED / NORMALIZED / INTEGRATED / NEEDS-VARIANT / **FLAGGED**

## TIER 1 — VERTICAL SLICE
| ID | Status | Notes |
|---|---|---|
| STORE-INT-A | **FLAGGED (IP)** | Normalized 768x432 (y-crop 73, /2 median). **Intake IP audit found real-world art — regeneration requested before integration.** See flag list below. |
| STORE-INT-B | **FLAGGED (IP)** | Normalized 768x432. Inherits the same wall posters as INT-A. Stage/state layout otherwise approved-quality. |
| STORE-BACK-A | INTEGRATED | 768x432, IP CLEAN. Phase 1 room. Mask + occluders PRODUCER-AUTHORED (grid 4, 9 occl blobs, no blue — optional). data.js mask/walkBehind/grid are GENERATED: repaint + mask2json, never hand-edit. maskview in tools/review/. |
| STORE-BACK-B | INTEGRATED | 768x432, IP CLEAN. Loads as state B of the back room (debug T-toggle previews it); tube-flicker & ON AIR overlay stubs in, finalized Phase 4. |
| STORE-EXT-A | NOT-DELIVERED | Needed by Phase 3 (Scene 3 exterior cut uses EXT-B; EXT-A for town shots). |
| STORE-EXT-B | NOT-DELIVERED | Scene 3 exterior cut. |
| BATTLE-STORE | NOT-DELIVERED | Needed by Phase 5 (Scene 7 goon fight plate). |
| T1-TOWN | NOT-DELIVERED | Phase 6. |
| T1-BARN | NOT-DELIVERED | Phase 6. |
| T1-SILO | NOT-DELIVERED | Phase 6. |
| BATTLE-FARM | NOT-DELIVERED | Phase 6 (Jingle-Bot plate). |

## IP FLAGS ON STORE-INT-A / STORE-INT-B (regeneration requested)
Per the shot list's own rule (no real covers, band names, logos, likenesses):
1. "THE CLASH" wall poster (name + London Calling-style art) — top wall.
2. Pink Floyd *Dark Side of the Moon* prism poster — top wall.
3. "SONIC YOUTH" poster (*Goo* cover art) — top wall.
4. Purple poster with strong Jimi Hendrix likeness — top wall.
5. Velvet Underground banana sleeve — bottom-left display bin.
6. Right-wall portrait poster — celebrity-likeness risk (Cure/Bowie-adjacent figure).
7. Skull "ORDER" poster, right wall — Crimson Ghost / OBEY adjacency; caution.
8. Several bin sleeves read as real covers at a glance (painted-face KISS-style, etc.) — sweep during regen.
Everything else (VINYL IS FOREVER neon, STAFF ONLY, GOOD MUSIC HERE mat,
genre placards) is clean and great. Suggested swaps: the canon catalog —
Mudflower, The Nibblers, The Genuines, Paper Kites, plus invented artists.
**Recommendation:** regenerate INT-A first (it is the style-lock room), keep
composition/layout identical if possible so masks and anchors stay valid.

## TIER 2 (14) / TIER 3 (27) / TIER 4 (17)
All NOT-DELIVERED. Note for scheduling: **CCT-OFFICE-A (Tier 2) is required
by slice Scene 4** — either promote it to the Tier 1 delivery batch or Phase 4
ships with a flagged placeholder (old procedural office) until it lands.
