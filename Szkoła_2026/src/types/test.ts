// Test types

export interface TestQuestion {
  id: string
  question: string
  type: 'multiple' | 'open-ended' | 'fill-blank' | 'matching' | 'true-false'
  options?: string[]
  correctAnswer?: string | string[]
  points: number
}

export interface TestSection {
  title: string
  questions: TestQuestion[]
  time_limit_minutes?: number
}

export interface ScoringRubric {
  points: number
  percentages: {
    [key: string]: number // "0-50": 1, "51-75": 2, "76-100": 5
  }
}

export interface Test {
  id: string
  workspace_id: string
  user_id: string
  subject: string
  grade: number
  title: string
  sections: TestSection[]
  answerKey: Record<string, string | string[]>
  scoringRubric: ScoringRubric
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
}

export interface TestGeneratorForm {
  subject: string
  grade: number
  topics: string[]
  format: 'comprehensive' | 'quick' | 'final-exam'
  duration: number // minutes
  provider: 'anthropic' | 'openai' | 'gemini'
  model: string
}
