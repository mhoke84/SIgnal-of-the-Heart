/* RADIO UNDERGROUND v2 — main.js
   Modes, boot, frame loop. PHASE 1: boot -> roam STORE-BACK-A.
   Acceptance targets (MASTER_REFERENCE §9): walk the room at 480x270,
   camera clamp, walk-behind on the shelf row, store theme, beat
   clock verified via debug pulse, 60fps.
   Debug keys (Phase 1 only): Y toggles HUD (on by default),
   T toggles room state A/B (previews BACK-B + the deskLamp overlay),
   C swaps the player sprite MIKE<->IZZY (spot-check either walk). */
/* Bump BUILD whenever main.js changes. It prints on the title screen and
   in the console. If the stamp on screen doesn't match this string, the
   browser served you a cached file:// copy -- hard-reload (Ctrl+Shift+R). */
const BUILD='2026-07-16 EARBUD-CINE-A';
const VIEW_W=480,VIEW_H=270;
const canvas=document.getElementById('screen');
canvas.width=VIEW_W;canvas.height=VIEW_H;
const cx=canvas.getContext('2d');cx.imageSmoothingEnabled=false;
function fit(){
  const s=Math.max(1,Math.min(Math.floor(innerWidth/VIEW_W),Math.floor(innerHeight/VIEW_H)));
  canvas.style.width=(VIEW_W*s)+'px';canvas.style.height=(VIEW_H*s)+'px';
}
addEventListener('resize',fit);fit();
console.log('RADIO UNDERGROUND v2 - build '+BUILD);

// debug keys ride outside KEYMAP so they can't collide with canon input
addEventListener('keydown',e=>{
  if(e.key==='y'||e.key==='Y')Game.hud=!Game.hud;
  if((e.key==='t'||e.key==='T')&&Stage.room){
    Stage.state=Stage.state==='A'?'B':'A';
    refreshMask();
    const own=Stage.dataFor()!==Stage.room;
    toast('STATE -> '+Stage.state+(own?' (OWN FLOOR)':' (SHARED FLOOR - STATE NOT PAINTED)'));
    if(!Mask.canStand(roomMask,Player.px,Player.py)) toast('WARNING: STANDING IN A SOLID CELL');
  }
  // R: hop between the back room and the store floor (Scene 2), once painted.
  if((e.key==='r'||e.key==='R')&&Game.mode==='roam'){
    const to=Stage.roomId==='STORE-BACK-A'?'STORE-INT-A':'STORE-BACK-A';
    const rm=ROOMS[to];
    if(!rm||!rm.mask){
      toast(to+': NOT PAINTED YET - RUN maskpaint THEN mask2json');
    }else{ enterRoom(to,'default'); toast('ROOM -> '+to); }
  }
  // C: cycle the player sprite through CAST (MIKE->IZZY->NOAH->SALTMAN->...) in
  // place. Debug spot-check of any character's walk in the real store. Guarded
  // on PlayerSpr so it no-ops before the sheet is built at boot.
  if((e.key==='c'||e.key==='C')&&PlayerSpr){
    playerWho=CAST[(CAST.indexOf(playerWho)+1)%CAST.length];
    PlayerSpr=buildSheet(playerWho)||BOX;
    toast('CAST -> '+playerWho);
  }
});

const Game={mode:'boot',hud:true,flags:{},t:0,introT:0};
const Player={px:0,py:0,dir:'down',step:0,anim:0};
let roomMask=null;
// which cast sheet the player wears. Debug key C cycles it through CAST so the
// producer can spot-check any character's walk in the real store without
// editing code. All four sheets are loaded + registered at boot.
const CAST=['MIKE','IZZY','NOAH','SALTMAN'];
let playerWho='MIKE';

// ---- manifest + ready gate ----
Loader.add('STORE-BACK-A','assets/backdrops/normalized/STORE-BACK-A.png');
Loader.add('STORE-BACK-B','assets/backdrops/normalized/STORE-BACK-B.png');
Loader.add('STORE-INT-A','assets/backdrops/normalized/STORE-INT-A.png');
Loader.add('STORE-INT-B','assets/backdrops/normalized/STORE-INT-B.png');
Loader.add('MIKE','assets/sprites/MIKE.sheet.png');
Loader.add('IZZY','assets/sprites/IZZY.sheet.png');
Loader.add('NOAH','assets/sprites/NOAH.sheet.png');
Loader.add('SALTMAN','assets/sprites/SALTMAN.sheet.png');
Loader.start();

