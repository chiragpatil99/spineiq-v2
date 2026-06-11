/**
 * SpineIQ v2 — Gamification Engine
 * Coins, achievements, step completion rewards
 */

// ── STATE ──────────────────────────────────────────────────────────
const G = {
  coins: 0,
  stepsCompleted: [],
  badges: [],
};

// Coins awarded per step
const STEP_COINS = [10, 15, 15, 20, 20, 25, 25, 30, 25];
const STEP_NAMES_G = [
  'Patient Info','Occupation','Work Patterns','Lifestyle',
  'Health Data','Pain Assessment','Radiculopathy & ODI',
  'Red Flag Screening','Functional Status'
];

// Badge definitions
const BADGES = [
  { id:'first_step',  emoji:'🌱', name:'First Step',      desc:'Completed your first step',        coins:5,   condition: g => g.stepsCompleted.length >= 1 },
  { id:'halfway',     emoji:'⚡', name:'Halfway There',   desc:'Completed 5 steps',                coins:20,  condition: g => g.stepsCompleted.length >= 5 },
  { id:'assessment',  emoji:'🏆', name:'Quest Complete',  desc:'Completed all 9 steps',            coins:50,  condition: g => g.stepsCompleted.length >= 9 },
  { id:'big_spender', emoji:'💰', name:'Coin Collector',  desc:'Earned over 100 coins',            coins:15,  condition: g => g.coins >= 100 },
  { id:'pain_warrior',emoji:'💪', name:'Pain Warrior',    desc:'Completed the pain assessment',    coins:10,  condition: g => g.stepsCompleted.includes(5) },
  { id:'red_flag',    emoji:'🚩', name:'Safety First',    desc:'Completed red flag screening',     coins:15,  condition: g => g.stepsCompleted.includes(7) },
  { id:'full_report', emoji:'📋', name:'Report Ready',    desc:'Generated your AI clinical report',coins:25,  condition: g => g.badges.includes('report_generated') },
];

// ── COIN AWARD ─────────────────────────────────────────────────────
function awardCoins(amount, reason) {
  G.coins += amount;
  updateCoinDisplay();
  showCoinToast('+' + amount + ' 🪙 ' + reason);
}

function updateCoinDisplay() {
  const el = document.getElementById('coin-count');
  if (!el) return;
  el.textContent = G.coins;
  el.classList.add('bump');
  setTimeout(() => el.classList.remove('bump'), 400);
}

function showCoinToast(msg) {
  const el = document.getElementById('toast-coin');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('toast-coin-show');
  void el.offsetWidth;
  el.classList.add('toast-coin-show');
  setTimeout(() => el.classList.remove('toast-coin-show'), 1900);
}

// ── STEP COMPLETE ──────────────────────────────────────────────────
function onStepComplete(stepIdx) {
  if (G.stepsCompleted.includes(stepIdx)) return; // already rewarded
  G.stepsCompleted.push(stepIdx);

  const coins = STEP_COINS[stepIdx] || 10;
  G.coins += coins;
  updateCoinDisplay();

  // Check badges
  checkBadges();

  // Show completion overlay
  showStepCompleteOverlay(stepIdx, coins);
}

function showStepCompleteOverlay(stepIdx, coins) {
  const messages = [
    ['🎉','Great start!'],['💼','Role noted!'],['⏰','Patterns logged!'],
    ['🌿','Lifestyle mapped!'],['📱','Health data captured!'],['❤️','Pain recorded!'],
    ['🧠','Nerve check done!'],['🚩','Safety screened!'],['🏃','Mobility assessed!'],
  ];
  const [emoji, title] = messages[stepIdx] || ['⭐','Step complete!'];
  const totalCoins = G.coins;
  const progress = Math.round((G.stepsCompleted.length / 9) * 100);

  const overlay = document.createElement('div');
  overlay.className = 'step-complete-overlay';
  overlay.innerHTML = `
    <div class="sco-emoji">${emoji}</div>
    <div class="sco-title">${title}</div>
    <div class="sco-subtitle">${STEP_NAMES_G[stepIdx]} complete</div>
    <div class="sco-coins">
      <span style="font-size:22px">🪙</span>
      <div>
        <div class="sco-coin-num">+${coins}</div>
        <div class="sco-coin-lbl">coins earned</div>
      </div>
      <div style="width:1px;height:36px;background:rgba(255,215,0,.3);margin:0 8px"></div>
      <div>
        <div class="sco-coin-num">${totalCoins}</div>
        <div class="sco-coin-lbl">total coins</div>
      </div>
    </div>
    <div class="sco-progress">
      <div class="sco-progress-fill" style="width:0%" id="sco-pfill"></div>
    </div>
    <div style="font-size:12px;color:rgba(255,255,255,.5);margin-top:4px">${G.stepsCompleted.length}/9 steps · ${progress}% complete</div>
    <button class="sco-btn" onclick="dismissStepOverlay(this)">Continue →</button>
  `;
  document.body.appendChild(overlay);

  // Animate progress bar
  setTimeout(() => {
    const fill = document.getElementById('sco-pfill');
    if (fill) fill.style.width = progress + '%';
  }, 200);

  // Launch confetti
  launchConfetti();
}

