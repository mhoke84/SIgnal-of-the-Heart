/* RADIO UNDERGROUND v2 — core/input.js
   Keys + tapped/consume pattern. Gamepad support: Phase TBD (later).
   Ported VERBATIM from reference_build004.html (logic source of truth).
   Plain script, global scope, loaded in order by index.html. */
// ---------------- INPUT ----------------
const Keys={down:{},hit:{}};
const KEYMAP={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',
  ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',
  z:'A',Z:'A',Enter:'A',x:'B',X:'B',Escape:'B'};
addEventListener('keydown',e=>{
  const k=KEYMAP[e.key]; if(!k) return;
  e.preventDefault();
  if(!Keys.down[k]) Keys.hit[k]=true;
  Keys.down[k]=true;
});
addEventListener('keyup',e=>{ const k=KEYMAP[e.key]; if(k) Keys.down[k]=false; });
function tapped(k){ return !!Keys.hit[k]; }
function clearHits(){ Keys.hit={}; }
