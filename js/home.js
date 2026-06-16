/**
 * SpineIQ v2 — Home Screen
 */

function renderHome() {
  var sc = typeof score === 'function' ? score() : null;
  var sss = typeof calcSSS === 'function' ? calcSSS() : null;
  var spineScore = sc ? Math.max(0, 100 - sc.risk) : 0;
  var rank = getCurrentRank(spineScore);
  var nextRank = getNextRank(spineScore);
  var ptsToNext = nextRank ? nextRank.min - spineScore : 0;
  var today = new Date().toDateString();
  var checkedIn = G.dailyCheckin.date === today;
  var hour = new Date().getHours();
  var greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  var initials = (D.p.name||'You').split(' ').map(function(w){return w[0];}).join('').substring(0,2).toUpperCase();
  var ringC = 2*Math.PI*54;
  var dash = (spineScore/100)*ringC;

  var riskLvl = spineScore >= 70 ? 'Low' : spineScore >= 45 ? 'Moderate' : 'High';
  var riskCol  = spineScore >= 70 ? 'var(--green)' : spineScore >= 45 ? 'var(--amber)' : 'var(--red)';

  document.getElementById('screen-home').innerHTML = `
  <div style="padding:16px;padding-bottom:90px;display:flex;flex-direction:column;gap:12px">

    <!-- GREETING -->
    <div style="display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:40px;height:40px;border-radius:50%;background:var(--purple-dim);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:var(--purple)">${initials}</div>
        <div>
          <div style="font-size:13px;color:var(--text2)">${greeting} 👋</div>
          <div style="font-size:16px;font-weight:800;color:var(--text)">${D.p.name||'Welcome'}</div>
        </div>
      </div>
      <button onclick="showNotifications()" style="width:38px;height:38px;border-radius:50%;background:var(--surface);border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" stroke-width="2" stroke-linecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        <div style="position:absolute;top:6px;right:6px;width:8px;height:8px;border-radius:50%;background:var(--red);border:2px solid var(--surface)"></div>
      </button>
    </div>

    <!-- SPINE SCORE RING -->
    <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r2);padding:20px;display:flex;align-items:center;gap:18px;box-shadow:var(--shadow)">
      <div style="position:relative;flex-shrink:0">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" stroke-width="8"/>
          <circle cx="60" cy="60" r="54" fill="none" stroke="${spineScore>=70?'var(--green)':spineScore>=45?'var(--amber)':'var(--red)'}" stroke-width="8"
            stroke-linecap="round" stroke-dasharray="${dash} ${ringC}" transform="rotate(-90 60 60)"/>
          <text x="60" y="52" text-anchor="middle" font-size="28" font-weight="900" fill="${spineScore>=70?'var(--green)':spineScore>=45?'var(--amber)':'var(--red)'}" font-family="inherit">${spineScore}</text>
          <text x="60" y="68" text-anchor="middle" font-size="11" fill="var(--text3)" font-family="inherit">/100</text>
        </svg>
        <div style="position:absolute;bottom:-2px;left:50%;transform:translateX(-50%);background:${spineScore>=70?'var(--green)':spineScore>=45?'var(--amber)':'var(--red)'};color:#fff;font-size:10px;font-weight:700;padding:2px 10px;border-radius:10px;white-space:nowrap">${spineScore>=70?'Excellent':spineScore>=45?'Fair':'Needs work'}</div>
      </div>
      <div style="flex:1">
        <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.8px;text-transform:uppercase;margin-bottom:4px">Today's spine score</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.5;margin-bottom:8px">Lifestyle risk: <span style="color:${riskCol};font-weight:700">${riskLvl}</span></div>
        <div style="display:flex;gap:8px">
          <div style="background:var(--coin-dim);border:1px solid var(--coin)22;border-radius:var(--r);padding:6px 10px;text-align:center">
            <div style="font-size:15px;font-weight:800;color:var(--coin)">🪙 ${G.coins}</div>
            <div style="font-size:9px;color:var(--text3)">Coins</div>
          </div>
          <div style="background:var(--purple-dim);border:1px solid var(--purple)22;border-radius:var(--r);padding:6px 10px;text-align:center">
            <div style="font-size:13px;font-weight:800;color:var(--purple)">${rank.icon}</div>
            <div style="font-size:9px;color:var(--text3)">${rank.name.split(' ').pop()}</div>
          </div>
          <div style="background:${G.streak>=7?'var(--amber-dim)':'var(--surface2)'};border:1px solid ${G.streak>=7?'var(--amber)22':'var(--border)'};border-radius:var(--r);padding:6px 10px;text-align:center">
            <div style="font-size:15px;font-weight:800;color:${G.streak>=7?'var(--amber)':'var(--text2)'}">${G.streak}${G.streak>=3?'🔥':''}</div>
            <div style="font-size:9px;color:var(--text3)">Streak</div>
          </div>
        </div>
      </div>
    </div>

    <!-- RANK PROGRESS -->
    ${nextRank ? `
    <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r2);padding:14px 16px;box-shadow:var(--shadow)">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px">
        <span style="font-size:12px;font-weight:700;color:var(--purple)">${rank.icon} ${rank.name}</span>
        <span style="font-size:12px;color:var(--text3)">${nextRank.icon} ${nextRank.name}</span>
      </div>
      <div style="height:8px;background:var(--bg);border-radius:4px;overflow:hidden;border:1px solid var(--border)">
        <div style="height:100%;width:${Math.round((spineScore-rank.min)/(nextRank.min-rank.min)*100)}%;background:linear-gradient(90deg,var(--purple),var(--teal));border-radius:4px;transition:width .6s"></div>
      </div>
      <div style="font-size:11px;color:var(--text3);margin-top:6px">${ptsToNext} points to reach ${nextRank.name} · ${nextRank.perks}</div>
    </div>` : `
    <div style="background:linear-gradient(135deg,#FFB800,#FF7700);border-radius:var(--r2);padding:14px 16px">
      <div style="font-size:14px;font-weight:800;color:#fff">🌟 Spine Legend — Maximum rank!</div>
      <div style="font-size:12px;color:rgba(255,255,255,.7)">You've mastered your spine health journey</div>
    </div>`}

    <!-- CHECKIN CARD -->
    <div style="background:${checkedIn?'var(--green-dim)':'var(--surface)'};border:1.5px solid ${checkedIn?'var(--green)33':'var(--border)'};border-radius:var(--r2);padding:14px 16px;display:flex;align-items:center;gap:12px;box-shadow:var(--shadow)">
      <div style="font-size:28px">${checkedIn?'✅':'📋'}</div>
      <div style="flex:1">
        <div style="font-size:14px;font-weight:700;color:var(--text)">${checkedIn?'Checked in today!':'Daily check-in'}</div>
        <div style="font-size:12px;color:var(--text2)">${checkedIn?'Come back tomorrow to keep your '+G.streak+'-day streak':'Log your pain, sleep & activity to earn coins'}</div>
      </div>
      ${!checkedIn?`<button onclick="switchTab('track')" style="padding:8px 14px;border-radius:var(--r3);background:var(--purple);border:none;color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">Track →</button>`:''}
    </div>

    <!-- VIP PROGRESS -->
    <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r2);padding:14px 16px;box-shadow:var(--shadow)">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <span style="font-size:20px">👑</span>
        <div style="flex:1">
          <div style="font-size:14px;font-weight:700;color:var(--text)">VIP Membership</div>
          <div style="font-size:11px;color:var(--text3)">Unlocks at score 90 · Quarterly reviews + coaching + analytics</div>
        </div>
      </div>
      <div style="height:8px;background:var(--bg);border-radius:4px;overflow:hidden;border:1px solid var(--border);margin-bottom:6px">
        <div style="height:100%;width:${Math.min(spineScore,89)}%;background:linear-gradient(90deg,#FFB800,#FF7700);border-radius:4px"></div>
      </div>
      <div style="font-size:11px;color:var(--amber);font-weight:600">${spineScore<90?'Just '+(90-spineScore)+' points away — complete your daily tracking':'🎉 VIP unlocked!'}</div>
    </div>

    <!-- TODAY'S TRACKING -->
    <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.8px;text-transform:uppercase;display:flex;justify-content:space-between;align-items:center">
      <span>Today's tracking</span>
      <button onclick="switchTab('track')" style="background:transparent;border:none;color:var(--purple);font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">Log all →</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      ${[
        ['❤️','Pain level', G.dailyCheckin.pain!==null ? G.dailyCheckin.pain+'/10' : '—', G.dailyCheckin.pain!==null?(G.dailyCheckin.pain<=3?'var(--green)':G.dailyCheckin.pain<=6?'var(--amber)':'var(--red)'):'var(--text3)', G.dailyCheckin.pain<=3?'Minimal':'Moderate'],
        ['🌙','Sleep', G.dailyCheckin.sleep!==null ? G.dailyCheckin.sleep+'h' : '—', 'var(--blue)', 'Goal 8h'],
        ['👟','Steps', D.hd.steps ? Number(D.hd.steps).toLocaleString() : '—', 'var(--teal)', '82% of goal'],
        ['⚖️','Weight', D.p.weight ? D.p.weight+'kg' : '—', 'var(--purple2)', '-0.4kg this wk'],
      ].map(([ic,lbl,val,col,sub])=>`
      <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r2);padding:12px;box-shadow:var(--shadow)">
        <div style="font-size:18px;margin-bottom:6px">${ic}</div>
        <div style="font-size:10px;color:var(--text3);font-weight:600;margin-bottom:3px">${lbl}</div>
        <div style="font-size:20px;font-weight:800;color:${col}">${val}</div>
        <div style="font-size:10px;color:var(--text3);margin-top:2px">${sub}</div>
      </div>`).join('')}
    </div>

    <!-- WEEKLY PROGRESS -->
    <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r2);padding:16px;box-shadow:var(--shadow)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div style="font-size:14px;font-weight:700;color:var(--text)">Weekly progress</div>
        <div style="font-size:12px;font-weight:700;color:var(--green);background:var(--green-dim);padding:3px 8px;border-radius:10px">↑ 18% vs last wk</div>
      </div>
      <div style="font-size:11px;color:var(--text3);margin-bottom:4px">Coins earned</div>
      <div style="font-size:28px;font-weight:900;color:var(--coin);margin-bottom:12px">🪙 ${G.coins}</div>
      <div style="display:flex;align-items:flex-end;gap:4px;height:60px">
        ${['M','T','W','T','F','S','S'].map((d,i)=>{
          var h = i===6?100:Math.random()*70+10;
          var isToday = i===new Date().getDay()-1 || (new Date().getDay()===0&&i===6);
          return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">'
            +'<div style="width:100%;border-radius:4px 4px 0 0;background:'+(isToday?'var(--coin)':'var(--border)')+';height:'+Math.round(h)+'%"></div>'
            +'<div style="font-size:9px;color:'+(isToday?'var(--coin)':'var(--text3)')+'">'+d+'</div>'
            +'</div>';
        }).join('')}
      </div>
    </div>

    <!-- REWARDS FOR YOU -->
    <div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.8px;text-transform:uppercase;display:flex;justify-content:space-between;align-items:center">
      <span>Rewards for you</span>
      <button onclick="switchTab('rewards')" style="background:transparent;border:none;color:var(--purple);font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">See all →</button>
    </div>
    ${REWARDS.filter(function(r){return r.popular||G.coins>=r.coins;}).slice(0,2).map(function(r){
      var canAfford = G.coins >= r.coins;
      return '<div style="background:var(--surface);border:1.5px solid '+(canAfford?'var(--green)33':'var(--border)')+';border-radius:var(--r2);padding:14px 16px;display:flex;align-items:center;gap:12px;box-shadow:var(--shadow)">'
        +'<div style="font-size:28px">'+r.icon+'</div>'
        +'<div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--text)">'+r.name+'</div>'
        +'<div style="font-size:11px;color:var(--text3)">'+r.desc+'</div></div>'
        +'<div style="background:'+(canAfford?'var(--green)':'var(--surface2)')+';color:'+(canAfford?'#fff':'var(--text3)')+';padding:6px 12px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap">🪙 '+r.coins+'</div>'
        +'</div>';
    }).join('')}

  </div>`;
}

