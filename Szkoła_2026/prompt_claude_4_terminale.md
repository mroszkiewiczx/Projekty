# 🚀 CLAUDE 4-TERMINAL EXECUTION PROTOCOL

**Projekt**: Szkoła 2026 - Sprint Execution
**Data**: 2026-06-08
**Format**: Terminal Initialization File

---

## ⚡ SZYBKI START

Wczytaj ten plik w Claude Code:
```bash
claude --read-file prompt_claude_4_terminale.md
```

Po przeczytaniu, Claude zapyta:
```
👋 "Które to okno terminala (1, 2, 3 lub 4)?"
```

Odpowiedź:
```
Terminal 1
```

Claude zaczyna pracę!

---

## 📋 DEFINICJA 4 TERMINALI

### TERMINAL 1️⃣: FRONTEND PAGES
```
🎯 Rola: Frontend Pages Builder
📁 Foldery: src/pages/auth/*, src/pages/teacher/*, src/pages/library/*, src/pages/admin/*
⏰ Czas: Continuous throughout Sprint
```

**Agenci pracujący w Terminal 1**:
- Sprint 1: `typescript-pro` (Task 1.1A: App.tsx, router.tsx)
- Sprint 1: `frontend-developer` (Task 1.4: SchoolSignupPage, Task 1.5: JoinTeacherPage)
- Sprint 1: `typescript-pro` (Task 1.3: LoginPage)
- Sprint 2: `backend-developer` (Task 2.2: Dashboard UI)
- Sprint 3: `typescript-pro` (Task 3.1: LessonGeneratorPage)
- Sprint 3: `frontend-developer` (Task 3.5: LessonDetailPage)
- Sprint 4: `typescript-pro` + `frontend-developer` (Task 4.2: LibraryPage)
- Sprint 5: `frontend-developer` (Task 5.1: AdminDashboard, Task 5.3: Settings)
- Sprint 6: `typescript-pro` (Task 6.1: Polish translations)
- Sprint 7: `performance-optimizer` (Task 7.3: Performance tuning)
- Sprint 8: `debugger` (Task 8.2: Bug fixes)

**Responsibilities**:
- ✅ Build all Page components (LoginPage, SchoolSignupPage, Dashboard, etc.)
- ✅ Setup React Router (App.tsx, router.tsx)
- ✅ Implement page layouts
- ✅ Connect to services (lessonService, authService, etc.)
- ✅ Handle form submissions and navigation

**Synchronization Points**:
- 🟢 Can START after: Sprint 0 DONE
- 🔴 MUST FINISH before: Task 1.1 done → Task 1.3,1.4,1.5 can start
- 🟡 Code review: Terminal 4 reviews after each task

**Files to Create/Modify**:
- `src/App.tsx`
- `src/router.tsx`
- `src/pages/auth/LoginPage.tsx`
- `src/pages/auth/SchoolSignupPage.tsx`
- `src/pages/auth/JoinTeacherPage.tsx`
- `src/pages/teacher/TeacherDashboardPage.tsx`
- `src/pages/lesson/LessonGeneratorPage.tsx`
- `src/pages/lesson/LessonDetailPage.tsx`
- `src/pages/library/LibraryPage.tsx`
- `src/pages/admin/AdminDashboardPage.tsx`
- `src/layouts/MainLayout.tsx`
- `src/layouts/AdminLayout.tsx`
- `src/layouts/AuthLayout.tsx`

**Git Commits per Task**:
```
Task 1.1A: feat: setup React Router and App.tsx structure
Task 1.3:  feat: create LoginPage with email/password auth
Task 1.4:  feat: create SchoolSignupPage with multi-step form
Task 1.5:  feat: create JoinTeacherPage
```

---

### TERMINAL 2️⃣: BACKEND & HOOKS
```
🎯 Rola: Backend Logic & State Management
📁 Foldery: src/contexts/*, src/hooks/*, src/lib/*, src/i18n/*
⏰ Czas: Parallel z Terminal 1 (różne foldery!)
```

**Agenci pracujący w Terminal 2**:
- Sprint 1: `backend-developer` (Task 1.1B: AuthContext.tsx, useAuth hook)
- Sprint 1: `typescript-pro` (Task 1.7: i18n setup, LanguageContext)
- Sprint 1: `typescript-pro` (Task 1.6: MainLayout, AdminLayout)
- Sprint 2: `backend-developer` (Task 2.1: useTeacherStats hook)
- Sprint 3: `backend-developer` (Task 3.4: useLessonEditor hook)
- Sprint 4: `backend-developer` (Task 4.1: useLibrarySearch hook)
- Sprint 6: `typescript-pro` (Task 6.1: Polish translations pl.json)
- Sprint 6: `typescript-pro` (Task 6.2: English translations en.json)
- Sprint 8: `documentation-engineer` (Task 8.1: Documentation)

