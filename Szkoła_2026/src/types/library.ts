export type MaterialType = 'lesson' | 'syllabus' | 'quiz' | 'test' | 'worksheet' | 'presentation'

export interface Material {
  id: string
  type: MaterialType
  title: string
  topic: string
  subject: string
  grade: number
  status: 'draft' | 'published' | 'archived'
  qualityScore: number
  createdAt: Date
  updatedAt: Date
  preview?: string
}

export interface LibraryFilters {
  type?: MaterialType[]
  subject?: string
  grade?: number
  minQuality?: number
  status?: string
  sortBy?: 'date_newest' | 'date_oldest' | 'quality_high' | 'quality_low' | 'title_a_z'
}

export interface LibraryStats {
  totalMaterials: number
  byType: Record<MaterialType, number>
  byStatus: Record<string, number>
  averageQuality: number
  lastGenerated?: Date
}

export interface HistoryItem {
  id: string
  materialId: string
  version: number
  title: string
  status: 'current' | 'archived'
  createdAt: Date
  changedBy: string | null
  change: string | null
}