function showNotifications() {
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:flex-end';
  overlay.innerHTML = `
    <div style="background:var(--surface);border-radius:24px 24px 0 0;width:100%;max-width:480px;margin:0 auto;padding:20px;max-height:70vh;overflow-y:auto">
      <div style="width:40px;height:4px;background:var(--border2);border-radius:2px;margin:0 auto 20px"></div>
      <div style="font-size:18px;font-weight:800;color:var(--text);margin-bottom:16px">Notifications</div>
      ${[
        ['🔥','Streak at risk!','Log today to keep your '+G.streak+'-day flame'],
        ['🎁','New reward unlocked','Free physio session is now affordable'],
        ['👨‍⚕️','Dr. Sharma posted','New webinar: Desk posture fixes'],
        ['🏆','Great week!','You earned '+G.coins+' coins — top 5%'],
      ].map(([ic,t,s])=>`
      <div style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">
        <div style="font-size:22px">${ic}</div>
        <div><div style="font-size:14px;font-weight:700;color:var(--text)">${t}</div><div style="font-size:12px;color:var(--text2)">${s}</div></div>
      </div>`).join('')}
      <!-- THEME TOGGLE -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 0;border-top:1px solid var(--border);margin-top:8px">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:20px">🌓</span>
          <div>
            <div style="font-size:14px;font-weight:700;color:var(--text)" id="theme-label">Light mode</div>
            <div style="font-size:11px;color:var(--text3)">Switch appearance</div>
          </div>
        </div>
        <label style="position:relative;display:inline-block;width:48px;height:26px;cursor:pointer">
          <input type="checkbox" id="theme-toggle" onchange="toggleTheme()"
            style="opacity:0;width:0;height:0;position:absolute"
            ${localStorage.getItem('spineiq_theme')==='light'?'checked':''}>
          <span style="position:absolute;inset:0;background:var(--border2);border-radius:13px;transition:.3s;display:block"></span>
          <span style="position:absolute;top:3px;left:3px;width:20px;height:20px;background:#fff;border-radius:50%;transition:.3s;display:block;transform:${localStorage.getItem('spineiq_theme')==='light'?'translateX(22px)':'translateX(0)'}"></span>
        </label>
      </div>
      <button onclick="this.closest('[style]').remove()" style="width:100%;margin-top:8px;padding:13px;border-radius:var(--r);background:var(--surface2);border:1.5px solid var(--border);color:var(--text2);font-size:14px;font-weight:600;cursor:pointer;font-family:inherit">Close</button>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) { if (e.target===overlay) overlay.remove(); });
}
