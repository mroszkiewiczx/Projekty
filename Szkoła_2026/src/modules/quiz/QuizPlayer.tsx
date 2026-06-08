'use client';

import { useState } from 'react';
import type { Quiz, QuizResult } from '@/types/quiz';
import { calculateQuizScore } from '@/services/quiz.service';

interface QuizPlayerProps {
  quiz: Quiz;
  onComplete: (result: QuizResult) => void;
}

export function QuizPlayer({ quiz, onComplete }: QuizPlayerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const currentQuestion = quiz.questions[currentIdx];
  const isLast = currentIdx === quiz.questions.length - 1;
  const progress = Math.round(((currentIdx + 1) / quiz.questions.length) * 100);
  const currentAnswer = answers[currentQuestion.id];

  const handleAnswer = (value: string | boolean) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const handleNext = () => {
    if (isLast) {
      const quizResult = calculateQuizScore(quiz, answers);
      setResult(quizResult);
      setFinished(true);
      onComplete(quizResult);
    } else {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  if (finished && result) {
    return <QuizResults result={result} quiz={quiz} />;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Pasek postępu */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Pytanie {currentIdx + 1} z {quiz.questions.length}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Pytanie */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded">
            {labelForType(currentQuestion.type)}
          </span>
          <span className="text-xs text-gray-400">{currentQuestion.points} pkt</span>
        </div>

        <h3 className="text-lg font-semibold mb-4">{currentQuestion.question}</h3>

        {currentQuestion.type === 'multiple_choice' && (
          <div className="space-y-2">
            {currentQuestion.options?.map((option, idx) => (
              <label
                key={idx}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                  currentAnswer === option
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  checked={currentAnswer === option}
                  onChange={() => handleAnswer(option)}
                  className="mr-3 accent-blue-600"
                />
                {option}
              </label>
            ))}
          </div>
        )}

        {currentQuestion.type === 'true_false' && (
          <div className="flex gap-4">
            {([true, false] as const).map((val) => (
              <button
                key={String(val)}
                onClick={() => handleAnswer(val)}
                className={`flex-1 py-3 rounded-lg font-semibold transition ${
                  currentAnswer === val
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {val ? 'Prawda' : 'Fałsz'}
              </button>
            ))}
          </div>
        )}

        {currentQuestion.type === 'short_answer' && (
          <input
            type="text"
            value={typeof currentAnswer === 'string' ? currentAnswer : ''}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder="Wpisz odpowiedź..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
      </div>

      {/* Nawigacja */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentIdx === 0}
          className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 disabled:opacity-40 hover:bg-gray-300 transition"
        >
          Poprzednie
        </button>
        <button
          onClick={handleNext}
          disabled={currentAnswer === undefined}
          className="px-5 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-700 transition"
        >
          {isLast ? 'Zakończ quiz' : 'Następne'}
        </button>
      </div>
    </div>
  );
}

// ---- QuizResults -----------------------------------------------------------

interface QuizResultsProps {
  result: QuizResult;
  quiz: Quiz;
}

function QuizResults({ result, quiz }: QuizResultsProps) {
  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <div className="bg-white rounded-xl shadow p-8">
        <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
        <p className="text-gray-500 mb-6">Quiz zakończony</p>

        <div
          className={`text-7xl font-extrabold mb-4 ${
            result.passed ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {result.percentage}%
        </div>

        <p className={`text-xl font-semibold mb-2 ${result.passed ? 'text-green-600' : 'text-red-500'}`}>
          {result.passed ? 'Zaliczono!' : 'Nie zaliczono'}
        </p>

        <p className="text-gray-600 mb-6">
          Wynik: {result.score} / {result.totalPoints} punktów
          <span className="ml-2 text-sm text-gray-400">(próg: {quiz.passingScore}%)</span>
        </p>

        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Powrót
        </button>
      </div>
    </div>
  );
}

// ---- utils -----------------------------------------------------------------

function labelForType(type: string): string {
  const map: Record<string, string> = {
    multiple_choice: 'Jednokrotny wybór',
    true_false: 'Prawda / Fałsz',
    short_answer: 'Krótka odpowiedź',
  };
  return map[type] ?? type;
}
