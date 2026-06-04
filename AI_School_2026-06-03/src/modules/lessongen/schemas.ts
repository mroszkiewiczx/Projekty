import { z } from 'zod';

/**
 * Schematy LessonGen 2.0.
 * - lessonFormSchema: walidacja formularza wejściowego (komunikaty = klucze i18n).
 * - lessonContentSchema: walidacja STRUKTURY odpowiedzi AI (Zod na granicy wyjścia AI).
 * - curriculumLessonContentSchema: rozszerzona struktura lekcji powiązanej z podstawą programową.
 */

// ---------------------------------------------------------------------------
// Formularz wejściowy
// ---------------------------------------------------------------------------

export const lessonFormSchema = z.object({
  topic: z.string().min(3, 'lessongen.errors.topicRequired'),
  subject: z.string().min(1, 'lessongen.errors.subjectRequired'),
  level: z.string().min(1, 'lessongen.errors.levelRequired'),
  durationMinutes: z
    .number({ invalid_type_error: 'lessongen.errors.durationInvalid' })
    .int()
    .min(5, 'lessongen.errors.durationInvalid')
    .max(480, 'lessongen.errors.durationInvalid'),
  objectives: z.array(z.string()).optional(),
});

export type LessonFormInput = z.infer<typeof lessonFormSchema>;

// ---------------------------------------------------------------------------
// Stara struktura lekcji (zachowana dla kompatybilności)
// ---------------------------------------------------------------------------

const lessonBlockSchema = z.object({
  type: z.enum(['intro', 'main', 'summary', 'exercise']),
  heading: z.string(),
  content: z.string(),
  durationMinutes: z.number(),
});

export const lessonContentSchema = z.object({
  title: z.string(),
  summary: z.string(),
  objectives: z.array(z.string()),
  blocks: z.array(lessonBlockSchema),
  teacherNotes: z.array(z.string()),
  studentQuestions: z.array(z.string()),
  suggestedResourceTypes: z.array(z.string()),
});

export type LessonContent = z.infer<typeof lessonContentSchema>;
export type LessonBlock = z.infer<typeof lessonBlockSchema>;

// ---------------------------------------------------------------------------
// Nowa struktura lekcji 2.0 — powiązana z podstawą programową
// ---------------------------------------------------------------------------

const lessonPhaseSchema = z.object({
  name: z.string(),
  durationMinutes: z.number(),
  description: z.string(),
  teacherActivity: z.string(),
  studentActivity: z.string(),
  methods: z.array(z.string()),
  materials: z.array(z.string()),
});

const curriculumSourceSchema = z.object({
  requirementId: z.string(),
  requirementText: z.string(),
  sectionName: z.string(),
  sourceName: z.string(),
  legalBasis: z.string(),
  sourceUrl: z.string().nullable(),
});

export const curriculumLessonContentSchema = z.object({
  title: z.string(),
  topic: z.string(),
  subject: z.string(),
  educationLevel: z.string(),
  grade: z.string(),
  lessonType: z.string(),
  durationMinutes: z.number(),
  curriculumLinked: z.boolean(),

  // Cele
  mainObjectives: z.array(z.string()),
  operationalObjectives: z.array(z.string()),
  objectivesInStudentLanguage: z.array(z.string()),
  successCriteria: z.array(z.string()),

  // Metody i środki
  teachingMethods: z.array(z.string()),
  didacticMaterials: z.array(z.string()),

  // Przebieg lekcji
  phases: z.array(lessonPhaseSchema),

  // Zadanie domowe
  homework: z.string().optional(),

  // Dostosowania SPE
  adaptations: z.object({
    spe: z.string(),
    gifted: z.string(),
    support: z.string(),
  }),

  // Sekcja "Źródła i zgodność z podstawą programową"
  curriculumSources: z.array(curriculumSourceSchema),
  curriculumNote: z.string(),

  // Uwagi ogólne
  teacherNotes: z.array(z.string()),
});

export type CurriculumLessonContent = z.infer<typeof curriculumLessonContentSchema>;
export type LessonPhase = z.infer<typeof lessonPhaseSchema>;
export type CurriculumSource = z.infer<typeof curriculumSourceSchema>;
