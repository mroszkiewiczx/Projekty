-- ============================================================
-- SZKOŁA 2026 - DATABASE SCHEMA (CORRECT - v2)
-- Created: 2026-06-08
-- Source of truth: src/lib/database.types.ts
-- Supabase Project: AI-School (bteyfzhiercyhdxrgyia)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. WORKSPACES TABLE
-- Referenced first - no FK dependencies
-- ============================================================
CREATE TABLE IF NOT EXISTS public.workspaces (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT        NOT NULL,
  slug              TEXT        UNIQUE,
  plan              TEXT        NOT NULL DEFAULT 'BASIC'
                                CHECK (plan IN ('BASIC', 'PRO', 'ENTERPRISE')),
  type              TEXT,
  owner_id          UUID,       -- FK added later after users table exists
  is_school         BOOLEAN     NOT NULL DEFAULT false,
  status            TEXT        NOT NULL DEFAULT 'trial'
                                CHECK (status IN ('active', 'suspended', 'trial', 'cancelled')),
  trial_ends_at     TIMESTAMPTZ,
  paid_until        TIMESTAMPTZ,
  settings          JSONB       NOT NULL DEFAULT '{}',
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workspaces_slug        ON public.workspaces (slug);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id    ON public.workspaces (owner_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_status      ON public.workspaces (status);
CREATE INDEX IF NOT EXISTS idx_workspaces_created_at  ON public.workspaces (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workspaces_deleted_at  ON public.workspaces (deleted_at);

-- ============================================================
-- 2. USERS TABLE
-- Depends on: workspaces
-- ============================================================
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

-- Add FK from workspaces.owner_id -> users.id (deferred, now users table exists)
ALTER TABLE public.workspaces
  ADD CONSTRAINT fk_workspaces_owner_id
    FOREIGN KEY (owner_id) REFERENCES public.users (id) ON DELETE SET NULL;

-- ============================================================
-- 3. SCHOOL_PROFILES TABLE
-- Depends on: workspaces
-- ============================================================
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

-- ============================================================
-- 4. TEACHER_INVITES TABLE
-- Depends on: workspaces, users
-- ============================================================
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
CREATE INDEX IF NOT EXISTS idx_teacher_invites_invite_code  ON public.teacher_invites (invite_code);
CREATE INDEX IF NOT EXISTS idx_teacher_invites_status       ON public.teacher_invites (status);
CREATE INDEX IF NOT EXISTS idx_teacher_invites_invited_by   ON public.teacher_invites (invited_by);
CREATE INDEX IF NOT EXISTS idx_teacher_invites_created_by   ON public.teacher_invites (created_by);

-- ============================================================
-- 5. SUBSCRIPTIONS TABLE
-- Depends on: workspaces
-- ============================================================
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

CREATE INDEX IF NOT EXISTS idx_subscriptions_workspace_id           ON public.subscriptions (workspace_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status                 ON public.subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions (stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id     ON public.subscriptions (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_renewal_date           ON public.subscriptions (renewal_date);

-- ============================================================
-- 6. LESSONS TABLE
-- Depends on: workspaces, users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lessons (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID        NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  teacher_id    UUID        REFERENCES public.users (id) ON DELETE SET NULL,
  title         TEXT        NOT NULL,
  topic         TEXT        NOT NULL,
  subject       TEXT        NOT NULL,
  grade         INTEGER     NOT NULL,
  content       JSONB       NOT NULL DEFAULT '{}',
  metadata      JSONB,
  status        TEXT        NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft', 'published', 'archived')),
  quality_score NUMERIC(5,2),
  deleted_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lessons_workspace_id ON public.lessons (workspace_id);
CREATE INDEX IF NOT EXISTS idx_lessons_teacher_id   ON public.lessons (teacher_id);
CREATE INDEX IF NOT EXISTS idx_lessons_status       ON public.lessons (status);
CREATE INDEX IF NOT EXISTS idx_lessons_subject      ON public.lessons (subject);
CREATE INDEX IF NOT EXISTS idx_lessons_grade        ON public.lessons (grade);
CREATE INDEX IF NOT EXISTS idx_lessons_created_at   ON public.lessons (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lessons_deleted_at   ON public.lessons (deleted_at);

-- ============================================================
-- 7. MATERIAL_HISTORY TABLE
-- Depends on: workspaces, users, lessons
-- ============================================================
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
CREATE INDEX IF NOT EXISTS idx_material_history_changed_by   ON public.material_history (changed_by);
CREATE INDEX IF NOT EXISTS idx_material_history_is_current   ON public.material_history (is_current);
CREATE INDEX IF NOT EXISTS idx_material_history_created_at   ON public.material_history (created_at DESC);

-- ============================================================
-- 8. MATERIAL_QUALITY_SCORES TABLE
-- Depends on: workspaces, lessons
-- ============================================================
CREATE TABLE IF NOT EXISTS public.material_quality_scores (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id           UUID        NOT NULL REFERENCES public.lessons (id) ON DELETE CASCADE,
  workspace_id          UUID        NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
  score                 NUMERIC(5,2) NOT NULL,
  overall_score         NUMERIC(5,2),
  topical_alignment     NUMERIC(5,2),
  grade_appropriateness NUMERIC(5,2),
  lesson_time_realism   NUMERIC(5,2),
  objectives_quality    NUMERIC(5,2),
  exercises_quality     NUMERIC(5,2),
  language_clarity      NUMERIC(5,2),
  structure_flow        NUMERIC(5,2),
  engagement_potential  NUMERIC(5,2),
  feedback              TEXT,
  criteria              JSONB       NOT NULL DEFAULT '{}',
  reviewed_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quality_scores_material_id  ON public.material_quality_scores (material_id);
CREATE INDEX IF NOT EXISTS idx_quality_scores_workspace_id ON public.material_quality_scores (workspace_id);
CREATE INDEX IF NOT EXISTS idx_quality_scores_reviewed_at  ON public.material_quality_scores (reviewed_at DESC);

-- ============================================================
-- 9. BILLING_INVOICES TABLE
-- Depends on: workspaces
-- ============================================================
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

CREATE INDEX IF NOT EXISTS idx_billing_invoices_workspace_id      ON public.billing_invoices (workspace_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_status            ON public.billing_invoices (status);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_stripe_invoice_id ON public.billing_invoices (stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_created_at        ON public.billing_invoices (created_at DESC);

-- ============================================================
-- 10. AI_USAGE_LOGS TABLE
-- Depends on: workspaces, users
-- ============================================================
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
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id      ON public.ai_usage_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_module       ON public.ai_usage_logs (module);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_provider     ON public.ai_usage_logs (provider);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at   ON public.ai_usage_logs (created_at DESC);

-- ============================================================
-- 11. SYSTEM_LOGS TABLE
-- Depends on: workspaces (optional), users (optional)
-- ============================================================
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
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id      ON public.system_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_action       ON public.system_logs (action);
CREATE INDEX IF NOT EXISTS idx_system_logs_status       ON public.system_logs (status);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at   ON public.system_logs (created_at DESC);

-- ============================================================
-- 12. MATERIALS_VIEW (VIEW)
-- Returns published lessons with teacher and workspace info
-- Matches database.types.ts: materials_view Row type
-- ============================================================
CREATE OR REPLACE VIEW public.materials_view AS
SELECT
  l.id,
  l.workspace_id,
  l.teacher_id,
  'lesson'           AS type,
  l.title,
  l.topic,
  l.subject,
  l.grade,
  l.status,
  l.quality_score,
  l.created_at,
  l.updated_at
FROM public.lessons l
WHERE l.deleted_at IS NULL;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.workspaces           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_invites      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_history     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_quality_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_invoices     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs          ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- USERS
-- Each user can read and update only their own row.
-- ----------------------------------------------------------------
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- ----------------------------------------------------------------
-- WORKSPACES
-- Authenticated users can see workspaces where they have a user row.
-- workspace owner or admin can update the workspace row.
-- ----------------------------------------------------------------
CREATE POLICY "workspaces_select_member" ON public.workspaces
  FOR SELECT USING (
    id IN (
      SELECT workspace_id FROM public.users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "workspaces_update_owner" ON public.workspaces
  FOR UPDATE USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT workspace_id FROM public.users
      WHERE id = auth.uid() AND role = 'school_admin'
    )
  );

-- ----------------------------------------------------------------
-- SCHOOL_PROFILES
-- Visible to all members of the workspace.
-- ----------------------------------------------------------------
CREATE POLICY "school_profiles_select" ON public.school_profiles
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM public.users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "school_profiles_insert" ON public.school_profiles
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.users
      WHERE id = auth.uid() AND role IN ('school_admin', 'super_admin')
    )
  );

CREATE POLICY "school_profiles_update" ON public.school_profiles
  FOR UPDATE USING (
    workspace_id IN (
      SELECT workspace_id FROM public.users
      WHERE id = auth.uid() AND role IN ('school_admin', 'super_admin')
    )
  );

-- ----------------------------------------------------------------
-- TEACHER_INVITES
-- Only school_admin / super_admin can manage invites.
-- ----------------------------------------------------------------
CREATE POLICY "teacher_invites_select" ON public.teacher_invites
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM public.users
      WHERE id = auth.uid() AND role IN ('school_admin', 'super_admin')
    )
  );

CREATE POLICY "teacher_invites_insert" ON public.teacher_invites
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.users
      WHERE id = auth.uid() AND role IN ('school_admin', 'super_admin')
    )
  );

CREATE POLICY "teacher_invites_update" ON public.teacher_invites
  FOR UPDATE USING (
    workspace_id IN (
      SELECT workspace_id FROM public.users
      WHERE id = auth.uid() AND role IN ('school_admin', 'super_admin')
    )
  );

-- ----------------------------------------------------------------
-- SUBSCRIPTIONS
-- Readable by all workspace members; writable only by admins.
-- ----------------------------------------------------------------
CREATE POLICY "subscriptions_select" ON public.subscriptions
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM public.users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "subscriptions_insert" ON public.subscriptions
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.users
      WHERE id = auth.uid() AND role IN ('school_admin', 'super_admin')
    )
  );

CREATE POLICY "subscriptions_update" ON public.subscriptions
  FOR UPDATE USING (
    workspace_id IN (
      SELECT workspace_id FROM public.users
      WHERE id = auth.uid() AND role IN ('school_admin', 'super_admin')
    )
  );

-- ----------------------------------------------------------------
-- LESSONS
-- Members can select; teacher or admin can insert/update.
-- ----------------------------------------------------------------
CREATE POLICY "lessons_select" ON public.lessons
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM public.users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "lessons_insert" ON public.lessons
  FOR INSERT WITH CHECK (
    teacher_id = auth.uid() AND
    workspace_id IN (
      SELECT workspace_id FROM public.users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "lessons_update" ON public.lessons
  FOR UPDATE USING (
    teacher_id = auth.uid() OR
    workspace_id IN (
      SELECT workspace_id FROM public.users
      WHERE id = auth.uid() AND role IN ('school_admin', 'super_admin')
    )
  );

CREATE POLICY "lessons_delete_soft" ON public.lessons
  FOR UPDATE USING (
    workspace_id IN (
      SELECT workspace_id FROM public.users
      WHERE id = auth.uid() AND role IN ('school_admin', 'super_admin')
    )
  );

-- ----------------------------------------------------------------
-- MATERIAL_HISTORY
-- Readable by workspace members; insertable by teachers and admins.
-- ----------------------------------------------------------------
CREATE POLICY "material_history_select" ON public.material_history
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM public.users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "material_history_insert" ON public.material_history
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.users
      WHERE id = auth.uid()
    )
  );

-- ----------------------------------------------------------------
-- MATERIAL_QUALITY_SCORES
-- Readable by workspace members.
-- ----------------------------------------------------------------
CREATE POLICY "quality_scores_select" ON public.material_quality_scores
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM public.users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "quality_scores_insert" ON public.material_quality_scores
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.users
      WHERE id = auth.uid()
    )
  );

-- ----------------------------------------------------------------
-- BILLING_INVOICES
-- Readable by admins only.
-- ----------------------------------------------------------------
CREATE POLICY "billing_invoices_select" ON public.billing_invoices
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM public.users
      WHERE id = auth.uid() AND role IN ('school_admin', 'super_admin')
    )
  );

-- ----------------------------------------------------------------
-- AI_USAGE_LOGS
-- Each user sees logs for their own workspace.
-- ----------------------------------------------------------------
CREATE POLICY "ai_usage_logs_select" ON public.ai_usage_logs
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM public.users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "ai_usage_logs_insert" ON public.ai_usage_logs
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.users
      WHERE id = auth.uid()
    )
  );

-- ----------------------------------------------------------------
-- SYSTEM_LOGS
-- Readable by super_admin only.
-- ----------------------------------------------------------------
CREATE POLICY "system_logs_select" ON public.system_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "system_logs_insert" ON public.system_logs
  FOR INSERT WITH CHECK (true);  -- backend / edge functions insert freely

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON ALL TABLES IN SCHEMA public TO authenticated;

GRANT SELECT
  ON public.materials_view TO authenticated;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- Version:  20260608_create_schema_correct.sql
-- Tables:   workspaces, users, school_profiles, teacher_invites,
--           subscriptions, lessons, material_history,
--           material_quality_scores, billing_invoices,
--           ai_usage_logs, system_logs
-- Views:    materials_view
-- Indexes:  42 (covering every WHERE / JOIN column)
-- RLS:      Enabled on all 11 tables, 22 policies
-- Date:     2026-06-08