**Responsibilities**:
- ✅ Create AuthContext + Supabase integration
- ✅ Create custom hooks (useAuth, useTeacherStats, useLessonEditor, etc.)
- ✅ Setup i18n configuration (Polish + English)
- ✅ Create language switching context
- ✅ Create utility functions and helpers
- ✅ Setup type definitions and constants

**Synchronization Points**:
- 🟢 Can START after: Sprint 0 DONE
- 🔴 MUST FINISH before: Task 1.1B done → Task 1.3,1.4,1.5 pages can access auth
- 🔴 MUST FINISH before: Task 1.7 done → all pages can use i18n
- 🟡 Code review: Terminal 4 reviews after each task

**Files to Create/Modify**:
- `src/contexts/AuthContext.tsx`
- `src/hooks/useAuth.ts`
- `src/hooks/useTeacherStats.ts`
- `src/hooks/useLessonEditor.ts`
- `src/hooks/useLibrarySearch.ts`
- `src/i18n/config.ts`
- `src/i18n/index.ts`
- `src/contexts/LanguageContext.tsx`
- `src/i18n/locales/pl.json`
- `src/i18n/locales/en.json`
- `src/layouts/MainLayout.tsx`
- `src/layouts/AdminLayout.tsx`
- `src/lib/supabase.ts` (integration)

**Git Commits per Task**:
```
Task 1.1B: feat: create AuthContext and useAuth hook with Supabase integration
Task 1.7:  feat: setup i18n with Polish/English translations and LanguageContext
Task 1.6:  feat: create MainLayout and AdminLayout
```

---

### TERMINAL 3️⃣: COMPONENTS & TESTS
```
🎯 Rola: UI Components + Test Coverage
📁 Foldery: src/components/ui/*, src/components/lesson/*, src/components/library/*, tests/*
⏰ Czas: Parallel z Terminal 1,2 (różne foldery!)
```

**Agenci pracujący w Terminal 3**:
- Sprint 1: `typescript-pro` (Task 1.2: UI base components)
- Sprint 1: `tdd-guide` (Task 1.8: LoginPage + AuthContext tests)
- Sprint 2: `tdd-guide` (Task 2.4: Dashboard tests)
- Sprint 3: `typescript-pro` (Task 3.1: RichTextEditor - Tiptap)
- Sprint 3: `typescript-pro` (Task 3.2: ImageUploader)
- Sprint 3: `tdd-guide` (Task 3.8: Editor tests)
- Sprint 4: `typescript-pro` (Task 4.3: MaterialCard, SharingModal)
- Sprint 4: `tdd-guide` (Task 4.6: Library tests)
- Sprint 5: `tdd-guide` (Task 5.5: Admin tests)
- Sprint 6: `tdd-guide` (Task 6.5: Visual regression tests)
- Sprint 7: `tdd-guide` (Task 7.1: E2E tests - Playwright)
- Sprint 7: `performance-optimizer` (Task 7.3: Bundle optimization)
- Sprint 8: `code-reviewer` (Task 8.3: Final code review)

**Responsibilities**:
- ✅ Create UI base components (Button, Input, Form, Card, Modal, Select, etc.)
- ✅ Create lesson-specific components (RichTextEditor, ImageUploader)
- ✅ Create library components (MaterialCard, SharingModal, CommentsSection)
- ✅ Write unit tests for components
- ✅ Write integration tests for pages
- ✅ Write E2E tests for critical flows
- ✅ Implement visual regression tests
- ✅ Measure and optimize bundle size

**Synchronization Points**:
- 🟢 Can START after: Sprint 0 DONE
- 🔴 MUST FINISH before: Task 1.2 done → pages can use components
- 🔴 MUST FINISH before: Task 1.8 done → Sprint 1 can be marked complete
- 🟡 Tests should be WRITTEN DURING component development (TDD)

**Files to Create/Modify**:
- `src/components/ui/Button.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/Form.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Modal.tsx`
- `src/components/ui/Select.tsx`
- `src/components/ui/Label.tsx`
- `src/components/ui/Toast.tsx`
- `src/components/ui/Loading.tsx`
- `src/components/lesson/RichTextEditor.tsx`
- `src/components/lesson/ImageUploader.tsx`
- `src/components/lesson/LessonActions.tsx`
- `src/components/lesson/VersionHistory.tsx`
- `src/components/library/MaterialCard.tsx`
- `src/components/library/SharingModal.tsx`
- `src/components/library/CommentsSection.tsx`
- `src/components/LanguageSwitcher.tsx`
- `tests/**/__tests__/*.test.tsx`

**Git Commits per Task**:
```
Task 1.2:  feat: create base UI components (Button, Input, Form, Card, Modal, etc.)
Task 1.8:  test: add unit and integration tests for Sprint 1 (80%+ coverage)
Task 3.8:  test: add E2E tests for lesson editor flow
```

