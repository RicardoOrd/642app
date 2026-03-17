import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/Toast';
import './Login.css';

export default function Login() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', nombre: '', rol: 'Fotógrafo', password2: '' });
  const [errors, setErrors] = useState({});

  if (user) return <Navigate to="/dashboard" replace />;

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const handleLogin = async () => {
    const errs = {};
    if (!form.username) errs.username = 'Ingresa tu usuario';
    if (!form.password) errs.password = 'Ingresa tu contraseña';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await login(form.username, form.password);
      toast('¡Bienvenido!', '', 'success');
      navigate('/dashboard');
    } catch (err) {
      toast('Error', err.message, 'error');
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    const errs = {};
    if (!form.nombre) errs.nombre = 'Ingresa tu nombre';
    if (!form.username) errs.username = 'Elige un usuario';
    if (!form.password || form.password.length < 6) errs.password = 'Mínimo 6 caracteres';
    if (form.password !== form.password2) errs.password2 = 'Las contraseñas no coinciden';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await register({ nombre: form.nombre, username: form.username, password: form.password, rol: form.rol });
      toast('¡Cuenta creada!', 'Ya puedes iniciar sesión', 'success');
      setTab('login');
      setForm(p => ({ ...p, password: '', password2: '', nombre: '' }));
    } catch (err) {
      toast('Error', err.message, 'error');
    } finally { setLoading(false); }
  };

  const onKey = (e) => { if (e.key === 'Enter') tab === 'login' ? handleLogin() : handleRegister(); };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo">
            <span className="login-logo-box"><strong>6</strong><span>/</span><strong>42</strong></span>
            <span className="login-logo-word">APP</span>
          </div>
          <p className="login-tagline">Sistema integral de gestión empresarial para tu compañía</p>
        </div>
        <div className="login-features">
          {['Gestión de clientes', 'Control de inventario', 'Agenda de reservas', 'Facturación digital'].map(f => (
            <div key={f} className="login-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className="login-right">
        <h1>{tab === 'login' ? 'Bienvenido' : 'Crear cuenta'}</h1>
        <p className="login-subtitle">{tab === 'login' ? 'Inicia sesión para continuar' : 'Completa el formulario'}</p>

        <div className="tabs">
          <button className={`tab-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Iniciar sesión</button>
          <button className={`tab-btn ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Registrarse</button>
        </div>

        {tab === 'login' ? (
          <div className="login-form" onKeyDown={onKey}>
            <div className="form-group">
              <label>Usuario</label>
              <input type="text" value={form.username} onChange={e => set('username', e.target.value)} className={errors.username ? 'err' : ''} autoComplete="username" />
              {errors.username && <span className="field-error">{errors.username}</span>}
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} className={errors.password ? 'err' : ''} autoComplete="current-password" />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>
            <button className="btn-submit" onClick={handleLogin} disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Iniciar sesión'}
            </button>
            <div className="demo-hint">
              <strong>ACCESO DE PRUEBA</strong><br />
              Usuario: <code>admin</code> &nbsp;|&nbsp; Contraseña: <code>admin123</code>
            </div>
          </div>
        ) : (
          <div className="login-form" onKeyDown={onKey}>
            <div className="form-group">
              <label>Nombre completo</label>
              <input type="text" value={form.nombre} onChange={e => set('nombre', e.target.value)} className={errors.nombre ? 'err' : ''} />
              {errors.nombre && <span className="field-error">{errors.nombre}</span>}
            </div>
            <div className="form-group">
              <label>Nombre de usuario</label>
              <input type="text" value={form.username} onChange={e => set('username', e.target.value)} className={errors.username ? 'err' : ''} autoComplete="username" />
              {errors.username && <span className="field-error">{errors.username}</span>}
            </div>
            <div className="form-group">
              <label>Rol</label>
              <select value={form.rol} onChange={e => set('rol', e.target.value)}>
                <option>Fotógrafo</option><option>Administrador</option><option>Recepcionista</option>
              </select>
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} className={errors.password ? 'err' : ''} placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label>Confirmar contraseña</label>
              <input type="password" value={form.password2} onChange={e => set('password2', e.target.value)} className={errors.password2 ? 'err' : ''} autoComplete="new-password" />
              {errors.password2 && <span className="field-error">{errors.password2}</span>}
            </div>
            <button className="btn-submit" onClick={handleRegister} disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Crear cuenta'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
