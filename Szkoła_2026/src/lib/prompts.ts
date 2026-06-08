// Central AI Prompts System
// All AI prompts managed in one place to prevent drift

export const SYSTEM_PROMPTS = {
  LESSON_GENERATOR: `Jesteś ekspertem od tworzenia scenariuszy lekcji dla nauczycieli.
Twoje lekcje muszą:
- Być dostosowane do poziomu ucznia
- Zawierać konkretne cele nauczania
- Mieć logiczną strukturę (intro, główna część, ćwiczenia, podsumowanie)
- Zawierać praktyczne ćwiczenia
- Być realistyczne do przeprowadzenia w czasie lekcji
- Odwoływać się do podstawy programowej
- Używać prostego, zrozumiałego języka`,

  SYLLABUS_GENERATOR: `Jesteś ekspertem od tworzenia sylabusów szkolnych.
Syllabusy muszą:
- Pokrywać pełny rok szkolny (36 tygodni)
- Być wierny podstawie programowej
- Pokazać progresję nauczania
- Zawierać konkretne tematy na każdy tydzień
- Mieć jasne cele i efekty uczenia się
- Zawierać wskazówki oceny i pracy domowej`,

  QUIZ_GENERATOR: `Jesteś ekspertem od tworzenia quizów edukacyjnych.
Quizy muszą:
- Testować konkretne umiejętności z lekcji
- Mieć przejrzystą klucz odpowiedzi
- Zawierać objaśnienia do każdej odpowiedzi
- Być dopasowane do poziomu klasy
- Mieć różny poziom trudności`,

  TEST_GENERATOR: `Jesteś ekspertem od tworzenia sprawdzianów i testów szkolnych.
Sprawdziany muszą:
- Być rzetelne i sprawdzać rzeczywiste umiejętności
- Zawierać różne formaty zadań
- Mieć jasną rubrycę oceniania
- Być dopasowane do czasu lekcji
- Pokrywać pełny zakres materiału`,

  WORKSHEET_GENERATOR: `Jesteś ekspertem od tworzenia kart pracy dla uczniów.
Karty pracy muszą:
- Zawierać ćwiczenia praktyczne
- Być dostosowane do poziomu klasy
- Zawierać jasne instrukcje
- Mieć różne formaty ćwiczeń
- Być ukończalne w rozsądnym czasie`,

  PRESENTATION_GENERATOR: `Jesteś ekspertem od tworzenia prezentacji edukacyjnych.
Prezentacje muszą:
- Mieć jasną strukturę
- Zawierać skrót treści z lekcji
- Mieć możliwość rozszerzenia przez nauczyciela
- Zawierać pytania aktywizujące
- Być wizualnie zorganizowane`,

  EVALUATOR: `Jesteś ekspertem w ocenianiu materiałów edukacyjnych.
Oceniaj materiał na 8 wymiarów na skali 0-100:
1. Topical Alignment - czy temat jest dokładnie pokryty
2. Grade Appropriateness - czy materiał pasuje do klasy
3. Lesson Time Realism - czy można przeprowadzić w czasie
4. Objectives Quality - czy cele są jasne i mierzalne
5. Exercises Quality - czy ćwiczenia wspierają cele
6. Language Clarity - czy język jest zrozumiały
7. Structure & Flow - czy logiczny porządek
8. Engagement Potential - czy wciągający dla uczniów

Zwróć średnią ocenę i szczegółowe komentarze.`,
} as const

