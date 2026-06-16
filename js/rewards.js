/**
 * SpineIQ v2 — Rewards Store + Levels Screen
 */

var activeRewardCat = 'all';

function renderRewards() {
  var filtered = activeRewardCat==='all' ? REWARDS : REWARDS.filter(function(r){return r.cat===activeRewardCat;});
  document.getElementById('screen-rewards').innerHTML = `
  <div style="background:var(--purple);padding:14px 18px 16px;position:sticky;top:0;z-index:5">
    <div style="font-size:16px;font-weight:800;color:#fff">Rewards</div>
  </div>
  <div style="padding:14px;padding-bottom:90px;display:flex;flex-direction:column;gap:12px">

    <!-- BALANCE -->
    <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r2);padding:16px;display:flex;align-items:center;gap:14px;box-shadow:var(--shadow)">
      <div style="width:52px;height:52px;border-radius:14px;background:var(--coin-dim);display:flex;align-items:center;justify-content:center;font-size:26px">🪙</div>
      <div style="flex:1">
        <div style="font-size:11px;font-weight:700;color:var(--text3);letter-spacing:.8px;text-transform:uppercase;margin-bottom:3px">Your balance</div>
        <div style="font-size:32px;font-weight:900;color:var(--coin);line-height:1">${G.coins}</div>
        <div style="font-size:12px;color:var(--text3)">Spine Coins</div>
      </div>
      <button onclick="switchTab('track')" style="width:36px;height:36px;border-radius:50%;background:var(--green-dim);border:1.5px solid var(--green)33;display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer">+</button>
    </div>

    <!-- VIP BANNER -->
    <div style="background:linear-gradient(135deg,#FFB800,#FF7700);border-radius:var(--r2);padding:14px 16px;display:flex;align-items:center;justify-content:space-between;box-shadow:var(--shadow)">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:22px">👑</span>
        <div><div style="font-size:14px;font-weight:800;color:#fff">Unlock VIP Membership</div><div style="font-size:11px;color:rgba(255,255,255,.7)">Quarterly reviews · coaching · analytics</div></div>
      </div>
      <span style="font-size:20px">›</span>
    </div>

    <!-- CATEGORIES -->
    <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:2px;scrollbar-width:none">
      ${['all','health','cosmetic','vouchers'].map(function(c){
        return '<button onclick="activeRewardCat=\''+c+'\';renderRewards()" style="padding:7px 16px;border-radius:20px;border:1.5px solid '+(activeRewardCat===c?'var(--purple)':'var(--border)')+';background:'+(activeRewardCat===c?'var(--purple)':'transparent')+';color:'+(activeRewardCat===c?'#fff':'var(--text2)')+';font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;flex-shrink:0;capitalize">'+c.charAt(0).toUpperCase()+c.slice(1)+'</button>';
      }).join('')}
    </div>

    <!-- REWARDS GRID -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      ${filtered.map(function(r){
        var canAfford = G.coins >= r.coins;
        var redeemed = G.redeemed.includes(r.id);
        return '<div style="background:var(--surface);border:1.5px solid '+(redeemed?'var(--green)33':canAfford?'var(--purple)22':'var(--border)')+';border-radius:var(--r2);overflow:hidden;box-shadow:var(--shadow);cursor:'+(canAfford&&!redeemed?'pointer':'default')+'" onclick="'+(canAfford&&!redeemed?'showRedeemSheet(\''+r.id+'\')':'')+'">'
          +'<div style="padding:14px 14px 10px">'
          +(r.popular?'<div style="background:#FF4060;color:#fff;font-size:9px;font-weight:700;padding:2px 8px;border-radius:8px;display:inline-block;margin-bottom:8px">POPULAR</div><br>':'')
          +'<div style="font-size:28px;margin-bottom:8px">'+r.icon+'</div>'
          +'<div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:3px">'+r.name+'</div>'
          +'<div style="font-size:11px;color:var(--text3);margin-bottom:10px">'+r.desc+'</div>'
          +'</div>'
          +'<div style="padding:8px 14px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;background:'+(redeemed?'var(--green-dim)':canAfford?'var(--purple-dim)':'transparent')+'">'
          +'<span style="font-size:12px;font-weight:700;color:var(--coin)">🪙 '+r.coins+'</span>'
          +'<span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:10px;background:'+(redeemed?'var(--green)':canAfford?'var(--purple)':'var(--surface2)')+';color:'+(redeemed||canAfford?'#fff':'var(--text3)')+'">'+( redeemed?'✓ Redeemed':canAfford?'Redeem':'Locked')+'</span>'
          +'</div></div>';
      }).join('')}
    </div>
  </div>`;
}

