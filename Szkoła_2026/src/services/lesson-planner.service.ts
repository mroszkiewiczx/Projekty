// ============================================================
// src/services/lesson-planner.service.ts
// Generowanie planu lekcji przez Anthropic API (streaming)
// ============================================================

import { streamWithAnthropic } from '@/services/ai/anthropic';
import type { LessonPlanningAssistantInput, LessonPlanningAssistance } from '@/types/lesson-plan';

const PLANNING_MAX_TOKENS = 3000;

function buildPlanningPrompt(input: LessonPlanningAssistantInput): string {
  const resources =
    input.available_resources.length > 0
      ? input.available_resources.join(', ')
      : 'brak dodatkowych zasobów';

  return `You are an expert lesson planner. Generate a detailed lesson plan for:

Title: ${input.lesson_title}
Subject: ${input.subject}
Grade: ${input.grade}
Students: ${input.num_students}
Time available: ${input.available_time} minutes
Classroom: ${input.classroom_type}
Available resources: ${resources}

Learning goals: ${input.learning_goals}

Return ONLY valid JSON (no markdown, no explanations, no code blocks):
{
  "suggested_objectives": ["string"],
  "materials_required": ["string"],
  "preparation_steps": ["string"],
  "timing_breakdown": [
    {
      "phase": "string",
      "duration": number,
      "activities": ["string"]
    }
  ],
  "assessment_methods": ["string"],
  "differentiation_strategies": ["string"],
  "risk_mitigation": ["string"]
}`;
}

function parseAssistanceResponse(raw: string): LessonPlanningAssistance {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Brak prawidłowego JSON w odpowiedzi AI');
  }

  try {
    return JSON.parse(jsonMatch[0]) as LessonPlanningAssistance;
  } catch (cause) {
    throw new Error(`Błąd parsowania planu lekcji: ${cause instanceof Error ? cause.message : String(cause)}`);
  }
}

export async function generateLessonPlan(
  input: LessonPlanningAssistantInput,
  onChunk?: (chunk: string) => void
): Promise<LessonPlanningAssistance> {
  const prompt = buildPlanningPrompt(input);
  let fullResponse = '';

  await streamWithAnthropic(
    prompt,
    (chunk) => {
      fullResponse += chunk;
      onChunk?.(chunk);
    },
    { maxTokens: PLANNING_MAX_TOKENS }
  );

  return parseAssistanceResponse(fullResponse);
}
