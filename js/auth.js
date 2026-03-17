/* ═══════════════════════════════════════
   642 APP — auth.js
   Manejo de sesión, login y registro
   con localStorage
   ═══════════════════════════════════════ */

const Auth = (() => {

  const USERS_KEY   = '642app_users';
  const SESSION_KEY = '642app_session';

  /* ── Utilidades de almacenamiento ── */

  function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getSession() {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
  }

  function saveSession(user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  /* ── Seed: usuario admin por defecto ── */
  function seedDefault() {
    const users = getUsers();
    const hasAdmin = users.some(u => u.username === 'admin');
    if (!hasAdmin) {
      users.push({
        id:        1,
        nombre:    'Administrador',
        username:  'admin',
        password:  'admin123',
        rol:       'Administrador',
        createdAt: new Date().toISOString()
      });
      saveUsers(users);
    }
  }

  /* ── Login ── */
  function login(username, password) {
    const users = getUsers();
    const user  = users.find(u =>
      u.username.toLowerCase() === username.toLowerCase() &&
      u.password === password
    );
    if (!user) return { ok: false, error: 'Usuario o contraseña incorrectos' };
    const sessionData = { id: user.id, nombre: user.nombre, username: user.username, rol: user.rol };
    saveSession(sessionData);
    return { ok: true, user: sessionData };
  }

  /* ── Registro ── */
  function register({ nombre, username, password, rol }) {
    const users = getUsers();

    if (!nombre || !username || !password || !rol)
      return { ok: false, error: 'Todos los campos son requeridos' };

    if (username.length < 3)
      return { ok: false, error: 'El usuario debe tener al menos 3 caracteres' };

    if (password.length < 6)
      return { ok: false, error: 'La contraseña debe tener al menos 6 caracteres' };

    const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
    if (exists)
      return { ok: false, error: 'Ese nombre de usuario ya está en uso' };

    const newUser = {
      id:        Date.now(),
      nombre:    nombre.trim(),
      username:  username.trim(),
      password,
      rol:       rol || 'Fotógrafo',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);
    return { ok: true };
  }

  /* ── Logout ── */
  function logout() {
    clearSession();
    window.location.href = 'index.html';
  }

  /* ── Proteger páginas que requieren sesión ── */
  function requireAuth() {
    const session = getSession();
    if (!session) {
      window.location.href = 'index.html';
      return null;
    }
    return session;
  }

  /* ── Redirigir si ya hay sesión activa ── */
  function redirectIfLoggedIn() {
    const session = getSession();
    if (session) {
      window.location.href = 'dashboard.html';
    }
  }

  return { seedDefault, login, register, logout, requireAuth, redirectIfLoggedIn, getSession };

})();
