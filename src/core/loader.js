/* RADIO UNDERGROUND v2 — core/loader.js
   Manifest-driven <img> loading with a ready gate. NEW for v2.
   Runtime never reads backdrop pixels (file:// canvas taint) — see
   MASTER_REFERENCE §3. Images are draw-only; room data comes from
   assets/anchors/<ID>.data.js loaded as plain scripts. */
const Loader={
  manifest:{}, imgs:{}, pending:0, failed:[], ready:false, _cbs:[],
  add(id,url){ this.manifest[id]=url; },
  img(id){ return this.imgs[id]; },
  start(){
    const ids=Object.keys(this.manifest);
    this.pending=ids.length;
    if(!this.pending){ this._fire(); return; }
    for(const id of ids){
      const im=new Image();
      im.onload=()=>{ this.imgs[id]=im; if(--this.pending===0)this._fire(); };
      im.onerror=()=>{ this.failed.push(id); console.warn('LOADER: failed',id);
        if(--this.pending===0)this._fire(); };
      im.src=this.manifest[id];
    }
  },
  onReady(cb){ this.ready?cb():this._cbs.push(cb); },
  _fire(){ this.ready=true; for(const cb of this._cbs)cb(); this._cbs=[]; }
};
