# Developer Guidelines - Szkoła 2026

Wytyczne dla Terminali 1, 2, 3 podczas implementacji Sprint 1.

## ⚠️ GOLDEN RULES

### 1. NO DEMO CODE
**To ma być działająca aplikacja, nie demo.**

❌ **WRONG**: Placeholder buttons, mock data, "coming soon"  
✅ **RIGHT**: Functional components connected to real services

### 2. Type Safety FIRST
All code must pass:
```bash
npm run type-check  # Must be 0 errors
```

No `any` types. Use `unknown` with proper narrowing if needed.

### 3. Test as You Code
**TDD**: Write tests BEFORE implementation
- Unit tests: Functions, hooks, services
- Integration tests: Pages, flows
- E2E tests: Critical user journeys
- Target: 80%+ coverage

### 4. Security by Default
- No hardcoded secrets
- Validate user input
- Use Zod schemas
- Check RLS policies
- Never trust external data

### 5. Error Handling
Every async operation must handle errors:
```typescript
try {
  const result = await riskyOperation()
} catch (error: unknown) {
  // Handle properly, don't swallow
  logger.error('Operation failed', error)
  throw new Error(getErrorMessage(error))
}
```

---

## Code Style Standards

### TypeScript
- **Targets**: ES2020
- **Strict mode**: ON (`strict: true`)
- **No implicit any**: ON
- **JSX**: React 18

### Immutability
Use spread operator, NOT mutations:
```typescript
// WRONG
user.name = 'John'

// RIGHT
const updatedUser = { ...user, name: 'John' }
```

### Naming
- Variables/functions: `camelCase`
- Components: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Hooks: `useXxx`
- Types: `PascalCase`

### File Size
- Functions: < 50 lines
- Files: < 800 lines
- Extract to modules if larger

### No Dead Code
- No commented-out code
- No unused variables/imports
- No orphaned functions
- Run `npm run type-check` to verify

---

## Component Guidelines

### Props
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick: (e: React.MouseEvent) => void
  children: React.ReactNode
}

export function Button({ variant = 'primary', ...props }: ButtonProps) {
  // Implement
}
```

### Accessibility
Every component must consider:
- Semantic HTML (button, input, nav, etc.)
- ARIA labels where needed
- Keyboard navigation
- Focus management
- Color contrast

### Styling
Use Tailwind CSS:
```typescript
// RIGHT
<button className="px-4 py-2 rounded bg-blue-600 text-white">
  Click me
</button>

// WRONG
<button style={{ padding: '8px 16px', background: '#0066cc' }}>
  Click me
</button>
```

---

## Service Layer

### All Services Follow This Pattern

```typescript
// src/services/exampleService.ts

interface ExampleItem {
  id: string
  name: string
  createdAt: string
}

export const exampleService = {
  // READ
  async getAll(): Promise<ExampleItem[]> {
    // Implement with proper error handling
  },

  async getById(id: string): Promise<ExampleItem | null> {
    // Implement
  },

  // CREATE
  async create(data: CreateDto): Promise<ExampleItem> {
    // Validate, create, return
  },

  // UPDATE
  async update(id: string, data: UpdateDto): Promise<ExampleItem> {
    // Validate, update, return
  },

  // DELETE
  async delete(id: string): Promise<void> {
    // Delete, handle errors
  }
}
```

### Error Handling in Services
```typescript
async function getLesson(id: string): Promise<Lesson> {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) throw new Error('Lesson not found')

    return data as Lesson
  } catch (error: unknown) {
    logger.error('getLesson failed', error)
    throw new Error(`Failed to fetch lesson: ${getErrorMessage(error)}`)
  }
}
```

---

## Custom Hooks

### Pattern
```typescript
// src/hooks/useXxx.ts

