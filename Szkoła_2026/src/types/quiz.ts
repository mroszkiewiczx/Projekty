// Quiz types

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export interface QuizQuestion {
  id: string
  type: QuestionType
  question: string
  options?: string[]
  correctAnswer?: string | boolean
  explanation?: string
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
}

export interface Quiz {
  id: string
  lesson_id: string
  workspace_id?: string
  user_id?: string
  topic?: string
  title: string
  description?: string
  questions: QuizQuestion[]
  answerKey?: Record<string, string | string[]>
  totalPoints: number
  timeLimit?: number // minuty
  passingScore: number // %
  status?: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
}

export interface QuizGeneratorInput {
  lesson_id: string
  lesson_title: string
  lesson_content: string
  numQuestions: number
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed'
  questionTypes: QuestionType[]
}

export interface QuizGeneratorForm {
  topic: string
  count: number
  difficulty: 'easy' | 'medium' | 'hard'
  grade?: number
  subject?: string
  provider: 'anthropic' | 'openai' | 'gemini'
  model: string
}

export interface QuizResult {
  quiz_id: string
  user_id: string
  score: number
  totalPoints: number
  percentage: number
  passed: boolean
  answers: Record<string, string | boolean>
  completedAt: string
}
