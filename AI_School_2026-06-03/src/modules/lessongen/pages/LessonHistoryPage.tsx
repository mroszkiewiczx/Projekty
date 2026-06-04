import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { listLessons, type LessonRecord } from '../lessonService';

export function LessonHistoryPage() {
  const { t } = useTranslation();
  const { activeWorkspace } = useWorkspace();
  const [lessons, setLessons] = useState<LessonRecord[] | null>(null);

  useEffect(() => {
    if (!activeWorkspace) return;
    void listLessons(activeWorkspace.id).then(setLessons);
  }, [activeWorkspace]);

  if (lessons === null) return <FullPageSpinner />;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{t('lessongen.history.title')}</h1>
        <Link to="/lessongen" className="text-sm text-grape-400 hover:underline">
          {t('common.back')}
        </Link>
      </div>

      {lessons.length === 0 ? (
        <p className="mt-6 text-sm text-gray-400">{t('lessongen.history.empty')}</p>
      ) : (
        <ul className="mt-6 divide-y divide-ink-700/60 rounded-2xl border border-ink-600/60 bg-ink-800/80 shadow-card backdrop-blur">
          {lessons.map((l) => (
            <li key={l.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-gray-100">{l.title}</p>
                <p className="text-xs text-gray-500">
                  {l.subject} · {l.target_group} · {t('lessongen.history.created')}:{' '}
                  {new Date(l.created_at).toLocaleString()}
                </p>
              </div>
              <Link
                to={`/lessongen/present/${l.id}`}
                className="rounded-md bg-grape-500/15 px-3 py-1.5 text-sm text-grape-300 hover:bg-ink-700/60"
              >
                {t('lessongen.history.open')}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
