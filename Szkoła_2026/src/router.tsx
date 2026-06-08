import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'

// Auth pages — public
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const SchoolSignupPage = lazy(() => import('@/pages/auth/SchoolSignupPage'))
const JoinTeacherPage = lazy(() => import('@/pages/auth/JoinTeacherPage'))

// Teacher pages — protected
const TeacherDashboardPage = lazy(() => import('@/pages/teacher/TeacherDashboardPage'))
const LessonDetailPage = lazy(() => import('@/pages/teacher/LessonDetailPage'))
const LessonGeneratorPage = lazy(() => import('@/pages/lesson/LessonGeneratorPage'))
const LessonGeneratorPageV2 = lazy(() =>
  import('@/modules/lessongen/pages/LessonGeneratorPageV2').then((m) => ({
    default: m.LessonGeneratorPageV2,
  })),
)
const LibraryPage = lazy(() => import('@/pages/library/LibraryPage'))

// Admin pages — protected, admin-only
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const TeachersManagementPage = lazy(() => import('@/pages/admin/TeachersManagementPage'))
const SchoolSettingsPage = lazy(() => import('@/pages/admin/SchoolSettingsPage'))

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
    </div>
  )
}

export default function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup-school" element={<SchoolSignupPage />} />
        <Route path="/join-teacher" element={<JoinTeacherPage />} />

        {/* Protected teacher routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<TeacherDashboardPage />} />
          <Route path="/lesson/new" element={<LessonGeneratorPage />} />
          <Route path="/lesson/generator" element={<LessonGeneratorPage />} />
          <Route path="/lesson/generator-v2" element={<LessonGeneratorPageV2 />} />
          <Route path="/lesson/:id" element={<LessonDetailPage />} />
          <Route path="/library" element={<LibraryPage />} />
        </Route>

        {/* Protected admin routes */}
        <Route element={<ProtectedRoute requiredRole={['school_admin', 'super_admin']} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/teachers" element={<TeachersManagementPage />} />
          <Route path="/admin/settings" element={<SchoolSettingsPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
