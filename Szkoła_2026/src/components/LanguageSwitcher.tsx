import { useLanguage } from '@/contexts/LanguageContext'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
      <button
        onClick={() => i18n.changeLanguage('pl')}
        className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
          i18n.language === 'pl'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        PL
      </button>
      <button
        onClick={() => i18n.changeLanguage('en')}
        className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
          i18n.language === 'en'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        EN
      </button>
    </div>
  )
}
