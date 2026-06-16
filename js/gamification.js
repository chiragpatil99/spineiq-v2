/**
 * SpineIQ v2 — Gamification Engine v2.0
 * Coins, levels, ranks, rewards store, daily check-in, streak
 */

// ── STATE ──────────────────────────────────────────────────────────
const G = {
  coins: 0,
  stepsCompleted: [],
  badges: [],
  streak: 1,
  doubleCoins: false,
  unlockedComparison: false,
  dailyCheckin: {
    pain: null, sleep: null, activityDone: false,
    weightDone: false, routineDone: false, date: null
  },
  redeemed: [],
};

// ── LEVELS & RANKS ─────────────────────────────────────────────────
const RANKS = [
  { id:'beginner',   name:'Beginner',        min:0,   icon:'🌱', perks:'Welcome aboard' },
  { id:'explorer',   name:'Spine Explorer',  min:40,  icon:'🔍', perks:'Unlock avatars' },
  { id:'warrior',    name:'Spine Warrior',   min:60,  icon:'⚔️', perks:'Premium themes' },
  { id:'champion',   name:'Spine Champion',  min:80,  icon:'🏆', perks:'Priority booking' },
  { id:'elite',      name:'Spine Elite',     min:90,  icon:'💎', perks:'VIP membership' },
  { id:'legend',     name:'Spine Legend',    min:97,  icon:'🌟', perks:'Free annual review' },
];

function getCurrentRank(score) {
  var rank = RANKS[0];
  for (var i = RANKS.length - 1; i >= 0; i--) {
    if (score >= RANKS[i].min) { rank = RANKS[i]; break; }
  }
  return rank;
}

function getNextRank(score) {
  for (var i = 0; i < RANKS.length; i++) {
    if (score < RANKS[i].min) return RANKS[i];
  }
  return null;
}

// ── STEP COINS ─────────────────────────────────────────────────────
const STEP_COINS = [10, 15, 15, 20, 20, 25, 25, 30, 25];
const STEP_NAMES_G = [
  'Patient Info','Occupation','Work Patterns','Lifestyle',
  'Health Data','Pain Assessment','Radiculopathy & ODI',
  'Red Flag Screening','Functional Status'
];

// ── BADGES ─────────────────────────────────────────────────────────
const BADGES = [
  { id:'first_step',   emoji:'🌱', name:'First Steps',     desc:'Completed first step',          coins:5  },
  { id:'seven_streak', emoji:'🔥', name:'7-Day Streak',    desc:'7 consecutive days',            coins:30 },
  { id:'sleep_pro',    emoji:'🌙', name:'Sleep Pro',        desc:'Logged sleep 5 days',           coins:20 },
  { id:'pain_free',    emoji:'❤️',  name:'Pain Free Week',  desc:'Pain ≤2 for 7 days',            coins:50 },
  { id:'workout_x50',  emoji:'💪', name:'Workout x50',     desc:'Completed 50 routines',         coins:40 },
  { id:'coin_hoarder', emoji:'💰', name:'Coin Hoarder',    desc:'Earned 500+ coins total',       coins:25 },
  { id:'assessment',   emoji:'🏆', name:'Quest Complete',  desc:'Completed full assessment',     coins:50 },
  { id:'legend_badge', emoji:'🌟', name:'Legend',          desc:'Reached Spine Legend rank',     coins:100},
];

// ── REWARDS STORE ──────────────────────────────────────────────────
const REWARDS = [
  { id:'physio',    cat:'health',    icon:'💆', name:'Free physio session',   desc:'30-min with certified physio', coins:2000, popular:true  },
  { id:'doctor',    cat:'health',    icon:'👨‍⚕️', name:'Free doctor consult',   desc:'15-min online consultation',   coins:3000, popular:false },
  { id:'booking',   cat:'health',    icon:'📅', name:'Priority booking',       desc:'Skip the queue at clinic',     coins:1200, popular:false },
  { id:'avatar',    cat:'cosmetic',  icon:'🧑', name:'Custom avatar pack',     desc:'Unlock 10 spine avatars',      coins:600,  popular:false },
  { id:'theme',     cat:'cosmetic',  icon:'🎨', name:'Dark theme unlock',      desc:'Premium dark mode theme',      coins:300,  popular:false },
  { id:'webinar',   cat:'vouchers',  icon:'🎓', name:'Spine health webinar',   desc:'2hr session with Dr. Sharma',  coins:800,  popular:false },
  { id:'discount',  cat:'vouchers',  icon:'🏷️',  name:'10% physio discount',   desc:'At partner clinics',           coins:400,  popular:false },
  { id:'vip',       cat:'health',    icon:'👑', name:'VIP membership',         desc:'Quarterly reviews + coaching', coins:5000, popular:false },
];

