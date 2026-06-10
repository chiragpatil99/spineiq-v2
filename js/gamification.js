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
