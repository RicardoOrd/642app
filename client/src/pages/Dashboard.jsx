import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import api from '../api/client';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [ingresos, setIngresos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [inventario, setInventario] = useState([]);

  useEffect(() => {
    Promise.all([
      api.dashboard.stats(),
      api.dashboard.ingresos(),
      api.dashboard.proximas(),
      api.inventario.list(),
    ]).then(([s, i, r, inv]) => {
      setStats(s);
      setIngresos(i);
      setReservas(r);
      setInventario(inv.slice(0, 6));
    }).catch(() => {});
  }, []);

  const fmtCurrency = (n) => '$' + Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 });
  const fmtDate = (iso) => { if (!iso) return '—'; const d = new Date(iso); return d.toLocaleDateString('es-MX'); };
  const estadoBadge = (e) => {
    const map = { confirmada: 'badge-green', pendiente: 'badge-orange', completada: 'badge-gray', cancelada: 'badge-red' };
    return <span className={`badge ${map[e] || 'badge-gray'}`}>{e}</span>;
  };

  const METRICS = [
    { label: 'Total Clientes', key: 'clientes', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', color: '#6366f1' },
    { label: 'Inventario', key: 'inventario', icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z', color: '#10b981' },
    { label: 'Reservas Activas', key: 'reservas', icon: 'M3 4h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM16 2v4M8 2v4M3 10h18', color: '#f59e0b' },
    { label: 'Facturas Pendientes', key: 'facturas', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6', color: '#ef4444' },
  ];

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>

      <div className="metric-grid">
        {METRICS.map(m => (
          <div key={m.key} className="metric-card">
            <div className="metric-icon" style={{ background: `${m.color}15`, color: m.color }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={m.icon} /></svg>
            </div>
            <div className="metric-label">{m.label}</div>
            <div className="metric-value">{stats ? stats[m.key] : '—'}</div>
          </div>
        ))}
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h3>Resumen de Ingresos</h3>
          <p className="chart-sub">Ingresos mensuales del año actual</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={ingresos}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => fmtCurrency(v)} />
              <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Estado del Inventario</h3>
          <p className="chart-sub">Stock actual por producto</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={inventario}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="nombre" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={v => v.substring(0, 12)} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="stock" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card reservas-card">
        <h3>Próximas Reservas</h3>
        <p className="chart-sub">Sesiones agendadas próximamente</p>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Cliente</th><th>Servicio</th><th>Fecha</th><th>Hora</th><th>Estado</th></tr></thead>
            <tbody>
              {reservas.length ? reservas.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.cliente_nombre}</strong></td>
                  <td>{r.servicio}</td>
                  <td>{fmtDate(r.fecha)}</td>
                  <td>{r.hora}</td>
                  <td>{estadoBadge(r.estado)}</td>
                </tr>
              )) : <tr><td colSpan="5" className="empty-cell">Sin reservas próximas</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