function dismissStepOverlay(btn) {
  const overlay = btn.closest('.step-complete-overlay');
  if (overlay) overlay.remove();
}

// ── CONFETTI ───────────────────────────────────────────────────────
function launchConfetti() {
  const container = document.getElementById('confetti-container');
  if (!container) return;
  const colors = ['#6C3FE8','#FFB800','#00C4A8','#F04060','#1DB87A','#FF9900','#8B6FF5'];

  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.cssText = `
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${1.5 + Math.random() * 1.5}s;
      animation-delay: ${Math.random() * .5}s;
      transform: rotate(${Math.random() * 360}deg);
      width: ${6 + Math.random() * 8}px;
      height: ${6 + Math.random() * 8}px;
      border-radius: ${Math.random() > .5 ? '50%' : '2px'};
    `;
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 3000);
  }
}

// ── BADGE CHECKING ─────────────────────────────────────────────────
function checkBadges() {
  BADGES.forEach(badge => {
    if (!G.badges.includes(badge.id) && badge.condition(G)) {
      G.badges.push(badge.id);
      awardCoins(badge.coins, badge.name + ' badge!');
      document.getElementById('tab-ach-dot')?.classList.add('show');
    }
  });
}

// ── ACHIEVEMENTS SCREEN ────────────────────────────────────────────
function renderAchievements() {
  const body = document.getElementById('ach-body');
  if (!body) return;

  body.innerHTML = `
    <div class="ach-header">
      <h2>🏆 Your Rewards</h2>
      <p>Complete steps to earn coins and badges</p>
    </div>

    <div class="coin-total-card">
      <div class="ctc-label">Total coins earned</div>
      <div class="ctc-coins">🪙 ${G.coins}</div>
      <div class="ctc-sub">${G.stepsCompleted.length} of 9 steps completed</div>
    </div>

    <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.8px;text-transform:uppercase;margin-bottom:10px">Badges</div>
    <div class="badges-grid">
      ${BADGES.map(b => {
        const earned = G.badges.includes(b.id);
        return `
        <div class="badge-card ${earned ? 'earned' : 'locked'}">
          <span class="badge-emoji">${earned ? b.emoji : '🔒'}</span>
          <div class="badge-name">${b.name}</div>
          <div class="badge-desc">${b.desc}</div>
          <div class="badge-coins">${earned ? '✅ +'+b.coins+' 🪙' : b.coins+' 🪙 to earn'}</div>
        </div>`;
      }).join('')}
    </div>

    <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.8px;text-transform:uppercase;margin-bottom:10px">Step rewards</div>
    <div class="step-rewards-list">
      <div class="srl-header">🪙 Coins per step</div>
      ${STEP_NAMES_G.map((name, i) => {
        const done = G.stepsCompleted.includes(i);
        return `
        <div class="srl-row ${done ? 'done' : ''}">
          <div class="srl-step-num">${i+1}</div>
          <div class="srl-name">${name}</div>
          <div class="srl-coins">${STEP_COINS[i]} 🪙</div>
          ${done ? '<span class="srl-check">✅</span>' : ''}
        </div>`;
      }).join('')}
    </div>
  `;
}


