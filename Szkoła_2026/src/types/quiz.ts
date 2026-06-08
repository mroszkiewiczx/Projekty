// Quiz types

export interface QuizQuestion {
  id: string
  question: string
  type: 'multiple-choice' | 'true-false' | 'matching'
  options?: string[]
  correctAnswer?: string | string[]
  points: number
}

export interface Quiz {
  id: string
  workspace_id: string
  user_id: string
  topic: string
  title: string
  questions: QuizQuestion[]
  answerKey: Record<string, string | string[]>
  pointsPerQuestion: number
  totalPoints: number
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
}

export interface QuizGeneratorForm {
  topic: string
  count: number // liczba pytań
  difficulty: 'easy' | 'medium' | 'hard'
  grade?: number
  subject?: string
  provider: 'anthropic' | 'openai' | 'gemini'
  model: string
}
