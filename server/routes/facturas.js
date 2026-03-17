const router = require('express').Router();
const db     = require('../db');

// GET /api/facturas
router.get('/', async (req, res) => {
  try {
    const { search, estado } = req.query;
    let q = 'SELECT * FROM facturas WHERE 1=1';
    const params = [];
    let idx = 1;
    if (search) {
      q += ` AND (LOWER(numero) LIKE $${idx} OR LOWER(cliente_nombre) LIKE $${idx} OR LOWER(concepto) LIKE $${idx})`;
      params.push(`%${search.toLowerCase()}%`);
      idx++;
    }
    if (estado) {
      q += ` AND estado = $${idx}`;
      params.push(estado);
      idx++;
    }
    q += ' ORDER BY fecha DESC';
    const { rows } = await db.query(q, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
});

// GET /api/facturas/metrics
router.get('/metrics', async (req, res) => {
  try {
    const pagadas   = await db.query("SELECT COALESCE(SUM(monto), 0) as total FROM facturas WHERE estado = 'pagada'");
    const pendiente = await db.query("SELECT COALESCE(SUM(monto), 0) as total FROM facturas WHERE estado = 'pendiente'");
    const count     = await db.query('SELECT COUNT(*) as count FROM facturas');
    res.json({
      totalPagado:    parseFloat(pagadas.rows[0].total),
      totalPendiente: parseFloat(pendiente.rows[0].total),
      count:          parseInt(count.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
});

// GET /api/facturas/next-numero
router.get('/next-numero', async (req, res) => {
  try {
    const { rows } = await db.query("SELECT numero FROM facturas ORDER BY id DESC LIMIT 1");
    let next = 1;
    if (rows.length) {
      const num = parseInt((rows[0].numero || '').replace(/\D/g, '')) || 0;
      next = num + 1;
    }
    res.json({ numero: `FAC-${String(next).padStart(3, '0')}` });
  } catch (err) {
    res.status(500).json({ error: 'Error al generar número' });
  }
});

// POST /api/facturas
router.post('/', async (req, res) => {
  try {
    const { numero, cliente_id, cliente_nombre, concepto, fecha, monto, estado, notas } = req.body;
    if (!numero || !concepto || !fecha) return res.status(400).json({ error: 'Número, concepto y fecha son requeridos' });
    const { rows } = await db.query(
      `INSERT INTO facturas (numero, cliente_id, cliente_nombre, concepto, fecha, monto, estado, notas)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [numero, cliente_id || null, cliente_nombre || null, concepto, fecha, monto || 0, estado || 'pendiente', notas || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Ese número de factura ya existe' });
    res.status(500).json({ error: 'Error al crear factura' });
  }
});

// PUT /api/facturas/:id
router.put('/:id', async (req, res) => {
  try {
    const { numero, cliente_id, cliente_nombre, concepto, fecha, monto, estado, notas } = req.body;
    const { rows } = await db.query(
      `UPDATE facturas SET numero=$1, cliente_id=$2, cliente_nombre=$3, concepto=$4, fecha=$5, monto=$6, estado=$7, notas=$8, updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [numero, cliente_id || null, cliente_nombre || null, concepto, fecha, monto || 0, estado || 'pendiente', notas || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Factura no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar factura' });
  }
});

// DELETE /api/facturas/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await db.query('DELETE FROM facturas WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Factura no encontrada' });
    res.json({ message: 'Factura eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar factura' });
  }
});

module.exports = router;
