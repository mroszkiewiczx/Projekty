// Typy dla modulu recenzji prac dyplomowych

export interface ThesisEntry {
  id: string;
  title: string;
  text: string;
  fileBase64?: string;
  fileMime?: string;
  fileName?: string;
  fileSizeKb?: number;
  status: "pending" | "processing" | "done" | "error";
  result?: ReviewResult;
  error?: string;
}

interface DetailRow {
  criterion: string;
  score: number;
  maxScore: number;
  comment: string;
}

interface StudentInfo {
  name: string;
  albumNumber: string;
  major: string;
}

interface ContentAnalysis {
  onTopic: boolean;
  waterPercent: number;
  substantivePercent: number;
  comment: string;
}

interface AiDetection {
  probability: number;
  signals: string[];
  explanation: string;
}

export interface ReviewResult {
  score: number;
  grade: string;
  summary: string;
  details: DetailRow[];
  flags: string[];
  recommendation: string;
  student: StudentInfo;
  thesisTopic: string;
  actualTopic: string;
  topicMismatch: boolean;
  abstractAI: string;
  contentAnalysis: ContentAnalysis;
  knowledgeLevel: number;
  knowledgeLevelComment: string;
  strengths: string[];
  coaching: string[];
  aiDetection: AiDetection;
  sectionSummary: string;
}
