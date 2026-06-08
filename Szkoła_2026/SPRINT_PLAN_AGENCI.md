# PLAN SPRINTÓW - AGENCI + RÓWNOLEGŁA PRACA

**Projekt**: Szkoła 2026 - Budowa frontendu od zera
**Timeline**: 8 Sprintów = 23-25 dni (gruby estimate)
**Struktura**: 3-4 agenci na sprint, prace równoległe gdzie bezpieczne
**Data**: 2026-06-08

---

## 🎯 STRATEGIE PRZYDZIELANIA AGENTÓW

### ⚠️ REGUŁY ANTI-KANIBALIZACJI

1. **Jeden agent = jedna domena kodu**
   - Agent A: Frontend pages
   - Agent B: Services layer
   - Agent C: Styling/Theme
   - Agent D: Tests
   - ❌ NIGDY Agent A + Agent B w tym samym pliku

2. **Podział po WARSTWACH**
   - Layer 1: Services (Authentication, Database, API)
   - Layer 2: Pages (Dashboard, Editor, Library, Admin)
   - Layer 3: Components (UI kit, Layouts)
   - Layer 4: Styling + i18n
   - Layer 5: Tests + QA

3. **Sekwencja budowy**
   - Services MUSZĄ być przed Pages
   - Components MUSZĄ być przed Pages
   - Pages mogą być równolegle
   - Tests na koniec każdego sprintu

4. **Równoległa praca (BEZPIECZNA)**
   - Agent A pracuje nad: `/src/pages/auth/`
   - Agent B pracuje nad: `/src/pages/teacher/`
   - Agent C pracuje nad: `/src/pages/admin/`
   - ✅ OK - różne foldery, brak konfliktów!

5. **NIEZNEBEZPIECZNA równoległa praca**
   - Dwaj agenci w tym samym pliku
   - Dwaj agenci editujący `App.tsx` jednocześnie
   - Dwaj agenci editujący `package.json`
   - ❌ NIGDY!

---

## 📦 DOSTĘPNI AGENCI I ICH SPECJALIZACJE

| Agent | Specjalizacja | Tools | Notatka |
|-------|---|---|---|
| **planner** | Planning + Architecture | Read, Grep, Glob | Planuje fazy |
| **typescript-pro** | TypeScript/React kod | Read, Write, Edit, Bash | Pisze kod frontend |
| **code-reviewer** | Review kodu | Read, Grep, Glob, Bash | Validuje kod |
| **tdd-guide** | TDD + Testing | Read, Write, Edit, Bash | Pisze testy |
| **backend-developer** | Services/API | Read, Write, Edit, Bash | Backend logic |
| **database-reviewer** | Supabase/Schema | Read, Write, Edit, Bash | Schema + queries |
| **security-reviewer** | Security audit | Read, Grep, Glob | Bezpieczeństwo |
| **fullstack-developer** | Multi-layer work | All tools | Feature complete |
| **frontend-developer** | UI/UX + React | Read, Write, Edit, Bash | Frontend specialist |
| **performance-optimizer** | Optimizations | Read, Write, Edit, Bash | Performance tuning |

---

## 🏃 SPRINT 0: PRE-SPRINT (2 dni) ⚠️ BLOCKERS

**Cel**: Naprawić Supabase schema, Setup projekt, Prepare foundation

### Zadania

**BLOCKER #1: Fix Supabase Schema**
```sql
-- Brakujące tabele - MUSZĄ być przed frontendem!
sharing              -- lesson_id, shared_with_user_id, permission
comments            -- lesson_id, user_id, content
subscriptions       -- workspace_id, plan, status, renewal_date
school_profiles     -- workspace_id, name, address, contact_email, phone
teacher_invites     -- workspace_id, email, invite_code, expires_at, status
```

**Agent: database-reviewer** (EXCLUSIVE)
- Lokalizacja: `/SCHEMA.sql`
- Czas: ~1-2 godziny
- ⚠️ BLOCKER: Front nie może się zacząć bez tego!
- Warunki:
  - ✅ Wszystkie 5 tabel created
  - ✅ RLS policies enabled
  - ✅ Indexes created
  - ✅ Migrations tested na staging

**BLOCKER #2: Copy Services + Types**
```bash
cp -r School_AI_Custom/src/services Szkoła_2026/src/
cp -r School_AI_Custom/src/types Szkoła_2026/src/
cp -r School_AI_Custom/src/lib Szkoła_2026/src/
```

