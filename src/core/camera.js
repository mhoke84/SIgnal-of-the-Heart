/* RADIO UNDERGROUND v2 — core/camera.js
   Pixel camera. NEW for v2 (768x432 rooms > 480x270 viewport).
   Follow(player) with soft clamp; `pan` gets a camera target variant
   for the runner's cinematics (Phase 3 wires the op). Camera output
   is floored to integers before drawing — no half-pixel shimmer. */
const Camera={
  x:0,y:0, tx:0,ty:0, target:null, panTo:null, ease:0.14,
  room:null, // {size:[w,h]}
  follow(t){ this.target=t; this.panTo=null; },
  pan(x,y){ this.panTo=[x,y]; },          // runner op hook (Phase 3)
  snap(){ this._aim(); this.x=this.tx; this.y=this.ty; },
  _aim(){
    let fx=this.x+VIEW_W/2, fy=this.y+VIEW_H/2;
    if(this.panTo){ fx=this.panTo[0]; fy=this.panTo[1]; }
    else if(this.target){ fx=this.target.px; fy=this.target.py-16; }
    const rw=this.room?this.room.size[0]:VIEW_W,
          rh=this.room?this.room.size[1]:VIEW_H;
    this.tx=Math.max(0,Math.min(rw-VIEW_W,fx-VIEW_W/2));
    this.ty=Math.max(0,Math.min(rh-VIEW_H,fy-VIEW_H/2));
  },
  update(){
    this._aim();
    // soft clamp: ease toward the clamped target, land on integers
    this.x+=(this.tx-this.x)*this.ease;
    this.y+=(this.ty-this.y)*this.ease;
    if(Math.abs(this.tx-this.x)<0.5)this.x=this.tx;
    if(Math.abs(this.ty-this.y)<0.5)this.y=this.ty;
  },
  ix(){ return Math.floor(this.x); },
  iy(){ return Math.floor(this.y); }
};