// ── EXERCISES ──────────────────────────────────────────────────────
const EXERCISES = [
  { name:'Cat-Cow Stretch',    duration:60,  desc:'On all fours, arch and round your back slowly',    reps:'10 reps' },
  { name:'Pelvic Tilt',        duration:45,  desc:'Lie on back, flatten lower back against floor',    reps:'15 reps' },
  { name:'Bird-Dog Hold',      duration:60,  desc:'Extend opposite arm and leg, hold 5 seconds each', reps:'8 each side' },
  { name:'Child\'s Pose',      duration:45,  desc:'Sit back on heels, arms extended, breathe deeply', reps:'Hold 45s' },
  { name:'Knee-to-Chest',      duration:30,  desc:'Pull one knee to chest, hold, switch sides',       reps:'10 each side' },
];

// ── COIN AWARD ─────────────────────────────────────────────────────
function awardCoins(amount, reason) {
  var final = G.doubleCoins ? amount * 2 : amount;
  G.coins += final;
  updateCoinDisplay();
  showCoinToast('+' + final + ' 🪙 ' + (G.doubleCoins ? reason + ' (2×🔥)' : reason));
  checkBadges();
}

function updateCoinDisplay() {
  var el = document.getElementById('coin-count');
  if (!el) return;
  el.textContent = G.coins;
  el.classList.add('bump');
  setTimeout(function() { el.classList.remove('bump'); }, 400);
}

function showCoinToast(msg) {
  var el = document.getElementById('toast-coin');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('toast-coin-show');
  void el.offsetWidth;
  el.classList.add('toast-coin-show');
  setTimeout(function() { el.classList.remove('toast-coin-show'); }, 1900);
}

// ── STREAK ─────────────────────────────────────────────────────────
function initStreak() {
  var today = new Date().toDateString();
  var last  = localStorage.getItem('spineiq_last_visit');
  var streak = parseInt(localStorage.getItem('spineiq_streak') || '1');
  if (!last) {
    localStorage.setItem('spineiq_last_visit', today);
    localStorage.setItem('spineiq_streak', '1');
    G.streak = 1; G.doubleCoins = false; return;
  }
  var yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
  if (last === today) {
    G.streak = streak; G.doubleCoins = false;
  } else if (last === yesterday.toDateString()) {
    var ns = streak + 1;
    localStorage.setItem('spineiq_streak', ns);
    localStorage.setItem('spineiq_last_visit', today);
    G.streak = ns; G.doubleCoins = true;
    setTimeout(function() { showCoinToast('🔥 Day '+ns+' streak! Double coins!'); }, 2500);
  } else {
    localStorage.setItem('spineiq_streak', '1');
    localStorage.setItem('spineiq_last_visit', today);
    G.streak = 1; G.doubleCoins = false;
  }
}

// ── STEP COMPLETE ──────────────────────────────────────────────────
function onStepComplete(stepIdx) {
  if (G.stepsCompleted.includes(stepIdx)) return;
  G.stepsCompleted.push(stepIdx);
  var coins = STEP_COINS[stepIdx] || 10;
  G.coins += G.doubleCoins ? coins*2 : coins;
  updateCoinDisplay();
  checkBadges();
  showStepCompleteOverlay(stepIdx, coins);
}

