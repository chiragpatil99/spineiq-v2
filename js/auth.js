/**
 * SpineIQ v2 — Auth (Prototype)
 * Email + Password login with localStorage
 */

// Demo accounts pre-seeded
const DEMO_ACCOUNTS = [
  { email: 'demo@spineiq.com',    password: 'spine123', name: 'Demo Patient' },
  { email: 'rahul@example.com',   password: 'rahul123', name: 'Rahul Sharma'  },
  { email: 'test@spineiq.com',    password: 'test123',  name: 'Test User'     },
];

var currentUser = null;

function authInit() {
  // Check if already logged in
  var saved = localStorage.getItem('spineiq_user');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      D.p.name = currentUser.name;
      D.p.email = currentUser.email;
      return true; // already logged in
    } catch(e) {}
  }
  return false;
}

function authLogin(email, password) {
  email = (email||'').trim().toLowerCase();
  password = (password||'').trim();

  // Check demo accounts
  var match = DEMO_ACCOUNTS.find(function(a) {
    return a.email.toLowerCase() === email && a.password === password;
  });

  // Also check registered accounts in localStorage
  if (!match) {
    var registered = JSON.parse(localStorage.getItem('spineiq_accounts') || '[]');
    match = registered.find(function(a) {
      return a.email.toLowerCase() === email && a.password === password;
    });
  }

  if (match) {
    currentUser = { email: match.email, name: match.name };
    localStorage.setItem('spineiq_user', JSON.stringify(currentUser));
    D.p.name = match.name;
    D.p.email = match.email;
    return { success: true };
  }
  return { success: false, error: 'Invalid email or password' };
}

function authRegister(name, email, password) {
  name = (name||'').trim();
  email = (email||'').trim().toLowerCase();
  password = (password||'').trim();

  if (!name || name.length < 2) return { success:false, error:'Please enter your full name' };
  if (!email.includes('@')) return { success:false, error:'Please enter a valid email' };
  if (password.length < 6) return { success:false, error:'Password must be at least 6 characters' };

  // Check not already registered
  var registered = JSON.parse(localStorage.getItem('spineiq_accounts') || '[]');
  var exists = DEMO_ACCOUNTS.find(function(a){ return a.email.toLowerCase()===email; })
    || registered.find(function(a){ return a.email.toLowerCase()===email; });
  if (exists) return { success:false, error:'An account with this email already exists' };

  // Register
  registered.push({ name, email, password });
  localStorage.setItem('spineiq_accounts', JSON.stringify(registered));

  // Auto login
  return authLogin(email, password);
}

function authLogout() {
  localStorage.removeItem('spineiq_user');
  currentUser = null;
  showLoginScreen();
}