function showRedeemSheet(rewardId) {
  var r = REWARDS.find(function(x){return x.id===rewardId;});
  if (!r) return;
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;display:flex;align-items:flex-end';
  overlay.innerHTML = '<div style="background:var(--surface);border-radius:24px 24px 0 0;width:100%;max-width:480px;margin:0 auto;padding:24px">'
    +'<div style="width:40px;height:4px;background:var(--border2);border-radius:2px;margin:0 auto 20px"></div>'
    +'<div style="width:64px;height:64px;border-radius:18px;background:var(--purple-dim);display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 16px">'+r.icon+'</div>'
    +'<div style="font-size:20px;font-weight:900;color:var(--text);text-align:center;margin-bottom:6px">Redeem '+r.name+'?</div>'
    +'<div style="font-size:13px;color:var(--text2);text-align:center;margin-bottom:20px">'+r.desc+'</div>'
    +'<div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;margin-bottom:20px">'
    +'<div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px"><span style="color:var(--text2)">Cost</span><span style="font-weight:700;color:var(--coin)">🪙 '+r.coins+'</span></div>'
    +'<div style="display:flex;justify-content:space-between;font-size:14px"><span style="color:var(--text2)">Balance after</span><span style="font-weight:700;color:var(--text)">'+(G.coins-r.coins)+'</span></div>'
    +'</div>'
    +'<div style="display:flex;gap:10px">'
    +'<button onclick="this.closest(\'[style]\').remove()" style="flex:1;padding:14px;border-radius:var(--r);background:var(--surface2);border:1.5px solid var(--border);color:var(--text2);font-size:15px;font-weight:700;cursor:pointer;font-family:inherit">Cancel</button>'
    +'<button onclick="confirmRedeem(\''+rewardId+'\')" style="flex:2;padding:14px;border-radius:var(--r);background:var(--coin);border:none;color:#fff;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit">Confirm</button>'
    +'</div></div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e){if(e.target===overlay) overlay.remove();});
}

function confirmRedeem(rewardId) {
  var r = REWARDS.find(function(x){return x.id===rewardId;});
  if (!r || G.coins < r.coins) return;
  G.coins -= r.coins;
  G.redeemed.push(rewardId);
  updateCoinDisplay();
  document.querySelectorAll('[style]').forEach(function(el){
    if (el.style.cssText.includes('rgba(0,0,0,.6)')) el.remove();
  });
  // Show confirmation
  var toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:var(--green);color:#fff;padding:12px 20px;border-radius:20px;font-size:14px;font-weight:700;z-index:9999;white-space:nowrap;box-shadow:0 4px 20px rgba(0,0,0,.2)';
  toast.textContent = '✓ Redeemed: '+r.name;
  document.body.appendChild(toast);
  setTimeout(function(){toast.remove();},2500);
  launchConfetti();
  renderRewards();
}