/* ---- title stream: a radio tuning itself in. Not on the beat clock;
   it's a sound effect, so encoder padding is harmless here. ---- */
Stream.load('assets/music/title_screen.mp3');
Stream.play();                       // may be refused until first gesture:
addEventListener('keydown',()=>{ if(Stream.wanted&&Game.mode==='boot')Stream.play(); },{once:true});
addEventListener('pointerdown',()=>{ if(Stream.wanted&&Game.mode==='boot')Stream.play(); },{once:true});

/* ---- SCENE 1: ATTRACT MODE / OPENING CRAWL ----
   Canon text, per the producer's Scene 1 (the long crawl). Staging:
     radio tuning fades -> black -> BURSTS into 'the_journey_continues'
     -> crawl scrolls fully off screen -> black
     -> "...OR SO THEY THOUGHT." fades in centre, fades out
     -> "THIS IS THE STORY..." fades in centre
     -> song fades, the tuning returns for ~5s -> Scene 2.
   The 5x7 font is caps-only and has no ellipsis glyph, so U+2026 -> "..."
   Z skips the whole sequence at any point. */
const CRAWL=[
  "THERE WAS A TIME WHEN A SONG WAS A HANDSHAKE BETWEEN",
  "TWO HUMAN BEINGS.",
  "",
  "ONE HEART MADE IT. ANOTHER HEART RECEIVED IT.",
  "WHATEVER HAPPENED IN BETWEEN - THE RADIO, THE",
  "RECORD, THE WIRE - WAS ONLY THE ROAD IT TRAVELED.",
  "ONCE RECEIVED, THOSE TWO HEARTS WERE CONNECTED",
  "THROUGH MUTUAL UNDERSTANDING OF ONE ANOTHER. YOU HAD",
  "FELT THEIR PAIN, EXPERIENCED THEIR JOY, AND IN TURN",
  "THEY HAD TOUCHED YOUR SOUL, AND YOU WERE CHANGED",
  "FOREVER. THIS WAS OUR UNIVERSAL LANGUAGE, THE",
  "LANGUAGE OF THE HEART. MUSIC IS THE WAY AND THE",
  "LIGHT. NO BETTER TOOL EXISTS FOR SPEAKING TO YOUR",
  "ENTIRE BEING ALL AT ONCE. FROM A KID IN THEIR FEELS",
  "LAYING AWAKE IN BED, TO A FATHER STRUGGLING TO",
  "PROVIDE, EVEN THE FOOTBALL PLAYER ON THE GOAL LINE",
  "READY TO MAKE THEIR FINAL STAND AS TIME EXPIRES...",
  "",
  "A PRIMAL REPEATING CHANT COMES FROM THE",
  "STANDS.....EVEN BATTLE HAS A SONG......WE ARE ONE.",
  "",
  "THEN SOMEONE BUILT A MACHINE THAT COULD MAKE A",
  "MILLION SONGS A DAY. AND NO HEARTS WERE REQUIRED AT",
  "ALL. NO TORMENTED SOUL CRYING FOR HELP AND",
  "UNDERSTANDING. NO EXPERIENCED WISE TROUBADOUR",
  "OFFERING TO SHOW US, IT'S GOING TO BE OKAY. JUST",
  "CODE THAT WAS TAUGHT ENOUGH TO EXPLOIT US, TO LURE",
  "OUR ATTENTION FROM THE PULSE OF THE EARTH. WE LOST",
  "OUR LIGHT; WE ARE LOSING THE WAY...",
  "",
  "THE MACHINE WAS NOT EVIL. MACHINES NEVER ARE. BUT",
  "THE MAN WHO OWNED IT LEARNED SOMETHING TERRIBLE:",
  "",
  "A SONG WITH NO HEART COSTS NOTHING TO MAKE.",
  "",
  "AND IF YOU CAN BURY THE REAL ONES DEEP ENOUGH...",
  "",
  "...NO ONE WILL EVER KNOW THE DIFFERENCE."
];
const CRAWL_LH=13;
const CARD_A='...OR SO THEY THOUGHT.';
const CARD_B1='THIS IS THE STORY OF THE PEOPLE';
const CARD_B2='WHO KNEW THE DIFFERENCE.';

/* Frame marks (60fps). Speed is DERIVED from the text length, so editing
   the crawl never desyncs the timing. */
