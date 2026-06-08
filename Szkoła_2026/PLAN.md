# PLAN PRZEBUDOWY APLIKACJI SZKOLNEJ - Szkoła_2026

## EXECUTIVE SUMMARY

Obecna aplikacja `School_AI_Custom` zawiera:
- ✅ **Funkcjonalności**: Teacher dashboard, Lesson generator, Library, Billing, Admin panel
- ✅ **Backend**: Supabase integration, Email/WhatsApp notifications, PDF export
- ❌ **Problem**: Frontend ma DEMO data, nie łączy się do Supabase, UI jest minimalistyczny

**Rozwiązanie**: Stworzyć nowy projekt `Szkoła_2026` z kompletnym, profesjonalnym frontendem

---

## 1. ARCHITEKTURA APLIKACJI

### 1.1 Core Features

| Feature | Status | Opis |
|---------|--------|------|
| **Authentication** | Partial | Login, signup, pero no role-based access |
| **Teacher Dashboard** | Demo | Statystyki, recent lessons (demo data) |
| **Lesson Generator** | Minimal | Bez WYSIWYG editor |
| **Lesson Library** | Empty | Search/filter missing |
| **Sharing** | Missing | Brak możliwości dzielenia się lekcjami |
| **Billing** | Stub | Tylko layout, no stripe integration |
| **Admin Panel** | Stub | Bez functional admin features |
| **Notifications** | Ready | Email + WhatsApp via n8n |
| **Export** | Ready | PDF export via lessonService |

### 1.2 Data Model

```
Workspace (School)
├── Profiles (Teachers, Students)
├── Lessons
│   ├── LessonVersions
│   ├── LessonMaterials (content, images, docs)
│   ├── Sharing (permissions)
│   └── Comments
├── Subscriptions
├── Tags
└── AuditLogs
```

### 1.3 Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **State**: React Context + React Query
- **Editor**: WYSIWYG (Tiptap/Slate)
- **Real-time**: Supabase realtime subscriptions
- **Notifications**: Email + WhatsApp (n8n)
- **Payments**: Stripe integration (TODO)

---

## 2. ANALIZA OBECNEGO KODU

### 2.1 Co DZIAŁA

**Services (ready to use)**:
```
lessonService.ts       - generateLesson(), getLesson(), saveLesson()
schoolService.ts       - workspace management
authService.ts         - login/signup
libraryService.ts      - search/filter
billingService.ts      - subscription management
emailService.ts        - send emails
pdfExportService.ts    - export to PDF
whatsappService.ts     - send WhatsApp messages
```

**Contexts (state management)**:
```
AppContext             - workspace, user, auth state
AuthContext            - session, user profile
WorkspaceContext       - school/workspace data
ThemeContext           - dark/light mode
```

**Types (data structures)**:
```
lesson.ts              - LessonGeneratorInput, LessonGeneratorOutput, TeacherDashboardStats
```

### 2.2 Co BRAKUJE / jest ZŁE

#### Frontend Issues:
1. **Dashboard** - pokazuje DEMO data zamiast prawdziwych danych
2. **Lesson Editor** - brak WYSIWYG editor, brak rich text formatting
3. **Library** - pusta strona, brak search/filter UI
4. **Styling** - minimalistyczny (tailwind basics), brak animations
5. **Responsive** - nie optimized dla mobile
6. **Loading States** - brakują spinners, skeletons
7. **Error Handling** - brak user-friendly error messages
8. **Validation** - brak client-side validation

#### Backend Issues:
1. **Mock Data** - services zwracają hardcoded demo data
2. **Supabase** - integration is incomplete, brakuje RLS policies
3. **Real-time** - brak real-time updates
4. **File Upload** - brak storage integration
5. **Versioning** - brak lesson version control
6. **Comments** - brak implementation

#### Missing Features:
- [ ] Drag & drop editor
- [ ] WYSIWYG content editor
- [ ] Lesson templates
- [ ] Bulk import (CSV)
- [ ] Lesson scheduling
- [ ] Student assignments
- [ ] Grade/feedback system
- [ ] Mobile app
- [ ] Offline mode
- [ ] Real-time collaboration

---

## 3. PLAN PRZEBUDOWY (6 FAZE)

### Faza 1: SETUP & STRUCTURE (1-2 dni)
**Cel**: Stworzyć nowy projekt z proper structure i Supabase schema

**Zadania**:
- [ ] Crear folder `C:\Visual Studio Code\Projekty\Szkoła_2026`
- [ ] Initialize project (`npm create vite@latest`)
- [ ] Install dependencies (React, React Router, Tailwind, Supabase, etc.)
- [ ] Setup Supabase schema (migrations)
- [ ] Configure environment variables
- [ ] Setup project folder structure
- [ ] Initialize git repo

