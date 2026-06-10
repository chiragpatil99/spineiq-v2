/**
 * SpineIQ v2 — Page Templates (Gamified)
 */

// ── VIDEO GATE ─────────────────────────────────────────────────────
const watchedVideos = {};

function markWatched(id) {
  watchedVideos[id] = true;
  var btn = document.getElementById('vwb-' + id);
  var form = document.getElementById('vf-' + id);
  var gate = document.getElementById('vg-' + id);
  if (btn)  { btn.innerHTML = '✅ Video watched — form unlocked'; btn.classList.add('watched'); }
  if (form) { form.style.pointerEvents = 'auto'; form.style.opacity = '1'; }
  if (gate) gate.style.opacity = '1';
  if (typeof updateActions === 'function') updateActions();
}

document.addEventListener('click', function(e) {
  var el = e.target.closest('.vid-play-area, .vid-watch-btn');
  if (el) { var vid = el.getAttribute('data-vid'); if (vid) markWatched(vid); }
});

function videoGate(id, title, duration, desc) {
  var w = watchedVideos[id];
  var html = '<div class="vid-gate-card">'
    + '<div class="vid-gate-label" style="color:' + (w ? '#1DB87A' : 'rgba(255,255,255,.7)') + '">'
    + (w ? '✅ Video watched' : '📹 Watch before continuing') + '</div>'
    + '<div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:3px">' + title + '</div>'
    + '<div style="font-size:12px;color:rgba(255,255,255,.5);margin-bottom:0">' + desc + '</div>'
    + '<div class="vid-play-area" id="vg-' + id + '" data-vid="' + id + '" style="opacity:' + (w?'1':'0.95') + '">'
    + '<div class="vid-play-circle"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>'
    + '<div class="vid-title">' + title + '</div>'
    + '<div class="vid-dur">' + duration + ' · Tap to play</div>'
    + '<div class="vid-dur-badge">' + duration + '</div>'
    + '</div>'
    + '<button class="vid-watch-btn ' + (w?'watched':'') + '" id="vwb-' + id + '" data-vid="' + id + '">'
    + (w ? '✅ Video watched — form unlocked' : '▶ Mark as watched to unlock form')
    + '</button></div>'
    + '<div id="vf-' + id + '" class="vid-form-wrap ' + (w?'':'locked') + '">';
  return html;
}

// ── RING SVG ───────────────────────────────────────────────────────
function ring(val, col) {
  var r = 20, c = 2 * Math.PI * r, dash = (val/100)*c;
  return '<svg width="56" height="56" viewBox="0 0 56 56">'
    + '<circle cx="28" cy="28" r="' + r + '" fill="none" stroke="var(--border)" stroke-width="5"/>'
    + '<circle cx="28" cy="28" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="5"'
    + ' stroke-linecap="round" stroke-dasharray="' + dash + ' ' + c + '" transform="rotate(-90 28 28)"/>'
    + '<text x="28" y="33" text-anchor="middle" font-size="13" font-weight="700" fill="' + col + '" font-family="inherit">' + val + '</text>'
    + '</svg>';
}

