# SZKOŁA 2026 - DOKUMENTACJA PROJEKTU

**Data analizy**: 2026-06-08
**Status**: Gotowy do budowy
**Lokalizacja**: `C:\Visual Studio Code\Projekty\Szkoła_2026`

---

## QUICK LINKS

| Dokument | Zawartość | Priorytet |
|----------|-----------|-----------|
| **PLAN_BUDOWY_FRONTENDU.md** | Kompletny 8-fazowy plan budowy | 🔴 CZYTAJ NAJPIERW |
| **ANALIZA_FUNKCJONALNOSCI.md** | Co działa, co brakuje, status 35% | 🟡 CZYTAJ DRUGIE |
| **SERVICES_I_SCHEMA_ANALIZA.md** | Szczegółowa analiza 19 services + 25 tabel | 🟢 CZYTAJ TRZECIE |
| **NOTATKI_ANALIZA.md** | Surowe notatki ze zbierania danych | 🔵 CZYTAJ NA KONIEC |

---

## PODSUMOWANIE W 2 MINUTY

### Co się dzieli?

**School_AI_Custom** = Aplikacja szkolna do generowania lekcji via Claude AI

```
Nauczyciel
  ↓ Input: topic, grade, duration, objectives
  ↓ AI generuje lekcję (Claude via n8n)
  ↓ Lekcja zapisuje się w Supabase
  ↓ Nauczyciel może edytować i publikować
  ↓ Udostępnić innym nauczycielom
  ↓ Export to PDF
```

### Status: 40-50% Ready

| Część | Status | Notatka |
|-------|--------|---------|
| **AI Generation** | ✅ 90% | Działa! Claude via n8n |
| **Auth** | ⚠️ 70% | Email wysyłanie TODO |
| **Frontend** | ❌ 20% | Demo data, brak UI |
| **Database** | ⚠️ 70% | Schema incomplete (brakuje 5 tabel) |
| **Language** | ❌ 10% | Tylko setting, no i18n |

### Co zrobić?

**Budować Szkoła_2026** - nowy frontend od zera z:
- ✅ Istniejące Services (lessonService, authService, etc.)
- ✅ Działające Supabase (AI, Auth)
- ❌ NOWY UI (React + Tailwind + i18n)
- ⭐ **POLSKI jako default, ENGLISH jako opcja**

### Timeline: ~23-25 dni

```
Faza 1 (2d): Prep - Schema, Services, i18n
Faza 2 (3d): Auth - Login, Signup
Faza 3 (2d): Dashboard - Real data
Faza 4 (5d): Editor - WYSIWYG, Upload ⭐
Faza 5 (3d): Library - Search, Share, Comments
Faza 6 (2d): Admin - Teachers, Settings
Faza 7 (1d): Polish - Language support
Faza 8 (2d): Testing - E2E, Mobile
```

---

## KLUCZOWE ODKRYCIA

### ✅ CO DZIAŁA

1. **AI Generation** - Claude 3.5 Sonnet generuje lekcje via n8n
2. **Supabase Auth** - Email/password signup i login
3. **Database** - 25 tabel + indexes (schema INCOMPLETE)
4. **Services Layer** - 19 serwisów (lessonService, authService, etc.)
5. **Notifications** - Email + WhatsApp via n8n
6. **PDF Export** - Lekcje można exportować

### ❌ CO NIE DZIAŁA

1. **Dashboard** - Pokazuje DEMO data zamiast real
2. **Editor** - Brakuje WYSIWYG, można tylko czytać
3. **Sharing** - API exists, brak UI
4. **Comments** - Tabela brakuje
5. **File Upload** - Brakuje
6. **i18n** - Tylko setting field
7. **Admin Panel** - UI missing
8. **Billing** - Schema może być incomplete

### 🔴 BRAKUJĄCE TABELE W SUPABASE

```sql
sharing              -- lesson_id, shared_with_user_id, permission
comments            -- lesson_id, user_id, content
subscriptions       -- workspace_id, plan, status (może być incomplete)
school_profiles     -- Referenced w authService
teacher_invites     -- Referenced w authService
```

---

## WAŻNE: JĘZYK POLSKI + ENGLISH

**APLIKACJA MUSI DZIAŁAĆ W JĘZYKU POLSKIM** (domyślnie)

```json
{
  "schoolSettings": {
    "language": "pl"  // "pl" or "en"
  }
}
```

### Gdzie jest język:
- ✅ schoolService.ts - `language: workspace?.settings?.language || 'pl'`
- ❌ Frontend UI - brakuje i18n
- ❌ i18n system - brakuje

### Co trzeba:
1. i18next + react-i18next
2. Polish (pl) strings - wszystkie UI tekst
3. English (en) strings - fallback
4. Language switcher w Settings
5. Polish subject/grade names (Matematyka, Historia, etc.)

---

## ARCHITECTURE

### Frontend
```
React 18 + TypeScript
├── Pages (Auth, Dashboard, Editor, Library, Admin)
├── Components (UI kit, Layouts, Lesson-specific)
├── Services (COPY from School_AI_Custom)
├── i18n (Polish + English)
├── State (Zustand + React Query)
└── Styles (Tailwind CSS)
```

