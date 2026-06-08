# Backend Setup & Context/Hooks Documentation

## Overview

Terminal 2 provides all backend context, hooks, and i18n setup for Szkoła 2026.

---

## 🔐 Authentication (Task 1.1B)

### AuthContext
Location: `src/contexts/AuthContext.tsx`

Manages global auth state using Supabase auth and React Context.

```tsx
import { useAuth } from '@/hooks/useAuth'

function MyComponent() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth()
  
  if (isLoading) return <Loading />
  if (!isAuthenticated) return <LoginRedirect />
  
  return <div>Welcome, {user?.name}</div>
}
```

**AuthUser Type:**
```typescript
interface AuthUser {
  id: string
  email: string
  name: string
  role: 'teacher' | 'school_admin' | 'super_admin'
  workspaceId: string
  workspaceRole: string
}
```

### useAuth Hook
Location: `src/hooks/useAuth.ts`

Custom hook for accessing auth context + auth service methods.

```tsx
const {
  user,                    // Current logged-in user
  isLoading,              // Auth initialization loading state
  isAuthenticated,        // Boolean: user is logged in
  signOut,                // () => Promise<void>
  signupSchool,           // (data) => Promise<void>
  joinAsTeacher,          // (data) => Promise<void>
  getCurrentSession       // () => Promise<Session>
} = useAuth()
```

---

## 🌐 Internationalization (Task 1.7)

### i18n Setup
Location: `src/i18n/index.ts`

Configured with Polish (pl) + English (en) translations.
- Auto-detects user language preference from localStorage
- Falls back to Polish if not set

**Usage:**
```tsx
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t, i18n } = useTranslation()
  
  return (
    <>
      <h1>{t('dashboard.title')}</h1>
      <button onClick={() => i18n.changeLanguage('en')}>
        Switch to English
      </button>
    </>
  )
}
```

### LanguageContext
Location: `src/contexts/LanguageContext.tsx`

Provides centralized language switching + persistence.

```tsx
const { currentLanguage, changeLanguage } = useLanguage()
```

**Translation Files:**
- `src/i18n/locales/pl.json` — Polish translations
- `src/i18n/locales/en.json` — English translations

---

## 📐 Layouts (Task 1.6)

### MainLayout
Location: `src/layouts/MainLayout.tsx`

For teacher dashboard & regular pages.
- Top navbar with user name + language switcher
- Responsive max-width container
- Uses `useAuth()` + i18n

```tsx
import { MainLayout } from '@/layouts/MainLayout'

function TeacherDashboard() {
  return (
    <MainLayout>
      <h1>Welcome to Dashboard</h1>
    </MainLayout>
  )
}
```

### AdminLayout
Location: `src/layouts/AdminLayout.tsx`

For admin panel pages.
- Same as MainLayout + admin badge indicator
- Uses `useAuth()` + i18n

```tsx
import { AdminLayout } from '@/layouts/AdminLayout'

function AdminPanel() {
  return (
    <AdminLayout>
      <h1>Admin Panel</h1>
    </AdminLayout>
  )
}
```

### AuthLayout
Location: `src/layouts/AuthLayout.tsx`

For login/signup/join pages (no auth required).
- Gradient background
- Centered card container
- Language switcher in header

```tsx
import { AuthLayout } from '@/layouts/AuthLayout'

function LoginPage() {
  return (
    <AuthLayout title="Sign In">
      {/* Login form */}
    </AuthLayout>
  )
}
```

---

## 📊 Teacher Stats (Task 2.1)

### useTeacherStats Hook
Location: `src/hooks/useTeacherStats.ts`

Fetches dashboard statistics for teachers.

```tsx
const { stats, isLoading, error, refetch } = useTeacherStats()

// stats.materialsGenerated       — total lessons created
// stats.materialsThisMonth      — lessons this month
// stats.averageQuality          — average quality score
// stats.recentMaterials         — last 5 lessons (LessonGeneratorOutput[])
```

**Automatically fetches on mount** when user changes.

---

## ✏️ Lesson Editor (Task 3.4)

### useLessonEditor Hook
Location: `src/hooks/useLessonEditor.ts`

Manages lesson creation, editing, publishing.

```tsx
const {
  currentLesson,          // Current lesson being edited
  isLoading,              // Loading state
  isSaving,               // Saving state
  error,                  // Error message
  generateLesson,         // (input) => Promise<LessonGeneratorOutput>
  publishLesson,          // (lessonId) => Promise<void>
  deleteLesson,           // (lessonId) => Promise<void>
  loadLesson,             // (lessonId) => Promise<void>
  clearError              // () => void
} = useLessonEditor()
```

