// ============================================================
// src/types/lesson-plan.ts
// Typy dla modułu planowania lekcji
// ============================================================

export interface LessonPlan {
  id: string;
  lesson_id: string;
  week_number: number;
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  time_slot: string; // "09:00-10:00"
  classroom: string;
  num_students: number;
  learning_objectives: string[];
  materials_needed: string[];
  preparation_needed: string[];
  estimated_duration: number; // minuty
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: Date;
}

export interface LessonPlanningAssistantInput {
  lesson_id: string;
  lesson_title: string;
  subject: string;
  grade: number;
  num_students: number;
  available_time: number; // minuty
  available_resources: string[];
  classroom_type: 'standard' | 'lab' | 'auditorium' | 'online';
  learning_goals: string;
}

export interface TimingPhase {
  phase: string;
  duration: number;
  activities: string[];
}

export interface LessonPlanningAssistance {
  suggested_objectives: string[];
  materials_required: string[];
  preparation_steps: string[];
  timing_breakdown: TimingPhase[];
  assessment_methods: string[];
  differentiation_strategies: string[];
  risk_mitigation: string[];
}
