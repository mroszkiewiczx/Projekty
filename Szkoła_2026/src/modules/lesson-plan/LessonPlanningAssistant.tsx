'use client';

// ============================================================
// src/modules/lesson-plan/LessonPlanningAssistant.tsx
// Asystent planowania lekcji z generowaniem AI (streaming)
// ============================================================

import { useState } from 'react';
import { generateLessonPlan } from '@/services/lesson-planner.service';
import type {
  LessonPlanningAssistantInput,
  LessonPlanningAssistance,
  TimingPhase,
} from '@/types/lesson-plan';

type ClassroomType = LessonPlanningAssistantInput['classroom_type'];

const CLASSROOM_LABELS: Record<ClassroomType, string> = {
  standard: 'Standardowa',
  lab: 'Laboratorium',
  auditorium: 'Aula',
  online: 'Online',
};

const DEFAULT_INPUT: Partial<LessonPlanningAssistantInput> = {
  num_students: 25,
  available_time: 45,
  classroom_type: 'standard',
  available_resources: [],
  grade: 1,
};

function ObjectivesSection({ objectives }: { objectives: string[] }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4 text-blue-700">Cele lekcji</h3>
      <ul className="space-y-2">
        {objectives.map((obj, i) => (
          <li key={i} className="flex items-start gap-3 text-gray-700">
            <span className="text-blue-500 font-bold mt-0.5">•</span>
            <span>{obj}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TimingSection({ phases }: { phases: TimingPhase[] }) {
  const total = phases.reduce((sum, p) => sum + p.duration, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4 text-blue-700">
        Harmonogram czasowy
        <span className="ml-2 text-sm font-normal text-gray-500">({total} min łącznie)</span>
      </h3>
      <div className="space-y-4">
        {phases.map((phase, i) => (
          <div key={i} className="border-l-4 border-blue-500 pl-4">
            <p className="font-semibold text-gray-800">
              {phase.phase}
              <span className="ml-2 text-sm font-normal text-gray-500">({phase.duration} min)</span>
            </p>
            <ul className="text-sm text-gray-600 mt-1 space-y-0.5">
              {phase.activities.map((act, j) => (
                <li key={j}>• {act}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimpleListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-bold mb-3 text-gray-800">{title}</h3>
      <ul className="space-y-1 text-sm text-gray-700">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlanResults({ plan }: { plan: LessonPlanningAssistance }) {
  return (
    <div className="space-y-6">
      <ObjectivesSection objectives={plan.suggested_objectives} />
      <TimingSection phases={plan.timing_breakdown} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SimpleListSection title="Materialy i zasoby" items={plan.materials_required} />
        <SimpleListSection title="Metody oceny" items={plan.assessment_methods} />
        <SimpleListSection title="Przygotowanie" items={plan.preparation_steps} />
        <SimpleListSection title="Strategie różnicowania" items={plan.differentiation_strategies} />
      </div>

      {plan.risk_mitigation.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="font-bold mb-3 text-amber-800">Potencjalne ryzyka i zapobieganie</h3>
          <ul className="space-y-1 text-sm text-amber-700">
            {plan.risk_mitigation.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5">⚠</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function LessonPlanningAssistant() {
  const [input, setInput] = useState<Partial<LessonPlanningAssistantInput>>(DEFAULT_INPUT);
  const [plan, setPlan] = useState<LessonPlanningAssistance | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateInput = <K extends keyof LessonPlanningAssistantInput>(
    key: K,
    value: LessonPlanningAssistantInput[K]
  ) => setInput((prev) => ({ ...prev, [key]: value }));

  const isFormValid =
    Boolean(input.lesson_title?.trim()) &&
    Boolean(input.subject?.trim()) &&
    Boolean(input.learning_goals?.trim());

  const handleGenerate = async () => {
    if (!isFormValid) return;

    setIsGenerating(true);
    setStreamBuffer('');
    setPlan(null);
    setErrorMessage(null);

    try {
      const result = await generateLessonPlan(
        input as LessonPlanningAssistantInput,
        (chunk) => setStreamBuffer((prev) => prev + chunk)
      );
      setPlan(result);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Nieznany błąd podczas generowania planu');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Asystent Planowania Lekcji</h1>
        <p className="text-gray-500 mt-1">Wypełnij formularz aby wygenerować szczegółowy plan lekcji</p>
      </div>

      {/* Formularz wejściowy */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tytuł lekcji <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="np. Fotosynteza u roślin"
              value={input.lesson_title ?? ''}
              onChange={(e) => updateInput('lesson_title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Przedmiot <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="np. Biologia"
              value={input.subject ?? ''}
              onChange={(e) => updateInput('subject', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cele nauczania <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Co uczniowie powinni wiedzieć/umieć po tej lekcji?"
            value={input.learning_goals ?? ''}
            onChange={(e) => updateInput('learning_goals', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Klasa</label>
            <input
              type="number"
              min={1}
              max={12}
              value={input.grade ?? ''}
              onChange={(e) => updateInput('grade', parseInt(e.target.value, 10))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Liczba uczniów</label>
            <input
              type="number"
              min={1}
              max={60}
              value={input.num_students ?? ''}
              onChange={(e) => updateInput('num_students', parseInt(e.target.value, 10))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Czas (min)</label>
            <input
              type="number"
              min={15}
              max={180}
              step={5}
              value={input.available_time ?? ''}
              onChange={(e) => updateInput('available_time', parseInt(e.target.value, 10))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sala</label>
            <select
              value={input.classroom_type ?? 'standard'}
              onChange={(e) => updateInput('classroom_type', e.target.value as ClassroomType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {(Object.keys(CLASSROOM_LABELS) as ClassroomType[]).map((type) => (
                <option key={type} value={type}>
                  {CLASSROOM_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !isFormValid}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? 'Generuję plan lekcji...' : 'Wygeneruj plan lekcji'}
        </button>

        {isGenerating && streamBuffer && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 max-h-28 overflow-auto font-mono whitespace-pre-wrap">
            {streamBuffer}
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Wyniki */}
      {plan && <PlanResults plan={plan} />}
    </div>
  );
}
