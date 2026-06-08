// Common types

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: Record<string, any>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

export interface AsyncState<T> {
  loading: boolean
  data: T | null
  error: string | null
}

export type EducationLevel = 'Szkoła podstawowa' | 'Gimnazjum' | 'Liceum'

export const EDUCATION_LEVELS: EducationLevel[] = [
  'Szkoła podstawowa',
  'Gimnazjum',
  'Liceum'
]

export const GRADES = {
  'Szkoła podstawowa': ['1', '2', '3', '4', '5', '6', '8'],
  'Gimnazjum': ['1', '2', '3'],
  'Liceum': ['1', '2', '3']
}

export const SUBJECTS = [
  'Biologia',
  'Historia',
  'Matematyka',
  'Język polski',
  'Język angielski',
  'Fizyka',
  'Chemia',
  'Geografia',
  'Informatyka',
  'Wychowanie fizyczne',
  'Sztuka',
  'Muzyka'
]

export const MATERIAL_TYPES = [
  'lesson',
  'syllabus',
  'quiz',
  'test',
  'worksheet',
  'presentation'
] as const

export type MaterialType = typeof MATERIAL_TYPES[number]
