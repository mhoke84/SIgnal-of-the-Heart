/* RADIO UNDERGROUND v2 — game/sprites.js
   32x48 sprite compiler. makeSprite ported VERBATIM from build 004
   (the row-length validator is the unicode-ghost rule's front line —
   three real catches so far; it logs, it never hides).
   PHASE 1 ships ONE placeholder: a 32x48 box-sprite with facing marks
   and a proper baseline, so the compositor, mask, camera and walk-
   behind can be proven in the room before any real cast art exists.
   The real cast arrives in Phase 2 via tools/gen_sprites.py. */
/* 8-direction facing set. The first four are the original cardinals and
   remain the ONLY rows a 4-row sheet needs. The four diagonals are added
   for d-pad / two-key movement; until a character ships diagonal art,
   every builder aliases each diagonal to a cardinal (below) so Player.dir
   can never index a missing facing. */
const DIRS8=['down','up','left','right','downleft','downright','upleft','upright'];
const DIAG_FALLBACK={downleft:'left',downright:'right',upleft:'left',upright:'right'};

function makeSprite(rows,pal){
  const h=rows.length,w=rows[0].length;
  const c=document.createElement('canvas');c.width=w;c.height=h;
  const g=c.getContext('2d');
  rows.forEach((row,y)=>{
    if(row.length!==w)console.warn('sprite row',y,'len',row.length,'want',w);
    for(let x=0;x<row.length&&x<w;x++){const k=row[x];
      if(k!=='.'&&pal[k]){g.fillStyle=pal[k];g.fillRect(x,y,1,1);}}
  });
  return c;
}

/* Placeholder pixel-strings are generated, not hand-typed, so every
   row is provably 32 chars — same validation discipline, tiny scale.
   o = 1px dark warm outline (backdrops outline their props the same
   way — BRIEF §5), b = body fill, f = facing mark, e = "eye" dots. */
const PLACEHOLDER_PAL={o:'#2a1a10',b:'#c9a83f',f:'#7a5233',e:'#1a120c'};
function buildPlaceholder(){
  function frame(dir,step){
    const W=32,H=48,rows=[];
    for(let y=0;y<H;y++){
      let r='';
      for(let x=0;x<W;x++){
        const inBody=x>=6&&x<26&&y>=2&&y<46;
        const edge=inBody&&(x===6||x===25||y===2||y===45);
        // legs alternate on walk frames: notch the baseline row-block
        const legGap=step===1?(x>=14&&x<18&&y>=40):(step===2?(x>=10&&x<14&&y>=40)||(x>=18&&x<22&&y>=40):false);
        let k='.';
        if(inBody&&!legGap)k=edge?'o':'b';
        // facing marks
        if(dir==='down'&&y>=12&&y<16&&(x===12||x===13||x===18||x===19))k='e';
        if(dir==='up'&&y>=6&&y<10&&x>=13&&x<19)k='f';
        if(dir==='left'&&y>=12&&y<16&&x>=8&&x<12)k='e';
        if(dir==='right'&&y>=12&&y<16&&x>=20&&x<24)k='e';
        if(dir==='left'&&y>=20&&y<24&&x>=7&&x<11)k='f';
        if(dir==='right'&&y>=20&&y<24&&x>=21&&x<25)k='f';
        r+=k;
      }
      rows.push(r);
    }
    return rows;
  }
  const S={};
  for(const d of['down','up','left','right']){
    S[d]=[0,1,0,2].map(st=>makeSprite(frame(d,st),PLACEHOLDER_PAL));
  }
  // diagonals alias to a cardinal so the box never misses a facing
  for(const d in DIAG_FALLBACK) S[d]=S[DIAG_FALLBACK[d]];
  return S;
}
let BOX=null; // built after boot (needs document)
let PlayerSpr=null; // Mike's real sheet, or BOX until/if the sheet is missing

/* ---------------- PRODUCER-SUPPLIED SPRITE SHEETS ----------------
   The constitution now covers sprites the way it covers backdrops:
   the producer draws them, the engine composites them. A sheet is one
   PNG per character, cut into 32x48 cells.

     rows = facings, ALWAYS in this order:  down, up, left, right
     cols = frames:  0 stand, 1 stepA, 2 stepB, 3.. optional idle

   Slicing happens once at load into per-frame canvases, so stage.js
   keeps calling drawImage(frame,x,y) and never learns a new trick.
   Nothing reads pixels, so file:// canvas taint is a non-issue.

   Sheets are validated and registered by tools/sprite_intake.py, which
   writes assets/sprites/<ID>.sprite.js -> SPRITE_SHEETS[ID].
   The registry hangs off `window` so it does not matter whether the
   sheet scripts load before or after this file. (A `const X = typeof X
   !== 'undefined' ? X : {}` here is a temporal-dead-zone crash, not a
   guard — it names itself before it exists.) */
const SPRITE_SHEETS = (window.SPRITE_SHEETS = window.SPRITE_SHEETS || {});

function buildSheet(id,cw,ch){
  const meta=SPRITE_SHEETS[id];
  if(!meta){ console.warn('SPRITE: no sheet registered for',id); return null; }
  const img=Loader.img(id);
  if(!img){ console.warn('SPRITE: sheet image not loaded for',id); return null; }
  cw=cw||meta.cell[0]; ch=ch||meta.cell[1];
  const rows=meta.rows; // 4 (cardinals) or 8 (cardinals + diagonals)
  const S={};
  for(let r=0;r<rows;r++){
    const frames=[];
    for(let c=0;c<meta.cols;c++){
      const cv=document.createElement('canvas');
      cv.width=cw; cv.height=ch;
      cv.getContext('2d').drawImage(img,c*cw,r*ch,cw,ch,0,0,cw,ch);
      frames.push(cv);
    }
    // walk cycle reads stand,A,stand,B — same shape buildPlaceholder returns
    S[DIRS8[r]]=[frames[0],frames[1]||frames[0],frames[2]||frames[0]];
    S[DIRS8[r]].idle=frames.slice(3);
  }
  // a 4-row sheet has no diagonals yet: alias them to a cardinal so
  // Player.dir='downleft' etc. still draws something. An 8-row sheet
  // already filled these, so the guard is a no-op there.
  for(const d in DIAG_FALLBACK) if(!S[d]) S[d]=S[DIAG_FALLBACK[d]];
  return S;
}