function showStepCompleteOverlay(stepIdx, coins) {
  var msgs = [['🎉','Great start!'],['💼','Role noted!'],['⏰','Patterns logged!'],
    ['🌿','Lifestyle mapped!'],['📱','Health data in!'],['❤️','Pain recorded!'],
    ['🧠','Nerve check done!'],['🚩','Safety screened!'],['🏃','Quest complete!']];
  var emoji = msgs[stepIdx][0], title = msgs[stepIdx][1];
  var total = G.coins, pct = Math.round((G.stepsCompleted.length/9)*100);
  var sc = typeof score === 'function' ? score() : null;
  var rank = sc ? getCurrentRank(sc.risk < 50 ? 75 : sc.risk < 75 ? 55 : 35) : RANKS[0];
  var overlay = document.createElement('div');
  overlay.className = 'step-complete-overlay';
  overlay.innerHTML = '<div class="sco-emoji">'+emoji+'</div>'
    +'<div class="sco-title">'+title+'</div>'
    +'<div class="sco-subtitle">'+STEP_NAMES_G[stepIdx]+' complete</div>'
    +'<div class="sco-coins">'
    +'<span style="font-size:22px">🪙</span>'
    +'<div><div class="sco-coin-num">+'+coins+'</div><div class="sco-coin-lbl">coins</div></div>'
    +'<div style="width:1px;height:36px;background:rgba(255,215,0,.3);margin:0 8px"></div>'
    +'<div><div class="sco-coin-num">'+total+'</div><div class="sco-coin-lbl">total</div></div>'
    +'</div>'
    +'<div style="font-size:13px;color:rgba(255,255,255,.7);margin-top:4px">'+rank.icon+' '+rank.name+'</div>'
    +'<div class="sco-progress"><div class="sco-progress-fill" style="width:0%" id="sco-pfill"></div></div>'
    +'<div style="font-size:12px;color:rgba(255,255,255,.5);margin-top:4px">'+G.stepsCompleted.length+'/9 · '+pct+'% complete</div>'
    +'<button class="sco-btn" onclick="dismissStepOverlay(this)">Continue →</button>';
  document.body.appendChild(overlay);
  setTimeout(function() {
    var f = document.getElementById('sco-pfill');
    if (f) f.style.width = pct+'%';
  }, 200);
  launchConfetti();
}

function dismissStepOverlay(btn) {
  var o = btn.closest('.step-complete-overlay');
  if (o) o.remove();
}

// ── CONFETTI ───────────────────────────────────────────────────────
function launchConfetti() {
  var c = document.getElementById('confetti-container');
  if (!c) return;
  var cols = ['#6C3FE8','#FFB800','#00C4A8','#F04060','#1DB87A','#FF9900','#8B6FF5'];
  for (var i=0; i<40; i++) {
    var p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.cssText = 'left:'+Math.random()*100+'%;background:'+cols[Math.floor(Math.random()*cols.length)]
      +';animation-duration:'+(1.5+Math.random()*1.5)+'s;animation-delay:'+(Math.random()*.5)+'s'
      +';width:'+(6+Math.random()*8)+'px;height:'+(6+Math.random()*8)+'px'
      +';border-radius:'+(Math.random()>.5?'50%':'2px')+';transform:rotate('+Math.random()*360+'deg)';
    c.appendChild(p);
    setTimeout(function(el){return function(){el.remove()};}(p), 3000);
  }
}

// ── BADGE CHECK ────────────────────────────────────────────────────
function checkBadges() {
  if (!G.badges.includes('first_step') && G.stepsCompleted.length >= 1) {
    G.badges.push('first_step'); awardBadge('first_step');
  }
  if (!G.badges.includes('assessment') && G.stepsCompleted.length >= 9) {
    G.badges.push('assessment'); awardBadge('assessment');
  }
  if (!G.badges.includes('coin_hoarder') && G.coins >= 500) {
    G.badges.push('coin_hoarder'); awardBadge('coin_hoarder');
  }
  if (!G.badges.includes('seven_streak') && G.streak >= 7) {
    G.badges.push('seven_streak'); awardBadge('seven_streak');
  }
  document.getElementById('tab-ach-dot')?.classList.add('show');
}

function awardBadge(id) {
  var b = BADGES.find(function(x){return x.id===id;});
  if (b) { G.coins += b.coins; updateCoinDisplay(); showCoinToast(b.emoji+' '+b.name+' badge! +'+b.coins+'🪙'); }
}

// ── LEADERBOARD ────────────────────────────────────────────────────
async function submitToLeaderboard(coins) {
  try {
    var myId = localStorage.getItem('spineiq_user_id') || ('user_'+Math.random().toString(36).substr(2,9));
    localStorage.setItem('spineiq_user_id', myId);
    await window.storage.set(myId, JSON.stringify({coins, ts:Date.now()}), true);
    localStorage.setItem('spineiq_my_entry', JSON.stringify({id:myId, coins}));
  } catch(e) {}
}