function renderLevels() {
  var sc = typeof score === 'function' ? score() : null;
  var spineScore = sc ? Math.max(0,100-sc.risk) : 0;
  var curRank = getCurrentRank(spineScore);
  var nextRank = getNextRank(spineScore);
  document.getElementById('screen-levels').innerHTML = `
  <div style="background:var(--purple);padding:14px 18px 16px;position:sticky;top:0;z-index:5">
    <div style="font-size:16px;font-weight:800;color:#fff">Levels & Ranks</div>
  </div>
  <div style="padding:14px;padding-bottom:90px;display:flex;flex-direction:column;gap:14px">

    <!-- CURRENT RANK CARD -->
    <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r2);padding:20px;text-align:center;box-shadow:var(--shadow)">
      <div style="width:80px;height:80px;border-radius:22px;background:var(--purple-dim);display:flex;align-items:center;justify-content:center;font-size:40px;margin:0 auto 12px">${curRank.icon}</div>
      <div style="font-size:11px;font-weight:700;color:var(--text3);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px">CURRENT RANK · LEVEL ${RANKS.findIndex(function(r){return r.id===curRank.id;})+1}</div>
      <div style="font-size:24px;font-weight:900;color:var(--text);margin-bottom:16px">${curRank.name}</div>
      ${nextRank?`
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text3);margin-bottom:6px">
        <span>${curRank.name}</span><span>${nextRank.name}</span>
      </div>
      <div style="height:8px;background:var(--bg);border-radius:4px;overflow:hidden;border:1px solid var(--border);margin-bottom:8px">
        <div style="height:100%;width:${Math.round((spineScore-curRank.min)/(nextRank.min-curRank.min)*100)}%;background:linear-gradient(90deg,var(--purple),var(--teal));border-radius:4px"></div>
      </div>
      <div style="font-size:12px;color:var(--text3)">${nextRank.min-spineScore} points to reach ${nextRank.name}</div>
      `:'<div style="font-size:14px;font-weight:700;color:var(--green)">🌟 Maximum rank achieved!</div>'}
    </div>

    <!-- JOURNEY -->
    <div style="font-size:14px;font-weight:800;color:var(--text)">Your journey</div>
    <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r2);overflow:hidden;box-shadow:var(--shadow)">
      ${RANKS.map(function(r,i){
        var achieved = spineScore >= r.min;
        var isCurrent = r.id === curRank.id;
        return '<div style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--border);background:'+(isCurrent?'var(--purple-dim)':'transparent')+'">'
          +'<div style="width:36px;height:36px;border-radius:50%;background:'+(achieved?'var(--green-dim)':isCurrent?'var(--purple-dim)':'var(--surface2)')+';border:2px solid '+(achieved?'var(--green)':isCurrent?'var(--purple)':'var(--border)')+';display:flex;align-items:center;justify-content:center;font-size:'+(achieved?'16px':'14px')+';flex-shrink:0">'+(achieved&&!isCurrent?'✓':r.icon)+'</div>'
          +(i<RANKS.length-1?'':'')
          +'<div style="flex:1"><div style="font-size:14px;font-weight:'+(isCurrent?'800':'600')+';color:'+(isCurrent?'var(--purple)':'var(--text)')+'">'+r.name+'</div>'
          +'<div style="font-size:11px;color:var(--text3)">Score '+r.min+'+ · '+r.perks+'</div></div>'
          +(isCurrent?'<div style="background:var(--purple);color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:10px">YOU</div>':'')
          +(!achieved&&r.id==='elite'?'<div style="background:var(--amber-dim);color:var(--amber);font-size:11px;font-weight:700;padding:3px 10px;border-radius:10px;border:1px solid var(--amber)33">⭐ VIP</div>':'')
          +'</div>';
      }).join('')}
    </div>

    <!-- ACHIEVEMENTS -->
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div style="font-size:14px;font-weight:800;color:var(--text)">Achievements</div>
      <div style="font-size:12px;color:var(--text3)">${G.badges.length} / ${BADGES.length}</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
      ${BADGES.map(function(b){
        var earned = G.badges.includes(b.id);
        return '<div style="background:var(--surface);border:1.5px solid '+(earned?'var(--coin)':'var(--border)')+';border-radius:var(--r2);padding:12px 8px;text-align:center;box-shadow:var(--shadow);opacity:'+(earned?'1':'.5')+'">'
          +'<div style="font-size:28px;margin-bottom:6px">'+(earned?b.emoji:'🔒')+'</div>'
          +'<div style="font-size:11px;font-weight:700;color:var(--text);margin-bottom:2px">'+b.name+'</div>'
          +'<div style="font-size:10px;color:var(--text3)">'+b.desc+'</div>'
          +(earned?'<div style="font-size:10px;font-weight:700;color:var(--coin);margin-top:4px">+'+b.coins+' 🪙</div>':'')
          +'</div>';
      }).join('')}
    </div>

    <!-- LEADERBOARD RANK -->
    <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r2);padding:16px;box-shadow:var(--shadow)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.8px;text-transform:uppercase;margin-bottom:12px">🏅 Leaderboard rank</div>
      <div id="rank-content" style="font-size:13px;color:var(--text2)">Loading...</div>
    </div>
  </div>`;

  setTimeout(async function() {
    var el = document.getElementById('rank-content');
    if (!el) return;
    if (G.stepsCompleted.length === 0) {
      el.innerHTML = '<span style="color:var(--text3)">Complete the assessment to get ranked</span>';
      return;
    }
    var rank = await getMyRank();
    if (rank) {
      el.innerHTML = '<div style="display:flex;align-items:center;gap:12px">'
        +'<div style="font-size:42px;font-weight:900;color:var(--purple);line-height:1">#'+rank.rank+'</div>'
        +'<div><div style="font-size:14px;font-weight:700;color:var(--text)">Your position</div>'
        +'<div style="font-size:12px;color:var(--text3)">Out of '+rank.total+' users · 🪙 '+rank.coins+' coins</div></div></div>';
    } else {
      el.innerHTML = '<span style="color:var(--text3)">Generate your report to join the leaderboard</span>';
    }
  }, 300);
}