**Agent: backend-developer** (EXCLUSIVE)
- Lokalizacja: `src/services/`, `src/types/`, `src/lib/`
- Czas: ~2-3 godziny
- Warunki:
  - ✅ All 19 services copied
  - ✅ Import paths fixed
  - ✅ TypeScript compiles
  - ✅ Tests pass

**SETUP: Project Init**
```bash
npm install
npm install i18next react-i18n18next
npm install tailwindcss postcss autoprefixer
npm install @tiptap/react @tiptap/starter-kit
npm install react-hook-form zod @hookform/resolvers
npm install zustand @tanstack/react-query
```

**Agent: typescript-pro** (SHARED)
- Lokalizacja: `package.json`, `tsconfig.json`
- Czas: ~30 minut
- Warunki:
  - ✅ npm install succeeds
  - ✅ TypeScript checks pass
  - ✅ All tools available

### Warunki przed Sprint 1

```
✅ Supabase schema complete (5 tabel + RLS)
✅ Services layer copied + working
✅ Project initialized
✅ npm dependencies installed
✅ TypeScript compiles
→ Dopiero WTEDY można zacząć Sprint 1!
```

---

## 🚀 SPRINT 1: AUTHENTICATION (3 dni)

**Cel**: Login, Signup, Layouts gotowe do użytku

### Architektura

```
App.tsx (Router setup)
├── AuthLayout
│   ├── LoginPage
│   ├── SchoolSignupPage
│   └── JoinTeacherPage
├── MainLayout
│   └── (Dashboard, Editor, Library)
└── AdminLayout
    └── (Admin Dashboard)
```

### Zadania

#### Task 1.1: Setup React Router + Auth Context
**Agenci**: typescript-pro + backend-developer (PARALLEL - różne pliki!)

**typescript-pro** - Frontend routing:
- Lokalizacja: `src/App.tsx`, `src/router.tsx`, `src/components/ProtectedRoute.tsx`
- Pracuje nad: React Router setup, routing structure
- Czas: ~2 godziny
- Zależy od: Sprint 0 DONE
- ✅ Warunki:
  - App.tsx has all routes defined
  - ProtectedRoute checks auth
  - No console errors

**backend-developer** - Auth Context:
- Lokalizacja: `src/contexts/AuthContext.tsx`, `src/hooks/useAuth.ts`
- Pracuje nad: Supabase auth integration, session management
- Czas: ~2 godziny
- Zależy od: Sprint 0 DONE + services copied
- ✅ Warunki:
  - AuthContext provides user, session, isLoading
  - useAuth hook works
  - Session persists on refresh

⚠️ SYNCHRONIZACJA:
- Both MUST finish BEFORE Task 1.2
- Test together: AuthContext + Router communication

---

#### Task 1.2: UI Components (auth-related)
**Agent**: typescript-pro (EXCLUSIVE)
- Lokalizacja: `src/components/ui/Button.tsx`, `Input.tsx`, `Form.tsx`, `Card.tsx`, `Modal.tsx`
- Czas: ~4 godziny
- Zależy od: Task 1.1 done
- ✅ Warunki:
  - All UI components rendered
  - Tailwind styling applied
  - No TypeScript errors

---

#### Task 1.3: LoginPage
**Agent**: typescript-pro (EXCLUSIVE)
- Lokalizacja: `src/pages/auth/LoginPage.tsx`
- Czas: ~2 godziny
- Zależy od: Task 1.2 done + AuthContext working
- ✅ Warunki:
  - Form renders
  - Email + password inputs work
  - Submit calls authService.signInWithEmail()
  - Redirect to dashboard on success
  - Error messages displayed

---

#### Task 1.4: SchoolSignupPage (Multi-step)
**Agent**: frontend-developer (EXCLUSIVE)
- Lokalizacja: `src/pages/auth/SchoolSignupPage.tsx`
- Czas: ~3 godziny
- Zależy od: Task 1.2 done + authService ready
- ✅ Warunki:
  - Step 1: School info form
  - Step 2: Admin info form
  - Step 3: Curriculum selection
  - Submit calls authService.signupSchool()
  - Multi-step navigation works

---

#### Task 1.5: JoinTeacherPage
**Agent**: frontend-developer (EXCLUSIVE)
- Lokalizacja: `src/pages/auth/JoinTeacherPage.tsx`
- Czas: ~1.5 godziny
- Zależy od: Task 1.2 done + authService ready
- ✅ Warunki:
  - Invite code input
  - Email + password inputs
  - Submit calls authService.signupTeacher()