const F_TUNE_FADE = 60;                 // 1.0s: tuning ebbs to black
const F_CRAWL_IN  = 72;                 // the song bursts in, crawl rises
const CRAWL_SECS  = 72;                 // how long the crawl takes to clear
const CRAWL_H     = CRAWL.length*CRAWL_LH;
const CRAWL_SPEED = (VIEW_H+CRAWL_H)/(CRAWL_SECS*60);
const F_CRAWL_OUT = F_CRAWL_IN + Math.ceil((VIEW_H+CRAWL_H)/CRAWL_SPEED);
const F_CARD_A    = F_CRAWL_OUT + 36;   // beat of black
const F_CARD_A_END= F_CARD_A + 250;
const F_CARD_B    = F_CARD_A_END + 60;
const F_SONG_FADE = F_CARD_B + 260;     // song ebbs under the last line
const F_TUNE_BACK = F_SONG_FADE + 110;
const F_SCENE_2   = F_TUNE_BACK + 300;  // ~5s of tuning, then the store

let toasts=[];
function toast(msg){toasts.push({msg,t:0});if(toasts.length>3)toasts.shift();}

function enterScene2(){
  Stream.stop(); Music.stopAll(); Music.vol=1;
  enterRoom('STORE-INT-A','default');   // SCENE 2: the store, morning
  Music.play('main_leitmotif');         // producer's MIDI, live on the clock
  Game.mode='roam'; sfx('ok');
  toast('SCENE 2: RADIO UNDERGROUND RECORDS - ARROWS/WASD, R SWAPS ROOM');
}

function enterRoom(id,spawn,state){
  Stage.setRoom(id,state||'A');
  refreshMask();
  const sp=Stage.room.spawns[spawn]||Stage.room.spawns.default;
  Player.px=sp[0];Player.py=sp[1];Player.dir='down';
  // A spawn may legitimately sit inside its own doorway trigger (you arrive
  // standing in the door). Disarm exits until the player steps clear of every
  // trigger, or the two rooms ping-pong forever.
  Game.flags._exitArmed=false;
  Camera.follow(Player);Camera.snap();
}

/* The floor belongs to the STATE, not just the room: Scene 3's folding chairs
   are solid. Stage.dataFor() hands back whichever painted data is live. */
function refreshMask(){
  const d=Stage.dataFor();
  roomMask=Mask.decode(d, Stage.room.states? Stage.room.states[Stage.state] : Stage.roomId);
}

// ---- movement: free-pixel over the mask, 004 feel (2px/f) ----
// 8-way facing from an input delta. Pure + exported for the harness.
function dir8(dx,dy){
  if(dy<0) return dx<0?'upleft':dx>0?'upright':'up';
  if(dy>0) return dx<0?'downleft':dx>0?'downright':'down';
  return dx<0?'left':'right';
}
const SPEED=2, DIAG=Math.SQRT1_2; // per-axis *DIAG on diagonals => net SPEED
function updatePlayer(){
  let dx=0,dy=0;
  if(Keys.down.up)dy=-1;else if(Keys.down.down)dy=1;
  if(Keys.down.left)dx=-1;else if(Keys.down.right)dx=1; // independent axis => diagonals
  if(dx||dy){
    Player.dir=dir8(dx,dy);
    const sp=(dx&&dy)?SPEED*DIAG:SPEED;      // normalize diagonal speed
    const nx=Player.px+dx*sp,ny=Player.py+dy*sp;
    if(Mask.canStand(roomMask,nx,ny)){Player.px=nx;Player.py=ny;Player.step++;}
    else if(Mask.canStand(roomMask,Player.px+dx*1,Player.py+dy*1)){
      Player.px+=dx;Player.py+=dy;Player.step++; // ease into tight cells
    }else if((Player.step&7)===0)sfx('bump');
    Player.anim=[0,1,0,2][(Player.step>>3)&3];
  }else{Player.anim=0;Player.step=0;}
  // exits: walk into the trigger, arrive at the target room's named spawn.
  let inAnyExit=false;
  for(const ex of (Stage.room.exits||[])){
    const r=ex.rect;
    if(Player.px>=r[0]&&Player.px<r[0]+r[2]&&Player.py>=r[1]&&Player.py<r[1]+r[3]){
      inAnyExit=true;
      // `face` (optional, canon): you must be walking INTO the door. Stops the
      // player leaving the room while squeezing past it toward the counter.
      if(ex.face&&Player.dir!==ex.face) break;
      if(!Game.flags._exitArmed) break;          // still standing in the doorway we arrived in
      if(!ROOMS[ex.to]||!ROOMS[ex.to].mask){
        if(!Game.flags._exitHint){Game.flags._exitHint=true;
          toast(ex.to.toUpperCase()+': NOT PAINTED YET');}
        break;
      }
      enterRoom(ex.to,ex.spawn||'default');
      sfx('ok'); toast('-> '+ex.to.toUpperCase());
      Game.flags._exitHint=false;
      return;
    }
  }
  if(!inAnyExit){Game.flags._exitArmed=true;Game.flags._exitHint=false;}
  // hotspots: facing + Z gives a stub note; real ops arrive with Phase 3 runner
  if(tapped('A')){
    Keys.hit.A=false; // consume - the 004 lesson, kept
    for(const h of (Stage.room.hotspots||[])){
      const r=h.rect,cx0=Player.px,cy0=Player.py-8;
      const near=cx0>r[0]-14&&cx0<r[0]+r[2]+14&&cy0>r[1]-14&&cy0<r[1]+r[3]+48;
      if(near&&Player.dir===h.face){toast(h.id.toUpperCase()+': OP "'+h.op+'" (PHASE 3)');sfx('talk');break;}
    }
  }
}

