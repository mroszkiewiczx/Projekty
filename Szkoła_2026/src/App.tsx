import { BrowserRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import i18n from '@/i18n'
import Router from '@/router'

export default function App() {
  return (
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        <LanguageProvider>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </LanguageProvider>
      </I18nextProvider>
    </BrowserRouter>
  )
}
