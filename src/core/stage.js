/* RADIO UNDERGROUND v2 — core/stage.js
   THE COMPOSITOR. NEW for v2. Draw order per MASTER_REFERENCE §3:
     1. backdrop for the room's ACTIVE STATE
     2. under-overlays (rare; none in BACK-A)
     3. Y-sorted sprite pass w/ drop shadows, then WALK-BEHIND STRIPS.
        Implementation: strips join the y-sort AT their horizon line —
        a sprite whose baseline is above the horizon draws first and
        the strip (pixels re-blitted from the backdrop) covers it; a
        sprite below the horizon draws after and stays in front.
        Counters, bin rows, door frames occlude with zero extra art.
     4. effect overlays (palette-matched, drawn by us)
     5. grading tint + vignette
     6. UI layer — camera-independent, drawn by main.js after this. */
const Stage={
  room:null, roomId:'', state:'A', vignette:null,
  /* A room's STATE swaps the backdrop (states:{A:'STORE-INT-A',B:'STORE-INT-B'}).
     Scene 3 puts folding chairs on that floor, so the collision must swap too.
     If the state's backdrop ID also has a ROOMS entry carrying a mask -- which
     is exactly what mask2json writes when you paint STORE-INT-B -- use ITS
     mask and occluders. Anchors (exits/hotspots/spawns) always stay on the
     base room. Fall back to the base room when no state data was painted. */
  dataFor(state){
    const id=this.room.states&&this.room.states[state||this.state];
    const d=id&&ROOMS[id];
    return (d&&d.mask)?d:this.room;
  },
  setRoom(id,state){
    this.roomId=id; this.room=ROOMS[id]; this.state=state||'A';
    Camera.room=this.room;
  },
  backdrop(){ return Loader.img(this.room.states[this.state]); },
  // --- vignette: prebaked once via ImageData math (no gradients — keeps
  //     the headless softcanvas honest and the cost at zero per frame)
  bakeVignette(){
    const c=document.createElement('canvas');c.width=VIEW_W;c.height=VIEW_H;
    const g=c.getContext('2d'),im=g.createImageData(VIEW_W,VIEW_H);
    const cx0=VIEW_W/2,cy0=VIEW_H/2,R=Math.hypot(cx0,cy0);
    for(let y=0;y<VIEW_H;y++)for(let x=0;x<VIEW_W;x++){
      const d=Math.hypot(x-cx0,y-cy0)/R, a=Math.max(0,d-0.55)/0.45;
      const i=(y*VIEW_W+x)*4;
      im.data[i]=8;im.data[i+1]=5;im.data[i+2]=3;
      im.data[i+3]=Math.floor(a*a*110);
    }
    g.putImageData(im,0,0); this.vignette=c;
  },
  draw(cx,sprites,fxState){
    const camX=Camera.ix(),camY=Camera.iy(),bd=this.backdrop();
    // 1. backdrop (active state)
    cx.drawImage(bd,camX,camY,VIEW_W,VIEW_H,0,0,VIEW_W,VIEW_H);
    // 3. y-sorted pass: sprites + walk-behind strips share one sort
    const order=[];
    for(const s of sprites)order.push({y:s.py,spr:s});
    for(const wb of (this.dataFor().walkBehind||[]))
      order.push({y:wb.horizon,strip:wb});
    order.sort((a,b)=>a.y-b.y);
    for(const o of order){
      if(o.strip){
        const w=o.strip;
        cx.drawImage(bd,w.x,w.y,w.w,w.h,w.x-camX,w.y-camY,w.w,w.h);
      }else{
        const s=o.spr;
        // per-backdrop sprite scale: a "smaller" room (props drawn larger)
        // wants a larger player. Lives in room data (canon, hand-authored),
        // resolved for the active state via dataFor(). Default 1. Anchored at
        // the feet (px,py = bottom-centre) so scaling grows the figure upward
        // from the floor, never off its standing spot.
        const k=(this.dataFor().spriteScale)||1;
        const w=Math.round(32*k),h=Math.round(48*k);
        const x=Math.floor(s.px-w/2-camX),y=Math.floor(s.py-h-camY);
        const sy=Math.floor(s.py-camY);
        // contact shadow first: soft, warm-dark, scaled with the figure.
        // Clamped to end AT the baseline (bottom edge = sy, so the lowest
        // painted row is sy-1) instead of spilling to sy+1. This keeps the
        // whole pool inside the sprite's own occludable span [sy-h, sy): the
        // same strip re-blit that erases the body behind an occluder now also
        // erases the shadow, so no sub-horizon sliver can outlive the body at a
        // horizon tie. (occl-6 strips cover [y, y+h) bottom-exclusive; the old
        // sy-2..sy+1 pool left rows sy, sy+1 below the lip, which read as a shoe
        // over the shelf at 1.5 scale.) Visually imperceptible at 1:1/1.5.
        cx.fillStyle='rgba(20,12,6,0.35)';
        cx.fillRect(x+Math.round(7*k),sy-4,Math.round(18*k),4);
        cx.fillStyle='rgba(20,12,6,0.25)';
        cx.fillRect(x+Math.round(5*k),sy-2,Math.round(22*k),2);
        cx.drawImage(s.img,x,y,w,h);
      }
    }
    // 4. effect overlays for the active state
    for(const fx of (this.room.fx||[])){
      const st=fx.state||'AB';
      if(st!=='AB'&&st!==this.state)continue;
      FX[fx.kind]&&FX[fx.kind](cx,fx.at[0]-camX,fx.at[1]-camY,fxState);
    }
    // 5. grading tint (warm amber, scene-set later) + vignette
    cx.fillStyle=Stage.tint||'rgba(232,162,74,0.05)';
    cx.fillRect(0,0,VIEW_W,VIEW_H);
    if(!this.vignette)this.bakeVignette();
    cx.drawImage(this.vignette,0,0);
  }
};
/* Palette-matched overlays (BRIEF §3.4). deskLamp survives; tubeGlow and
   onAir were removed at the producer's request. The painted ON AIR sign and
   tube meters remain in the STORE-BACK-B backdrop art (not drawn here). */
const FX={
  deskLamp(cx,x,y,t){
    cx.fillStyle='rgba(255,217,138,0.10)';cx.fillRect(x-26,y-8,52,34);
    cx.fillStyle='rgba(255,217,138,0.08)';cx.fillRect(x-16,y-14,32,46);
  }
};
