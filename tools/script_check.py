#!/usr/bin/env python3
# coding: utf-8
"""
RADIO UNDERGROUND v2 - tools/script_check.py
Run this FIRST, every session. It answers one question:
"What did the producer change in the script since last time?"

The producer rewrites scenes on the fly, all the way through the project.
Dialogue, stage directions and scene order are CANON, so any drift has to
be caught before the crew touches a line of it.

WHAT IT DOES
  1. Reads both docs/radio_underground_script_edited.docx and .md
  2. Splits each into scenes, hashes every scene body
  3. Diffs against the snapshot from last session
        -> reports ADDED / REMOVED / CHANGED scenes
  4. Cross-checks the .docx against the .md and reports where they disagree
        (they have crossed before: the .docx had the long Scene 1 crawl,
         the .md had the newer Scene 2 dialogue)
  5. Rewrites the snapshot only when you pass --accept

USAGE
    py tools\\script_check.py            # report; exit 1 if anything changed
    py tools\\script_check.py --accept   # report, then bless the new state
    py tools\\script_check.py --show 2   # print scene 2 from both files

Exit codes: 0 = no change, 1 = changes found, 2 = files missing.
"""
import sys, os, re, json, hashlib, difflib

DOCS   = os.path.join('docs')
DOCX   = os.path.join(DOCS, 'radio_underground_script_edited.docx')
MD     = os.path.join(DOCS, 'radio_underground_script_edited.md')
SNAP   = os.path.join(DOCS, '.script_snapshot.json')

SCENE_RE = re.compile(r'^\s*#*\s*(SCENE\s+(\d+)\s*:.*)$', re.I)

def norm(t):
    """Ignore formatting noise: smart quotes, dashes, ellipses, whitespace,
    and markdown decoration (**bold**, *italic*, > quotes, # heads, `code`).
    The .md wraps speaker names in ** and the .docx does not; that is
    typography, not a script change. We diff CONTENT."""
    t = (t.replace('\u2019', "'").replace('\u2018', "'")
          .replace('\u201c', '"').replace('\u201d', '"')
          .replace('\u2014', '-').replace('\u2013', '-')
          .replace('\u2026', '...'))
    t = re.sub(r'^\s*[>#]+\s*', ' ', t, flags=re.M)   # blockquote / heading
    t = t.replace('**', '').replace('`', '')
    t = re.sub(r'(?<!\w)\*(?!\s)|(?<!\s)\*(?!\w)', '', t)  # italic markers
    t = re.sub(r'^\s*-{3,}\s*$', ' ', t, flags=re.M)  # hrules
    return re.sub(r'\s+', ' ', t).strip()

def scenes_from_lines(lines):
    """-> {scene_no: {'title':str,'body':str}} preserving order."""
    out, cur = {}, None
    for ln in lines:
        m = SCENE_RE.match(ln)
        if m:
            cur = int(m.group(2))
            out[cur] = {'title': norm(m.group(1)), 'body': []}
        elif cur is not None:
            out[cur]['body'].append(ln)
    for k in out:
        out[k]['body'] = norm(' '.join(out[k]['body']))
    return out

def read_md(path):
    if not os.path.isfile(path): return None
    return scenes_from_lines(open(path, encoding='utf-8').read().splitlines())

def read_docx(path):
    if not os.path.isfile(path): return None
    try:
        import docx
    except ModuleNotFoundError:
        print("  (python-docx not installed: py -m pip install python-docx)")
        return None
    d = docx.Document(path)
    return scenes_from_lines([p.text for p in d.paragraphs])

def h(s): return hashlib.sha1(s.encode('utf-8')).hexdigest()[:12]

