import { useState, useEffect } from 'react';
import api from '../api/client';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from '../components/Toast';
import './CrudPage.css';

export default function Clientes() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' });
  const [form, setForm] = useState({ id: null, nombre: '', telefono: '', email: '', notas: '' });
  const [reservas, setReservas] = useState([]);

  const load = () => {
    api.clientes.list(search).then(setData).catch(() => {});
    api.reservas.list().then(setReservas).catch(() => {});
  };
  useEffect(load, [search]);

  const openNew = () => { setForm({ id: null, nombre: '', telefono: '', email: '', notas: '' }); setModal(true); };
  const openEdit = (c) => { setForm({ id: c.id, nombre: c.nombre, telefono: c.telefono || '', email: c.email || '', notas: c.notas || '' }); setModal(true); };

  const save = async () => {
    if (!form.nombre.trim()) { toast('Error', 'El nombre es requerido', 'error'); return; }
    try {
      if (form.id) { await api.clientes.update(form.id, form); toast('Cliente actualizado'); }
      else { await api.clientes.create(form); toast('Cliente agregado'); }
      setModal(false); load();
    } catch (err) { toast('Error', err.message, 'error'); }
  };

  const del = async (id) => {
    try { await api.clientes.delete(id); toast('Cliente eliminado', '', 'info'); load(); }
    catch (err) { toast('Error', err.message, 'error'); }
  };

  return (
    <div className="crud-page">
      <h1 className="page-title">Clientes</h1>
      <div className="toolbar">
        <div className="search-box">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Nuevo cliente</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Nombre</th><th>Teléfono</th><th>Email</th><th>Reservas</th><th>Notas</th><th></th></tr></thead>
            <tbody>
              {data.length ? data.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.nombre}</strong></td>
                  <td>{c.telefono || '—'}</td>
                  <td>{c.email || '—'}</td>
                  <td><span className="badge badge-blue">{reservas.filter(r => r.cliente_id === c.id).length} reservas</span></td>
                  <td className="notes-cell">{c.notas || '—'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirm({ open: true, id: c.id, name: c.nombre })}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan="6" className="empty-cell">Sin clientes registrados</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={form.id ? 'Editar cliente' : 'Nuevo cliente'}
        footer={<><button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={save}>Guardar</button></>}>
        <div className="form-row">
          <div className="form-group"><label>Nombre completo *</label><input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} /></div>
          <div className="form-group"><label>Teléfono</label><input value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))} placeholder="644-000-0000" /></div>
        </div>
        <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="correo@ejemplo.com" /></div>
        <div className="form-group"><label>Notas</label><textarea value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} placeholder="Notas adicionales..." /></div>
      </Modal>

      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({ open: false, id: null, name: '' })} onConfirm={() => del(confirm.id)} message={`¿Eliminar a "${confirm.name}"? Esta acción no se puede deshacer.`} />
    </div>
  );
}
