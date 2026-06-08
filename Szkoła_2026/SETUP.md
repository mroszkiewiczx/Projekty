# FAZA 1: SETUP & STRUCTURE

## Status: IN PROGRESS ✓

### DONE:
- [x] Created folder: C:\Visual Studio Code\Projekty\Szkoła_2026
- [x] Copied PLAN.md to project folder

### TODO:

#### Step 1: Initialize npm project
```bash
cd C:\Visual Studio Code\Projekty\Szkoła_2026
npm init -y
npm install react react-dom react-router-dom typescript @types/react @types/react-dom
npm install -D vite @vitejs/plugin-react typescript
npm install tailwindcss postcss autoprefixer
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### Step 2: Create folder structure
```
src/
├── components/
│   ├── ui/
│   ├── layout/
│   └── lesson/
├── pages/
│   ├── auth/
│   ├── teacher/
│   ├── library/
│   ├── admin/
│   └── billing/
├── services/
├── contexts/
├── hooks/
├── types/
├── lib/
├── styles/
├── App.tsx
└── main.tsx
public/
vite.config.ts
tsconfig.json
tailwind.config.js
postcss.config.js
index.html
```

#### Step 3: Copy from School_AI_Custom
- [x] package.json (base)
- [ ] vite.config.ts
- [ ] tsconfig.json
- [ ] .env.example
- [ ] tailwind config
- [ ] Services (lessonService, authService, etc.)
- [ ] Types (lesson.ts, etc.)

#### Step 4: Setup Supabase
- [ ] Create Supabase project
- [ ] Setup schema (migrations)
- [ ] Configure RLS policies
- [ ] Create .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

#### Step 5: Init git
```bash
git init
git add .
git commit -m "Initial project setup"
```

---

## Next: Start copying files from School_AI_Custom

