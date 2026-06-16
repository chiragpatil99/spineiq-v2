/**
 * SpineIQ v2 — App Controller v3.0
 * 5-tab navigation: Home | Track | Quest | Levels | Rewards
 */

let currentStep = 0;
const TOTAL_STEPS = 9;
const API_PROXY_URL = 'https://spineiq-backend.onrender.com/api/generate-report';
const VIDEO_GATES = { 5:'pain', 6:'odi', 7:'redflag' };
const STEP_NAMES = [
  'Patient Info','Occupation','Work Patterns','Lifestyle',
  'Health Data','Pain Assessment','Radiculopathy & ODI',
  'Red Flag Screening','Functional Status'
];

let currentTab = 'home';

// ── TAB SWITCHING ─────────────────────────────────────────────────
function switchTab(tab) {
  currentTab = tab;
  ['home','track','assess','levels','rewards'].forEach(function(t) {
    var screen = document.getElementById('screen-'+t);
    var tabBtn = document.getElementById('tab-'+t);
    if (screen) screen.classList.toggle('active', t===tab);
    if (tabBtn) tabBtn.classList.toggle('active', t===tab);
  });
  var reportScreen = document.getElementById('screen-report');
  if (reportScreen) reportScreen.classList.remove('active');
  var stepActions = document.getElementById('step-actions');
  if (stepActions) stepActions.style.display = tab==='assess'?'flex':'none';
  document.getElementById('app-content').scrollTo(0,0);

  if (tab==='home')    renderHome();
  if (tab==='track')   renderTrack();
  if (tab==='levels')  renderLevels();
  if (tab==='rewards') renderRewards();
  if (tab==='report')  { document.getElementById('screen-report').classList.add('active'); }
  if (tab==='assess' && !G.stepsCompleted.length) render();
}

// ── RENDER ASSESSMENT ────────────────────────────────────────────
function render() {
  var main = document.getElementById('main');
  if (!main) return;
  main.innerHTML = PAGES[currentStep]();
  updateProgress();
  updateActions();
  document.getElementById('app-content').scrollTo({top:0,behavior:'smooth'});
}

function goStep(n) { currentStep=n; render(); }
function goToStep(n) { currentStep=n; switchTab('assess'); render(); }

function updateProgress() {
  var pct = Math.round(((currentStep+1)/TOTAL_STEPS)*100);
  var fill = document.getElementById('xp-fill');
  var name = document.getElementById('step-name');
  var xp   = document.getElementById('step-xp');
  var dots = document.getElementById('step-dots');
  if (fill) fill.style.width = pct+'%';
  if (name) name.textContent = STEP_NAMES[currentStep];
  if (xp)   xp.textContent = '+'+STEP_COINS[currentStep]+' 🪙';
  if (dots) dots.innerHTML = Array.from({length:TOTAL_STEPS},function(_,i){
    return '<div class="sdot '+(i<currentStep?'done':i===currentStep?'active':'')+'""></div>';
  }).join('');
}

function updateActions() {
  var actions = document.getElementById('step-actions');
  if (!actions) return;
  var gateId = VIDEO_GATES[currentStep];
  var locked = gateId && !watchedVideos[gateId];
  var isLast = currentStep === TOTAL_STEPS-1;
  actions.innerHTML = (currentStep>0?'<button class="btn-back" onclick="goStep('+(currentStep-1)+')">← Back</button>':'')
    +(!isLast
      ?'<button class="btn-next '+(locked?'locked':'')+'" onclick="'+(locked?'showToast(\'Watch the video to continue 📹\')':'completeStep('+currentStep+')')+'" style="'+(currentStep===0?'flex:1':'')+'">'
        +(locked?'🔒 Watch video first':'Continue →')+'</button>'
      :'<button class="btn-next" onclick="completeFinalStep()" style="'+(currentStep===0?'flex:1':'')+'">'+'View My Report 🏆</button>');
}

// ── STEP COMPLETE ─────────────────────────────────────────────────
function completeStep(idx) {
  onStepComplete(idx);
  var orig = window.dismissStepOverlay;
  window.dismissStepOverlay = function(btn) {
    orig(btn);
    goStep(idx+1);
    window.dismissStepOverlay = orig;
  };
}

