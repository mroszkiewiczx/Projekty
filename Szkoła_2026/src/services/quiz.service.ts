// Quiz generator service — generowanie quizów przez AI i obliczanie wyników

import { generateWithAnthropic } from '@/services/ai/anthropic';
import type { Quiz, QuizGeneratorInput, QuizQuestion, QuizResult } from '@/types/quiz';

interface RawQuestion {
  type?: string;
  question: string;
  options?: string[];
  correctAnswer?: string | boolean;
  explanation?: string;
  difficulty?: string;
  points?: number;
}

interface GeneratedQuizJson {
  questions: RawQuestion[];
}

export async function generateQuiz(input: QuizGeneratorInput): Promise<Quiz> {
  const prompt = buildQuizPrompt(input);

  const response = await generateWithAnthropic(prompt, { maxTokens: 3000 });

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Brak JSON w odpowiedzi AI');

  let quizData: GeneratedQuizJson;
  try {
    quizData = JSON.parse(jsonMatch[0]) as GeneratedQuizJson;
  } catch (err) {
    throw new Error(`Nie udało się sparsować quizu: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!Array.isArray(quizData.questions)) {
    throw new Error('Odpowiedź AI nie zawiera tablicy pytań');
  }

  const now = new Date().toISOString();
  const questions: QuizQuestion[] = quizData.questions.map(
    (q: RawQuestion, idx: number): QuizQuestion => ({
      id: `q-${Date.now()}-${idx}`,
      type: isValidQuestionType(q.type) ? q.type : 'multiple_choice',
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: isValidDifficulty(q.difficulty) ? q.difficulty : 'medium',
      points: typeof q.points === 'number' && q.points > 0 ? q.points : 10,
    })
  );

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return {
    id: `quiz-${Date.now()}`,
    lesson_id: input.lesson_id,
    title: input.lesson_title ? `Quiz: ${input.lesson_title}` : 'Wygenerowany quiz',
    description: `Quiz wygenerowany automatycznie — ${questions.length} pytań`,
    questions,
    totalPoints,
    timeLimit: Math.ceil(questions.length * 2),
    passingScore: 70,
    created_at: now,
    updated_at: now,
  };
}

export function calculateQuizScore(
  quiz: Quiz,
  answers: Record<string, string | boolean>
): QuizResult {
  let score = 0;

  quiz.questions.forEach((q) => {
    const userAnswer = answers[q.id];
    // eslint-disable-next-line eqeqeq
    if (userAnswer !== undefined && (userAnswer === q.correctAnswer || userAnswer == q.correctAnswer)) {
      score += q.points;
    }
  });

  const percentage = quiz.totalPoints > 0
    ? Math.round((score / quiz.totalPoints) * 100)
    : 0;

  return {
    quiz_id: quiz.id,
    user_id: 'current-user',
    score,
    totalPoints: quiz.totalPoints,
    percentage,
    passed: percentage >= quiz.passingScore,
    answers,
    completedAt: new Date().toISOString(),
  };
}

// ---- helpers ----------------------------------------------------------------

function isValidQuestionType(value: unknown): value is 'multiple_choice' | 'true_false' | 'short_answer' {
  return value === 'multiple_choice' || value === 'true_false' || value === 'short_answer';
}

function isValidDifficulty(value: unknown): value is 'easy' | 'medium' | 'hard' {
  return value === 'easy' || value === 'medium' || value === 'hard';
}

function buildQuizPrompt(input: QuizGeneratorInput): string {
  return `
Wygeneruj quiz JSON z ${input.numQuestions} pytaniami dla lekcji:
Tytuł: ${input.lesson_title}

Treść lekcji:
${input.lesson_content}

Wymagania:
- Poziom trudności: ${input.difficulty}
- Typy pytań: ${input.questionTypes.join(', ')}
- Każde pytanie musi mieć punkty (5–15)
- Dołącz wyjaśnienia poprawnych odpowiedzi
- Język: polski

Zwróć TYLKO JSON (bez dodatkowego tekstu):
{
  "questions": [
    {
      "type": "multiple_choice",
      "question": "treść pytania",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "wyjaśnienie",
      "difficulty": "medium",
      "points": 10
    }
  ]
}

Dla true_false: pomiń "options", correctAnswer to true lub false (boolean).
Dla short_answer: pomiń "options", correctAnswer to krótki ciąg tekstowy.
`.trim();
}
