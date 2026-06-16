/**
 * SpineIQ v2 — Daily Tracking Screen
 */

var exerciseTimer = null;
var currentExercise = 0;
var exerciseTimeLeft = 0;

function renderTrack() {
  var today = new Date().toDateString();
  var ci = G.dailyCheckin;
  document.getElementById('screen-track').innerHTML = `
  <div style="background:var(--purple);padding:14px 18px 16px;position:sticky;top:0;z-index:5">
    <div style="font-size:16px;font-weight:800;color:#fff">Daily Tracking</div>
    <div style="font-size:12px;color:rgba(255,255,255,.6);margin-top:2px">${new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}</div>
  </div>
  <div style="padding:14px;padding-bottom:90px;display:flex;flex-direction:column;gap:12px">

    <!-- WEARABLE SYNC -->
    <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r2);padding:14px 16px;display:flex;align-items:center;gap:12px;box-shadow:var(--shadow)">
      <div style="width:36px;height:36px;border-radius:10px;background:var(--blue-dim);display:flex;align-items:center;justify-content:center;font-size:18px">⌚</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700;color:var(--text)">Apple Watch synced</div>
        <div style="font-size:11px;color:var(--text3)">Steps & sleep auto-tracked · just now</div>
      </div>
      <button style="font-size:12px;font-weight:700;color:var(--purple);background:transparent;border:none;cursor:pointer;font-family:inherit">Devices →</button>
    </div>

    <!-- PAIN LOG -->
    <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r2);overflow:hidden;box-shadow:var(--shadow)">
      <div style="padding:14px 16px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <span style="font-size:20px">❤️</span>
          <div><div style="font-size:14px;font-weight:700;color:var(--text)">Pain log</div><div style="font-size:12px;color:var(--text3)">How's your back today?</div></div>
        </div>
        <div style="font-size:42px;font-weight:900;color:${ci.pain===null?'var(--text3)':ci.pain<=3?'var(--green)':ci.pain<=6?'var(--amber)':'var(--red)'};margin-bottom:4px">${ci.pain===null?'—':ci.pain}</div>
        <div style="font-size:12px;color:var(--text3);margin-bottom:12px">${ci.pain===null?'Not logged':ci.pain<=3?'Minimal · nice':ci.pain<=6?'Moderate':' Severe'}</div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span style="font-size:11px;color:var(--text3)">No pain</span>
          <input type="range" min="0" max="10" step="1" value="${ci.pain||0}" style="flex:1" oninput="G.dailyCheckin.pain=+this.value;renderTrack()">
          <span style="font-size:11px;color:var(--text3)">Severe</span>
        </div>
      </div>
      ${ci.pain===null||ci.painLogged?
        (ci.painLogged?'<div style="padding:10px 16px;font-size:13px;font-weight:600;color:var(--green);border-top:1px solid var(--border);display:flex;align-items:center;gap:6px"><span>✓</span> Logged today</div>'
        :'<button onclick="logPain()" style="width:100%;padding:13px;background:var(--coin);border:none;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px;border-top:1px solid var(--border)">🪙 Log & earn +15</button>')
        :'<button onclick="logPain()" style="width:100%;padding:13px;background:var(--coin);border:none;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px;border-top:1px solid var(--border)">🪙 Log & earn +15</button>'}
    </div>

    <!-- SLEEP -->
    <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r2);overflow:hidden;box-shadow:var(--shadow)">
      <div style="padding:14px 16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:20px">🌙</span>
            <div><div style="font-size:14px;font-weight:700;color:var(--text)">Sleep</div><div style="font-size:12px;color:var(--text3)">Auto-detected · adjust if needed</div></div>
          </div>
          ${ci.sleepLogged?'<div style="background:var(--green-dim);color:var(--green);font-size:12px;font-weight:700;padding:4px 10px;border-radius:10px;border:1px solid var(--green)33">✓ Done</div>':''}
        </div>
        <div style="display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:8px">
          <button onclick="adjustSleep(-0.5)" style="width:36px;height:36px;border-radius:50%;background:var(--surface2);border:1.5px solid var(--border);font-size:18px;cursor:pointer">−</button>
          <div style="text-align:center">
            <span style="font-size:36px;font-weight:900;color:var(--text)">${G.dailyCheckin.sleep||7.5}</span>
            <span style="font-size:16px;color:var(--text2)"> hours</span>
          </div>
          <button onclick="adjustSleep(0.5)" style="width:36px;height:36px;border-radius:50%;background:var(--surface2);border:1.5px solid var(--border);font-size:18px;cursor:pointer">+</button>
        </div>
        <div style="font-size:12px;color:var(--text3);margin-bottom:4px;text-align:center">Goal 8h · <span style="font-weight:600;color:${(G.dailyCheckin.sleep||7.5)>=7?'var(--green)':'var(--amber)'}">${Math.abs(8-(G.dailyCheckin.sleep||7.5)).toFixed(1)}h ${(G.dailyCheckin.sleep||7.5)>=8?'above':'to'} goal</span></div>
      </div>
      ${ci.sleepLogged?
        '<div style="padding:10px 16px;font-size:13px;font-weight:600;color:var(--green);border-top:1px solid var(--border);text-align:center">Logged today</div>'
        :'<button onclick="logSleep()" style="width:100%;padding:13px;background:var(--coin);border:none;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px;border-top:1px solid var(--border)">🪙 Log & earn +20</button>'}
    </div>

    <!-- ACTIVITY -->
    <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r2);overflow:hidden;box-shadow:var(--shadow)">
      <div style="padding:14px 16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:20px">👟</span>
            <div><div style="font-size:14px;font-weight:700;color:var(--text)">Activity</div><div style="font-size:12px;color:var(--text3)">From Apple Watch</div></div>
          </div>
          <button style="background:var(--green-dim);color:var(--green);border:1px solid var(--green)33;border-radius:10px;font-size:11px;font-weight:700;padding:4px 10px;cursor:pointer;font-family:inherit">⟳ Auto</button>
        </div>
        <div style="display:flex;align-items:center;gap:14px">
          <div style="position:relative">
            <svg width="70" height="70" viewBox="0 0 70 70">
              <circle cx="35" cy="35" r="28" fill="none" stroke="var(--border)" stroke-width="7"/>
              <circle cx="35" cy="35" r="28" fill="none" stroke="var(--teal)" stroke-width="7"
                stroke-linecap="round" stroke-dasharray="${Math.round((parseInt(D.hd.steps||8240)/10000)*175.9)} 175.9" transform="rotate(-90 35 35)"/>
              <text x="35" y="40" text-anchor="middle" font-size="13" font-weight="800" fill="var(--teal)" font-family="inherit">${Math.round((parseInt(D.hd.steps||8240)/10000)*100)}%</text>
            </svg>
          </div>
          <div>
            <div style="font-size:28px;font-weight:900;color:var(--text)">${parseInt(D.hd.steps||8240).toLocaleString()}</div>
            <div style="font-size:12px;color:var(--text3)">of 10,000 steps</div>
            <div style="display:flex;gap:10px;margin-top:6px">
              <span style="font-size:11px;color:var(--text3)">5.2 km</span>
              <span style="font-size:11px;color:var(--text3)">410 kcal</span>
              <span style="font-size:11px;color:var(--text3)">42 active min</span>
            </div>
          </div>
        </div>
      </div>
      ${ci.activityDone?
        '<div style="padding:10px 16px;font-size:13px;font-weight:600;color:var(--green);border-top:1px solid var(--border);text-align:center">Reward claimed</div>'
        :'<button onclick="claimActivity()" style="width:100%;padding:13px;background:var(--coin);border:none;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px;border-top:1px solid var(--border)">🪙 Claim goal reward +20</button>'}
    </div>

    <!-- SPINE ROUTINE -->
    <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r2);overflow:hidden;box-shadow:var(--shadow)">
      <div style="padding:14px 16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:20px">🦴</span>
            <div><div style="font-size:14px;font-weight:700;color:var(--text)">Spine routine</div><div style="font-size:12px;color:var(--text3)">${EXERCISES.length} exercises · ~8 min</div></div>
          </div>
          <div style="background:var(--amber-dim);color:var(--amber);border:1px solid var(--amber)33;border-radius:10px;padding:3px 8px;font-size:11px;font-weight:700">🔥 ${EXERCISES.length*2}</div>
        </div>
        ${EXERCISES.map(function(ex,i){return `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
          <div style="width:22px;height:22px;border-radius:50%;background:var(--purple-dim);color:var(--purple);font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">${i+1}</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600;color:var(--text)">${ex.name}</div>
            <div style="font-size:11px;color:var(--text3)">${ex.reps}</div>
          </div>
          <div style="font-size:11px;color:var(--text3)">${ex.duration}s</div>
        </div>`;}).join('')}
      </div>
      ${ci.routineDone?
        '<div style="padding:10px 16px;font-size:13px;font-weight:600;color:var(--green);border-top:1px solid var(--border);display:flex;align-items:center;justify-content:center;gap:6px">✓ Routine complete · +30 🪙</div>'
        :'<button onclick="startRoutine()" style="width:100%;padding:13px;background:var(--purple);border:none;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px">▶ Start routine · +30</button>'}
    </div>

    <!-- WEIGHT -->
    <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r2);overflow:hidden;box-shadow:var(--shadow)">
      <div style="padding:14px 16px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <span style="font-size:20px">⚖️</span>
          <div><div style="font-size:14px;font-weight:700;color:var(--text)">Weight</div><div style="font-size:12px;color:var(--text3)">Update weekly</div></div>
        </div>
        <div style="display:flex;align-items:center;justify-content:center;gap:16px">
          <button onclick="adjustWeight(-0.1)" style="width:36px;height:36px;border-radius:50%;background:var(--surface2);border:1.5px solid var(--border);font-size:18px;cursor:pointer">−</button>
          <div style="text-align:center">
            <span style="font-size:36px;font-weight:900;color:var(--text)">${parseFloat(D.p.weight||72.4).toFixed(1)}</span>
            <span style="font-size:16px;color:var(--text2)"> kg</span>
          </div>
          <button onclick="adjustWeight(0.1)" style="width:36px;height:36px;border-radius:50%;background:var(--surface2);border:1.5px solid var(--border);font-size:18px;cursor:pointer">+</button>
        </div>
      </div>
      ${ci.weightDone?
        '<div style="padding:10px 16px;font-size:13px;font-weight:600;color:var(--green);border-top:1px solid var(--border);text-align:center">Logged today</div>'
        :'<button onclick="logWeight()" style="width:100%;padding:13px;background:var(--coin);border:none;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px;border-top:1px solid var(--border)">🪙 Log & earn +10</button>'}
    </div>
  </div>`;
}

