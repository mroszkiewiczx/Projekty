# PLAN BUDOWY FRONTENDU - Szkoła 2026

**Data**: 2026-06-08
**Bazowany na**: Pełnej analizie School_AI_Custom (40-50% ready)
**Status**: GOTOWY DO BUDOWY

---

## EXECUTIVE SUMMARY

School_AI_Custom jest ~40-50% gotowa. Backend działa (AI, Auth, Services), ale **Frontend to 90% DEMO**, a **Supabase schema jest niekompletna**.

Plan: **Budować Szkoła_2026 od zera**, używając:**
- ✅ Proven Services (lessonService, authService, schoolService, libraryService)
- ✅ Working Supabase (AI integration, user auth)
- ❌ NOWY Frontend (React SPA z WYSIWYG, Language support, Real UI)
- ❌ DOKOŃCZONY Supabase schema (sharing, comments, tables)
- ⭐ **POLSKI jako primary language, English jako opcja**

---

## ARCHITEKTURA NOWA

```
Frontend (React + Vite + Tailwind)
├── Pages: Auth, Dashboard, Lesson Editor, Library, Admin, Billing
├── Components: UI kit, Layouts, Lesson-specific
├── I18N: Polish (default) + English
├── Services: USE EXISTING (lessonService, authService, etc.)
└── State: Zustand + React Query

Backend (Supabase - PARTLY EXISTS)
├── Auth: ✅ Works
├── Database: ⚠️ Schema incomplete (missing 5+ tables)
├── Edge Functions: ✅ Works (/api/ai-proxy)
├── AI: ✅ Works (n8n + Claude)
└── Notifications: ✅ Works (email, WhatsApp)
```

---

## FAZA 1: PREPARATION (2 dni)

### 1.1 FIX Supabase Schema
- [ ] Dodaj brakujące tabele:
  - `sharing` (lesson_id, shared_with_user_id, permission)
  - `comments` (lesson_id, user_id, content, created_at)
  - `subscriptions` (jeśli nie ma)
  - `school_profiles` (jeśli nie ma)
  - `teacher_invites` (jeśli nie ma)
- [ ] Verify RLS policies
- [ ] Run migrations

### 1.2 Copy Services do Szkoła_2026
```bash
cp -r School_AI_Custom/src/services Szkoła_2026/src/
cp -r School_AI_Custom/src/types Szkoła_2026/src/
cp -r School_AI_Custom/src/lib Szkoła_2026/src/
```

### 1.3 Setup i18n (Polski + English)
- [ ] Install: `i18next`, `react-i18next`
- [ ] Create:
  - `src/i18n/locales/pl.json` (Polish)
  - `src/i18n/locales/en.json` (English)
- [ ] Create: `src/i18n/config.ts`
- [ ] Create: `src/contexts/LanguageContext.tsx`

### 1.4 Setup UI Framework
- [ ] Install Tailwind CSS (already in vite.config)
- [ ] Create:
  - `src/components/ui/Button.tsx`
  - `src/components/ui/Input.tsx`
  - `src/components/ui/Modal.tsx`
  - ... (reusable components)

### 1.5 Setup Routing & Auth
- [ ] Create: `src/App.tsx` with React Router
- [ ] Create: `src/components/ProtectedRoute.tsx`
- [ ] Create: `src/contexts/AuthContext.tsx` (integrate Supabase)

---

## FAZA 2: AUTHENTICATION (3 dni)

### 2.1 LoginPage
- [ ] Email input + Password input
- [ ] Sign in button
- [ ] Validate locally (Zod)
- [ ] Call `authService.signInWithEmail()`
- [ ] Redirect on success
- [ ] Handle errors with user-friendly messages
- [ ] Polish + English UI strings

### 2.2 SchoolSignupPage
- [ ] Multi-step form:
  - Step 1: School info (name, address, contact)
  - Step 2: Admin info (email, password)
  - Step 3: Curriculum selection
