import React, { createContext, useContext, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

interface LanguageContextValue {
  currentLanguage: string
  changeLanguage: (lang: string) => Promise<void>
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation()

  const changeLanguage = useCallback(async (lang: string) => {
    await i18n.changeLanguage(lang)
    localStorage.setItem('language', lang)
  }, [i18n])

  return (
    <LanguageContext.Provider value={{ currentLanguage: i18n.language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return ctx
}
