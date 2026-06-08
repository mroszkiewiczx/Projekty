// ============================================================
// src/modules/analytics/LessonMetricsTable.tsx
// Tabela najlepszych lekcji z metrykami
// ============================================================

import type { LessonMetrics } from '@/types/analytics'

interface LessonMetricsTableProps {
  lessons: LessonMetrics[]
}

const sentimentLabel: Record<LessonMetrics['feedback_sentiment'], string> = {
  positive: 'Pozytywne',
  neutral:  'Neutralne',
  negative: 'Negatywne',
  none:     '—',
}

const sentimentColor: Record<LessonMetrics['feedback_sentiment'], string> = {
  positive: 'text-green-700 bg-green-50',
  neutral:  'text-yellow-700 bg-yellow-50',
  negative: 'text-red-700 bg-red-50',
  none:     'text-gray-400 bg-gray-50',
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-blue-500"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <span className="text-xs text-gray-600">{value}%</span>
    </div>
  )
}

export function LessonMetricsTable({ lessons }: LessonMetricsTableProps) {
  if (!lessons.length) {
    return <p className="text-sm text-gray-400">Brak lekcji do wyświetlenia.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
            <th className="py-2 pr-4 text-left font-medium">Lekcja</th>
            <th className="py-2 pr-4 text-left font-medium">Uczniów</th>
            <th className="py-2 pr-4 text-left font-medium">Ukończenie</th>
            <th className="py-2 pr-4 text-left font-medium">Zaangażowanie</th>
            <th className="py-2 pr-4 text-left font-medium">Czas (min)</th>
            <th className="py-2 text-left font-medium">Feedback</th>
          </tr>
        </thead>
        <tbody>
          {lessons.map((lesson) => (
            <tr key={lesson.lesson_id} className="border-b border-gray-50 hover:bg-gray-50/50">
              <td className="py-3 pr-4 font-medium text-gray-900 max-w-[200px] truncate">
                {lesson.lesson_title}
              </td>
              <td className="py-3 pr-4 text-gray-600">{lesson.students_count}</td>
              <td className="py-3 pr-4">
                <ProgressBar value={lesson.completion_rate} />
              </td>
              <td className="py-3 pr-4">
                <ProgressBar value={lesson.avg_engagement_score} />
              </td>
              <td className="py-3 pr-4 text-gray-600">{lesson.avg_time_spent}</td>
              <td className="py-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${sentimentColor[lesson.feedback_sentiment]}`}>
                  {sentimentLabel[lesson.feedback_sentiment]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
