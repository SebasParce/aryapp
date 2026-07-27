-- ============================================================
-- BucketsAi · schema de producción (Supabase / Postgres)
-- Proyecto: buckets-ai
-- ============================================================

CREATE TABLE tenants (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  trade         TEXT NOT NULL,
  city          TEXT NOT NULL,
  justcall_numbers TEXT[],
  timezone      TEXT NOT NULL DEFAULT 'America/New_York',
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('admin','contractor')),
  tenant_id     TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  active        BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE customers (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT,
  address       TEXT,
  equipment     TEXT,
  notes         TEXT,
  last_service  DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, phone)
);

CREATE TABLE calls (
  id                TEXT PRIMARY KEY,
  tenant_id         TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id       TEXT REFERENCES customers(id) ON DELETE SET NULL,
  justcall_call_id  TEXT UNIQUE,
  justcall_call_sid TEXT,
  justcall_number   TEXT,
  direction         TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  call_type         TEXT,
  customer_name     TEXT NOT NULL,
  phone             TEXT NOT NULL,
  customer_email    TEXT,
  customer_address  TEXT,
  agent_name        TEXT NOT NULL,
  agent_email       TEXT,
  duration_sec      INTEGER NOT NULL DEFAULT 0,
  outcome           TEXT,
  service_type      TEXT,
  occurred_at       TIMESTAMPTZ NOT NULL,
  recording_url       TEXT,
  recording_path      TEXT,
  recording_duration  INTEGER,
  transcript        JSONB,
  transcript_text   TEXT,
  ai_summary        TEXT,
  ai_next_step      TEXT,
  sentiment         TEXT,
  ai_score          NUMERIC(5,2),
  ai_tags           TEXT[],
  synced_at         TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE chats (
  id                TEXT PRIMARY KEY,
  tenant_id         TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id       TEXT REFERENCES customers(id) ON DELETE SET NULL,
  justcall_sms_id   TEXT UNIQUE,
  channel           TEXT NOT NULL CHECK (channel IN ('chat','sms','whatsapp')),
  customer_name     TEXT NOT NULL,
  phone             TEXT NOT NULL,
  customer_email    TEXT,
  customer_address  TEXT,
  agent_name        TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pendiente',
  tag               TEXT,
  last_message      TEXT,
  started_at        TIMESTAMPTZ NOT NULL,
  transcript        JSONB,
  ai_summary        TEXT,
  ai_next_step      TEXT,
  sentiment         TEXT,
  synced_at         TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE appointments (
  id                TEXT PRIMARY KEY,
  tenant_id         TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id       TEXT REFERENCES customers(id) ON DELETE SET NULL,
  source_call_id    TEXT REFERENCES calls(id) ON DELETE SET NULL,
  source_chat_id    TEXT REFERENCES chats(id) ON DELETE SET NULL,
  source_channel    TEXT,
  customer_name     TEXT NOT NULL,
  phone             TEXT NOT NULL,
  customer_email    TEXT,
  address           TEXT,
  service_type      TEXT NOT NULL,
  technician        TEXT,
  scheduled_at      TIMESTAMPTZ NOT NULL,
  duration_min      INTEGER,
  status            TEXT NOT NULL DEFAULT 'pendiente',
  priority          TEXT,
  value_usd         NUMERIC(10,2),
  equipment         TEXT,
  problem_summary   TEXT,
  technician_notes  TEXT,
  ai_summary        TEXT,
  ai_next_step      TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE retention_contacts (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id   TEXT REFERENCES customers(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT,
  address       TEXT,
  last_service  DATE,
  equipment     TEXT,
  notes         TEXT,
  campaign      TEXT,
  contacted_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bitácora de sincronización con JustCall
CREATE TABLE sync_runs (
  id            BIGSERIAL PRIMARY KEY,
  tenant_id     TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  source        TEXT NOT NULL DEFAULT 'justcall',
  kind          TEXT NOT NULL,
  status        TEXT NOT NULL,
  from_datetime TIMESTAMPTZ,
  to_datetime   TIMESTAMPTZ,
  fetched       INTEGER NOT NULL DEFAULT 0,
  inserted      INTEGER NOT NULL DEFAULT 0,
  updated       INTEGER NOT NULL DEFAULT 0,
  error         TEXT,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at   TIMESTAMPTZ
);

CREATE INDEX idx_calls_tenant_time ON calls (tenant_id, occurred_at DESC);
CREATE INDEX idx_calls_tenant_dir  ON calls (tenant_id, direction, occurred_at DESC);
CREATE INDEX idx_calls_phone       ON calls (tenant_id, phone);
CREATE INDEX idx_chats_tenant_time ON chats (tenant_id, started_at DESC);
CREATE INDEX idx_chats_phone       ON chats (tenant_id, phone);
CREATE INDEX idx_appts_tenant_time ON appointments (tenant_id, scheduled_at);
CREATE INDEX idx_appts_phone       ON appointments (tenant_id, phone);
CREATE INDEX idx_retention_tenant  ON retention_contacts (tenant_id, created_at DESC);
CREATE INDEX idx_customers_tenant  ON customers (tenant_id, name);

CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tenants_touch    BEFORE UPDATE ON tenants      FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_customers_touch  BEFORE UPDATE ON customers    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_appts_touch      BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Storage privado para las grabaciones (acceso solo por URL firmada)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('recordings','recordings',false,104857600,
        ARRAY['audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/mp4','audio/ogg','audio/webm'])
ON CONFLICT (id) DO NOTHING;

-- La app usa autenticación propia (cookie firmada), no Supabase Auth.
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;