**Handles:**
- Generate new lesson via AI (calls lessonService.generateLesson)
- Publish lesson (changes status to 'published')
- Delete lesson (soft delete with deleted_at timestamp)
- Load existing lesson by ID
- Error handling + clearing

---

## 🔍 Library Search (Task 4.1)

### useLibrarySearch Hook
Location: `src/hooks/useLibrarySearch.ts`

Powerful search + filtering for material library.

```tsx
const {
  materials,              // Current page of materials
  stats,                  // Library statistics (counts by type, etc.)
  isLoading,              // Loading state
  isSearching,            // Search in progress
  error,                  // Error message
  currentPage,            // Current page number
  totalResults,           // Total matching results
  pageSize,               // Items per page (default 50)
  filters,                // Current filter object
  searchQuery,            // Current search string
  setSearchQuery,         // (query) => void
  setFilters,             // (filters) => void
  goToPage,               // (page) => void
  search,                 // () => Promise<void> — execute search
  clearError              // () => void
} = useLibrarySearch(pageSize)
```

**Example Usage:**
```tsx
function LibraryPage() {
  const lib = useLibrarySearch(50)
  
  const handleSearch = async () => {
    lib.setSearchQuery('Math')
    lib.setFilters({ subject: 'Mathematics', minQuality: 70 })
    await lib.search()
  }
  
  return (
    <div>
      <input 
        value={lib.searchQuery}
        onChange={(e) => lib.setSearchQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      
      <div>
        {lib.materials.map(m => (
          <div key={m.id}>{m.title}</div>
        ))}
      </div>
      
      <button onClick={() => lib.goToPage(lib.currentPage + 1)}>
        Next Page
      </button>
    </div>
  )
}
```

**Filters Supported:**
```typescript
interface LibraryFilters {
  type?: MaterialType[]  // 'lesson' | 'syllabus' | 'quiz' | 'test' | 'worksheet' | 'presentation'
  subject?: string
  grade?: number
  minQuality?: number
  status?: 'draft' | 'published' | 'archived'
  sortBy?: 'date_newest' | 'date_oldest' | 'quality_high' | 'quality_low' | 'title_a_z'
}
```

---

## 🏗️ Architecture

### Context Flow
```
App.tsx
├── I18nextProvider (i18n config)
├── LanguageProvider (language switching)
└── AuthProvider (auth state)
    └── Router (all pages)
```

### Hook Dependencies
- `useAuth()` — requires AuthProvider
- `useLanguage()` — requires LanguageProvider
- `useTeacherStats()` — requires useAuth() (accesses user.workspaceId)
- `useLessonEditor()` — requires useAuth()
- `useLibrarySearch()` — requires useAuth()

---

## 📝 Translation Keys

All available keys are in `src/i18n/locales/pl.json` and `en.json`.

**Common namespaces:**
- `common.*` — app-wide UI strings
- `auth.*` — authentication pages
- `errors.*` — error messages
- `dashboard.*` — teacher dashboard
- `admin.*` — admin panel
- `lesson.*` — lesson-related text
- `library.*` — library search & filtering

---

## 🔗 Integration Checklist

When building pages in Terminal 1, ensure you:

- [ ] Wrap page in `<MainLayout>` or `<AuthLayout>`
- [ ] Import translations with `useTranslation()`
- [ ] Use `useAuth()` for auth state (protected pages)
- [ ] Use `useTeacherStats()` for dashboard stats
- [ ] Use `useLessonEditor()` for lesson forms
- [ ] Use `useLibrarySearch()` for search pages

---

## ✅ Completed Tasks

| Sprint | Task | Status | Files |
|--------|------|--------|-------|
| 1 | 1.1B AuthContext + useAuth | ✅ | AuthContext.tsx, useAuth.ts |
| 1 | 1.6 Layouts | ✅ | MainLayout, AdminLayout, AuthLayout |
| 1 | 1.7 i18n Setup | ✅ | i18n/index.ts, LanguageContext, useLanguage |
| 2 | 2.1 useTeacherStats | ✅ | useTeacherStats.ts |
| 3 | 3.4 useLessonEditor | ✅ | useLessonEditor.ts |
| 4 | 4.1 useLibrarySearch | ✅ | useLibrarySearch.ts |
| 6 | 6.1/6.2 Translations | ✅ | pl.json, en.json |
| 8 | 8.1 Documentation | ✅ | BACKEND_SETUP.md |

---

**Ready for Terminal 1 Frontend Pages Development** 🚀
