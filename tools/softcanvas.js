/* RADIO UNDERGROUND v2 — tools/softcanvas.js
   Software 2D canvas + minimal DOM/audio shims so the REAL game
   scripts run headless under node (shot.js screenshots, harness.js
   logic runs). Re-built at 480x270 for v2 (the /tmp original from
   the 004 sessions didn't ride along in the project zip — logged).
   Implements exactly what the engine uses: fillRect w/ alpha,
   drawImage (canvas/PNG, source rect, 1:1 or scaled nearest),
   arc-fill circles, ImageData. Nothing speculative. */
'use strict';
const fs=require('fs');
let PNG;
try{ ({PNG}=require('pngjs')); }
catch(e){
  console.error('\nMissing dependency: pngjs\n'+
    'Run this once in THIS project folder (every fresh unzip needs it):\n'+
    '    npm install\n');
  process.exit(2);
}

function parseColor(s){
  if(s[0]==='#'){
    if(s.length===7)return [parseInt(s.slice(1,3),16),parseInt(s.slice(3,5),16),parseInt(s.slice(5,7),16),255];
    if(s.length===4)return [17*parseInt(s[1],16),17*parseInt(s[2],16),17*parseInt(s[3],16),255];
  }
  let m=s.match(/rgba\(([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)\)/);
  if(m)return [+m[1],+m[2],+m[3],Math.round(+m[4]*255)];
  m=s.match(/rgb\(([\d.]+),\s*([\d.]+),\s*([\d.]+)\)/);
  if(m)return [+m[1],+m[2],+m[3],255];
  return [255,0,255,255];
}

class Ctx2D{
  constructor(c){this.canvas=c;this.fillStyle='#000';this.imageSmoothingEnabled=false;
    this._path=null;}
  _blend(i,r,g,b,a){
    const d=this.canvas._px;
    if(a>=255){d[i]=r;d[i+1]=g;d[i+2]=b;d[i+3]=255;return;}
    const na=a/255,ia=1-na;
    d[i]=r*na+d[i]*ia;d[i+1]=g*na+d[i+1]*ia;d[i+2]=b*na+d[i+2]*ia;
    d[i+3]=Math.min(255,a+d[i+3]*ia);
  }
  fillRect(x,y,w,h){
    const[r,g,b,a]=parseColor(this.fillStyle);
    const c=this.canvas,x0=Math.max(0,Math.floor(x)),y0=Math.max(0,Math.floor(y)),
      x1=Math.min(c.width,Math.ceil(x+w)),y1=Math.min(c.height,Math.ceil(y+h));
    for(let yy=y0;yy<y1;yy++)for(let xx=x0;xx<x1;xx++)
      this._blend((yy*c.width+xx)*4,r,g,b,a);
  }
  clearRect(x,y,w,h){const c=this.canvas,x0=Math.max(0,x|0),y0=Math.max(0,y|0),
    x1=Math.min(c.width,(x+w)|0),y1=Math.min(c.height,(y+h)|0);
    for(let yy=y0;yy<y1;yy++)for(let xx=x0;xx<x1;xx++)
      c._px.fill(0,(yy*c.width+xx)*4,(yy*c.width+xx)*4+4);}
  drawImage(img,...a){
    let sx=0,sy=0,sw=img.width,sh=img.height,dx,dy,dw,dh;
    if(a.length===2){[dx,dy]=a;dw=sw;dh=sh;}
    else if(a.length===4){[dx,dy,dw,dh]=a;}
    else{[sx,sy,sw,sh,dx,dy,dw,dh]=a;}
    const src=img._px,SW=img.width,c=this.canvas;
    for(let yy=0;yy<dh;yy++){
      const syy=sy+Math.floor(yy*sh/dh),ty=Math.floor(dy+yy);
      if(ty<0||ty>=c.height||syy<0||syy>=img.height)continue;
      for(let xx=0;xx<dw;xx++){
        const sxx=sx+Math.floor(xx*sw/dw),tx=Math.floor(dx+xx);
        if(tx<0||tx>=c.width||sxx<0||sxx>=SW)continue;
        const si=(syy*SW+sxx)*4,sa=src[si+3];
        if(sa===0)continue;
        this._blend((ty*c.width+tx)*4,src[si],src[si+1],src[si+2],sa);
      }
    }
  }
  beginPath(){this._path=null;}
  arc(x,y,r){this._path={x,y,r};}
  fill(){
    if(!this._path)return;
    const{x,y,r}=this._path,[cr,cg,cb,ca]=parseColor(this.fillStyle),c=this.canvas;
    for(let yy=Math.floor(y-r);yy<=y+r;yy++)for(let xx=Math.floor(x-r);xx<=x+r;xx++){
      if(xx<0||yy<0||xx>=c.width||yy>=c.height)continue;
      if((xx-x)*(xx-x)+(yy-y)*(yy-y)<=r*r)
        this._blend((yy*c.width+xx)*4,cr,cg,cb,ca);
    }
  }
  createImageData(w,h){return{width:w,height:h,data:new Uint8ClampedArray(w*h*4)};}
  getImageData(x,y,w,h){const im=this.createImageData(w,h),c=this.canvas;
    for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){
      const si=((y+yy)*c.width+(x+xx))*4,di=(yy*w+xx)*4;
      for(let k=0;k<4;k++)im.data[di+k]=c._px[si+k];}
    return im;}
  putImageData(im,x,y){const c=this.canvas;
    for(let yy=0;yy<im.height;yy++)for(let xx=0;xx<im.width;xx++){
      const di=((y+yy)*c.width+(x+xx))*4,si=(yy*im.width+xx)*4;
      for(let k=0;k<4;k++)c._px[di+k]=im.data[si+k];}}
  save(){}restore(){}
}

