import type { i18n } from 'i18next'

export interface I18nConfig {
  supportedLanguages: string[]
  defaultLanguage: string
  fallbackLanguage: string
  resources: Record<string, any>
  detection: {
    useLocalStorage: boolean
    localStorageKey: string
  }
}

const supportedLanguages = ['pl', 'en']
const defaultLanguage = 'pl'
const fallbackLanguage = 'pl'
const localStorageKey = 'language'

export const i18nConfig: I18nConfig = {
  supportedLanguages,
  defaultLanguage,
  fallbackLanguage,
  resources: {},
  detection: {
    useLocalStorage: true,
    localStorageKey
  }
}

export function getInitialLanguage(): string {
  if (typeof window === 'undefined') {
    return defaultLanguage
  }

  const stored = localStorage.getItem(localStorageKey)
  if (stored && supportedLanguages.includes(stored)) {
    return stored
  }

  const browserLang = navigator.language.split('-')[0]
  if (supportedLanguages.includes(browserLang)) {
    return browserLang
  }

  return defaultLanguage
}

export function persistLanguagePreference(language: string): void {
  if (typeof window !== 'undefined' && supportedLanguages.includes(language)) {
    localStorage.setItem(localStorageKey, language)
  }
}

export function isLanguageSupported(language: string): boolean {
  return supportedLanguages.includes(language)
}