**Output**:
- Clean project scaffold
- Supabase tables created
- .env configured

---

### Faza 2: AUTH & CORE PAGES (3-4 dni)
**Cel**: Functional authentication + basic layout

**Zadania**:
- [ ] Setup Supabase Auth (email/password)
- [ ] LoginPage component
- [ ] SchoolSignupPage (multi-step form)
- [ ] JoinTeacherPage
- [ ] MainLayout (navbar, sidebar)
- [ ] ProtectedRoute wrapper
- [ ] Session persistence
- [ ] Role-based access control (RBAC)

**Output**:
- Working login/signup flow
- Protected routes
- Nav + sidebar layout
- User session management

---

### Faza 3: TEACHER DASHBOARD (2-3 dni)
**Cel**: Real dashboard with actual data from Supabase

**Zadania**:
- [ ] TeacherDashboardPage - connect to lessonService
- [ ] Dashboard statistics (lessons created, this month, avg quality)
- [ ] Recent lessons list
- [ ] Quick actions (Create new lesson, View library)
- [ ] Loading skeletons
- [ ] Error boundaries
- [ ] Dark mode support

**Output**:
- Working dashboard with real data
- Proper loading/error states

---

### Faza 4: LESSON EDITOR (4-5 dni)
**Cel**: Full-featured lesson editor with WYSIWYG

**Zadania**:
- [ ] Install & setup Tiptap (WYSIWYG editor)
- [ ] LessonGeneratorPage - editor UI
- [ ] Content formatting (bold, italic, headings, lists, etc.)
- [ ] Image upload integration
- [ ] File upload (documents, resources)
- [ ] Draft auto-save
- [ ] Live preview
- [ ] LessonDetailPage - view/edit lesson
- [ ] Lesson versioning (show history)

**Output**:
- Professional lesson editor
- Image/file handling
- Draft management

---

### Faza 5: LIBRARY & SHARING (3-4 dni)
**Cel**: Searchable lesson library with sharing capabilities

**Zadania**:
- [ ] LibraryPage - lesson grid/table
- [ ] Search functionality
- [ ] Filters (by tag, category, date, author)
- [ ] Sorting options
- [ ] Sharing UI (share with teacher, view permissions)
- [ ] Comments system
- [ ] Favorite/bookmark lessons
- [ ] Export to PDF/DOCX

**Output**:
- Functional lesson library
- Search + filters working
- Sharing working

---

### Faza 6: ADMIN & BILLING (3-4 dni)
**Cel**: Admin panel + subscription management

**Zadania**:
- [ ] AdminDashboardPage
- [ ] User management (list, roles, suspend)
- [ ] School management (workspace settings)
- [ ] BillingPage - pricing tiers
- [ ] Stripe integration (payment processing)
- [ ] Invoice history
- [ ] Usage analytics
- [ ] Audit logs

**Output**:
- Functional admin panel
- Working subscription system
- Payment processing

---

## 4. STRUKTURA PROJEKTU

```
Szkoła_2026/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Tabs.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── MainLayout.tsx
│   │   │   ├── AuthLayout.tsx
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   └── lesson/
│   │       ├── LessonEditor.tsx
│   │       ├── LessonPreview.tsx
│   │       ├── RichTextEditor.tsx
│   │       └── FileUploader.tsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SchoolSignupPage.tsx
│   │   │   └── JoinTeacherPage.tsx
│   │   ├── teacher/
│   │   │   ├── TeacherDashboardPage.tsx
│   │   │   ├── LessonGeneratorPage.tsx
│   │   │   └── LessonDetailPage.tsx
│   │   ├── library/
│   │   │   └── LibraryPage.tsx
│   │   ├── admin/
│   │   │   ├── AdminDashboardPage.tsx
│   │   │   ├── UsersPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   └── billing/
│   │       ├── BillingPage.tsx
│   │       ├── PricingPage.tsx
│   │       └── InvoicesPage.tsx
│   ├── services/
│   │   ├── supabase.ts
│   │   ├── lessonService.ts
│   │   ├── authService.ts
│   │   ├── schoolService.ts
│   │   ├── libraryService.ts
│   │   ├── billingService.ts
│   │   └── ...
│   ├── contexts/
│   │   ├── AppContext.tsx
│   │   ├── AuthContext.tsx
│   │   ├── WorkspaceContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useLesson.ts
│   │   └── useWorkspace.ts
│   ├── types/
│   │   ├── lesson.ts
│   │   ├── workspace.ts
│   │   ├── user.ts
│   │   └── ...
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   ├── styles/
│   │   ├── globals.css
│   │   └── variables.css
│   ├── App.tsx
│   └── main.tsx
├── public/
├── .env.example
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## 5. NOWE DEPENDENCIES

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.x",
    "typescript": "^5.x",
    
    "tailwindcss": "^3.x",
    "@headlessui/react": "^1.x",
    
    "@supabase/supabase-js": "^2.x",
    "@supabase/auth-ui-react": "^0.x",
    
    "@tanstack/react-query": "^5.x",
    
    "@tiptap/react": "^2.x",
    "@tiptap/starter-kit": "^2.x",
    
    "react-dnd": "^16.x",
    "react-dnd-html5-backend": "^16.x",
    
    "zustand": "^4.x",
    
    "stripe": "^13.x",
    "@stripe/react-stripe-js": "^2.x",
    
    "date-fns": "^2.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.x",
    "vite": "^5.x",
    "@types/react": "^18.x",
    "@types/node": "^20.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x",
    "tailwindcss": "^3.x"
  }
}
```

