// ============================================================
// src/modules/analytics/StudentProgressTable.tsx
// Tabela postępu uczniów
// ============================================================

import type { StudentProgress } from '@/types/analytics'

interface StudentProgressTableProps {
  students: StudentProgress[]
}

function formatRelativeDate(date: Date): string {
  const d = date instanceof Date ? date : new Date(date)
  const diffMs = Date.now() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Dziś'
  if (diffDays === 1) return 'Wczoraj'
  return `${diffDays} dni temu`
}

function RateBar({ value }: { value: number }) {
  const color = value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      <span className="text-xs text-gray-600">{value}%</span>
    </div>
  )
}

export function StudentProgressTable({ students }: StudentProgressTableProps) {
  if (!students.length) {
    return <p className="text-sm text-gray-400">Brak danych o uczniach.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
            <th className="py-2 pr-4 text-left font-medium">Uczeń</th>
            <th className="py-2 pr-4 text-left font-medium">Ukończone</th>
            <th className="py-2 pr-4 text-left font-medium">Postęp</th>
            <th className="py-2 pr-4 text-left font-medium">Avg wynik</th>
            <th className="py-2 text-left font-medium">Ostatnia aktywność</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.student_id} className="border-b border-gray-50 hover:bg-gray-50/50">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {student.student_name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-900">{student.student_name}</span>
                </div>
              </td>
              <td className="py-3 pr-4 text-gray-600">
                {student.lessons_completed}/{student.total_lessons}
              </td>
              <td className="py-3 pr-4">
                <RateBar value={student.learning_rate} />
              </td>
              <td className="py-3 pr-4 text-gray-600">{student.avg_score}%</td>
              <td className="py-3 text-gray-400 text-xs">
                {formatRelativeDate(student.last_activity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