async function getMyRank() {
  try {
    var myEntry = JSON.parse(localStorage.getItem('spineiq_my_entry')||'null');
    if (!myEntry) return null;
    var keys = await window.storage.list('user_');
    if (!keys||!keys.keys) return null;
    var entries = [];
    for (var k of keys.keys) {
      try { var r=await window.storage.get(k,true); if(r) entries.push(JSON.parse(r.value)); } catch(e){}
    }
    entries.sort(function(a,b){return b.coins-a.coins;});
    var rank = entries.findIndex(function(e){return e.coins<=myEntry.coins;})+1;
    return {rank, total:entries.length, coins:myEntry.coins};
  } catch(e) { return null; }
}

// ── COMPARISON MODE ────────────────────────────────────────────────
const AGE_BENCHMARKS = {
  '20-30':{lifestyle:72,activity:65,sleep:78,mobility:90,obesity:85,risk:28},
  '31-45':{lifestyle:65,activity:55,sleep:72,mobility:82,obesity:75,risk:38},
  '46-60':{lifestyle:58,activity:48,sleep:68,mobility:70,obesity:68,risk:48},
  '60+':  {lifestyle:52,activity:40,sleep:65,mobility:60,obesity:62,risk:55},
};

function getAgeGroup(age) {
  age=parseInt(age)||35;
  if(age<=30)return'20-30';if(age<=45)return'31-45';if(age<=60)return'46-60';return'60+';
}

function getAverageBenchmark() {
  var g=getAgeGroup(D.p.age);
  return Object.assign({},AGE_BENCHMARKS[g],{ageGroup:g});
}

function renderComparisonMode(container) {
  var sc=score(),avg=getAverageBenchmark();
  var DIMS=[
    {label:'Lifestyle',col:'#6C3FE8',yours:sc.lifestyle,avg:avg.lifestyle},
    {label:'Activity', col:'#00C4A8',yours:sc.activity, avg:avg.activity},
    {label:'Sleep',    col:'#4090F5',yours:sc.sleep,     avg:avg.sleep},
    {label:'Mobility', col:'#FF9900',yours:sc.mobility,  avg:avg.mobility},
    {label:'Weight',   col:'#1DB87A',yours:sc.obesity,   avg:avg.obesity},
    {label:'Risk',     col:'#F04060',yours:sc.risk,      avg:avg.risk,invert:true},
  ];
  container.innerHTML='<div style="padding:0 16px">'
    +'<div style="display:flex;gap:14px;margin-bottom:14px">'
    +'<span style="font-size:12px;color:var(--purple);font-weight:700;display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:2px;background:var(--purple);display:inline-block"></span>You</span>'
    +'<span style="font-size:12px;color:var(--text3);font-weight:600;display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:2px;background:var(--border2);border:1px dashed var(--text3);display:inline-block"></span>Avg ('+avg.ageGroup+')</span>'
    +'</div>'
    +DIMS.map(function(d){
      var better=d.invert?d.yours<d.avg:d.yours>d.avg;
      var diff=(d.invert?d.avg-d.yours:d.yours-d.avg);
      return '<div style="margin-bottom:14px">'
        +'<div style="display:flex;justify-content:space-between;margin-bottom:5px">'
        +'<span style="font-size:13px;font-weight:700;color:var(--text)">'+d.label+'</span>'
        +'<span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:8px;background:'+(better?'var(--green-dim)':'var(--red-dim)')+';color:'+(better?'var(--green)':'var(--red)')+'">'+( diff>0?'+':'')+diff+' '+(better?'↑':'↓')+'</span>'
        +'</div>'
        +'<div style="position:relative;height:28px">'
        +'<div style="position:absolute;top:4px;left:0;width:'+d.avg+'%;height:20px;background:var(--border);border-radius:6px;border:1px dashed var(--text3)"></div>'
        +'<div style="position:absolute;top:4px;left:0;width:'+Math.min(d.yours,100)+'%;height:20px;background:'+d.col+';border-radius:6px;opacity:.85;display:flex;align-items:center;justify-content:flex-end;padding-right:6px">'
        +'<span style="font-size:11px;font-weight:800;color:#fff">'+d.yours+'</span></div></div>'
        +'<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3);margin-top:2px"><span>0</span><span>Avg:'+d.avg+'</span><span>100</span></div>'
        +'</div>';
    }).join('')
    +'</div>';
}
