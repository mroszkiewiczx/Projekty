/**
 * constants.ts — stałe modułu LessonGen 2.0
 */

export const LESSON_TYPES = [
  { value: 'wprowadzajaca', labelKey: 'lessongen.lessonType.wprowadzajaca' },
  { value: 'utrwalajaca', labelKey: 'lessongen.lessonType.utrwalajaca' },
  { value: 'powtorzeniowa', labelKey: 'lessongen.lessonType.powtorzeniowa' },
  { value: 'cwiczeniowa', labelKey: 'lessongen.lessonType.cwiczeniowa' },
  { value: 'problemowa', labelKey: 'lessongen.lessonType.problemowa' },
  { value: 'projektowa', labelKey: 'lessongen.lessonType.projektowa' },
  { value: 'laboratoryjna', labelKey: 'lessongen.lessonType.laboratoryjna' },
  { value: 'odwrocona', labelKey: 'lessongen.lessonType.odwrocona' },
] as const;

export type LessonTypeValue = (typeof LESSON_TYPES)[number]['value'];

export const DURATION_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 90, label: '90 min' },
] as const;

export const DIFFICULTY_OPTIONS = [
  { value: 'latwy', labelKey: 'lessongen.difficulty.latwy' },
  { value: 'sredni', labelKey: 'lessongen.difficulty.sredni' },
  { value: 'trudny', labelKey: 'lessongen.difficulty.trudny' },
] as const;

export const DEBOUNCE_TOPIC_MS = 600;
export const MATCH_REQUIREMENTS_LIMIT = 12;