function completeFinalStep() {
  onStepComplete(TOTAL_STEPS-1);
  var orig = window.dismissStepOverlay;
  window.dismissStepOverlay = function(btn) {
    orig(btn);
    window.dismissStepOverlay = orig;
    buildReport();
    currentTab = 'report';
    ['home','track','assess','levels','rewards'].forEach(function(t){
      document.getElementById('screen-'+t)?.classList.remove('active');
      document.getElementById('tab-'+t)?.classList.remove('active');
    });
    document.getElementById('screen-report').classList.add('active');
    document.getElementById('tab-report-dot')?.classList.add('show');
  };
}

// ── BMI & HELPERS ─────────────────────────────────────────────────
function updBMI() {
  var h=document.getElementById('ht')?.value||D.p.height;
  var w=document.getElementById('wt')?.value||D.p.weight;
  D.p.height=h;D.p.weight=w;D.p.bmi=calcBMI(h,w);
  var el=document.getElementById('bmi-bd');
  if (el){el.textContent=D.p.bmi?D.p.bmi+' — '+bmiLbl(D.p.bmi):'Enter height & weight';el.style.color=bmiCol(D.p.bmi);}
}

function checkSitting() {
  var el=document.getElementById('sitting-alert');
  if (!el) return;
  el.innerHTML=D.wp.sitting>8?'<div class="alert alert-warn">⚠ '+D.wp.sitting+'h/day exceeds safe limits</div>':'';
}

function showToast(msg) {
  var el=document.getElementById('toast');
  if (!el){el=document.createElement('div');el.id='toast';document.body.appendChild(el);}
  el.textContent=msg;el.style.display='block';
  setTimeout(function(){el.style.display='none';},2500);
}

