import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { downloadLessonDocx } from '@/lib/exporters/lessonDocxExporter';
import { LessonView } from '../LessonView';
import { getLesson, type LessonRecord } from '../lessonService';

/**
 * Tryb prowadzenia lekcji: pełny podgląd zapisanej lekcji + eksport DOCX.
 * Realny widok danych z bazy (RLS chroni dostęp do cudzych lekcji).
 */
export function LessonPresentPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<LessonRecord | null | 'notfound'>(null);

  useEffect(() => {
    if (!id) return;
    void getLesson(id).then((l) => setLesson(l ?? 'notfound'));
  }, [id]);

  if (lesson === null) return <FullPageSpinner />;
  if (lesson === 'notfound') {
    return (
      <div className="max-w-4xl">
        <p className="text-sm text-gray-400">{t('common.error')}</p>
        <Link to="/lessongen/history" className="text-sm text-grape-400 hover:underline">
          {t('common.back')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <Link to="/lessongen/history" className="text-sm text-grape-400 hover:underline">
          {t('common.back')}
        </Link>
        <Button
          variant="secondary"
          onClick={() =>
            void downloadLessonDocx(
              lesson.content,
              {
                subject: lesson.subject ?? undefined,
                level: lesson.target_group ?? undefined,
                durationMinutes: lesson.duration_minutes ?? undefined,
                generatedAt: lesson.created_at,
              },
              `lekcja-${lesson.title.slice(0, 30)}.docx`,
            )
          }
        >
          {t('lessongen.result.exportDocx')}
        </Button>
      </div>
      <div className="card p-6">
        <LessonView lesson={lesson.content} />
      </div>
    </div>
  );
}
