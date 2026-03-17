const router = require('express').Router();
const db     = require('../db');

// GET /api/turnos
router.get('/', async (req, res) => {
  try {
    const { search, mes } = req.query;
    let q = 'SELECT * FROM turnos WHERE 1=1';
    const params = [];
    let idx = 1;
    if (search) {
      q += ` AND (LOWER(nombre) LIKE $${idx} OR LOWER(fotografo) LIKE $${idx})`;
      params.push(`%${search.toLowerCase()}%`);
      idx++;
    }
    if (mes) {
      q += ` AND TO_CHAR(fecha, 'YYYY-MM') = $${idx}`;
      params.push(mes);
      idx++;
    }
    q += ' ORDER BY fecha DESC';
    const { rows } = await db.query(q, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener turnos' });
  }
});

// POST /api/turnos
router.post('/', async (req, res) => {
  try {
    const { fotografo, nombre, fecha, hora_inicio, hora_fin, estado, notas } = req.body;
    if (!fotografo || !fecha) return res.status(400).json({ error: 'Fotógrafo y fecha son requeridos' });
    const { rows } = await db.query(
      `INSERT INTO turnos (fotografo, nombre, fecha, hora_inicio, hora_fin, estado, notas)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [fotografo, nombre || fotografo, fecha, hora_inicio || '09:00', hora_fin || '17:00', estado || 'activo', notas || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear turno' });
  }
});

// PUT /api/turnos/:id
router.put('/:id', async (req, res) => {
  try {
    const { fotografo, nombre, fecha, hora_inicio, hora_fin, estado, notas } = req.body;
    const { rows } = await db.query(
      `UPDATE turnos SET fotografo=$1, nombre=$2, fecha=$3, hora_inicio=$4, hora_fin=$5, estado=$6, notas=$7, updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [fotografo, nombre || fotografo, fecha, hora_inicio, hora_fin, estado, notas || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Turno no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar turno' });
  }
});

// DELETE /api/turnos/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await db.query('DELETE FROM turnos WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Turno no encontrado' });
    res.json({ message: 'Turno eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar turno' });
  }
});

module.exports = router;
