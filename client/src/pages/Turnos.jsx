import { useState, useEffect } from 'react';
import api from '../api/client';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from '../components/Toast';
import './CrudPage.css';

const fmtDate = iso => { if (!iso) return '—'; const d = new Date(iso); return d.toLocaleDateString('es-MX'); };

export default function Turnos() {
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [mes, setMes] = useState(() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`; });
  const [modal, setModal] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' });
  const [form, setForm] = useState({ id: null, fotografo: '', fecha: '', hora_inicio: '09:00', hora_fin: '17:00', estado: 'activo', notas: '' });

  const load = () => {
    const q = {};
    if (search) q.search = search;
    if (mes) q.mes = mes;
    api.turnos.list(q).then(setData).catch(() => {});
    api.auth.users().then(setUsers).catch(() => {});
  };
  useEffect(load, [search, mes]);

  const calcHours = (ini, fin) => {
    if (!ini || !fin) return '—';
    const [h1, m1] = ini.split(':').map(Number);
    const [h2, m2] = fin.split(':').map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    return diff <= 0 ? '—' : `${Math.floor(diff / 60)}h ${diff % 60 ? diff % 60 + 'm' : ''}`;
  };

  const ESTADOS = { activo: 'badge-green', libre: 'badge-blue', ausente: 'badge-red' };

  const openNew = () => { setForm({ id: null, fotografo: '', fecha: '', hora_inicio: '09:00', hora_fin: '17:00', estado: 'activo', notas: '' }); setModal(true); };
  const openEdit = (t) => {
    const fecha = typeof t.fecha === 'string' ? t.fecha.split('T')[0] : t.fecha;
    setForm({ id: t.id, fotografo: t.fotografo, fecha, hora_inicio: t.hora_inicio || '09:00', hora_fin: t.hora_fin || '17:00', estado: t.estado || 'activo', notas: t.notas || '' });
    setModal(true);
  };

  const save = async () => {
    if (!form.fotografo || !form.fecha) { toast('Error', 'Fotógrafo y fecha son requeridos', 'error'); return; }
    const u = users.find(x => x.username === form.fotografo);
    const body = { ...form, nombre: u?.nombre || form.fotografo };
    try {
      if (form.id) { await api.turnos.update(form.id, body); toast('Turno actualizado'); }
      else { await api.turnos.create(body); toast('Turno registrado'); }
      setModal(false); load();
    } catch (err) { toast('Error', err.message, 'error'); }
  };

  const del = async (id) => {
    try { await api.turnos.delete(id); toast('Turno eliminado', '', 'info'); load(); }
    catch (err) { toast('Error', err.message, 'error'); }
  };

  return (
    <div className="crud-page">
      <h1 className="page-title">Turnos</h1>
      <div className="toolbar">
        <div className="search-box">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" placeholder="Buscar fotógrafo..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="month" className="filter-select" value={mes} onChange={e => setMes(e.target.value)} />
          <button className="btn btn-primary" onClick={openNew}>+ Nuevo turno</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Fotógrafo</th><th>Fecha</th><th>Hora inicio</th><th>Hora fin</th><th>Horas</th><th>Estado</th><th>Notas</th><th></th></tr></thead>
            <tbody>
              {data.length ? data.map(t => (
                <tr key={t.id}>
                  <td><strong>{t.nombre || t.fotografo}</strong></td>
                  <td>{fmtDate(t.fecha)}</td>
                  <td>{t.hora_inicio || '—'}</td>
                  <td>{t.hora_fin || '—'}</td>
                  <td>{calcHours(t.hora_inicio, t.hora_fin)}</td>
                  <td><span className={`badge ${ESTADOS[t.estado] || 'badge-gray'}`}>{t.estado}</span></td>
                  <td className="notes-cell">{t.notas || '—'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(t)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirm({ open: true, id: t.id, name: t.nombre || t.fotografo })}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan="8" className="empty-cell">Sin turnos registrados</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={form.id ? 'Editar turno' : 'Nuevo turno'}
        footer={<><button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={save}>Guardar</button></>}>
        <div className="form-group"><label>Fotógrafo *</label>
          <select value={form.fotografo} onChange={e => setForm(p => ({ ...p, fotografo: e.target.value }))}>
            <option value="">Selecciona fotógrafo...</option>
            {users.map(u => <option key={u.username} value={u.username}>{u.nombre} ({u.rol})</option>)}
          </select>
        </div>
        <div className="form-group"><label>Fecha *</label><input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} /></div>
        <div className="form-row">
          <div className="form-group"><label>Hora inicio</label><input type="time" value={form.hora_inicio} onChange={e => setForm(p => ({ ...p, hora_inicio: e.target.value }))} /></div>
          <div className="form-group"><label>Hora fin</label><input type="time" value={form.hora_fin} onChange={e => setForm(p => ({ ...p, hora_fin: e.target.value }))} /></div>
        </div>
        <div className="form-group"><label>Estado</label>
          <select value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value }))}>
            <option value="activo">Activo</option><option value="libre">Libre</option><option value="ausente">Ausente</option>
          </select>
        </div>
        <div className="form-group"><label>Notas</label><textarea value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} placeholder="Observaciones..." /></div>
      </Modal>

      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({ open: false, id: null, name: '' })} onConfirm={() => del(confirm.id)} message={`¿Eliminar el turno de "${confirm.name}"?`} />
    </div>
  );
}