// ── LOGIN SCREEN ──────────────────────────────────────────────────
function showLoginScreen() {
  var existing = document.getElementById('auth-screen');
  if (existing) existing.remove();

  var screen = document.createElement('div');
  screen.id = 'auth-screen';
  screen.style.cssText = 'position:fixed;inset:0;z-index:10000;background:linear-gradient(160deg,#1A1040 0%,#0D0820 50%,#120830 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;font-family:-apple-system,BlinkMacSystemFont,Inter,sans-serif;overflow-y:auto';

  screen.innerHTML = `
    <div style="width:100%;max-width:360px">

      <!-- Logo -->
      <div style="text-align:center;margin-bottom:32px">
        <div style="width:64px;height:64px;background:linear-gradient(135deg,#6C3FE8,#00C4A8);border-radius:18px;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;box-shadow:0 8px 32px rgba(108,63,232,.4)">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round">
            <path d="M12 3c-3 0-5 2.5-5 5.5 0 2 1 3.5 2 5L12 22l3-8.5c1-1.5 2-3 2-5C17 5.5 15 3 12 3z"/>
            <circle cx="12" cy="8.5" r="1.5" fill="#fff" stroke="none"/>
          </svg>
        </div>
        <div style="font-size:28px;font-weight:900;color:#fff;letter-spacing:-.5px">SpineIQ</div>
        <div style="font-size:13px;color:rgba(255,255,255,.5);margin-top:4px">Spine Health Quest</div>
      </div>

      <!-- Tab switcher -->
      <div style="display:flex;background:rgba(255,255,255,.08);border-radius:12px;padding:4px;margin-bottom:24px">
        <button id="tab-login-btn" onclick="showLoginForm()" style="flex:1;padding:10px;border-radius:9px;border:none;background:#6C3FE8;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s">Sign in</button>
        <button id="tab-register-btn" onclick="showRegisterForm()" style="flex:1;padding:10px;border-radius:9px;border:none;background:transparent;color:rgba(255,255,255,.5);font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s">Create account</button>
      </div>

      <!-- Form container -->
      <div id="auth-form-wrap"></div>

      <!-- Demo hint -->
      <div style="margin-top:20px;padding:12px 16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:12px">
        <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,.4);letter-spacing:.8px;text-transform:uppercase;margin-bottom:6px">Demo account</div>
        <div style="font-size:13px;color:rgba(255,255,255,.6)">Email: <span style="color:#8B7CF6;font-weight:600">demo@spineiq.com</span></div>
        <div style="font-size:13px;color:rgba(255,255,255,.6);margin-top:3px">Password: <span style="color:#8B7CF6;font-weight:600">spine123</span></div>
        <button onclick="quickDemo()" style="margin-top:10px;width:100%;padding:9px;border-radius:10px;background:rgba(108,63,232,.3);border:1px solid rgba(108,63,232,.4);color:#8B7CF6;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">Use demo account →</button>
      </div>

      <div style="text-align:center;margin-top:16px;font-size:11px;color:rgba(255,255,255,.3);line-height:1.5">
        By continuing you agree to our Terms of Service.<br>
        Data is stored locally on this device.
      </div>
    </div>`;

  document.body.appendChild(screen);
  showLoginForm();
}

function showLoginForm() {
  document.getElementById('tab-login-btn').style.background = '#6C3FE8';
  document.getElementById('tab-login-btn').style.color = '#fff';
  document.getElementById('tab-register-btn').style.background = 'transparent';
  document.getElementById('tab-register-btn').style.color = 'rgba(255,255,255,.5)';

  document.getElementById('auth-form-wrap').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px">
      <div>
        <div style="font-size:12px;font-weight:600;color:rgba(255,255,255,.5);margin-bottom:6px">Email address</div>
        <input id="auth-email" type="email" placeholder="your@email.com"
          style="width:100%;padding:13px 16px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:12px;color:#fff;font-size:15px;font-family:inherit;outline:none"
          onfocus="this.style.borderColor='#6C3FE8'" onblur="this.style.borderColor='rgba(255,255,255,.12)'">
      </div>
      <div>
        <div style="font-size:12px;font-weight:600;color:rgba(255,255,255,.5);margin-bottom:6px">Password</div>
        <input id="auth-password" type="password" placeholder="Enter password"
          style="width:100%;padding:13px 16px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:12px;color:#fff;font-size:15px;font-family:inherit;outline:none"
          onfocus="this.style.borderColor='#6C3FE8'" onblur="this.style.borderColor='rgba(255,255,255,.12)'"
          onkeydown="if(event.key==='Enter')doLogin()">
      </div>
      <div id="auth-error" style="display:none;background:rgba(240,64,96,.15);border:1px solid rgba(240,64,96,.3);border-radius:10px;padding:10px 14px;font-size:13px;color:#FF5570;font-weight:500"></div>
      <button onclick="doLogin()" id="auth-submit"
        style="width:100%;padding:14px;border-radius:12px;background:linear-gradient(135deg,#6C3FE8,#8B7CF6);border:none;color:#fff;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;box-shadow:0 4px 20px rgba(108,63,232,.4);margin-top:4px">
        Sign in →
      </button>
    </div>`;
}

function showRegisterForm() {
  document.getElementById('tab-register-btn').style.background = '#6C3FE8';
  document.getElementById('tab-register-btn').style.color = '#fff';
  document.getElementById('tab-login-btn').style.background = 'transparent';
  document.getElementById('tab-login-btn').style.color = 'rgba(255,255,255,.5)';

  document.getElementById('auth-form-wrap').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px">
      <div>
        <div style="font-size:12px;font-weight:600;color:rgba(255,255,255,.5);margin-bottom:6px">Full name</div>
        <input id="auth-name" type="text" placeholder="Your full name"
          style="width:100%;padding:13px 16px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:12px;color:#fff;font-size:15px;font-family:inherit;outline:none"
          onfocus="this.style.borderColor='#6C3FE8'" onblur="this.style.borderColor='rgba(255,255,255,.12)'">
      </div>
      <div>
        <div style="font-size:12px;font-weight:600;color:rgba(255,255,255,.5);margin-bottom:6px">Email address</div>
        <input id="auth-email" type="email" placeholder="your@email.com"
          style="width:100%;padding:13px 16px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:12px;color:#fff;font-size:15px;font-family:inherit;outline:none"
          onfocus="this.style.borderColor='#6C3FE8'" onblur="this.style.borderColor='rgba(255,255,255,.12)'">
      </div>
      <div>
        <div style="font-size:12px;font-weight:600;color:rgba(255,255,255,.5);margin-bottom:6px">Password</div>
        <input id="auth-password" type="password" placeholder="Min. 6 characters"
          style="width:100%;padding:13px 16px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:12px;color:#fff;font-size:15px;font-family:inherit;outline:none"
          onfocus="this.style.borderColor='#6C3FE8'" onblur="this.style.borderColor='rgba(255,255,255,.12)'"
          onkeydown="if(event.key==='Enter')doRegister()">
      </div>
      <div id="auth-error" style="display:none;background:rgba(240,64,96,.15);border:1px solid rgba(240,64,96,.3);border-radius:10px;padding:10px 14px;font-size:13px;color:#FF5570;font-weight:500"></div>
      <button onclick="doRegister()" id="auth-submit"
        style="width:100%;padding:14px;border-radius:12px;background:linear-gradient(135deg,#6C3FE8,#00C4A8);border:none;color:#fff;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;box-shadow:0 4px 20px rgba(108,63,232,.4);margin-top:4px">
        Create account →
      </button>
    </div>`;
}

