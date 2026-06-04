/**
 * prompts.ts — Moduł LessonGen 2.0
 * Buduje prompty systemowe i użytkownika do generowania lekcji przez AI.
 * Zasada antyhalucynacyjna: model NIE wymyśla wymagań podstawy programowej —
 * korzysta WYŁĄCZNIE z wymagań przekazanych w kontekście.
 */

import type { CurriculumRequirement } from './curriculumService';

// ---------------------------------------------------------------------------
// Typy parametrów wejściowych (stary interfejs — zachowany dla kompatybilności)
// ---------------------------------------------------------------------------

export interface LessonPromptParams {
  /** Temat lekcji, np. "Fotosynteza" */
  topic: string;
  /** Przedmiot, np. "Biologia" */
  subject: string;
  /** Poziom nauczania, np. "klasa 7", "liceum", "podstawowy" */
  level: string;
  /** Planowany czas trwania lekcji w minutach */
  durationMinutes: number;
  /** Opcjonalne cele dydaktyczne dostarczone przez nauczyciela */
  objectives?: string[];
  /** Język odpowiedzi modelu */
  language: 'pl' | 'en';
}

// ---------------------------------------------------------------------------
// Nowe typy parametrów dla generatora powiązanego z podstawą programową
// ---------------------------------------------------------------------------

