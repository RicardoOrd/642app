const router = require('express').Router();
const db     = require('../db');

// GET /api/inventario
router.get('/', async (req, res) => {
  try {
    const { search, categoria } = req.query;
    let q = 'SELECT * FROM inventario WHERE 1=1';
    const params = [];
    let idx = 1;
    if (search) {
      q += ` AND (LOWER(nombre) LIKE $${idx} OR LOWER(categoria) LIKE $${idx})`;
      params.push(`%${search.toLowerCase()}%`);
      idx++;
    }
    if (categoria) {
      q += ` AND categoria = $${idx}`;
      params.push(categoria);
      idx++;
    }
    q += ' ORDER BY nombre';
    const { rows } = await db.query(q, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener inventario' });
  }
});

// GET /api/inventario/metrics
router.get('/metrics', async (req, res) => {
  try {
    const total = await db.query('SELECT COUNT(*) as count FROM inventario');
    const bajo  = await db.query('SELECT COUNT(*) as count FROM inventario WHERE stock < 3');
    const valor = await db.query('SELECT COALESCE(SUM(precio * stock), 0) as total FROM inventario');
    res.json({
      total: parseInt(total.rows[0].count),
      bajo:  parseInt(bajo.rows[0].count),
      valor: parseFloat(valor.rows[0].total),
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
});

// POST /api/inventario
router.post('/', async (req, res) => {
  try {
    const { nombre, categoria, stock, precio, ubicacion, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });
    const { rows } = await db.query(
      `INSERT INTO inventario (nombre, categoria, stock, precio, ubicacion, descripcion)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [nombre.trim(), categoria || null, stock || 0, precio || 0, ubicacion || null, descripcion || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// PUT /api/inventario/:id
router.put('/:id', async (req, res) => {
  try {
    const { nombre, categoria, stock, precio, ubicacion, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });
    const { rows } = await db.query(
      `UPDATE inventario SET nombre=$1, categoria=$2, stock=$3, precio=$4, ubicacion=$5, descripcion=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [nombre.trim(), categoria || null, stock || 0, precio || 0, ubicacion || null, descripcion || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// DELETE /api/inventario/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await db.query('DELETE FROM inventario WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;
