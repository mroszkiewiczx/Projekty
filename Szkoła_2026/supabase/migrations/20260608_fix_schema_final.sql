-- MIGRATION: Fix All 11 Schema Mismatches
-- Date: 2026-06-08
-- Status: CRITICAL - Synchronize DB with Application Code
-- Previous: 11 tables with breaking incompatibilities
-- Solution: Apply ALL fixes in exact order

BEGIN;

-- ============================================================================
-- FIX 1: TABLE users — Add missing columns (workspace_id, role, status)
-- ============================================================================
ALTER TABLE public.users
  DROP COLUMN IF EXISTS password_hash;

ALTER TABLE public.users
  ADD COLUMN workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  ADD COLUMN role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('school_admin', 'teacher', 'super_admin')),
  ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending'));

CREATE INDEX IF NOT EXISTS idx_users_workspace_id ON public.users(workspace_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- ============================================================================
-- FIX 2: TABLE workspaces — Rename created_by → owner_id + Add 9 columns
-- ============================================================================
ALTER TABLE public.workspaces
  RENAME COLUMN created_by TO owner_id;

ALTER TABLE public.workspaces
  ADD COLUMN plan TEXT DEFAULT 'BASIC' CHECK (plan IN ('BASIC', 'PRO', 'ENTERPRISE')),
  ADD COLUMN type TEXT,
  ADD COLUMN is_school BOOLEAN DEFAULT false,
  ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial', 'cancelled')),
  ADD COLUMN trial_ends_at TIMESTAMPTZ,
  ADD COLUMN paid_until TIMESTAMPTZ,
  ADD COLUMN settings JSONB DEFAULT '{}',
  ADD COLUMN deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_workspaces_status ON public.workspaces(status);
CREATE INDEX IF NOT EXISTS idx_workspaces_deleted_at ON public.workspaces(deleted_at);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON public.workspaces(owner_id);

-- ============================================================================
-- FIX 3: TABLE school_profiles — Rename columns + Add missing ones
-- ============================================================================
ALTER TABLE public.school_profiles
  RENAME COLUMN school_name TO name,
  RENAME COLUMN email TO contact_email;

ALTER TABLE public.school_profiles
  DROP COLUMN IF EXISTS curriculum_type,
  ADD COLUMN logo_url TEXT,
  ADD COLUMN language TEXT DEFAULT 'pl',
  ADD COLUMN settings JSONB DEFAULT '{}';

-- ============================================================================
-- FIX 4: TABLE lessons — Fix all 5 issues
-- ============================================================================
-- Issue 1: Rename user_id → teacher_id
ALTER TABLE public.lessons
  RENAME COLUMN user_id TO teacher_id;

-- Issue 2-3: Fix types (grade INT, content JSONB)
ALTER TABLE public.lessons
  ALTER COLUMN grade SET DATA TYPE INTEGER USING (NULLIF(grade, '')::INTEGER);

ALTER TABLE public.lessons
  ALTER COLUMN content SET DATA TYPE JSONB USING (CASE
    WHEN content::text ~ '^{' THEN content::jsonb
    ELSE '{}'::jsonb
  END);

-- Issue 4-5: Drop old columns, add missing ones
ALTER TABLE public.lessons
  DROP COLUMN IF EXISTS activities,
  DROP COLUMN IF EXISTS objectives,
  ADD COLUMN topic TEXT,
  ADD COLUMN metadata JSONB DEFAULT '{}',
  ADD COLUMN deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_lessons_subject ON public.lessons(subject);
CREATE INDEX IF NOT EXISTS idx_lessons_grade ON public.lessons(grade);
CREATE INDEX IF NOT EXISTS idx_lessons_deleted_at ON public.lessons(deleted_at);

-- ============================================================================
-- FIX 5: TABLE teacher_invites — Add 4 missing columns
-- ============================================================================
ALTER TABLE public.teacher_invites
  ADD COLUMN invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN token TEXT,
  ADD COLUMN accepted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_teacher_invites_invited_by ON public.teacher_invites(invited_by);
CREATE INDEX IF NOT EXISTS idx_teacher_invites_created_by ON public.teacher_invites(created_by);
CREATE INDEX IF NOT EXISTS idx_teacher_invites_token ON public.teacher_invites(token);

-- ============================================================================
-- FIX 6: TABLE subscriptions — Rename + Add missing columns
-- ============================================================================
ALTER TABLE public.subscriptions
  RENAME COLUMN plan_type TO plan_tier;

-- Drop old constraint
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check;

-- Add new constraint
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_plan_tier_check
  CHECK (plan_tier IN ('basic', 'pro', 'enterprise'));

-- Add missing columns
ALTER TABLE public.subscriptions
  ADD COLUMN monthly_limit_materials INTEGER DEFAULT 50,
  ADD COLUMN renewal_date TIMESTAMPTZ,
  ADD COLUMN stripe_subscription_id TEXT,
  ADD COLUMN stripe_customer_id TEXT;

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);

-- ============================================================================
-- FIX 7: TABLE billing_invoices — Fix type + Add missing columns
-- ============================================================================
-- Change amount type (DECIMAL → INTEGER cents)
ALTER TABLE public.billing_invoices
  DROP COLUMN IF EXISTS amount;

