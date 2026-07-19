/* RADIO UNDERGROUND v2 — core/mask.js
   Walkability + walk-behind queries from room data. NEW for v2.
   Mask ships inside assets/anchors/<ID>.data.js as an RLE string
   authored by tools/mask2json.py from a painted mask PNG:
     WHITE=1 walk, BLACK=0 solid, BLUE=2 walk-behind corridor.
   RLE format: "count:value,count:value,..." row-major over the cell
   grid (room.size / room.grid). Runtime never touches image pixels. */
const Mask={
  cache:{}, // roomId -> {cells:Uint8Array,cw,ch,grid}
  decode(room,id){
    if(this.cache[id])return this.cache[id];
    const g=room.grid||8,
          cw=Math.ceil(room.size[0]/g), ch=Math.ceil(room.size[1]/g),
          cells=new Uint8Array(cw*ch);
    if(room.mask){
      let i=0;
      for(const run of room.mask.split(',')){
        const p=run.split(':'), n=+p[0], v=+p[1];
        cells.fill(v,i,i+n); i+=n;
      }
      if(i!==cw*ch)console.warn('MASK: RLE length',i,'want',cw*ch,'('+id+')');
    }
    return this.cache[id]={cells,cw,ch,grid:g};
  },
  at(m,x,y){ // logical px -> cell value (out of bounds = solid)
    const cx0=Math.floor(x/m.grid), cy0=Math.floor(y/m.grid);
    if(cx0<0||cy0<0||cx0>=m.cw||cy0>=m.ch)return 0;
    return m.cells[cy0*m.cw+cx0];
  },
  // Feet-box test: a 32x48 sprite stands on a 12px-wide, 4px-deep
  // contact patch centered on its baseline. All corners must be walkable.
  canStand(m,px,py){
    return this.at(m,px-6,py-1)>0 && this.at(m,px+5,py-1)>0 &&
           this.at(m,px-6,py-4)>0 && this.at(m,px+5,py-4)>0;
  },
  isBehind(m,px,py){ return this.at(m,px,py-1)===2; }
};
