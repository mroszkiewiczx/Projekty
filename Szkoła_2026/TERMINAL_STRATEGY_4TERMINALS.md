# STRATEGIA 4 TERMINALI - PLAN PODZIAŁU PRACY

**Data**: 2026-06-08
**Status**: ✋ CZEKA NA AKCEPTACJĘ (bez akcji!)
**Cel**: Maksymalna paralelizacja - 4 okna terminala, zero kanibalizacji

---

## 📊 ANALIZA OBECNA

### Sprint 0 (SKOŃCZONY ✅)
```
✅ DONE - 3 agenty równoległo (different files)
  - database-reviewer: SCHEMA.sql (55s)
  - backend-developer: src/services/ (348s)
  - typescript-pro: npm install (854s)
  WYNIK: 17 minut wall-time zamiast 5-7 godzin!
```

### Sprinty 1-8 (DO ZROBIENIA)
- **Średnio 4-5 agentów per sprint**
- **Różne warstwy kodu** = zero konfliktów
- **4 okna terminala = 4 agenty równocześnie!**

---

## 🎯 PROPOZYCJA: 4 OKNA TERMINALA

### TERMINAL 1: Frontend Pages (typescript-pro + frontend-developer ALTERNUJĄ)
```
"Frontend Pages Builder"

Sprint 1-8: Task 1.3 (LoginPage) → Task 1.4 (SchoolSignupPage) → ...
Foldery: src/pages/auth/*, src/pages/teacher/*, src/pages/library/*, src/pages/admin/*

Agenci pracujący:
- Sprint 1: typescript-pro → LoginPage, Layouts, Router
- Sprint 1: frontend-developer → SchoolSignupPage, JoinTeacher
- Sprint 2: backend-developer → useTeacherStats hook
- Sprint 3: typescript-pro → LessonGeneratorPage
- Sprint 3: frontend-developer → LessonDetailPage
- Sprint 4: typescript-pro + frontend-developer → LibraryPage
- Sprint 5: frontend-developer → AdminDashboard, Settings
- Sprint 6: typescript-pro → Polish translations
- Sprint 7: performance-optimizer → Performance tuning
- Sprint 8: debugger → Bug fixes

Warunki bezpieczeństwa:
✅ Każdy agent ma INNY plik/folder
✅ Np: Task 1.3 (LoginPage.tsx) + Task 1.4 (SchoolSignupPage.tsx) = BEZPIECZNE
✅ Nigdy nie edytują tego samego pliku jednocześnie

Szacunki czasu:
- Sprint 1: ~21 hours pracy → ~3-4 days z Terminal 2,3,4 wsparciem
- Sprint 2: ~8 hours → ~2 days
- Sprint 3: ~13 hours → ~2-3 days
- Etc.
```

---

### TERMINAL 2: Components + Hooks (backend-developer + typescript-pro ALTERNUJĄ)
```
"Backend Logic & Hooks"

Sprint 1-8: Konteksty, Hooki, Services integration, i18n config
Foldery: src/contexts/*, src/hooks/*, src/lib/*, src/i18n/*

Agenci pracujący:
- Sprint 1: backend-developer → AuthContext, useAuth hook
- Sprint 1: typescript-pro → i18n setup (config.ts, LanguageContext)
- Sprint 2: backend-developer → useTeacherStats hook
- Sprint 3: backend-developer → useLessonEditor hook
- Sprint 3: typescript-pro → ImageUploader component
- Sprint 4: backend-developer → useLibrarySearch hook
- Sprint 5: typescript-pro → AdminLayout
- Sprint 6: typescript-pro → Polish translations (pl.json, en.json)
- Sprint 6: frontend-developer → LanguageSwitcher
- Sprint 7: tdd-guide → E2E tests
- Sprint 8: documentation-engineer → Docs

Warunki bezpieczeństwa:
✅ Task 1.1 (AuthContext.tsx) + Task 1.7 (i18n config.ts) = RÓŻNE PLIKI!
✅ Mogą pracować jednocześnie bez konfliktu
✅ Synchronizacja: Task 1.1 musi być DONE zanim Task 1.2 się zacznie

Szacunki czasu:
- Sprint 1: ~6 hours → završeno w tempo Terminal 1
- Sprint 2: ~3 hours
- Sprint 3: ~6 hours
- Etc.
```

---

