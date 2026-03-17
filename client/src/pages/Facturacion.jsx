import { useState, useEffect } from 'react';
import api from '../api/client';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from '../components/Toast';
import './CrudPage.css';

const fmtCurrency = n => '$' + Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 });
const fmtDate = iso => { if (!iso) return '—'; const d = new Date(iso); return d.toLocaleDateString('es-MX'); };
const ESTADOS = { pagada: 'badge-green', pendiente: 'badge-orange', cancelada: 'badge-red' };

export default function Facturacion() {
  const [data, setData] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [modal, setModal] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' });
  const [form, setForm] = useState({ id: null, numero: '', cliente_id: '', concepto: '', fecha: '', monto: '', estado: 'pendiente', notas: '' });

  const load = () => {
    const q = {};
    if (search) q.search = search;
    if (estado) q.estado = estado;
    api.facturas.list(q).then(setData).catch(() => {});
    api.facturas.metrics().then(setMetrics).catch(() => {});
    api.clientes.list().then(setClientes).catch(() => {});
  };
  useEffect(load, [search, estado]);

  const openNew = async () => {
    const { numero } = await api.facturas.nextNumero();
    setForm({ id: null, numero, cliente_id: '', concepto: '', fecha: new Date().toISOString().split('T')[0], monto: '', estado: 'pendiente', notas: '' });
    setModal(true);
  };
  const openEdit = (f) => {
    const fecha = typeof f.fecha === 'string' ? f.fecha.split('T')[0] : f.fecha;
    setForm({ id: f.id, numero: f.numero, cliente_id: f.cliente_id || '', concepto: f.concepto, fecha, monto: f.monto || '', estado: f.estado, notas: f.notas || '' });
    setModal(true);
  };

  const save = async () => {
    if (!form.numero || !form.concepto || !form.fecha) { toast('Error', 'Número, concepto y fecha son requeridos', 'error'); return; }
    const cliente = clientes.find(c => c.id === parseInt(form.cliente_id));
    const body = { ...form, cliente_id: parseInt(form.cliente_id) || null, cliente_nombre: cliente?.nombre || '', monto: parseFloat(form.monto) || 0 };
    try {
      if (form.id) { await api.facturas.update(form.id, body); toast('Factura actualizada'); }
      else { await api.facturas.create(body); toast('Factura creada'); }
      setModal(false); load();
    } catch (err) { toast('Error', err.message, 'error'); }
  };

  const del = async (id) => {
    try { await api.facturas.delete(id); toast('Factura eliminada', '', 'info'); load(); }
    catch (err) { toast('Error', err.message, 'error'); }
  };

  return (
    <div className="crud-page">
      <h1 className="page-title">Facturación</h1>

      <div className="metrics-row">
        <div className="mini-metric"><div className="mini-metric-label">Total facturado</div><div className="mini-metric-value">{metrics.totalPagado != null ? fmtCurrency(metrics.totalPagado) : '—'}</div></div>
        <div className="mini-metric"><div className="mini-metric-label">Pendiente de cobro</div><div className="mini-metric-value" style={{ color: '#f59e0b' }}>{metrics.totalPendiente != null ? fmtCurrency(metrics.totalPendiente) : '—'}</div></div>
        <div className="mini-metric"><div className="mini-metric-label">Facturas emitidas</div><div className="mini-metric-value">{metrics.count ?? '—'}</div></div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" placeholder="Buscar factura o cliente..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="filter-select" value={estado} onChange={e => setEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option><option value="pagada">Pagada</option><option value="cancelada">Cancelada</option>
          </select>
          <button className="btn btn-primary" onClick={openNew}>+ Nueva factura</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Número</th><th>Cliente</th><th>Concepto</th><th>Fecha</th><th>Monto</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {data.length ? data.map(f => (
                <tr key={f.id}>
                  <td><strong>{f.numero}</strong></td>
                  <td>{f.cliente_nombre || '—'}</td>
                  <td>{f.concepto || '—'}</td>
                  <td>{fmtDate(f.fecha)}</td>
                  <td><strong>{fmtCurrency(f.monto)}</strong></td>
                  <td><span className={`badge ${ESTADOS[f.estado] || 'badge-gray'}`}>{f.estado}</span></td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(f)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirm({ open: true, id: f.id, name: f.numero })}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan="7" className="empty-cell">Sin facturas emitidas</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={form.id ? 'Editar factura' : 'Nueva factura'}
        footer={<><button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={save}>Guardar</button></>}>
        <div className="form-row">
          <div className="form-group"><label>Número de factura *</label><input value={form.numero} onChange={e => setForm(p => ({ ...p, numero: e.target.value }))} /></div>
          <div className="form-group"><label>Fecha *</label><input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} /></div>
        </div>
        <div className="form-group"><label>Cliente</label>
          <select value={form.cliente_id} onChange={e => setForm(p => ({ ...p, cliente_id: e.target.value }))}>
            <option value="">Selecciona cliente...</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <div className="form-group"><label>Concepto *</label><input value={form.concepto} onChange={e => setForm(p => ({ ...p, concepto: e.target.value }))} placeholder="Ej. Sesión fotográfica" /></div>
        <div className="form-row">
          <div className="form-group"><label>Monto ($)</label><input type="number" value={form.monto} onChange={e => setForm(p => ({ ...p, monto: e.target.value }))} min="0" step="0.01" /></div>
          <div className="form-group"><label>Estado</label>
            <select value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value }))}>
              <option value="pendiente">Pendiente</option><option value="pagada">Pagada</option><option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>
        <div className="form-group"><label>Notas</label><textarea value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} placeholder="Notas adicionales..." /></div>
      </Modal>

      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({ open: false, id: null, name: '' })} onConfirm={() => del(confirm.id)} message={`¿Eliminar la factura ${confirm.name}?`} />
    </div>
  );
}
