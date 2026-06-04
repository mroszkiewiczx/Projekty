/**
 * curriculumService.ts — LessonGen 2.0
 * Dostęp do tabel edukacyjnych (education_levels, grades, subjects, curriculum_requirements)
 * oraz RPC match_curriculum_requirements i analiza tematu przez AI.
 */

import { supabase } from '@/lib/supabase';
import { callAi, type AiProvider } from '@/services/aiService';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Typy domenowe
// ---------------------------------------------------------------------------

export interface EducationLevel {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export interface Grade {
  id: string;
  education_level_id: string;
  name: string;
  numeric_value: number | null;
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
}

export interface CurriculumRequirement {
  id: string;
  subject_name: string;
  education_level_name: string;
  grade_name: string;
  section_name: string;
  requirement_type: string;
  requirement_text: string;
  source_name: string;
  legal_basis: string;
  source_url: string | null;
  school_year: string | null;
  relevance: number;
}

// ---------------------------------------------------------------------------
// Schematy Zod dla wyników analizy AI
// ---------------------------------------------------------------------------

const topicAnalysisSchema = z.object({
  subject: z.string(),
  educationLevel: z.string(),
  grade: z.string(),
  suggestedSections: z.array(z.string()),
  keywords: z.array(z.string()),
  difficulty: z.enum(['latwy', 'sredni', 'trudny']),
  warnings: z.array(z.string()).optional().default([]),
});

export type TopicAnalysis = z.infer<typeof topicAnalysisSchema>;

// ---------------------------------------------------------------------------
// Funkcje odczytu tabel referencyjnych
// ---------------------------------------------------------------------------

/** Pobiera wszystkie poziomy edukacyjne (szkoła podstawowa, liceum itd.). */
export async function listEducationLevels(): Promise<EducationLevel[]> {
  const { data, error } = await supabase
    .from('education_levels')
    .select('id, name, slug, sort_order')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as EducationLevel[];
}

/** Pobiera klasy/grupy dla danego poziomu edukacyjnego. */
export async function listGrades(educationLevelId: string): Promise<Grade[]> {
  const { data, error } = await supabase
    .from('grades')
    .select('id, education_level_id, name, numeric_value')
    .eq('education_level_id', educationLevelId)
    .eq('active', true)
    .order('numeric_value', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Grade[];
}

/** Pobiera przedmioty dostępne na danym poziomie edukacyjnym. */
export async function listSubjects(educationLevelId: string): Promise<Subject[]> {
  const { data, error } = await supabase
    .from('subjects')
    .select('id, name, slug, education_level_id')
    .eq('education_level_id', educationLevelId)
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Subject[];
}

// ---------------------------------------------------------------------------
// Dopasowanie wymagań podstawy programowej
// ---------------------------------------------------------------------------

/** Wywołuje RPC match_curriculum_requirements i zwraca dopasowane wymagania. */
export async function matchRequirements(
  topic: string,
  subjectSlug: string,
  levelSlug: string,
  gradeValue: number,
  limit = 10,
): Promise<CurriculumRequirement[]> {
  const { data, error } = await supabase.rpc('match_curriculum_requirements', {
    p_topic: topic,
    p_subject_slug: subjectSlug,
    p_education_level_slug: levelSlug,
    p_grade_value: gradeValue,
    p_limit: limit,
  });

  if (error) throw new Error(error.message);
  return (data ?? []) as CurriculumRequirement[];
}

// ---------------------------------------------------------------------------
// Analiza tematu przez AI
// ---------------------------------------------------------------------------

/** Wyciąga JSON z odpowiedzi AI (obsługa owinięcia w ```json). */
function parseAiJson(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  const jsonText = fenced ? fenced[1] : trimmed;
  return JSON.parse(jsonText);
}

const ANALYZE_SYSTEM = `Jesteś ekspertem od polskiej podstawy programowej dla szkół.
Na podstawie podanego tematu lekcji określ:
- przedmiot (np. "Biologia", "Historia", "Matematyka")
- poziom edukacyjny (np. "Szkoła podstawowa", "Liceum", "Technikum")
- klasę / grupę (np. "Klasa 7", "Klasa 1 liceum")
- proponowane działy podstawy programowej
- słowa kluczowe
- poziom trudności (latwy/sredni/trudny)
- ostrzeżenia, jeśli temat jest niejednoznaczny

Odpowiedz WYŁĄCZNIE poprawnym JSON-em w formacie:
{
  "subject": "string",
  "educationLevel": "string",
  "grade": "string",
  "suggestedSections": ["string"],
  "keywords": ["string"],
  "difficulty": "latwy|sredni|trudny",
  "warnings": ["string"]
}
Nie dodawaj żadnego tekstu przed ani po JSON-ie.`;

/**
 * Analizuje temat lekcji za pomocą AI i zwraca sugestie przedmiotu/etapu/klasy.
 * Używa wzorca callAi z istniejącego serwisu aiService.
 */
export async function analyzeTopic(
  topic: string,
  workspaceId: string,
  provider: AiProvider,
): Promise<TopicAnalysis> {
  const result = await callAi({
    workspaceId,
    provider,
    moduleKey: 'lessongen',
    system: ANALYZE_SYSTEM,
    prompt: `Temat lekcji: "${topic}"`,
    maxTokens: 800,
  });

  let parsed: unknown;
  try {
    parsed = parseAiJson(result.text);
  } catch {
    throw new Error('lessongen.errors.invalidAiResponse');
  }

  return topicAnalysisSchema.parse(parsed);
}
