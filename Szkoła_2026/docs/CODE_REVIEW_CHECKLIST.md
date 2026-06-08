# Code Review Checklist - Szkoła 2026

Dokument do użytku Terminal 4 (Code Review & Infrastructure).

## Review Framework

**Ogni Sprint będzie reviewed w następujących wymiarach:**

1. **Type Safety** - TypeScript errors, type coverage
2. **Security** - OWASP Top 10, secrets, RLS, auth
3. **Performance** - Bundle size, Core Web Vitals, optimization
4. **Testing** - Unit test coverage (80%+), E2E flows
5. **Code Quality** - Patterns, immutability, error handling
6. **Documentation** - Comments, function docs, inline clarity

---

## Sprint 1 Code Review Checklist

### Task 1.1: React Router + Auth Context

**Files to Review:**
- `src/App.tsx` - Main app component
- `src/router.tsx` - All routes definition
- `src/components/ProtectedRoute.tsx` - Route guard
- `src/contexts/AuthContext.tsx` - Auth state
- `src/hooks/useAuth.ts` - Auth hook

**Checklist:**

#### Type Safety ✅
- [ ] All props typed (interfaces/types)
- [ ] No `any` types (only justified `unknown` for external data)
- [ ] Return types on all functions
- [ ] TypeScript errors = 0

#### Security ✅
- [ ] No hardcoded secrets/API keys
- [ ] Auth tokens stored securely (not in localStorage URL)
- [ ] Session validation on app load
- [ ] Protected routes check auth status
- [ ] Password never logged/stored in plaintext

#### Performance ✅
- [ ] No unnecessary re-renders (check Context usage)
- [ ] Router lazy loading configured (if needed)
- [ ] Auth check doesn't block initial render
- [ ] No console.log statements

#### Testing ✅
- [ ] Unit tests for AuthContext (login, logout, session)
- [ ] Unit tests for useAuth hook
- [ ] E2E test for login flow
- [ ] Test coverage: 80%+

#### Code Quality ✅
- [ ] ProtectedRoute uses proper redirect logic
- [ ] Routes organized logically
- [ ] No prop drilling (use Context)
- [ ] Error handling on auth failures
- [ ] Clear variable/function names

#### Documentation ✅
- [ ] AuthContext documented
- [ ] useAuth hook documented
- [ ] Route structure explained in comments
- [ ] Edge cases handled (expired token, network error)

**Pass Criteria**: All ✅ checks must pass

---

### Task 1.2: UI Base Components

**Files to Review:**
- `src/components/ui/Button.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/Form.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Modal.tsx`
- `src/components/ui/Select.tsx`
- `src/components/ui/Label.tsx`
- `src/components/ui/Toast.tsx`
- `src/components/ui/Loading.tsx`

**Checklist:**

#### Type Safety ✅
- [ ] Props interface defined for each component
- [ ] Callback types explicit (e.g., `onClick: (e: React.MouseEvent) => void`)
- [ ] No `any` types
- [ ] Children typing correct (React.ReactNode, etc.)

#### Accessibility ✅
- [ ] Button has `role="button"` (if not native button)
- [ ] Input has associated label + htmlFor
- [ ] Modal has aria-modal, role="dialog"
- [ ] Color contrast meets WCAG AA
- [ ] Keyboard navigation works

#### Component Design ✅
- [ ] Single responsibility per component
- [ ] Props are essential (no prop bloat)
- [ ] Default props sensible
- [ ] Variants/states clear (primary, secondary, danger, etc.)
- [ ] Tailwind classes consistent

#### Performance ✅
- [ ] No unnecessary re-renders
- [ ] No inline function definitions in props
- [ ] Memoization if needed (rarely)
- [ ] Bundle impact minimal

#### Testing ✅
- [ ] Unit tests for all components
- [ ] Props rendering correctly
- [ ] Variants work
- [ ] Callbacks fire on interaction
- [ ] Coverage: 80%+

**Pass Criteria**: All ✅ checks must pass

---

### Task 1.3: i18n Setup

**Files to Review:**
- `src/i18n/config.ts`
- `src/i18n/index.ts`
- `src/i18n/locales/pl.json`
- `src/i18n/locales/en.json`
- `src/contexts/LanguageContext.tsx`

**Checklist:**

#### Configuration ✅
- [ ] i18next properly configured
- [ ] Fallback language set (pl)
- [ ] Namespace support (if using)
- [ ] Language detection works
- [ ] localStorage persistence working

#### Translations ✅
- [ ] All Polish keys populated
- [ ] All English keys present (matching Polish)
- [ ] No placeholder strings remaining
- [ ] Grammatical correctness (Polish)
- [ ] Consistent terminology

#### Integration ✅
- [ ] LanguageContext properly provided
- [ ] useTranslation hook works
- [ ] Language switching works
- [ ] App.tsx has I18nextProvider
- [ ] LanguageSwitcher component functional

#### Performance ✅
- [ ] Translations lazy-loaded (if large)
- [ ] No unnecessary namespace lookups
- [ ] Language change doesn't reload page

#### Testing ✅
- [ ] useTranslation hook works
- [ ] Language switching works
- [ ] Polish strings display correctly
- [ ] English strings display correctly

**Pass Criteria**: All ✅ checks must pass

---