---

#### Task 1.6: MainLayout + AuthLayout
**Agent**: typescript-pro (EXCLUSIVE)
- Lokalizacja: `src/layouts/MainLayout.tsx`, `AuthLayout.tsx`, `AdminLayout.tsx`
- Czas: ~2 godziny
- Zależy od: Task 1.2 done
- ✅ Warunki:
  - Layouts render
  - Navigation/sidebar working
  - Responsive design

---

#### Task 1.7: i18n Setup (PARALLEL) - PL + EN
**Agent**: typescript-pro (EXCLUSIVE)
- Lokalizacja: `src/i18n/config.ts`, `src/i18n/locales/pl.json`, `en.json`, `src/contexts/LanguageContext.tsx`
- Czas: ~2 godziny
- Zależy od: Task 1.1 done
- ✅ Warunki:
  - i18next configured
  - Polish strings file complete
  - English strings file complete
  - Language context provides language switching
  - ⭐ WSZYSTKIE UI strings muszą być w JSON, nie hardcoded!

---

#### Task 1.8: Code Review + Tests
**Agenci**: code-reviewer + tdd-guide (PARALLEL)

**code-reviewer**:
- Lokalizacja: Wszystkie pliki Sprint 1
- Czas: ~2 godziny
- ✅ Sprawdza: TypeScript, security, best practices, unused imports

**tdd-guide**:
- Lokalizacja: `src/**/__tests__/`
- Czas: ~3 godziny
- Pisze testy dla:
  - LoginPage
  - SchoolSignupPage
  - AuthContext
  - useAuth hook
- ✅ Warunki: 80%+ coverage

### Sprint 1 Completion Criteria

```
✅ App.tsx + Router setup
✅ AuthContext + ProtectedRoute
✅ All 5 auth pages (Login, Signup, Join, MainLayout, AuthLayout)
✅ i18n Polish + English
✅ UI components (Button, Input, Form, Card, Modal)
✅ All tests passing
✅ No TypeScript errors
✅ No console warnings
→ Can authenticate + navigate = Sprint 1 DONE!
```

---

## 📊 SPRINT 2: TEACHER DASHBOARD (2-3 dni)

**Cel**: Dashboard z real data (nie DEMO!)

### Architektura

```
TeacherDashboardPage
├── Stats cards (lessons, quality, usage)
├── Recent lessons table
├── Quick actions (Create Lesson, Browse Library)
└── Loading skeleton
```

### Zadania

#### Task 2.1: Dashboard Data Layer
**Agent**: backend-developer (EXCLUSIVE)
- Lokalizacja: `src/hooks/useTeacherStats.ts`
- Czas: ~1.5 godziny
- Zależy od: Sprint 1 done + authService working
- ✅ Warunki:
  - Hook calls lessonService.getTeacherDashboardStats()
  - Returns: materialsGenerated, thisMonth, avgQuality, recentMaterials
  - Loading + error states

#### Task 2.2: Dashboard UI
**Agent**: typescript-pro (EXCLUSIVE)
- Lokalizacja: `src/pages/teacher/TeacherDashboardPage.tsx`
- Czas: ~3 godziny
- Zależy od: Task 2.1 done + i18n ready
- ✅ Warunki:
  - Stats cards render
  - Recent lessons table
  - Quick action buttons
  - Polish + English labels
  - Skeleton while loading

#### Task 2.3: Dashboard Styling
**Agent**: typescript-pro (SHARED - różny plik)
- Lokalizacja: `src/styles/dashboard.css` + Tailwind classes
- Czas: ~1.5 godziny
- ✅ Warunki:
  - Responsive design
  - Cards layout
  - Color scheme consistent
  - Dark mode support

#### Task 2.4: Tests + Review
**Agenci**: tdd-guide + code-reviewer (PARALLEL)

**tdd-guide**:
- Czas: ~2 godziny
- Pisze testy dla TeacherDashboardPage
- ✅ 80%+ coverage

**code-reviewer**:
- Czas: ~1.5 godziny
- Reviews Dashboard code

### Sprint 2 Completion Criteria

```
✅ Real data showing (not DEMO)
✅ Stats cards working
✅ Recent lessons table
✅ i18n Polish + English labels
✅ Responsive design
✅ Tests passing
→ Dashboard is production-ready = Sprint 2 DONE!
```

---

