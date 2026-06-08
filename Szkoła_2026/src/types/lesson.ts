export interface LessonGeneratorInput {
  topic: string
  educationLevel: 'podstawowa' | 'gimnazjum' | 'liceum'
  subject: string
  grade: number
  duration: number
  objectives: string[]
  curriculum?: string
}

export interface LessonGeneratorOutput {
  id: string
  topic: string
  title: string
  content: string
  objectives: string[]
  activities: Activity[]
  assessment: string
  materials: string[]
  qualityScore: number
  generatedAt: Date
  status: 'draft' | 'published' | 'archived'
}

export interface Activity {
  name: string
  duration: number
  description: string
  materials: string[]
}

export interface TeacherDashboardStats {
  materialsGenerated: number
  materialsThisMonth: number
  averageQuality: number
  lastGenerated?: Date
  recentMaterials: LessonGeneratorOutput[]
}

export interface MaterialQualityScore {
  id: string
  materialId: string
  topicalAlignment: number
  gradeAppropriate: number
  timeRealism: number
  objectivesQuality: number
  exercisesQuality: number
  languageClarity: number
  structureFlow: number
  engagementPotential: number
  overallScore: number
  feedback: string
}