// ── MARKDOWN RENDERER ─────────────────────────────────────────────
function mdToHtml(text) {
  var lines = text.split('\n');
  var out = [];
  lines.forEach(function(line) {
    line = line.trim();
    if (!line) return;
    if (line.match(/^## \d+\./)) {
      var parts = line.replace(/^## (\d+)\. (.+)$/, '$1|||$2').split('|||');
      out.push('<div class="rep-sec-hdr"><span class="rep-sec-num">'+(parts[0]||'')+'</span><span class="rep-sec-title">'+(parts[1]||'')+'</span></div>');
    } else if (line.match(/^---+$/)) {
      out.push('<div class="rep-divider"></div>');
    } else {
      var f = line.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
      out.push('<p class="rep-p">'+f+'</p>');
    }
  });
  return out.join('');
}

// ── REPORT ────────────────────────────────────────────────────────
function buildReport() {
  var sc=score(),sss=calcSSS(),contribs=getContributors(),bench=habitBenchmark();
  var initials=(D.p.name||'P').split(' ').map(function(w){return w[0];}).join('').substring(0,2).toUpperCase();
  var spineScore=Math.max(0,100-sc.risk);
  var rank=getCurrentRank(spineScore);
  var SCORES=[
    ['Lifestyle',sc.lifestyle,'#6C3FE8'],['Activity',sc.activity,'#00C4A8'],
    ['Sleep',sc.sleep,'#4090F5'],['Mobility',sc.mobility,'#FF9900'],['Weight',sc.obesity,'#1DB87A'],
  ];

  document.getElementById('screen-report').innerHTML = `
  <div style="background:var(--purple);padding:14px 18px 16px;position:sticky;top:0;z-index:5">
    <div style="font-size:16px;font-weight:800;color:#fff">Your Report</div>
    <div style="font-size:12px;color:rgba(255,255,255,.6)">${D.p.name||'Patient'} · ${rank.icon} ${rank.name}</div>
  </div>
  <div style="padding:14px;padding-bottom:90px;display:flex;flex-direction:column;gap:12px">

    <div style="background:linear-gradient(135deg,var(--purple),var(--teal));border-radius:var(--r2);padding:16px;display:flex;align-items:center;gap:12px;box-shadow:var(--shadow-lg)">
      <div style="width:46px;height:46px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:#fff">${initials}</div>
      <div>
        <div style="font-size:15px;font-weight:800;color:#fff">${D.p.name||'Patient'}</div>
        <div style="font-size:12px;color:rgba(255,255,255,.7)">${D.p.age?D.p.age+' yrs':''} ${D.p.gender?'· '+D.p.gender:''} ${D.oc.type?'· '+D.oc.type:''}</div>
        <span style="font-size:11px;font-weight:700;background:rgba(255,255,255,.2);color:#fff;padding:2px 8px;border-radius:10px;margin-top:4px;display:inline-block">BMI ${D.p.bmi||'—'} · ${bmiLbl(D.p.bmi)||'—'}</span>
        <span style="font-size:11px;font-weight:700;background:rgba(255,215,0,.2);color:#FFD700;padding:2px 8px;border-radius:10px;margin-top:4px;margin-left:4px;display:inline-block">🪙 ${G.coins}</span>
      </div>
    </div>

    <div class="sec-lbl">Back pain risk score</div>
    <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r2);overflow:hidden;box-shadow:var(--shadow)">
      <div style="padding:16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border)">
        <div>
          <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.8px;text-transform:uppercase;margin-bottom:6px">Overall risk</div>
          <div style="font-size:52px;font-weight:900;letter-spacing:-2px;line-height:1;color:${sc.riskCol}">${sc.risk}<span style="font-size:20px;font-weight:500;opacity:.6">/100</span></div>
        </div>
        <div style="background:${sc.riskCol};color:#fff;padding:8px 16px;border-radius:20px;font-size:13px;font-weight:800">${sc.riskLvl}</div>
      </div>
      <div style="padding:12px 16px;display:flex;align-items:center;gap:10px">
        <div style="flex:1;height:8px;background:var(--bg);border-radius:4px;overflow:hidden;border:1px solid var(--border)"><div style="height:100%;width:${sc.risk}%;background:${sc.riskCol};border-radius:4px"></div></div>
        <span style="font-size:11px;color:var(--text3)">${sc.risk}/100</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--border)">
        ${[['Low','0–34','var(--green)',sc.risk<35],['Moderate','35–64','var(--amber)',sc.risk>=35&&sc.risk<65],['High','65–100','var(--red)',sc.risk>=65]].map(function(z){
          return '<div style="padding:8px;text-align:center;border-right:1px solid var(--border);'+(z[3]?'background:'+sc.riskBg+';':'')+'">'
            +'<div style="width:6px;height:6px;border-radius:50%;background:'+z[2]+';margin:0 auto 3px;'+(z[3]?'outline:2px solid '+z[2]+';outline-offset:2px':'')+'"></div>'
            +'<div style="font-size:10px;font-weight:'+(z[3]?'800':'500')+';color:'+(z[3]?z[2]:'var(--text3)')+'">'+z[0]+'</div>'
            +'<div style="font-size:9px;color:var(--text3)">'+z[1]+'</div></div>';
        }).join('')}
      </div>
    </div>

    <div class="sec-lbl">Lifestyle dimensions</div>
    <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r2);padding:14px;box-shadow:var(--shadow)">
      <div style="font-size:11px;color:var(--text3);margin-bottom:12px">Each scored 0–100 · Higher is healthier</div>
      <div style="display:flex;justify-content:space-between">
        ${SCORES.map(function(s){
          var r=20,c=2*Math.PI*r,d=(s[1]/100)*c;
          return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px">'
            +'<svg width="56" height="56" viewBox="0 0 56 56">'
            +'<circle cx="28" cy="28" r="'+r+'" fill="none" stroke="var(--border)" stroke-width="5"/>'
            +'<circle cx="28" cy="28" r="'+r+'" fill="none" stroke="'+s[2]+'" stroke-width="5" stroke-linecap="round" stroke-dasharray="'+d+' '+c+'" transform="rotate(-90 28 28)"/>'
            +'<text x="28" y="33" text-anchor="middle" font-size="13" font-weight="700" fill="'+s[2]+'" font-family="inherit">'+s[1]+'</text>'
            +'</svg><span style="font-size:10px;font-weight:600;color:var(--text3);text-align:center">'+s[0]+'</span></div>';
        }).join('')}
      </div>
    </div>

    <div class="sec-lbl">Clinical severity (SSS)</div>
    <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r2);overflow:hidden;box-shadow:var(--shadow)">
      <div style="display:grid;grid-template-columns:repeat(5,1fr);border-bottom:1px solid var(--border)">
        ${[['VAS',sss.vas,2],['Radiculopathy',sss.radiculopathy,3],['ODI',sss.odi,2],['BMI',sss.bmiScore,2],['Chronicity',sss.chronicity,2]].map(function(x){
          return '<div style="padding:10px 4px;text-align:center;border-right:1px solid var(--border)">'
            +'<div style="font-size:18px;font-weight:800;color:var(--purple2)">'+x[1]+'</div>'
            +'<div style="font-size:9px;color:var(--text3)">/'+x[2]+'</div>'
            +'<div style="font-size:9px;color:var(--text3);margin-top:2px;line-height:1.3">'+x[0]+'</div></div>';
        }).join('')}
      </div>
      <div style="padding:14px 16px;display:flex;align-items:center;justify-content:space-between;background:${sss.bg}">
        <div><div style="font-size:9px;text-transform:uppercase;letter-spacing:.6px;color:${sss.col};opacity:.7;font-weight:700;margin-bottom:4px">Total SSS</div>
        <div style="font-size:38px;font-weight:900;letter-spacing:-1px;line-height:1;color:${sss.col}">${sss.total}<span style="font-size:16px;font-weight:500;opacity:.7">/11</span></div></div>
        <div style="text-align:right"><div style="background:${sss.col};color:#fff;padding:6px 14px;border-radius:16px;font-size:12px;font-weight:800;display:inline-block;margin-bottom:5px">${sss.level}</div>
        <div style="font-size:11px;color:${sss.col};max-width:140px;text-align:right;font-weight:500">${sss.mgmt}</div></div>
      </div>
    </div>

    ${bench?`
    <div class="sec-lbl">Age benchmarks · ${bench.group}</div>
    <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r2);overflow:hidden;box-shadow:var(--shadow)">
      ${bench.flags.map(function(f,i){
        return '<div style="display:flex;align-items:center;gap:10px;padding:11px 14px;'+(i<bench.flags.length-1?'border-bottom:1px solid var(--border)':'')+'\">'
          +'<div style="width:30px;height:30px;border-radius:9px;background:'+(f.col==='var(--green)'?'var(--green-dim)':f.col==='var(--amber)'?'var(--amber-dim)':'var(--red-dim)')+';display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px">'
          +(f.text.toLowerCase().includes('sit')?'🪑':f.text.toLowerCase().includes('walk')?'🚶':f.text.toLowerCase().includes('exercise')||f.text.toLowerCase().includes('activity')?'💪':'🌙')
          +'</div><div style="flex:1;font-size:12px;color:var(--text);line-height:1.4">'+f.text+'</div>'
          +'<span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:8px;flex-shrink:0;background:'+(f.col==='var(--green)'?'var(--green-dim)':f.col==='var(--amber)'?'var(--amber-dim)':'var(--red-dim)')+';color:'+(f.col==='var(--green)'?'var(--green)':f.col==='var(--amber)'?'var(--amber)':'var(--red)')+'\">'+(f.col==='var(--green)'?'✓ Healthy':f.col==='var(--amber)'?'Below ideal':'High risk')+'</span></div>';
      }).join('')}
    </div>`:''}

    <div class="sec-lbl">Probable contributors</div>
    <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r2);overflow:hidden;box-shadow:var(--shadow)">
      ${contribs.map(function(c,i){
        return '<div style="display:flex;align-items:flex-start;gap:10px;padding:11px 14px;'+(i<contribs.length-1?'border-bottom:1px solid var(--border)':'')+'\">'
          +'<div style="width:8px;height:8px;border-radius:50%;background:'+c[1]+';flex-shrink:0;margin-top:4px"></div>'
          +'<div style="flex:1;font-size:12px;color:var(--text);line-height:1.4">'+c[0]+'</div>'
          +'<span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:8px;flex-shrink:0;background:'+(c[1]==='var(--red)'?'var(--red-dim)':'var(--amber-dim)')+';color:'+(c[1]==='var(--red)'?'var(--red)':'var(--amber)')+'\">'+(c[1]==='var(--red)'?'High':'Moderate')+'</span></div>';
      }).join('')}
    </div>

    <button class="gen-btn" id="gbtn" onclick="genReport()">✦ Generate AI Clinical Report</button>
    <div id="rout"></div>
    <div id="download-wrap"></div>
  </div>`;
}

// ── AI REPORT ─────────────────────────────────────────────────────
async function genReport() {
  var btn=document.getElementById('gbtn'),out=document.getElementById('rout');
  if(!btn||!out) return;
  btn.disabled=true;btn.textContent='Generating…';
  out.innerHTML='<div class="gen-loading"><div class="spinner"></div>Waking up server…</div>';
  try{await fetch(API_PROXY_URL.replace('/api/generate-report',''),{method:'GET'});}catch(e){}
  out.innerHTML='<div class="gen-loading"><div class="spinner"></div>Generating clinical report…</div>';
  var sc=score();
  try {
    var ctrl=new AbortController(),t=setTimeout(function(){ctrl.abort();},90000);
    var res=await fetch(API_PROXY_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:buildReportPrompt(sc)}),signal:ctrl.signal});
    clearTimeout(t);
    var data=await res.json();
    if(!res.ok) throw new Error(data.error||'Server error');
    out.innerHTML='<div class="report-rendered">'+mdToHtml(data.report)+'</div>';
    G.badges.push('report_generated');
    checkBadges();
    awardCoins(25,'Report generated!');
    submitToLeaderboard(G.coins);
    var wrap=document.getElementById('download-wrap');
    if(wrap) wrap.innerHTML='<button class="dl-btn" onclick="downloadReport()">⬇ Download Report as PDF</button>';
  } catch(err){
    out.innerHTML='<div class="report-box" style="color:var(--red)">Generation failed. Tap Regenerate.</div>';
  }
  btn.disabled=false;btn.textContent='✦ Regenerate Report';
}