## ✏️ SPRINT 3: LESSON EDITOR (5 dni) ⭐ CRITICAL

**Cel**: WYSIWYG editor z image upload + draft auto-save

### Architektura

```
LessonGeneratorPage
├── Input form (topic, grade, subject, duration, objectives)
├── Generate button (AI)
├── Tiptap WYSIWYG Editor
│   ├── Toolbar (Bold, Italic, Heading, Lists, etc.)
│   ├── Content area
│   └── Image upload
├── Draft auto-save (debounce 300ms)
└── Save/Publish/Export buttons
```

### Zadania

#### Task 3.1: Setup Tiptap Editor Component
**Agent**: typescript-pro (EXCLUSIVE)
- Lokalizacja: `src/components/lesson/RichTextEditor.tsx`
- Czas: ~3 godziny
- Zależy od: Sprint 1 done
- ✅ Warunki:
  - Tiptap initialized
  - Toolbar with Bold, Italic, Heading, Lists, Code, Blockquote, Link
  - Content area editable
  - No TypeScript errors

#### Task 3.2: Image Upload Component
**Agent**: frontend-developer (EXCLUSIVE)
- Lokalizacja: `src/components/lesson/ImageUploader.tsx`
- Czas: ~2 godziny
- Zależy od: Task 3.1 done + Supabase Storage
- ✅ Warunki:
  - File input works
  - Upload to Supabase Storage
  - Insert image URL in editor
  - Progress indicator

#### Task 3.3: LessonGeneratorPage Form
**Agent**: typescript-pro (EXCLUSIVE)
- Lokalizacja: `src/pages/teacher/LessonGeneratorPage.tsx`
- Czas: ~2 godziny
- Zależy od: Sprint 2 done + RichTextEditor ready
- ✅ Warunki:
  - Form fields: topic, grade, subject, duration, objectives
  - Generate button calls lessonService.generateLesson()
  - Loading state while generating
  - Error handling

#### Task 3.4: Editor + Auto-save Integration
**Agent**: backend-developer (EXCLUSIVE)
- Lokalizacja: `src/hooks/useLessonEditor.ts`
- Czas: ~2 godziny
- Zależy od: Task 3.1 + Task 3.3 done
- ✅ Warunki:
  - useEffect debounce (300ms)
  - Calls lessonService.updateLesson()
  - Shows "Draft saved at..." toast
  - Handles errors gracefully

#### Task 3.5: LessonDetailPage (View + Edit)
**Agent**: frontend-developer (EXCLUSIVE)
- Lokalizacja: `src/pages/teacher/LessonDetailPage.tsx`
- Czas: ~2.5 godziny
- Zależy od: Editor complete
- ✅ Warunki:
  - Load lesson: lessonService.getLesson(id)
  - Display in view mode
  - Edit button switches to edit mode
  - RichTextEditor for editing
  - Save/Publish buttons

#### Task 3.6: Lesson Actions (Export, Share, Delete)
**Agent**: typescript-pro (EXCLUSIVE)
- Lokalizacja: `src/components/lesson/LessonActions.tsx`
- Czas: ~2 godziny
- Zależy od: Task 3.5 done
- ✅ Warunki:
  - Export to PDF (pdfExportService)
  - Share button (opens modal)
  - Delete button (soft delete)
  - Confirm modals

#### Task 3.7: Version History UI
**Agent**: frontend-developer (EXCLUSIVE)
- Lokalizacja: `src/components/lesson/VersionHistory.tsx`
- Czas: ~1.5 godziny
- Zależy od: libraryService.getHistory() ready
- ✅ Warunki:
  - Show lesson versions
  - Diff view (old vs new)
  - Restore to version button

#### Task 3.8: Tests + Code Review
**Agenci**: tdd-guide + code-reviewer (PARALLEL)

**tdd-guide**:
- Czas: ~3 godziny
- Pisze testy dla:
  - RichTextEditor
  - LessonGeneratorPage
  - LessonDetailPage
  - useLessonEditor hook

**code-reviewer**:
- Czas: ~2 godziny
- Reviews all editor code

### Sprint 3 Completion Criteria

```
✅ Tiptap editor fully functional
✅ Image upload working
✅ Draft auto-save working
✅ Generate AI lesson working
✅ Save/Publish/Export working
✅ Version history showing
✅ Tests passing (80%+ coverage)
✅ No performance issues (debounce working)
→ Editor is production-ready = Sprint 3 DONE!
```