---

### TERMINAL 4️⃣: CODE REVIEW & INFRASTRUCTURE
```
🎯 Rola: Quality Gate + Infrastructure + DevOps
📁 Foldery: src/ (read-only review), docs/, .github/, EXECUTION_LOG.md
⏰ Czas: Continuous alongside Terminals 1,2,3
```

**Agenci pracujący w Terminal 4**:
- Sprint 0: `database-reviewer` (Task 0.1: SCHEMA.sql) ✅ DONE
- Sprint 1: `code-reviewer` (Task 1.8: Code review all Sprint 1 output)
- Sprint 2: `code-reviewer` (Task 2.4: Dashboard code review)
- Sprint 3: `code-reviewer` + `security-reviewer` (Task 3.8: Editor review + security audit)
- Sprint 4: `code-reviewer` (Task 4.6: Library code review)
- Sprint 5: `code-reviewer` (Task 5.5: Admin code review)
- Sprint 6: `code-reviewer` (Task 6.5: i18n audit)
- Sprint 7: `performance-optimizer` (Task 7.3: Perf optimization)
- Sprint 7: `code-reviewer` (Task 7.4: Final security audit)
- Sprint 8: `documentation-engineer` (Task 8.1: Documentation)
- Sprint 8: `debugger` (Task 8.2: Edge case testing)
- Sprint 8: `devops-engineer` (Task 8.4: Deployment setup)
- Sprint 8: `code-reviewer` (Task 8.3: Final code review)

**Responsibilities**:
- ✅ Review code quality (TypeScript, security, best practices)
- ✅ Check test coverage (must be 80%+)
- ✅ Audit security vulnerabilities
- ✅ Verify performance metrics
- ✅ Write documentation
- ✅ Update EXECUTION_LOG.md with completion status
- ✅ Setup CI/CD and deployment infrastructure

**Synchronization Points**:
- 🟢 Can START immediately (review is continuous, non-blocking)
- 🔴 GATES Sprint completion (all tasks must pass review before marking DONE)
- 🟡 NOT a blocker for Terminal 1,2,3 (they continue while review happens)

**Files to Create/Modify**:
- `EXECUTION_LOG.md` (update status)
- `.github/workflows/ci.yml` (CI/CD pipeline)
- `docs/README.md`
- `docs/SETUP.md`
- `docs/ARCHITECTURE.md`
- `.env.example`
- Any file flagged in code review

**Git Commits per Task**:
```
Task 1.8:  test: finalize Sprint 1 tests and code review
Task 8.1:  docs: add comprehensive documentation
Task 8.4:  chore: setup CI/CD and deployment infrastructure
```

---

## 🎯 TERMINAL ASSIGNMENT CHECKLIST

Before starting, copy this and fill in:

```
SPRINT 1 - TERMINAL ASSIGNMENTS:

Terminal 1 (Frontend Pages):
  ☐ Agent: [typescript-pro / frontend-developer]
  ☐ Tasks: [Task numbers]
  ☐ Files: [src/pages/auth/*, src/pages/teacher/*, etc.]
  ☐ Ready? [Y/N]

Terminal 2 (Backend & Hooks):
  ☐ Agent: [backend-developer / typescript-pro]
  ☐ Tasks: [Task numbers]
  ☐ Files: [src/contexts/*, src/hooks/*, src/i18n/*, etc.]
  ☐ Ready? [Y/N]

Terminal 3 (Components & Tests):
  ☐ Agent: [typescript-pro / tdd-guide]
  ☐ Tasks: [Task numbers]
  ☐ Files: [src/components/ui/*, src/components/lesson/*, tests/*, etc.]
  ☐ Ready? [Y/N]

Terminal 4 (Code Review & Infrastructure):
  ☐ Agent: [code-reviewer / security-reviewer / debugger]
  ☐ Tasks: [Task numbers]
  ☐ Files: [read-only review, docs/*, .github/*, EXECUTION_LOG.md]
  ☐ Ready? [Y/N]
```

---

## ⚠️ ANTI-KANIBALIZATION RULES

### Reguła #1: Jeden Agent = Jeden Folder
```
✅ BEZPIECZNE - różne pliki:
  Terminal 1: src/pages/auth/LoginPage.tsx
  Terminal 2: src/contexts/AuthContext.tsx
  Terminal 3: src/components/ui/Button.tsx
  Terminal 4: EXECUTION_LOG.md (review only)

❌ NIEBEZPIECZNE - ten sam plik:
  Terminal 1: src/App.tsx
  Terminal 2: src/App.tsx (KONFLIKT!)
```