// ── PDF DOWNLOAD ──────────────────────────────────────────────────
function downloadReport() {
  var reportText=document.getElementById('rout')?.innerText||'';
  if(!reportText){showToast('Generate the report first');return;}
  var sc=score(),sss=calcSSS();
  var rCol=sc.risk<35?'#1DB87A':sc.risk<65?'#FF9900':'#F04060';
  var html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>SpineIQ Report</title>'
    +'<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;background:#fff;color:#1a1a1a}'
    +'.page{max-width:780px;margin:0 auto;padding:32px 36px}'
    +'.hdr{display:flex;justify-content:space-between;margin-bottom:28px;padding-bottom:20px;border-bottom:3px solid #6C3FE8}'
    +'.brand{font-size:26px;font-weight:900;color:#6C3FE8}.sec{font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#888;margin:24px 0 10px}'
    +'.scores{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:16px}'
    +'.sb{background:#f5f3ff;border:1px solid #c5bce8;border-radius:10px;padding:12px 8px;text-align:center}'
    +'.sv{font-size:24px;font-weight:900;color:#6C3FE8}.sl{font-size:11px;color:#888;margin-top:4px}'
    +'.risk{border-radius:12px;padding:18px 22px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;background:'+(sc.risk<35?'#e0faf1':sc.risk<65?'#fff4e0':'#ffeaee')+';border:1px solid '+rCol+'44}'
    +'.rn{font-size:46px;font-weight:900;color:'+rCol+';line-height:1}'
    +'.rb{background:'+rCol+';color:#fff;padding:8px 20px;border-radius:20px;font-weight:900;font-size:14px}'
    +'.rb2{font-size:13.5px;line-height:1.9;color:#2a2a2a;white-space:pre-wrap;margin-top:8px}'
    +'.ft{margin-top:36px;padding-top:14px;border-top:1px solid #eee;font-size:11px;color:#aaa;text-align:center}'
    +'@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><div class="page">'
    +'<div class="hdr"><div><div class="brand">SpineIQ</div><div style="font-size:12px;color:#888">Spine Health Intelligence Platform v2</div></div>'
    +'<table style="font-size:13px;color:#444;border-collapse:collapse"><tr><td style="color:#888;text-align:right;padding:2px 6px">Patient</td><td style="font-weight:700;padding:2px 6px">'+( D.p.name||'—')+'</td></tr>'
    +'<tr><td style="color:#888;text-align:right;padding:2px 6px">Age/Sex</td><td style="font-weight:700;padding:2px 6px">'+(D.p.age||'—')+' / '+(D.p.gender||'—')+'</td></tr>'
    +'<tr><td style="color:#888;text-align:right;padding:2px 6px">Coins</td><td style="font-weight:700;padding:2px 6px">🪙 '+G.coins+'</td></tr></table></div>'
    +'<div class="sec">Dimension Scores</div><div class="scores">'
    +[['Lifestyle',sc.lifestyle],['Activity',sc.activity],['Sleep',sc.sleep],['Mobility',sc.mobility],['Weight',sc.obesity]].map(function(s){return '<div class="sb"><div class="sv">'+s[1]+'</div><div class="sl">'+s[0]+'</div></div>';}).join('')
    +'</div><div class="risk"><div><div style="font-size:10px;text-transform:uppercase;color:'+rCol+';margin-bottom:4px;font-weight:700">Back Pain Risk</div><div class="rn">'+sc.risk+'<span style="font-size:20px;font-weight:500;opacity:.7">/100</span></div></div><div class="rb">'+sc.riskLvl+'</div></div>'
    +'<div class="sec">AI Clinical Assessment</div><div class="rb2">'+reportText+'</div>'
    +'<div class="ft">SpineIQ v2 | '+new Date().toLocaleString('en-GB')+'<br>Clinical decision support only. Not a substitute for clinical judgment.</div>'
    +'</div><script>window.onload=function(){window.print();}<\/script></body></html>';
  var w=window.open('','_blank');
  if(w){w.document.write(html);w.document.close();}
}


