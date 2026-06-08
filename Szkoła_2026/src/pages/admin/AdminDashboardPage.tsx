import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardContent, CardTitle, CardDescription, Button } from '@/components/ui'

interface AdminStats {
  totalTeachers: number
  totalStudents: number
  totalMaterials: number
  systemHealth: number
}

const mockStats: AdminStats = {
  totalTeachers: 24,
  totalStudents: 487,
  totalMaterials: 156,
  systemHealth: 98,
}

export default function AdminDashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [stats] = useState<AdminStats>(mockStats)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">Szkoła 2026 - Panel admina</h1>
            <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
              Wyloguj
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel administratora</h1>
            <p className="mt-1 text-gray-600">Zarządzaj nauczycielami, uczniami i materiałami</p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Nauczyciele</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalTeachers}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Uczniowie</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalStudents}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Materiały</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.totalMaterials}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">System Health</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.systemHealth}%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Management Sections */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Teachers Management */}
            <Card>
              <CardHeader>
                <CardTitle>Zarządzanie nauczycielami</CardTitle>
                <CardDescription>
                  {stats.totalTeachers} aktywnych nauczycieli
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                  • Ostatnia aktualizacja: dzisiaj
                  <br />
                  • Aktywnych: {stats.totalTeachers}
                  <br />
                  • Nowych tego miesiąca: 3
                </div>
                <Button onClick={() => navigate('/admin/teachers')} variant="secondary" className="w-full">
                  Zarządzaj nauczycielami
                </Button>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Ustawienia szkoły</CardTitle>
                <CardDescription>Konfiguracja i zaawansowane opcje</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                  • Język: Polski
                  <br />
                  • Strefa czasowa: Europe/Warsaw
                  <br />
                  • Plan: Premium
                </div>
                <Button onClick={() => navigate('/admin/settings')} variant="secondary" className="w-full">
                  Przejdź do ustawień
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Szybkie akcje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="w-full">
                  ➕ Dodaj nauczyciela
                </Button>
                <Button variant="outline" className="w-full">
                  👥 Zarządzaj użytkownikami
                </Button>
                <Button variant="outline" className="w-full">
                  📊 Raporty
                </Button>
                <Button variant="outline" className="w-full">
                  ⚙️ Konfiguracja
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
