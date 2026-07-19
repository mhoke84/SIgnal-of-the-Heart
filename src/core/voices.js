/* RADIO UNDERGROUND v2 — core/voices.js
   THE SESSION PLAYERS. Expanded real-time voices for imported songs.
   NEW for v2 (not in Build 004) — audio.js stays a verbatim port, so
   every legacy track still sounds exactly like the reference build.
   Imported .song.js tracks (songs marked imported:1) route HERE instead.

   Constraint: only the Web Audio nodes the harness shims exist —
   Gain, Oscillator, BufferSource, BiquadFilter, Buffer. No detune,
   no convolver, no panner. Everything below obeys that.

   One clock, one master: these functions never schedule themselves.
   They are handed an absolute audio-clock time `t` by the sequencer
   and they book against it. Nothing here reads currentTime. */

function _adsr(g, t, len, vel, a, d, s, r){
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vel, t+a);
  g.gain.linearRampToValueAtTime(Math.max(0.0002, vel*s), t+a+d);
  g.gain.setValueAtTime(Math.max(0.0002, vel*s), Math.max(t+a+d, t+len-r));
  g.gain.linearRampToValueAtTime(0.0001, t+len+r);
}
function _osc(wave, hz, t, stop){
  const o=actx.createOscillator();
  o.type=wave; o.frequency.value=hz; o.start(t); o.stop(stop);
  return o;
}

/* FM pair: modulator -> carrier.frequency. The bell/piano family. */
function _fm(hz, ratio, index, t, len, vel, decay, out){
  const car=_osc('sine', hz, t, t+len+0.3);
  const mod=_osc('sine', hz*ratio, t, t+len+0.3);
  const mg=actx.createGain();
  mg.gain.setValueAtTime(hz*index, t);
  mg.gain.exponentialRampToValueAtTime(Math.max(1, hz*index*0.02), t+decay);
  mod.connect(mg); mg.connect(car.frequency);
  const g=actx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vel, t+0.006);
  g.gain.exponentialRampToValueAtTime(0.0005, t+len+0.25);
  car.connect(g); g.connect(out||master);
}

/* voice table. midi -> sound, scheduled at absolute time t. */
function vVoice(voice, midi, t, len, vel){
  if(!actx) return;
  const hz=midiF(midi), L=Math.max(0.05, len);
  switch(voice){
    case 'piano':                       // upright: bright hit, fast decay
      _fm(hz, 3.0, 1.6, t, Math.min(L, 2.2), vel*0.9, 0.11); break;
    case 'epiano':                      // Rhodes: tine ping over a soft body
      _fm(hz, 14.0, 0.30, t, Math.min(L, 2.6), vel*0.55, 0.07);
      _fm(hz, 1.0, 0.9, t, Math.min(L, 2.6), vel*0.75, 0.30); break;
    case 'bell':
      _fm(hz, 3.5, 2.4, t, Math.min(L+0.6, 3.0), vel*0.7, 0.5); break;
    case 'bass':{                       // sine body + filtered saw grit
      const o1=_osc('sine', hz, t, t+L+0.1);
      const o2=_osc('sawtooth', hz, t, t+L+0.1);
      const f=actx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=Math.min(900, hz*6);
      const g2=actx.createGain(); g2.gain.value=0.35; o2.connect(g2); g2.connect(f);
      const g=actx.createGain(); _adsr(g, t, L, vel*0.95, 0.010, 0.05, 0.75, 0.045);
      o1.connect(g); f.connect(g); g.connect(master); break;}
    case 'strings':{                    // two detuned saws, slow bow, dark
      const o1=_osc('sawtooth', hz*0.997, t, t+L+0.3);
      const o2=_osc('sawtooth', hz*1.003, t, t+L+0.3);
      const f=actx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=2400;
      const g=actx.createGain(); _adsr(g, t, L, vel*0.30, 0.055, 0.10, 0.85, 0.18);
      o1.connect(f); o2.connect(f); f.connect(g); g.connect(master); break;}
    case 'brass':{                      // saw with an opening filter = the blat
      const o=_osc('sawtooth', hz, t, t+L+0.15);
      const f=actx.createBiquadFilter(); f.type='lowpass'; f.Q.value=1.2;
      f.frequency.setValueAtTime(700, t);
      f.frequency.linearRampToValueAtTime(Math.min(5200, hz*7+1400), t+0.07);
      const g=actx.createGain(); _adsr(g, t, L, vel*0.36, 0.020, 0.06, 0.80, 0.09);
      o.connect(f); f.connect(g); g.connect(master); break;}
    case 'reed':{                       // clarinet-ish: hollow square, soft edge
      const o=_osc('square', hz, t, t+L+0.15);
      const f=actx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=Math.min(3200, hz*5);
      const g=actx.createGain(); _adsr(g, t, L, vel*0.28, 0.035, 0.05, 0.90, 0.08);
      o.connect(f); f.connect(g); g.connect(master); break;}
    case 'organ':{                      // drawbar: fundamental + octave + fifth
      const g=actx.createGain(); _adsr(g, t, L, vel*0.26, 0.006, 0.02, 0.95, 0.03);
      [[1,1],[2,0.5],[3,0.25]].forEach(([m,a])=>{
        const o=_osc('sine', hz*m, t, t+L+0.08);
        const ga=actx.createGain(); ga.gain.value=a; o.connect(ga); ga.connect(g);});
      g.connect(master); break;}
    default:{                           // 'lead' — the one that carries a tune
      const o1=_osc('square', hz, t, t+L+0.12);
      const o2=_osc('sawtooth', hz*1.004, t, t+L+0.12);
      const g2=actx.createGain(); g2.gain.value=0.30; o2.connect(g2);
      const f=actx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=Math.min(4200, hz*8);
      const g=actx.createGain(); _adsr(g, t, L, vel*0.34, 0.012, 0.05, 0.85, 0.07);
      o1.connect(f); g2.connect(f); f.connect(g); g.connect(master);}
  }
}