---

## 🔍 SPRINT 4: LIBRARY (3-4 dni)

**Cel**: Search, Filter, Share, Comments

### Architektura

```
LibraryPage
├── Search bar (realtime)
├── Filters (type, subject, grade, status, quality)
├── Sort dropdown
├── Pagination
├── Material grid
│   ├── Cards (preview, title, subject, quality badge)
│   ├── Open button
│   ├── Share button
│   ├── Delete button
│   └── Archive button
└── Sharing modal
    ├── Teacher email input
    └── Permission select
```

### Zadania

#### Task 4.1: Library Search + Filter Hook
**Agent**: backend-developer (EXCLUSIVE)
- Lokalizacja: `src/hooks/useLibrarySearch.ts`
- Czas: ~2 godziny
- Zależy od: libraryService ready
- ✅ Warunki:
  - getMaterials() with filters
  - searchMaterials() with debounce (300ms)
  - Pagination logic
  - getLibraryStats()

#### Task 4.2: LibraryPage UI
**Agent**: frontend-developer (EXCLUSIVE)
- Lokalizacja: `src/pages/library/LibraryPage.tsx`
- Czas: ~3 godziny
- Zależy od: Task 4.1 done + i18n ready
- ✅ Warunki:
  - Search bar renders
  - Filter UI (type, subject, grade, status, quality)
  - Sort dropdown
  - Pagination
  - Material grid/table

#### Task 4.3: Material Card Component
**Agent**: typescript-pro (EXCLUSIVE)
- Lokalizacja: `src/components/library/MaterialCard.tsx`
- Czas: ~1.5 godziny
- Zależy od: Task 4.2 done
- ✅ Warunki:
  - Card layout
  - Preview image/icon
  - Title, subject, grade, quality badge
  - Action buttons (Open, Share, Delete, Archive)

#### Task 4.4: Sharing Modal
**Agent**: typescript-pro (EXCLUSIVE)
- Lokalizacja: `src/components/library/SharingModal.tsx`
- Czas: ~2 godziny
- Zależy od: Task 4.3 done
- ✅ Warunki:
  - Modal renders
  - Teacher email input
  - Permission select (view, edit)
  - Send button
  - TODO: lessonService.shareLesson() (FUTURE API)

#### Task 4.5: Comments System UI
**Agent**: frontend-developer (EXCLUSIVE)
- Lokalizacja: `src/components/lesson/CommentsSection.tsx`
- Czas: ~1.5 godziny
- Zależy od: comments table exists in Supabase
- ✅ Warunki:
  - Comments list
  - Add comment form
  - Delete own comment button
  - TODO: Full API implementation (FUTURE)

#### Task 4.6: Tests + Code Review
**Agenci**: tdd-guide + code-reviewer (PARALLEL)

**tdd-guide**:
- Czas: ~2.5 godziny
- Pisze testy dla:
  - useLibrarySearch hook
  - LibraryPage
  - MaterialCard
  - SharingModal

**code-reviewer**:
- Czas: ~2 godziny
- Reviews library code

### Sprint 4 Completion Criteria

```
✅ Search working (with debounce)
✅ Filters working
✅ Pagination working
✅ Material cards rendering
✅ Sharing UI working
✅ Comments UI working
✅ Tests passing (80%+ coverage)
→ Library is functional = Sprint 4 DONE!
```

---

## 👨‍💼 SPRINT 5: ADMIN PANEL (2-3 dni)

**Cel**: Admin dashboard, teachers management, settings

### Architektura

```
AdminDashboardPage
├── Stats (schoolService.getSchoolDashboardStats())
├── Recent activity logs
├── Quick actions

TeachersManagementPage
├── Teachers list (schoolService.getTeachers())
├── Invite teacher form
├── Actions (Suspend, Remove, Roles)

SchoolSettingsPage
├── School info form
├── Logo upload
├── Language selection (PL/EN)
├── Notification preferences
└── Curriculum selection
```

### Zadania

#### Task 5.1: AdminDashboardPage
**Agent**: frontend-developer (EXCLUSIVE)
- Lokalizacja: `src/pages/admin/AdminDashboardPage.tsx`
- Czas: ~2 godziny
- Zależy od: Sprint 2 done + schoolService ready
- ✅ Warunki:
  - Calls schoolService.getSchoolDashboardStats()
  - Stats cards: teacher count, lessons, usage %, subscription
  - Recent activity logs
  - Quick action links

