# 🚀 Setup Guide - Szkoła 2026

## Wymagania

- **Node.js**: 18.x lub 20.x
- **npm**: 9.x lub wyżej
- **Supabase**: Bezpłatne konto lub zapora instancja
- **Git**: do kontroli wersji

## Kroki instalacji

### 1. Klonuj repozytorium
```bash
git clone https://github.com/rotechgroup/szkoła-2026.git
cd szkoła-2026
```

### 2. Zainstaluj zależności
```bash
npm install
```

### 3. Skonfiguruj zmienne środowiska
```bash
cp .env.example .env.local
```

Edytuj `.env.local` i uzupełnij:
- `VITE_SUPABASE_URL` - URL twojej instancji Supabase
- `VITE_SUPABASE_ANON_KEY` - Anonimowy klucz Supabase
- `VITE_N8N_URL` - URL instancji n8n (opcjonalnie)
- `VITE_N8N_WEBHOOK_TOKEN` - Token webhook n8n (opcjonalnie)

### 4. Skonfiguruj bazę danych

Zaloguj się do panelu Supabase i uruchom SQL z `SCHEMA.sql`:
```sql
-- Przejdź do SQL Editor w Supabase
-- Kopiuj zawartość SCHEMA.sql
-- Wklej i uruchom
```

Wszystkie tabele, polityki RLS i indeksy zostaną utworzone automatycznie.

### 5. Uruchom development server
```bash
npm run dev
```

Aplikacja będzie dostępna na `http://localhost:8087`

## Struktura projektu

```
src/
├── pages/              # Strony (Login, Dashboard, Library, Admin)
├── components/         # Komponenty (UI, Lesson, Library)
├── contexts/           # React Context (Auth, Language)
├── hooks/              # Custom hooks
├── services/           # Business logic (auth, lessons, library)
├── lib/                # Utilities (Supabase, database types)
├── i18n/               # Internationalization (PL + EN)
├── types/              # TypeScript definitions
└── App.tsx             # Główny komponent
```

## Dostępne komendy

```bash
npm run dev           # Uruchom development server
npm run build         # Build na produkcję
npm run preview       # Podgląd buildu
npm run type-check    # Type-check bez kompilacji
npm test              # Uruchom unit testy
npm run test:e2e      # Uruchom E2E testy (Playwright)
```

## Autentykacja

Aplikacja używa Supabase Auth z obsługą:
- Email/Password
- Google OAuth (opcjonalnie)
- Session persistence (localStorage)

Przykład logowania:
```typescript
const { login } = useAuth()
await login(email, password)
```

## Internationalization

Aplikacja obsługuje:
- 🇵🇱 Polski (domyślny)
- 🇬🇧 Angielski

Aby zmienić język:
```typescript
const { changeLanguage } = useLanguage()
await changeLanguage('en')
```

## Troubleshooting

### Build fails
```bash
# Wyczyść node_modules i reinstaluj
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Types error
```bash
npm run type-check
```

### Supabase connection error
- Sprawdź `.env.local` - czy URL i klucz są prawidłowe
- Sprawdź firewall - czy port 443 jest otwarty
- Sprawdź RLS policies - czy umożliwiają dostęp

## Deployment

### Vercel (rekomendowane)
```bash
npm install -g vercel
vercel
```

Vercel automatycznie wykryje Vite i skonfiguruje build.

### Docker
```bash
docker build -t szkoła-2026 .
docker run -p 80:8087 szkoła-2026
```

### Manual (selbst-hosted)
```bash
npm run build
# Skopiuj zawartość `dist/` na serwer
```

## Support

- 📧 Email: support@rotechgroup.com.pl
- 📚 Dokumentacja: docs/README.md
- 🐛 Issues: GitHub Issues

---

**Ostatnia aktualizacja**: 2026-06-08