### Reguła #2: Synchronizacja Punkty
```
🟢 CAN START PARALLEL:
  Task 1.1A (App.tsx) + Task 1.1B (AuthContext) = YES (different files)
  Task 1.2 (UI components) + Task 1.3 (LoginPage) = MAYBE (depends on components)

🔴 MUST BE SEQUENTIAL:
  Task 1.1 MUST FINISH → THEN Task 1.3,1.4,1.5 can start
  Task 1.2 MUST FINISH → THEN Task 1.3,1.4,1.5 use components
  Task 1.7 MUST FINISH → THEN all pages use i18n
```

### Reguła #3: Code Review = Gate, Not Blocker
```
✅ Review DURING development (Terminal 4 reviews while Terminal 1,2,3 work)
✅ Review GATES Sprint completion (can't mark DONE until review passes)
❌ Review does NOT block next sprint from starting (dependencies allow)
```

---

## 🚀 HOW TO USE THIS FILE

### In Terminal 2 (Backend & Hooks):
```bash
cd C:\Visual Studio Code\Projekty\Szkoła_2026
claude --read-file prompt_claude_4_terminale.md
```

Claude will read this file and ask:
```
👋 Hej! Przeczytałem strategię 4 terminali.

Które to okno terminala?
1. Terminal 1 (Frontend Pages)
2. Terminal 2 (Backend & Hooks)
3. Terminal 3 (Components & Tests)
4. Terminal 4 (Code Review & Infrastructure)

Odpowiedz: 1, 2, 3 lub 4
```

You answer:
```
2
```

Claude responds:
```
✅ Terminal 2 (Backend & Hooks) confirmed!

Zobaczę wszystkie Twoje zadania w tym sprincie:

SPRINT 1 - Terminal 2 Assignments:
  🔵 Agent: backend-developer + typescript-pro
  📋 Tasks: Task 1.1B (AuthContext), Task 1.7 (i18n setup), Task 1.6 (Layouts)
  📁 Foldery: src/contexts/*, src/hooks/*, src/i18n/*
  ⏰ Synchronizacja: Czekam na Sprint 0 DONE, potem mogę zacząć
  🟢 Status: GOTOWY DO PRACY!

Czy zaczynam pracę?
```

You confirm:
```
YES
```

Claude starts working on assigned tasks!

---

## 📊 SPRINT 1 - PEŁNA MAPA TERMINALI

```
DAY 1:

┌─ TERMINAL 1 ──────────────────┐
│ TypeScript-Pro                 │
│ Task 1.1A: App.tsx + Router    │ 
│ Task 1.3: LoginPage            │
│ Duration: ~4h                  │
│ Files: src/App.tsx             │
│         src/router.tsx         │
│         src/pages/auth/...     │
└────────────────────────────────┘

┌─ TERMINAL 2 ──────────────────┐
│ Backend-Developer              │
│ Task 1.1B: AuthContext         │
│ TypeScript-Pro                 │
│ Task 1.7: i18n setup           │
│ Task 1.6: Layouts              │
│ Duration: ~6h                  │
│ Files: src/contexts/...        │
│         src/hooks/...          │
│         src/i18n/...           │
└────────────────────────────────┘

┌─ TERMINAL 3 ──────────────────┐
│ TypeScript-Pro                 │
│ Task 1.2: UI Components        │
│ TDD-Guide                      │
│ Task 1.8: Tests                │
│ Duration: ~7h                  │
│ Files: src/components/ui/...   │
│         tests/...              │
└────────────────────────────────┘

┌─ TERMINAL 4 ──────────────────┐
│ Code-Reviewer                  │
│ Continuous Review              │
│ Duration: ~2h                  │
│ Files: Read-only (all output)  │
│        EXECUTION_LOG.md (edit) │
└────────────────────────────────┘

WALL-TIME: ~6-7 hours (parallel execution)
vs 21 hours (sequential)
```

---

## 🎯 NEXT STEPS

1. **Open 4 terminals** in VS Code
2. **In Terminal 1,2,3,4**: Run this command:
   ```bash
   cd C:\Visual Studio Code\Projekty\Szkoła_2026
   claude --read-file prompt_claude_4_terminale.md
   ```
3. **Claude asks**: "Which terminal is this?" (1, 2, 3, or 4)
4. **You answer**: Terminal number
5. **Claude starts** working on assigned tasks!

---

## ✅ VALIDATION CHECKLIST

Before confirming terminal assignment:

- [ ] Folder assignments are clear (no conflicts)
- [ ] Sync points are understood
- [ ] Agent roles match terminal responsibility
- [ ] Code review is non-blocking
- [ ] Git commits per task are clean
- [ ] EXECUTION_LOG.md will be updated after each task

---

**Koniec setup - gotowy do pracy! 🚀**

Otwórz Terminal 2, 3, 4 i wczytaj ten plik.
Claude zapyta który to terminal i zaczyna!
