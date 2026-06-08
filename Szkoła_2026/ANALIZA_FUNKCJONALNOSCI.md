# ANALIZA FUNKCJONALNOŚCI - School_AI_Custom

**Data**: 2026-06-08
**Status**: Pełna analiza architektury i funkcjonalności

---

## SPIS TREŚCI

1. Przegląd ogólny
2. Funkcjonalności
3. Architektura
4. Usługi (Services)
5. Przepływ danych
6. Problemy i luki

---

## Przegląd Ogólny

**Aplikacja**: School_AI_Custom (edukacyjna platforma dla nauczycieli)
**Technologia**: React 18 + TypeScript + Vite + Tailwind + Supabase
**Cel**: Generowanie, edytowanie, i udostępnianie lekcji przez nauczycieli

---

## FUNKCJONALNOŚCI

### 1. TEACHER DASHBOARD
**Lokalizacja**: `src/pages/teacher/TeacherDashboardPage.tsx`
**Cel**: Pokazać nauczycielowi statystyki i recent lessons

**Co robi**:
- Wyświetla welcome message
- Pokazuje statystyki:
  - Materials Created (All time)
  - This Month
  - Last 30 days
  - Quality Score (0/100 Average)
- Lista recent materials

**Problem**: 
- ❌ Zawsze pokazuje DEMO data (hardcoded)
- ❌ Nigdy nie ładuje real data z Supabase
- ❌ Workspace ID jest hardcoded jako 'demo-workspace'

**Powinno działać**:
- ✅ Łączy się do Supabase
- ✅ Ładuje real stats dla nauczyciela
- ✅ Wyświetla actual lessons count
- ✅ Pokazuje quality score

---

### 2. LESSON GENERATOR (Lesson Creator)
**Lokalizacja**: `src/pages/teacher/LessonGeneratorPage.tsx`
**Cel**: Nauczyciel wprowadza prompt, AI generuje lekcję

**Input**:
- Topic (np. "Matematyka - Równania")
- Grade Level (np. "Grade 7")
- Duration (np. "45 minutes")
- Learning Objectives (np. "Understand quadratic equations")

**Process**:
1. Nauczyciel klika "Generate"
2. lessonService.generateLesson(input) 
3. → Supabase Edge Function
4. → n8n Webhook
5. → Claude API (via n8n)
6. → Returns structured lesson

**Output**:
- Title
- Content (HTML/rich text)
- Activities
- Assessment
- Materials
- Quality Score (1-100)

**Problem**:
- ❌ Brak WYSIWYG editor - nie można editować content
- ❌ Brak rich text formatting
- ❌ Brak image/file upload
- ❌ Lesson nie jest automatycznie saved
- ❌ Brak draft management

**Status**: ⚠️ Partial - generuje lekcje ale nie można editować

---

### 3. LESSON DETAIL PAGE
**Lokalizacja**: `src/pages/teacher/LessonDetailPage.tsx`
**Cel**: View/edit single lesson

**Co robi**:
- Gets lesson by ID from URL
- Displays lesson content
- Shows activities
- Shows assessment
- Shows materials

**Problem**:
- ❌ Brak edit functionality
- ❌ Read-only view
- ❌ Brak ability to update

**Status**: ❌ Nie działa - tylko view mode

---

### 4. LIBRARY PAGE
**Lokalizacja**: `src/pages/library/LibraryPage.tsx`
**Cel**: Browse/search all lessons

**Co robi**:
- Ładuje lessons z Supabase
- Wyświetla listę lessons
- Simple click to open

**Problem**:
- ❌ Brak search
- ❌ Brak filters (subject, grade, date)
- ❌ Brak sorting
- ❌ Brak pagination
- ❌ Brak sharing UI
- ❌ Brak comments

**Status**: ❌ Nie działa - pusta strona

---

### 5. BILLING PAGE
**Lokalizacja**: `src/pages/billing/BillingPage.tsx`
**Cel**: Manage subscription (dla szkoły/workspace)

**Co robi**:
- NICZEGO! Tylko layout

**Powinno działać**:
- Show current subscription
- Pricing tiers table
- Upgrade/downgrade
- Invoice history
- Payment method management
- Stripe integration

**Status**: ❌ Stub - nie wdrożone

---

### 6. ADMIN DASHBOARD
**Lokalizacja**: `src/pages/admin/AdminDashboardPage.tsx`
**Cel**: Admin manage schools, users, analytics

**Co robi**:
- NICZEGO! Tylko "Coming soon"

**Powinno działać**:
- User management
- School management
- Analytics
- Audit logs
- Support tickets

**Status**: ❌ Stub - nie wdrożone

---

