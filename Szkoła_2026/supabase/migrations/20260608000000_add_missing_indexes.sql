-- Add missing indexes for query performance
-- FIXED 2026-06-08: quality_score index moved to lessons table (correct location)

-- users.created_at for dashboard queries
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users (created_at DESC);

-- quality_score filter in lessons table (EduEval / library queries)
CREATE INDEX IF NOT EXISTS idx_lessons_quality_score ON public.lessons (quality_score);

-- Composite index for workspace + role queries
CREATE INDEX IF NOT EXISTS idx_users_workspace_role ON public.users (workspace_id, role);

-- Index for libraryService sorting
CREATE INDEX IF NOT EXISTS idx_lessons_title ON public.lessons (title);
