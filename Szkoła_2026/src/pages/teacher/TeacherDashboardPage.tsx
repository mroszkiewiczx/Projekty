import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { useTeacherStats } from '@/hooks/useTeacherStats'
import { MainLayout } from '@/layouts/MainLayout'
import { Card, CardHeader, CardContent, CardTitle, CardDescription, Button } from '@/components/ui'
import { Loading } from '@/components/ui/Loading'
import { MaterialCard } from '@/components/library'

// ─── Stats skeleton ────────────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${className ?? ''}`} />
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <SkeletonBlock className="mb-3 h-4 w-28" />
          <SkeletonBlock className="h-10 w-16" />
        </div>
      ))}
    </div>
  )
}

function MaterialsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
          <SkeletonBlock className="h-4 w-20 rounded-full" />
          <SkeletonBlock className="h-5 w-full" />
          <SkeletonBlock className="h-4 w-3/4" />
          <SkeletonBlock className="h-3 w-24" />
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TeacherDashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { stats, isLoading, isError, error, refetch } = useTeacherStats()

  const firstName = user?.name?.split(' ')[0] ?? 'Nauczycielu'

  return (
    <MainLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Witaj, {firstName}!
            </h1>
            <p className="mt-1 text-gray-600">
              {new Intl.DateTimeFormat('pl-PL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }).format(new Date())}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm" onClick={() => navigate('/library')}>
              {t('library.title', 'Biblioteka')}
            </Button>
            <Button size="sm" onClick={() => navigate('/lesson/generator')}>
              + Nowa lekcja
            </Button>
          </div>
        </div>

        {/* Error banner */}
        {isError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <span>
              Nie udało się załadować danych statystyk: {error?.message}.{' '}
              <button
                onClick={() => refetch()}
                className="font-semibold underline hover:no-underline"
              >
                Spróbuj ponownie
              </button>
            </span>
          </div>
        )}

        {/* Stats Grid */}
        {isLoading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    {t('dashboard.materialsGenerated', 'Wygenerowane materiały')}
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats?.materialsGenerated ?? 0}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    {t('dashboard.materialsThisMonth', 'Materiały w tym miesiącu')}
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats?.materialsThisMonth ?? 0}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    {t('dashboard.averageQuality', 'Średnia jakość')}
                  </p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {stats?.averageQuality ? stats.averageQuality.toFixed(1) : '—'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Ostatnia lekcja</p>
                  <p className="text-lg font-bold text-purple-600">
                    {stats?.lastGenerated
                      ? new Intl.DateTimeFormat('pl-PL', {
                          day: 'numeric',
                          month: 'short',
                        }).format(
                          stats.lastGenerated instanceof Date
                            ? stats.lastGenerated
                            : new Date(stats.lastGenerated)
                        )
                      : '—'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Materials */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {t('dashboard.recentMaterials', 'Ostatnie materiały')}
                </CardTitle>
                <CardDescription>
                  Twoje ostatnio wygenerowane lekcje
                </CardDescription>
              </div>
              {(stats?.materialsGenerated ?? 0) > 5 && (
                <Button variant="secondary" size="sm" onClick={() => navigate('/library')}>
                  {t('dashboard.viewAll', 'Wyświetl wszystkie')}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <MaterialsSkeleton />
            ) : stats && stats.recentMaterials.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stats.recentMaterials.map(material => (
                  <MaterialCard
                    key={material.id}
                    id={material.id}
                    title={material.title}
                    description={material.topic}
                    type="lesson"
                    author={user?.name ?? 'Ty'}
                    createdAt={
                      material.generatedAt instanceof Date
                        ? material.generatedAt.toISOString()
                        : String(material.generatedAt)
                    }
                    rating={material.qualityScore}
                    onSelect={id => navigate(`/lesson/${id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-gray-50 px-4 py-10 text-center">
                <svg
                  className="mx-auto mb-4 h-12 w-12 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
                <p className="font-medium text-gray-600">Nie masz jeszcze żadnych lekcji</p>
                <p className="mt-1 text-sm text-gray-400">
                  Wygeneruj swoją pierwszą lekcję korzystając z AI
                </p>
                <Button
                  className="mt-4"
                  onClick={() => navigate('/lesson/generator')}
                >
                  Wygeneruj pierwszą lekcję
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Szybkie akcje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/lesson/generator')}
              >
                Nowa lekcja
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/library')}
              >
                Biblioteka materiałów
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled
              >
                Zarządzaj klasami
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </MainLayout>
  )
}
