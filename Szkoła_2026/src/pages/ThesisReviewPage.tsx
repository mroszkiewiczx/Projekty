// Stub - zostanie zaimplementowany w Sprint 1
export interface ThesisEntry {
  title: string
  result?: ReviewResult
}

export interface ReviewResult {
  student?: { name?: string; albumNumber?: string; major?: string }
  thesisTopic?: string
  actualTopic?: string
  topicMismatch?: boolean
  abstractAI?: string
  summary: string
  contentAnalysis?: { onTopic: boolean; substantivePercent: number; waterPercent: number; comment?: string }
  knowledgeLevel?: number
  knowledgeLevelComment?: string
  strengths?: string[]
  coaching?: string[]
  details?: { criterion: string; score: number; maxScore: number; comment: string }[]
  score: number
  grade: string
  aiDetection?: { probability: number; signals?: string[]; explanation?: string }
  sectionSummary?: string
  recommendation: string
}

export default function ThesisReviewPage() {
  return null
}
