/**
 * SpineIQ v2 — App Controller (Gamified)
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

let currentTab = 'assess';

// ── TAB SWITCHING ─────────────────────────────────────────────────
function switchTab(tab) {
  currentTab = tab;
  ['assess','report','achievements'].forEach(t => {
    document.getElementById('screen-'+t)?.classList.toggle('active', t===tab);
    document.getElementById('tab-'+t)?.classList.toggle('active', t===tab);
  });
  document.getElementById('step-actions').style.display = tab==='assess' ? 'flex' : 'none';
  if (tab==='achievements') renderAchievements();
  document.getElementById('app-content').scrollTo(0,0);
}

// ── RENDER ─────────────────────────────────────────────────────────
function render() {
  const main = document.getElementById('main');
  if (!main) return;
  main.innerHTML = PAGES[currentStep]();
  updateProgress();
  updateActions();
  document.getElementById('app-content').scrollTo({top:0,behavior:'smooth'});
}

function goStep(n) { currentStep = n; render(); }

// ── PROGRESS ──────────────────────────────────────────────────────
function updateProgress() {
  const pct = Math.round(((currentStep+1)/TOTAL_STEPS)*100);
  document.getElementById('xp-fill').style.width = pct+'%';
  document.getElementById('step-name').textContent = STEP_NAMES[currentStep];
  document.getElementById('step-xp').textContent = '+'+STEP_COINS[currentStep]+' 🪙';
  const dots = document.getElementById('step-dots');
  if (dots) dots.innerHTML = Array.from({length:TOTAL_STEPS},(_,i)=>
    `<div class="sdot ${i<currentStep?'done':i===currentStep?'active':''}"></div>`
  ).join('');
}

// ── ACTIONS ───────────────────────────────────────────────────────
function updateActions() {
  const actions = document.getElementById('step-actions');
  if (!actions) return;
  const gateId = VIDEO_GATES[currentStep];
  const locked = gateId && !watchedVideos[gateId];
  const isLast = currentStep === TOTAL_STEPS - 1;
  actions.innerHTML = `
    ${currentStep > 0
      ? `<button class="btn-back" onclick="goStep(${currentStep-1})">← Back</button>`
      : ''}
    ${!isLast
      ? `<button class="btn-next ${locked?'locked':''}"
          onclick="${locked ? `showToast('Watch the video to continue 📹')` : `completeStep(${currentStep})`}"
          style="${currentStep===0?'flex:1':''}">
          ${locked ? '🔒 Watch video first' : 'Continue →'}
        </button>`
      : `<button class="btn-next" onclick="completeFinalStep()" style="${currentStep===0?'flex:1':''}">
          View My Report 🏆
        </button>`}`;
}

// ── STEP COMPLETION ───────────────────────────────────────────────
function completeStep(idx) {
  onStepComplete(idx);
  // Overlay dismissal will not auto-advance — user taps Continue in overlay
  // But we still need to advance step after overlay dismissed
  const orig = dismissStepOverlay;
  window.dismissStepOverlay = function(btn) {
    orig(btn);
    goStep(idx + 1);
    window.dismissStepOverlay = orig;
  };
}

function completeFinalStep() {
  onStepComplete(TOTAL_STEPS - 1);
  const orig = dismissStepOverlay;
  window.dismissStepOverlay = function(btn) {
    orig(btn);
    window.dismissStepOverlay = orig;
    buildReport();
    switchTab('report');
    document.getElementById('tab-report-dot')?.classList.add('show');
  };
}

// ── BMI ───────────────────────────────────────────────────────────
function updBMI() {
  const h = document.getElementById('ht')?.value || D.p.height;
  const w = document.getElementById('wt')?.value || D.p.weight;
  D.p.height=h; D.p.weight=w; D.p.bmi=calcBMI(h,w);
  const el = document.getElementById('bmi-bd');
  if (el) { el.textContent = D.p.bmi ? D.p.bmi+' — '+bmiLbl(D.p.bmi) : 'Enter height & weight'; el.style.color=bmiCol(D.p.bmi); }
}

// ── SITTING ALERT ─────────────────────────────────────────────────
function checkSitting() {
  const el = document.getElementById('sitting-alert');
  if (!el) return;
  el.innerHTML = D.wp.sitting > 8
    ? '<div class="alert alert-warn" style="margin-top:10px">⚠ '+D.wp.sitting+'h/day exceeds safe limits</div>' : '';
}

// ── REPORT ────────────────────────────────────────────────────────
function buildReport() {
  const sc = score();
  const sss = calcSSS();
  const contribs = getContributors();
  const bench = habitBenchmark();
  const initials = (D.p.name||'P').split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();

  const SCORES = [
    ['Lifestyle',sc.lifestyle,'#6C3FE8'],['Activity',sc.activity,'#00C4A8'],
    ['Sleep',sc.sleep,'#4090F5'],['Mobility',sc.mobility,'#FF9900'],['Weight',sc.obesity,'#1DB87A'],
  ];

  const reportEl = document.getElementById('screen-report');
  reportEl.innerHTML = `<div class="report-screen-body">

    <div class="report-patient-card">
      <div class="rpc-avatar">${initials}</div>
      <div>
        <div class="rpc-name">${D.p.name||'Patient'}</div>
        <div class="rpc-sub">${D.p.age?D.p.age+' yrs':''} ${D.p.gender?'· '+D.p.gender:''} ${D.oc.type?'· '+D.oc.type:''}</div>
        <span class="rpc-chip">BMI ${D.p.bmi||'—'} · ${bmiLbl(D.p.bmi)||'—'}</span>
        <span class="rpc-chip" style="margin-left:4px">🪙 ${G.coins} coins earned</span>
      </div>
    </div>

    <div class="sec-lbl">Back pain risk score</div>
    <div class="risk-hero">
      <div class="risk-top">
        <div>
          <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.8px;text-transform:uppercase;margin-bottom:6px">Overall risk</div>
          <div class="risk-number" style="color:${sc.riskCol}">${sc.risk}<span class="risk-denom">/100</span></div>
        </div>
        <div class="risk-badge-pill" style="background:${sc.riskCol}">${sc.riskLvl}</div>
      </div>
      <div class="risk-bar-row">
        <div class="risk-track"><div class="risk-fill-bar" style="width:${sc.risk}%;background:${sc.riskCol}"></div></div>
        <span style="font-size:11px;color:var(--text3)">${sc.risk}/100</span>
      </div>
      <div class="risk-zones">
        ${[['Low','0–34','var(--green)',sc.risk<35],['Moderate','35–64','var(--amber)',sc.risk>=35&&sc.risk<65],['High','65–100','var(--red)',sc.risk>=65]].map(([l,r,c,active])=>`
        <div class="rzone ${active?'active':''}" style="${active?'background:'+sc.riskBg:''}">
          <div class="rzone-dot" style="background:${c};${active?'outline:2px solid '+c+';outline-offset:2px':''}"></div>
          <div class="rzone-lbl" style="${active?'color:'+c:''}">${l}</div>
          <div class="rzone-range">${r}</div>
        </div>`).join('')}
      </div>
    </div>

    <div class="sec-lbl">Lifestyle dimensions</div>
    <div class="rings-card">
      <div style="font-size:11px;color:var(--text3);margin-bottom:10px">Each scored 0–100 · Higher is healthier</div>
      <div class="rings-row">
        ${SCORES.map(([l,v,c])=>`
        <div class="ring-item">${ring(v,c)}<span class="ring-lbl">${l}</span></div>`).join('')}
      </div>
    </div>

    <div class="sec-lbl">Clinical severity (SSS)</div>
    <div class="sss-card">
      <div class="sss-sub-grid">
        ${[['VAS',sss.vas,2],['Radiculopathy',sss.radiculopathy,3],['ODI',sss.odi,2],['BMI',sss.bmiScore,2],['Chronicity',sss.chronicity,2]].map(([l,v,mx])=>`
        <div class="sss-sub-cell"><div class="sss-sv">${v}</div><div class="sss-sm">/${mx}</div><div class="sss-sl">${l}</div></div>`).join('')}
      </div>
      <div class="sss-total-row" style="background:${sss.bg}">
        <div>
          <div style="font-size:9px;text-transform:uppercase;letter-spacing:.6px;color:${sss.col};opacity:.7;font-weight:700;margin-bottom:4px">Total SSS</div>
          <div class="sss-total-num" style="color:${sss.col}">${sss.total}<span style="font-size:16px;font-weight:500;opacity:.7">/11</span></div>
        </div>
        <div style="text-align:right">
          <div class="sss-total-badge" style="background:${sss.col}">${sss.level}</div>
          <div style="font-size:11px;color:${sss.col};margin-top:5px;max-width:140px;text-align:right">${sss.mgmt}</div>
        </div>
      </div>
    </div>

    ${bench ? `
    <div class="sec-lbl">Age benchmarks · ${bench.group}</div>
    <div class="bench-card">
      ${bench.flags.map((f,i)=>`
      <div class="bench-row">
        <div class="bench-ico" style="background:${f.col==='var(--green)'?'var(--green-dim)':f.col==='var(--amber)'?'var(--amber-dim)':'var(--red-dim)'}">
          ${f.text.toLowerCase().includes('sit')?'🪑':f.text.toLowerCase().includes('walk')?'🚶':f.text.toLowerCase().includes('exercise')||f.text.toLowerCase().includes('activity')?'🏋️':'🌙'}
        </div>
        <div class="bench-text">${f.text}</div>
        <span class="bench-tag" style="background:${f.col==='var(--green)'?'var(--green-dim)':f.col==='var(--amber)'?'var(--amber-dim)':'var(--red-dim)'};color:${f.col==='var(--green)'?'var(--green)':f.col==='var(--amber)'?'var(--amber)':'var(--red)'}">
          ${f.col==='var(--green)'?'✓ Healthy':f.col==='var(--amber)'?'Below ideal':'High risk'}
        </span>
      </div>`).join('')}
    </div>` : ''}

    <div class="sec-lbl">Probable contributors</div>
    <div class="contrib-card">
      ${contribs.map(([t,c])=>`
      <div class="contrib-row">
        <div class="contrib-dot" style="background:${c}"></div>
        <div class="contrib-text">${t}</div>
        <span class="contrib-tag" style="background:${c==='var(--red)'?'var(--red-dim)':'var(--amber-dim)'};color:${c==='var(--red)'?'var(--red)':'var(--amber)'}">
          ${c==='var(--red)'?'High':'Moderate'}
        </span>
      </div>`).join('')}
    </div>

    <button class="gen-btn" id="gbtn" onclick="genReport()">✦ Generate AI Clinical Report</button>
    <div id="rout"></div>
    <div id="download-wrap"></div>
  </div>`;
}

// ── AI REPORT ─────────────────────────────────────────────────────
async function genReport() {
  const btn = document.getElementById('gbtn');
  const out = document.getElementById('rout');
  if (!btn||!out) return;
  btn.disabled=true; btn.textContent='Generating…';
  out.innerHTML='<div class="gen-loading"><div class="spinner"></div>Waking up server…</div>';
  try { await fetch(API_PROXY_URL.replace('/api/generate-report',''),{method:'GET'}); } catch(e){}
  out.innerHTML='<div class="gen-loading"><div class="spinner"></div>Generating evidence-based clinical report…</div>';
  const sc=score();
  try {
    const ctrl=new AbortController();
    const t=setTimeout(()=>ctrl.abort(),90000);
    const res=await fetch(API_PROXY_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:buildReportPrompt(sc)}),signal:ctrl.signal});
    clearTimeout(t);
    const data=await res.json();
    if (!res.ok) throw new Error(data.error||'Server error');
    out.innerHTML=`<div class="report-box">${data.report}</div>`;
    // Award badge
    G.badges.push('report_generated');
    checkBadges();
    awardCoins(25,'Report generated!');
    const wrap=document.getElementById('download-wrap');
    if (wrap) wrap.innerHTML=`<button class="dl-btn" onclick="downloadReport()">⬇ Download Report as PDF</button>`;
  } catch(err) {
    out.innerHTML=`<div class="report-box" style="color:var(--red)">Generation failed. Tap Regenerate to try again.</div>`;
  }
  btn.disabled=false; btn.textContent='✦ Regenerate Report';
}

// ── PDF DOWNLOAD ──────────────────────────────────────────────────
function downloadReport() {
  const reportText=document.getElementById('rout')?.innerText||'';
  const sc=score(); const sss=calcSSS();
  if (!reportText){showToast('Generate the report first');return;}
  const sssCol=sss.total<=3?'#1DB87A':sss.total<=6?'#FF9900':sss.total<=9?'#E65100':'#F04060';
  const riskCol=sc.risk<35?'#1DB87A':sc.risk<65?'#FF9900':'#F04060';
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>SpineIQ Report — ${D.p.name||'Patient'}</title>
  <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;background:#fff;color:#1a1a1a}
  .page{max-width:780px;margin:0 auto;padding:32px 36px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:3px solid #6C3FE8}
  .brand{font-size:26px;font-weight:900;color:#6C3FE8}.brand-sub{font-size:12px;color:#888;margin-top:2px}
  .meta td{padding:2px 6px;font-size:13px}.meta td:first-child{color:#888;text-align:right}.meta td:last-child{font-weight:700}
  .sec{font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#888;margin:24px 0 10px}
  .scores{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:16px}
  .score-box{background:#f5f3ff;border:1px solid #c5bce8;border-radius:10px;padding:12px 8px;text-align:center}
  .score-val{font-size:24px;font-weight:900;color:#6C3FE8}.score-lbl{font-size:11px;color:#888;margin-top:4px}
  .risk-box{border-radius:12px;padding:18px 22px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;background:${sc.risk<35?'#e0faf1':sc.risk<65?'#fff4e0':'#ffeaee'};border:1px solid ${riskCol}44}
  .risk-num{font-size:46px;font-weight:900;color:${riskCol};line-height:1}
  .risk-badge{background:${riskCol};color:#fff;padding:8px 20px;border-radius:20px;font-weight:900;font-size:14px}
  .report-body{font-size:13.5px;line-height:1.9;color:#2a2a2a;white-space:pre-wrap;margin-top:8px}
  .footer{margin-top:36px;padding-top:14px;border-top:1px solid #eee;font-size:11px;color:#aaa;text-align:center;line-height:1.6}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style></head><body><div class="page">
  <div class="header"><div><div class="brand">SpineIQ</div><div class="brand-sub">Spine Health Intelligence Platform — Clinical Report v2</div></div>
  <table class="meta"><tr><td>Patient</td><td>${D.p.name||'—'}</td></tr><tr><td>Age/Sex</td><td>${D.p.age||'—'} / ${D.p.gender||'—'}</td></tr>
  <tr><td>Date</td><td>${new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</td></tr>
  <tr><td>Coins earned</td><td>🪙 ${G.coins}</td></tr></table></div>
  <div class="sec">Dimension Scores</div>
  <div class="scores">
  <div class="score-box"><div class="score-val">${sc.lifestyle}</div><div class="score-lbl">Lifestyle</div></div>
  <div class="score-box"><div class="score-val">${sc.activity}</div><div class="score-lbl">Activity</div></div>
  <div class="score-box"><div class="score-val">${sc.sleep}</div><div class="score-lbl">Sleep</div></div>
  <div class="score-box"><div class="score-val">${sc.mobility}</div><div class="score-lbl">Mobility</div></div>
  <div class="score-box"><div class="score-val">${sc.obesity}</div><div class="score-lbl">Weight</div></div>
  </div>
  <div class="risk-box"><div><div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:${riskCol};margin-bottom:4px;font-weight:700">Back Pain Risk</div>
  <div class="risk-num">${sc.risk}<span style="font-size:20px;font-weight:500;opacity:.7">/100</span></div></div>
  <div class="risk-badge">${sc.riskLvl}</div></div>
  <div class="sec">AI Clinical Assessment</div>
  <div class="report-body">${reportText}</div>
  <div class="footer">Generated by SpineIQ v2 — Gamified Spine Health Assessment | ${new Date().toLocaleString('en-GB')}<br>
  ★ Clinical decision support only. Not a substitute for clinical judgment.</div>
  </div><script>window.onload=function(){window.print()}</script></body></html>`;
  const w=window.open('','_blank');
  if (w){w.document.write(html);w.document.close();}
}

// ── RESET ─────────────────────────────────────────────────────────
function resetAll() {
  if (confirm('Start a new assessment?')) {
    resetData();
    G.coins=0; G.stepsCompleted=[]; G.badges=[];
    currentStep=0;
    updateCoinDisplay();
    document.getElementById('tab-report-dot')?.classList.remove('show');
    document.getElementById('tab-ach-dot')?.classList.remove('show');
    switchTab('assess');
    render();
    showToast('New quest started! 🎮');
  }
}

// ── TOAST ─────────────────────────────────────────────────────────
function showToast(msg) {
  const el=document.getElementById('toast')||document.createElement('div');
  if (!el.id){el.id='toast';document.body.appendChild(el);}
  el.textContent=msg; el.style.display='block';
  setTimeout(()=>el.style.display='none',2500);
}

// ── INIT ──────────────────────────────────────────────────────────
render();
switchTab('assess');
