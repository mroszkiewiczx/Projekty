import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { env } from '@/lib/env';
import pl from './pl.json';
import en from './en.json';

/**
 * Inicjalizacja i18n. PL domyślny (ADR-005). Zero hardcoded stringów w UI —
 * wszystkie teksty przez klucze. Wykrywanie języka: localStorage → przeglądarka → fallback PL.
 */
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      pl: { translation: pl },
      en: { translation: en },
    },
    fallbackLng: env.VITE_DEFAULT_LOCALE,
    supportedLngs: ['pl', 'en'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'aischool_lang',
      caches: ['localStorage'],
    },
  });

export default i18n;
