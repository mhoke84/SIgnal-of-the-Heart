Producer sprite art drops here. Two supported shapes:

A) A PACKED SHEET, named exactly the character ID:
       MIKE.sheet.png       (ID matches the portrait: assets/portraits/MIKE.png)
   Cell 32x48. Rows: down, up, left, right[, downleft, downright, upleft, upright].
   Cols: stand, stepA, stepB[, idle...].  Then:
       py tools\sprite_intake.py assets\sprites\raw\MIKE.sheet.png

B) PER-DIRECTION WALK CYCLES, in a folder <name>_walk/ (e.g. mike_walk/):
   one source per direction, named  *-<dir>.<gif|png>  where <dir> is
   forward|up|left|right|down-left|down-right|up-left|up-right.
   GIF frames or a 4x3 128px PNG strip both work. A _*-standing.png montage
   may sit alongside as reference (ignored by the tool). Then:
       py tools\build_char_sheet.py MIKE assets/sprites/raw/mike_walk
       py tools\sprite_intake.py    assets/sprites/raw/MIKE.sheet.png

mike_gifs/ is the FIRST Mike art (superseded by the repaint in mike_walk/),
kept for provenance. Full spec: docs\SPRITE_SPEC.md
