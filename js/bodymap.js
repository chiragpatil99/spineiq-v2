/**
 * SpineIQ v2 — Body Map v2.0
 * Clean anatomical design with zone highlights and pulse animation
 */

var ZONE_MAP = {
  cervical: { label:'Upper back / cervical', color:'#8B7CF6', cy:59  },
  thoracic: { label:'Mid back (thoracic)',   color:'#F04060', cy:88  },
  lumbar:   { label:'Lower back (lumbar)',   color:'#F04060', cy:117 },
  sacral:   { label:'Sacral / tailbone',     color:'#FFB020', cy:141 },
};

var _pulseAnim = null;

function zoneLabel(z) { return (ZONE_MAP[z]||{}).label || z; }
function zoneColor(z) { return (ZONE_MAP[z]||{}).color || '#8B7CF6'; }

function selectBodyZone(zone) {
  D.pa.loc = zone;
  if (typeof render === 'function') render();
}

function renderBodyZones() {
  var zones = [
    { id:'cervical', x:44, y:45,  w:42, h:28 },
    { id:'thoracic', x:42, y:73,  w:46, h:30 },
    { id:'lumbar',   x:42, y:103, w:46, h:28 },
    { id:'sacral',   x:42, y:131, w:46, h:20 },
  ];
  var out = '';
  zones.forEach(function(z) {
    var sel = D.pa.loc === z.id;
    var col = ZONE_MAP[z.id].color;
    var cy  = ZONE_MAP[z.id].cy;

    // Zone highlight
    out += '<rect x="'+z.x+'" y="'+z.y+'" width="'+z.w+'" height="'+z.h+'" rx="5"'
        + ' fill="'+(sel ? col+'33' : 'transparent')+'"'
        + ' stroke="'+(sel ? col : 'transparent')+'" stroke-width="1.5"'
        + ' style="cursor:pointer" onclick="selectBodyZone(\''+z.id+'\')" />';

    // Pulse dot when selected
    if (sel) {
      out += '<circle cx="65" cy="'+cy+'" r="5" fill="'+col+'" class="bm-pulse-dot" id="bm-pulse-'+z.id+'"/>'
           + '<circle cx="65" cy="'+cy+'" r="5" fill="none" stroke="'+col+'" stroke-width="1.5" class="bm-pulse-ring" id="bm-ring-'+z.id+'"/>';
    }
  });
  return out;
}

// ── BODY MAP HTML RENDERER ────────────────────────────────────────
function renderBodyMapHtml() {
  var sel = D.pa.loc;
  var selInfo = sel ? ZONE_MAP[sel] : null;

  return '<div class="bm-outer">'

    // Header
    + '<div class="bm-card-hdr">Pain location</div>'

    // Body + labels row
    + '<div class="bm-body-row">'

      // SVG
      + '<div class="bm-svg-wrap">'
      + '<svg width="130" height="250" viewBox="0 0 130 250" style="display:block">'

        // Body silhouette
        + '<ellipse cx="65" cy="22" rx="14" ry="16" class="body-fill"/>'
        + '<rect x="57" y="36" width="16" height="11" rx="3" class="body-fill"/>'
        + '<path d="M42 47 Q40 72 38 100 Q37 118 40 140 L90 140 Q93 118 92 100 Q90 72 88 47 Z" class="body-fill"/>'
        + '<ellipse cx="38" cy="54" rx="8" ry="7" class="body-fill"/>'
        + '<ellipse cx="92" cy="54" rx="8" ry="7" class="body-fill"/>'
        + '<path d="M31 54 Q22 76 20 104 Q18 118 22 130 Q27 134 32 130 Q37 118 37 104 Q38 82 40 62 Z" class="body-fill"/>'
        + '<path d="M99 54 Q108 76 110 104 Q112 118 108 130 Q103 134 98 130 Q93 118 93 104 Q92 82 90 62 Z" class="body-fill"/>'
        + '<path d="M40 138 Q36 148 38 162 L92 162 Q94 148 90 138 Z" class="body-fill"/>'
        + '<path d="M40 160 Q37 184 36 208 Q35 220 38 230 Q44 234 50 230 Q56 220 56 208 Q57 186 58 160 Z" class="body-fill"/>'
        + '<path d="M74 160 Q75 184 76 208 Q77 220 80 230 Q86 234 92 230 Q96 220 94 208 Q92 186 90 160 Z" class="body-fill"/>'
        + '<ellipse cx="44" cy="234" rx="10" ry="5" class="body-fill"/>'
        + '<ellipse cx="86" cy="234" rx="10" ry="5" class="body-fill"/>'

        // Spine
        + '<line x1="65" y1="47" x2="65" y2="140" class="spine-line"/>'
        + '<circle cx="65" cy="55"  r="2" class="spine-dot"/>'
        + '<circle cx="65" cy="66"  r="2" class="spine-dot"/>'
        + '<circle cx="65" cy="77"  r="2" class="spine-dot"/>'
        + '<circle cx="65" cy="88"  r="2" class="spine-dot"/>'
        + '<circle cx="65" cy="99"  r="2" class="spine-dot"/>'
        + '<circle cx="65" cy="110" r="2" class="spine-dot"/>'
        + '<circle cx="65" cy="121" r="2" class="spine-dot"/>'
        + '<circle cx="65" cy="132" r="2" class="spine-dot"/>'

        // Zone highlights + hit areas
        + renderBodyZones()

      + '</svg>'
      + '</div>'

      // Zone labels
      + '<div class="bm-labels">'
      + Object.keys(ZONE_MAP).map(function(z) {
          var isSel = D.pa.loc === z;
          return '<div class="bm-zone-lbl '+(isSel?'bm-zone-lbl-active':'')+'" onclick="selectBodyZone(\''+z+'\')" style="'+(isSel?'color:'+ZONE_MAP[z].color:'')+';">'
            + '<span class="bm-zone-indicator" style="background:'+(isSel?ZONE_MAP[z].color:'var(--border2)')+'"></span>'
            + ZONE_MAP[z].label.split(' ')[0]+'<br><span style="font-size:10px;opacity:.7">'+ZONE_MAP[z].label.split('/')[1]||''+'</span>'
            + '</div>';
        }).join('')
      + '</div>'

    + '</div>'

    // Selection chip
    + '<div class="bm-sel-row">'
    + (sel
        ? '<div class="bm-sel-chip"><span class="bm-sel-dot" style="background:'+selInfo.color+'"></span>'+selInfo.label+'</div>'
          + '<button class="bm-clear-btn" onclick="selectBodyZone(\'\');render()">× Clear</button>'
        : '<span class="bm-hint">👆 Tap a region on the body</span>')
    + '</div>'

    // Radiation
    + (sel ? '<div class="bm-rad-wrap">'
        + '<div class="bm-rad-title">Does pain radiate?</div>'
        + '<div class="bm-rad-pills">'
        + [['no','None'],['buttock','→ Buttock'],['thigh','→ Thigh'],['leg','→ Leg'],['foot','→ Foot/toes']].map(function(r) {
            return '<button class="bm-rad-pill '+(D.pa.radiation===r[0]?'bm-rad-active':'')+'" onclick="D.pa.radiation=\''+r[0]+'\';render()">'+r[1]+'</button>';
          }).join('')
        + '</div></div>'
        : '')

    + '</div>';
}
