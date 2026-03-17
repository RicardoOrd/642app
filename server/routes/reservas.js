const router = require('express').Router();
const db     = require('../db');

// GET /api/reservas
router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;
    let q = 'SELECT * FROM reservas';
    const params = [];
    if (month && year) {
      q += ' WHERE EXTRACT(MONTH FROM fecha) = $1 AND EXTRACT(YEAR FROM fecha) = $2';
      params.push(parseInt(month), parseInt(year));
    }
    q += ' ORDER BY fecha DESC, hora ASC';
    const { rows } = await db.query(q, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

// POST /api/reservas
router.post('/', async (req, res) => {
  try {
    const { cliente_id, cliente_nombre, servicio, fecha, hora, duracion, precio, estado, fotografo } = req.body;
    if (!servicio || !fecha) return res.status(400).json({ error: 'Servicio y fecha son requeridos' });
    const { rows } = await db.query(
      `INSERT INTO reservas (cliente_id, cliente_nombre, servicio, fecha, hora, duracion, precio, estado, fotografo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [cliente_id || null, cliente_nombre || null, servicio, fecha, hora || null, duracion || 2, precio || 0, estado || 'pendiente', fotografo || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear reserva' });
  }
});

// PUT /api/reservas/:id
router.put('/:id', async (req, res) => {
  try {
    const { cliente_id, cliente_nombre, servicio, fecha, hora, duracion, precio, estado, fotografo } = req.body;
    const { rows } = await db.query(
      `UPDATE reservas SET cliente_id=$1, cliente_nombre=$2, servicio=$3, fecha=$4, hora=$5, duracion=$6, precio=$7, estado=$8, fotografo=$9, updated_at=NOW()
       WHERE id=$10 RETURNING *`,
      [cliente_id || null, cliente_nombre || null, servicio, fecha, hora || null, duracion || 2, precio || 0, estado || 'pendiente', fotografo || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Reserva no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar reserva' });
  }
});

// DELETE /api/reservas/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await db.query('DELETE FROM reservas WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Reserva no encontrada' });
    res.json({ message: 'Reserva eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar reserva' });
  }
});

module.exports = router;
