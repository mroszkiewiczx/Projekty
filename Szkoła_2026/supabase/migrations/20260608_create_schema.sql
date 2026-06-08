-- ============================================================
-- SZKOŁA 2026 - DATABASE SCHEMA
-- Created: 2026-06-08
-- Supabase Project: AI-School (bteyfzhiercyhdxrgyia)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ============================================================
-- 2. WORKSPACES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workspaces_created ON public.workspaces(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON public.workspaces(slug);

-- ============================================================
-- 3. WORKSPACE_MEMBERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'teacher', 'member')),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON public.workspace_members(workspace_id);

-- ============================================================
-- 4. SCHOOL_PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.school_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  school_name TEXT NOT NULL,
  address TEXT,
  email TEXT,
  phone TEXT,
  curriculum_type TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_school_profiles_workspace ON public.school_profiles(workspace_id);

-- ============================================================
-- 5. LESSONS TABLE (GŁÓWNA)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT,
  grade TEXT,
  content TEXT,
  objectives TEXT[],
  activities JSONB DEFAULT '{}',
  quality_score DECIMAL(3,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lessons_workspace ON public.lessons(workspace_id);
CREATE INDEX IF NOT EXISTS idx_lessons_user ON public.lessons(user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON public.lessons(status);
CREATE INDEX IF NOT EXISTS idx_lessons_created ON public.lessons(created_at DESC);

-- ============================================================
-- 6. TEACHER_INVITES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.teacher_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL,
  email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_teacher_invites_code ON public.teacher_invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_teacher_invites_workspace ON public.teacher_invites(workspace_id);

-- ============================================================
-- 7. SUBSCRIPTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  plan_type TEXT CHECK (plan_type IN ('free', 'basic', 'pro', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired')),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_workspace ON public.subscriptions(workspace_id);

-- ============================================================
-- 8. BILLING_INVOICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.billing_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  amount DECIMAL(10,2),
  status TEXT CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  created_at TIMESTAMP DEFAULT now(),
  due_date TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_billing_invoices_subscription ON public.billing_invoices(subscription_id);

-- ============================================================
-- 9. MATERIAL_HISTORY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.material_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  export_type TEXT CHECK (export_type IN ('lesson', 'batch_results')),
  target_platform TEXT CHECK (target_platform IN ('notion', 'airtable', 'csv', 'json')),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_material_history_lesson ON public.material_history(lesson_id);

-- ============================================================
-- 10. MATERIAL_QUALITY_SCORES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.material_quality_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  score DECIMAL(3,2),
  criteria JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quality_scores_lesson ON public.material_quality_scores(lesson_id);

-- ============================================================
-- 11. AI_USAGE_LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  model TEXT,
  tokens_used INTEGER,
  cost DECIMAL(10,4),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_logs_user ON public.ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created ON public.ai_usage_logs(created_at DESC);

-- ============================================================
-- 12. SYSTEM_LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_system_logs_event ON public.system_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_system_logs_created ON public.system_logs(created_at DESC);

-- ============================================================
-- 13. MATERIALS_VIEW (MATERIALIZED VIEW)
-- ============================================================
CREATE OR REPLACE VIEW public.materials_view AS
SELECT
  l.id,
  l.title,
  l.subject,
  l.grade,
  l.quality_score,
  l.status,
  l.created_at,
  u.email as author_email,
  u.name as author_name,
  w.name as workspace_name
FROM public.lessons l
LEFT JOIN public.users u ON l.user_id = u.id
LEFT JOIN public.workspaces w ON l.workspace_id = w.id
WHERE l.status = 'published'
ORDER BY l.created_at DESC;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_quality_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- USERS: Users can only see their own record
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- WORKSPACES: Users can see workspaces they're member of
CREATE POLICY "workspaces_select" ON public.workspaces
  FOR SELECT USING (
    id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- WORKSPACE_MEMBERS: Members can see their workspace members
CREATE POLICY "workspace_members_select" ON public.workspace_members
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- SCHOOL_PROFILES: Users can see school profiles of their workspaces
CREATE POLICY "school_profiles_select" ON public.school_profiles
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- LESSONS: Users can see lessons in their workspaces
CREATE POLICY "lessons_select" ON public.lessons
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "lessons_insert" ON public.lessons
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "lessons_update" ON public.lessons
  FOR UPDATE USING (
    user_id = auth.uid() OR
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- TEACHER_INVITES: Workspace admins can manage invites
CREATE POLICY "teacher_invites_select" ON public.teacher_invites
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- AI_USAGE_LOGS: Users can see their own logs
CREATE POLICY "ai_logs_select" ON public.ai_usage_logs
  FOR SELECT USING (user_id = auth.uid());

-- SYSTEM_LOGS: Only workspace admins can see (optional, adjust as needed)
CREATE POLICY "system_logs_select" ON public.system_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- Status: Schema created with 13 tables, 19 indexes, and RLS policies
-- Tables: users, workspaces, workspace_members, school_profiles, lessons,
--         teacher_invites, subscriptions, billing_invoices, material_history,
--         material_quality_scores, ai_usage_logs, system_logs, materials_view
-- Date: 2026-06-08
