/* RADIO UNDERGROUND v2 — core/songs.js
   The seven-song book + lookahead sequencer. One clock, one master.
   Ported VERBATIM from reference_build004.html (logic source of truth).
   Plain script, global scope, loaded in order by index.html. */
/* ---------------- THE SONGBOOK ----------------
   Original tunes, written in note lists: [beat, midi, lengthBeats, vel].
   All human tracks: humanize>0 (drift, breath). Copy Cat: humanize:0.
   Comment your code like liner notes — so, credits:
     'main'    the leitmotif. Warm heartland, G major. Mike's tune,
               which means it's everybody's tune by the end.
     'store'   morning shuffle for pricing 45s.
     'copycat' the tower. Pretty, dead, exactly on the grid.
     'battle'  the store turntable, but somebody turned it UP.
     'muzak'   the corn-field jingle. Cold. Its DOWNBEAT moves walls.
     'boss'    Jingle-Bot 9000, a jingle gone feral.
     'victory' eight beats of earned brass (ok, pulse) fanfare.    */
const SONGS={
  main:{bpm:112,len:32,humanize:9,drums:1,parts:[
    {w:'triangle',v:0.30,n:[[0,71,1],[1,74,.5],[1.5,71,.5],[2,67,1],[3,69,1],
      [4,69,1.5],[5.5,66,.5],[6,62,2],[8,64,1],[9,67,1],[10,71,1],[11,76,1],
      [12,74,2],[14,72,1],[15,69,1],[16,71,1],[17,74,.5],[17.5,76,.5],[18,79,2],
      [20,78,1],[21,74,1],[22,71,2],[24,72,1],[25,71,1],[26,69,1],[27,67,1],
      [28,67,3.5]]},
    {w:'square',v:0.12,n:[[0,43,.9],[2,50,.9],[4,50,.9],[6,45,.9],[8,52,.9],[10,52,.9],
      [12,48,.9],[14,50,.9],[16,43,.9],[18,50,.9],[20,52,.9],[22,47,.9],
      [24,48,.9],[26,50,.9],[28,43,1.8],[30,43,1.8]]}],
    dr:[[0,'k'],[1,'h'],[2,'s'],[3,'h'],[4,'k'],[5,'h'],[6,'s'],[7,'h']] , drLoop:8},
  store:{bpm:96,len:16,humanize:11,parts:[
    {w:'triangle',v:0.24,n:[[0,67,1.5],[2,69,1],[3,71,1],[4,74,2],[6,71,1],
      [8,72,1.5],[10,71,1],[11,69,1],[12,67,3]]},
    {w:'square',v:0.10,n:[[0,43,1],[2,47,1],[4,48,1],[6,50,1],[8,45,1],[10,48,1],[12,43,1],[14,50,1]]}],
    dr:[[0,'k'],[2,'s'],[3.5,'h'],[4,'k'],[6,'s']],drLoop:8},
  // Copy Cat product. Note humanize:0 — no drift, no breath, no
  // mercy. It should sound ALMOST good. That "almost" is the villain.
  copycat:{bpm:120,len:16,humanize:0,parts:[
    {w:'square',v:0.16,n:(()=>{const a=[];for(let b=0;b<16;b+=0.5){
      const arp=[72,76,79,76]; a.push([b,arp[(b*2)%4|0]+(b>=8?-3:0),0.45]);}return a;})()},
    {w:'square',v:0.09,n:[[0,48,4],[4,48,4],[8,45,4],[12,43,4]]}],
    dr:[[0,'k'],[1,'h'],[2,'k'],[3,'h']],drLoop:4},
  battle:{bpm:132,len:16,humanize:7,parts:[
    {w:'square',v:0.20,n:[[0,64,.5],[.5,67,.5],[1,69,.5],[1.5,71,1],[3,69,.5],[3.5,67,.5],
      [4,64,1],[5,62,.5],[5.5,64,.5],[6,67,1.5],[8,71,.5],[8.5,74,.5],[9,76,1],[10.5,74,.5],
      [11,71,1],[12,69,.5],[12.5,67,.5],[13,64,1],[14,62,2]]},
    {w:'sawtooth',v:0.10,n:(()=>{const a=[];const r=[40,40,45,45,43,43,47,47];
      for(let b=0;b<16;b+=1){a.push([b,r[(b/2|0)%8],.45]);a.push([b+.5,r[(b/2|0)%8],.4]);}return a;})()}],
    dr:[[0,'k'],[0.5,'h'],[1,'s'],[1.5,'h'],[2,'k'],[2.5,'k'],[3,'s'],[3.5,'h']],drLoop:4},
  muzak:{bpm:100,len:16,humanize:0,parts:[
    {w:'square',v:0.15,n:[[0,76,.4],[1,72,.4],[2,76,.4],[3,72,.4],[4,77,.4],[5,74,.4],[6,77,.4],[7,74,.4],
      [8,76,.4],[9,72,.4],[10,76,.4],[11,72,.4],[12,74,.4],[13,71,.4],[14,72,1.6]]},
    {w:'square',v:0.08,n:[[0,48,2],[2,52,2],[4,50,2],[6,53,2],[8,48,2],[10,52,2],[12,43,2],[14,48,2]]}],
    // Loud, obvious downbeat kick — the maze literally moves to it.
    dr:[[0,'k'],[1,'h'],[2,'h'],[3,'h']],drLoop:4},
  boss:{bpm:126,len:16,humanize:0,parts:[
    {w:'square',v:0.18,n:[[0,69,.5],[1,69,.5],[1.5,72,.5],[2,76,.5],[3,75,.5],[3.5,76,.5],
      [4,72,1],[5,69,.5],[6,65,1],[8,69,.5],[9,69,.5],[9.5,72,.5],[10,77,.5],[11,76,.5],
      [11.5,74,.5],[12,72,.5],[13,71,.5],[14,69,1.5]]},
    {w:'sawtooth',v:0.11,n:(()=>{const a=[];for(let b=0;b<16;b++)a.push([b,b%2?52:45,.45]);return a;})()}],
    dr:[[0,'k'],[1,'s'],[2,'k'],[3,'s']],drLoop:4},
  victory:{bpm:120,len:8,humanize:8,once:1,parts:[
    {w:'square',v:0.22,n:[[0,67,.4],[0.5,71,.4],[1,74,.4],[1.5,79,1.2],[3,78,.5],[3.5,79,2.5]]},
    {w:'triangle',v:0.18,n:[[0,55,1],[1,59,1],[2,62,1],[3,67,3]]}],
    dr:[[0,'k'],[1,'s'],[2,'k'],[3,'s']],drLoop:8}
};

