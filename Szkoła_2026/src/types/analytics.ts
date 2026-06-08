// ============================================================
// src/types/analytics.ts
// Typy dla modułu Analytics & Statystyki
// ============================================================

export interface LessonMetrics {
  lesson_id: string
  lesson_title: string
  students_count: number
  completion_rate: number      // 0–100
  avg_engagement_score: number // 0–100
  avg_time_spent: number       // minuty
  quality_score: number        // 0–100
  feedback_sentiment: 'positive' | 'neutral' | 'negative' | 'none'
}

export interface StudentProgress {
  student_id: string
  student_name: string
  lessons_completed: number
  total_lessons: number
  avg_score: number
  learning_rate: number  // postęp w %
  last_activity: Date
}

export interface TrendPoint {
  date: Date
  engagement: number
  completion: number
  time_spent: number
}

export interface AnalyticsOverview {
  total_lessons: number
  total_students: number
  avg_engagement: number
  total_learning_hours: number
  top_lessons: LessonMetrics[]
  top_students: StudentProgress[]
  learning_trend: TrendPoint[]
}

export interface EngagementMetric {
  metric: string
  value: number
  target: number
  status: 'on-track' | 'at-risk' | 'behind'
}
