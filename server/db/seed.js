/* ═══════════════════════════════════════
   642 APP — Database Seed Script
   Runs init.sql + inserts demo data
   ═══════════════════════════════════════ */

const fs   = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('./index');

async function seed() {
  console.log('🔧 Initializing database...');

  // Run schema
  const schema = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
  await db.query(schema);
  console.log('✅ Schema created');

  // Check if admin exists
  const { rows } = await db.query("SELECT id FROM users WHERE username = 'admin'");
  if (rows.length > 0) {
    console.log('ℹ️  Admin user already exists, skipping seed');
    await db.pool.end();
    return;
  }

  // Seed admin user
  const hash = await bcrypt.hash('admin123', 10);
  await db.query(
    `INSERT INTO users (nombre, username, password_hash, rol)
     VALUES ($1, $2, $3, $4)`,
    ['Administrador', 'admin', hash, 'Administrador']
  );
  console.log('✅ Admin user created (admin / admin123)');

  // Seed demo clientes
  const clientes = [
    ['María González',  '644-100-2000', 'maria@email.com',  ''],
    ['Carlos Herrera',  '644-101-2111', 'carlos@email.com', ''],
    ['Ana Martínez',    '644-102-2222', 'ana@email.com',    ''],
    ['Luis Reyes',      '644-103-2333', 'luis@email.com',   ''],
  ];
  for (const c of clientes) {
    await db.query(
      `INSERT INTO clientes (nombre, telefono, email, notas) VALUES ($1,$2,$3,$4)`,
      c
    );
  }
  console.log('✅ Demo clientes created');

  // Seed inventario
  const inventario = [
    ['Cámara Sony A7 III', 'Cámara',      2, 35000, '', ''],
    ['Lente 85mm f/1.8',   'Lente',       3, 8500,  '', ''],
    ['Trípode Manfrotto',  'Accesorio',   5, 3200,  '', ''],
    ['Flash Godox V1',     'Iluminación', 4, 6000,  '', ''],
  ];
  for (const p of inventario) {
    await db.query(
      `INSERT INTO inventario (nombre, categoria, stock, precio, ubicacion, descripcion) VALUES ($1,$2,$3,$4,$5,$6)`,
      p
    );
  }
  console.log('✅ Demo inventario created');

  // Seed reservas
  const today = new Date();
  const fmt = (d, offset) => {
    const dt = new Date(d);
    dt.setDate(dt.getDate() + offset);
    return dt.toISOString().split('T')[0];
  };
  const reservas = [
    [1, 'María González',  'Sesión retrato',  fmt(today, 2),  '10:00', 2, 1500, 'confirmada',  'admin'],
    [2, 'Carlos Herrera',  'Sesión familiar', fmt(today, 5),  '12:00', 3, 2200, 'pendiente',   'admin'],
    [3, 'Ana Martínez',    'Sesión producto', fmt(today, -2), '09:00', 2, 1800, 'completada',  'admin'],
  ];
  for (const r of reservas) {
    await db.query(
      `INSERT INTO reservas (cliente_id, cliente_nombre, servicio, fecha, hora, duracion, precio, estado, fotografo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      r
    );
  }
  console.log('✅ Demo reservas created');

  // Seed turnos
  const turnos = [
    ['admin', 'Administrador', fmt(today, 0), '09:00', '17:00', 'activo', ''],
    ['admin', 'Administrador', fmt(today, 1), '10:00', '18:00', 'activo', ''],
  ];
  for (const t of turnos) {
    await db.query(
      `INSERT INTO turnos (fotografo, nombre, fecha, hora_inicio, hora_fin, estado, notas)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      t
    );
  }
  console.log('✅ Demo turnos created');

  // Seed facturas
  const facturas = [
    ['FAC-001', 3, 'Ana Martínez',   'Sesión producto', '2025-05-10', 1800, 'pagada',    ''],
    ['FAC-002', 1, 'María González', 'Sesión retrato',  '2025-06-02', 1500, 'pendiente', ''],
  ];
  for (const f of facturas) {
    await db.query(
      `INSERT INTO facturas (numero, cliente_id, cliente_nombre, concepto, fecha, monto, estado, notas)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      f
    );
  }
  console.log('✅ Demo facturas created');

  console.log('\n🎉 Database seeded successfully!');
  await db.pool.end();
}

seed().catch(err => {
  console.error('❌ Seed error:', err.message);
  process.exit(1);
});
