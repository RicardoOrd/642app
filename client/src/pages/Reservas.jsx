import { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from '../components/Toast';
import './CrudPage.css';
import './Reservas.css';

const fmtCurrency = n => '$' + Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 });
const fmtDate = iso => { if (!iso) return '—'; const d = new Date(iso); return d.toLocaleDateString('es-MX'); };
const ESTADOS = { confirmada: 'badge-green', pendiente: 'badge-orange', completada: 'badge-gray', cancelada: 'badge-red' };
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export default function Reservas() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [view, setView] = useState('calendario');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modal, setModal] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' });
  const [form, setForm] = useState({ id: null, cliente_id: '', servicio: '', fecha: '', hora: '10:00', duracion: 2, precio: '', estado: 'pendiente' });

  const load = () => {
    api.reservas.list().then(setData).catch(() => {});
    api.clientes.list().then(setClientes).catch(() => {});
  };
  useEffect(load, []);

  const openNew = (fecha = '') => {
    setForm({ id: null, cliente_id: '', servicio: '', fecha, hora: '10:00', duracion: 2, precio: '', estado: 'pendiente' });
    setModal(true);
  };
  const openEdit = (r) => {
    const fecha = typeof r.fecha === 'string' ? r.fecha.split('T')[0] : r.fecha;
    setForm({ id: r.id, cliente_id: r.cliente_id || '', servicio: r.servicio, fecha, hora: r.hora || '', duracion: r.duracion || 2, precio: r.precio || '', estado: r.estado });
    setModal(true);
  };

  const save = async () => {
    if (!form.servicio || !form.fecha) { toast('Error', 'Servicio y fecha son requeridos', 'error'); return; }
    const cliente = clientes.find(c => c.id === parseInt(form.cliente_id));
    const body = { ...form, cliente_id: parseInt(form.cliente_id) || null, cliente_nombre: cliente?.nombre || '', duracion: parseInt(form.duracion) || 2, precio: parseFloat(form.precio) || 0, fotografo: user?.username };
    try {
      if (form.id) { await api.reservas.update(form.id, body); toast('Reserva actualizada'); }
      else { await api.reservas.create(body); toast('Reserva creada'); }
      setModal(false); load();
    } catch (err) { toast('Error', err.message, 'error'); }
  };

  const del = async (id) => {
    try { await api.reservas.delete(id); toast('Reserva eliminada', '', 'info'); load(); }
    catch (err) { toast('Error', err.message, 'error'); }
  };

  // Calendar
  const y = currentDate.getFullYear(), m = currentDate.getMonth();
  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  const calCells = [];
  let dayNum = 1 - firstDay;
  for (let i = 0; i < 42; i++) {
    const dt = new Date(y, m, dayNum);
    const iso = dt.toISOString().split('T')[0];
    const isCurrentMonth = dt.getMonth() === m;
    const isToday = iso === today;
    const dayRes = data.filter(r => { const f = typeof r.fecha === 'string' ? r.fecha.split('T')[0] : ''; return f === iso; });
    calCells.push({ dayNum, dt, iso, isCurrentMonth, isToday, dayRes });
    dayNum++;
  }

  const prevMonth = () => setCurrentDate(new Date(y, m - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(y, m + 1, 1));

  return (
    <div className="crud-page">
      <h1 className="page-title">Reservas</h1>

      <div className="toolbar">
        <div className="view-tabs">
          <button className={`view-tab ${view === 'calendario' ? 'active' : ''}`} onClick={() => setView('calendario')}>Calendario</button>
          <button className={`view-tab ${view === 'lista' ? 'active' : ''}`} onClick={() => setView('lista')}>Lista</button>
        </div>
        <button className="btn btn-primary" onClick={() => openNew()}>+ Nueva reserva</button>
      </div>

      {view === 'calendario' ? (
        <div className="card calendar-card">
          <div className="calendar-header">
            <button className="cal-nav" onClick={prevMonth}>‹</button>
            <h3>{MESES[m]} {y}</h3>
            <button className="cal-nav" onClick={nextMonth}>›</button>
          </div>
          <div className="cal-days-header">
            {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(d => <div key={d} className="cal-day-name">{d}</div>)}
          </div>
          <div className="cal-body">
            {calCells.map((c, i) => (
              <div key={i} className={`cal-cell ${!c.isCurrentMonth ? 'other-month' : ''} ${c.isToday ? 'today' : ''}`} onClick={() => openNew(c.iso)}>
                <div className="cal-date">{c.dt.getDate()}</div>
                {c.dayRes.slice(0, 2).map(r => (
                  <div key={r.id} className={`cal-event ${r.estado}`} title={r.cliente_nombre} onClick={e => { e.stopPropagation(); openEdit(r); }}>
                    {r.hora} {(r.cliente_nombre || '').split(' ')[0]}
                  </div>
                ))}
                {c.dayRes.length > 2 && <div className="cal-more">+{c.dayRes.length - 2} más</div>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Cliente</th><th>Servicio</th><th>Fecha</th><th>Hora</th><th>Duración</th><th>Precio</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {data.length ? data.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.cliente_nombre}</strong></td>
                    <td>{r.servicio}</td>
                    <td>{fmtDate(r.fecha)}</td>
                    <td>{r.hora}</td>
                    <td>{r.duracion} hr{r.duracion > 1 ? 's' : ''}</td>
                    <td>{fmtCurrency(r.precio)}</td>
                    <td><span className={`badge ${ESTADOS[r.estado] || 'badge-gray'}`}>{r.estado}</span></td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(r)}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirm({ open: true, id: r.id, name: r.cliente_nombre })}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan="8" className="empty-cell">Sin reservas</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={form.id ? 'Editar reserva' : 'Nueva reserva'}
        footer={<><button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={save}>Guardar</button></>}>
        <div className="form-group"><label>Cliente</label>
          <select value={form.cliente_id} onChange={e => setForm(p => ({ ...p, cliente_id: e.target.value }))}>
            <option value="">Selecciona cliente...</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <div className="form-group"><label>Servicio *</label>
          <select value={form.servicio} onChange={e => setForm(p => ({ ...p, servicio: e.target.value }))}>
            <option value="">Selecciona servicio...</option>
            {['Sesión retrato','Sesión familiar','Sesión producto','Sesión quinceañera','Sesión boda','Sesión corporativa','Otro'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Fecha *</label><input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} /></div>
          <div className="form-group"><label>Hora</label><input type="time" value={form.hora} onChange={e => setForm(p => ({ ...p, hora: e.target.value }))} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Duración (hrs)</label><input type="number" value={form.duracion} onChange={e => setForm(p => ({ ...p, duracion: e.target.value }))} min="1" max="12" /></div>
          <div className="form-group"><label>Precio ($)</label><input type="number" value={form.precio} onChange={e => setForm(p => ({ ...p, precio: e.target.value }))} min="0" /></div>
        </div>
        <div className="form-group"><label>Estado</label>
          <select value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value }))}>
            <option value="pendiente">Pendiente</option><option value="confirmada">Confirmada</option><option value="completada">Completada</option><option value="cancelada">Cancelada</option>
          </select>
        </div>
      </Modal>

      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({ open: false, id: null, name: '' })} onConfirm={() => del(confirm.id)} message={`¿Eliminar la reserva de "${confirm.name}"?`} />
    </div>
  );
}