// ── THEME TOGGLE ─────────────────────────────────────────────────
function initTheme() {
  var saved = localStorage.getItem('spineiq_theme');
  if (saved) {
    applyTheme(saved);
  } else {
    // Auto-detect system preference
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }
}

function applyTheme(theme) {
  document.body.classList.remove('theme-light', 'theme-dark');
  document.body.classList.add('theme-' + theme);
  localStorage.setItem('spineiq_theme', theme);
  // Update toggle knob and label if visible
  var toggle = document.getElementById('theme-toggle');
  if (toggle) toggle.checked = theme === 'light';
  var knob = document.getElementById('toggle-knob');
  if (knob) knob.style.transform = theme === 'light' ? 'translateX(22px)' : 'translateX(0)';
  var label = document.getElementById('theme-label');
  if (label) label.textContent = theme === 'light' ? 'Light mode' : 'Dark mode';
}

function toggleTheme() {
  var current = localStorage.getItem('spineiq_theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// ── KEEP RENDER WARM ──────────────────────────────────────────────
setTimeout(function(){
  fetch(API_PROXY_URL.replace('/api/generate-report',''),{method:'GET'}).catch(function(){});
},2000);

// ── INIT STREAK ───────────────────────────────────────────────────
setTimeout(function(){ if(typeof initStreak==='function') initStreak(); },500);

// Init theme on load
initTheme();

// ── ONBOARDING ────────────────────────────────────────────────────
if (!sessionStorage.getItem('spineiq_v2_welcomed')) {
  showOnboarding();
} else {
  renderHome();
  switchTab('home');
}

function showOnboarding() {
  var overlay=document.createElement('div');
  overlay.id='onboarding-overlay';
  overlay.style.cssText='position:fixed;inset:0;z-index:9999;background:linear-gradient(160deg,#6C3FE8 0%,#3B1FA0 60%,#0D1E40 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;text-align:center;font-family:inherit';
  overlay.innerHTML='<div style="font-size:72px;margin-bottom:16px">🦴</div>'
    +'<div style="font-size:30px;font-weight:900;color:#fff;letter-spacing:-.5px;margin-bottom:6px">SpineIQ</div>'
    +'<div style="font-size:14px;color:rgba(255,255,255,.5);font-weight:500;margin-bottom:32px">Spine Health Quest</div>'
    +'<div style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:20px;padding:24px;margin-bottom:28px;width:100%;max-width:320px">'
    +'<div style="display:flex;flex-direction:column;gap:16px">'
    +[['🎯','9-step spine health assessment','Evidence-based, clinically validated'],
      ['🪙','Earn coins on every step','Complete the quest, unlock badges'],
      ['🏆','Climb ranks to Spine Legend','Beginner → Explorer → Legend'],
      ['🎁','Spend coins in rewards store','Free physio, doctor consult & more']
    ].map(function(x){return '<div style="display:flex;align-items:center;gap:14px;text-align:left"><div style="font-size:28px;flex-shrink:0">'+x[0]+'</div><div><div style="font-size:14px;font-weight:700;color:#fff">'+x[1]+'</div><div style="font-size:12px;color:rgba(255,255,255,.5);margin-top:2px">'+x[2]+'</div></div></div>';}).join('')
    +'</div></div>'
    +'<div style="font-size:12px;color:rgba(255,255,255,.4);margin-bottom:20px">Takes about 5 minutes · No login required</div>'
    +'<button onclick="startQuest()" style="width:100%;max-width:320px;padding:16px;border-radius:16px;border:none;background:linear-gradient(135deg,#FFB800,#FF7700);color:#fff;font-size:16px;font-weight:900;cursor:pointer;font-family:inherit;box-shadow:0 6px 24px rgba(255,184,0,.4)">🚀 Start My Quest</button>'
    +'<div style="margin-top:12px;font-size:11px;color:rgba(255,255,255,.3)">SpineIQ v2 · Phase 1 Prototype</div>';
  document.body.appendChild(overlay);
}

function startQuest() {
  sessionStorage.setItem('spineiq_v2_welcomed','1');
  var overlay=document.getElementById('onboarding-overlay');
  if (overlay){
    overlay.style.transition='opacity .4s,transform .4s';
    overlay.style.opacity='0';overlay.style.transform='scale(1.05)';
    setTimeout(function(){overlay.remove();renderHome();switchTab('home');},400);
  }
}