#### Task 5.2: TeachersManagementPage
**Agent**: typescript-pro (EXCLUSIVE)
- Lokalizacja: `src/pages/admin/TeachersPage.tsx`
- Czas: ~2.5 godziny
- Zależy od: Sprint 1 done + schoolService ready
- ✅ Warunki:
  - Teachers table (schoolService.getTeachers())
  - Invite teacher form (schoolService.inviteTeacher())
  - Action buttons (Suspend, Remove, Edit roles)
  - Confirm modals

#### Task 5.3: SchoolSettingsPage
**Agent**: frontend-developer (EXCLUSIVE)
- Lokalizacja: `src/pages/admin/SettingsPage.tsx`
- Czas: ~2 godziny
- Zależy od: Sprint 1 done + schoolService ready
- ✅ Warunki:
  - School info form (name, address, contact)
  - Logo upload
  - Language selection (PL/EN) ← ⭐ IMPORTANT!
  - Notification preferences
  - Save button calls schoolService.updateSchoolSettings()

#### Task 5.4: AdminLayout
**Agent**: typescript-pro (EXCLUSIVE)
- Lokalizacja: `src/layouts/AdminLayout.tsx`
- Czas: ~1 godzina
- Zależy od: Sprint 1 done
- ✅ Warunki:
  - Admin-specific navigation
  - Sidebar with admin links
  - Role check (only admin can access)

#### Task 5.5: Tests + Code Review
**Agenci**: tdd-guide + code-reviewer (PARALLEL)

**tdd-guide**:
- Czas: ~2 godziny
- Pisze testy dla admin pages

**code-reviewer**:
- Czas: ~1.5 godziny
- Reviews admin code

### Sprint 5 Completion Criteria

```
✅ Admin dashboard rendering
✅ Teachers management working
✅ Settings page working
✅ Language selection working
✅ Invite teacher form working
✅ Tests passing (80%+ coverage)
→ Admin panel functional = Sprint 5 DONE!
```

---

## 🌍 SPRINT 6: POLSKI LANGUAGE + I18N (1-2 dni)

**Cel**: Kompletny Polish support + Language switching

### Zadania

#### Task 6.1: Polish Translations Complete
**Agent**: typescript-pro (EXCLUSIVE)
- Lokalizacja: `src/i18n/locales/pl.json`
- Czas: ~2 godziny
- ✅ Warunki:
  - ALL UI strings in Polish
  - Subject names: Matematyka, Historia, Biologia, etc.
  - Grade names: Klasa 1-8 (podstawowa), 1-3 (gimnazjum), 1-3 (liceum)
  - Error messages in Polish
  - Button labels in Polish
  - Placeholders in Polish

#### Task 6.2: English Translations Complete
**Agent**: typescript-pro (EXCLUSIVE)
- Lokalizacja: `src/i18n/locales/en.json`
- Czas: ~1.5 godziny
- ✅ Warunki:
  - ALL UI strings in English
  - Same structure as Polish
  - Subject/grade names in English

#### Task 6.3: Language Switcher UI
**Agent**: frontend-developer (EXCLUSIVE)
- Lokalizacja: `src/components/LanguageSwitcher.tsx`
- Czas: ~1 godzina
- ✅ Warunki:
  - Dropdown: PL / EN
  - Updates localStorage
  - Updates workspaces.settings.language
  - App re-renders in new language

#### Task 6.4: Email Templates Polish + English
**Agent**: typescript-pro (EXCLUSIVE)
- Lokalizacja: `src/email-templates/`
- Czas: ~1.5 godziny
- ✅ Warunki:
  - Welcome email (PL + EN)
  - Invite email (PL + EN)
  - Notification emails (PL + EN)
  - profesjonalny HTML

#### Task 6.5: Code Audit + Review
**Agent**: code-reviewer (EXCLUSIVE)
- Czas: ~1 godzina
- Sprawdza:
  - All UI strings using i18n
  - No hardcoded Polish/English strings
  - Language context working
  - localStorage persistence

### Sprint 6 Completion Criteria

```
✅ Polish translations 100% complete
✅ English translations 100% complete
✅ Language switcher working
✅ localStorage persistence
✅ workspaces.settings.language synced
✅ Email templates (PL + EN)
✅ No hardcoded strings remaining
→ Language support complete = Sprint 6 DONE!
```

---

## 🧪 SPRINT 7: TESTING + PERFORMANCE (2 dni)

**Cel**: E2E tests, Visual tests, Performance tuning

