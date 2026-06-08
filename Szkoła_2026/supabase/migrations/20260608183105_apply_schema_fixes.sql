-- MIGRATION: Fix All 11 Schema Mismatches
-- Date: 2026-06-08
-- Status: CRITICAL - Synchronize DB with Application Code

BEGIN;

-- ============================================================================
-- FIX 1: TABLE users — Add missing columns
-- ============================================================================
ALTER TABLE public.users DROP COLUMN IF EXISTS password_hash;
ALTER TABLE public.users ADD COLUMN workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.users ADD COLUMN role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('school_admin', 'teacher', 'super_admin'));
ALTER TABLE public.users ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending'));
CREATE INDEX IF NOT EXISTS idx_users_workspace_id ON public.users(workspace_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- ============================================================================
-- FIX 2: TABLE workspaces
-- ============================================================================
ALTER TABLE public.workspaces RENAME COLUMN created_by TO owner_id;
ALTER TABLE public.workspaces ADD COLUMN plan TEXT DEFAULT 'BASIC' CHECK (plan IN ('BASIC', 'PRO', 'ENTERPRISE'));
ALTER TABLE public.workspaces ADD COLUMN type TEXT;
ALTER TABLE public.workspaces ADD COLUMN is_school BOOLEAN DEFAULT false;
ALTER TABLE public.workspaces ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial', 'cancelled'));
ALTER TABLE public.workspaces ADD COLUMN trial_ends_at TIMESTAMPTZ;
ALTER TABLE public.workspaces ADD COLUMN paid_until TIMESTAMPTZ;
ALTER TABLE public.workspaces ADD COLUMN settings JSONB DEFAULT '{}';
ALTER TABLE public.workspaces ADD COLUMN deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_workspaces_status ON public.workspaces(status);
CREATE INDEX IF NOT EXISTS idx_workspaces_deleted_at ON public.workspaces(deleted_at);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON public.workspaces(owner_id);

-- ============================================================================
-- FIX 3: TABLE school_profiles
-- ============================================================================
ALTER TABLE public.school_profiles RENAME COLUMN school_name TO name;
ALTER TABLE public.school_profiles RENAME COLUMN email TO contact_email;
ALTER TABLE public.school_profiles DROP COLUMN IF EXISTS curriculum_type;
ALTER TABLE public.school_profiles ADD COLUMN logo_url TEXT;
ALTER TABLE public.school_profiles ADD COLUMN language TEXT DEFAULT 'pl';
ALTER TABLE public.school_profiles ADD COLUMN settings JSONB DEFAULT '{}';

-- ============================================================================
-- FIX 4: TABLE lessons
-- ============================================================================
ALTER TABLE public.lessons RENAME COLUMN user_id TO teacher_id;
ALTER TABLE public.lessons ALTER COLUMN grade SET DATA TYPE INTEGER USING (NULLIF(grade, '')::INTEGER);
ALTER TABLE public.lessons ALTER COLUMN content SET DATA TYPE JSONB USING (CASE WHEN content::text ~ '^{' THEN content::jsonb ELSE '{}'::jsonb END);
ALTER TABLE public.lessons DROP COLUMN IF EXISTS activities;
ALTER TABLE public.lessons DROP COLUMN IF EXISTS objectives;
ALTER TABLE public.lessons ADD COLUMN topic TEXT;
ALTER TABLE public.lessons ADD COLUMN metadata JSONB DEFAULT '{}';
ALTER TABLE public.lessons ADD COLUMN deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_lessons_subject ON public.lessons(subject);
CREATE INDEX IF NOT EXISTS idx_lessons_grade ON public.lessons(grade);
CREATE INDEX IF NOT EXISTS idx_lessons_deleted_at ON public.lessons(deleted_at);

-- ============================================================================
-- FIX 5: TABLE teacher_invites
-- ============================================================================
ALTER TABLE public.teacher_invites ADD COLUMN invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.teacher_invites ADD COLUMN created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.teacher_invites ADD COLUMN token TEXT;
ALTER TABLE public.teacher_invites ADD COLUMN accepted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_teacher_invites_invited_by ON public.teacher_invites(invited_by);
CREATE INDEX IF NOT EXISTS idx_teacher_invites_created_by ON public.teacher_invites(created_by);
CREATE INDEX IF NOT EXISTS idx_teacher_invites_token ON public.teacher_invites(token);

-- ============================================================================
-- FIX 6: TABLE subscriptions
-- ============================================================================
ALTER TABLE public.subscriptions RENAME COLUMN plan_type TO plan_tier;
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_plan_tier_check CHECK (plan_tier IN ('basic', 'pro', 'enterprise'));
ALTER TABLE public.subscriptions ADD COLUMN monthly_limit_materials INTEGER DEFAULT 50;
ALTER TABLE public.subscriptions ADD COLUMN renewal_date TIMESTAMPTZ;
ALTER TABLE public.subscriptions ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE public.subscriptions ADD COLUMN stripe_customer_id TEXT;
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);

