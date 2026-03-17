/* ═══════════════════════════════════════
   642 APP — dashboard.js
   ═══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  const user = Auth.requireAuth();
  if (!user) return;

  // Mostrar nombre e iniciales
  const initials = user.nombre.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  document.getElementById('userAvatar').textContent = initials;
  document.getElementById('userName').textContent   = user.nombre;
  document.getElementById('userRol').textContent    = user.rol;

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    Auth.logout();
  });

  // Gráficas
  new Chart(document.getElementById('lineChart'), {
    type: 'line',
    data: {
      labels: ['Ene','Feb','Mar','Abr','May','Jun'],
      datasets: [{
        data: [1200, 2800, 9800, 6500, 4200, 3800],
        borderColor: '#111',
        borderWidth: 2,
        backgroundColor: 'rgba(0,0,0,0.07)',
        fill: true,
        tension: 0.45,
        pointRadius: 3,
        pointBackgroundColor: '#111'
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10, family: 'Inter' }, color: '#888' } },
        y: { grid: { color: '#f2f2f2' }, ticks: { font: { size: 10, family: 'Inter' }, color: '#888' }, beginAtZero: true }
      }
    }
  });

  new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
      labels: ['Producto A','Producto B','Producto C','Producto D'],
      datasets: [{
        data: [18, 34, 14, 24],
        backgroundColor: '#bbb',
        borderWidth: 0
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10, family: 'Inter' }, color: '#888' } },
        y: { grid: { color: '#f2f2f2' }, ticks: { font: { size: 10, family: 'Inter' }, color: '#888' }, beginAtZero: true }
      }
    }
  });

});
