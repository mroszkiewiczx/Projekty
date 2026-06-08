// ============================================================
// src/modules/analytics/AnalyticsDashboard.tsx
// Główny dashboard statystyk — KPI + wykresy + tabele
// ============================================================

'use client'

import { useAnalytics } from '@/hooks/useAnalytics'
import { AnalyticsCard } from './AnalyticsCard'
import { TrendChart } from './TrendChart'
import { LessonMetricsTable } from './LessonMetricsTable'
import { StudentProgressTable } from './StudentProgressTable'

interface AnalyticsDashboardProps {
  workspace_id: string
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-gray-800">{title}</h3>
      {children}
    </div>
  )
}

function KpiSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />
      ))}
    </div>
  )
}

export function AnalyticsDashboard({ workspace_id }: AnalyticsDashboardProps) {
  const { data, isLoading, isError, error, refetch } = useAnalytics(workspace_id)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <KpiSkeleton />
        <div className="h-48 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <span>Nie udało się załadować statystyk: {error?.message}.</span>
        <button
          onClick={() => refetch()}
          className="font-semibold underline hover:no-underline"
        >
          Spróbuj ponownie
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title="Wszystkie lekcje"
          value={data.total_lessons}
          icon={
            <svg className="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          color="blue"
        />
        <AnalyticsCard
          title="Liczba uczniów"
          value={data.total_students}
          icon={
            <svg className="h-7 w-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          }
          color="green"
        />
        <AnalyticsCard
          title="Avg zaangażowanie"
          value={`${data.avg_engagement}%`}
          icon={
            <svg className="h-7 w-7 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          }
          color="yellow"
        />
        <AnalyticsCard
          title="Godzin nauki"
          value={data.total_learning_hours}
          unit="godzin łącznie"
          icon={
            <svg className="h-7 w-7 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="purple"
        />
      </div>

      {/* Trend */}
      <SectionCard title="Trend zaangażowania — ostatnie 30 dni">
        <TrendChart data={data.learning_trend} />
      </SectionCard>

      {/* Lekcje */}
      <SectionCard title="Najlepiej oceniane lekcje">
        <LessonMetricsTable lessons={data.top_lessons} />
      </SectionCard>

      {/* Uczniowie */}
      {data.total_students > 0 ? (
        <SectionCard title="Postep uczniow">
          <StudentProgressTable students={data.top_students} />
        </SectionCard>
      ) : (
        <SectionCard title="Postep uczniow">
          <p className="text-sm text-gray-400">
            Brak uczniow w tym workspace. Dodaj uczniow przez panel admina.
          </p>
        </SectionCard>
      )}
    </div>
  )
}