export interface CurriculumLessonPromptParams {
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

// ---------------------------------------------------------------------------
// Stary kształt JSON wyniku (zachowany)
// ---------------------------------------------------------------------------

export const LESSON_JSON_SHAPE = `{
  "title": "string — tytuł lekcji",
  "summary": "string — krótkie (2-3 zdania) streszczenie lekcji",
  "objectives": ["string — cel dydaktyczny 1", "string — cel dydaktyczny 2"],
  "blocks": [
    {
      "type": "intro | main | summary | exercise",
      "heading": "string — nagłówek bloku",
      "content": "string — pełna treść bloku",
      "durationMinutes": "number — szacowany czas trwania w minutach"
    }
  ],
  "teacherNotes": ["string — wskazówka dla nauczyciela 1"],
  "studentQuestions": ["string — pytanie do dyskusji lub sprawdzenia wiedzy"],
  "suggestedResourceTypes": [
    "string — OPIS TYPU zasobu bez URL, np. 'film edukacyjny o fotosyntezie (YouTube)'"
  ]
}` as const;

// ---------------------------------------------------------------------------
// Nowy kształt JSON wyniku — lekcja 2.0 powiązana z podstawą
// ---------------------------------------------------------------------------

export const CURRICULUM_LESSON_JSON_SHAPE = `{
  "title": "string — tytuł lekcji",
  "topic": "string — temat lekcji",
  "subject": "string — przedmiot",
  "educationLevel": "string — poziom edukacyjny",
  "grade": "string — klasa/rok",
  "lessonType": "string — typ lekcji",
  "durationMinutes": number,
  "curriculumLinked": true,
  "mainObjectives": ["string — główny cel dydaktyczny"],
  "operationalObjectives": ["string — cel operacyjny (mierzalny)"],
  "objectivesInStudentLanguage": ["string — cel w języku ucznia, np. 'Po lekcji będę umiał...'"],
  "successCriteria": ["string — kryterium sukcesu NaCoBeZu"],
  "teachingMethods": ["string — metoda dydaktyczna"],
  "didacticMaterials": ["string — środek dydaktyczny"],
  "phases": [
    {
      "name": "string — nazwa fazy (np. 'Wprowadzenie', 'Rozwinięcie', 'Podsumowanie')",
      "durationMinutes": number,
      "description": "string — opis fazy",
      "teacherActivity": "string — działania nauczyciela",
      "studentActivity": "string — działania uczniów",
      "methods": ["string — metoda"],
      "materials": ["string — materiał/pomoce"]
    }
  ],
  "homework": "string — zadanie domowe lub brak (opcjonalne)",
  "adaptations": {
    "spe": "string — dostosowania dla uczniów ze SPE",
    "gifted": "string — rozszerzenia dla uczniów zdolnych",
    "support": "string — wsparcie dla uczniów wymagających pomocy"
  },
  "curriculumSources": [
    {
      "requirementId": "string — id wymagania z bazy",
      "requirementText": "string — treść wymagania (dosłowna z kontekstu)",
      "sectionName": "string — dział podstawy programowej",
      "sourceName": "string — nazwa dokumentu podstawy",
      "legalBasis": "string — podstawa prawna (rozporządzenie)",
      "sourceUrl": "string lub null"
    }
  ],
  "curriculumNote": "string — informacja o powiązaniu z podstawą lub brak powiązania",
  "teacherNotes": ["string — dodatkowa wskazówka dla nauczyciela"]
}` as const;

// ---------------------------------------------------------------------------
// Reeksport typów z schemas.ts
// ---------------------------------------------------------------------------

export type { LessonContent, LessonBlock } from './schemas';

// ---------------------------------------------------------------------------
// Pomocnicze tłumaczenia dla promptu (stary generator)
// ---------------------------------------------------------------------------

const LABELS: Record<'pl' | 'en', {
  jsonInstruction: string;
  antiHallucinationRule: string;
  objectivesLabel: string;
  noObjectivesNote: string;
}> = {
  pl: {
    jsonInstruction:
      'Odpowiedz WYŁĄCZNIE poprawnym JSON-em zgodnym z podanym schematem. ' +
      'Nie dodawaj żadnego tekstu przed ani po JSON-ie. Nie zawijaj odpowiedzi w bloki kodu (``` lub podobne).',
    antiHallucinationRule:
      'WAŻNA ZASADA: Nie podawaj konkretnych adresów URL ani linków do stron internetowych. ' +
      'W polu "suggestedResourceTypes" opisuj wyłącznie TYP i temat zasobu ' +
      '(np. "film edukacyjny o fotosyntezie dostępny na platformach wideo"), ' +
      'a nie adres URL. Nigdy nie zmyślaj linków.',
    objectivesLabel: 'Cele dydaktyczne dostarczone przez nauczyciela (uwzględnij je w lekcji):',
    noObjectivesNote: 'Cele dydaktyczne: sformułuj samodzielnie, adekwatnie do tematu i poziomu.',
  },
  en: {
    jsonInstruction:
      'Respond ONLY with valid JSON matching the provided schema. ' +
      'Do not add any text before or after the JSON. Do not wrap the response in code blocks (``` or similar).',
    antiHallucinationRule:
      'IMPORTANT RULE: Do not include specific URLs or links to websites. ' +
      'In the "suggestedResourceTypes" field, describe only the TYPE and topic of the resource ' +
      '(e.g., "educational video about photosynthesis available on video platforms"), ' +
      'never an actual URL. Never fabricate links.',
    objectivesLabel: 'Learning objectives provided by the teacher (incorporate them into the lesson):',
    noObjectivesNote: 'Learning objectives: formulate them yourself, appropriate to the topic and level.',
  },
};

// ---------------------------------------------------------------------------
// Stara funkcja budująca prompt (zachowana dla kompatybilności)
// ---------------------------------------------------------------------------

export function buildLessonPrompt(params: LessonPromptParams): {
  system: string;
  prompt: string;
} {
  const { topic, subject, level, durationMinutes, objectives, language } = params;
  const L = LABELS[language];

  const system = [
    language === 'pl'
      ? 'Jesteś doświadczonym metodykiem i nauczycielem z wieloletnim stażem. ' +
        'Tworzysz materiały dydaktyczne najwyższej jakości, dostosowane do wieku i poziomu uczniów. ' +
        'Znasz podstawę programową i stosujesz sprawdzone techniki pedagogiczne.'
      : 'You are an experienced educational methodologist and teacher with many years of practice. ' +
        'You create high-quality teaching materials tailored to the age and level of students. ' +
        'You are familiar with the curriculum and apply proven pedagogical techniques.',

    '',
    L.jsonInstruction,
    '',
    L.antiHallucinationRule,
    '',
    language === 'pl'
      ? 'Schemat JSON, którego MUSISZ użyć jako odpowiedź:'
      : 'JSON schema you MUST use as your response:',
    LESSON_JSON_SHAPE,
    '',
    language === 'pl'
      ? 'Opis typów bloków: "intro" = wprowadzenie, "main" = rozwinięcie (może być wiele), ' +
        '"summary" = podsumowanie, "exercise" = ćwiczenie/zadanie dla uczniów.'
      : 'Block types: "intro" = introduction, "main" = main content (can repeat), ' +
        '"summary" = conclusion, "exercise" = student activity/task.',
  ].join('\n');

  let objectivesSection: string;
  if (objectives && objectives.length > 0) {
    const list = objectives.map((o, i) => `  ${i + 1}. ${o}`).join('\n');
    objectivesSection = `${L.objectivesLabel}\n${list}`;
  } else {
    objectivesSection = L.noObjectivesNote;
  }

  const prompt =
    language === 'pl'
      ? [
          `Wygeneruj kompletną lekcję na temat: "${topic}"`,
          `Przedmiot: ${subject}`,
          `Poziom / klasa: ${level}`,
          `Planowany czas trwania: ${durationMinutes} minut`,
          '',
          objectivesSection,
          '',
          'Zadbaj o:',
          '- Angażującą strukturę (wprowadzenie → rozwinięcie → podsumowanie + minimum 1 ćwiczenie)',
          '- Praktyczne pytania dla uczniów sprzyjające dyskusji',
          '- Wskazówki dla nauczyciela, jak poprowadzić każdy etap',
          `- Podział czasu: łączny czas bloków powinien wynosić około ${durationMinutes} minut`,
          '- Sugestie typów zasobów (bez URL!) wspierających lekcję',
        ].join('\n')
      : [
          `Generate a complete lesson on the topic: "${topic}"`,
          `Subject: ${subject}`,
          `Level / grade: ${level}`,
          `Planned duration: ${durationMinutes} minutes`,
          '',
          objectivesSection,
          '',
          'Ensure:',
          '- An engaging structure (intro → main content → summary + at least 1 exercise)',
          '- Practical student questions that encourage discussion',
          '- Teacher notes on how to lead each stage',
          `- Time allocation: total block duration should be approximately ${durationMinutes} minutes`,
          '- Suggestions for resource types (no URLs!) supporting the lesson',
        ].join('\n');

  return { system, prompt };
}

// ---------------------------------------------------------------------------
// Nowa funkcja budująca prompt 2.0 — powiązanie z podstawą programową
// ---------------------------------------------------------------------------

/**
 * Buduje prompt dla generatora lekcji 2.0.
 * Kluczowa zasada: wymagania podstawy programowej przekazywane są DOSŁOWNIE z bazy —
 * AI nie wymyśla wymagań, tylko z nich korzysta.
 */
export function buildCurriculumLessonPrompt(params: CurriculumLessonPromptParams): {
  system: string;
  prompt: string;
} {
  const {
    topic,
    subject,
    educationLevel,
    grade,
    lessonType,
    durationMinutes,
    difficulty,
    selectedRequirements,
    objectives,
  } = params;

  const hasRequirements = selectedRequirements.length > 0;

  const system = [
    'Jesteś asystentem nauczyciela. Tworzysz scenariusze lekcji zgodne z podstawą programową.',
    '',
    'ZASADY NIENARUSZALNE:',
    '1. NIE wymyślaj wymagań podstawy programowej — korzystaj WYŁĄCZNIE z wymagań przekazanych w sekcji WYMAGANIA PODSTAWY PROGRAMOWEJ.',
    '2. Jeśli brak wymagań, oznacz lekcję jako ogólną (curriculumLinked: false) i poinformuj w polu curriculumNote.',
    '3. W polu curriculumSources umieszczaj WYŁĄCZNIE wymagania z przekazanego kontekstu — dosłowne cytaty.',
    '4. Pisz konkretnie, w języku nauczyciela, dopasuj do wieku uczniów i czasu lekcji.',
    '5. Nie podawaj konkretnych adresów URL — opisuj typy zasobów.',
    '',
    'Odpowiedz WYŁĄCZNIE poprawnym JSON-em zgodnym z podanym schematem.',
    'Nie dodawaj żadnego tekstu przed ani po JSON-ie.',
    '',
    'Schemat JSON:',
    CURRICULUM_LESSON_JSON_SHAPE,
  ].join('\n');

  // Sekcja wymagań podstawy programowej
  let requirementsSection: string;
  if (hasRequirements) {
    const reqList = selectedRequirements
      .map((r, i) =>
        [
          `${i + 1}. ID: ${r.id}`,
          `   Dział: ${r.section_name}`,
          `   Typ: ${r.requirement_type}`,
          `   Treść: ${r.requirement_text}`,
          `   Podstawa prawna: ${r.legal_basis}`,
          `   Dokument: ${r.source_name}`,
          r.source_url ? `   URL: ${r.source_url}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
      )
      .join('\n\n');

    requirementsSection = [
      '=== WYMAGANIA PODSTAWY PROGRAMOWEJ (używaj WYŁĄCZNIE tych — nie wymyślaj innych) ===',
      reqList,
      '=== KONIEC WYMAGAŃ ===',
    ].join('\n');
  } else {
    requirementsSection = [
      '=== BRAK WYMAGAŃ PODSTAWY PROGRAMOWEJ ===',
      'Lekcja ogólna — brak wymagań z bazy. Ustaw curriculumLinked: false.',
      'W polu curriculumNote napisz: "Lekcja ogólna — nie znaleziono jednoznacznego wymagania w podstawie programowej."',
      'Pole curriculumSources pozostaw jako pusta tablica [].',
      '=== KONIEC ===',
    ].join('\n');
  }

  const prompt = [
    `Wygeneruj kompletny scenariusz lekcji.`,
    '',
    `Temat: "${topic}"`,
    `Przedmiot: ${subject}`,
    `Poziom edukacyjny: ${educationLevel}`,
    `Klasa: ${grade}`,
    `Typ lekcji: ${lessonType}`,
    `Czas trwania: ${durationMinutes} minut`,
    `Poziom trudności: ${difficulty}`,
    objectives ? `Cele dodatkowe od nauczyciela: ${objectives}` : '',
    '',
    requirementsSection,
    '',
    'Zadbaj o:',
    '- Kompletny podział na fazy z czasami (suma faz = czas lekcji)',
    '- Cele główne, operacyjne i w języku ucznia (NaCoBeZu)',
    '- Kryteria sukcesu (co uczeń będzie umiał po lekcji)',
    '- Metody aktywizujące dostosowane do tematu i wieku',
    '- Dostosowania SPE, dla zdolnych i wymagających wsparcia',
    '- Sekcja "Źródła i zgodność" TYLKO z przekazanych wymagań',
  ]
    .filter(Boolean)
    .join('\n');

  return { system, prompt };
}
