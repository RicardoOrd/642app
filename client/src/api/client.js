/* ═══════════════════════════════════════
   642 APP — API Client
   ═══════════════════════════════════════ */

const BASE = 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('642_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('642_token');
    window.location.href = '/';
    throw new Error('Sesión expirada');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error del servidor');
  return data;
}

const get    = (path)       => request(path);
const post   = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) });
const put    = (path, body) => request(path, { method: 'PUT',  body: JSON.stringify(body) });
const del    = (path)       => request(path, { method: 'DELETE' });

const api = {
  auth: {
    login:    (data) => post('/auth/login', data),
    register: (data) => post('/auth/register', data),
    me:       ()     => get('/auth/me'),
    users:    ()     => get('/auth/users'),
  },
  dashboard: {
    stats:    ()     => get('/dashboard/stats'),
    ingresos: ()     => get('/dashboard/ingresos'),
    proximas: ()     => get('/dashboard/proximas-reservas'),
  },
  clientes: {
    list:   (search) => get(`/clientes${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    get:    (id)     => get(`/clientes/${id}`),
    create: (data)   => post('/clientes', data),
    update: (id, d)  => put(`/clientes/${id}`, d),
    delete: (id)     => del(`/clientes/${id}`),
  },
  inventario: {
    list:    (q)     => get(`/inventario${q ? `?${new URLSearchParams(q)}` : ''}`),
    metrics: ()      => get('/inventario/metrics'),
    create:  (data)  => post('/inventario', data),
    update:  (id, d) => put(`/inventario/${id}`, d),
    delete:  (id)    => del(`/inventario/${id}`),
  },
  reservas: {
    list:   (q)     => get(`/reservas${q ? `?${new URLSearchParams(q)}` : ''}`),
    create: (data)  => post('/reservas', data),
    update: (id, d) => put(`/reservas/${id}`, d),
    delete: (id)    => del(`/reservas/${id}`),
  },
  turnos: {
    list:   (q)     => get(`/turnos${q ? `?${new URLSearchParams(q)}` : ''}`),
    create: (data)  => post('/turnos', data),
    update: (id, d) => put(`/turnos/${id}`, d),
    delete: (id)    => del(`/turnos/${id}`),
  },
  facturas: {
    list:       (q)     => get(`/facturas${q ? `?${new URLSearchParams(q)}` : ''}`),
    metrics:    ()      => get('/facturas/metrics'),
    nextNumero: ()      => get('/facturas/next-numero'),
    create:     (data)  => post('/facturas', data),
    update:     (id, d) => put(`/facturas/${id}`, d),
    delete:     (id)    => del(`/facturas/${id}`),
  },
};

export default api;