### Zadania

#### Task 7.1: E2E Tests (Playwright)
**Agent**: tdd-guide (EXCLUSIVE)
- Lokalizacja: `tests/e2e/`
- Czas: ~3 godziny
- ✅ Warunki:
  - Auth flow (signup, login, logout)
  - Dashboard (load real data)
  - Editor (create, save, publish)
  - Library (search, filter, share)
  - Admin (manage teachers, settings)
  - All tests PASS

#### Task 7.2: Visual Regression Tests
**Agent**: tdd-guide (SHARED - inny folder)
- Lokalizacja: `tests/visual/`
- Czas: ~2 godziny
- ✅ Warunki:
  - Screenshots at: mobile (320px), tablet (768px), desktop (1440px)
  - Polish + English UI tested
  - Dark mode tested
  - Light mode tested

#### Task 7.3: Performance Optimization
**Agent**: performance-optimizer (EXCLUSIVE)
- Lokalizacja: Wszystkie komponenty
- Czas: ~2 godziny
- ✅ Warunki:
  - Bundle size < 300KB (gzipped)
  - LCP < 2.5s
  - INP < 200ms
  - CLS < 0.1
  - Search debounce 300ms verified
  - Image lazy-loading
  - Route lazy-loading

#### Task 7.4: Code Review - Final Audit
**Agent**: code-reviewer (EXCLUSIVE)
- Czas: ~2 godziny
- Sprawdza:
  - All TypeScript strict mode
  - No console.log in production
  - No unused imports
  - Security review
  - Best practices

### Sprint 7 Completion Criteria

```
✅ All E2E tests PASSING
✅ Visual regression tests PASSING
✅ Performance metrics met
✅ Bundle size optimized
✅ Core Web Vitals green
✅ No TypeScript errors
✅ No console warnings
→ Production-ready = Sprint 7 DONE!
```

---

## 🚀 SPRINT 8: FINAL POLISH + LAUNCH (1-2 dni)

**Cel**: Final cleanup, documentation, production deployment

### Zadania

#### Task 8.1: Documentation
**Agent**: documentation-engineer (EXCLUSIVE)
- Lokalizacja: `docs/`, `README.md`, `CONTRIBUTING.md`
- Czas: ~2 godziny
- ✅ Warunki:
  - Developer setup guide
  - Architecture diagrams
  - API documentation
  - Contributing guidelines
  - Deployment guide

#### Task 8.2: Bug Fixes + Edge Cases
**Agent**: debugger (EXCLUSIVE)
- Czas: ~2 godziny
- Tests edge cases:
  - Network errors
  - Session timeout
  - Concurrent edits
  - Large file uploads
  - Language switching edge cases

#### Task 8.3: Final Code Review
**Agent**: code-reviewer (EXCLUSIVE)
- Czas: ~1.5 godziny
- Final security review
- Final performance review
- Final accessibility review (WCAG 2.2)

#### Task 8.4: Deployment Preparation
**Agent**: devops-engineer (EXCLUSIVE)
- Czas: ~1.5 godziny
- CI/CD setup
- Environment variables
- Deployment scripts
- Rollback procedures

### Sprint 8 Completion Criteria

```
✅ Documentation complete
✅ All known bugs fixed
✅ Edge cases handled
✅ Final code review PASSED
✅ Deployment tested
✅ Rollback procedures ready
→ READY FOR PRODUCTION LAUNCH! 🎉
```

---

## 📋 AGENT ALLOCATION SUMMARY

### Sprint-by-Sprint Breakdown

| Sprint | Duration | Agenci | Status |
|--------|----------|--------|--------|
| **0** | 2d | database-reviewer, backend-developer, typescript-pro | 🔴 BLOCKER |
| **1** | 3d | typescript-pro, backend-developer, frontend-developer, tdd-guide, code-reviewer | 🟡 CRITICAL |
| **2** | 2-3d | backend-developer, typescript-pro, tdd-guide, code-reviewer | 🟢 |
| **3** | 5d | typescript-pro, frontend-developer, backend-developer, tdd-guide, code-reviewer | 🟡 CRITICAL |
| **4** | 3-4d | backend-developer, typescript-pro, frontend-developer, tdd-guide, code-reviewer | 🟢 |
| **5** | 2-3d | typescript-pro, frontend-developer, tdd-guide, code-reviewer | 🟢 |
| **6** | 1-2d | typescript-pro, frontend-developer, code-reviewer | 🟢 |
| **7** | 2d | tdd-guide, performance-optimizer, code-reviewer | 🟡 FINAL |
| **8** | 1-2d | documentation-engineer, debugger, code-reviewer, devops-engineer | 🟢 |

