const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../db');
const auth    = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });

    const { rows } = await db.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username]);
    if (!rows.length)
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

    const token = jwt.sign(
      { id: user.id, username: user.username, nombre: user.nombre, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, nombre: user.nombre, username: user.username, rol: user.rol },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { nombre, username, password, rol } = req.body;
    if (!nombre || !username || !password)
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    if (username.length < 3)
      return res.status(400).json({ error: 'El usuario debe tener al menos 3 caracteres' });
    if (password.length < 6)
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

    const exists = await db.query('SELECT id FROM users WHERE LOWER(username) = LOWER($1)', [username]);
    if (exists.rows.length)
      return res.status(409).json({ error: 'Ese nombre de usuario ya está en uso' });

    const hash = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO users (nombre, username, password_hash, rol) VALUES ($1, $2, $3, $4)`,
      [nombre.trim(), username.trim(), hash, rol || 'Fotógrafo']
    );

    res.status(201).json({ message: 'Cuenta creada exitosamente' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/auth/me  (protected)
router.get('/me', auth, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, nombre, username, rol, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/auth/users  (protected — for dropdowns)
router.get('/users', auth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, nombre, username, rol FROM users ORDER BY nombre');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
