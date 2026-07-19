/* RADIO UNDERGROUND v2 — core/font.js
   5x7 bitmap font + HUE palette + text helpers. Verbatim; cx is the stage context.
   Ported VERBATIM from reference_build004.html (logic source of truth).
   Plain script, global scope, loaded in order by index.html. */
const HUE={
  amber:'#e8a24a', amberDeep:'#b06f2c', glow:'#ffd98a',
  wood:'#7a5233', woodDk:'#4c3320', woodLt:'#8f6440',
  wall:'#3a2a1c', wallLt:'#57402a', cream:'#e8d9b8', ink:'#1a120c',
  night:'#101020', nightSky:'#0a0a18',
  teal:'#1fb8b2', tealDk:'#0e5f66', tealBg:'#0a2a30', ledBlue:'#3fd4ff',
  steel:'#9aa7ad', red:'#c8452e', denim:'#3e5a7a',
  green:'#3d6b2f', greenLt:'#5d8f43', corn:'#c9a83f', dirt:'#6b4c2c',
  grey:'#777777', white:'#f4f0e6', black:'#000000',
  hp:'#5fae4c', heart:'#d1604f', tempo:'#e8a24a', tempoBg:'#3a2a1c'
};

const FONT={
 A:[14,17,17,31,17,17,17],B:[30,17,17,30,17,17,30],C:[14,17,16,16,16,17,14],
 D:[30,17,17,17,17,17,30],E:[31,16,16,30,16,16,31],F:[31,16,16,30,16,16,16],
 G:[14,17,16,23,17,17,15],H:[17,17,17,31,17,17,17],I:[14,4,4,4,4,4,14],
 J:[7,2,2,2,2,18,12],K:[17,18,20,24,20,18,17],L:[16,16,16,16,16,16,31],
 M:[17,27,21,21,17,17,17],N:[17,25,21,19,17,17,17],O:[14,17,17,17,17,17,14],
 P:[30,17,17,30,16,16,16],Q:[14,17,17,17,21,18,13],R:[30,17,17,30,20,18,17],
 S:[15,16,16,14,1,1,30],T:[31,4,4,4,4,4,4],U:[17,17,17,17,17,17,14],
 V:[17,17,17,17,17,10,4],W:[17,17,17,21,21,27,17],X:[17,17,10,4,10,17,17],
 Y:[17,17,10,4,4,4,4],Z:[31,1,2,4,8,16,31],
 '0':[14,17,19,21,25,17,14],'1':[4,12,4,4,4,4,14],'2':[14,17,1,6,8,16,31],
 '3':[31,2,4,2,1,17,14],'4':[2,6,10,18,31,2,2],'5':[31,16,30,1,1,17,14],
 '6':[6,8,16,30,17,17,14],'7':[31,1,2,4,8,8,8],'8':[14,17,17,14,17,17,14],
 '9':[14,17,17,15,1,2,12],' ':[0,0,0,0,0,0,0],'.':[0,0,0,0,0,12,12],
 ',':[0,0,0,0,12,4,8],'!':[4,4,4,4,4,0,4],'?':[14,17,1,6,4,0,4],
 "'":[4,4,8,0,0,0,0],'"':[10,10,0,0,0,0,0],'-':[0,0,0,14,0,0,0],
 ':':[0,12,12,0,12,12,0],';':[0,12,12,0,12,4,8],'(':[2,4,8,8,8,4,2],
 ')':[8,4,2,2,2,4,8],'/':[1,1,2,4,8,16,16],'&':[12,18,20,8,21,18,13],
 '~':[0,0,8,21,2,0,0],'+':[0,4,4,31,4,4,0],'%':[25,26,2,4,8,11,19],
 '#':[10,31,10,10,10,31,10],'*':[0,21,14,31,14,21,0]
};
function text(str,x,y,col,scale){
  scale=scale||1; cx.fillStyle=col;
  let px=x;
  for(const ch0 of String(str).toUpperCase()){
    const g=FONT[ch0]||FONT['?'];
    for(let r=0;r<7;r++){ const bits=g[r];
      for(let c=0;c<5;c++) if(bits&(16>>c)) cx.fillRect(px+c*scale,y+r*scale,scale,scale);
    }
    px+=6*scale;
  }
  return px;
}
function textC(str,cxr,y,col,scale){ scale=scale||1;
  text(str,Math.floor(cxr-(String(str).length*6*scale)/2),y,col,scale); }
function wrap(str,cols){
  const out=[],words=String(str).split(' ');let line='';
  for(const w of words){
    if((line+' '+w).trim().length<=cols) line=(line?line+' ':'')+w;
    else{out.push(line);line=w;}
  }
  if(line)out.push(line);return out;
}

// ---- SPRITES ---- pixel strings -> canvas. '.'=transparent.
// A tiny validator keeps the tape honest: bad row lengths get

function perf(){return performance.now();}
function hsh(x,y){ let n=x*374761393+y*668265263; n=(n^(n>>13))*1274126177;
  return ((n^(n>>16))>>>0)/4294967295; }