class SoftCanvas{
  constructor(){this._w=0;this._h=0;this._px=new Uint8ClampedArray(0);
    this.style={};}
  get width(){return this._w}
  set width(w){this._w=w;this._px=new Uint8ClampedArray(this._w*this._h*4);}
  get height(){return this._h}
  set height(h){this._h=h;this._px=new Uint8ClampedArray(this._w*this._h*4);}
  getContext(){return this._ctx||(this._ctx=new Ctx2D(this));}
  savePNG(path){
    const p=new PNG({width:this._w,height:this._h});
    p.data=Buffer.from(this._px.buffer,this._px.byteOffset,this._px.length);
    // flatten onto black (screenshots want opaque)
    for(let i=0;i<p.data.length;i+=4)p.data[i+3]=255;
    fs.writeFileSync(path,PNG.sync.write(p));
  }
}

class SoftImage{
  constructor(){this.width=0;this.height=0;this._px=null;
    this.onload=null;this.onerror=null;}
  set src(path){
    try{
      const p=PNG.sync.read(fs.readFileSync(path));
      this.width=p.width;this.height=p.height;
      this._px=new Uint8ClampedArray(p.data);
      queueMicrotask(()=>this.onload&&this.onload());
    }catch(e){queueMicrotask(()=>this.onerror&&this.onerror(e));}
  }
}

/* ---- audio shims: the beat math runs, no sound comes out ---- */
function fakeNode(){const n={connect:()=>n,start(){},stop(){},
  gain:{value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},
  frequency:{value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},
  type:'',buffer:null,loop:false,Q:{value:0}};return n;}
class FakeAudioContext{
  constructor(){this.currentTime=0;this.sampleRate=8000;this.destination=fakeNode();}
  createGain(){return fakeNode()}createOscillator(){return fakeNode()}
  createBufferSource(){return fakeNode()}createBiquadFilter(){return fakeNode()}
  createBuffer(ch,len){return{getChannelData(){return new Float32Array(len)}}}
}

function makeEnv(){
  const listeners={};
  const env={
    listeners,
    window:null, // set below (self-reference)
    document:{
      createElement(tag){if(tag==='canvas')return new SoftCanvas();
        throw new Error('softcanvas: only canvas');},
      getElementById(){return env.screen;}
    },
    screen:new SoftCanvas(),
    Image:SoftImage,
    AudioContext:FakeAudioContext,
    addEventListener(t,cb){(listeners[t]=listeners[t]||[]).push(cb);},
    removeEventListener(){},
    requestAnimationFrame(cb){env._raf=cb;},
    performance:{now:()=>env._now},_now:0,_raf:null,
    innerWidth:960,innerHeight:540,
    console,queueMicrotask,Math,JSON,Object,Array,Uint8Array,Uint8ClampedArray,
    setTimeout,clearTimeout,
    // drive one frame: advance fake clocks, run pending raf
    step(dtMs){
      env._now+=dtMs;
      if(env._ac)env._ac.currentTime+=dtMs/1000;
      const f=env._raf;env._raf=null;if(f)f();
    },
    key(name,down){ // dispatch through the REAL keydown/keyup handlers
      const type=down?'keydown':'keyup';
      for(const cb of (listeners[type]||[]))cb({key:name,preventDefault(){}});
    },
    tap(name){env.key(name,true);env.key(name,false);}
  };
  env.window=env;
  // capture the game's AudioContext instance so step() can advance it
  env.AudioContext=function(){env._ac=new FakeAudioContext();return env._ac;};
  return env;
}
module.exports={makeEnv,SoftCanvas,SoftImage};
