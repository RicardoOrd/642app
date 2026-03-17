/* ════════════════════════════════════════
   642 APP — sidebar.js
   Inyecta el sidebar y el topbar en cada página
════════════════════════════════════════ */

function renderSidebar(activePage) {
  const nav = [
    { page: 'dashboard',   label: 'Panel',       icon: `<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>` },
    { page: 'turnos',      label: 'Turnos',       icon: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>` },
    { page: 'clientes',    label: 'Clientes',     icon: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>` },
    { page: 'inventario',  label: 'Inventario',   icon: `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>` },
    { page: 'reservas',    label: 'Reservas',     icon: `<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>` },
    { page: 'facturacion', label: 'Facturación',  icon: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>` },
  ];

  const items = nav.map(n => `
    <a href="${n.page}.html" class="nav-item ${activePage === n.page ? 'active' : ''}" data-page="${n.page}">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${n.icon}</svg>
      ${n.label}
    </a>`).join('');

  return `
    <div class="sidebar">
      <div class="sidebar-brand">
        <div class="logo">
          <span class="logo-box"><strong>6</strong><span class="slash">/</span><strong>42</strong></span>
          <span class="logo-word">APP</span>
        </div>
      </div>
      ${items}
      <div class="sidebar-bottom">
        <button class="logout-btn" id="logoutBtn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Salir
        </button>
      </div>
    </div>`;
}

function renderTopbar(title) {
  return `
    <div class="page-header">
      <h1>${title}</h1>
      <div class="user-chip">
        <div class="user-chip-info">
          <div class="user-chip-name" id="userName"></div>
          <div class="user-chip-role" id="userRol"></div>
        </div>
        <div class="avatar" id="userAvatar">--</div>
      </div>
    </div>`;
}

function initPage(activePage, title) {
  const user = Auth.requireAuth();
  if (!user) return;
  DB.seedAll();

  document.getElementById('sidebar').innerHTML  = renderSidebar(activePage);
  document.getElementById('topbar').innerHTML   = renderTopbar(title);
  UI.initSidebar();
}
