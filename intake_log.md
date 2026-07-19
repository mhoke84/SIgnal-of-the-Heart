# INTAKE LOG

| ID | raw | grid | logical | palette | AA residue |
|---|---|---|---|---|---|
| STORE-INT-A | 1536x1024 | px=1 | 1536x1024 | 305832 -> 305832 | 0.776 |
| STORE-INT-B | 1536x1024 | px=1 | 1536x1024 | 91513 -> 91513 | 0.810 |
| STORE-BACK-A | 1536x1024 | px=1 | 1536x1024 | 216730 -> 216730 | 0.818 |
| STORE-BACK-B | 1536x1024 | px=1 | 1536x1024 | 223053 -> 223053 | 0.818 |
| STORE-INT-A | 1536x1024 | px=1 | 1536x1024 | 305832 -> 305832 | 0.776 |
| STORE-INT-B | 1536x1024 | px=1 | 1536x1024 | 91513 -> 91513 | 0.810 |
| STORE-BACK-A | 1536x1024 | px=1 | 1536x1024 | 216730 -> 216730 | 0.818 |
| STORE-BACK-B | 1536x1024 | px=1 | 1536x1024 | 223053 -> 223053 | 0.818 |

## v2 normalization (16:9 content crop + median /2)
| ID | raw | crop-top | logical | colors | residue |
|---|---|---|---|---|---|
| STORE-INT-A | 1536x1024 | y=73 | 768x432 | 105501 | 0.766 |
| STORE-INT-B | 1536x1024 | y=75 | 768x432 | 34972 | 0.852 |
| STORE-BACK-A | 1536x1024 | y=62 | 768x432 | 79153 | 0.825 |
| STORE-BACK-B | 1536x1024 | y=62 | 768x432 | 80781 | 0.808 |

## IZZY talking grids (flap pool) — intake 2026-07-14
9 PixelLab 768×768 (3×3, 256px cells) full-face expression grids, renamed on
intake into `assets/portraits/raw/talking/`. Base cell = `IZZY.neutral-1.png` #1.

| clean name | source (pixellab) |
|---|---|
| IZZY.neutral-1.png | Talking-with-a-neutral-express-1783987487695 |
| IZZY.neutral-2.png | Talking-with-a-neutral-express-1783987687964 |
| IZZY.talking-smooth.png | Talking-in-a-smooth-fluid-moti-1783987221340 |
| IZZY.talking-warm.png | Talking-to-someone-filled-with-1783988905135 |
| IZZY.whisper.png | Whispering-as-if-being-careful-1783988675434 |
| IZZY.confused.png | Very-confused-and-talking--Sta-1783995508962 |
| IZZY.sad.png | Very-sad-and-down--Static-body-1783995229238 |
| IZZY.screaming.png | Screaming-at-someone-irate-and-1783987877329 |
| IZZY.yelling.png | yelling-at-the-top-of-her-lung-1784070027037 |

(`izzy-portrait.png`, a 256×256 single cell, was in the zip but is not a talking
grid — not used by the pool.)

## NOAH talking grids (flap pool) — intake 2026-07-16
8 PixelLab 768×768 (3×3, 256px cells) full-face expression grids, from
`noah-flap-assests.zip`, copied on intake into `assets/portraits/raw/talking/`.
Grids arrived generically numbered; kept the producer's numbering to avoid
mislabeling expressions. Base cell = `NOAH.1.png` #1 (top-middle: open eyes,
closed smile, upright) — provisional, pending producer confirmation.

| clean name | source | rough expression (crew read, not canon) |
|---|---|---|
| NOAH.1.png | noah-1.png | talking / neutral, closed-smile rest in cell 1 |
| NOAH.2.png | noah-2.png | talking, brows up (excited) |
| NOAH.3.png | noah-3.png | angry / yelling, teeth |
| NOAH.4.png | noah-4.png | happy, eyes closed (content) |
| NOAH.5.png | noah-5.png | worried / surprised, mouth open |
| NOAH.6.png | noah-6.png | neutral / flat (subdued) |
| NOAH.7.png | noah-7.png | wide-eyed surprise / shock |
| NOAH.8.png | noah-8.png | calm, eyes closed |

Measured by ruler (his features sit between Mike and Izzy; wider face):
brows y82-95, eyes y96-118, nostrils ~y122-128, closed lip y133-138, open mouth
(scream) to ~y189; face skin x70-198 @ eye level. Pool: base + 11 eyes+brows +
22 mouths. Ear/temple carve landed on his bright temple skin (x172-178) to keep
the feather off the dark ear (x180+) — the one class of artifact this face
introduced; brow/lip ghost 0, Mike byte-identical.

## wide scroll-room normalization (median /2, no crop)
| ID | raw | logical | factor | colors | residue |
|---|---|---|---|---|---|
| STORE-EXT-A | 2048x684 | 1024x342 | /2 | 128127 | 0.795 |
| STORE-EXT-B | 2170x725 | 1085x362 | /2 | 86940 | 0.837 |
| STORE-EXT-C | 2067x761 | 1033x380 | /2 | 128650 | 0.798 |
