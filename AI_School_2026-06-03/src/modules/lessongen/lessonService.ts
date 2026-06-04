import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { callAi, type AiProvider } from '@/services/aiService';
import { resolveModel } from '@/modules/settings/resolveModel';
import { buildLessonPrompt, buildCurriculumLessonPrompt } from './prompts';
import type { CurriculumLessonPromptParams } from './prompts';
import {
  lessonContentSchema,
  curriculumLessonContentSchema,
  type LessonContent,
  type LessonFormInput,
  type CurriculumLessonContent,
} from './schemas';
import type { CurriculumRequirement } from './curriculumService';

/**
 * Warstwa logiki LessonGen 2.0: generowanie lekcji przez AI (ai-proxy) + zapis/odczyt z bazy.
 * Wynik AI walidowany Zod (lessonContentSchema / curriculumLessonContentSchema) —
 * jeśli model zwróci zły kształt, rzucamy błąd.
 */

export interface LessonRecord {
  id: string;
  title: string;
  subject: string | null;
  target_group: string | null;
  duration_minutes: number | null;
  content: LessonContent;
  status: string;
  ai_model: string | null;
  tokens_used: number | null;
  created_at: string;
}

/** Wyciąga JSON z odpowiedzi AI (obsługa ewentualnego owinięcia w ```json). */
function parseAiJson(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  const jsonText = fenced ? fenced[1] : trimmed;
  return JSON.parse(jsonText);
}

/** Generuje lekcję przez AI (stary generator). Zwraca zwalidowaną treść + zużycie tokenów. */
export async function generateLesson(params: {
  workspaceId: string;
  provider: AiProvider;
  form: LessonFormInput;
  language: 'pl' | 'en';
}): Promise<{ content: LessonContent; model: string; tokens: number }> {
  const { system, prompt } = buildLessonPrompt({
    topic: params.form.topic,
    subject: params.form.subject,
    level: params.form.level,
    durationMinutes: params.form.durationMinutes,
    objectives: params.form.objectives,
    language: params.language,
  });

  // Jeśli brak jawnie wybranego providera, pobierz preferencję workspace
  let effectiveProvider: AiProvider = params.provider;
  let effectiveModel: string | undefined;
  if (!params.provider) {
    const resolved = await resolveModel(params.workspaceId, 'lessongen');
    effectiveProvider = resolved.provider as AiProvider;
    effectiveModel = resolved.model || undefined;
  }

  const result = await callAi({
    workspaceId: params.workspaceId,
    provider: effectiveProvider,
    moduleKey: 'lessongen',
    prompt,
    system,
    maxTokens: 4000,
    model: effectiveModel,
  });

  let parsed: unknown;
  try {
    parsed = parseAiJson(result.text);
  } catch {
    throw new Error('lessongen.errors.invalidAiResponse');
  }

  const content = lessonContentSchema.parse(parsed);
  return {
    content,
    model: result.model,
    tokens: result.usage.input_tokens + result.usage.output_tokens,
  };
}

// ---------------------------------------------------------------------------
// Generator 2.0 — powiązany z podstawą programową
// ---------------------------------------------------------------------------

export interface GenerateCurriculumLessonParams {
  workspaceId: string;
  provider: AiProvider;
  /** Opcjonalne nadpisanie modelu (z selektora modelu w UI). */
  model?: string;
  topic: string;
  subject: string;
  educationLevel: string;
  grade: string;
  lessonType: string;
  durationMinutes: number;
  difficulty: string;
  selectedRequirements: CurriculumRequirement[];
  objectives?: string;
  language: 'pl' | 'en';
}

/**
 * Generuje lekcję 2.0 powiązaną z podstawą programową.
 * Przekazuje WYBRANE wymagania z bazy do AI — model nie może ich wymyślać.
 */