### 7. AUTH PAGES
**Lokalizacja**: `src/pages/auth/`

#### LoginPage:
- Email/password form
- Supabase Auth integration
- Redirect to dashboard on success
- Status: ✅ Works

#### SchoolSignupPage:
- Multi-step form for school registration
- Create workspace
- Create admin user
- Status: ⚠️ Partial

#### JoinTeacherPage:
- Teacher joins existing school
- Status: ⚠️ Minimal

---

### 8. LESSON SERVICE (Backend)
**Lokalizacja**: `src/services/lessonService.ts`

**Methods**:
- generateLesson() → ✅ Works (calls n8n + Claude)
- getLesson() → ✅ Works
- saveLesson() → ✅ Works
- getTeacherDashboardStats() → ❌ Returns DEMO data
- getLibraryLessons() → ⚠️ No filters/search
- exportLessonToPDF() → ✅ Works
- shareLesson() → ❌ Not implemented

---

### 9. OTHER SERVICES

**AuthService**: 
- signInWithEmail() → ✅ Works
- signUpSchool() → ⚠️ Partial
- signUpTeacher() → ⚠️ Minimal

**SchoolService**: 
- getWorkspace() → ⚠️ Stub
- updateWorkspace() → ⚠️ Stub
- inviteTeacher() → ❌ Not implemented

**LibraryService**: 
- getLibraryLessons() → ⚠️ No real search/filter

**BillingService**: 
- ❌ NOTHING - Stripe missing

**NotificationService**: 
- sendEmailNotification() → ✅ Ready (n8n)
- sendWhatsAppNotification() → ✅ Ready (n8n)

**PDFExportService**: 
- exportToPDF() → ✅ Ready

---

## ARCHITEKTURA

### Data Flow (Lesson Generation)

```
Teacher inputs:
  ↓
LessonGeneratorPage (input form)
  ↓
lessonService.generateLesson()
  ↓
Supabase Edge Function
  ↓
n8n Webhook
  ↓
Claude API
  ↓
Response (structured lesson)
  ↓
lessonService.saveLesson()
  ↓
Supabase: INSERT into lessons table
  ↓
TeacherDashboard (refresh stats)
```

### Database Tables (Supabase)

**lessons**:
- id, title, content, topic, grade_level
- duration, author_id, workspace_id
- quality_score, created_at, updated_at

**lessons_versions**:
- id, lesson_id, version, content, created_at

**workspaces** (Schools):
- id, name, owner_id, subscription_plan

**profiles** (Users):
- id, email, full_name, role, workspace_id

**sharing** (Lesson sharing):
- lesson_id, shared_with_user_id, permission

---

## STATUS PODSUMOWANIE

### ✅ WORKING (Gotowe):
1. Login/Signup - Supabase Auth works
2. Lesson Generation - AI generates via n8n
3. Save/Load Lessons - Database works
4. PDF Export - Lessons export to PDF
5. Email + WhatsApp Notifications - n8n configured

### ⚠️ PARTIAL (Częściowo):
1. Dashboard - Shows DEMO data instead of real
2. Library - Exists but no search/filter/share
3. Detail Page - View works, edit doesn't
4. Sharing - API ready, no UI
5. Signup - Multi-step, needs testing

### ❌ BROKEN/MISSING (Nie działa):
1. WYSIWYG Editor - Can't edit content
2. File Upload - No images/documents
3. Comments/Feedback - Not implemented
4. Version History UI - API exists, no UI
5. Stripe Billing - No payment processing
6. Real-time Updates - No live collaboration
7. Pagination - Breaks with many lessons
8. Admin Panel - Nothing implemented

---

## KONKLUZJA

**School_AI_Custom jest ~35% gotowa do użytku.**

### Co działa:
- AI generuje lekcje (via Claude + n8n)
- Nauczyciel może zalogować się
- Lekcje się zapisują
- PDF export
- Email/WhatsApp ready

### Co nie działa:
- Frontend pokazuje DEMO data (nie real)
- Nie można editować lekcji (brak editora)
- Library nie ma search/filter
- Sharing nie ma UI
- Billing/Admin są stubs
- Wiele innych funkcji brakuje

### Aby było produkcyjne trzeba:
1. Fix dashboard (real data) - 1 dzień
2. Add WYSIWYG editor - 2 dni
3. Build library search/filter - 1 dzień
4. Add file upload - 1 dzień
5. Build sharing UI - 1 dzień
6. Implement billing - 2 dni
7. Build admin panel - 2 dni
8. Add comments/feedback - 1 dzień
9. Setup real-time - 1 dzień
10. Complete Stripe - 1 dzień

**TOTAL: ~13 dni pracy frontendzie**
