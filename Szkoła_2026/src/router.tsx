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
const ChatPage = lazy(() =>
  import('@/pages/chat/ChatPage').then((m) => ({ default: m.ChatPage })),
)
const AnalyticsPage = lazy(() =>
  import('@/pages/analytics/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })),
)

// Admin pages — protected, admin-only
const CurriculumImportPage = lazy(() =>
  import('@/modules/curriculum/CurriculumUploader').then((m) => ({ default: m.CurriculumUploader })),
)
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const TeachersManagementPage = lazy(() => import('@/pages/admin/TeachersManagementPage'))
const SchoolSettingsPage = lazy(() => import('@/pages/admin/SchoolSettingsPage'))
const UserManagementPage = lazy(() => import('@/pages/admin/UserManagementPage'))

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
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Route>

        {/* Protected admin routes */}
        <Route element={<ProtectedRoute requiredRole={['school_admin', 'super_admin']} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/teachers" element={<TeachersManagementPage />} />
          <Route path="/admin/settings" element={<SchoolSettingsPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/curriculum-import" element={<CurriculumImportPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