export async function generateCurriculumLesson(
  params: GenerateCurriculumLessonParams,
): Promise<{ content: CurriculumLessonContent; model: string; tokens: number }> {
  const promptParams: CurriculumLessonPromptParams = {
    topic: params.topic,
    subject: params.subject,
    educationLevel: params.educationLevel,
    grade: params.grade,
    lessonType: params.lessonType,
    durationMinutes: params.durationMinutes,
    difficulty: params.difficulty,
    selectedRequirements: params.selectedRequirements,
    objectives: params.objectives,
    language: params.language,
  };

  const { system, prompt } = buildCurriculumLessonPrompt(promptParams);

  let effectiveProvider: AiProvider = params.provider;
  let effectiveModel: string | undefined = params.model || undefined;
  if (!params.provider) {
    const resolved = await resolveModel(params.workspaceId, 'lessongen');
    effectiveProvider = resolved.provider as AiProvider;
    if (!effectiveModel) effectiveModel = resolved.model || undefined;
  }

  const result = await callAi({
    workspaceId: params.workspaceId,
    provider: effectiveProvider,
    moduleKey: 'lessongen',
    prompt,
    system,
    maxTokens: 6000,
    model: effectiveModel,
  });

  let parsed: unknown;
  try {
    parsed = parseAiJson(result.text);
  } catch {
    throw new Error('lessongen.errors.invalidAiResponse');
  }

  const content = curriculumLessonContentSchema.parse(parsed);
  return {
    content,
    model: result.model,
    tokens: result.usage.input_tokens + result.usage.output_tokens,
  };
}

// ---------------------------------------------------------------------------
// Zapis do bazy
// ---------------------------------------------------------------------------

/** Zapisuje wygenerowaną lekcję do bazy (status: generated). */
export async function saveLesson(params: {
  workspaceId: string;
  form: LessonFormInput;
  content: LessonContent;
  model: string;
  tokens: number;
}): Promise<string> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('common.error');

  const { data, error } = await supabase
    .from('lessons')
    .insert({
      workspace_id: params.workspaceId,
      created_by: userData.user.id,
      title: params.content.title || params.form.topic,
      subject: params.form.subject,
      target_group: params.form.level,
      duration_minutes: params.form.durationMinutes,
      objectives: params.content.objectives,
      content: params.content as unknown as Database['public']['Tables']['lessons']['Insert']['content'],
      status: 'generated',
      ai_model: params.model,
      generation_config: { topic: params.form.topic },
      tokens_used: params.tokens,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

/** Zapisuje wygenerowaną lekcję 2.0 z powiązaniem z podstawą programową. */
export async function saveCurriculumLesson(params: {
  workspaceId: string;
  topic: string;
  content: CurriculumLessonContent;
  model: string;
  tokens: number;
  selectedRequirementIds: string[];
  lessonType: string;
}): Promise<string> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('common.error');

  const { data, error } = await supabase
    .from('lessons')
    .insert({
      workspace_id: params.workspaceId,
      created_by: userData.user.id,
      title: params.content.title || params.topic,
      subject: params.content.subject,
      target_group: `${params.content.educationLevel} — ${params.content.grade}`,
      duration_minutes: params.content.durationMinutes,
      objectives: params.content.mainObjectives,
      content: params.content as unknown as Database['public']['Tables']['lessons']['Insert']['content'],
      status: 'generated',
      ai_model: params.model,
      generation_config: {
        topic: params.topic,
        lessonType: params.lessonType,
        curriculumLinked: params.content.curriculumLinked,
        selectedRequirementIds: params.selectedRequirementIds,
      },
      tokens_used: params.tokens,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

// ---------------------------------------------------------------------------
// Odczyt historii
// ---------------------------------------------------------------------------

/** Lista lekcji workspace (historia). RLS ogranicza do własnego workspace. */
export async function listLessons(workspaceId: string): Promise<LessonRecord[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('id, title, subject, target_group, duration_minutes, content, status, ai_model, tokens_used, created_at')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as LessonRecord[];
}

/** Pobiera pojedynczą lekcję po id. */
export async function getLesson(id: string): Promise<LessonRecord | null> {
  const { data, error } = await supabase
    .from('lessons')
    .select('id, title, subject, target_group, duration_minutes, content, status, ai_model, tokens_used, created_at')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as unknown as LessonRecord | null;
}