### Backend
```
Supabase (PARTLY exists)
├── Auth: ✅ Works
├── Database: ⚠️ Schema incomplete
├── Edge Functions: ✅ /api/ai-proxy
├── AI: ✅ Claude via n8n
└── Notifications: ✅ Email + WhatsApp
```

### Services (19 files)
```
lessonService       - Generate, save, publish lessons
authService         - Signup, login, invite teachers
schoolService       - School settings, teachers management
libraryService      - Search, filter, stats
emailService        - Send emails
pdfExportService    - Export to PDF
... + 13 more
```

---

## PLAN NA KONKRETNIE

### Faza 1: PREPARATION (2 dni)

```bash
# 1. Fix Supabase schema (add missing tables)
# 2. Copy services:
cp -r School_AI_Custom/src/services Szkoła_2026/src/
cp -r School_AI_Custom/src/types Szkoła_2026/src/
cp -r School_AI_Custom/src/lib Szkoła_2026/src/

# 3. Setup i18n
npm install i18next react-i18next

# 4. Setup UI components
npm install @tiptap/react @tiptap/starter-kit

# 5. Setup Tailwind
npm install tailwindcss postcss autoprefixer
```

### Faza 2: AUTHENTICATION (3 dni)

```
LoginPage
 ├── Email + Password input
 ├── Sign in button
 ├── Call authService.signInWithEmail()
 └── Redirect to dashboard

SchoolSignupPage
 ├── Multi-step (School info → Admin info → Curriculum)
 ├── Call authService.signupSchool()
 └── Polish + English UI

JoinTeacherPage
 ├── Invite code + Email + Password
 ├── Call authService.signupTeacher()
 └── Polish + English UI
```

### Faza 3: DASHBOARD (2-3 dni)

```
TeacherDashboardPage
 ├── FIX: Real data (lessonService.getTeacherDashboardStats())
 ├── Stats cards (lessons, quality, usage)
 ├── Recent lessons table
 ├── Quick actions (Create Lesson, Browse Library)
 └── Polish + English
```

### Faza 4: EDITOR (5 dni) ⭐

```
LessonGeneratorPage
 ├── Input form (topic, grade, subject, duration, objectives)
 ├── Generate button → AI generation
 └── WYSIWYG Editor:
     ├── Tiptap rich text
     ├── Bold, Italic, Headings, Lists
     ├── Image upload
     ├── Draft auto-save (debounce 300ms)
     └── Save/Publish/Preview buttons
```

### Faza 5: LIBRARY (3-4 dni)

```
LibraryPage
 ├── Search bar (debounce → libraryService.searchMaterials())
 ├── Filters (type, subject, grade, status, quality)
 ├── Sort (date, quality, title)
 ├── Pagination (20/page)
 ├── Material cards (preview, title, subject, quality badge)
 ├── Actions (Open, Share, Delete, Archive)
 └── Sharing modal
     ├── Teacher email input
     ├── Permission select
     └── Send button
```

### Faza 6: ADMIN (2-3 dni)

```
AdminDashboardPage
 ├── Stats (schoolService.getSchoolDashboardStats())
 ├── Recent activity logs
 └── Quick actions

TeachersManagement
 ├── List teachers (schoolService.getTeachers())
 ├── Invite teacher form
 └── Manage roles

SchoolSettings
 ├── School info, Logo upload
 ├── Language selection (PL/EN)
 ├── Notification preferences
 └── Call schoolService.updateSchoolSettings()
```

### Faza 7: POLISH LANGUAGE (1-2 dni)

```
i18n Setup
 ├── Polish (pl) - default
 ├── English (en) - fallback
 └── Language switcher in Settings

Polish Content
 ├── Subject names (Matematyka, Historia, Biologia...)
 ├── Grade names (Klasa 1-8...)
 ├── All UI strings in Polish
 └── Error messages in Polish
```

### Faza 8: TESTING (2 dni)

```
E2E Tests (Playwright)
 ├── Auth flow (signup, login, logout)
 ├── Dashboard (load real data)
 ├── Editor (create, save, publish)
 ├── Library (search, filter, view)
 └── Admin (manage teachers, settings)

Visual Testing
 ├── Responsive (mobile, tablet, desktop)
 ├── Polish + English UI
 └── Dark + light mode
```

---

## KEY TECHNOLOGIES

**Frontend**:
- React 18 + TypeScript + Vite
- Tailwind CSS (styling)
- Tiptap (WYSIWYG editor)
- i18next (localization)
- React Hook Form + Zod (validation)
- Zustand (state)
- React Query (server state)
- Playwright (E2E tests)

**Backend** (EXISTING, USE IT):
- Supabase (Auth, Database, Storage)
- n8n (AI workflows, notifications)
- Claude API (via n8n)

---

## DONE CHECKLIST

✅ Analiza School_AI_Custom (40-50% ready)
✅ Identyfikacja brakujących tabel
✅ Plan 8 faz buildowy
✅ Wybór technologii
✅ ⭐ POLSKI + ENGLISH language strategy
✅ Timeline ~23-25 dni
✅ Wszystkie dokumenty napisane

---

## NEXT STEPS

1. ✅ **Read** - całą dokumentację (DONE)
2. ⏳ **Approve** - plan (WAITING)
3. 🔄 **Start Faza 1** - Supabase schema + Services

---

**APPLICANT IS READY FOR PRODUCTION**

Wszystkie informacje są tutaj. Możemy zaczynać budowę!