- [ ] Call `authService.signupSchool()`
- [ ] Welcome email TODO (frontend can't send, backend TODO)
- [ ] Polish + English

### 2.3 JoinTeacherPage
- [ ] Invite code input
- [ ] Email + password
- [ ] Call `authService.signupTeacher()`
- [ ] Polish + English

### 2.4 Layouts
- [ ] AuthLayout (centered form)
- [ ] MainLayout (navbar + sidebar + footer)
- [ ] AdminLayout (admin dashboard layout)

---

## FAZA 3: TEACHER DASHBOARD (2-3 dni)

### 3.1 TeacherDashboardPage
- [ ] **FIX**: Use REAL data, not DEMO
  - Call: `lessonService.getTeacherDashboardStats(workspaceId, userId)`
  - Display: materialsCreated, thisMonth, avgQuality
  - Show: Recent 5 lessons
- [ ] Loading skeleton
- [ ] Error boundary
- [ ] Quick actions: "Create Lesson", "Browse Library"
- [ ] Polish + English

### 3.2 Dashboard Stats
- [ ] Lesson count (total + this month)
- [ ] Quality score (average)
- [ ] Recent lessons list (table)
- [ ] Cards, badges, colors

---

## FAZA 4: LESSON EDITOR (5 dni) ⭐ CRITICAL

### 4.1 LessonGeneratorPage
- [ ] Input form:
  - Topic (textarea)
  - Grade level (select)
  - Subject (select)
  - Duration (input)
  - Learning objectives (textarea)
- [ ] Generate button (calls lessonService.generateLesson)
- [ ] Loading state (spinner, "Generating with Claude...")
- [ ] Display generated lesson in editor

### 4.2 WYSIWYG Editor (Tiptap)
- [ ] Install: `@tiptap/react`, `@tiptap/starter-kit`
- [ ] Rich text formatting:
  - Bold, Italic, Underline
  - Headings (H1-H6)
  - Lists (bullet, numbered)
  - Blockquotes, Code blocks
  - Links, Images
- [ ] Content: initial lesson content
- [ ] Toolbar buttons
- [ ] Polish + English UI

### 4.3 Image/File Upload
- [ ] File input (accept images, documents)
- [ ] Supabase Storage integration
- [ ] Upload to: `lessons/{workspaceId}/{lessonId}/assets/`
- [ ] Display: image in editor
- [ ] Manage uploaded files

### 4.4 Draft Auto-save
- [ ] useEffect debounce (300ms)
- [ ] Call: `lessonService.updateLesson()`
- [ ] Show: "Draft saved at..." toast

### 4.5 Lesson Actions
- [ ] Save button (publish)
- [ ] Save as draft button
- [ ] Preview button
- [ ] Export to PDF (pdfExportService.exportToPDF)
- [ ] Share button (open sharing modal)

### 4.6 LessonDetailPage
- [ ] Load lesson: `lessonService.getLesson(id)`
- [ ] Display title, metadata
- [ ] Edit button (open editor)
- [ ] Show: activities, assessment, materials
- [ ] Show: quality score, last updated
- [ ] Show: version history (libraryService.getHistory)

---

## FAZA 5: LIBRARY (3-4 dni)

### 5.1 LibraryPage
- [ ] Search bar (realtime: libraryService.searchMaterials)
- [ ] Filters:
  - Type (lesson, worksheet, quiz, test, syllabus)
  - Subject (Matematyka, Historia, etc.)
  - Grade (1-12)
  - Status (draft, published)
- [ ] Sort (date, quality, title)
- [ ] Pagination (20 per page)
- [ ] Material cards:
  - Thumbnail/preview
  - Title, subject, grade
  - Quality score badge
  - Actions: Open, Share, Delete, Archive

### 5.2 Search + Filter
- [ ] Real-time search (debounce 300ms)
- [ ] Call: `libraryService.getMaterials(filters)`
- [ ] Display results
- [ ] Empty state: "No materials found"

### 5.3 Sharing
- [ ] Share modal:
  - Teacher email input
  - Permission select (view, edit)
  - Send button
  - TODO: Call `lessonService.shareLesson()` (need API)
- [ ] Show: shared with list

### 5.4 Comments
- [ ] Comments section on lesson
- [ ] Add comment form
- [ ] Display comments (TODO: API)
- [ ] Delete own comment

---

## FAZA 6: ADMIN PANEL (2-3 dni)

### 6.1 AdminDashboardPage
- [ ] School stats: `schoolService.getSchoolDashboardStats()`
  - Teacher count
  - Lessons generated (this month)
  - Usage % (tokens)
  - Subscription status
- [ ] Recent activity (system_logs)
- [ ] Quick links: Manage teachers, Settings, Analytics

### 6.2 Teachers Management
- [ ] List teachers: `schoolService.getTeachers()`
  - Name, email, status
  - Materials generated
  - Join date
  - Actions: View, Suspend, Remove
- [ ] Invite teacher form: `schoolService.inviteTeacher()`
- [ ] Manage roles (teacher, admin)

### 6.3 School Settings
- [ ] School info (name, address, contact)
- [ ] Logo upload
- [ ] Language selection (PL / EN)
- [ ] Notification preferences
- [ ] Curriculum selection
- [ ] Call: `schoolService.updateSchoolSettings()`

### 6.4 Billing
- [ ] Current subscription
- [ ] Usage metrics
- [ ] Upgrade/downgrade button (TODO: Stripe)
- [ ] Invoice history (TODO: Stripe)

---

## FAZA 7: POLISH LANGUAGE + I18N (1-2 dni)

### 7.1 i18n Setup
- [ ] Polish (pl) - default
  - All UI strings
  - Error messages
  - Form labels
  - Notifications
- [ ] English (en) - secondary
- [ ] Language switcher in Settings
- [ ] Store language in localStorage + workspaces.settings

### 7.2 Polish Content
- [ ] Subject names: Matematyka, Historia, Biologia, etc.
- [ ] Grade names: Klasa 1-8 (podstawowa), 1-3 (gimnazjum), 1-3 (liceum)
- [ ] Curriculum Polish names
- [ ] Error messages in Polish

### 7.3 Email Templates
- [ ] Polish: Welcome email, Invite email, Notification emails
- [ ] English: Same (backend service)

---

## FAZA 8: TESTING & POLISH (2 dni)

### 8.1 E2E Tests (Playwright)
- [ ] Auth flow: signup, login, logout
- [ ] Dashboard: load real data
- [ ] Editor: create, save, publish lesson
- [ ] Library: search, filter, view
- [ ] Admin: manage teachers, settings

### 8.2 Visual Testing
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Light + dark mode
- [ ] Polish + English (check all strings)

### 8.3 Performance
- [ ] Bundle size
- [ ] Page load times
- [ ] Search debounce

---

## TECHNOLOGY STACK

### Frontend
- **React 18** + TypeScript
- **Vite** build
- **React Router 6** (routing)
- **Tailwind CSS** (styling)
- **i18next** (localization)
- **Zustand** (state)
- **React Query** (@tanstack/react-query) (server state)
- **Tiptap** (WYSIWYG editor)
- **React Hook Form** + **Zod** (form validation)
- **Playwright** (E2E tests)

### Backend (USE EXISTING)
- **Supabase** (Auth, Database, Storage)
- **n8n** (AI workflows, notifications)
- **Claude API** (via n8n)
- **Stripe** (billing - TODO)

### Services (COPY FROM School_AI_Custom)
- lessonService.ts
- authService.ts
- schoolService.ts
- libraryService.ts
- emailService.ts
- emailNotificationService.ts
- pdfExportService.ts
- whatsappNotificationService.ts
- n8nIntegrationService.ts

---

## TIMELINE

| Faza | Dni | Zadania |
|------|-----|---------|
| 1. Prep | 2 | Schema, Services, i18n, UI kit |
| 2. Auth | 3 | Login, Signup, Layouts |
| 3. Dashboard | 2-3 | Stats, Real data |
| 4. Editor | 5 | Tiptap, Upload, Auto-save |
| 5. Library | 3-4 | Search, Filter, Share, Comments |
| 6. Admin | 2-3 | Teachers, Settings, Billing |
| 7. Polish | 1-2 | i18n, Polish content |
| 8. Testing | 2 | E2E, Visual, Performance |
| **TOTAL** | **~23-25 dni** | Produkcja-ready |

---

## DEPENDENCIES DO ZAINSTALOWANIA

```bash
npm install react react-dom react-router-dom
npm install typescript @types/react @types/react-dom
npm install -D vite @vitejs/plugin-react

npm install tailwindcss postcss autoprefixer
npm install -D @tailwindcss/forms

npm install i18next react-i18next
npm install zustand
npm install @tanstack/react-query
npm install @tiptap/react @tiptap/starter-kit
npm install react-hook-form zod @hookform/resolvers

npm install @supabase/supabase-js
npm install @stripe/react-stripe-js stripe (later)

npm install -D @playwright/test
```

---

## KEY POINTS

### ⭐ JĘZYK POLSKI
- Default: PL
- Polish UI strings EVERYWHERE
- Polish subject/grade names
- Polish error messages
- English jako fallback

### ⭐ REAL DATA
- Fix Dashboard (no more DEMO)
- Real queries to Supabase
- Real lesson counts

### ⭐ WYSIWYG EDITOR
- Tiptap z pełnym formatting
- Image upload
- Draft auto-save

### ⭐ PERFORMANCE
- Debounce search
- Lazy load routes
- Image optimization

### ⭐ TESTING
- E2E tests dla critical flows
- Visual regression tests
- Mobile responsive tests

---

## NEXT STEPS

1. ✅ **Read** pełną analiza (DONE)
2. ⏳ **Approve** plan (WAITING FOR APPROVAL)
3. 🔄 **Start Faza 1**: Supabase schema + Services copy
4. 🎨 **Continue Faza 2-8**: Build incrementally

---

**Koniec - PLAN JEST GOTOWY!**
