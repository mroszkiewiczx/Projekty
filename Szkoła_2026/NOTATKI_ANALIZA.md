# NOTATKI ANALIZA GŁĘBOKA - School_AI_Custom

**Status**: PRAWIE KOMPLETNA - Będą uzupełniane
**Data utworzenia**: 2026-06-08
**Data ostatniej aktualizacji**: 2026-06-08

## ⭐⭐⭐ WAŻNE: JĘZYK POLSKI + ENGLISH ⭐⭐⭐

**APLIKACJA MUSI DZIAŁAĆ W JĘZYKU POLSKIM** (domyślnie)
**Z MOŻLIWOŚCIĄ PRZEŁĄCZENIA NA ANGIELSKI**

Wsparcie dla language switching w:
- schoolService.ts - `language` field w workspace settings
- Wszystkie keys UI muszą być zlokalizowane

Notatka: Szkoła to polska instytucja - POLSKI JEST KLUCZOWY!

---

## PODSUMOWANIE ANALIZA

### WSZYSTKIE SERVICES (19 plików):

### Obserwacje z kodu:

#### lessonService.ts (CZYTAM)

**generateLesson()**:
- ✅ Komunikuje się z Edge Function `/api/ai-proxy`
- ✅ Wysyła: action, workspaceId, userId, input (topic, educationLevel, subject, grade, duration, objectives)
- ✅ Dostaje: title, content, activities, assessment, materials, tokensUsed
- ✅ Auto-save do `lessons` table (INSERT)
- ✅ Status: 'draft'
- ✅ Metadata: educationLevel, subject, grade, duration, objectives, provider (claude), model (claude-3.5-sonnet), tokensUsed

**getTeacherDashboardStats()**:
- ✅ Liczy lessons w workspace (total + last 30 days)
- ✅ Pobiera 5 recent materials
- ✅ Liczy average quality score z `material_quality_scores` table
- ❌ PROBLEM: Na error zwraca default {0,0,0,[]} zamiast rzucić error
- Returns: { materialsGenerated, materialsThisMonth, averageQuality, recentMaterials }

**getLesson()**:
- ✅ SELECT * FROM lessons WHERE id = lessonId
- ❌ PROBLEM: Nie pobiera metadata (activities, objectives) prawidłowo - hardcoded empty arrays

**publishLesson()**:
- ✅ UPDATE lessons SET status = 'published' WHERE id = lessonId

**deleteLesson()**:
- ✅ SOFT DELETE: UPDATE lessons SET deleted_at = NOW() WHERE id = lessonId

**getQualityScore()**:
- ✅ SELECT * FROM material_quality_scores WHERE material_id = materialId
- Pobiera: topicalAlignment, gradeAppropriate, timeRealism, objectivesQuality, etc.

**NOTATKA**: 
Brakuje:
- shareLesson()
- saveLesson() - czy to jest implementacja czy używa generateLesson?
- export to PDF
- versioning logic
- searching/filtering lessons 

---

#### TeacherDashboardPage.tsx
- [ ] Główny problem: workspaceId hardcoded jako 'demo-workspace'
- [ ] Czemu nigdy nie wchodzy w `else` branch do `lessonService.getTeacherDashboardStats()`?
- [ ] Brakuje: loading skeleton, error boundary, empty state UI
- [ ] Stats nie są live - nie ma refresh mechanism

**Notatka**: 

---

#### LessonGeneratorPage.tsx
- [ ] Input form ma 4 pola - co się dzieje po kliknięciu "Generate"?
- [ ] Gdzie `lessonService.generateLesson()` wysyła request?
- [ ] Czy lesson jest auto-saved czy user musi clicknąć "Save"?
- [ ] Brakuje: edytor, rich text, image upload, draft management

**Notatka**: 

---

#### LibraryPage.tsx
- [ ] Bardzo minimalistyczna - tylko lista lessons
- [ ] Brakuje: search input, filters, sorting, pagination
- [ ] Gdzie się renderuje - MainLayout czy AuthLayout?
- [ ] Czy loading/error states są?

**Notatka**: 

---

#### Services struktura

