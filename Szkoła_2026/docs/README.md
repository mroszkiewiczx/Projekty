# Szkoła 2026 - Platforma Edukacyjna

![Status](https://img.shields.io/badge/status-development-yellow)
![Node](https://img.shields.io/badge/node-18%2B-brightgreen)
![License](https://img.shields.io/badge/license-proprietary-blue)

## 📋 Opis

**Szkoła 2026** to nowoczesna platforma edukacyjna dla nauczycieli i uczniów, ułatwiająca tworzenie, dzielenie się i zarządzanie materiałami edukacyjnymi.

### Główne funkcje
✅ Tworzenie i edytowanie lekcji (Rich Text Editor)  
✅ Biblioteka materiałów edukacyjnych  
✅ Udostępnianie lekcji z uprawnieniami  
✅ Komentarze i dyskusje  
✅ Export do PDF/DOCX  
✅ Integracja z n8n (powiadomienia)  
✅ Wsparcie dla Polski i Angielskiego  
✅ Zarządzanie szkołami i nauczycielami  

## 🚀 Quick Start

### Wymagania
- Node.js 18+ 
- npm 9+
- Supabase account (darmowe)

### Instalacja
```bash
git clone https://github.com/rotechgroup/szkoła-2026.git
cd szkoła-2026
npm install
cp .env.example .env.local
# Edytuj .env.local z Supabase credentials
npm run dev
```

Aplikacja będzie dostępna na `http://localhost:8087`

## 📚 Dokumentacja

- [Setup Guide](./SETUP.md) - Instrukcje instalacji i konfiguracji
- [Architecture](./ARCHITECTURE.md) - Architektura systemu i design decisions
- [Development Guide](./DEVELOPMENT.md) - Wytyczne dla developerów (coming soon)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| State | Zustand + React Context |
| Data | TanStack Query + Supabase |
| Database | PostgreSQL (Supabase) |
| Auth | Supabase Auth |
| Internationalization | i18next |
| Rich Text | TipTap |
| Testing | Playwright + Jest (coming soon) |
| Build | Vite |
| CI/CD | GitHub Actions |

## 📁 Struktura Projektu

```
src/
├── pages/                      # Strony (Login, Dashboard, Library, Admin)
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── SchoolSignupPage.tsx
│   │   └── JoinTeacherPage.tsx
│   ├── teacher/
│   │   └── TeacherDashboardPage.tsx
│   ├── lesson/
│   │   ├── LessonGeneratorPage.tsx
│   │   └── LessonDetailPage.tsx
│   ├── library/
│   │   └── LibraryPage.tsx
│   └── admin/
│       └── AdminDashboardPage.tsx
├── components/                 # Komponenty UI
│   ├── ui/                    # Base components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   ├── lesson/                # Lesson-specific
│   │   ├── RichTextEditor.tsx
│   │   └── ImageUploader.tsx
│   └── library/               # Library-specific
│       ├── MaterialCard.tsx
│       └── SharingModal.tsx
├── contexts/                   # React Context
│   ├── AuthContext.tsx
│   └── LanguageContext.tsx
├── hooks/                      # Custom Hooks
│   ├── useAuth.ts
│   ├── useTeacherStats.ts
│   ├── useLessonEditor.ts
│   └── useLibrarySearch.ts
├── services/                   # Business Logic (19 services)
│   ├── authService.ts
│   ├── lessonService.ts
│   ├── libraryService.ts
│   └── [others]
├── lib/                        # Utilities
│   ├── supabase.ts
│   ├── database.types.ts
│   └── utils.ts
├── types/                      # TypeScript Definitions
│   ├── lesson.ts
│   ├── user.ts
│   └── [others]
├── i18n/                       # Internationalization
│   ├── config.ts
│   ├── locales/
│   │   ├── pl.json             # Polish
│   │   └── en.json             # English
│   └── index.ts
├── App.tsx                     # Root component
└── main.tsx                    # Entry point

public/
├── index.html
└── assets/

tests/
├── __tests__/
│   ├── components/
│   ├── services/
│   └── pages/
└── e2e/

.github/
└── workflows/
    └── ci.yml                  # GitHub Actions pipeline

docs/
├── README.md
├── SETUP.md
├── ARCHITECTURE.md
└── DEVELOPMENT.md (coming soon)
```

## 🔄 Development Workflow

### 4-Terminal Protocol
Projekt używa równoległej strategii 4-terminali dla szybszego development:

| Terminal | Rola | Foldery |
|----------|------|---------|
| 1 | Frontend Pages | src/pages/ |
| 2 | Backend & Hooks | src/contexts/, src/hooks/, src/i18n/ |
| 3 | Components & Tests | src/components/, tests/ |
| 4 | Review & DevOps | docs/, .github/ |

### Dostępne Komendy
```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run type-check       # TypeScript check
npm test                 # Run unit tests
npm run test:e2e         # Run E2E tests (Playwright)
npm run preview          # Preview build
```

## 🔐 Security

- ✅ Row-Level Security (RLS) na wszystkich tabelach
- ✅ Supabase Auth z JWT tokens
- ✅ Environment variables dla sekretów
- ✅ HTTPS only
- ✅ Password hashing (Supabase)
- ✅ Session persistence (localStorage)

## 🧪 Testing

### Coverage Target: 80%+

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage report
npm test -- --coverage
```

## 📊 Performance Targets

| Metric | Target |
|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s |
| INP (Interaction to Next Paint) | < 200ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| Bundle (gzipped) | < 150kb |

## 🚢 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
```bash
docker build -t szkoła-2026 .
docker run -p 80:8087 szkoła-2026
```

### Manual
```bash
npm run build
# Deploy dist/ folder to your server
```

## 🐛 Troubleshooting

### Build fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Type errors
```bash
npm run type-check
```

### Supabase connection
- Sprawdź `.env.local` - czy URL i key są prawidłowe
- Sprawdź firewall - czy port 443 jest otwarty
- Sprawdź RLS policies - czy umożliwiają dostęp

## 📝 Sprint Status

| Sprint | Status | Tasks | Est. | Real |
|--------|--------|-------|-----|------|
| 0 | ✅ DONE | Schema, Services, npm install | 5-7h | 17m |
| 1 | 🔄 IN_PROGRESS | Router, Auth, UI, i18n | 21h | - |
| 2-8 | ⏳ TODO | Lessons, Library, Admin, Testing | 60h | - |

Śledzenie: [EXECUTION_LOG.md](../EXECUTION_LOG.md)

## 👥 Team

- **Rotech Group / ILUN Systems**
- **Project Lead**: Mateusz Roszkiewicz
- **Developers**: Team of 4-6 specialists

## 📞 Support

- 📧 Email: support@rotechgroup.com.pl
- 🐛 Issues: [GitHub Issues](https://github.com/rotechgroup/szkoła-2026/issues)
- 📖 Docs: See docs/ folder

## 📄 License

Proprietary - © 2026 Rotech Group / ILUN Systems

---

**Ostatnia aktualizacja**: 2026-06-08  
**Version**: 1.0.0 (Development)  
**Status**: Active Development 🚀
