// ============================================================
// src/pages/analytics/AnalyticsPage.tsx
// Strona statystyk nauczyciela
// ============================================================

import { useAuth } from '@/hooks/useAuth'
import { MainLayout } from '@/layouts/MainLayout'
import { AnalyticsDashboard } from '@/modules/analytics/AnalyticsDashboard'

export function AnalyticsPage() {
  const { user } = useAuth()
  const workspaceId = user?.workspaceId ?? ''

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-900">Statystyki nauki</h1>
          <p className="text-sm text-gray-500">
            Przegląd zaangażowania, postępu i wyników uczniów w Twoim workspace.
          </p>
        </div>

        {!workspaceId ? (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
            Brak przypisanego workspace. Skontaktuj się z administratorem.
          </div>
        ) : (
          <AnalyticsDashboard workspace_id={workspaceId} />
        )}
      </div>
    </MainLayout>
  )
}