-- ============================================================================
-- FIX 7: TABLE billing_invoices
-- ============================================================================
ALTER TABLE public.billing_invoices DROP COLUMN IF EXISTS amount;
ALTER TABLE public.billing_invoices ADD COLUMN amount_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.billing_invoices DROP CONSTRAINT IF EXISTS billing_invoices_status_check;
ALTER TABLE public.billing_invoices ADD CONSTRAINT billing_invoices_status_check CHECK (status IN ('paid', 'pending', 'failed'));
ALTER TABLE public.billing_invoices ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.billing_invoices ADD COLUMN currency TEXT DEFAULT 'USD';
ALTER TABLE public.billing_invoices ADD COLUMN stripe_invoice_id TEXT;
CREATE INDEX IF NOT EXISTS idx_billing_invoices_workspace_id ON public.billing_invoices(workspace_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_stripe_invoice_id ON public.billing_invoices(stripe_invoice_id);

-- ============================================================================
-- FIX 8: TABLE material_history
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
-- FIX 9: TABLE material_quality_scores
-- ============================================================================
ALTER TABLE public.material_quality_scores ADD COLUMN material_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE;
ALTER TABLE public.material_quality_scores ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.material_quality_scores ADD COLUMN overall_score NUMERIC(5,2);
ALTER TABLE public.material_quality_scores ADD COLUMN topical_alignment NUMERIC(5,2);
ALTER TABLE public.material_quality_scores ADD COLUMN grade_appropriateness NUMERIC(5,2);
ALTER TABLE public.material_quality_scores ADD COLUMN lesson_time_realism NUMERIC(5,2);
ALTER TABLE public.material_quality_scores ADD COLUMN objectives_quality NUMERIC(5,2);
ALTER TABLE public.material_quality_scores ADD COLUMN exercises_quality NUMERIC(5,2);
ALTER TABLE public.material_quality_scores ADD COLUMN language_clarity NUMERIC(5,2);
ALTER TABLE public.material_quality_scores ADD COLUMN structure_flow NUMERIC(5,2);
ALTER TABLE public.material_quality_scores ADD COLUMN engagement_potential NUMERIC(5,2);
ALTER TABLE public.material_quality_scores ADD COLUMN feedback TEXT;
ALTER TABLE public.material_quality_scores ADD COLUMN reviewed_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_quality_scores_material_id ON public.material_quality_scores(material_id);
CREATE INDEX IF NOT EXISTS idx_quality_scores_workspace_id ON public.material_quality_scores(workspace_id);
CREATE INDEX IF NOT EXISTS idx_quality_scores_reviewed_at ON public.material_quality_scores(reviewed_at DESC);

-- ============================================================================
-- FIX 10: TABLE ai_usage_logs
-- ============================================================================
ALTER TABLE public.ai_usage_logs ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.ai_usage_logs ADD COLUMN module TEXT;
ALTER TABLE public.ai_usage_logs ADD COLUMN provider TEXT;
ALTER TABLE public.ai_usage_logs ADD COLUMN cost_cents INTEGER DEFAULT 0;
ALTER TABLE public.ai_usage_logs DROP COLUMN IF EXISTS cost;
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_workspace_id ON public.ai_usage_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_module ON public.ai_usage_logs(module);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_provider ON public.ai_usage_logs(provider);

-- ============================================================================
-- FIX 11: TABLE system_logs
-- ============================================================================
ALTER TABLE public.system_logs RENAME COLUMN event_type TO action;
ALTER TABLE public.system_logs RENAME COLUMN description TO message;
ALTER TABLE public.system_logs ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL;
ALTER TABLE public.system_logs ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.system_logs ADD COLUMN status TEXT;
CREATE INDEX IF NOT EXISTS idx_system_logs_workspace_id ON public.system_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON public.system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_action ON public.system_logs(action);
CREATE INDEX IF NOT EXISTS idx_system_logs_status ON public.system_logs(status);

-- ============================================================================
-- FIX EXTRA: TABLE export_history
-- ============================================================================
ALTER TABLE IF EXISTS public.export_history DROP CONSTRAINT IF EXISTS export_history_created_by_fkey;
ALTER TABLE IF EXISTS public.export_history ADD CONSTRAINT export_history_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;

COMMIT;
