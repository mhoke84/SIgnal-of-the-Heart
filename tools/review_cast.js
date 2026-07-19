/* RADIO UNDERGROUND v2 - tools/review_cast.js  (review-only, not shipped logic)
   Boots the REAL scripts headless, enters the store, and renders Mike + Izzy
   through the engine's own Stage.draw (y-sort, walk-behind, contact shadow,
   grade, vignette). For producer approval of the repainted cast.
   Usage: node tools/review_cast.js [outdir] */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const {makeEnv}=require('./softcanvas');
const ROOT=path.join(__dirname,'..');
const SCRIPTS=(fs.readFileSync(path.join(ROOT,'index.html'),'utf8')
  .match(/src="([^"]+\.js)"/g)||[]).map(m=>m.slice(5,-1));

function boot(){
  const env=makeEnv();const ctx=vm.createContext(env);
  const SoftImage=env.Image;
  env.Image=class extends SoftImage{set src(p){super.src=path.join(ROOT,p);}};
  for(const s of SCRIPTS)
    vm.runInContext(fs.readFileSync(path.join(ROOT,s),'utf8'),ctx,{filename:s});
  return {env,ctx};
}
const drain=env=>new Promise(r=>setImmediate(()=>{env.step(16.7);env.step(16.7);r();}));

async function main(){
  const out=process.argv[2]||path.join(ROOT,'tools/review');
  fs.mkdirSync(out,{recursive:true});
  const {env,ctx}=boot();
  await drain(env);
  const R=js=>vm.runInContext(js,ctx);
  if(!R('Loader.ready'))throw new Error('loader not ready');
  R("enterRoom('STORE-INT-A','default')");
  env.step(16.7);

  const cx=env.screen.getContext('2d');
  const SPR={mike:R("buildSheet('MIKE')"), izzy:R("buildSheet('IZZY')"),
             noah:R("buildSheet('NOAH')"), saltman:R("buildSheet('SALTMAN')")};
  function shot(name, cam, list){
    R(`Camera.follow({px:${cam[0]},py:${cam[1]}});Camera.snap()`);
    env.step(16.7);
    // build {img,px,py} sprites in the vm so images are the vm's canvases
    const sprites=list.map(s=>({
      img: SPR[s.who][s.dir][s.anim||0],
      px:s.px, py:s.py }));
    R('__sprites=null'); ctx.__sprites=sprites; // hand them in
    vm.runInContext('Stage.draw(document.getElementById("screen").getContext("2d"),__sprites,Game.t)',
      Object.assign(ctx,{__sprites:sprites}));
    env.screen.savePNG(path.join(out,name));
    console.log('wrote',name);
  }
  const facings=['down','downright','right','upright','up','upleft','left','downleft'];

  // 1) the whole cast standing on the open front floor, facing the player, 1:1
  shot('cast_store_standing.png',[288,352],[
    {who:'mike',dir:'down',px:168,py:356},
    {who:'izzy',dir:'down',px:264,py:356},
    {who:'noah',dir:'down',px:360,py:356},
    {who:'saltman',dir:'down',px:456,py:356},
  ]);
  // 2) walk-behind demo: Izzy standing behind the INDIE bin (its strip
  //    re-blits over her legs), Mike walking left mid-stride in front
  shot('cast_store_inscene.png',[320,352],[
    {who:'izzy',dir:'down',px:210,py:320},
    {who:'mike',dir:'left',anim:1,px:440,py:360},
  ]);
  // 3) a facing rotation of each, standing, across the floor
  for(const who of ['mike','izzy','noah','saltman'])
    shot(`cast_facings_${who}.png`,[384,352],
      facings.map((d,i)=>({who,dir:d,px:150+i*60,py:356})));
  console.log('cast review ->',out);
}
main().catch(e=>{console.error(e);process.exit(1);});