export const USER_PROMPTS = {
  LESSON_GENERATOR_TEMPLATE: `Wygeneruj scenariusz lekcji na temat: "{{topic}}"
Poziom edukacyjny: {{educationLevel}}
Klasa: {{grade}}
Przedmiot: {{subject}}
Czas trwania: {{duration}} minut

Wymagania z podstawy programowej (jeśli dostępne): {{curriculumRequirements}}

Dodatkowe informacje: {{teacherNotes}}

Wynik zwróć w formacie HTML z następującą strukturą:
<div class="lesson">
  <h1>Temat lekcji</h1>
  <section class="metadata">
    <!-- Metadane -->
  </section>
  <section class="objectives">
    <h2>Cele lekcji</h2>
    <!-- Lista celów -->
  </section>
  <section class="intro">
    <h2>Intro (5 minut)</h2>
    <!-- Treść -->
  </section>
  <section class="main">
    <h2>Część główna ({{mainDuration}} minut)</h2>
    <!-- Treść -->
  </section>
  <section class="exercises">
    <h2>Ćwiczenia ({{exerciseDuration}} minut)</h2>
    <!-- Ćwiczenia -->
  </section>
  <section class="summary">
    <h2>Podsumowanie (5 minut)</h2>
    <!-- Podsumowanie -->
  </section>
  <section class="resources">
    <h2>Zasoby</h2>
    <!-- Lista zasobów -->
  </section>
  <section class="homework">
    <h2>Praca domowa</h2>
    <!-- Praca domowa -->
  </section>
</div>`,

  SYLLABUS_GENERATOR_TEMPLATE: `Wygeneruj sylabus szkolny:
Przedmiot: {{subject}}
Klasa: {{grade}}
Rok szkolny: {{schoolYear}}
Liczba tygodni: {{weeks}}

Tematy do pokrycia:
{{topics}}

Dodatkowe wymagania:
{{additionalRequirements}}

Zwróć sylabus w formacie JSON:
{
  "subject": "{{subject}}",
  "grade": {{grade}},
  "weeks": [
    {
      "week": 1,
      "topic": "Temat tygodnia",
      "objectives": ["Cel 1", "Cel 2", "Cel 3"],
      "content": "Streszczenie treści",
      "activities": ["Aktywność 1", "Aktywność 2", "Aktywność 3"],
      "assessment": "Jak oceniać",
      "homework": "Praca domowa"
    },
    ...
  ]
}`,

  QUIZ_GENERATOR_TEMPLATE: `Wygeneruj quiz na temat: "{{topic}}"
Klasa: {{grade}}
Liczba pytań: {{count}}
Poziom trudności: {{difficulty}}

Zwróć quiz w formacie JSON:
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "question": "Pytanie",
      "options": ["A) Opcja 1", "B) Opcja 2", "C) Opcja 3", "D) Opcja 4"],
      "correctAnswer": "A",
      "points": 1,
      "explanation": "Wyjaśnienie odpowiedzi"
    },
    ...
  ],
  "totalPoints": {{count}}
}`,

  SHORTENER_TEMPLATE: `Skróć ten materiał do {{targetLength}} słów, zachowując kluczowe informacje:

Materiał:
{{content}}

Wymagania:
- Zachowaj najważniejsze informacje
- Usuń powtórzenia
- Skróć opisy
- Zachowaj strukturę`,

  SIMPLIFIER_TEMPLATE: `Uprość ten tekst na poziom {{targetLevel}}, zachowując znaczenie:

Tekst:
{{content}}

Wymagania:
- Użyj prostszych słów
- Skróć zdania
- Wyjaśnij skomplikowane koncepcje
- Dodaj przykłady jeśli to pomoże`,

  EXPANDER_TEMPLATE: `Rozszerz ten materiał o {{additionalInfo}}:

Materiał:
{{content}}

Wymagania:
- Dodaj szczegóły i przykłady
- Wyjaśnij skomplikowane pojęcia
- Dodaj praktyczne zastosowania
- Zachowaj strukturę`,

  EXERCISE_ADDER_TEMPLATE: `Dodaj ćwiczenia do tego materiału:

Materiał:
{{content}}

Wymagania:
- {{exerciseCount}} nowych ćwiczeń
- Poziom trudności: {{difficulty}}
- Typy: {{exerciseTypes}}
- Każde ćwiczenie powinno mieć klucz odpowiedzi`,

  STUDENT_VERSION_TEMPLATE: `Stwórz wersję dla ucznia z tego materiału nauczycielskiego:

Materiał nauczycielski:
{{content}}

Wymagania:
- Usuń odpowiedzi i wskazówki dla nauczyciela
- Zachowaj główną treść
- Dodaj miejsce na odpowiedzi
- Uproszcz jeśli to konieczne`,

  TEACHER_VERSION_TEMPLATE: `Stwórz wersję dla nauczyciela z wskazówkami do tego materiału:

Materiał:
{{content}}

Wymagania:
- Dodaj klucz odpowiedzi
- Dodaj wskazówki nauczycielskie
- Dodaj alternatywne wyjaśnienia
- Dodaj czas na każdy fragment`,
} as const

export type SystemPromptKey = keyof typeof SYSTEM_PROMPTS
export type UserPromptKey = keyof typeof USER_PROMPTS

export function getSystemPrompt(key: SystemPromptKey): string {
  return SYSTEM_PROMPTS[key]
}

export function getUserPromptTemplate(key: UserPromptKey): string {
  return USER_PROMPTS[key]
}

export function interpolatePrompt(template: string, variables: Record<string, string | number>): string {
  let result = template
  Object.entries(variables).forEach(([key, value]) => {
    const pattern = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(pattern, String(value))
  })
  return result
}

export function buildLessonGeneratorPrompt(params: {
  topic: string
  educationLevel: string
  grade: string
  subject: string
  duration: number
  curriculumRequirements?: string
  teacherNotes?: string
}): {
  system: string
  user: string
} {
  const userPrompt = interpolatePrompt(USER_PROMPTS.LESSON_GENERATOR_TEMPLATE, {
    topic: params.topic,
    educationLevel: params.educationLevel,
    grade: params.grade,
    subject: params.subject,
    duration: params.duration,
    curriculumRequirements: params.curriculumRequirements || 'Brak konkretnych wymagań',
    teacherNotes: params.teacherNotes || 'Brak dodatkowych notatek',
    mainDuration: Math.max(params.duration - 15, 10),
    exerciseDuration: 10,
  })

  return {
    system: SYSTEM_PROMPTS.LESSON_GENERATOR,
    user: userPrompt,
  }
}

export function buildSyllabusGeneratorPrompt(params: {
  subject: string
  grade: number
  schoolYear: string
  weeks: number
  topics: string[]
  additionalRequirements?: string
}): {
  system: string
  user: string
} {
  const topicsFormatted = params.topics.map((t, i) => `${i + 1}. ${t}`).join('\n')

  const userPrompt = interpolatePrompt(USER_PROMPTS.SYLLABUS_GENERATOR_TEMPLATE, {
    subject: params.subject,
    grade: params.grade,
    schoolYear: params.schoolYear,
    weeks: params.weeks,
    topics: topicsFormatted,
    additionalRequirements: params.additionalRequirements || 'Brak dodatkowych wymagań',
  })

  return {
    system: SYSTEM_PROMPTS.SYLLABUS_GENERATOR,
    user: userPrompt,
  }
}

export function buildQuizGeneratorPrompt(params: {
  topic: string
  grade: number
  count: number
  difficulty: 'easy' | 'medium' | 'hard'
}): {
  system: string
  user: string
} {
  const userPrompt = interpolatePrompt(USER_PROMPTS.QUIZ_GENERATOR_TEMPLATE, {
    topic: params.topic,
    grade: params.grade,
    count: params.count,
    difficulty: params.difficulty,
  })

  return {
    system: SYSTEM_PROMPTS.QUIZ_GENERATOR,
    user: userPrompt,
  }
}