ALTER TABLE public.billing_invoices
  ADD COLUMN amount_cents INTEGER NOT NULL DEFAULT 0;

-- Drop old constraint, add new one
ALTER TABLE public.billing_invoices
  DROP CONSTRAINT IF EXISTS billing_invoices_status_check;

ALTER TABLE public.billing_invoices
  ADD CONSTRAINT billing_invoices_status_check
  CHECK (status IN ('paid', 'pending', 'failed'));

-- Add missing columns
ALTER TABLE public.billing_invoices
  ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  ADD COLUMN currency TEXT DEFAULT 'USD',
  ADD COLUMN stripe_invoice_id TEXT;

CREATE INDEX IF NOT EXISTS idx_billing_invoices_workspace_id ON public.billing_invoices(workspace_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_stripe_invoice_id ON public.billing_invoices(stripe_invoice_id);

-- ============================================================================
-- FIX 8: TABLE material_history — Drop and recreate (version control, not export log)
-- ============================================================================
DROP TABLE IF EXISTS public.material_history CASCADE;

CREATE TABLE public.material_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title TEXT,
  content JSONB,
  is_current BOOLEAN DEFAULT false,
  changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  change_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_material_history_material_id ON public.material_history(material_id);
CREATE INDEX idx_material_history_workspace_id ON public.material_history(workspace_id);
CREATE INDEX idx_material_history_is_current ON public.material_history(is_current);
CREATE INDEX idx_material_history_created_at ON public.material_history(created_at DESC);

-- ============================================================================
-- FIX 9: TABLE material_quality_scores — Add 12 missing columns
-- ============================================================================
ALTER TABLE public.material_quality_scores
  ADD COLUMN material_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  ADD COLUMN overall_score NUMERIC(5,2),
  ADD COLUMN topical_alignment NUMERIC(5,2),
  ADD COLUMN grade_appropriateness NUMERIC(5,2),
  ADD COLUMN lesson_time_realism NUMERIC(5,2),
  ADD COLUMN objectives_quality NUMERIC(5,2),
  ADD COLUMN exercises_quality NUMERIC(5,2),
  ADD COLUMN language_clarity NUMERIC(5,2),
  ADD COLUMN structure_flow NUMERIC(5,2),
  ADD COLUMN engagement_potential NUMERIC(5,2),
  ADD COLUMN feedback TEXT,
  ADD COLUMN reviewed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_quality_scores_material_id ON public.material_quality_scores(material_id);
CREATE INDEX IF NOT EXISTS idx_quality_scores_workspace_id ON public.material_quality_scores(workspace_id);
CREATE INDEX IF NOT EXISTS idx_quality_scores_reviewed_at ON public.material_quality_scores(reviewed_at DESC);

-- ============================================================================
-- FIX 10: TABLE ai_usage_logs — Add 3 missing columns + rename
-- ============================================================================
ALTER TABLE public.ai_usage_logs
  ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  ADD COLUMN module TEXT,
  ADD COLUMN provider TEXT,
  ADD COLUMN cost_cents INTEGER DEFAULT 0;

-- Drop old column if exists
ALTER TABLE public.ai_usage_logs
  DROP COLUMN IF EXISTS cost;

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_workspace_id ON public.ai_usage_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_module ON public.ai_usage_logs(module);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_provider ON public.ai_usage_logs(provider);

-- ============================================================================
-- FIX 11: TABLE system_logs — Rename columns + Add missing ones
-- ============================================================================
ALTER TABLE public.system_logs
  RENAME COLUMN event_type TO action,
  RENAME COLUMN description TO message;

ALTER TABLE public.system_logs
  ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
  ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN status TEXT;

CREATE INDEX IF NOT EXISTS idx_system_logs_workspace_id ON public.system_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON public.system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_action ON public.system_logs(action);
CREATE INDEX IF NOT EXISTS idx_system_logs_status ON public.system_logs(status);

-- ============================================================================
-- FIX EXTRA: TABLE export_history — Fix FK reference (profiles → users)
-- ============================================================================
ALTER TABLE IF EXISTS public.export_history
  DROP CONSTRAINT IF EXISTS export_history_created_by_fkey;

ALTER TABLE IF EXISTS public.export_history
  ADD CONSTRAINT export_history_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- ============================================================================
-- Summary
-- ============================================================================
-- All 11 schema mismatches fixed:
-- 1. ✅ users: +3 columns (workspace_id, role, status)
-- 2. ✅ workspaces: +9 columns (plan, type, is_school, status, etc.)
-- 3. ✅ school_profiles: renamed columns + added (logo_url, language, settings)
-- 4. ✅ lessons: fixed types + renamed (user_id→teacher_id) + added (topic, metadata, deleted_at)
-- 5. ✅ teacher_invites: +4 columns (invited_by, created_by, token, accepted_at)
-- 6. ✅ subscriptions: renamed (plan_type→plan_tier) + added 4 columns
-- 7. ✅ billing_invoices: type fix (amount→amount_cents) + added columns
-- 8. ✅ material_history: dropped/recreated for version control
-- 9. ✅ material_quality_scores: +12 score columns
-- 10. ✅ ai_usage_logs: +3 columns (workspace_id, module, provider)
-- 11. ✅ system_logs: renamed columns + added 3 columns

COMMIT;