// ---- judgement debug: any Z press gets graded against the clock ----
let lastJudge='',judgeT=0;
function pollJudge(){
  if(Keys.hit.A&&Clock.running){lastJudge=judgePress();judgeT=40;
    if(lastJudge==='PERFECT')sfx('crit');}
}

// ---- fps meter ----
let fpsT=perf(),fpsN=0,fps=0;

function update(){
  Game.t++;
  if(actx)Music.tick();
  switch(Game.mode){
    case 'boot':
      if(Loader.ready&&tapped('A')){
        initAudio();
        BOX=buildPlaceholder();
        // Mike is the player. Use his real sheet if it loaded; the box
        // placeholder stays the fallback so a missing sheet never crashes
        // the boot. buildSheet returns the same {down,up,left,right} shape.
        // playerWho drives it so the C toggle and the boot stay in sync.
        PlayerSpr=buildSheet(playerWho)||BOX;
        // the tuning keeps playing; it FADES over F_TUNE_FADE, then the
        // song bursts in. See the Scene 1 staging notes above.
        Game.mode='intro';Game.introT=0;
      }
      break;
    case 'intro':{
      const T=Game.introT++;
      // 1. the radio tuning ebbs away to black
      if(T<F_TUNE_FADE) Stream.setVol(0.55*(1-T/F_TUNE_FADE));
      // 2. ...and the song BURSTS in
      if(T===F_TUNE_FADE){ Stream.stop(); Stream.setVol(0.55); }
      if(T===F_CRAWL_IN) Music.play('the_journey_continues');
      // 3. under the last card, the song ebbs out
      if(T>=F_SONG_FADE&&T<F_TUNE_BACK)
        Music.vol=Math.max(0,1-(T-F_SONG_FADE)/(F_TUNE_BACK-F_SONG_FADE));
      // 4. the tuning returns, alone, for about five seconds
      if(T===F_TUNE_BACK){ Music.stopAll(); Music.vol=1; Stream.play(); }
      // 5. into the store
      if(T>=F_SCENE_2||tapped('A')) enterScene2();
      break;}
    case 'roam':
      pollJudge();
      updatePlayer();
      Camera.update();
      break;
  }
  for(const t of toasts)t.t++;
  toasts=toasts.filter(t=>t.t<220);
  if(judgeT>0)judgeT--;
  clearHits();
}

function drawHUD(){
  // beat pulse: the spinning 45 from the title screen, demoted to debug duty
  const ph=Clock.running?Clock.phase():0;
  cx.fillStyle='#111';cx.beginPath();cx.arc(24,VIEW_H-24,11,0,7);cx.fill();
  cx.fillStyle=ph<0.18?HUE.glow:HUE.amberDeep;
  cx.beginPath();cx.arc(24,VIEW_H-24,ph<0.18?8:6,0,7);cx.fill();
  cx.fillStyle='#111';cx.beginPath();cx.arc(24,VIEW_H-24,2,0,7);cx.fill();
  text('BPM '+Clock.bpm,42,VIEW_H-31,HUE.cream);
  text('FPS '+fps,42,VIEW_H-21,fps>=57?HUE.green:HUE.red);
  text('P '+Math.round(Player.px)+','+Math.round(Player.py)+
       '  CAM '+Camera.ix()+','+Camera.iy()+'  ST '+Stage.state,42,VIEW_H-11,'#9a8c72');
  if(judgeT>0){
    const col=lastJudge==='PERFECT'?HUE.glow:lastJudge==='GOOD'?HUE.green:HUE.grey;
    textC(lastJudge+' ('+Math.round(Clock.msOffBeat())+'MS)',VIEW_W/2,20,col);
  }
  text('Z BEAT-CHECK  T STATE  Y HUD  C CAST',VIEW_W-224,VIEW_H-11,'#66573f');
}

