import { useState } from 'react'
import { MainLayout } from '@/layouts/MainLayout'
import { useLessonGenerator } from '@/hooks/generators/useLessonGenerator'
import { ExportButtons } from '@/modules/export/ExportButtons'
import type { LessonGeneratorInput } from '@/types/lesson'

const SUBJECTS = [
  'Matematyka',
  'Fizyka',
  'Chemia',
  'Biologia',
  'Historia',
  'Geografia',
  'Jezyk polski',
  'Jezyk angielski',
  'Jezyk niemiecki',
  'Informatyka',
  'Muzyka',
  'Plastyka',
  'Wychowanie fizyczne',
] as const

const EDUCATION_LEVELS = [
  { value: 'podstawowa' as const, label: 'Szkola podstawowa' },
  { value: 'gimnazjum' as const, label: 'Gimnazjum' },
  { value: 'liceum' as const, label: 'Liceum / Technikum' },
]

interface FormState {
  topic: string
  subject: string
  educationLevel: 'podstawowa' | 'gimnazjum' | 'liceum'
  grade: number
  duration: number
}

function ScoreBar({ value, max = 10 }: { value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100)
  const color = pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function LessonGeneratorPageV2() {
  const [form, setForm] = useState<FormState>({
    topic: '',
    subject: 'Matematyka',
    educationLevel: 'podstawowa',
    grade: 7,
    duration: 45,
  })

  const { lesson, score, isGenerating, progress, error, generate, improve, reset } =
    useLessonGenerator()

  const handleGenerate = () => {
    const input: LessonGeneratorInput = {
      topic: form.topic,
      subject: form.subject,
      educationLevel: form.educationLevel,
      grade: form.grade,
      duration: form.duration / 60,
      objectives: [],
    }
    void generate(input)
  }

  const handleImprove = () => {
    const feedback = window.prompt('Jakie ulepszenie oczekujesz?')
    if (feedback) void improve(feedback)
  }

  const lessonContent = lesson?.content
    ? (() => {
        if (typeof lesson.content === 'string') {
          try {
            return JSON.parse(lesson.content) as Record<string, unknown>
          } catch {
            return null
          }
        }
        return lesson.content as Record<string, unknown>
      })()
    : null

  const activities = Array.isArray(lessonContent?.activities)
    ? (lessonContent?.activities as Array<{
        name: string
        duration: number
        description: string
        materials?: string[]
      }>)
    : []

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generator Lekcji AI v2</h1>
          <p className="mt-1 text-sm text-gray-500">
            Wygeneruj lekcje z ocena jakosci i eksportem do PDF / DOCX
          </p>
        </div>

        {/* FORMULARZ */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-800">Parametry lekcji</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Temat lekcji <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                placeholder="np. Fotosynteza, Rownania kwadratowe..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Przedmiot</label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Poziom edukacji
              </label>
              <select
                value={form.educationLevel}
                onChange={(e) =>
                  setForm({
                    ...form,
                    educationLevel: e.target.value as FormState['educationLevel'],
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {EDUCATION_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Klasa</label>
              <input
                type="number"
                value={form.grade}
                min={1}
                max={8}
                onChange={(e) => setForm({ ...form, grade: parseInt(e.target.value) || 1 })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Czas trwania (minuty)
              </label>
              <input
                type="number"
                value={form.duration}
                min={30}
                max={180}
                step={5}
                onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 45 })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !form.topic.trim()}
            className="mt-6 w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? 'Generowanie...' : 'Wygeneruj Lekcje AI'}
          </button>

          {progress && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              {progress}
            </div>
          )}

          {error && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* WYNIK */}
        {lesson && (
          <div className="space-y-6">
            {/* OCENA JAKOSCI */}
            {score && (
              <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-blue-50 p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-gray-800">Ocena jakosci</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                  <div className="sm:col-span-1">
                    <div className="text-3xl font-bold text-green-600">{score.overall}</div>
                    <div className="text-xs text-gray-500">Ogolnie /10</div>
                    <ScoreBar value={score.overall} />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-800">{score.topicalAlignment}</div>
                    <div className="text-xs text-gray-500">Zgodnosc tematu</div>
                    <ScoreBar value={score.topicalAlignment} />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-800">{score.gradeAppropriate}</div>
                    <div className="text-xs text-gray-500">Dla klasy</div>
                    <ScoreBar value={score.gradeAppropriate} />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-800">{score.objectives}</div>
                    <div className="text-xs text-gray-500">Cele</div>
                    <ScoreBar value={score.objectives} />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-800">{score.engagement}</div>
                    <div className="text-xs text-gray-500">Zaangazowanie</div>
                    <ScoreBar value={score.engagement} />
                  </div>
                </div>
                {score.feedback && (
                  <div className="mt-4 rounded-lg border border-blue-200 bg-white px-4 py-3 text-sm text-gray-700">
                    <span className="font-medium text-blue-700">Feedback AI: </span>
                    {score.feedback}
                  </div>
                )}
              </div>
            )}

            {/* TRESC LEKCJI */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-1 text-xl font-bold text-gray-900">{lesson.title}</h2>
              <p className="mb-6 text-sm text-gray-500">
                {lesson.topic} | Klasa {form.grade} | {form.duration} min
              </p>

              <div className="space-y-6">
                {lesson.objectives.length > 0 && (
                  <section>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
                      Cele lekcji
                    </h3>
                    <ul className="space-y-1">
                      {lesson.objectives.map((obj, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="mt-0.5 shrink-0 text-green-500">&#10003;</span>
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {typeof lessonContent?.introduction === 'string' && (
                  <section>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
                      Wstep
                    </h3>
                    <p className="text-sm text-gray-700">{lessonContent.introduction}</p>
                  </section>
                )}

                {Array.isArray(lessonContent?.mainContent) &&
                  (lessonContent.mainContent as string[]).length > 0 && (
                    <section>
                      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
                        Tresc glowna
                      </h3>
                      {(lessonContent.mainContent as string[]).map((c, i) => (
                        <p key={i} className="mb-2 text-sm text-gray-700">
                          {c}
                        </p>
                      ))}
                    </section>
                  )}

                {activities.length > 0 && (
                  <section>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
                      Aktywnosci
                    </h3>
                    <div className="space-y-3">
                      {activities.map((activity, i) => (
                        <div
                          key={i}
                          className="rounded-lg border-l-4 border-blue-400 bg-blue-50 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-900">
                              {activity.name}
                            </span>
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                              {activity.duration} min
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
                          {activity.materials && activity.materials.length > 0 && (
                            <p className="mt-1 text-xs text-gray-400">
                              Materialy: {activity.materials.join(', ')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {typeof lessonContent?.conclusion === 'string' && (
                  <section>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
                      Podsumowanie
                    </h3>
                    <p className="text-sm text-gray-700">{lessonContent.conclusion}</p>
                  </section>
                )}

                {typeof lessonContent?.homework === 'string' && (
                  <section>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
                      Praca domowa
                    </h3>
                    <p className="text-sm text-gray-700">{lessonContent.homework}</p>
                  </section>
                )}
              </div>

              {/* AKCJE */}
              <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-6">
                <ExportButtons
                  lesson={{
                    id: lesson.id,
                    title: lesson.title,
                    topic: lesson.topic,
                    subject: form.subject,
                    grade: form.grade,
                    content: lesson.content,
                    qualityScore: score?.overall,
                    createdAt: new Date(),
                    createdBy: 'ai-generator',
                  }}
                />

                <button
                  onClick={handleImprove}
                  disabled={isGenerating}
                  className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-800 transition-colors hover:bg-yellow-100 disabled:opacity-50"
                >
                  Ulepsz lekcje
                </button>

                <button
                  onClick={reset}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Nowa lekcja
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