### TERMINAL 3: UI Components + Tests (typescript-pro + tdd-guide ALTERNUJĄ)
```
"Components & Testing Pipeline"

Sprint 1-8: src/components/*, tests/*, visual regression
Foldery: src/components/ui/*, src/components/lesson/*, src/components/library/*, tests/

Agenti pracujący:
- Sprint 1: typescript-pro → UI components (Button, Input, Form, Card, Modal)
- Sprint 1: tdd-guide → LoginPage + AuthContext tests
- Sprint 2: tdd-guide → Dashboard tests
- Sprint 3: typescript-pro → RichTextEditor (Tiptap)
- Sprint 3: typescript-pro → ImageUploader
- Sprint 3: tdd-guide → Editor tests
- Sprint 4: typescript-pro → MaterialCard, SharingModal
- Sprint 4: tdd-guide → Library tests
- Sprint 5: tdd-guide → Admin tests
- Sprint 6: tdd-guide → Visual regression tests
- Sprint 7: tdd-guide → E2E tests (Playwright)
- Sprint 7: performance-optimizer → Bundle optimization
- Sprint 8: code-reviewer → Final audit

Warunki bezpieczeństwa:
✅ Task 1.2 (UI components) + Task 1.8 (tests) = RÓŻNE FOLDERY!
✅ Tdd-guide pisze testy PODCZAS gdy typescript-pro pisze komponenty
✅ Synchronizacja: Components muszą być DONE zanim testy się zaczną

Szacunki czasu:
- Sprint 1: ~9 hours pracy → ~2-3 days
- Sprint 2: ~3 hours
- Sprint 3: ~7 hours
- Etc.
```

---

### TERMINAL 4: Infrastructure & Review (code-reviewer + DevOps/Debug/Docs ROTUJĄ)
```
"Quality Gate & Infrastructure"

Sprint 0-8: Code reviews, Security audits, Performance, Deployment, Docs
Foldery: src/, tests/, docs/, .github/

Agenci pracujący:
- Sprint 0: database-reviewer → SCHEMA.sql (DONE ✅)
- Sprint 1: code-reviewer → Code review + TypeScript checks
- Sprint 2: code-reviewer → Dashboard code review
- Sprint 3: code-reviewer → Editor code review
- Sprint 3: security-reviewer → Security audit
- Sprint 4: code-reviewer → Library code review
- Sprint 5: code-reviewer → Admin code review
- Sprint 6: code-reviewer → i18n audit
- Sprint 7: performance-optimizer → Performance optimization
- Sprint 7: code-reviewer → Final security audit
- Sprint 8: documentation-engineer → Documentation
- Sprint 8: debugger → Edge case testing
- Sprint 8: devops-engineer → Deployment setup
- Sprint 8: code-reviewer → Final code review

Warunki bezpieczeństwa:
✅ Code review jest GATEKEEPING step - nie blokuje Terminal 1,2,3
✅ Review robi się DURING implementation, nie AFTER
✅ Synchronizacja: Code review na koniec każdego sprintu

Szacunki czasu:
- Sprint 1: ~2 hours review
- Sprint 2: ~1.5 hours review
- Sprint 3: ~2 hours review + security
- Sprint 4: ~1.5 hours review
- Sprint 5: ~1.5 hours review
- Sprint 6: ~1 hour audit
- Sprint 7: ~2 hours perf + 1.5 hours review
- Sprint 8: ~2 hours docs + 1 hour debug + 1 hour devops + 1 hour review
```

---

## 🔄 SZCZEGÓŁOWY FLOW - SPRINT 1 (PRZYKŁAD)

### ⏱️ DZIEŃ 1 (3 terminale równocześnie)

