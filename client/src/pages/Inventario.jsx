import { useState, useEffect } from 'react';
import api from '../api/client';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from '../components/Toast';
import './CrudPage.css';

const fmtCurrency = n => '$' + Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 });
const CATS = ['', 'Cámara', 'Lente', 'Iluminación', 'Accesorio', 'Fondo', 'Otro'];

export default function Inventario() {
  const [data, setData] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('');
  const [modal, setModal] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' });
  const [form, setForm] = useState({ id: null, nombre: '', categoria: '', stock: 1, precio: '', ubicacion: '', descripcion: '' });

  const load = () => {
    const q = {};
    if (search) q.search = search;
    if (cat) q.categoria = cat;
    api.inventario.list(q).then(setData).catch(() => {});
    api.inventario.metrics().then(setMetrics).catch(() => {});
  };
  useEffect(load, [search, cat]);

  const openNew = () => { setForm({ id: null, nombre: '', categoria: '', stock: 1, precio: '', ubicacion: '', descripcion: '' }); setModal(true); };
  const openEdit = (p) => { setForm({ id: p.id, nombre: p.nombre, categoria: p.categoria || '', stock: p.stock, precio: p.precio || '', ubicacion: p.ubicacion || '', descripcion: p.descripcion || '' }); setModal(true); };

  const save = async () => {
    if (!form.nombre.trim()) { toast('Error', 'El nombre es requerido', 'error'); return; }
    try {
      const body = { ...form, stock: parseInt(form.stock) || 0, precio: parseFloat(form.precio) || 0 };
      if (form.id) { await api.inventario.update(form.id, body); toast('Producto actualizado'); }
      else { await api.inventario.create(body); toast('Producto agregado'); }
      setModal(false); load();
    } catch (err) { toast('Error', err.message, 'error'); }
  };

  const del = async (id) => {
    try { await api.inventario.delete(id); toast('Producto eliminado', '', 'info'); load(); }
    catch (err) { toast('Error', err.message, 'error'); }
  };

  const stockBadge = s => s < 1 ? 'badge-red' : s < 3 ? 'badge-orange' : 'badge-green';

  return (
    <div className="crud-page">
      <h1 className="page-title">Inventario</h1>

      <div className="metrics-row">
        <div className="mini-metric"><div className="mini-metric-label">Total productos</div><div className="mini-metric-value">{metrics.total ?? '—'}</div></div>
        <div className="mini-metric"><div className="mini-metric-label">Stock bajo (&lt;3)</div><div className="mini-metric-value" style={{ color: '#f59e0b' }}>{metrics.bajo ?? '—'}</div></div>
        <div className="mini-metric"><div className="mini-metric-label">Valor total</div><div className="mini-metric-value">{metrics.valor != null ? fmtCurrency(metrics.valor) : '—'}</div></div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="filter-select" value={cat} onChange={e => setCat(e.target.value)}>
            <option value="">Todas las categorías</option>
            {CATS.filter(Boolean).map(c => <option key={c}>{c}</option>)}
          </select>
          <button className="btn btn-primary" onClick={openNew}>+ Agregar producto</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Producto</th><th>Categoría</th><th>Stock</th><th>Precio unit.</th><th>Valor total</th><th></th></tr></thead>
            <tbody>
              {data.length ? data.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.nombre}</strong>{p.descripcion && <><br /><span style={{ fontSize: 11, color: '#888' }}>{p.descripcion}</span></>}</td>
                  <td>{p.categoria ? <span className="badge badge-gray">{p.categoria}</span> : '—'}</td>
                  <td><span className={`badge ${stockBadge(p.stock)}`}>{p.stock} uds.</span></td>
                  <td>{p.precio ? fmtCurrency(p.precio) : '—'}</td>
                  <td>{p.precio ? fmtCurrency(p.precio * p.stock) : '—'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirm({ open: true, id: p.id, name: p.nombre })}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan="6" className="empty-cell">Sin productos en inventario</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={form.id ? 'Editar producto' : 'Nuevo producto'}
        footer={<><button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={save}>Guardar</button></>}>
        <div className="form-group"><label>Nombre del producto *</label><input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} /></div>
        <div className="form-row">
          <div className="form-group"><label>Categoría</label><select value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))}><option value="">Sin categoría</option>{CATS.filter(Boolean).map(c => <option key={c}>{c}</option>)}</select></div>
          <div className="form-group"><label>Stock *</label><input type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} min="0" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Precio unitario ($)</label><input type="number" value={form.precio} onChange={e => setForm(p => ({ ...p, precio: e.target.value }))} min="0" step="0.01" /></div>
          <div className="form-group"><label>Ubicación</label><input value={form.ubicacion} onChange={e => setForm(p => ({ ...p, ubicacion: e.target.value }))} placeholder="Ej. Estante A" /></div>
        </div>
        <div className="form-group"><label>Descripción</label><textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} placeholder="Descripción..." /></div>
      </Modal>

      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({ open: false, id: null, name: '' })} onConfirm={() => del(confirm.id)} message={`¿Eliminar "${confirm.name}" del inventario?`} />
    </div>
  );
}
