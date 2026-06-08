export interface CurriculumRequirement {
  id: string;
  subject: string;
  level: string;
  grade: string;
  requirement: string;
  source: string;
}

export interface LessonGeneratorInput {
  topic: string;
  subject: string;
  grade: number;
  educationLevel: string;
  duration?: number;
  learningObjectives?: string[];
  curriculumRequirements?: CurriculumRequirement[];
}

export interface Activity {
  name: string;
  duration: number;
  description: string;
  materials?: string[];
  instructions: string[];
}

export interface GeneratedLesson {
  title: string;
  topic: string;
  subject: string;
  grade: number;
  duration: number;
  objectives: string[];
  content: {
    introduction: string;
    mainContent: string[];
    activities: Activity[];
    conclusion: string;
    homework?: string;
  };
  resources: string[];
  assessmentMethods: string[];
}

export interface QualityScore {
  overall: number;
  topicalAlignment: number;
  gradeAppropriate: number;
  objectives: number;
  engagement: number;
  feedback: string;
}

export interface CurriculumMatch {
  requirementId: string;
  matchPercentage: number;
  alignmentDetails: string;
}
