// STORE-BACK-A room data — PHASE 1 (mask RLE authored via mask2json.py;
// anchors verified against the render; see tools/review/ maskview).
// Schema documented in docs/MASTER_REFERENCE.md §5. Coordinates are logical px
// on the 768x432 normalized backdrop.
window.ROOMS=window.ROOMS||{};
ROOMS['STORE-BACK-A']={
  size:[768,432],
  states:{A:'STORE-BACK-A',B:'STORE-BACK-B'},
  spriteScale:1.8, // CANON. Back room reads as a smaller space (props drawn
                   // large), so the player is scaled up to match. Tune freely;
                   // 1 = the INT-A baseline. Anchored at the feet.
  grid:4,
  mask:'5383:0,52:1,140:0,52:1,140:0,52:1,140:0,52:1,140:0,52:1,140:0,52:1,140:0,52:1,140:0,52:1,140:0,52:1,140:0,52:1,140:0,90:1,102:0,90:1,102:0,90:1,25:0,16:1,61:0,90:1,25:0,16:1,61:0,90:1,25:0,16:1,61:0,90:1,25:0,16:1,61:0,90:1,25:0,16:1,61:0,90:1,25:0,16:1,61:0,90:1,25:0,31:1,46:0,90:1,20:0,47:1,35:0,90:1,20:0,47:1,35:0,90:1,20:0,47:1,35:0,90:1,20:0,47:1,35:0,90:1,20:0,47:1,35:0,90:1,20:0,47:1,35:0,90:1,20:0,47:1,35:0,90:1,20:0,47:1,35:0,90:1,20:0,47:1,35:0,90:1,20:0,47:1,59:0,66:1,20:0,47:1,59:0,66:1,20:0,47:1,59:0,66:1,20:0,47:1,59:0,66:1,20:0,47:1,59:0,66:1,20:0,47:1,59:0,66:1,20:0,47:1,59:0,66:1,20:0,47:1,59:0,71:1,15:0,47:1,59:0,71:1,15:0,47:1,59:0,71:1,15:0,47:1,59:0,133:1,59:0,133:1,59:0,133:1,59:0,133:1,35:0,157:1,35:0,157:1,35:0,157:1,35:0,157:1,35:0,157:1,35:0,157:1,35:0,157:1,35:0,157:1,35:0,157:1,35:0,157:1,35:0,157:1,35:0,157:1,35:0,157:1,35:0,78:1,11:0,68:1,35:0,53:1,4:0,18:1,14:0,68:1,35:0,53:1,4:0,18:1,14:0,8:1,17:0,43:1,35:0,53:1,4:0,18:1,14:0,8:1,17:0,63:1,72:0,18:1,14:0,8:1,17:0,63:1,72:0,18:1,14:0,8:1,17:0,63:1,72:0,18:1,14:0,8:1,17:0,63:1,72:0,18:1,14:0,8:1,17:0,63:1,72:0,18:1,14:0,8:1,17:0,63:1,72:0,18:1,14:0,8:1,17:0,63:1,104:0,8:1,17:0,63:1,104:0,8:1,17:0,63:1,104:0,8:1,17:0,32:1,135:0,8:1,16:0,33:1,135:0,8:1,16:0,33:1,135:0,8:1,16:0,33:1,135:0,57:1,135:0,57:1,135:0,57:1,135:0,57:1,807:0', // <- mask2json.py fills this from assets/masks/STORE-BACK-A.mask.png
  walkBehind:[ // GENERATED from STORE-BACK-A.occl.png -- repaint there, don't hand-edit
    {x:40,y:112,w:28,h:12,horizon:232,note:'occl-1'},
    {x:72,y:112,w:28,h:12,horizon:232,note:'occl-1'},
    {x:28,y:116,w:8,h:8,horizon:232,note:'occl-1'},
    {x:112,y:116,w:8,h:8,horizon:232,note:'occl-1'},
    {x:28,y:124,w:96,h:108,horizon:232,note:'occl-1'},
    {x:420,y:308,w:56,h:44,horizon:352,note:'occl-3'},
    {x:32,y:308,w:60,h:52,horizon:360,note:'occl-2'},
    {x:108,y:324,w:24,h:12,horizon:360,note:'occl-4'},
    {x:136,y:324,w:32,h:24,horizon:360,note:'occl-4'},
    {x:100,y:336,w:32,h:12,horizon:360,note:'occl-4'},
    {x:184,y:340,w:44,h:20,horizon:360,note:'occl-5'},
    {x:100,y:348,w:76,h:12,horizon:360,note:'occl-4'},
    {x:256,y:352,w:72,h:20,horizon:384,note:'occl-6'},
    {x:256,y:372,w:80,h:4,horizon:384,note:'occl-6'},
    {x:244,y:376,w:92,h:8,horizon:384,note:'occl-6'},
    {x:676,y:368,w:56,h:20,horizon:388,note:'occl-8'},
    {x:612,y:372,w:44,h:20,horizon:392,note:'occl-9'},
    {x:372,y:352,w:12,h:64,horizon:416,note:'occl-7'}
  ],
  spawns:{
    default:[384,330],     // middle of the room, facing the transmitter
    fromStore:[130,128]    // stepping through the STAFF ONLY door
  },
  exits:[
    // The STAFF ONLY door, top-left (x~96..165). Trigger is the floor strip
    // in front of it -- floor begins at y=112, and Mask.canStand uses a 12px
    // foot box, so the usable band starts at y=116. The old rect sat at the bottom
    // of the room by the GOOD MUSIC sign: wrong wall, and only 30% walkable.
    {rect:[104,116,52,14],to:'STORE-INT-A',spawn:'fromBack',face:'up'}
  ],
  hotspots:[
    {id:'transmitter',rect:[430,70,190,130],face:'up',op:'transmitter_look'},
    {id:'logSign',rect:[418,340,70,80],face:'down',op:'good_music_sign'}
  ],
  fx:[ // `at` is the CENTRE of the effect, not its top-left.
    //  HAND-AUTHORED. Nudge these numbers freely, then re-run
    //  `py tools\anchorview.py STORE-BACK-A B` to see where they land.
    //  (tubeGlow + onAir overlays removed per producer — the painted sign and
    //   meters still live in the STORE-BACK-B backdrop art itself.)
    {kind:'deskLamp',at:[700,158],state:'AB'}  // the lamp head, right desk
  ],
  npcSlots:{izzy:[470,310],noah:[430,320]}
};