export function useMyHook(param: string) {
  const [state, setState] = useState<Type | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    async function load() {
      try {
        setLoading(true)
        const data = await fetchData(param)
        if (isMounted) setState(data)
      } catch (err: unknown) {
        if (isMounted) setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()
    return () => { isMounted = false }
  }, [param])

  return { state, loading, error }
}
```

### TanStack Query Pattern (Preferred for async data)
```typescript
import { useQuery } from '@tanstack/react-query'

export function useLesson(id: string) {
  return useQuery({
    queryKey: ['lesson', id],
    queryFn: () => lessonService.getById(id),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}
```

---

## Forms

### Use react-hook-form + Zod
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters')
})

type FormData = z.infer<typeof schema>

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} placeholder="Email" />
      {errors.email && <span className="text-red-500">{errors.email.message}</span>}
      
      <input {...register('password')} type="password" placeholder="Password" />
      {errors.password && <span className="text-red-500">{errors.password.message}</span>}
      
      <button type="submit">Login</button>
    </form>
  )
}
```

---

## Testing Patterns

### Unit Tests (Jest + React Testing Library)
```typescript
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = jest.fn()
    render(<Button onClick={onClick}>Click</Button>)
    screen.getByText('Click').click()
    expect(onClick).toHaveBeenCalled()
  })
})
```

### E2E Tests (Playwright)
```typescript
import { test, expect } from '@playwright/test'

test('login flow works', async ({ page }) => {
  await page.goto('http://localhost:8087/login')
  
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password123')
  
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('h1')).toContainText('Dashboard')
})
```

---

## Checklist Before Submitting for Review

- [ ] `npm run type-check` → 0 errors
- [ ] `npm run build` → success
- [ ] Tests written (TDD)
- [ ] Test coverage 80%+
- [ ] No console.log statements
- [ ] No hardcoded secrets
- [ ] Error handling on all async operations
- [ ] Immutability patterns used
- [ ] Functions < 50 lines
- [ ] Proper naming conventions
- [ ] Accessibility considered
- [ ] Commit messages follow conventional commits
- [ ] Branch up to date with main
- [ ] No merge conflicts

---

## Common Mistakes to Avoid

❌ **Hardcoded Values**
```typescript
const apiUrl = 'https://api.example.com' // WRONG
const apiUrl = process.env.VITE_API_URL // RIGHT
```

❌ **Mutating Objects**
```typescript
user.name = 'John' // WRONG
const updated = { ...user, name: 'John' } // RIGHT
```

❌ **Missing Error Handling**
```typescript
const data = await fetch('/api/data').then(r => r.json()) // WRONG
try {
  const data = await fetch('/api/data').then(r => r.json()) // RIGHT
} catch (error: unknown) {
  // Handle error
}
```

❌ **Any Types**
```typescript
function process(data: any) { } // WRONG
function process(data: unknown) { // RIGHT
  // Narrow safely
}
```

❌ **Props Drilling**
```typescript
// Multiple levels: Parent → Child → GrandChild
// Use Context instead!
```

---

## When Terminal 4 Reviews Your Code

Terminal 4 will check:

1. **Type Safety**: TypeScript errors, type coverage
2. **Security**: Secrets, input validation, RLS, auth
3. **Performance**: Bundle size, optimization, unnecessary renders
4. **Testing**: 80%+ coverage, critical paths tested
5. **Code Quality**: Patterns, immutability, error handling
6. **Documentation**: Comments, function docs

**Reviews are non-blocking** but must pass before Sprint is marked DONE.

---

## Resources

- [Architecture](./ARCHITECTURE.md) - System design
- [Code Review Checklist](./CODE_REVIEW_CHECKLIST.md) - What Terminal 4 checks
- [SETUP.md](./SETUP.md) - Installation & configuration
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Official TS docs
- [React Docs](https://react.dev) - React 18 docs
- [Tailwind Docs](https://tailwindcss.com/docs) - Styling docs

---

**Ostatnia aktualizacja**: 2026-06-08  
**Obowiązkowe dla**: Terminal 1, Terminal 2, Terminal 3  
**Sprawdzane przez**: Terminal 4 - Code Review
