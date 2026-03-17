const router = require('express').Router();
const db     = require('../db');

// GET /api/clientes
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let q = 'SELECT * FROM clientes';
    const params = [];
    if (search) {
      q += ' WHERE LOWER(nombre) LIKE $1 OR LOWER(email) LIKE $1';
      params.push(`%${search.toLowerCase()}%`);
    }
    q += ' ORDER BY nombre';
    const { rows } = await db.query(q, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// GET /api/clientes/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM clientes WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
});

// POST /api/clientes
router.post('/', async (req, res) => {
  try {
    const { nombre, telefono, email, notas } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });
    const { rows } = await db.query(
      `INSERT INTO clientes (nombre, telefono, email, notas) VALUES ($1,$2,$3,$4) RETURNING *`,
      [nombre.trim(), telefono || null, email || null, notas || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear cliente' });
  }
});

// PUT /api/clientes/:id
router.put('/:id', async (req, res) => {
  try {
    const { nombre, telefono, email, notas } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });
    const { rows } = await db.query(
      `UPDATE clientes SET nombre=$1, telefono=$2, email=$3, notas=$4, updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [nombre.trim(), telefono || null, email || null, notas || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});

// DELETE /api/clientes/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await db.query('DELETE FROM clientes WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ message: 'Cliente eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
});

module.exports = router;
