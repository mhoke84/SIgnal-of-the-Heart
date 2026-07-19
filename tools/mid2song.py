"""
RADIO UNDERGROUND v2 — tools/mid2song.py
MIDI -> songbook entry. GENERATED DATA. Never hand-edit the output.

Same contract as mask2json.py: the producer authors in a real tool
(DAW / notation / keyboard), exports, and this converter owns what
lands in the repo.

  (track, channel) -> a `part`, voice chosen from the GM program
  channel 10        -> the `dr` drum pattern (GM perc -> k/s/h/tom)
  tempo -> bpm      ticks/PPQ -> beats      velocity -> vel

WHY .song.js AND NOT .song.json
  index.html runs from file:// with zero server. fetch()/XHR of a .json
  is blocked there by CORS, exactly like canvas pixel reads are tainted
  (MASTER_REFERENCE §3). Plain <script> tags are not. So the shipped
  artifact is a script that registers itself into SONGS — the same trick
  assets/anchors/<ID>.data.js uses for room data. The .json is written
  alongside purely for tooling/diffing.

HARD RULE: one constant tempo. The beat clock (clock.js) computes
  beat = (audioTime - t0) / (60/bpm)
and never listens to the music. A tempo change would silently drift the
whole game off the grid, so this tool FLAGS it and refuses to write.

SETUP (once):  py -m pip install mido
USAGE:         py tools/mid2song.py song.mid [songId] [--humanize N] [--once]
OUTPUT:        assets/songs/<songId>.song.js   (+ .song.json beside it)
"""
import sys, os, json, math

try:
    import mido
except ModuleNotFoundError:
    sys.exit("Missing 'mido'. Install it once with:\n    py -m pip install mido")

# GM program (0-based) -> a voice in src/core/voices.js
def gm_voice(prog):
    if prog <= 7:  return 'piano'
    if prog <= 15: return 'bell'
    if prog <= 23: return 'organ'
    if prog <= 31: return 'epiano'
    if prog <= 39: return 'bass'
    if prog <= 55: return 'strings'
    if prog <= 63: return 'brass'
    if prog <= 71: return 'reed'
    return 'lead'

# GM percussion note -> drum token understood by vDrumX()
def gm_drum(n):
    if n in (35, 36):                            return 'k'
    if n in (37, 38, 39, 40):                    return 's'
    if n in (42, 44, 46, 49, 51, 52, 55, 57, 59):return 'h'
    if n in (41, 43, 45, 47, 48, 50):            return 'tom'
    return 'h'

def convert(path, song_id, humanize=6, once=False):
    mf = mido.MidiFile(path)
    ppq = mf.ticks_per_beat
    tempos, events, bends = [], [], 0

    for ti, tr in enumerate(mf.tracks):
        t = 0
        prog, pedal, sounding, sustained = {}, {}, {}, {}
        def close(ch, note, end_t, src):
            st, v, pr = src
            events.append((st, ti, ch, note, max(1, end_t - st), v, pr))
        for msg in tr:
            t += msg.time
            mt = msg.type
            if mt == 'set_tempo':
                tempos.append(msg.tempo)
            elif mt == 'program_change':
                prog[msg.channel] = msg.program
            elif mt == 'pitchwheel':
                bends += 1
            elif mt == 'control_change' and msg.control == 64:   # sustain pedal
                down = msg.value >= 64
                if pedal.get(msg.channel) and not down:
                    for k in [k for k in sustained if k[0] == msg.channel]:
                        close(k[0], k[1], t, sustained.pop(k))
                pedal[msg.channel] = down
            elif mt == 'note_on' and msg.velocity > 0:
                k = (msg.channel, msg.note)
                if k in sounding:  close(k[0], k[1], t, sounding.pop(k))   # retrigger
                if k in sustained: close(k[0], k[1], t, sustained.pop(k))
                sounding[k] = (t, msg.velocity, prog.get(msg.channel, 0))
            elif mt == 'note_off' or (mt == 'note_on' and msg.velocity == 0):
                k = (msg.channel, msg.note)
                if k in sounding:
                    src = sounding.pop(k)
                    if pedal.get(msg.channel): sustained[k] = src
                    else: close(k[0], k[1], t, src)
        for k, src in list(sounding.items()):  close(k[0], k[1], t, src)   # flush
        for k, src in list(sustained.items()): close(k[0], k[1], t, src)

    tempos = tempos or [500000]
    bpm = round(60_000_000 / tempos[0], 3)
    constant = len({round(60_000_000 / x, 3) for x in tempos}) == 1
    raw_len = max((e[0] + e[4] for e in events), default=0) / ppq
    length  = max(1, int(math.ceil(raw_len)))     # loop length, whole beats

    parts, drums = {}, []
    for st, ti, ch, n, dur, v, pr in sorted(events):
        beat, blen = round(st / ppq, 4), round(dur / ppq, 4)
        if beat >= length:            # a stray tail past the loop point
            continue
        if ch == 9:
            drums.append([beat, gm_drum(n)])
        else:
            key = (ti, ch)
            parts.setdefault(key, {'voice': gm_voice(pr), 'n': []})
            # part v=1 so the note's own velocity is absolute (songs.js: p.v*n[3])
            parts[key]['n'].append([beat, n, blen, round(v / 127 * 0.30, 3)])

    song = {
        'id': song_id, 'bpm': bpm, 'len': length, 'humanize': humanize,
        'imported': 1, 'constant_tempo': constant, 'pitch_bends_dropped': bends,
        'parts': [{'voice': p['voice'], 'v': 1, 'n': p['n']}
                  for _, p in sorted(parts.items())],
        'dr': drums,
        'drLoop': length,            # drums are absolute across the whole song
    }
    if once:
        song['once'] = 1
    return song