/* ---------------- THE SEQUENCER ----------------
   Classic lookahead scheduler: a short timer walks a pointer of
   events and books them on the audio clock ~180ms early.
   Gameplay beat events are polled off Clock in update(). One clock.
   Two masters is how you get a band that can't find the one.     */
const Music={
  name:'', song:null, evts:[], ptr:0, loopBeat:0, vol:1,
  play(name){
    if(!actx||this.name===name) return;
    this.name=name; this.song=SONGS[name];
    Clock.start(this.song.bpm);
    // flatten parts + drums into one sorted event list
    const ev=[];
    // legacy parts carry w:'square'; imported parts carry voice:'epiano'.
    for(const p of this.song.parts)
      for(const n of p.n) ev.push({b:n[0],type:'n',w:p.w,voice:p.voice,m:n[1],l:n[2],v:p.v*(n[3]||1)});
    if(this.song.dr){
      const L=this.song.drLoop||4;
      for(let b=0;b<this.song.len;b+=L)
        for(const d of this.song.dr) if(b+d[0]<this.song.len) ev.push({b:b+d[0],type:'d',k:d[1]});
    }
    ev.sort((a,b)=>a.b-b.b);
    this.evts=ev; this.ptr=0; this.loopBeat=0;
  },
  stopAll(){ this.name=''; this.song=null; Clock.stop(); },
  tick(){
    if(!actx||!this.song) return;
    const horizon=actx.currentTime+0.18, bl=Clock.beatLen();
    let guard=0;
    while(guard++<200){
      if(this.ptr>=this.evts.length){
        if(this.song.once){ this.song=null; return; }
        this.ptr=0; this.loopBeat+=this.song.len;
      }
      const e=this.evts[this.ptr];
      const t=Clock.t0+(this.loopBeat+e.b)*bl;
      if(t>horizon) break;
      this.ptr++;
      if(t<actx.currentTime-0.02) continue; // missed the bus; catch the next
      // humanize: the breath in human hands. Copy Cat gets none.
      const hz=this.song.humanize||0;
      const dt=hz? (Math.random()*2-1)*hz/1000 : 0;
      const dv=hz? (0.9+Math.random()*0.2) : 1;
      // Imported (.song.js) tracks play the session players; Build 004's
      // seven tracks still play Build 004's oscillators. Same clock, both.
      if(e.type==='n'){
        if(e.voice) vVoice(e.voice,e.m,t+dt,e.l*bl,e.v*dv*this.vol);
        else vNote(e.w,e.m,t+dt,e.l*bl,e.v*dv*this.vol);
      }else{
        if(this.song.imported) vDrumX(e.k,t+dt,0.5*dv*this.vol);
        else vDrum(e.k,t+dt,0.5*dv*this.vol);
      }
    }
  }
};