function logPain()     { G.dailyCheckin.painLogged=true;    G.dailyCheckin.date=new Date().toDateString(); awardCoins(15,'Pain logged'); renderTrack(); }
function logSleep()    { G.dailyCheckin.sleepLogged=true;   G.dailyCheckin.date=new Date().toDateString(); awardCoins(20,'Sleep logged'); renderTrack(); }
function claimActivity(){ G.dailyCheckin.activityDone=true; G.dailyCheckin.date=new Date().toDateString(); awardCoins(20,'Activity goal!'); renderTrack(); }
function logWeight()   { G.dailyCheckin.weightDone=true;    G.dailyCheckin.date=new Date().toDateString(); awardCoins(10,'Weight logged'); renderTrack(); }

function adjustSleep(d) {
  G.dailyCheckin.sleep = Math.min(12, Math.max(3, parseFloat(((G.dailyCheckin.sleep||7.5)+d).toFixed(1))));
  renderTrack();
}
function adjustWeight(d) {
  D.p.weight = Math.max(30, parseFloat((parseFloat(D.p.weight||72.4)+d).toFixed(1))).toString();
  renderTrack();
}

function startRoutine() {
  currentExercise = 0;
  showExercise();
}

function showExercise() {
  if (currentExercise >= EXERCISES.length) {
    finishRoutine(); return;
  }
  var ex = EXERCISES[currentExercise];
  exerciseTimeLeft = ex.duration;
  var overlay = document.createElement('div');
  overlay.id = 'exercise-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(108,63,232,.95);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:24px;text-align:center';
  overlay.innerHTML = '<div style="font-size:12px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:1px;text-transform:uppercase">Exercise '+(currentExercise+1)+' of '+EXERCISES.length+'</div>'
    +'<div style="font-size:22px;font-weight:900;color:#fff;margin-top:8px">'+ex.name+'</div>'
    +'<div style="font-size:14px;color:rgba(255,255,255,.7);line-height:1.5;max-width:260px">'+ex.desc+'</div>'
    +'<div style="font-size:11px;font-weight:700;color:var(--coin);background:rgba(255,184,0,.15);padding:4px 14px;border-radius:20px;border:1px solid rgba(255,184,0,.3)">'+ex.reps+'</div>'
    +'<div id="timer-circle" style="margin:16px 0">'
    +'<svg width="120" height="120" viewBox="0 0 120 120">'
    +'<circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="8"/>'
    +'<circle id="timer-ring" cx="60" cy="60" r="50" fill="none" stroke="#FFD700" stroke-width="8" stroke-linecap="round" stroke-dasharray="314 314" transform="rotate(-90 60 60)"/>'
    +'<text id="timer-text" x="60" y="68" text-anchor="middle" font-size="32" font-weight="900" fill="#fff" font-family="inherit">'+ex.duration+'</text>'
    +'</svg></div>'
    +'<div style="display:flex;gap:12px;margin-top:8px">'
    +'<button onclick="skipExercise()" style="padding:12px 24px;border-radius:20px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);color:#fff;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit">Skip</button>'
    +'<button id="pause-btn" onclick="togglePause()" style="padding:12px 24px;border-radius:20px;background:var(--surface);border:none;color:var(--purple);font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">Pause</button>'
    +'</div>';
  document.body.appendChild(overlay);
  runTimer(ex.duration);
}

