-- ═══════════════════════════════════════
-- 642 APP — Database Schema
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(120) NOT NULL,
  username      VARCHAR(60)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol           VARCHAR(40)  NOT NULL DEFAULT 'Fotógrafo',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clientes (
  id         SERIAL PRIMARY KEY,
  nombre     VARCHAR(120) NOT NULL,
  telefono   VARCHAR(30),
  email      VARCHAR(120),
  notas      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS inventario (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(150) NOT NULL,
  categoria   VARCHAR(60),
  stock       INT          NOT NULL DEFAULT 0,
  precio      NUMERIC(12,2) DEFAULT 0,
  ubicacion   VARCHAR(100),
  descripcion TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS reservas (
  id              SERIAL PRIMARY KEY,
  cliente_id      INT REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nombre  VARCHAR(120),
  servicio        VARCHAR(120) NOT NULL,
  fecha           DATE         NOT NULL,
  hora            VARCHAR(10),
  duracion        INT          DEFAULT 2,
  precio          NUMERIC(12,2) DEFAULT 0,
  estado          VARCHAR(30)  DEFAULT 'pendiente',
  fotografo       VARCHAR(60),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS turnos (
  id          SERIAL PRIMARY KEY,
  fotografo   VARCHAR(60)  NOT NULL,
  nombre      VARCHAR(120),
  fecha       DATE         NOT NULL,
  hora_inicio VARCHAR(10),
  hora_fin    VARCHAR(10),
  estado      VARCHAR(30)  DEFAULT 'activo',
  notas       TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS facturas (
  id              SERIAL PRIMARY KEY,
  numero          VARCHAR(30)   NOT NULL UNIQUE,
  cliente_id      INT REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nombre  VARCHAR(120),
  concepto        VARCHAR(200)  NOT NULL,
  fecha           DATE          NOT NULL,
  monto           NUMERIC(12,2) NOT NULL DEFAULT 0,
  estado          VARCHAR(30)   DEFAULT 'pendiente',
  notas           TEXT,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ
);
