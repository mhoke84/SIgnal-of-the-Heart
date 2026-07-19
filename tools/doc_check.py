#!/usr/bin/env python3
# coding: utf-8
"""
RADIO UNDERGROUND v2 - tools/doc_check.py
Audit the documentation against the repo. Run at session close.

Stale docs are worse than no docs: they get believed. This project has been
bitten twice -- a superseded brief that specified the wrong mask grid, and a
status table that said a state-data file was an "orphan, safe to delete" when
it had come to carry state B's floor and occluders.

Checks:
  * every `py tools\\x.py` / `node tools\\x.js` named in CHEATSHEET.md or
    MASTER_REFERENCE.md actually exists
  * every directory the docs name exists
  * the harness count quoted in the docs matches `node tools/harness.js`
  * the build stamp quoted in MASTER_REFERENCE matches src/main.js
  * load-bearing code claims (arm latch, dataFor, buildSheet, verbatim audio.js)

Usage:  py tools\\doc_check.py          exit 1 if anything is out of date
"""
import os, re, sys, subprocess

REF   = os.path.join('docs', 'MASTER_REFERENCE.md')
CHEAT = 'CHEATSHEET.md'
fails = []

def ok(desc, cond):
    print(('  PASS  ' if cond else '  FAIL  ') + desc)
    if not cond: fails.append(desc)

def read(p):
    return open(p, encoding='utf-8').read() if os.path.isfile(p) else ''

def main():
    if not os.path.isfile('index.html'):
        sys.exit('run from the project root')
    ref, cheat = read(REF), read(CHEAT)
    ok('docs/MASTER_REFERENCE.md exists', bool(ref))
    ok('CHEATSHEET.md exists at the project root', bool(cheat))

    print('\n== commands the docs tell someone to run ==')
    for src, name in ((ref, 'reference'), (cheat, 'cheatsheet')):
        for f in sorted(set(re.findall(r'tools\\\\?(\w+\.(?:py|js|html))', src))):
            ok(f'{name}: tools/{f} exists', os.path.isfile(os.path.join('tools', f)))

    print('\n== paths the docs name ==')
    for p in ['assets/backdrops/raw', 'assets/backdrops/normalized', 'assets/sprites/raw',
              'assets/songs', 'assets/music', 'assets/masks', 'assets/anchors',
              'tools/review', 'docs/archive']:
        ok(f'{p}/', os.path.isdir(p))
    ok('docs/.script_snapshot.json (script drift baseline)',
       os.path.isfile(os.path.join('docs', '.script_snapshot.json')))

    print('\n== the numbers the docs quote ==')
    try:
        out = subprocess.run(['node', 'tools/harness.js'], capture_output=True,
                             text=True, timeout=180).stdout
        real = int(re.search(r'(\d+) passed', out).group(1))
        red  = int(re.search(r'(\d+) failed', out).group(1))
        ok(f'harness is green ({real} passed, {red} failed)', red == 0)
        quoted = set(int(n) for n in re.findall(r'(\d+) green', ref))
        ok(f'every "N green" in the reference says {real} (found {sorted(quoted) or "none"})',
           quoted <= {real})
    except Exception as e:
        ok(f'harness runs ({e})', False)

    m = re.search(r"const BUILD='([^']*)'", read(os.path.join('src', 'main.js')))
    build = m.group(1) if m else None
    ok('src/main.js declares a BUILD stamp', bool(build))
    if build:
        ok(f'reference quotes the current build ({build})', build in ref)

    print('\n== load-bearing code claims ==')
    main_js  = read(os.path.join('src', 'main.js'))
    stage    = read(os.path.join('src', 'core', 'stage.js'))
    sprites  = read(os.path.join('src', 'game', 'sprites.js'))
    audio    = read(os.path.join('src', 'core', 'audio.js'))
    m2j      = read(os.path.join('tools', 'mask2json.py'))
    shot     = read(os.path.join('tools', 'shot.js'))
    ok('exits honour an optional `face`',            'ex.face' in main_js)
    ok('doorway arm-latch (no room ping-pong)',      '_exitArmed' in main_js)
    ok('per-state floors: Stage.dataFor()',          'dataFor(' in stage)
    ok('sprite sheets: buildSheet()',                'function buildSheet' in sprites)
    ok('audio.js is still a verbatim Build-004 port',
       'vVoice' not in audio and 'Stream' not in audio)
    ok('mask2json can read back the stub it writes', 'inserted a walkBehind' in m2j)
    ok("shot.js reads its script list from index.html", 'index.html' in shot)

    print('\n== song wiring ==')
    r = subprocess.run([sys.executable, 'tools/build_songs.py', '--check'],
                       capture_output=True, text=True)
    ok('every .song.js is wired into index.html + harness', r.returncode == 0)

    print()
    if fails:
        print(f'{len(fails)} STALE CLAIM(S). Fix the docs (or the code) before closing:')
        for f in fails: print('  - ' + f)
        sys.exit(1)
    print('documentation matches the repo.')

if __name__ == '__main__':
    main()
