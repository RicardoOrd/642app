const router = require('express').Router();
const db     = require('../db');

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const clientes   = await db.query('SELECT COUNT(*) as count FROM clientes');
    const inventario = await db.query('SELECT COUNT(*) as count FROM inventario');
    const reservas   = await db.query("SELECT COUNT(*) as count FROM reservas WHERE estado NOT IN ('cancelada','completada')");
    const facturas   = await db.query("SELECT COUNT(*) as count FROM facturas WHERE estado = 'pendiente'");

    res.json({
      clientes:   parseInt(clientes.rows[0].count),
      inventario: parseInt(inventario.rows[0].count),
      reservas:   parseInt(reservas.rows[0].count),
      facturas:   parseInt(facturas.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// GET /api/dashboard/ingresos
router.get('/ingresos', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        EXTRACT(MONTH FROM fecha) as mes,
        COALESCE(SUM(monto), 0) as total
      FROM facturas
      WHERE estado = 'pagada'
        AND EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY mes
      ORDER BY mes
    `);

    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const data = meses.map((label, i) => {
      const row = rows.find(r => parseInt(r.mes) === i + 1);
      return { label, total: row ? parseFloat(row.total) : 0 };
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener ingresos' });
  }
});

// GET /api/dashboard/proximas-reservas
router.get('/proximas-reservas', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT * FROM reservas
      WHERE estado != 'cancelada'
      ORDER BY fecha ASC, hora ASC
      LIMIT 5
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener próximas reservas' });
  }
});

module.exports = router;
