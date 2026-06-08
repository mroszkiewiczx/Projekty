# 🏗️ Architecture - Szkoła 2026

## Overview

Szkoła 2026 to nowoczesna platforma edukacyjna zbudowana w:
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **APIs**: REST (Supabase), webhooks (n8n)
- **Infrastructure**: Vite, React Router, TanStack Query

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser / Client                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │  React App   │  │  Zustand     │  │  React Router     │ │
│  │  Components  │  │  Store       │  │  Navigation       │ │
│  └──────────────┘  └──────────────┘  └───────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼──────┐  ┌────────▼────────┐  ┌─────▼──────────┐
│  Supabase    │  │  n8n Webhooks   │  │  External APIs │
│  PostgreSQL  │  │  Workflows      │  │  (Google, etc) │
│  Auth        │  │  Notifications  │  │                │
│  Storage     │  └─────────────────┘  └────────────────┘
└──────────────┘
```

## Layer Architecture

### 1. Presentation Layer (src/pages/, src/components/)
- **Pages**: Strony aplikacji (LoginPage, Dashboard, Library, Admin)
- **Components**: Reusable UI components (Button, Card, Modal, etc.)
- **Layouts**: MainLayout, AdminLayout, AuthLayout
- Odpowiedzialny za rendering UI i user interactions

### 2. Business Logic Layer (src/services/)
- **authService**: Autentykacja i zarządzanie sesją
- **lessonService**: CRUD operacji na lekcjach
- **libraryService**: Biblioteka materiałów edukacyjnych
- **schoolService**: Zarządzanie szkołami i pracownikami
- **Inne serwisy**: Email, PDF, WhatsApp, n8n integracja

### 3. State Management Layer (src/contexts/, src/hooks/)
- **AuthContext**: Stan autentykacji i profilu użytkownika
- **LanguageContext**: Zarządzanie językiem UI
- **Custom Hooks**: useAuth, useTeacherStats, useLessonEditor, itd.
- Globalne i lokalne stany React

### 4. Data Access Layer (src/lib/)
- **supabase.ts**: Konfiguracja Supabase client
- **database.types.ts**: AutoGenerowana typy z Supabase
- **Utilities**: Helper functions dla API calls

### 5. Type Definitions (src/types/)
- **Lesson**: Struktura lekcji
- **User**: Profil użytkownika
- **School**: Dane szkoły
- **Sharing**: Uprawnienia dostępu
- **Comments**: Komentarze do materiałów

## Data Flow

### Przykład: Zalogowanie użytkownika

```
User Input (email, password)
    ↓
LoginPage Component
    ↓
useAuth Hook
    ↓
authService.login()
    ↓
Supabase Auth API
    ↓
AuthContext Update
    ↓
Router Navigate to Dashboard
```

### Przykład: Ładowanie lekcji

```
Dashboard Component mount
    ↓
useLessonEditor Hook
    ↓
TanStack Query (React Query)
    ↓
lessonService.getLessons()
    ↓
Supabase REST API
    ↓
Component re-render with data
```

## Key Components

### Authentication Flow
```typescript
// 1. User logs in
const { login } = useAuth()
await login(email, password)

// 2. AuthContext stores session
// 3. ProtectedRoute checks auth
// 4. If logged in → render Dashboard
// 5. If not logged in → redirect to LoginPage
```

### Lesson Editor
```typescript
// 1. LessonGeneratorPage loads
// 2. useLessonEditor hook fetches data
// 3. RichTextEditor + ImageUploader components
// 4. On save → lessonService.updateLesson()
// 5. TanStack Query invalidates cache
// 6. Dashboard updates automatically
```

### Sharing & Permissions
```typescript
// 1. User shares lesson
// 2. sharingService.shareLesson() creates row
// 3. RLS policy checks workspace membership
// 4. Recipient gets notification email
// 5. Can view/edit based on permission level
```

## Database Schema

### Core Tables
- **users**: Profil użytkownika
- **lessons**: Lekcje i materiały
- **comments**: Komentarze do lekcji
- **sharing**: Uprawnienia dostępu
- **subscriptions**: Plan subskrypcji szkoły
- **school_profiles**: Dane szkoły
- **teacher_invites**: Zaproszenia dla nauczycieli

Wszystkie tabele mają:
- RLS (Row Level Security) policies
- Indeksy dla wydajności
- Created_at / Updated_at timestamps

## Security

### Row Level Security (RLS)
Każda tabela ma polityki RLS:
- Users mogą widzieć tylko własne dane
- Workspace members mogą widzieć dane workspace
- Admins mają pełny dostęp

### Authentication
- Supabase Auth (JWT tokens)
- Session persistence (localStorage)
- Refresh token rotation

### Environment Variables
Wszystkie sekrety w `.env.local` (nigdy w kodzie)

## Performance

### Optimization Strategies
1. **Code Splitting**: React Router lazy loading
2. **Bundle**: Vite minimization + gzipping
3. **Caching**: TanStack Query caching strategy
4. **Database**: Indexed queries, RLS optimization
5. **Images**: Lazy loading + Supabase Storage

### Target Metrics
- **LCP**: < 2.5s
- **INP**: < 200ms
- **CLS**: < 0.1
- **Bundle**: < 150kb gzipped

## Internationalization

### i18n Setup
- **Framework**: i18next + react-i18next
- **Languages**: Polish (default) + English
- **Lazy loading**: Translations loaded on demand
- **Local persistence**: Selected language saved

## Testing Strategy

### Unit Tests (80%+ coverage)
- Components rendering
- Service logic
- Custom hooks

### Integration Tests
- Page flows
- Auth flow
- CRUD operations

### E2E Tests (Playwright)
- Login flow
- Lesson creation
- Sharing workflow
- Admin operations

## Deployment

### Environments
- **Development**: localhost:8087
- **Staging**: (TBD)
- **Production**: (TBD)

### CI/CD Pipeline
1. Push to GitHub
2. GitHub Actions runs tests
3. Build succeeds
4. Deploy to Vercel (or manual server)

## Monitoring & Logging

### Metrics to Track
- Page load performance (Lighthouse)
- Error rates (Sentry or similar)
- User analytics (optional)
- Database query performance

## Future Improvements

- [ ] Real-time collaboration (Supabase Realtime)
- [ ] Offline support (Service Workers)
- [ ] Advanced search (Full-text search)
- [ ] Video integration
- [ ] AI-powered features
- [ ] Mobile app (React Native)

---

**Ostatnia aktualizacja**: 2026-06-08
**Maintainer**: Rotech Group / ILUN Systems