/* Imported-song kit. Legacy tracks keep vDrum() — Build 004 is Build 004. */
function vDrumX(type, t, vel){
  if(!actx) return;
  if(type==='k'){
    const o=actx.createOscillator(), g=actx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(48, t+0.08);
    g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.001, t+0.20);
    o.connect(g); g.connect(master); o.start(t); o.stop(t+0.22);
    const s=actx.createBufferSource(), cg=actx.createGain(), cf=actx.createBiquadFilter();
    s.buffer=noiseBuf; cf.type='highpass'; cf.frequency.value=3000;
    cg.gain.setValueAtTime(vel*0.35, t); cg.gain.exponentialRampToValueAtTime(0.001, t+0.012);
    s.connect(cf); cf.connect(cg); cg.connect(master); s.start(t); s.stop(t+0.03);
  }else if(type==='tom'){
    const o=actx.createOscillator(), g=actx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(190, t);
    o.frequency.exponentialRampToValueAtTime(95, t+0.10);
    g.gain.setValueAtTime(vel*0.85, t); g.gain.exponentialRampToValueAtTime(0.001, t+0.18);
    o.connect(g); g.connect(master); o.start(t); o.stop(t+0.20);
  }else if(type==='s'){                 // body tone + band-passed rattle
    const o=actx.createOscillator(), og=actx.createGain();
    o.type='triangle'; o.frequency.value=190;
    og.gain.setValueAtTime(vel*0.45, t); og.gain.exponentialRampToValueAtTime(0.001, t+0.07);
    o.connect(og); og.connect(master); o.start(t); o.stop(t+0.09);
    const s=actx.createBufferSource(), g=actx.createGain(), f=actx.createBiquadFilter();
    s.buffer=noiseBuf; s.loop=true; f.type='bandpass'; f.frequency.value=2600; f.Q.value=0.7;
    g.gain.setValueAtTime(vel*0.85, t); g.gain.exponentialRampToValueAtTime(0.001, t+0.11);
    s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t+0.13);
  }else{                                // 'h'
    const s=actx.createBufferSource(), g=actx.createGain(), f=actx.createBiquadFilter();
    s.buffer=noiseBuf; s.loop=true; f.type='highpass'; f.frequency.value=7800;
    g.gain.setValueAtTime(vel*0.42, t); g.gain.exponentialRampToValueAtTime(0.001, t+0.035);
    s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t+0.05);
  }
}

/* ---------------- THE NEEDLE DROP ----------------
   Streamed audio (title-screen mp3). Deliberately NOT on the beat
   clock and NOT in the Web Audio graph: it's a sound effect with no
   bearing on gameplay, so encoder padding can't hurt anything.
   Uses <audio src> (works over file://, same as <img>) — never fetch(),
   which file:// forbids. Harness has no Audio element; guard for it. */
const Stream={
  el:null, url:'', wanted:false,
  load(url){ this.url=url;
    if(typeof Audio==='undefined') return;      // headless
    this.el=new Audio(); this.el.src=url; this.el.loop=true; this.el.volume=0.55;
    this.el.preload='auto';
  },
  play(){ this.wanted=true; if(!this.el) return;
    const p=this.el.play();
    // Autoplay policy: a browser may refuse until the first gesture.
    if(p&&p.catch) p.catch(()=>{ /* retried by main.js on first input */ });
  },
  stop(){ this.wanted=false; if(!this.el) return;
    try{ this.el.pause(); this.el.currentTime=0; }catch(e){}
  },
  // Scene 1 ebbs the tuning to black, then brings it back under the last card.
  setVol(v){ if(!this.el) return; this.el.volume=Math.max(0,Math.min(1,v)); }
};
