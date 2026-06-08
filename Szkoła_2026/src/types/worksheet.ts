// Worksheet types

export interface Worksheet {
  id: string
  workspace_id: string
  user_id: string
  topic: string
  title: string
  content: string // HTML
  exercise_count: number
  difficulty: 'easy' | 'medium' | 'hard'
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
}

export interface WorksheetGeneratorForm {
  topic: string
  grade: number
  subject: string
  exerciseCount: number
  difficulty: 'easy' | 'medium' | 'hard'
  exerciseTypes: ('fill-blank' | 'multiple-choice' | 'open-ended')[]
  provider: 'anthropic' | 'openai' | 'gemini'
  model: string
}
