/* ════════════════════════════════════════
   642 APP — auth.js
   Sesión, login, registro con localStorage
════════════════════════════════════════ */

const Auth = (() => {
  const USERS_KEY   = '642_users';
  const SESSION_KEY = '642_session';

  function getUsers()        { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
  function saveUsers(u)      { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
  function getSession()      { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); }
  function saveSession(u)    { sessionStorage.setItem(SESSION_KEY, JSON.stringify(u)); }
  function clearSession()    { sessionStorage.removeItem(SESSION_KEY); }

  function seedDefault() {
    const users = getUsers();
    if (!users.some(u => u.username === 'admin')) {
      users.push({ id: 1, nombre: 'Administrador', username: 'admin', password: 'admin123', rol: 'Administrador', createdAt: new Date().toISOString() });
      saveUsers(users);
    }
  }

  function login(username, password) {
    const user = getUsers().find(u =>
      u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    if (!user) return { ok: false, error: 'Usuario o contraseña incorrectos' };
    const s = { id: user.id, nombre: user.nombre, username: user.username, rol: user.rol };
    saveSession(s);
    return { ok: true, user: s };
  }

  function register({ nombre, username, password, rol }) {
    if (!nombre || !username || !password)
      return { ok: false, error: 'Todos los campos son requeridos' };
    if (username.length < 3)
      return { ok: false, error: 'El usuario debe tener al menos 3 caracteres' };
    if (password.length < 6)
      return { ok: false, error: 'La contraseña debe tener al menos 6 caracteres' };
    const users = getUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase()))
      return { ok: false, error: 'Ese nombre de usuario ya está en uso' };
    users.push({ id: Date.now(), nombre: nombre.trim(), username: username.trim(), password, rol: rol || 'Fotógrafo', createdAt: new Date().toISOString() });
    saveUsers(users);
    return { ok: true };
  }

  function logout() {
    clearSession();
    window.location.href = '../index.html';
  }

  function requireAuth() {
    const s = getSession();
    if (!s) { window.location.href = '../index.html'; return null; }
    return s;
  }

  function redirectIfLoggedIn() {
    if (getSession()) window.location.href = 'pages/dashboard.html';
  }

  return { seedDefault, login, register, logout, requireAuth, redirectIfLoggedIn, getSession };
})();

/* ════════════════════════════════════════
   642 APP — db.js
   Datos genéricos con localStorage
════════════════════════════════════════ */

const DB = (() => {
  function get(key)         { return JSON.parse(localStorage.getItem('642_' + key) || '[]'); }
  function set(key, data)   { localStorage.setItem('642_' + key, JSON.stringify(data)); }
  function nextId(arr)      { return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1; }

  function all(key)         { return get(key); }
  function find(key, id)    { return get(key).find(x => x.id === id) || null; }
  function insert(key, obj) {
    const arr = get(key);
    const item = { ...obj, id: nextId(arr), createdAt: new Date().toISOString() };
    arr.push(item);
    set(key, arr);
    return item;
  }
  function update(key, id, changes) {
    const arr = get(key).map(x => x.id === id ? { ...x, ...changes, updatedAt: new Date().toISOString() } : x);
    set(key, arr);
    return arr.find(x => x.id === id);
  }
  function remove(key, id)  {
    set(key, get(key).filter(x => x.id !== id));
  }

  /* Seed demo data */
  function seedAll() {
    if (!get('clientes').length) {
      ['María González', 'Carlos Herrera', 'Ana Martínez', 'Luis Reyes'].forEach((n, i) => {
        insert('clientes', {
          nombre: n,
          telefono: `644-${100 + i}-${2000 + i * 111}`,
          email: n.split(' ')[0].toLowerCase() + '@email.com',
          notas: ''
        });
      });
    }
    if (!get('inventario').length) {
      [
        { nombre: 'Cámara Sony A7 III', categoria: 'Cámara', stock: 2, precio: 35000 },
        { nombre: 'Lente 85mm f/1.8',   categoria: 'Lente',  stock: 3, precio: 8500  },
        { nombre: 'Trípode Manfrotto',   categoria: 'Accesorio', stock: 5, precio: 3200 },
        { nombre: 'Flash Godox V1',      categoria: 'Iluminación', stock: 4, precio: 6000 },
      ].forEach(p => insert('inventario', p));
    }
    if (!get('reservas').length) {
      const hoy = new Date();
      [
        { clienteId: 1, clienteNombre: 'María González',  servicio: 'Sesión retrato',  fecha: fmt(hoy, 2),  hora: '10:00', duracion: 2, estado: 'confirmada',  precio: 1500, fotógrafo: 'admin' },
        { clienteId: 2, clienteNombre: 'Carlos Herrera',  servicio: 'Sesión familiar', fecha: fmt(hoy, 5),  hora: '12:00', duracion: 3, estado: 'pendiente',   precio: 2200, fotógrafo: 'admin' },
        { clienteId: 3, clienteNombre: 'Ana Martínez',    servicio: 'Sesión producto', fecha: fmt(hoy, -2), hora: '09:00', duracion: 2, estado: 'completada',  precio: 1800, fotógrafo: 'admin' },
      ].forEach(r => insert('reservas', r));
    }
    if (!get('turnos').length) {
      const hoy = new Date();
      [
        { fotografo: 'admin', nombre: 'Administrador', fecha: fmt(hoy, 0), horaInicio: '09:00', horaFin: '17:00', estado: 'activo', notas: '' },
        { fotografo: 'admin', nombre: 'Administrador', fecha: fmt(hoy, 1), horaInicio: '10:00', horaFin: '18:00', estado: 'activo', notas: '' },
      ].forEach(t => insert('turnos', t));
    }
    if (!get('facturas').length) {
      [
        { numero: 'FAC-001', clienteId: 3, clienteNombre: 'Ana Martínez',   concepto: 'Sesión producto',  monto: 1800, estado: 'pagada',    fecha: '2025-05-10' },
        { numero: 'FAC-002', clienteId: 1, clienteNombre: 'María González', concepto: 'Sesión retrato',   monto: 1500, estado: 'pendiente', fecha: '2025-06-02' },
      ].forEach(f => insert('facturas', f));
    }
  }

  function fmt(base, offsetDays) {
    const d = new Date(base);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  }

  return { all, find, insert, update, remove, seedAll };
})();

