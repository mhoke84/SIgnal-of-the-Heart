/* RADIO UNDERGROUND v2 — core/audio.js
   Synth voices, sfx, vinyl crackle. Human tracks breathe; Copy Cat does not.
   Ported VERBATIM from reference_build004.html (logic source of truth).
   Plain script, global scope, loaded in order by index.html. */
let actx=null, master=null, noiseBuf=null;
function initAudio(){
  if(actx) return;
  const AC=window.AudioContext||window.webkitAudioContext;
  actx=new AC();
  master=actx.createGain(); master.gain.value=0.42; master.connect(actx.destination);
  // one shared noise buffer for drums & vinyl crackle
  noiseBuf=actx.createBuffer(1,actx.sampleRate,actx.sampleRate);
  const d=noiseBuf.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
}


/* ---------------- THE INSTRUMENTS ----------------
   SNES-SPC-flavored: pulse leads, triangle warmth, noise drums.
   Human tracks get humanize() — a few ms of drift and breath.
   Copy Cat tracks get ZERO drift. Perfectly quantized, perfectly
   hollow. That difference is the entire game in one audio
   design decision, so it lives here, in the scheduler, on purpose. */
function midiF(m){ return 440*Math.pow(2,(m-69)/12); }
function vNote(wave,midi,t,len,vel){
  const o=actx.createOscillator(), g=actx.createGain();
  o.type=wave; o.frequency.value=midiF(midi);
  const a=0.008, rel=Math.min(0.08,len*0.3);
  g.gain.setValueAtTime(0.0001,t);
  g.gain.linearRampToValueAtTime(vel,t+a);
  g.gain.setValueAtTime(vel*0.8,Math.max(t+a,t+len-rel));
  g.gain.linearRampToValueAtTime(0.0001,t+len);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t+len+0.02);
}
function vDrum(type,t,vel){
  if(type==='k'){ // kick: sine drop
    const o=actx.createOscillator(),g=actx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(120,t);
    o.frequency.exponentialRampToValueAtTime(40,t+0.09);
    g.gain.setValueAtTime(vel,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.12);
    o.connect(g); g.connect(master); o.start(t); o.stop(t+0.14);
  }else{ // 's' snare / 'h' hat: filtered noise
    const s=actx.createBufferSource(),g=actx.createGain(),f=actx.createBiquadFilter();
    s.buffer=noiseBuf; s.loop=true;
    f.type='highpass'; f.frequency.value=type==='h'?6500:1800;
    const dur=type==='h'?0.03:0.09;
    g.gain.setValueAtTime(vel*(type==='h'?0.5:0.9),t);
    g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t+dur+0.02);
  }
}
// vinyl crackle for the attract mode — a held breath before the show
let crackleNode=null;
function crackle(on){
  if(on&&!crackleNode){
    const s=actx.createBufferSource(),g=actx.createGain(),f=actx.createBiquadFilter();
    s.buffer=noiseBuf;s.loop=true;f.type='bandpass';f.frequency.value=4000;f.Q.value=0.4;
    g.gain.value=0.018;s.connect(f);f.connect(g);g.connect(master);s.start();
    crackleNode={s,g};
  }else if(!on&&crackleNode){ crackleNode.g.gain.linearRampToValueAtTime(0.0001,actx.currentTime+0.4);
    crackleNode.s.stop(actx.currentTime+0.5); crackleNode=null; }
}


// tiny stingers
function sfx(kind){
  if(!actx) return; const t=actx.currentTime;
  if(kind==='talk') vNote('square',79,t,0.05,0.12);
  else if(kind==='ok') {vNote('square',72,t,0.06,0.15);vNote('square',79,t+0.07,0.09,0.15);}
  else if(kind==='bump') vDrum('s',t,0.25);
  else if(kind==='crit'){vNote('square',84,t,0.05,0.2);vNote('square',88,t+0.05,0.05,0.2);vNote('square',91,t+0.1,0.12,0.22);}
  else if(kind==='hit') vDrum('k',t,0.6);
  else if(kind==='miss') vNote('square',50,t,0.15,0.15);
  else if(kind==='heal'){vNote('triangle',76,t,0.08,0.2);vNote('triangle',83,t+0.09,0.14,0.2);}
  else if(kind==='pick'){vNote('triangle',67,t,0.1,0.22);vNote('triangle',74,t+0.1,0.1,0.22);vNote('triangle',79,t+0.2,0.2,0.24);}
  else if(kind==='alarm'){vNote('square',66,t,0.18,0.2);vNote('square',66,t+0.25,0.18,0.2);}
}

/* ================================================================
   SIDE A, TRACK 3: THE PIXELS
   Hand-set 5x7 bitmap font (all caps, very 1995) and hand-pixeled
   sprites in the FFVI proportion — 16x24, tall enough to act.
   Likeness rules from the art bible + reference photos:
     MIKE   sandy crop, stubble, red flannel over dark tee.
     IZZY   long brown hair, grey cardigan, headphones AROUND NECK
            at all times from Scene 5 on. Non-negotiable.
     NOAH   blond mop with a fringe, white band tee, slip-ons.
     SALTMAN dark curls, blue henley — per the provided reference
            photo (Al.jpg represents Saltman; art-direction note
            from the producer, logged in the DEVLOG).
     DUKE   never fully seen. A silhouette in a hat. Keep it dark.
   ================================================================ */

// ---- 5x7 FONT ---- (each glyph: 7 rows of 5 bits, MSB = left)