// ── PAGES ARRAY ────────────────────────────────────────────────────
const PAGES = [

  // 0 — Patient Info
  () => `
  <div class="step-hero">
    <div class="step-emoji">👤</div>
    <div>
      <div class="step-title">Patient Info</div>
      <div class="step-desc">Let's start with the basics</div>
      <div class="step-reward"><span class="step-reward-label">🪙 Earn ${STEP_COINS[0]} coins</span></div>
    </div>
  </div>
  <div class="progress-shield">
    <div class="shield-icon">🛡️</div>
    <div class="shield-bar-wrap">
      <div class="shield-label">Quest progress</div>
      <div class="shield-track"><div class="shield-fill" style="width:${Math.round((G.stepsCompleted.length/9)*100)}%"></div></div>
      <div class="shield-pct">${G.stepsCompleted.length}/9 steps · ${G.coins} 🪙 earned</div>
    </div>
  </div>
  <div class="card">
    <div class="card-label">Identity</div>
    <div class="field"><label>Full name</label>
    <input type="text" value="${D.p.name}" placeholder="Patient full name" oninput="D.p.name=this.value"></div>
    <div class="grid2">
      <div class="field"><label>Age (years)</label>
      <input type="number" value="${D.p.age}" placeholder="e.g. 38" oninput="D.p.age=this.value"></div>
      <div class="field"><label>Sex</label>
      <select onchange="D.p.gender=this.value">
        <option value="" ${!D.p.gender?'selected':''}>Select</option>
        <option value="male" ${D.p.gender==='male'?'selected':''}>Male</option>
        <option value="female" ${D.p.gender==='female'?'selected':''}>Female</option>
        <option value="other" ${D.p.gender==='other'?'selected':''}>Other</option>
      </select></div>
    </div>
  </div>
  <div class="card">
    <div class="card-label">Body measurements</div>
    <div class="grid2">
      <div class="field"><label>Height (cm)</label>
      <input type="number" id="ht" value="${D.p.height}" placeholder="170" oninput="updBMI()"></div>
      <div class="field"><label>Weight (kg)</label>
      <input type="number" id="wt" value="${D.p.weight}" placeholder="70" oninput="updBMI()"></div>
    </div>
    <div class="field"><label>BMI — auto calculated</label>
    <div class="bmi-badge" id="bmi-bd" style="color:${bmiCol(D.p.bmi)}">${D.p.bmi?D.p.bmi+' — '+bmiLbl(D.p.bmi):'Enter height & weight'}</div></div>
  </div>`,

  // 1 — Occupation
  () => `
  <div class="step-hero">
    <div class="step-emoji">💼</div>
    <div>
      <div class="step-title">Occupation</div>
      <div class="step-desc">What do you do for work?</div>
      <div class="step-reward"><span class="step-reward-label">🪙 Earn ${STEP_COINS[1]} coins</span></div>
    </div>
  </div>
  <div class="card">
    <div class="card-label">Select your role</div>
    <div class="option-grid">
      ${[['office','💻','Office Worker','Desk-based'],['field','🏗️','Field Worker','Outdoor'],
      ['driver','🚗','Driver','Vehicle operator'],['homemaker','🏠','Homemaker','Caregiver'],
      ['student','📚','Student','Full / part-time'],['manual','🔧','Manual Labour','Physical work'],
      ['healthcare','🩺','Healthcare','Medical professional'],['other','⚙️','Other','—']].map(([v,ic,lb,sub])=>`
      <button class="option-pill ${D.oc.type===v?'sel':''}" onclick="D.oc.type='${v}';render()">
        <span class="ico">${ic}</span><span class="lb">${lb}</span><span class="sub">${sub}</span>
      </button>`).join('')}
    </div>
    ${D.oc.type==='office'||D.oc.type==='student'?'<div class="alert alert-warn" style="margin-top:12px">⚠ Desk-based role — higher sedentary risk noted</div>':''}
    ${D.oc.type==='driver'?'<div class="alert alert-warn" style="margin-top:12px">⚠ Driver role — whole-body vibration risk noted</div>':''}
    ${D.oc.type==='manual'?'<div class="alert alert-danger" style="margin-top:12px">⚠ Manual labour — elevated mechanical load risk</div>':''}
  </div>`,

  // 2 — Work Patterns
  () => `
  <div class="step-hero">
    <div class="step-emoji">⏰</div>
    <div>
      <div class="step-title">Work Patterns</div>
      <div class="step-desc">How do you spend your workday?</div>
      <div class="step-reward"><span class="step-reward-label">🪙 Earn ${STEP_COINS[2]} coins</span></div>
    </div>
  </div>
  <div class="card">
    <div class="card-label">Daily time distribution</div>
    ${[['sitting','🪑 Sitting hours/day',0,16,'h'],['standing','🧍 Standing hours/day',0,12,'h'],['driving','🚗 Driving hours/day',0,12,'h']].map(([k,l,mn,mx,u])=>`
    <div class="field">
      <div class="rlrow"><label>${l}</label><span class="rv" id="rv-${k}">${D.wp[k]}${u}</span></div>
      <input type="range" min="${mn}" max="${mx}" step="0.5" value="${D.wp[k]}"
        oninput="D.wp['${k}']=+this.value;document.getElementById('rv-${k}').textContent=this.value+'${u}';checkSitting()">
    </div>`).join('')}
    <div id="sitting-alert"></div>
  </div>
  <div class="card">
    <div class="card-label">Lifting demands</div>
    <div class="tgroup">
      ${[['none','🪶 None'],['light','📦 Light'],['moderate','🏋️ Moderate'],['heavy','⚒️ Heavy']].map(([v,l])=>`
      <button class="tbtn ${D.wp.lifting===v?'sel-normal':''}" onclick="D.wp.lifting='${v}';render()">${l}</button>`).join('')}
    </div>
    ${D.wp.lifting==='heavy'?'<div class="alert alert-danger" style="margin-top:10px">⚠ Heavy lifting — primary disc herniation risk factor</div>':''}
  </div>`,

  // 3 — Lifestyle
  () => `
  <div class="step-hero">
    <div class="step-emoji">🌿</div>
    <div>
      <div class="step-title">Lifestyle</div>
      <div class="step-desc">Sleep, movement, and daily habits</div>
      <div class="step-reward"><span class="step-reward-label">🪙 Earn ${STEP_COINS[3]} coins</span></div>
    </div>
  </div>
  <div class="card">
    <div class="card-label">💤 Sleep</div>
    <div class="grid2">
      <div class="field">
        <div class="rlrow"><label>Hours/night</label><span class="rv" id="rv-sl">${D.ls.sleep}h</span></div>
        <input type="range" min="3" max="12" step="0.5" value="${D.ls.sleep}"
          oninput="D.ls.sleep=+this.value;document.getElementById('rv-sl').textContent=this.value+'h'">
      </div>
      <div class="field"><label>Sleep quality</label>
      <div class="tgroup" style="flex-direction:column;gap:5px">
        ${[['excellent','😴 Excellent'],['good','🙂 Good'],['fair','😐 Fair'],['poor','😞 Poor']].map(([v,l])=>`
        <button class="tbtn ${D.ls.sleepQ===v?'sel-normal':''}" style="text-align:left" onclick="D.ls.sleepQ='${v}'">${l}</button>`).join('')}
      </div></div>
    </div>
  </div>
  <div class="card">
    <div class="card-label">🏃 Activity</div>
    <div class="field">
      <div class="rlrow"><label>Walking min/day</label><span class="rv" id="rv-wk">${D.ls.walking} min</span></div>
      <input type="range" min="0" max="120" step="5" value="${D.ls.walking}"
        oninput="D.ls.walking=+this.value;document.getElementById('rv-wk').textContent=this.value+' min'">
    </div>
    <div class="field"><label>Daily steps</label>
    <input type="number" value="${D.ls.steps}" placeholder="e.g. 8000" oninput="D.ls.steps=+this.value"></div>
    <div class="field"><label>Exercise frequency</label>
    <div class="tgroup">
      ${[['none','🛋️ None'],['once','1× /wk'],['twice','2× /wk'],['three','4× /wk'],['daily','🔥 Daily']].map(([v,l])=>`
      <button class="tbtn ${D.ls.exFreq===v?'sel-normal':''}" onclick="D.ls.exFreq='${v}'">${l}</button>`).join('')}
    </div></div>
  </div>`,

  // 4 — Health Data
  () => {
    const W=[{id:'manual',icon:'📋',name:'Manual'},{id:'googlefit',icon:'🔷',name:'Google Fit'},
      {id:'apple',icon:'⌚',name:'Apple Watch'},{id:'fitbit',icon:'💚',name:'Fitbit'},
      {id:'samsung',icon:'📱',name:'Samsung'},{id:'garmin',icon:'🏃',name:'Garmin'},
      {id:'xiaomi',icon:'🔴',name:'Mi Band'},{id:'amazfit',icon:'🔵',name:'Amazfit'},
      {id:'oneplus',icon:'🟢',name:'OnePlus'}];
    return `
    <div class="step-hero">
      <div class="step-emoji">📱</div>
      <div>
        <div class="step-title">Health Data</div>
        <div class="step-desc">Connect your wearable or enter manually</div>
        <div class="step-reward"><span class="step-reward-label">🪙 Earn ${STEP_COINS[4]} coins</span></div>
      </div>
    </div>
    <div class="card">
      <div class="card-label">Data source</div>
      <div class="wgrid">${W.map(w=>`<button class="wcard ${D.hd.src===w.id?'sel':''}" onclick="D.hd.src='${w.id}';render()">
        <div class="wcard-icon">${w.icon}</div>${w.name}</button>`).join('')}</div>
      ${D.hd.src!=='manual'&&D.hd.src!=='googlefit'?'<div class="alert alert-info">ℹ Phase 2: Auto-sync coming. Enter manually for now.</div>':''}
    </div>
    <div class="card">
      <div class="card-label">Health metrics</div>
      <div class="grid2">
        ${[['steps','Daily steps','e.g. 8500'],['walkMin','Walking min','e.g. 45'],
           ['exMin','Exercise min','e.g. 30'],['activeMin','Active min','e.g. 60'],
           ['sedentary','Sedentary hrs','e.g. 9'],['sleepDur','Sleep hrs','e.g. 7.5'],
           ['rhr','Resting HR','e.g. 65'],['weight','Weight (kg)','e.g. 74']].map(([k,l,ph])=>`
        <div class="field"><label>${l}</label>
        <input type="number" value="${D.hd[k]||''}" placeholder="${ph}" oninput="D.hd['${k}']=this.value"></div>`).join('')}
      </div>
    </div>`;
  },

  // 5 — Pain Assessment (video gated)
  () => videoGate('pain','Understanding Back Pain & VAS Scale','2:30',
    'Learn how to accurately rate your pain before completing this section.') + `
  <div class="step-hero">
    <div class="step-emoji">❤️</div>
    <div>
      <div class="step-title">Pain Assessment</div>
      <div class="step-desc">Location, intensity & character of your pain</div>
      <div class="step-reward"><span class="step-reward-label">🪙 Earn ${STEP_COINS[5]} coins</span></div>
    </div>
  </div>
  <div class="card">
    <div class="card-label">Pain location & intensity</div>
    <div class="field"><label>Pain location</label>
    <select onchange="D.pa.loc=this.value">
      <option value="" ${!D.pa.loc?'selected':''}>Select location</option>
      <option value="lower_back" ${D.pa.loc==='lower_back'?'selected':''}>Lower back (lumbar)</option>
      <option value="mid_back" ${D.pa.loc==='mid_back'?'selected':''}>Mid back (thoracic)</option>
      <option value="upper_back" ${D.pa.loc==='upper_back'?'selected':''}>Upper back / cervical</option>
      <option value="lower_leg" ${D.pa.loc==='lower_leg'?'selected':''}>Lower back with leg pain</option>
      <option value="bilateral" ${D.pa.loc==='bilateral'?'selected':''}>Bilateral / widespread</option>
      <option value="sacral" ${D.pa.loc==='sacral'?'selected':''}>Sacral / tailbone</option>
    </select></div>
    <div class="field"><label>Pain intensity (0–10)</label>
    <div class="pain-scale">
      ${Array.from({length:11},(_,i)=>{
        const cls=D.pa.intensity===i?(i<=3?'active-low':i<=6?'active-mid':'active-high'):'';
        return `<button class="ps-btn ${cls}" onclick="D.pa.intensity=${i};render()">${i}</button>`;
      }).join('')}
    </div></div>
    <div class="grid2">
      <div class="field"><label>Duration</label>
      <select onchange="D.pa.duration=this.value">
        <option value="" ${!D.pa.duration?'selected':''}>Select</option>
        <option value="acute" ${D.pa.duration==='acute'?'selected':''}>Acute &lt;6 wks</option>
        <option value="subacute" ${D.pa.duration==='subacute'?'selected':''}>Subacute 6–12 wks</option>
        <option value="chronic" ${D.pa.duration==='chronic'?'selected':''}>Chronic &gt;3 months</option>
        <option value="recurrent" ${D.pa.duration==='recurrent'?'selected':''}>Recurrent</option>
      </select></div>
      <div class="field"><label>Radiation</label>
      <select onchange="D.pa.radiation=this.value">
        <option value="no" ${D.pa.radiation==='no'?'selected':''}>None</option>
        <option value="buttock" ${D.pa.radiation==='buttock'?'selected':''}>Into buttock</option>
        <option value="thigh" ${D.pa.radiation==='thigh'?'selected':''}>Into thigh</option>
        <option value="leg" ${D.pa.radiation==='leg'?'selected':''}>Into leg</option>
        <option value="foot" ${D.pa.radiation==='foot'?'selected':''}>Into foot</option>
      </select></div>
    </div>
    <div class="field"><label>Triggers</label>
    <input type="text" value="${D.pa.triggers}" placeholder="e.g. prolonged sitting, bending" oninput="D.pa.triggers=this.value"></div>
  </div>
  </div>`,

  // 6 — Radiculopathy & ODI (video gated)
  () => videoGate('odi','Understanding Nerve Pain & Disability','2:45',
    'Learn about nerve pain and how to rate your daily activity limitations.') + `
  <div class="step-hero">
    <div class="step-emoji">🧠</div>
    <div>
      <div class="step-title">Radiculopathy & ODI</div>
      <div class="step-desc">Leg symptoms and daily disability rating</div>
      <div class="step-reward"><span class="step-reward-label">🪙 Earn ${STEP_COINS[6]} coins</span></div>
    </div>
  </div>
  <div class="card">
    <div class="card-label">Leg radiculopathy (0–3)</div>
    ${[[0,'No pain in leg'],[1,'Mild, occasional'],[2,'Moderate, affects daily activities'],[3,'Severe, constant, marked limitation']].map(([v,l])=>`
    <label style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;margin-bottom:10px;font-weight:400;color:var(--text)">
      <input type="radio" name="rad" value="${v}" ${D.cl.radiculopathy==v?'checked':''} onchange="D.cl.radiculopathy=${v}"
        style="margin-top:2px;accent-color:var(--purple);width:auto;flex-shrink:0">
      <span><strong style="color:${v===0?'var(--green)':v===1?'var(--amber)':v===2?'#E65100':'var(--red)'}">Score ${v}</strong> — ${l}</span>
    </label>`).join('')}
  </div>
  <div class="card">
    <div class="card-label">ODI Disability — rate each activity</div>
    ${[['walking','🚶 Walking'],['sitting','🪑 Sitting'],['standing','🧍 Standing'],['sleep','😴 Sleep'],['daily','🏠 Daily Activities']].map(([k,l])=>`
    <div class="field"><label>${l}</label>
    <div class="tgroup">
      ${[['normal','Normal (0)','sel-normal'],['mild','Mild (1)','sel-mild'],['severe','Severe (2)','sel-mod'],['severe3','Very Severe (3)','sel-severe']].map(([v,lb,cls])=>`
      <button class="tbtn ${D.od[k]===v?cls:''}" onclick="D.od['${k}']='${v}';render()">${lb}</button>`).join('')}
    </div></div>`).join('')}
  </div>
  </div>`,

  // 7 — Red Flag (video gated)
  () => {
    const flags = [
      ['cancer','History of cancer'],['weightLoss','Unexplained weight loss'],
      ['fever','Fever / infection'],['trauma','Recent major trauma'],
      ['bowelBladder','Bowel or bladder dysfunction'],['saddleAnesthesia','Saddle anesthesia'],
      ['neurologicDeficit','Progressive neurological deficit'],['otherPathology','Other serious pathology'],
    ];
    const anyFlag = Object.values(D.rf).some(v=>v);
    return videoGate('redflag','Understanding Red Flags in Back Pain','3:00',
      'Some symptoms require urgent care. Learn what each red flag means before answering.')
      + `
    <div class="step-hero">
      <div class="step-emoji">🚩</div>
      <div>
        <div class="step-title">Red Flag Screening</div>
        <div class="step-desc">Check any that apply — any flag = urgent care</div>
        <div class="step-reward"><span class="step-reward-label">🪙 Earn ${STEP_COINS[7]} coins</span></div>
      </div>
    </div>
    <div class="card">
      <div class="card-label">Red flag indicators</div>
      ${flags.map(([k,l])=>`
      <label style="display:flex;align-items:center;gap:12px;cursor:pointer;padding:10px 0;border-bottom:1px solid var(--border);font-weight:500;color:var(--text)">
        <input type="checkbox" ${D.rf[k]?'checked':''} onchange="D.rf['${k}']=this.checked;render()"
          style="accent-color:var(--red);width:18px;height:18px;flex-shrink:0">
        ${l}
      </label>`).join('')}
      ${anyFlag
        ?'<div class="alert alert-danger" style="margin-top:12px">🚨 <strong>Red flag present — urgent evaluation required.</strong></div>'
        :'<div class="alert alert-info" style="margin-top:12px">✓ No red flags — continue with standard assessment.</div>'}
    </div>
    </div>`;
  },

  // 8 — Functional
  () => {
    const F=[['sit','🪑 Sitting'],['stand','🧍 Standing'],['walk','🚶 Walking'],['stairs','🪜 Stairs'],['lift','🏋️ Lifting']];
    const O=[['normal','Normal','sel-normal'],['mildly_limited','Mild limit','sel-mild'],['moderately_limited','Moderate','sel-mod'],['severely_limited','Severe','sel-severe']];
    return `
    <div class="step-hero">
      <div class="step-emoji">🏃</div>
      <div>
        <div class="step-title">Functional Status</div>
        <div class="step-desc">Rate your current physical capacity</div>
        <div class="step-reward"><span class="step-reward-label">🪙 Earn ${STEP_COINS[8]} coins · Final step!</span></div>
      </div>
    </div>
    <div class="card">
      ${F.map(([k,l])=>`
      <div class="field"><label>${l}</label>
      <div class="tgroup">${O.map(([v,lb,cls])=>`
        <button class="tbtn ${D.fn[k]===v?cls:''}" onclick="D.fn['${k}']='${v}';render()">${lb}</button>`).join('')}
      </div></div>`).join('')}
    </div>`;
  },
];
