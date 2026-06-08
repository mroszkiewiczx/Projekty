import React from 'react'
import { useTranslation } from 'react-i18next'

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
}

export function AuthLayout({ children, title }: AuthLayoutProps) {
  const { i18n } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col">
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Szkoła 2026</h1>
        <button
          onClick={() => i18n.changeLanguage(i18n.language === 'pl' ? 'en' : 'pl')}
          className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-700"
        >
          {i18n.language === 'pl' ? 'EN' : 'PL'}
        </button>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {title && <h2 className="text-3xl font-bold text-white mb-8 text-center">{title}</h2>}
          <div className="bg-white rounded-lg shadow-xl p-8">
            {children}
          </div>
        </div>
      </main>
      <footer className="py-4 text-center text-white text-sm">
        <p>&copy; 2026 Szkoła. All rights reserved.</p>
      </footer>
    </div>
  )
}
