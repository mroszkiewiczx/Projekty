import { useTranslation } from 'react-i18next';
import type { LessonContent } from './schemas';

/** Prezentacja treści lekcji (współdzielona przez wynik generowania, podgląd i tryb prowadzenia). */
export function LessonView({ lesson }: { lesson: LessonContent }) {
  const { t } = useTranslation();

  return (
    <article className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-white">{lesson.title}</h2>
        <p className="mt-1 text-gray-400">{lesson.summary}</p>
      </header>

      <Section title={t('lessongen.result.objectives')}>
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-300">
          {lesson.objectives.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
      </Section>

      <Section title={t('lessongen.result.blocks')}>
        <div className="space-y-4">
          {lesson.blocks.map((b, i) => (
            <div key={i} className="rounded-lg border border-ink-600 p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-100">
                  <span className="mr-2 rounded bg-grape-500/15 px-2 py-0.5 text-xs text-grape-300">
                    {t(`lessongen.blockType.${b.type}`)}
                  </span>
                  {b.heading}
                </h4>
                <span className="text-xs text-gray-500">
                  {b.durationMinutes} {t('lessongen.result.minutes')}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-300">{b.content}</p>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Section title={t('lessongen.result.teacherNotes')}>
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-300">
            {lesson.teacherNotes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </Section>
        <Section title={t('lessongen.result.studentQuestions')}>
          <ul className="list-decimal space-y-1 pl-5 text-sm text-gray-300">
            {lesson.studentQuestions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </Section>
      </div>

      {lesson.suggestedResourceTypes.length > 0 && (
        <Section title={t('lessongen.result.resources')}>
          <ul className="flex flex-wrap gap-2">
            {lesson.suggestedResourceTypes.map((r, i) => (
              <li key={i} className="rounded bg-ink-700 px-2 py-1 text-xs text-gray-400">
                {r}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">{title}</h3>
      {children}
    </section>
  );
}
