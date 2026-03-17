/* ════════════════════════════════════════
   642 APP — login.js
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  Auth.seedDefault();
  Auth.redirectIfLoggedIn();

  /* Tabs */
  const tabLogin = document.getElementById('tabLogin');
  const tabReg   = document.getElementById('tabReg');
  const fLogin   = document.getElementById('fLogin');
  const fReg     = document.getElementById('fReg');
  const hTitle   = document.getElementById('rightTitle');
  const hSub     = document.getElementById('rightSub');

  function switchTab(t) {
    const isLogin = t === 'login';
    tabLogin.classList.toggle('active', isLogin);
    tabReg.classList.toggle('active', !isLogin);
    fLogin.classList.toggle('hidden', !isLogin);
    fReg.classList.toggle('hidden', isLogin);
    hTitle.textContent = isLogin ? 'Bienvenido' : 'Crear cuenta';
    hSub.textContent   = isLogin ? 'Inicia sesion o crea una cuenta para continuar' : 'Completa el formulario para registrarte';
    clearAllErrors();
  }
  tabLogin.addEventListener('click', () => switchTab('login'));
  tabReg.addEventListener('click',   () => switchTab('reg'));

  /* Toggle passwords */
  document.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const inp = btn.previousElementSibling;
      inp.type = inp.type === 'password' ? 'text' : 'password';
      btn.querySelector('.eye-open').style.display = inp.type === 'text' ? 'none'  : 'flex';
      btn.querySelector('.eye-shut').style.display = inp.type === 'text' ? 'flex'  : 'none';
    });
  });

  /* Strength meter */
  const rPassEl = document.getElementById('rPass');
  const sBars   = document.querySelectorAll('.strength-bar span');
  const sLabel  = document.getElementById('strengthLabel');
  const colors  = ['#e2e2e2','#e53935','#f57c00','#f9a825','#2e7d32'];
  const labels  = ['','Débil','Regular','Buena','Fuerte'];

  function calcStr(pw) {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 6)  s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return Math.min(4, Math.max(1, Math.round(s * 4 / 5)));
  }

  rPassEl?.addEventListener('input', () => {
    const lvl = rPassEl.value ? calcStr(rPassEl.value) : 0;
    sBars.forEach((b, i) => b.style.background = i < lvl ? colors[lvl] : colors[0]);
    sLabel.textContent = labels[lvl];
    sLabel.style.color = colors[lvl];
  });

  /* Errors */
  function clearAllErrors() {
    document.querySelectorAll('input.err').forEach(i => i.classList.remove('err'));
    document.querySelectorAll('.field-error.show').forEach(e => e.classList.remove('show'));
  }

  function err(inputId, errId, msg) {
    document.getElementById(inputId)?.classList.add('err');
    const e = document.getElementById(errId);
    if (e) { e.textContent = msg; e.classList.add('show'); }
    return false;
  }

  /* ── LOGIN ── */
  const btnLogin = document.getElementById('btnLogin');

  function doLogin() {
    clearAllErrors();
    const user = document.getElementById('iUser').value.trim();
    const pass = document.getElementById('iPass').value;
    let ok = true;
    if (!user) { err('iUser','errUser','Ingresa tu usuario'); ok = false; }
    if (!pass) { err('iPass','errPass','Ingresa tu contraseña'); ok = false; }
    if (!ok) return;

    btnLogin.disabled = true;
    btnLogin.classList.add('loading');
    setTimeout(() => {
      const res = Auth.login(user, pass);
      btnLogin.disabled = false;
      btnLogin.classList.remove('loading');
      if (!res.ok) {
        err('iUser','errUser',''); err('iPass','errPass','');
        UI.toast('Error de inicio de sesión', res.error, 'error');
        return;
      }
      UI.toast('¡Bienvenido!', `Hola, ${res.user.nombre}`, 'success');
      setTimeout(() => { window.location.href = 'pages/dashboard.html'; }, 800);
    }, 500);
  }

  btnLogin?.addEventListener('click', doLogin);
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !fLogin.classList.contains('hidden')) doLogin();
  });

  /* ── REGISTRO ── */
  const btnReg = document.getElementById('btnReg');

  function doRegister() {
    clearAllErrors();
    const nombre = document.getElementById('rNombre').value.trim();
    const user   = document.getElementById('rUser').value.trim();
    const rol    = document.getElementById('rRol').value;
    const pass   = document.getElementById('rPass').value;
    const pass2  = document.getElementById('rPass2').value;
    let ok = true;
    if (!nombre) { err('rNombre','errNombre','Ingresa tu nombre'); ok = false; }
    if (!user)   { err('rUser','errRUser','Elige un usuario'); ok = false; }
    if (!pass)   { err('rPass','errRPass','Crea una contraseña'); ok = false; }
    if (pass && pass.length < 6) { err('rPass','errRPass','Mínimo 6 caracteres'); ok = false; }
    if (pass !== pass2) { err('rPass2','errRPass2','Las contraseñas no coinciden'); ok = false; }
    if (!ok) return;

    btnReg.disabled = true;
    btnReg.classList.add('loading');
    setTimeout(() => {
      const res = Auth.register({ nombre, username: user, password: pass, rol });
      btnReg.disabled = false;
      btnReg.classList.remove('loading');
      if (!res.ok) {
        UI.toast('Error al registrar', res.error, 'error');
        if (res.error.includes('usuario')) err('rUser','errRUser', res.error);
        return;
      }
      UI.toast('¡Cuenta creada!', 'Ya puedes iniciar sesión', 'success');
      ['rNombre','rUser','rPass','rPass2'].forEach(id => { document.getElementById(id).value = ''; });
      document.getElementById('iUser').value = user;
      switchTab('login');
    }, 500);
  }

  btnReg?.addEventListener('click', doRegister);
});