function draw(){
  cx.fillStyle='#000';cx.fillRect(0,0,VIEW_W,VIEW_H);
  switch(Game.mode){
    case 'boot':
      textC('87.9',VIEW_W/2,86,HUE.amber,3);
      textC('RADIO UNDERGROUND',VIEW_W/2,124,HUE.amberDeep,2);
      textC('PHASE 1: THE STAGE',VIEW_W/2,150,'#9a8c72');
      if(!Loader.ready)textC('LOADING ROOMS...',VIEW_W/2,190,'#66573f');
      else if((perf()/500|0)%2===0)textC('PRESS Z',VIEW_W/2,190,HUE.cream);
      textC('TURN YOUR SOUND ON',VIEW_W/2,224,'#66573f');
      text('BUILD '+BUILD,6,VIEW_H-10,'#4a3f2e');
      break;
    case 'intro':{
      const T=Game.introT;
      // the crawl rises out of the bottom and scrolls entirely off the top
      if(T>=F_CRAWL_IN&&T<F_CARD_A){
        const scroll=VIEW_H-(T-F_CRAWL_IN)*CRAWL_SPEED;
        for(let i=0;i<CRAWL.length;i++){
          if(!CRAWL[i])continue;
          const y=scroll+i*CRAWL_LH;
          if(y<-CRAWL_LH||y>VIEW_H)continue;
          let a=1;                                   // arrive and leave, never pop
          if(y>VIEW_H-46)a=Math.max(0,(VIEW_H-y)/46);
          if(y<40)a=Math.max(0,y/40);
          cx.globalAlpha=a;textC(CRAWL[i],VIEW_W/2,y,HUE.cream);cx.globalAlpha=1;
        }
      }
      // "...OR SO THEY THOUGHT."  fades in centre, then fades away
      if(T>=F_CARD_A&&T<F_CARD_B){
        const t=T-F_CARD_A, span=F_CARD_A_END-F_CARD_A;
        let a=Math.min(1,t/40);
        if(t>span-40)a=Math.max(0,(span-t)/40);
        if(T>=F_CARD_A_END)a=0;
        cx.globalAlpha=a;textC(CARD_A,VIEW_W/2,VIEW_H/2-4,HUE.cream);cx.globalAlpha=1;
      }
      // "THIS IS THE STORY OF THE PEOPLE WHO KNEW THE DIFFERENCE."
      if(T>=F_CARD_B){
        const a=Math.min(1,(T-F_CARD_B)/50);
        cx.globalAlpha=a;
        textC(CARD_B1,VIEW_W/2,VIEW_H/2-12,HUE.cream);
        textC(CARD_B2,VIEW_W/2,VIEW_H/2+4,HUE.cream);
        cx.globalAlpha=1;
      }
      if(T>90&&T<F_CARD_A&&(perf()/500|0)%2===0)
        text('Z SKIP',VIEW_W-46,VIEW_H-12,'#4a3f2e');
      break;}
    case 'roam':{
      const spr={img:(PlayerSpr||BOX)[Player.dir][Player.anim],px:Player.px,py:Player.py};
      Stage.draw(cx,[spr],Game.t);
      // 6. UI layer, camera-independent
      toasts.forEach((t,i)=>{
        const a=t.t<20?t.t/20:(t.t>190?(220-t.t)/30:1);
        cx.fillStyle='rgba(16,10,6,'+(0.75*a).toFixed(2)+')';
        cx.fillRect(8,8+i*14,6*t.msg.length+8,12);
        cx.fillStyle='rgba(232,217,184,'+a.toFixed(2)+')';
        text(t.msg,12,10+i*14,cx.fillStyle);
      });
      if(Game.hud)drawHUD();
      break;}
  }
}

function frame(){
  update();draw();
  fpsN++;const now=perf();
  if(now-fpsT>=1000){fps=fpsN;fpsN=0;fpsT=now;}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
