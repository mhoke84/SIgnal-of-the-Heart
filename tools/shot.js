/* RADIO UNDERGROUND v2 — tools/shot.js
   Headless screenshot harness at 480x270. Loads the REAL scripts in
   index.html order inside a softcanvas env, boots the game, walks
   the player to named positions, and saves PNGs for the producer.
   Usage: node tools/shot.js [outdir]   (default tools/review/shots) */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const {makeEnv}=require('./softcanvas');

const ROOT=path.join(__dirname,'..');
// Read the script list straight out of index.html so this can never drift
// again. (It had drifted: voices.js and both song files were missing, and
// shot.js would have crashed the moment anyone ran it.)
const SCRIPTS=(fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8')
  .match(/src="([^"]+\.js)"/g)||[]).map(m=>m.slice(5,-1));

function boot(){
  const env=makeEnv();
  const ctx=vm.createContext(env);
  // image paths in the game are project-relative; resolve them
  const RealSrc=Object.getOwnPropertyDescriptor(env.Image.prototype||{},'src');
  const SoftImage=env.Image;
  env.Image=class extends SoftImage{
    set src(p){super.src=path.join(ROOT,p);}
  };
  for(const s of SCRIPTS)
    vm.runInContext(fs.readFileSync(path.join(ROOT,s),'utf8'),ctx,{filename:s});
  return {env,ctx};
}

function frames(env,n,dt){for(let i=0;i<(n||1);i++)env.step(dt||16.7);}
function drain(env){ // let image onloads fire (microtasks) then frames
  return new Promise(r=>setImmediate(()=>{frames(env,2);r();}));
}
function walkTo(env,ctx,x,y,maxFrames){
  const P=()=>vm.runInContext('({x:Player.px,y:Player.py})',ctx);
  for(let i=0;i<(maxFrames||2000);i++){
    const p=P(),dx=x-p.x,dy=y-p.y;
    if(Math.abs(dx)<2&&Math.abs(dy)<2)break;
    const k=Math.abs(dx)>Math.abs(dy)?(dx>0?'ArrowRight':'ArrowLeft')
                                     :(dy>0?'ArrowDown':'ArrowUp');
    for(const kk of['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'])
      if(kk!==k)env.key(kk,false);
    env.key(k,true);env.step(16.7);
  }
  for(const kk of['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'])env.key(kk,false);
  frames(env,30); // let the camera ease settle
}

async function main(){
  const out=process.argv[2]||path.join(ROOT,'tools/review/shots');
  fs.mkdirSync(out,{recursive:true});
  const {env,ctx}=boot();
  await drain(env); // loader ready gate
  const ready=vm.runInContext('Loader.ready',ctx);
  if(!ready)throw new Error('loader not ready');
  // boot screen shot, then press Z
  frames(env,3);env.screen.savePNG(path.join(out,'00-boot.png'));
  // boot -> Scene 1 crawl -> roam. Two presses, with the crawl in between.
  env.tap('z');frames(env,6);
  env.screen.savePNG(path.join(out,'01-crawl.png'));
  env.tap('z');frames(env,10);
  // waypoint lists: the greedy walker is not a pathfinder, so shots
  // route around furniture the way a player would
  const R=js=>vm.runInContext(js,ctx);
  // registration spots are DERIVED from the painted room data, so they
  // survive any repaint: one shot behind each occluder blob (teleported —
  // these document compositing, reachability is the harness's job)
  const derived=R('(function(){const out=[],seen={};'+
    'for(const w of Stage.dataFor().walkBehind){'+
      'if(seen[w.note])continue;'+
      'for(let y=w.y+6;y<Math.min(w.y+w.h,w.horizon-2)&&!seen[w.note];y+=4)'+
        'for(let x=w.x+12;x<=w.x+w.w-12;x+=4)'+
          'if(Mask.canStand(roomMask,x,y)){seen[w.note]=1;'+
            'out.push({note:w.note,x:x,y:y});break;}'+
    '}return out})()');
  const spots=[['01-spawn',null]];
  let n=2;
  for(const d of derived)
    spots.push([String(n++).padStart(2,'0')+'-behind-'+d.note,[[d.x,d.y]]]);
  spots.push([String(n++).padStart(2,'0')+'-clamp-bottomright',[[700,420]]]);
  for(const [name,pts] of spots){
    if(pts)for(const p of pts){R(`Player.px=${p[0]};Player.py=${p[1]};Camera.snap()`);
      for(let i=0;i<3;i++)env.step(16.7);}
    frames(env,5);
    env.screen.savePNG(path.join(out,name+'.png'));
    const s=vm.runInContext('({p:[Player.px,Player.py],cam:[Camera.ix(),Camera.iy()]})',ctx);
    console.log(name,'player',s.p,'cam',s.cam);
  }
  // state-toggle preview (BACK-B + overlay stubs)
  env.tap('t');frames(env,40);
  env.screen.savePNG(path.join(out,'08-state-B-preview.png'));
  console.log('shots ->',out);
}
main().catch(e=>{console.error(e);process.exit(1);});