```
09:00 START - Sprint 1 Kickoff

TERMINAL 1 (Frontend Pages):
  TypeScript-Pro: Task 1.1 part A - src/App.tsx + src/router.tsx (2h)
  
TERMINAL 2 (Backend & Hooks):
  Backend-Developer: Task 1.1 part B - src/contexts/AuthContext.tsx (2h) [PARALLEL!]
  
TERMINAL 3 (Components & Tests):
  TypeScript-Pro: Task 1.2 - UI Components (4-5h) [PARALLEL!]
  
TERMINAL 4 (Review & Infrastructure):
  Code-Reviewer: WAITING (czeka na Task 1.1-1.2 DONE)

11:00 - SYNCHRONIZATION POINT
  ✅ Task 1.1 (both parts) finished
  → Can proceed to Task 1.3, 1.4, 1.5 (all pages depend on it)

11:30 CONTINUE

TERMINAL 1 (Frontend Pages):
  TypeScript-Pro: Task 1.3 - LoginPage.tsx (2h)
  
TERMINAL 2 (Backend & Hooks):
  TypeScript-Pro: Task 1.7 - i18n setup (2h) [PARALLEL! różny plik]
  
TERMINAL 3 (Components & Tests):
  TDD-Guide: Tests for Task 1.1 (AuthContext, useAuth) - in background (3h)
  
TERMINAL 4 (Review & Infrastructure):
  Code-Reviewer: WAITING (czeka na Task 1.3 DONE)

13:30 CONTINUE

TERMINAL 1 (Frontend Pages):
  Frontend-Developer: Task 1.4 - SchoolSignupPage (3h) [PARALLEL! Task 1.3 DONE]
  
TERMINAL 2 (Backend & Hooks):
  TypeScript-Pro: Task 1.6 - Layouts (2h) [PARALLEL! różny plik]
  
TERMINAL 3 (Components & Tests):
  TDD-Guide: STILL working on Task 1.1 tests
  
TERMINAL 4 (Review & Infrastructure):
  Code-Reviewer: Reviews Task 1.1 output (1h) [PARALLEL! no blocker]

17:00 END DAY 1
  ✅ Task 1.1 DONE (App + Router + AuthContext)
  ✅ Task 1.2 DONE (UI Components)
  ✅ Task 1.3 DONE (LoginPage)
  ✅ Task 1.7 DONE (i18n setup)
  ✅ Task 1.1 tests DONE (80%+ coverage)
  ✅ Code review PASSED for Task 1.1
  
  PREPARED for Day 2:
  - Task 1.4 (SchoolSignup) - Terminal 1
  - Task 1.5 (JoinTeacher) - Terminal 1
  - Task 1.6 (Layouts) - Terminal 2
  - Task 1.3 tests - Terminal 3
  - More code reviews - Terminal 4
```

### ⏱️ DZIEŃ 2-3 (continues pattern)

```
DAY 2:

TERMINAL 1:
  Frontend-Developer finishes Task 1.4 (SchoolSignupPage)
  Frontend-Developer starts Task 1.5 (JoinTeacher)
  
TERMINAL 2:
  TypeScript-Pro finishes Task 1.6 (Layouts)
  Backend-Developer starts Task 1.1 part B verification
  
TERMINAL 3:
  TDD-Guide: Task 1.3 tests (LoginPage) - 2h
  TDD-Guide: Task 1.4 tests (SchoolSignupPage) - 2h
  TypeScript-Pro: WAITING (może zacząć Task 1.5 page components)
  
TERMINAL 4:
  Code-Reviewer: Task 1.3 + 1.4 code review - 2h
  Security-Reviewer: i18n security check - 1h
  
DAY 3:

All remaining tests + final reviews
Task 1.8: Code Review + Tests finalization
→ Sprint 1 COMPLETE
```

---

## 📈 SZACUNKI - 4 TERMINALE vs 1 TERMINAL

### Sprint 1 Example (21 hours of work):

**1 TERMINAL** (sekwencyjnie):
```
Task 1.1 → Task 1.2 → Task 1.3 → Task 1.4 → Task 1.5 → Task 1.6 → Task 1.7 → Task 1.8
= ~21 hours pracy = 3 dni (8h/dzień)
```

**4 TERMINALE** (równolegle):
```
Day 1:
  Terminal 1: Task 1.1A + 1.3 (2h + 2h) = 4h pracy
  Terminal 2: Task 1.1B + 1.7 (2h + 2h) = 4h pracy
  Terminal 3: Task 1.2 (4-5h) = 4-5h pracy
  Terminal 4: Review (1h) = 1h pracy
  Wall-time: ~5 hours (max z trzech)

Day 2:
  Terminal 1: Task 1.4 + 1.5 (3h + 1.5h) = 4.5h
  Terminal 2: Task 1.6 (2h) = 2h
  Terminal 3: Task 1.3+1.4 tests (2h + 2h) = 4h
  Terminal 4: Code review (2h) = 2h
  Wall-time: ~4.5 hours

Day 3:
  Terminal 1: Nothing (done)
  Terminal 2: Nothing (done)
  Terminal 3: Task 1.5 tests + final (3h) = 3h
  Terminal 4: Final review + sign-off (1h) = 1h
  Wall-time: ~3 hours

TOTAL: ~12.5 hours wall-time (vs 21 hours sequential)
= 1.7x szybciej! (lub ~1.5 dni vs 3 dni)
```

