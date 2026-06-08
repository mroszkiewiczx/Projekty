// Syllabus types

export interface SyllabusSection {
  week: number
  topic: string
  objectives: string[]
  content: string
  activities: string[]
  assessments: string[]
  homework?: string
}

export interface Syllabus {
  id: string
  workspace_id: string
  user_id: string
  subject: string
  grade: number
  school_year: string // "2026/2027"
  sections: SyllabusSection[]
  status: 'draft' | 'active' | 'archived'
  created_at: string
  updated_at: string
}

export interface SyllabusGeneratorForm {
  subject: string
  grade: number
  duration: number // weeks
  topics: string[] // array of topics
  provider: 'anthropic' | 'openai' | 'gemini'
  model: string
}