/* ════════════════════════════════════════
   642 APP — ui.js  (shared UI helpers)
════════════════════════════════════════ */

const UI = (() => {
  let toastTimer;

  function toast(title, body = '', type = 'success') {
    const colors = { success: '#2e7d32', error: '#e53935', info: '#1565c0', warning: '#f57c00' };
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      el.innerHTML = '<div class="toast-title" id="toastTitle"></div><div class="toast-body" id="toastBody"></div>';
      document.body.appendChild(el);
    }
    el.style.background = colors[type] || colors.success;
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastBody').textContent  = body;
    clearTimeout(toastTimer);
    el.classList.add('show');
    toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
  }

  function confirm(msg, onYes) {
    let dlg = document.getElementById('confirmDlg');
    if (!dlg) {
      dlg = document.createElement('div');
      dlg.id = 'confirmDlg';
      dlg.className = 'confirm-dialog';
      dlg.innerHTML = `
        <div class="confirm-box">
          <h3>¿Estás seguro?</h3>
          <p id="confirmMsg"></p>
          <div class="confirm-actions">
            <button class="btn btn-secondary" id="confirmNo">Cancelar</button>
            <button class="btn btn-danger"    id="confirmYes">Eliminar</button>
          </div>
        </div>`;
      document.body.appendChild(dlg);
      document.getElementById('confirmNo').addEventListener('click', () => dlg.classList.remove('open'));
    }
    document.getElementById('confirmMsg').textContent = msg;
    dlg.classList.add('open');
    const yesBtn = document.getElementById('confirmYes');
    const newBtn = yesBtn.cloneNode(true);
    yesBtn.parentNode.replaceChild(newBtn, yesBtn);
    newBtn.addEventListener('click', () => { dlg.classList.remove('open'); onYes(); });
  }

  function openModal(id)  { document.getElementById(id).classList.add('open'); }
  function closeModal(id) { document.getElementById(id).classList.remove('open'); }

  function clearForm(formId) {
    const f = document.getElementById(formId);
    if (!f) return;
    f.querySelectorAll('input, select, textarea').forEach(el => el.value = '');
    f.querySelectorAll('.err').forEach(el => el.classList.remove('err'));
    f.querySelectorAll('.field-error.show').forEach(el => el.classList.remove('show'));
  }

  function val(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function setVal(id, v) { const el = document.getElementById(id); if (el) el.value = v; }

  function markError(inputId, errorId, msg) {
    const inp = document.getElementById(inputId);
    const err = document.getElementById(errorId);
    if (inp) inp.classList.add('err');
    if (err) { err.textContent = msg; err.classList.add('show'); }
  }

  function clearErrors(ids) {
    ids.forEach(id => {
      const inp = document.getElementById(id);
      if (inp) inp.classList.remove('err');
    });
    document.querySelectorAll('.field-error.show').forEach(e => e.classList.remove('show'));
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  function fmtCurrency(n) {
    return '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2 });
  }

  function initSidebar() {
    const path = window.location.pathname;
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', path.includes(el.dataset.page));
    });
    document.getElementById('logoutBtn')?.addEventListener('click', () => Auth.logout());
    const user = Auth.getSession();
    if (user) {
      const initials = user.nombre.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
      const av = document.getElementById('userAvatar');
      const nm = document.getElementById('userName');
      const rl = document.getElementById('userRol');
      if (av) av.textContent = initials;
      if (nm) nm.textContent = user.nombre;
      if (rl) rl.textContent = user.rol;
    }
  }

  return { toast, confirm, openModal, closeModal, clearForm, val, setVal, markError, clearErrors, fmtDate, fmtCurrency, initSidebar };
})();