### Task 1.4-1.7: Pages, Layouts, Components

**General Checklist (applies to all pages/layouts):**

#### Type Safety ✅
- [ ] Props typed
- [ ] No `any` types
- [ ] Return types on functions

#### User Experience ✅
- [ ] Page title visible
- [ ] Form labels clear
- [ ] Error messages user-friendly
- [ ] Loading states visible
- [ ] No orphaned UI elements

#### Performance ✅
- [ ] No unnecessary re-renders
- [ ] Images optimized (lazy loading)
- [ ] No blocking operations on render
- [ ] Console clean (no warnings)

#### Security ✅
- [ ] User input validated
- [ ] No HTML injection risks
- [ ] API errors don't leak sensitive data
- [ ] Auth protected routes enforce access

#### Accessibility ✅
- [ ] Semantic HTML (section, nav, main, etc.)
- [ ] Form labels associated
- [ ] Focus visible
- [ ] Color not only indicator
- [ ] Skip navigation link (if needed)

#### Code Quality ✅
- [ ] Functions < 50 lines
- [ ] Clear variable names
- [ ] No prop drilling (use Context when appropriate)
- [ ] Error boundaries if needed
- [ ] Immutable data updates

#### Testing ✅
- [ ] Page renders without crashes
- [ ] Form submission works
- [ ] Navigation works
- [ ] Loading states display
- [ ] Error states display

**Pass Criteria**: 90%+ ✅ checks must pass (some may not apply)

---

### Task 1.8: Tests + Code Review

**Before marking Sprint 1 DONE:**

#### Test Coverage ✅
- [ ] Overall coverage: 80%+
- [ ] Critical paths tested (auth, navigation, forms)
- [ ] Error scenarios tested
- [ ] Edge cases covered

#### Build Verification ✅
- [ ] `npm run build` succeeds
- [ ] `npm run type-check` → 0 errors
- [ ] No console warnings/errors
- [ ] Bundle size < 150kb gzipped

#### Code Quality ✅
- [ ] No hardcoded values
- [ ] No console.log statements
- [ ] Consistent code style
- [ ] Immutable patterns used
- [ ] Error handling comprehensive

#### Documentation ✅
- [ ] Components documented
- [ ] Services documented
- [ ] Complex logic explained
- [ ] Types exported properly

#### GitHub Requirements ✅
- [ ] All commits follow conventional commits format
- [ ] Commit messages clear and concise
- [ ] No merge conflicts
- [ ] Branch up to date with main

**Pass Criteria**: ALL ✅ checks must pass → Sprint 1 APPROVED

---

## Severity Levels

| Level | Description | Action |
|-------|-------------|--------|
| 🔴 CRITICAL | Security vuln, data loss, breaks auth | **BLOCK** - Fix before merge |
| 🟠 HIGH | Major bug, performance issue, test failure | **WARN** - Should fix before merge |
| 🟡 MEDIUM | Code smell, maintainability concern | **INFO** - Consider fixing |
| 🔵 LOW | Minor suggestion, style preference | **NOTE** - Optional |

---

## Review Process

1. **Pre-Review** (5 min)
   - Check git status (clean, committed)
   - Verify all files in scope
   - Read commit messages

2. **Automated Checks** (2 min)
   - `npm run type-check` → 0 errors
   - `npm run build` → success
   - No console warnings

3. **Dimension Reviews** (20 min each)
   - Type Safety
   - Security
   - Performance
   - Testing
   - Code Quality
   - Documentation

4. **Final Sign-Off** (5 min)
   - Count issues by severity
   - Decide: APPROVE / WARN / BLOCK
   - Document findings
   - Update EXECUTION_LOG.md

---

## Common Issues to Flag

### Security 🔴
- `localStorage.setItem('token', token)` - unsafe if token is sensitive
- Unvalidated user input in API calls
- Missing RLS checks on Supabase queries
- API key in client code

### Performance 🟠
- Prop passed to Context but not used
- Image without width/height
- Large bundle imports (e.g., `import * from lodash`)
- Synchronous operations blocking render

### Code Quality 🟡
- Functions > 50 lines
- Files > 800 lines
- Deep nesting (> 4 levels)
- Magic numbers without constants

### Testing 🔵
- Missing unit tests
- Coverage < 80%
- E2E tests that depend on timing (flaky)
- Tests that test implementation, not behavior

---

## Review Template

```markdown
## Review: Task X.Y - [Task Name]

**Reviewed**: [Date] by code-reviewer

**Files Changed**: [List files]

**Summary**: [2-3 sentence overview]

### Findings by Dimension

#### Type Safety
- ✅ All props typed
- ⚠️ [Issue if any]

#### Security
- ✅ No hardcoded secrets
- ⚠️ [Issue if any]

#### [Other dimensions...]

### Verdict

- **Status**: ✅ APPROVE / ⚠️ WARN / 🔴 BLOCK
- **CRITICAL Issues**: N
- **HIGH Issues**: N
- **MEDIUM Issues**: N
- **Notes**: [Any additional notes]

**Approved by**: Terminal 4 - code-reviewer
**Date**: YYYY-MM-DD
```

---

**Ostatnia aktualizacja**: 2026-06-08  
**Maintainer**: Terminal 4 - Code Review & Infrastructure