**authService.ts** (338 linii):
- ✅ signupSchool(): Tworzy workspace + school_profiles + users record
  - Validate: schoolName, email, password
  - supabase.auth.signUp() 
  - INSERT workspaces, school_profiles, users
  - Rollback logic ✅
  - ❌ TODO: welcome email not sent!
- ✅ validateInviteCode(): checks teacher_invites table
- (CZYTAM DALEJ - signupTeacher, loginEmail, etc.)

**schoolService - ???** - nie sprawdzałem

**libraryService - ???** - nie sprawdzałem

**billingService - ???** - pewnie pusty

**Notatka**: authService ma dobry structure ale brakuje email wysyłania! 

---

#### Database schema (Supabase)
- [ ] Jakie tabele rzeczywiście istnieją?
- [ ] RLS policies - czy są wdrożone?
- [ ] Czy są indexes na lessons table?
- [ ] Sharing table - czy rzeczywiście istnieje?

**Notatka**: 

---

#### Auth flow
- [ ] Jak dokładnie Supabase Auth jest integrated?
- [ ] AuthContext - czy session jest preserved?
- [ ] Czy role-based access control działa?
- [ ] Protected routes - jak to sprawdzane?

**Notatka**: 

---

## PROBLEMY DO ROZWIĄZANIA

### Priority 1 (CRITICAL):
1. Dashboard pokazuje DEMO - trzeba real data
2. Brak editora do lekcji
3. Library nie ma search/filter

### Priority 2 (HIGH):
4. File upload missing
5. Sharing UI missing
6. Comments not implemented

### Priority 3 (MEDIUM):
7. Billing not implemented
8. Admin panel not implemented
9. Real-time updates missing

---

## NASTĘPNE KROKI

- [ ] Przeanalizuj każdy service z osobna
- [ ] Sprawdź Supabase schema
- [ ] Zrozum auth flow
- [ ] Zidentyfikuj wszystkie luki
- [ ] Stwórz plan budowy z timeline

---

## PYTANIA DO SIEBIE

1. Czy wszystkie dependencies są zainstalowane?
2. Czy package.json ma wszystko co potrzebne?
3. Czy .env.example pokazuje jakie variables są potrzebne?
4. Jakie biblioteki trzeba dodać dla:
   - WYSIWYG editor?
   - File upload?
   - Drag & drop?
   - Comments?
5. Czy Supabase schema jest kompletna?

---

## ARCHITEKTURA - RZECZYWISTA VS PLANOWANA

### RZECZYWISTA (co jest):
```
Frontend (React) 
  ↓
Services (lessonService, authService, etc.)
  ↓
Supabase (Auth + Database)
  ↓
Edge Functions (dla AI generation)
  ↓
n8n (do Claude API)
```

### PROBLEMY:
- Mało kompletna na frontend'zie
- Brakuje UI do wielu rzeczy
- DEMO data zamiast real
- Brak editora

---

## TECHNOLOGIA - STACK

- React 18 ✅
- TypeScript ✅
- Vite ✅
- Tailwind ✅
- Supabase ✅
- React Router ✅
- React Query ✅

**Brakuje:**
- WYSIWYG editor (Tiptap/Slate)
- Drag & drop (React DnD)
- File upload
- Form validation (Zod/React Hook Form)
- Comments system
- Real-time updates

---

## NOTATKI ŚLEDZONE

| Fragment | Status | Notatka |
|----------|--------|---------|
| generateLesson | ✅ | Działa via n8n |
| getTeacherDashboardStats | ❌ | Zwraca DEMO |
| saveLesson | ✅ | Tworzy record |
| shareLesson | ❌ | Nie zaimplementowana |
| Library search | ❌ | Brak UI |
| Comments | ❌ | Nie zaimplementowana |
| Stripe billing | ❌ | Nie zaimplementowana |

---

## CZYSTY NOTES

```
TO-DO DLA MNIE:
1. Czytać lessonService - co dokładnie robi
2. Czytać authService - flow logowania
3. Czytać libraryService - search logic
4. Czytać każdą page
5. Sprawdzić Supabase schema
6. Sprawdzić env variables
7. Sprawdzić dependencies w package.json
8. Sprawdzić Edge Functions
9. Sprawdzić n8n integration
10. Stworzyć pełny plan
```

---

**Ostatnia aktualizacja**: [będzie auto-update]
