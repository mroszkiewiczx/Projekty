-- ============================================================
-- SAFE SCHEMA FIX - dodaje brakujące tabele i kolumny
-- Istniejące tabele nie są przetwarzane - tylko brakujące
-- ============================================================

-- 1. Dodaj owner_id do workspaces jeśli nie istnieje
DO $$ BEGIN
  ALTER TABLE public.workspaces ADD COLUMN owner_id UUID;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 2. USERS TABLE (nowa - nie istnieje)
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID        NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  email         TEXT        NOT NULL UNIQUE,
  name          TEXT        NOT NULL,
  role          TEXT        NOT NULL
                            CHECK (role IN ('school_admin', 'teacher', 'super_admin')),
  status        TEXT        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('active', 'inactive', 'pending')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email        ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_workspace_id ON public.users (workspace_id);
CREATE INDEX IF NOT EXISTS idx_users_role         ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_users_status       ON public.users (status);

-- 3. Add FK from workspaces.owner_id -> users.id (safe)
DO $$ BEGIN
  ALTER TABLE public.workspaces
    ADD CONSTRAINT fk_workspaces_owner_id
      FOREIGN KEY (owner_id) REFERENCES public.users (id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. SCHOOL_PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.school_profiles (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id   UUID        NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  name           TEXT        NOT NULL,
  address        TEXT,
  contact_email  TEXT,
  phone          TEXT,
  logo_url       TEXT,
  language       TEXT        NOT NULL DEFAULT 'pl',
  settings       JSONB       NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_school_profiles_workspace_id ON public.school_profiles (workspace_id);

-- 5. TEACHER_INVITES TABLE
CREATE TABLE IF NOT EXISTS public.teacher_invites (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID        NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  email        TEXT        NOT NULL,
  invited_by   UUID        REFERENCES public.users (id) ON DELETE SET NULL,
  created_by   UUID        REFERENCES public.users (id) ON DELETE SET NULL,
  status       TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'accepted', 'expired')),
  token        TEXT        UNIQUE,
  invite_code  TEXT        UNIQUE,
  expires_at   TIMESTAMPTZ NOT NULL,
  accepted_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teacher_invites_workspace_id ON public.teacher_invites (workspace_id);
CREATE INDEX IF NOT EXISTS idx_teacher_invites_email        ON public.teacher_invites (email);
CREATE INDEX IF NOT EXISTS idx_teacher_invites_token        ON public.teacher_invites (token);
CREATE INDEX IF NOT EXISTS idx_teacher_invites_status       ON public.teacher_invites (status);

-- 6. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id              UUID        NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  plan_tier                 TEXT        NOT NULL
                                        CHECK (plan_tier IN ('basic', 'pro', 'enterprise')),
  status                    TEXT        NOT NULL DEFAULT 'trial'
                                        CHECK (status IN ('active', 'paused', 'cancelled', 'trial')),
  monthly_limit_materials   INTEGER     NOT NULL DEFAULT 0,
  renewal_date              TIMESTAMPTZ,
  stripe_subscription_id    TEXT,
  stripe_customer_id        TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_workspace_id ON public.subscriptions (workspace_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status       ON public.subscriptions (status);

-- 7. MATERIAL_HISTORY TABLE (zależy od lessons która już istnieje)
CREATE TABLE IF NOT EXISTS public.material_history (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id        UUID        NOT NULL REFERENCES public.lessons (id) ON DELETE CASCADE,
  workspace_id       UUID        NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  version            INTEGER     NOT NULL,
  title              TEXT        NOT NULL,
  content            JSONB       NOT NULL DEFAULT '{}',
  is_current         BOOLEAN     NOT NULL DEFAULT false,
  changed_by         UUID        REFERENCES public.users (id) ON DELETE SET NULL,
  change_description TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_material_history_material_id  ON public.material_history (material_id);
CREATE INDEX IF NOT EXISTS idx_material_history_workspace_id ON public.material_history (workspace_id);

-- 8. MATERIAL_QUALITY_SCORES - tabela już istnieje z lesson_id zamiast material_id
-- Pomijamy tworzenie/modyfikację tej tabeli - jest już w bazie
-- Dodajemy tylko brakujące indeksy jeśli ich nie ma
CREATE INDEX IF NOT EXISTS idx_quality_scores_workspace_id ON public.material_quality_scores (workspace_id);

-- 9. BILLING_INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.billing_invoices (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id       UUID        NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  amount_cents       INTEGER     NOT NULL,
  currency           TEXT        NOT NULL DEFAULT 'PLN',
  status             TEXT        NOT NULL DEFAULT 'pending'
                                 CHECK (status IN ('paid', 'pending', 'failed')),
  stripe_invoice_id  TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_invoices_workspace_id ON public.billing_invoices (workspace_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_status       ON public.billing_invoices (status);

-- 10. AI_USAGE_LOGS - tabela może już istnieć, dodaj brakujące kolumny
DO $$ BEGIN
  ALTER TABLE public.ai_usage_logs ADD COLUMN user_id UUID REFERENCES public.users (id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
         WHEN undefined_table THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID        NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  user_id      UUID        REFERENCES public.users (id) ON DELETE SET NULL,
  module       TEXT        NOT NULL,
  provider     TEXT        NOT NULL,
  tokens_used  INTEGER     NOT NULL DEFAULT 0,
  cost_cents   INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_workspace_id ON public.ai_usage_logs (workspace_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at   ON public.ai_usage_logs (created_at DESC);

-- 11. SYSTEM_LOGS TABLE
CREATE TABLE IF NOT EXISTS public.system_logs (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID        REFERENCES public.workspaces (id) ON DELETE SET NULL,
  user_id      UUID        REFERENCES public.users (id) ON DELETE SET NULL,
  action       TEXT        NOT NULL,
  message      TEXT,
  metadata     JSONB       NOT NULL DEFAULT '{}',
  status       TEXT        NOT NULL DEFAULT 'info',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_system_logs_workspace_id ON public.system_logs (workspace_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_action       ON public.system_logs (action);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at   ON public.system_logs (created_at DESC);

-- 12. EXPORT_HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.export_history (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id      UUID        NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  export_type       TEXT        NOT NULL CHECK (export_type IN ('lesson', 'batch_results')),
  target_platform   TEXT        NOT NULL CHECK (target_platform IN ('notion', 'airtable', 'csv', 'json')),
  entity_id         UUID        NOT NULL,
  entity_name       TEXT        NOT NULL,
  created_by        UUID        REFERENCES public.users (id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ DEFAULT now(),
  status            TEXT        NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'success', 'failed')),
  n8n_execution_id  TEXT,
  error_message     TEXT,
  records_count     INTEGER,
  completed_at      TIMESTAMPTZ,
  metadata          JSONB       DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_export_history_workspace_id ON public.export_history (workspace_id);
CREATE INDEX IF NOT EXISTS idx_export_history_created_by   ON public.export_history (created_by);
CREATE INDEX IF NOT EXISTS idx_export_history_status       ON public.export_history (status);
CREATE INDEX IF NOT EXISTS idx_export_history_created_at   ON public.export_history (created_at DESC);

-- 13. WORKSPACE_MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID        NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  role         TEXT        NOT NULL DEFAULT 'member',
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON public.workspace_members (workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id      ON public.workspace_members (user_id);

-- RLS: enable on new tables
ALTER TABLE public.users                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_invites         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_history        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_quality_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_invoices        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_history          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members       ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
DO $$ BEGIN
  CREATE POLICY "users_select_own" ON public.users
    FOR SELECT USING (id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE USING (id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "export_history_workspace_select" ON public.export_history
    FOR SELECT USING (
      workspace_id IN (SELECT workspace_id FROM public.users WHERE id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "export_history_workspace_insert" ON public.export_history
    FOR INSERT WITH CHECK (
      workspace_id IN (SELECT workspace_id FROM public.users WHERE id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