def report(name, cur, prev):
    """prev is {scene_no(str): hash}; returns True if anything changed."""
    changed = False
    curh = {str(k): h(v['body']) for k, v in cur.items()}
    added   = sorted(set(curh) - set(prev), key=int)
    removed = sorted(set(prev) - set(curh), key=int)
    same    = sorted(set(curh) & set(prev), key=int)
    edited  = [s for s in same if curh[s] != prev[s]]

    if added:   changed = True; print(f"  ADDED   scenes: {', '.join(added)}")
    if removed: changed = True; print(f"  REMOVED scenes: {', '.join(removed)}")
    if edited:
        changed = True
        print(f"  CHANGED scenes: {', '.join(edited)}")
        for s in edited:
            n = len(cur[int(s)]['body'])
            print(f"      scene {s}: {cur[int(s)]['title'][:56]}  ({n} chars)")
    if not changed:
        print("  no change")
    return changed, curh

def first_diff(a, b, width=70):
    """Return a short human-readable sample of where two bodies part ways."""
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == 'equal': continue
        return (f"        .docx: ...{a[max(0,i1-20):i2+30]}..."
                f"\n        .md:   ...{b[max(0,j1-20):j2+30]}...")
    return ""

def cross_check(dx, md):
    print("\n== .docx vs .md ==")
    if not dx or not md:
        print("  (need both files to compare)"); return
    only_dx = sorted(set(dx) - set(md)); only_md = sorted(set(md) - set(dx))
    if only_dx: print(f"  only in .docx: scenes {only_dx}")
    if only_md: print(f"  only in .md:   scenes {only_md}")

    trivial, divergent = [], []
    for s in sorted(set(dx) & set(md)):
        a, b = dx[s]['body'], md[s]['body']
        if a == b: continue
        r = difflib.SequenceMatcher(None, a, b, autojunk=False).ratio()
        (trivial if r >= 0.99 else divergent).append((s, r, a, b))

    n_same = len(set(dx) & set(md)) - len(trivial) - len(divergent)
    print(f"  identical: {n_same}   near-identical (>=99%): {len(trivial)}"
          f"   DIVERGENT: {len(divergent)}")
    if trivial:
        print(f"  near-identical scenes (stray punctuation only): "
              f"{[s for s,_,_,_ in trivial]}")
    for s, r, a, b in divergent:
        longer = '.docx' if len(a) > len(b) else '.md'
        print(f"\n  ** SCENE {s} DIVERGES ({r*100:.0f}% similar; "
              f"{len(a)} vs {len(b)} chars; longer: {longer})")
        print(first_diff(a, b))
    if divergent:
        print("\n  ** The crew must be told which file is canon per scene. **")
    elif not only_dx and not only_md:
        print("  No real divergence. Either file is safe to work from.")

def show(n, dx, md):
    for tag, src in (('.docx', dx), ('.md', md)):
        print(f"\n===== SCENE {n} — {tag} =====")
        if src and n in src: print(src[n]['body'][:2000])
        else: print("(absent)")

def main():
    accept = '--accept' in sys.argv
    showsc = None
    for i, a in enumerate(sys.argv):
        if a == '--show' and i + 1 < len(sys.argv): showsc = int(sys.argv[i + 1])

    dx, md = read_docx(DOCX), read_md(MD)
    if dx is None and md is None:
        print("ERROR: no script found in docs/. Run from the project root."); sys.exit(2)

    if showsc is not None:
        show(showsc, dx, md); return

    snap = json.load(open(SNAP, encoding='utf-8')) if os.path.isfile(SNAP) else {}
    if not snap:
        print("No snapshot yet — this run establishes the baseline.\n")

    changed = False
    newsnap = {}
    for tag, src in (('docx', dx), ('md', md)):
        if src is None: continue
        print(f"== {tag} ==  ({len(src)} scenes)")
        ch, curh = report(tag, src, snap.get(tag, {}))
        changed = changed or ch
        newsnap[tag] = curh

    cross_check(dx, md)

    if accept or not snap:
        json.dump(newsnap, open(SNAP, 'w', encoding='utf-8'), indent=1)
        print(f"\nsnapshot written -> {SNAP}")
        sys.exit(0)

    if changed:
        print("\nSCRIPT HAS CHANGED. Update the docs/strings that depend on it,")
        print("then re-run with --accept to bless the new state.")
        sys.exit(1)
    print("\nScript unchanged since last session.")
    sys.exit(0)

if __name__ == '__main__':
    main()
