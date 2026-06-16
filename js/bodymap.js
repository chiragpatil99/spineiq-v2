/**
 * SpineIQ v2 — Body Map helpers
 */

var ZONE_MAP = {
  cervical:  { label:'Upper back / cervical', color:'#534AB7' },
  thoracic:  { label:'Mid back (thoracic)',   color:'#E24B4A' },
  lumbar:    { label:'Lower back (lumbar)',    color:'#E24B4A' },
  sacral:    { label:'Sacral / tailbone',      color:'#EF9F27' },
  lower_leg: { label:'Lower back + leg pain',  color:'#1D9E75' },
};

function zoneLabel(z) { return (ZONE_MAP[z]||{}).label || z; }
function zoneColor(z) { return (ZONE_MAP[z]||{}).color || '#534AB7'; }

function selectBodyZone(zone) {
  D.pa.loc = zone;
  if (typeof render === 'function') render();
}

function renderBodyZones() {
  var zones = [
    { id:'cervical', x:58, y:48,  w:44, h:36 },
    { id:'thoracic', x:56, y:84,  w:48, h:34 },
    { id:'lumbar',   x:56, y:116, w:48, h:28 },
    { id:'sacral',   x:56, y:142, w:48, h:20 },
  ];
  var out = '';
  zones.forEach(function(z) {
    var sel = D.pa.loc === z.id;
    var col = sel ? zoneColor(z.id) : 'transparent';
    var stk = sel ? zoneColor(z.id) : 'transparent';
    var cy  = z.y + Math.round(z.h / 2);
    out += '<rect x="'+z.x+'" y="'+z.y+'" width="'+z.w+'" height="'+z.h+'" rx="6"'
        +  ' fill="'+col+'33" stroke="'+stk+'" stroke-width="1.5"'
        +  ' style="cursor:pointer" onclick="selectBodyZone(\''+z.id+'\')" />';
    if (sel) {
      out += '<circle cx="80" cy="'+cy+'" r="6" fill="'+col+'" class="pulse"/>';
    }
  });
  return out;
}
