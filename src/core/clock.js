/* RADIO UNDERGROUND v2 — core/clock.js
   BeatClock + judgement windows. THE one non-negotiable.
   Ported VERBATIM from reference_build004.html (logic source of truth).
   Plain script, global scope, loaded in order by index.html. */
/* ================================================================
   SIDE A, TRACK 2: THE BEAT CLOCK  (the one non-negotiable)
   Appendix E says build this first and fake nothing, so: everything
   below reads time straight off the Web Audio hardware clock.
   Gameplay never keeps its own tempo — it ASKS the music.
   On-beat criticals, the corn maze, the needle drop: all of them
   call Clock.msOffBeat() and nothing else.
   ================================================================ */
const Clock={
  bpm:112, t0:0, running:false, lastWholeBeat:-1,
  start(bpm){ this.bpm=bpm; this.t0=actx.currentTime+0.06; this.lastWholeBeat=-1; this.running=true; },
  stop(){ this.running=false; },
  beatLen(){ return 60/this.bpm; },
  pos(t){ if(!this.running) return 0;
    return ((t===undefined?actx.currentTime:t)-this.t0)/this.beatLen(); },
  // How far (ms) is time t from the NEAREST beat? The whole game
  // hangs off this one function. Treat it kindly.
  msOffBeat(t){ if(!this.running) return 9999;
    const p=this.pos(t); return Math.abs(p-Math.round(p))*this.beatLen()*1000; },
  // 0..1 phase within the current beat (for pulsing UI)
  phase(){ const p=this.pos(); return p-Math.floor(p); }
};
// Judgement windows. PERFECT = the crit. GOOD = you're in the band.
const WIN_PERFECT=70, WIN_GOOD=125;
function judgePress(){
  const ms=Clock.msOffBeat();
  return ms<=WIN_PERFECT?'PERFECT':(ms<=WIN_GOOD?'GOOD':'OFF');
}