---

## 6. TIMELINE

| Faza | Dni | Start | End |
|------|-----|-------|-----|
| 1. Setup | 1-2 | Day 1 | Day 2 |
| 2. Auth | 3-4 | Day 2 | Day 5 |
| 3. Dashboard | 2-3 | Day 5 | Day 8 |
| 4. Lesson Editor | 4-5 | Day 8 | Day 13 |
| 5. Library | 3-4 | Day 13 | Day 16 |
| 6. Admin/Billing | 3-4 | Day 16 | Day 20 |
| **TOTAL** | **~20 dni** | | |

---

## 7. KNOWLEDGE BASE

### Funkcjonalności do zaimplementowania:

1. **Lesson Generator**
   - Input: curriculum, grade level, topic, duration, learning objectives
   - Output: structured lesson plan with content, activities, assessment
   - Integration: AI model (Claude API via n8n)
   - Storage: Supabase table `lessons`

2. **Rich Content Editor**
   - Formatting: bold, italic, headings, lists, blockquotes, code blocks
   - Media: images, videos, documents, links
   - Templates: pre-built lesson templates
   - Collaboration: real-time collaboration (Supabase realtime)

3. **Lesson Library**
   - Search: by title, content, tags
   - Filters: by subject, grade, duration, created date
   - Sharing: with specific teachers or school-wide
   - Comments: feedback on lessons
   - Versions: maintain lesson history

4. **Teacher Dashboard**
   - Statistics: total lessons, this month, avg quality
   - Recent lessons: last 5 created
   - Tasks: pending reviews, assignments
   - Notifications: sharing requests, comments

5. **Admin Panel**
   - User management: invite, roles, suspend
   - School settings: name, logo, subscription
   - Analytics: usage, active teachers, lessons created
   - Billing: subscription status, invoices

6. **Billing System**
   - Pricing tiers: free, professional, enterprise
   - Subscription management: upgrade, cancel, pause
   - Stripe integration: payment processing
   - Invoicing: automatic invoice generation

---

## 8. KEY DESIGN DECISIONS

1. **State Management**: Zustand (simpler than Redux, works with React Query)
2. **Form Handling**: React Hook Form + Zod validation
3. **UI Components**: Custom Tailwind components (no shadcn initially)
4. **Editor**: Tiptap (lightweight, extensible, React-native)
5. **Real-time**: Supabase realtime subscriptions (built-in)
6. **API**: Supabase service-layer approach (encapsulated in services/)
7. **Auth**: Supabase Auth with email/password + RBAC
8. **Database**: PostgreSQL with Row-Level Security (RLS)

---

## 9. SUCCESS CRITERIA

- [ ] All pages render without errors
- [ ] Login/signup flow works end-to-end
- [ ] Lesson creation and editing works
- [ ] Library search and filters work
- [ ] Real data from Supabase displays correctly
- [ ] Responsive design works on mobile (320px+)
- [ ] Dark mode toggle works
- [ ] Error boundaries catch errors gracefully
- [ ] Loading states display properly
- [ ] 80%+ code coverage with E2E tests

---

## NEXT STEPS

1. ✅ **Approve Plan** - Confirm this approach with stakeholders
2. 🔄 **Start Faza 1** - Create project scaffold + Supabase schema
3. 📋 **Document APIs** - Map out all service methods
4. 🎨 **Design System** - Create Figma/design mockups for consistency
5. 🧪 **Setup Testing** - Configure Playwright E2E + Vitest unit tests
