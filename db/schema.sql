-- Arya — schema en Postgres (Supabase), dentro de un proyecto compartido
-- con otra app (fitness-tracker). Prefijo `arya_` en cada tabla para no
-- chocar con lo que ya existe ahí. Sin RLS: la app tiene su propia
-- autenticación (no Supabase Auth) y accede server-side con la anon key.
--
-- Este archivo es de referencia/documentación — para aplicar cambios de
-- verdad usa las migraciones de Supabase (o el MCP de Supabase).

CREATE TABLE IF NOT EXISTS arya_tenants (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  slug       TEXT NOT NULL UNIQUE,
  trade      TEXT NOT NULL,
  city       TEXT NOT NULL DEFAULT 'South Florida',
  created_at TEXT NOT NULL DEFAULT (now()::text)
);

CREATE TABLE IF NOT EXISTS arya_calls (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT NOT NULL REFERENCES arya_tenants(id) ON DELETE CASCADE,
  direction     TEXT NOT NULL,              -- 'inbound' | 'outbound'
  customer_name TEXT NOT NULL,
  phone         TEXT NOT NULL,
  agent_name    TEXT NOT NULL,
  duration_sec  INTEGER NOT NULL,
  outcome       TEXT NOT NULL,              -- 'agendado' | 'llamar_despues' | 'no_interesado' | 'numero_equivocado'
  service_type  TEXT,
  occurred_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_arya_calls_tenant ON arya_calls(tenant_id);

CREATE TABLE IF NOT EXISTS arya_appointments (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT NOT NULL REFERENCES arya_tenants(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  phone         TEXT NOT NULL,
  address       TEXT,
  service_type  TEXT NOT NULL,
  technician    TEXT,
  scheduled_at  TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'confirmada', -- 'confirmada' | 'pendiente' | 'cancelada'
  value_usd     INTEGER
);
CREATE INDEX IF NOT EXISTS idx_arya_appointments_tenant ON arya_appointments(tenant_id);

CREATE TABLE IF NOT EXISTS arya_chats (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT NOT NULL REFERENCES arya_tenants(id) ON DELETE CASCADE,
  channel       TEXT NOT NULL,              -- 'chat' | 'sms'
  customer_name TEXT NOT NULL,
  phone         TEXT NOT NULL,
  agent_name    TEXT NOT NULL,
  status        TEXT NOT NULL,              -- 'resuelto' | 'pendiente'
  tag           TEXT,
  last_message  TEXT,
  started_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_arya_chats_tenant ON arya_chats(tenant_id);

CREATE TABLE IF NOT EXISTS arya_retention_contacts (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT NOT NULL REFERENCES arya_tenants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT,
  address       TEXT,
  last_service  TEXT,
  equipment     TEXT,
  notes         TEXT,
  created_at    TEXT NOT NULL DEFAULT (now()::text)
);
CREATE INDEX IF NOT EXISTS idx_arya_retention_tenant ON arya_retention_contacts(tenant_id);

CREATE TABLE IF NOT EXISTS arya_users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL,              -- 'admin' | 'contractor'
  tenant_id     TEXT REFERENCES arya_tenants(id) ON DELETE CASCADE,
  created_at    TEXT NOT NULL DEFAULT (now()::text)
);
CREATE INDEX IF NOT EXISTS idx_arya_users_tenant ON arya_users(tenant_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON
  arya_tenants, arya_calls, arya_appointments, arya_chats, arya_retention_contacts, arya_users
  TO anon, authenticated;