### Dostępni Agenci

```
ALWAYS NEEDED:
- code-reviewer    (każdy sprint - review kodu)
- tdd-guide        (każdy sprint - testy)

CORE TEAM:
- typescript-pro   (frontend, React, UI)
- frontend-developer (UI/UX specialist)
- backend-developer (Services, hooks, logic)

SPECIALIZED:
- database-reviewer (Supabase schema)
- performance-optimizer (Perf tuning)
- documentation-engineer (Docs)
- devops-engineer (Deployment)
- debugger (Bug fixes)
```

---

## ⚡ RÓWNOLEGŁA PRACA - REGUŁY

### ✅ BEZPIECZNE (No Kanibalizacji)

**Jednocześnie mogą pracować nad różnymi file/folderami:**
- Agent A: `src/pages/auth/LoginPage.tsx`
- Agent B: `src/pages/teacher/TeacherDashboardPage.tsx`
- Agent C: `src/pages/library/LibraryPage.tsx`
- Agent D: `src/components/ui/Button.tsx`

**Każdy agent ma swój folder/plik - ZERO konfliktów!**

### ❌ NIEBEZPIECZNE (SEQUENTIAL ONLY)

- ❌ Dwaj agenci w `src/App.tsx` jednocześnie
- ❌ Dwaj agenci w `package.json` jednocześnie
- ❌ Dwaj agenci w `src/contexts/AuthContext.tsx` jednocześnie
- ❌ Dwaj agenci editujący ten sam hook (`useAuth.ts`)

### 🔄 SYNCHRONIZACJA PUNKTY

**Przed każdym sprintem**:
1. ✅ Sprint 0 MUSI być kompletny
2. ✅ Wszystkie dependencies MUSZĄ być resolved
3. ✅ Mockups/designs MUSZĄ być zatwierdzone

**Między sprintami**:
1. ✅ Code review MUSI przejść
2. ✅ Testy MUSZĄ być passing (80%+ coverage)
3. ✅ TypeScript MUSI być clean (no errors)

---

## 🎯 EXECUTION STRATEGY

### Phase 1: Sequential (Sprint 0)
```
↓
database-reviewer (Supabase schema) - 2 hours
↓
backend-developer (Services copy) - 3 hours
↓
typescript-pro (Project init) - 30 mins
→ GATE PASSED - Sprint 1 can start
```

### Phase 2: Mostly Parallel (Sprints 1-8)

**Within same sprint, DIFFERENT agents work on DIFFERENT files simultaneously:**

```
Sprint 1 Example:
- typescript-pro → src/App.tsx, src/router.tsx (2h)
- backend-developer → src/contexts/AuthContext.tsx (2h) [PARALLEL!]
- frontend-developer → src/pages/auth/SchoolSignupPage.tsx (3h) [PARALLEL!]
- tdd-guide → tests (in background) [PARALLEL!]

All finish → code-reviewer checks everything
→ Sprint 1 DONE
```

**Result**: 3 days of ACTUAL work compressed into 1-2 days via parallelization!

---

## 📈 TIMELINE EXPECTATIONS

**Sequential approach** (BAD):
```
Sprint 0: 2d
Sprint 1: 3d
Sprint 2: 3d
Sprint 3: 5d
...
TOTAL: 25+ days (SLOW)
```

**Parallel approach** (GOOD):
```
Sprint 0: 2d (SEQUENTIAL - blocker)
Sprint 1: 3d (4 agents parallel → 1-2d actual wall time)
Sprint 2: 2d (3 agents parallel → 1d actual wall time)
Sprint 3: 4d (4 agents parallel → 2d actual wall time)
...
TOTAL: ~15-17 days actual wall time (FAST!)
```

---

## ✅ READY TO EXECUTE

Struktura jest gotowa:
- ✅ 8 sprintów
- ✅ ~60 tasks
- ✅ Agenci przydzieleni
- ✅ Zero kanibalizacji
- ✅ Równoległa praca planning
- ✅ Synchronizacja pointy
- ✅ ~15-17 dni wall time (vs 25+ bez paralelizacji)

**JEŚLI ZATWIERDŹ - ZACZYNAMY SPRINT 0 JUTRO!** 🚀
