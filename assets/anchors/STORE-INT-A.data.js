// STORE-INT-A room data — SCENE 2 (Radio Underground Records, morning).
// Schema: docs/MASTER_REFERENCE.md §5. Coordinates are logical px on the
// 768x432 normalized backdrop.
//
// STATUS OF THIS FILE
//   mask / walkBehind / grid  = GENERATED. Empty until you paint
//     assets/masks/STORE-INT-A.mask.png (+ .occl.png) and run
//     tools/mask2json.py. THE PAINT IS NOT THE ROOM UNTIL CONVERTED.
//   everything else           = CANON, hand-authored, survives the tool.
//
// ANCHORS VERIFIED against the producer's painted STORE-INT-A.mask.png:
// every hotspot rect sits on solid furniture, has walkable floor on its
// `face` side, and every spawn stands on floor. Two anchors were dropped
// as unlocatable in this render: the listening booth and the poster wall
// (the latter is behind the counter and unreachable anyway).
//
// Script sources (docs/radio_underground_script_edited.md, Scene 2):
//   counter + register + turntable ....... Izzy pricing 45s
//   front window ......................... the Zamfir record  [PROTECTED GAG]
//   SALE crate ........................... Stylus, immovable  [PROTECTED GAG]
//   listening booth ...................... hand-lettered "BE YOU" sign
//   bead curtain, back corner ............ exit to STORE-BACK-A (Chekhov's gun)
//   wall of gig posters .................. fictional artists only
window.ROOMS=window.ROOMS||{};
ROOMS['STORE-INT-A']={
  size:[768,432],
  states:{A:'STORE-INT-A',B:'STORE-INT-B'},   // B = Scene 3, show night
  spriteScale:1.5, // CANON. Store front is 1:1 art; 1.5 sizes the cast to the
                   // browsing bins (48px reads child-height at 1.0 here). Tune freely.
  grid:4,
  mask:'2330:0,11:1,181:0,11:1,181:0,11:1,173:0,79:1,113:0,86:1,106:0,86:1,106:0,86:1,24:0,10:1,65:0,93:1,24:0,10:1,65:0,93:1,24:0,10:1,65:0,127:1,65:0,32:1,53:0,42:1,65:0,32:1,53:0,51:1,56:0,32:1,53:0,51:1,56:0,32:1,53:0,51:1,76:0,12:1,53:0,51:1,76:0,12:1,53:0,73:1,59:0,7:1,53:0,73:1,59:0,7:1,53:0,73:1,59:0,133:1,59:0,133:1,59:0,133:1,59:0,133:1,59:0,133:1,59:0,133:1,59:0,133:1,59:0,133:1,54:0,138:1,34:0,158:1,34:0,158:1,8:0,10:1,16:0,158:1,8:0,10:1,16:0,158:1,8:0,10:1,16:0,158:1,8:0,10:1,16:0,158:1,8:0,10:1,16:0,24:1,47:0,9:1,39:0,39:1,8:0,5:1,21:0,24:1,47:0,9:1,39:0,39:1,8:0,5:1,21:0,24:1,47:0,9:1,39:0,39:1,8:0,5:1,21:0,24:1,47:0,9:1,39:0,39:1,8:0,5:1,21:0,24:1,47:0,9:1,39:0,39:1,8:0,5:1,21:0,24:1,47:0,9:1,39:0,39:1,8:0,5:1,21:0,24:1,47:0,9:1,39:0,39:1,8:0,5:1,21:0,24:1,47:0,9:1,39:0,39:1,8:0,5:1,21:0,24:1,47:0,9:1,39:0,39:1,8:0,5:1,21:0,24:1,47:0,9:1,39:0,39:1,8:0,5:1,21:0,24:1,47:0,9:1,39:0,39:1,8:0,5:1,21:0,24:1,47:0,9:1,39:0,39:1,8:0,5:1,21:0,158:1,8:0,5:1,21:0,158:1,8:0,5:1,21:0,158:1,8:0,11:1,15:0,158:1,8:0,11:1,15:0,158:1,8:0,11:1,15:0,158:1,8:0,11:1,15:0,158:1,8:0,11:1,15:0,158:1,8:0,11:1,15:0,158:1,8:0,11:1,15:0,158:1,8:0,11:1,15:0,158:1,8:0,11:1,15:0,24:1,47:0,9:1,39:0,39:1,8:0,11:1,15:0,24:1,47:0,9:1,39:0,39:1,8:0,5:1,21:0,24:1,47:0,9:1,39:0,39:1,8:0,5:1,21:0,24:1,47:0,9:1,39:0,39:1,8:0,5:1,21:0,24:1,47:0,9:1,39:0,39:1,8:0,5:1,21:0,24:1,47:0,9:1,39:0,39:1,8:0,5:1,21:0,24:1,47:0,9:1,39:0,39:1,8:0,5:1,21:0,24:1,47:0,9:1,39:0,51:1,28:0,18:1,47:0,9:1,39:0,51:1,28:0,18:1,47:0,9:1,39:0,51:1,28:0,18:1,47:0,9:1,39:0,51:1,28:0,18:1,47:0,9:1,39:0,51:1,28:0,164:1,28:0,164:1,28:0,151:1,41:0,151:1,41:0,151:1,41:0,151:1,41:0,151:1,41:0,151:1,41:0,151:1,41:0,151:1,41:0,141:1,51:0,141:1,51:0,141:1,51:0,141:1,51:0,7:1,48:0,38:1,42:0,6:1,51:0,7:1,48:0,38:1,42:0,6:1,51:0,7:1,48:0,38:1,42:0,6:1,51:0,7:1,48:0,38:1,42:0,6:1,8:0,15:1,28:0,7:1,48:0,38:1,42:0,7:1,7:0,15:1,18:0,17:1,48:0,38:1,42:0,7:1,7:0,15:1,18:0,17:1,48:0,38:1,42:0,7:1,7:0,15:1,18:0,17:1,48:0,38:1,39:0,10:1,7:0,15:1,18:0,152:1,7:0,15:1,18:0,175:1,17:0,175:1,17:0,175:1,17:0,175:1,202:0',   // <- mask2json.py fills this from assets/masks/STORE-INT-A.mask.png
  walkBehind:[ // GENERATED from STORE-INT-A.occl.png -- repaint there, don't hand-edit
    {x:200,y:44,w:20,h:8,horizon:92,note:'occl-1'},
    {x:200,y:52,w:24,h:4,horizon:92,note:'occl-1'},
    {x:176,y:56,w:204,h:4,horizon:92,note:'occl-1'},
    {x:176,y:60,w:208,h:32,horizon:92,note:'occl-1'},
    {x:64,y:96,w:24,h:4,horizon:112,note:'occl-2'},
    {x:92,y:96,w:20,h:4,horizon:112,note:'occl-2'},
    {x:56,y:100,w:32,h:8,horizon:112,note:'occl-2'},
    {x:92,y:100,w:28,h:8,horizon:112,note:'occl-2'},
    {x:56,y:108,w:64,h:4,horizon:112,note:'occl-2'},
    {x:368,y:168,w:24,h:4,horizon:184,note:'occl-5'},
    {x:428,y:168,w:28,h:4,horizon:184,note:'occl-5'},
    {x:136,y:172,w:32,h:4,horizon:184,note:'occl-6'},
    {x:172,y:172,w:28,h:4,horizon:184,note:'occl-6'},
    {x:204,y:172,w:24,h:4,horizon:184,note:'occl-6'},
    {x:236,y:172,w:24,h:4,horizon:184,note:'occl-6'},
    {x:268,y:172,w:20,h:4,horizon:184,note:'occl-6'},
    {x:296,y:172,w:32,h:4,horizon:184,note:'occl-6'},
    {x:364,y:172,w:156,h:12,horizon:184,note:'occl-5'},
    {x:136,y:176,w:192,h:8,horizon:184,note:'occl-6'},
    {x:720,y:156,w:44,h:24,horizon:236,note:'occl-4'},
    {x:720,y:180,w:16,h:56,horizon:236,note:'occl-4'},
    {x:144,y:260,w:24,h:4,horizon:276,note:'occl-8'},
    {x:176,y:260,w:24,h:4,horizon:276,note:'occl-8'},
    {x:204,y:260,w:24,h:4,horizon:276,note:'occl-8'},
    {x:236,y:260,w:24,h:4,horizon:276,note:'occl-8'},
    {x:268,y:260,w:20,h:4,horizon:276,note:'occl-8'},
    {x:296,y:260,w:24,h:4,horizon:276,note:'occl-8'},
    {x:368,y:260,w:24,h:4,horizon:276,note:'occl-9'},
    {x:396,y:260,w:24,h:4,horizon:276,note:'occl-9'},
    {x:428,y:260,w:24,h:4,horizon:276,note:'occl-9'},
    {x:456,y:260,w:24,h:4,horizon:276,note:'occl-9'},
    {x:488,y:260,w:24,h:4,horizon:276,note:'occl-9'},
    {x:140,y:264,w:188,h:12,horizon:276,note:'occl-8'},
    {x:364,y:264,w:156,h:12,horizon:276,note:'occl-9'},
    {x:752,y:220,w:12,h:48,horizon:288,note:'occl-7'},
    {x:732,y:268,w:32,h:20,horizon:288,note:'occl-7'},
    {x:696,y:144,w:12,h:156,horizon:300,note:'occl-3'},
    {x:52,y:300,w:8,h:8,horizon:308,note:'occl-10'},
    {x:64,y:308,w:12,h:4,horizon:332,note:'occl-11'},
    {x:64,y:312,w:8,h:4,horizon:332,note:'occl-11'},
    {x:672,y:312,w:52,h:20,horizon:332,note:'occl-12'},
    {x:64,y:316,w:12,h:4,horizon:332,note:'occl-11'},
    {x:64,y:320,w:8,h:8,horizon:332,note:'occl-11'},
    {x:64,y:328,w:12,h:4,horizon:332,note:'occl-11'},
    {x:100,y:364,w:24,h:4,horizon:380,note:'occl-13'},
    {x:132,y:364,w:24,h:4,horizon:380,note:'occl-13'},
    {x:164,y:364,w:24,h:4,horizon:380,note:'occl-13'},
    {x:196,y:364,w:20,h:4,horizon:380,note:'occl-13'},
    {x:228,y:364,w:24,h:4,horizon:380,note:'occl-13'},
    {x:256,y:364,w:24,h:4,horizon:380,note:'occl-13'},
    {x:448,y:364,w:24,h:4,horizon:380,note:'occl-14'},
    {x:480,y:364,w:24,h:4,horizon:380,note:'occl-14'},
    {x:512,y:364,w:24,h:4,horizon:380,note:'occl-14'},
    {x:544,y:364,w:24,h:4,horizon:380,note:'occl-14'},
    {x:576,y:364,w:24,h:4,horizon:380,note:'occl-14'},
    {x:96,y:368,w:192,h:12,horizon:380,note:'occl-13'},
    {x:440,y:368,w:168,h:12,horizon:380,note:'occl-14'},
    {x:312,y:392,w:12,h:8,horizon:432,note:'occl-15'},
    {x:408,y:392,w:12,h:8,horizon:432,note:'occl-15'},
    {x:360,y:396,w:12,h:4,horizon:432,note:'occl-15'},
    {x:312,y:400,w:108,h:4,horizon:432,note:'occl-15'},
    {x:312,y:404,w:12,h:8,horizon:432,note:'occl-15'},
    {x:360,y:404,w:12,h:4,horizon:432,note:'occl-15'},
    {x:408,y:404,w:12,h:8,horizon:432,note:'occl-15'},
    {x:12,y:412,w:312,h:12,horizon:432,note:'occl-15'},
    {x:408,y:412,w:328,h:20,horizon:432,note:'occl-15'},
    {x:4,y:424,w:320,h:8,horizon:432,note:'occl-15'}
  ],   // <- mask2json.py fills this from STORE-INT-A.occl.png
  spawns:{
    default:[384,352],      // center floor
    fromBack:[124,74],      // stepping out of the STAFF ONLY door
    fromStreet:[364,404]    // Noah's dead-run entrance, Scene 2
  },
  exits:[
    // the STAFF ONLY door, top-left. Trigger is the floor strip in front
    // of it (a trigger on the door's solid face is unreachable). Inset for
    // the 12px foot box: canStand() needs px+-6 and py-1..py-4 all clear.
    {rect:[110,52,32,8],to:'STORE-BACK-A',spawn:'fromStore',face:'up'}
  ],
  hotspots:[ // VERIFIED against STORE-INT-A.mask.png: each rect sits on solid
    // furniture and has walkable floor on its `face` side.
    {id:'turntable', rect:[306,30,52,28],  face:'up',   op:'turntable_spin'},
    {id:'counter',   rect:[168,30,212,28], face:'up',   op:'counter_talk'},
    {id:'cassettes', rect:[428,36,74,50],  face:'up',   op:'cassette_wall'},
    {id:'zamfir',    rect:[128,362,160,30],face:'down', op:'zamfir_look'},   // PROTECTED GAG
    {id:'saleCrate', rect:[36,344,58,56],  face:'left', op:'stylus_pet'},    // PROTECTED GAG
    {id:'binsRock',  rect:[128,176,182,56],face:'up',   op:'browse_bins'},
    {id:'binsJazz',  rect:[340,176,164,56],face:'up',   op:'browse_bins'},
    {id:'binsIndie', rect:[128,266,182,56],face:'up',   op:'browse_bins'},
    {id:'binsHipHop',rect:[340,266,164,56],face:'up',   op:'browse_bins'}
  ],
  fx:[
    {kind:'windowLight',at:[700,150],state:'AB'},  // warm golden morning light
    {kind:'stringLights',at:[384,104],state:'B'}   // Scene 3, show night
  ],
  npcSlots:{
    izzy:[250,66],     // at the counter, pricing 45s (no floor BEHIND it - see note)
    noah:[400,384],    // arrives at a dead run, guitar case first
    earl:[214,330],    // the canary, by the bins
    stylus:[64,352]    // ON the SALE crate (solid by design). Immovable. Forever.
  }
};
