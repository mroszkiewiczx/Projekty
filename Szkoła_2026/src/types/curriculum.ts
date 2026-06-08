// Curriculum types

export interface CurriculumRequirement {
  id: string
  code: string // BIO.4.1.1
  requirement: string
  type: 'knowledge' | 'skill' | 'attitude'
  status: 'active' | 'archived'
  created_at: string
}

export interface CurriculumRequirementMapping {
  id: string
  lesson_id: string
  requirement_id: string
  coverage_level: 'full' | 'partial' | 'none'
  created_at: string
}

export interface Curriculum {
  id: string
  name: string
  description?: string
  status: 'active' | 'archived' | 'demo'
  source: 'official' | 'demo'
  effective_date?: string
  created_at: string
  updated_at: string
}

export interface CurriculumLevel {
  id: string
  curriculum_id: string
  name: string // 'Szkoła podstawowa', 'Gimnazjum', 'Liceum'
  order_index: number
  created_at: string
}

export interface CurriculumSubject {
  id: string
  curriculum_id: string
  level_id: string
  name: string // 'Biologia', 'Historia'
  description?: string
  order_index: number
  created_at: string
}

export interface CurriculumStandard {
  id: string
  subject: string
  grade: number
  topic: string
  objectives: string[]
  competencies: string[]
  content: string
  assessmentMethods: string[]
  duration: number // minuty
  resources: string[]
}

export interface CurriculumImportResult {
  success: boolean
  imported: number
  failed: number
  standards: CurriculumStandard[]
  errors: string[]
}
