# Szkoła 2026 - Platforma Edukacyjna AI

**Lokalizacja**: `C:\Visual Studio Code\Projekty\Szkoła_2026`

## Status Projektu

- ✅ Folder struktury stworzona (Faza 1)
- ✅ `PLAN.md` - pełny plan przebudowy
- ✅ `SETUP.md` - progress tracking
- ⏳ Faza 2: Rozpoczyna się

## Dokumentacja

- **PLAN.md** - Pełny plan przebudowy (6 faz, 20 dni)
- **SETUP.md** - Tracking Fazy 1
- **README.md** - Ten plik

## Struktura

```
Szkoła_2026/
├── PLAN.md                      # Pełny plan przebudowy
├── SETUP.md                     # Tracking Fazy 1
├── README.md                    # Ten plik
├── package.json                 # Dependencies
├── vite.config.ts              # Vite config
├── tsconfig.json               # TypeScript config
├── index.html                  # Entry HTML
├── .env.example                # Environment template
│
├── src/
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── layout/            # Layout wrappers
│   │   └── lesson/            # Lesson-specific components
│   │
│   ├── pages/
│   │   ├── auth/              # Login, signup pages
│   │   ├── teacher/           # Teacher dashboard, lesson editor
│   │   ├── library/           # Lesson library
│   │   ├── admin/             # Admin panel
│   │   └── billing/           # Billing/subscription pages
│   │
│   ├── services/              # Supabase integration
│   ├── contexts/              # React contexts
│   ├── hooks/                 # Custom hooks
│   ├── types/                 # TypeScript types
│   ├── lib/                   # Utilities
│   ├── styles/                # Global CSS
│   ├── App.tsx               # Main app component
│   └── main.tsx              # Entry point
│
├── public/                     # Static assets
└── node_modules/              # Dependencies (po npm install)
```

## Następne Kroki

1. **Zainstaluj dependencies**: `npm install`
2. **Skonfiguruj .env** z Supabase credentials
3. **Przejdź do Fazy 2**: Setup Auth & Core Pages

## Linki

- Plan: `./PLAN.md`
- Setup tracking: `./SETUP.md`
