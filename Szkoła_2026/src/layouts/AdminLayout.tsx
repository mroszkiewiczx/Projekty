import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from 'react-i18next'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth()
  const { i18n } = useTranslation()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">Szkoła 2026 - Admin</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded">
                Admin
              </span>
              <button
                onClick={() => i18n.changeLanguage(i18n.language === 'pl' ? 'en' : 'pl')}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {i18n.language === 'pl' ? 'EN' : 'PL'}
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