---

## ✅ WARUNKI BEZPIECZEŃSTWA - 4 TERMINALE

### Reguła #1: Każdy Agent = Inny Folder/Plik
```
✅ BEZPIECZNE:
  Terminal 1: src/pages/auth/LoginPage.tsx
  Terminal 2: src/contexts/AuthContext.tsx
  Terminal 3: src/components/ui/Button.tsx
  Terminal 4: (review, nie edytuje)
  
❌ NIEBEZPIECZNE:
  Terminal 1: src/App.tsx
  Terminal 2: src/App.tsx (KONFLIKT!)
```

### Reguła #2: Synchronizacja Punkty
```
MUST be DONE BEFORE next starts:
  ✅ Task 1.1 (Router + AuthContext) → BEFORE Task 1.3, 1.4, 1.5 pages
  ✅ Task 1.2 (UI components) → BEFORE pages use components
  ✅ Task 1.7 (i18n setup) → BEFORE all pages (need i18n hooks)
  
CAN run in PARALLEL (no dependency):
  ✅ Task 1.3 (LoginPage) + Task 1.4 (SchoolSignup) = YES! (different pages)
  ✅ Task 1.1 (Router) + Task 1.7 (i18n) = YES! (different files)
```

### Reguła #3: Code Review = Gate
```
Code review at END of Sprint, but...
  ✅ Reviews Task 1.1 WHILE Task 1.3,1.4,1.5 are being written
  ✅ NOT a blocker for Terminal 1,2,3
  ✅ Just makes sure quality is maintained
  
If review finds issues:
  → Agent fixes next day (Sprint continues)
  → Not a full blocker
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Setup Phase (Do potwierdzenia):
- [ ] **4 okna terminala otwarte** w VS Code / iTerm / Terminal
  - Terminal 1: "Frontend Pages"
  - Terminal 2: "Backend & Hooks"
  - Terminal 3: "Components & Tests"
  - Terminal 4: "Code Review & QA"
  
- [ ] **cd Szkoła_2026** w każdym terminalu (working directory)

- [ ] **npm run dev** w Terminal 1,2,3 (hot reload)
  
- [ ] **npm run type-check --watch** w Terminal 4 (continuous type checking)

### Execution Rules:
- [ ] **Agent A = Terminal X** (fixed assignment per agent, per sprint)
- [ ] **Different files = different terminals = no conflicts**
- [ ] **Code review runs continuously, not blocking**
- [ ] **Sync points at task completion, not per-minute**
- [ ] **Git commits per task, not per file**

---

## 🎯 PYTANIA KONTROLNE

Zanim zaakceptujesz plan:

1. **Czy każdy agent ma INNY plik/folder?** ✅ YES
   - Terminal 1: Pages (LoginPage.tsx, SchoolSignupPage.tsx)
   - Terminal 2: Hooks (AuthContext.tsx, useAuth.ts, useTeacherStats.ts)
   - Terminal 3: Components (Button.tsx, Input.tsx, Modal.tsx)
   - Terminal 4: Reviews (checking all files, not editing)

2. **Czy synchronizacja jest jasna?** ✅ YES
   - Task 1.1 MUST be done before Task 1.3,1.4,1.5
   - Task 1.2 MUST be done before pages use components
   - All specified in "SYNCHRONIZACJA PUNKTY"

3. **Czy to przyspieszy projekt?** ✅ YES
   - Sprint 1: 21h work → 1.5 days wall-time (was 3 days)
   - Całe sprinty: ~15-17 days wall-time (was 23-25 days)

4. **Czy kod będzie czysta bez konfliktów?** ✅ YES
   - Każdy plik editowany przez max 1 agent per moment
   - Git commits atomiczne (per task, nie per zmiana)
   - Code review jest gatekeeper, nie blocker

---

## 🚦 STATUS

```
✅ Plan przygotowany
⏳ CZEKA NA AKCEPTACJĘ
❌ NIE ZACZYNAMY BEZ TWOJEGO OK!
```

---

**INSTRUKCJA**: Przeczytaj plan, sprawdź czy wszystko ma sens, i powiedz:

- ✅ **"Zaakceptuję plan 4 terminali - start Sprint 1!"** → Zaczynamy!
- ❌ **"Zmień to i to..."** → Modyfikuję plan
- 🤔 **"Wyjaśnij to bardziej..."** → Rozjaśniam szczegóły

---

**Koniec analiza - bez akcji, czeka na Twoje słowo!** 🎯