// ── STREAK SYSTEM ─────────────────────────────────────────────────
function initStreak() {
  const today = new Date().toDateString();
  const lastVisit = localStorage.getItem('spineiq_last_visit');
  const streak = parseInt(localStorage.getItem('spineiq_streak') || '0');
  const lastStreakDate = localStorage.getItem('spineiq_streak_date');

  if (!lastVisit) {
    // First visit
    localStorage.setItem('spineiq_last_visit', today);
    localStorage.setItem('spineiq_streak', '1');
    localStorage.setItem('spineiq_streak_date', today);
    G.streak = 1;
    G.doubleCoins = false;
    return;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  if (lastVisit === today) {
    // Same day — keep streak
    G.streak = streak;
    G.doubleCoins = false;
  } else if (lastVisit === yesterdayStr) {
    // Consecutive day — increment streak
    const newStreak = streak + 1;
    localStorage.setItem('spineiq_streak', newStreak);
    localStorage.setItem('spineiq_last_visit', today);
    localStorage.setItem('spineiq_streak_date', today);
    G.streak = newStreak;
    G.doubleCoins = true;
    // Show streak toast after short delay
    setTimeout(() => {
      showCoinToast('🔥 Day ' + newStreak + ' streak! Double coins today!');
    }, 2500);
  } else {
    // Streak broken
    localStorage.setItem('spineiq_streak', '1');
    localStorage.setItem('spineiq_last_visit', today);
    G.streak = 1;
    G.doubleCoins = false;
  }
}

// Override awardCoins to apply double coins on streak days
const _origAwardCoins = awardCoins;
function awardCoinsWithStreak(amount, reason) {
  const finalAmount = G.doubleCoins ? amount * 2 : amount;
  const label = G.doubleCoins ? reason + ' (2×🔥)' : reason;
  G.coins += finalAmount;
  updateCoinDisplay();
  showCoinToast('+' + finalAmount + ' 🪙 ' + label);
}
// Replace awardCoins globally
window.awardCoins = awardCoinsWithStreak;

// ── LEADERBOARD (rank only, privacy-safe) ─────────────────────────
const LEADERBOARD_KEY = 'spineiq_leaderboard';
const MY_ENTRY_KEY   = 'spineiq_my_entry';

async function submitToLeaderboard(coins, riskScore, stepsCompleted) {
  try {
    const myId = localStorage.getItem('spineiq_user_id') || ('user_' + Math.random().toString(36).substr(2,9));
    localStorage.setItem('spineiq_user_id', myId);

    // Store entry in shared storage
    await window.storage.set(myId, JSON.stringify({
      coins, riskScore, stepsCompleted,
      ts: Date.now()
    }), true); // shared=true

    // Store my own entry locally for reference
    localStorage.setItem(MY_ENTRY_KEY, JSON.stringify({ id: myId, coins, riskScore }));

    return myId;
  } catch(e) {
    console.log('Leaderboard storage not available:', e);
    return null;
  }
}

async function getMyRank() {
  try {
    const myEntry = JSON.parse(localStorage.getItem(MY_ENTRY_KEY) || 'null');
    if (!myEntry) return null;

    const keys = await window.storage.list('user_');
    if (!keys || !keys.keys) return null;

    let entries = [];
    for (const key of keys.keys) {
      try {
        const r = await window.storage.get(key, true);
        if (r) entries.push(JSON.parse(r.value));
      } catch(e) {}
    }

    // Sort by coins descending
    entries.sort((a,b) => b.coins - a.coins);
    const rank = entries.findIndex(e => e.coins <= myEntry.coins) + 1;
    return { rank, total: entries.length, coins: myEntry.coins };
  } catch(e) {
    return null;
  }
}

// ── COMPARISON MODE ───────────────────────────────────────────────
const AGE_BENCHMARKS = {
  '20-30': { lifestyle:72, activity:65, sleep:78, mobility:90, obesity:85, risk:28 },
  '31-45': { lifestyle:65, activity:55, sleep:72, mobility:82, obesity:75, risk:38 },
  '46-60': { lifestyle:58, activity:48, sleep:68, mobility:70, obesity:68, risk:48 },
  '60+':   { lifestyle:52, activity:40, sleep:65, mobility:60, obesity:62, risk:55 },
};

const GENDER_MODIFIER = { male: 0, female: 3, other: 0 };

function getAgeGroup(age) {
  age = parseInt(age) || 35;
  if (age <= 30) return '20-30';
  if (age <= 45) return '31-45';
  if (age <= 60) return '46-60';
  return '60+';
}

function getAverageBenchmark() {
  const ageGroup = getAgeGroup(D.p.age);
  const base = { ...AGE_BENCHMARKS[ageGroup] };
  const genderMod = GENDER_MODIFIER[D.p.gender] || 0;
  Object.keys(base).forEach(k => { if (k !== 'risk') base[k] = Math.min(100, base[k] + genderMod); });
  return { ...base, ageGroup };
}

function renderComparisonMode(container) {
  const sc = score();
  const avg = getAverageBenchmark();

  const DIMS = [
    { key:'lifestyle', label:'Lifestyle',  col:'#6C3FE8', yours:sc.lifestyle, avg:avg.lifestyle },
    { key:'activity',  label:'Activity',   col:'#00C4A8', yours:sc.activity,  avg:avg.activity  },
    { key:'sleep',     label:'Sleep',      col:'#4090F5', yours:sc.sleep,     avg:avg.sleep     },
    { key:'mobility',  label:'Mobility',   col:'#FF9900', yours:sc.mobility,  avg:avg.mobility  },
    { key:'obesity',   label:'Weight',     col:'#1DB87A', yours:sc.obesity,   avg:avg.obesity   },
    { key:'risk',      label:'Risk Score', col:'#F04060', yours:sc.risk,      avg:avg.risk, invert:true },
  ];

  container.innerHTML = `
    <div style="padding:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <div style="font-size:16px;font-weight:800;color:var(--text)">📊 Your vs Average</div>
        <div style="font-size:11px;color:var(--text3);background:var(--surface2);padding:4px 10px;border-radius:10px;border:1px solid var(--border)">Age ${avg.ageGroup} · ${D.p.gender||'all'}</div>
      </div>
      <div style="display:flex;gap:12px;margin-bottom:14px">
        <div style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--purple)">
          <div style="width:12px;height:12px;border-radius:3px;background:var(--purple)"></div>You
        </div>
        <div style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--text3)">
          <div style="width:12px;height:12px;border-radius:3px;background:var(--border2);border:1px dashed var(--text3)"></div>Average
        </div>
      </div>
      ${DIMS.map(d => {
        const diff = d.invert ? avg.risk - sc.risk : d.yours - d.avg;
        const better = d.invert ? sc.risk < avg.risk : d.yours > d.avg;
        const diffLabel = (diff > 0 ? '+' : '') + diff;
        return `
        <div style="margin-bottom:14px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:13px;font-weight:700;color:var(--text)">${d.label}</span>
            <span style="font-size:12px;font-weight:700;color:${better?'var(--green)':'var(--red)'};background:${better?'var(--green-dim)':'var(--red-dim)'};padding:2px 8px;border-radius:8px">${diffLabel > 0 && !d.invert ? '+' : ''}${diffLabel} ${better?'↑':'↓'}</span>
          </div>
          <div style="position:relative;height:28px">
            <!-- Average bar (background) -->
            <div style="position:absolute;top:4px;left:0;width:${d.avg}%;height:20px;background:var(--border);border-radius:6px;border:1px dashed var(--text3)"></div>
            <!-- Your bar -->
            <div style="position:absolute;top:4px;left:0;width:${Math.min(d.yours,100)}%;height:20px;background:${d.col};border-radius:6px;opacity:.85;display:flex;align-items:center;justify-content:flex-end;padding-right:6px;transition:width .6s">
              <span style="font-size:11px;font-weight:800;color:#fff">${d.yours}</span>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3);margin-top:3px">
            <span>0</span><span>Avg: ${d.avg}</span><span>100</span>
          </div>
        </div>`;
      }).join('')}
      <div style="background:var(--purple-dim);border:1.5px solid var(--purple)33;border-radius:var(--r2);padding:14px;text-align:center;margin-top:4px">
        <div style="font-size:12px;color:var(--text2);margin-bottom:4px">Overall vs age group average</div>
        <div style="font-size:22px;font-weight:900;color:${sc.risk < avg.risk ? 'var(--green)' : 'var(--red)'}">
          ${sc.risk < avg.risk ? '🏆 Better than average' : '📈 Room to improve'}
        </div>
        <div style="font-size:12px;color:var(--text3);margin-top:4px">Risk score: ${sc.risk} vs avg ${avg.risk} for ${avg.ageGroup}</div>
      </div>
    </div>`;
}
