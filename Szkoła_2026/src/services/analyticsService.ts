// ============================================================
// src/services/analyticsService.ts
// Pobieranie danych analitycznych z Supabase
// Używa istniejących tabel: lessons, users
// ============================================================

import { supabase } from '@/lib/supabase'
import type {
  AnalyticsOverview,
  LessonMetrics,
  StudentProgress,
  TrendPoint,
} from '@/types/analytics'

// ─── helpers ────────────────────────────────────────────────

function average(values: number[]): number {
  if (!values.length) return 0
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

// ─── pojedyncza lekcja ──────────────────────────────────────

function buildLessonMetrics(
  lesson_id: string,
  lesson_title: string,
  quality_score: number,
): LessonMetrics {
  // Dane szacunkowe — w przyszłości z tabel lesson_views / lesson_feedback
  const q = quality_score
  return {
    lesson_id,
    lesson_title,
    students_count: Math.max(1, Math.floor(q / 5)),
    completion_rate: Math.min(100, q + 5),
    avg_engagement_score: Math.min(100, q + 3),
    avg_time_spent: Math.floor(q / 2) + 20,
    quality_score: q,
    feedback_sentiment: q >= 80 ? 'positive' : q >= 60 ? 'neutral' : 'negative',
  }
}

// ─── postęp nauczyciela jako "ucznia" (demo) ────────────────

function buildStudentProgress(
  user_id: string,
  student_name: string,
  total_lessons: number,
): StudentProgress {
  const completed = Math.min(total_lessons, Math.max(1, Math.floor(total_lessons * 0.7)))
  return {
    student_id: user_id,
    student_name,
    lessons_completed: completed,
    total_lessons,
    avg_score: Math.floor(Math.random() * 20) + 78,
    learning_rate: Math.round((completed / Math.max(1, total_lessons)) * 100),
    last_activity: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000),
  }
}

// ─── trend 30 dni ───────────────────────────────────────────

function buildLearningTrend(days: number, baseEngagement: number): TrendPoint[] {
  const trend: TrendPoint[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const variance = Math.sin(i / 3) * 5
    trend.push({
      date,
      engagement: Math.min(100, Math.max(0, Math.round(baseEngagement + variance))),
      completion: Math.min(100, Math.max(0, Math.round(baseEngagement - 5 + variance))),
      time_spent: Math.floor(Math.random() * 30) + 30,
    })
  }

  return trend
}

// ─── publiczne API ──────────────────────────────────────────

export async function getAnalyticsOverview(
  workspace_id: string,
): Promise<AnalyticsOverview> {
  const [lessonsResult, teachersResult] = await Promise.all([
    supabase
      .from('lessons')
      .select('id, title, quality_score')
      .eq('workspace_id', workspace_id)
      .is('deleted_at', null),
    supabase
      .from('users')
      .select('id, name')
      .eq('workspace_id', workspace_id)
      .eq('status', 'active'),
  ])

  const lessons = lessonsResult.data ?? []
  const teachers = teachersResult.data ?? []

  const lessonMetrics = lessons.map((l) =>
    buildLessonMetrics(l.id, l.title, l.quality_score ?? 70),
  )

  const studentProgress = teachers.map((t) =>
    buildStudentProgress(t.id, t.name, lessons.length),
  )

  const avgEngagement = average(lessonMetrics.map((m) => m.avg_engagement_score))
  const totalHours = studentProgress.reduce(
    (sum, sp) => sum + sp.lessons_completed * 1.5,
    0,
  )

  return {
    total_lessons: lessons.length,
    total_students: teachers.length,
    avg_engagement: avgEngagement,
    total_learning_hours: Math.round(totalHours),
    top_lessons: lessonMetrics
      .sort((a, b) => b.avg_engagement_score - a.avg_engagement_score)
      .slice(0, 5),
    top_students: studentProgress
      .sort((a, b) => b.learning_rate - a.learning_rate)
      .slice(0, 5),
    learning_trend: buildLearningTrend(30, avgEngagement),
  }
}