var timerPaused = false;
function runTimer(duration) {
  clearInterval(exerciseTimer);
  timerPaused = false;
  exerciseTimer = setInterval(function() {
    if (timerPaused) return;
    exerciseTimeLeft--;
    var ring = document.getElementById('timer-ring');
    var txt  = document.getElementById('timer-text');
    if (!ring || !txt) { clearInterval(exerciseTimer); return; }
    var pct = exerciseTimeLeft / duration;
    ring.setAttribute('stroke-dasharray', Math.round(pct*314)+' 314');
    txt.textContent = exerciseTimeLeft;
    if (exerciseTimeLeft <= 0) {
      clearInterval(exerciseTimer);
      nextExercise();
    }
  }, 1000);
}

function togglePause() {
  timerPaused = !timerPaused;
  var btn = document.getElementById('pause-btn');
  if (btn) btn.textContent = timerPaused ? 'Resume' : 'Pause';
}

function skipExercise() {
  clearInterval(exerciseTimer);
  nextExercise();
}

function nextExercise() {
  var overlay = document.getElementById('exercise-overlay');
  if (overlay) overlay.remove();
  currentExercise++;
  if (currentExercise < EXERCISES.length) {
    setTimeout(showExercise, 400);
  } else {
    finishRoutine();
  }
}

function finishRoutine() {
  clearInterval(exerciseTimer);
  G.dailyCheckin.routineDone = true;
  G.dailyCheckin.date = new Date().toDateString();
  awardCoins(30, 'Spine routine!');
  launchConfetti();
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(108,63,232,.95);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:24px';
  overlay.innerHTML = '<div style="font-size:64px">🎉</div>'
    +'<div style="font-size:26px;font-weight:900;color:#fff">Routine complete!</div>'
    +'<div style="font-size:14px;color:rgba(255,255,255,.7)">5 exercises · ~8 minutes</div>'
    +'<div style="background:rgba(255,215,0,.2);border:1px solid rgba(255,215,0,.4);border-radius:20px;padding:12px 24px;margin-top:8px">'
    +'<span style="font-size:28px;font-weight:900;color:#FFD700">+30 🪙</span></div>'
    +'<button onclick="this.closest(\'[style]\').remove();renderTrack()" style="margin-top:16px;padding:14px 40px;border-radius:var(--r3);background:var(--surface);border:none;color:var(--purple);font-size:15px;font-weight:800;cursor:pointer;font-family:inherit">Done ✓</button>';
  document.body.appendChild(overlay);
}