function showAuthError(msg) {
  var el = document.getElementById('auth-error');
  if (el) { el.textContent = msg; el.style.display='block'; }
}

function doLogin() {
  var email = document.getElementById('auth-email')?.value;
  var password = document.getElementById('auth-password')?.value;
  var btn = document.getElementById('auth-submit');
  if (btn) { btn.textContent='Signing in...'; btn.disabled=true; }

  setTimeout(function() {
    var result = authLogin(email, password);
    if (result.success) {
      onLoginSuccess();
    } else {
      showAuthError(result.error);
      if (btn) { btn.textContent='Sign in →'; btn.disabled=false; }
    }
  }, 600);
}

function doRegister() {
  var name = document.getElementById('auth-name')?.value;
  var email = document.getElementById('auth-email')?.value;
  var password = document.getElementById('auth-password')?.value;
  var btn = document.getElementById('auth-submit');
  if (btn) { btn.textContent='Creating account...'; btn.disabled=true; }

  setTimeout(function() {
    var result = authRegister(name, email, password);
    if (result.success) {
      onLoginSuccess();
    } else {
      showAuthError(result.error);
      if (btn) { btn.textContent='Create account →'; btn.disabled=false; }
    }
  }, 800);
}

function quickDemo() {
  document.getElementById('auth-email') && (document.getElementById('auth-email').value = 'demo@spineiq.com');
  document.getElementById('auth-password') && (document.getElementById('auth-password').value = 'spine123');
  if (!document.getElementById('auth-email')) showLoginForm();
  setTimeout(function() {
    document.getElementById('auth-email').value = 'demo@spineiq.com';
    document.getElementById('auth-password').value = 'spine123';
    doLogin();
  }, 100);
}

function onLoginSuccess() {
  var screen = document.getElementById('auth-screen');
  if (screen) {
    screen.style.transition = 'opacity .4s,transform .4s';
    screen.style.opacity = '0';
    screen.style.transform = 'scale(1.05)';
    setTimeout(function() {
      screen.remove();
      // Show onboarding or home
      if (!sessionStorage.getItem('spineiq_v2_welcomed')) {
        showOnboarding();
      } else {
        renderHome();
        switchTab('home');
      }
    }, 400);
  }
}
