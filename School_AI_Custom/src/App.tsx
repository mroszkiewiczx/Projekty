import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n/config'
import { AppProvider } from './contexts/AppContext'
import { MainLayout } from './layouts/MainLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { AuthLayout } from './layouts/AuthLayout'
import './styles/globals.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, gcTime: 1000 * 60 * 10, retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
})

// Lazy load real pages
const TeacherDashboard = lazy(() => import('./pages/teacher/TeacherDashboardPage'))
const LessonGenerator = lazy(() => import('./pages/teacher/LessonGeneratorPage'))
const LessonDetail = lazy(() => import('./pages/teacher/LessonDetailPage'))
const LibraryPage = lazy(() => import('./pages/library/LibraryPage'))
const BillingPage = lazy(() => import('./pages/billing/BillingPage'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboardPage'))

const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const SchoolSignupPage = lazy(() => import('./pages/auth/SchoolSignupPage'))
const JoinTeacherPage = lazy(() => import('./pages/auth/JoinTeacherPage'))

function LoadingFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Ładowanie...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <AppProvider>
          <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Auth routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup/school" element={<SchoolSignupPage />} />
                <Route path="/join/teacher" element={<JoinTeacherPage />} />
              </Route>

              {/* Teacher routes */}
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<TeacherDashboard />} />
                <Route path="/lessongen" element={<LessonGenerator />} />
                <Route path="/lessongen/:id" element={<LessonDetail />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/billing" element={<BillingPage />} />
                <Route index element={<Navigate to="/dashboard" replace />} />
              </Route>

              {/* Admin routes */}
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        </AppProvider>
      </I18nextProvider>
    </QueryClientProvider>
  )
}
// Deploy trigger 1780656856