def emit_js(song):
    """Self-registering plain script. Mutating the const SONGS object is
    legal from a later <script>; the window fallback keeps it robust."""
    d = {k: song[k] for k in ('bpm', 'len', 'humanize', 'imported', 'drLoop')}
    if song.get('once'): d['once'] = 1
    d['parts'] = song['parts']
    d['dr'] = song['dr']
    body = json.dumps(d, separators=(',', ':'), ensure_ascii=False)
    return (
        "// GENERATED by tools/mid2song.py from a .mid export -- DO NOT HAND-EDIT.\n"
        "// Re-export the MIDI and re-run the tool instead. (Same rule as mask2json.)\n"
        f"// id={song['id']}  bpm={song['bpm']}  len={song['len']} beats  "
        f"parts={len(song['parts'])}  drums={len(song['dr'])}\n"
        "(function(){\n"
        "  var S = (typeof SONGS!=='undefined') ? SONGS\n"
        "        : (window.SONGS = window.SONGS || {});\n"
        f"  S[{json.dumps(song['id'])}] = {body};\n"
        "})();\n"
    )

if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    flags = [a for a in sys.argv[1:] if a.startswith('--')]
    if not args:
        sys.exit("usage: py tools/mid2song.py song.mid [songId] [--humanize N] [--once]")
    path = args[0]
    if not os.path.isfile(path):
        sys.exit(f"file not found: {path}")
    song_id = args[1] if len(args) > 1 else os.path.splitext(os.path.basename(path))[0]

    hz = 6
    for f in flags:
        if f.startswith('--humanize'):
            hz = int(f.split('=')[1]) if '=' in f else 0
    once = '--once' in flags

    s = convert(path, song_id, humanize=hz, once=once)
    print(f"== {song_id} ==  bpm={s['bpm']}  len={s['len']} beats  "
          f"humanize={s['humanize']}  drums={len(s['dr'])}  "
          f"pitch_bends_dropped={s['pitch_bends_dropped']}")
    for p in s['parts']:
        print(f"   voice={p['voice']:<8} notes={len(p['n'])}")

    if not s['constant_tempo']:
        sys.exit("\n** REFUSED: tempo changes present. The beat clock needs one\n"
                 "   constant bpm. Bounce to a fixed tempo and re-export.")
    if s['pitch_bends_dropped']:
        print(f"   note: {s['pitch_bends_dropped']} pitch bends dropped "
              "(a note list can't hold continuous expression)")

    outdir = os.path.join('assets', 'songs')
    os.makedirs(outdir, exist_ok=True)
    js = os.path.join(outdir, f"{song_id}.song.js")
    with open(js, 'w', encoding='utf-8') as f:
        f.write(emit_js(s))
    with open(os.path.join(outdir, f"{song_id}.song.json"), 'w', encoding='utf-8') as f:
        json.dump(s, f, ensure_ascii=False)
    print(f"\nsaved {js}")
    print(f"NEXT: add <script src=\"assets/songs/{song_id}.song.js\"></script> to index.html\n"
          f"      (after src/core/songs.js), then Music.play('{song_id}')")
