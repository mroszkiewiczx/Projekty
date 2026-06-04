/**
 * CurriculumLessonView.tsx — widok lekcji 2.0 powiązanej z podstawą programową.
 * Wyświetla pełną strukturę: metadane, cele, przebieg, dostosowania, źródła.
 */

import { useTranslation } from 'react-i18next';
import { CheckCircle2, BookOpen, AlertTriangle } from 'lucide-react';
import type { CurriculumLessonContent } from './schemas';

interface CurriculumLessonViewProps {
  lesson: CurriculumLessonContent;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-grape-400">{title}</h3>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={`bullet-${i}`} className="flex items-start gap-2 text-sm text-gray-200">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-grape-400" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function CurriculumLessonView({ lesson }: CurriculumLessonViewProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Nagłówek */}
      <div className="border-b border-ink-700 pb-4">
        <h2 className="text-xl font-bold text-white">{lesson.title}</h2>
        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
          <span>{lesson.subject}</span>
          <span>·</span>
          <span>{lesson.educationLevel}</span>
          <span>·</span>
          <span>{lesson.grade}</span>
          <span>·</span>
          <span>{lesson.durationMinutes} min</span>
          <span>·</span>
          <span>{lesson.lessonType}</span>
        </div>
        {lesson.curriculumLinked ? (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-green-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {t('lessongen.result.curriculumLinked')}
          </div>
        ) : (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            {t('lessongen.result.curriculumNotLinked')}
          </div>
        )}
      </div>

      {/* Cele */}
      <Section title={t('lessongen.result.mainObjectives')}>
        <BulletList items={lesson.mainObjectives} />
      </Section>

      <Section title={t('lessongen.result.operationalObjectives')}>
        <BulletList items={lesson.operationalObjectives} />
      </Section>

      <Section title={t('lessongen.result.objectivesInStudentLanguage')}>
        <BulletList items={lesson.objectivesInStudentLanguage} />
      </Section>

      <Section title={t('lessongen.result.successCriteria')}>
        <BulletList items={lesson.successCriteria} />
      </Section>

      {/* Metody i materiały */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Section title={t('lessongen.result.teachingMethods')}>
          <BulletList items={lesson.teachingMethods} />
        </Section>
        <Section title={t('lessongen.result.didacticMaterials')}>
          <BulletList items={lesson.didacticMaterials} />
        </Section>
      </div>

      {/* Przebieg lekcji */}
      <Section title={t('lessongen.result.lessonFlow')}>
        <div className="space-y-3">
          {lesson.phases.map((phase, i) => (
            <div key={`phase-${i}`} className="rounded-xl bg-ink-800 border border-ink-700 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">{phase.name}</span>
                <span className="text-xs text-gray-400">{phase.durationMinutes} min</span>
              </div>
              <p className="text-sm text-gray-300">{phase.description}</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm">
                <div>
                  <span className="text-xs font-medium text-gray-400">
                    {t('lessongen.result.teacherActivity')}
                  </span>
                  <p className="mt-0.5 text-gray-200">{phase.teacherActivity}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-400">
                    {t('lessongen.result.studentActivity')}
                  </span>
                  <p className="mt-0.5 text-gray-200">{phase.studentActivity}</p>
                </div>
              </div>
              {phase.materials.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {phase.materials.map((mat, j) => (
                    <span
                      key={`mat-${j}`}
                      className="rounded-full bg-ink-700 px-2 py-0.5 text-xs text-gray-300"
                    >
                      {mat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Zadanie domowe */}
      {lesson.homework && (
        <Section title={t('lessongen.result.homework')}>
          <p className="text-sm text-gray-200">{lesson.homework}</p>
        </Section>
      )}

      {/* Dostosowania */}
      <Section title={t('lessongen.result.adaptations')}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-ink-800 p-3">
            <p className="text-xs font-medium text-gray-400">SPE</p>
            <p className="mt-1 text-sm text-gray-200">{lesson.adaptations.spe}</p>
          </div>
          <div className="rounded-lg bg-ink-800 p-3">
            <p className="text-xs font-medium text-gray-400">{t('lessongen.result.gifted')}</p>
            <p className="mt-1 text-sm text-gray-200">{lesson.adaptations.gifted}</p>
          </div>
          <div className="rounded-lg bg-ink-800 p-3">
            <p className="text-xs font-medium text-gray-400">{t('lessongen.result.support')}</p>
            <p className="mt-1 text-sm text-gray-200">{lesson.adaptations.support}</p>
          </div>
        </div>
      </Section>

      {/* Notatki dla nauczyciela */}
      {lesson.teacherNotes.length > 0 && (
        <Section title={t('lessongen.result.teacherNotes')}>
          <BulletList items={lesson.teacherNotes} />
        </Section>
      )}

      {/* Sekcja: Źródła i zgodność z podstawą programową */}
      <Section title={t('lessongen.result.curriculumSources')}>
        <div className="rounded-xl border border-grape-400/20 bg-grape-400/5 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-grape-400" />
            <p className="text-sm text-gray-300">{lesson.curriculumNote}</p>
          </div>
          {lesson.curriculumSources.length > 0 && (
            <div className="space-y-2">
              {lesson.curriculumSources.map((src, i) => (
                <div key={`src-${i}`} className="rounded-lg bg-ink-800 p-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-grape-400">{src.sectionName}</span>
                    <span className="text-gray-500">·</span>
                    <span className="text-gray-400">{src.sourceName}</span>
                    <span className="text-gray-500">·</span>
                    <span className="text-gray-400">{src.legalBasis}</span>
                    {src.sourceUrl && (
                      <>
                        <span className="text-gray-500">·</span>
                        <a
                          href={src.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-grape-400 hover:underline"
                        >
                          {t('lessongen.result.sourceLink')}
                        </a>
                      </>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm text-gray-200">{src.requirementText}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
