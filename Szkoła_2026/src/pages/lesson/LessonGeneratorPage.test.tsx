import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import LessonGeneratorPage from './LessonGeneratorPage'

// Initialise a minimal i18n instance for tests without localStorage dependency
if (!i18n.isInitialized) {
  i18n.init({
    lng: 'pl',
    fallbackLng: 'pl',
    resources: { pl: { translation: {} } },
    interpolation: { escapeValue: false },
  })
}

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-1', workspaceId: 'ws-1', email: 'teacher@test.pl' },
    isAuthenticated: true,
    isLoading: false,
  }),
}))

vi.mock('@/services/lessonService', () => ({
  lessonService: {
    generateLesson: vi.fn().mockResolvedValue({
      id: 'lesson-1',
      title: 'Fotosynteza',
      topic: 'Fotosynteza',
      content: '<p>Treść lekcji</p>',
      objectives: ['Cel 1'],
      activities: [],
      assessment: '',
      materials: [],
      qualityScore: 8,
      generatedAt: new Date(),
      status: 'draft',
    }),
    publishLesson: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('@/components/lesson', () => ({
  RichTextEditor: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea data-testid="rich-editor" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
  ImageUploader: () => <div data-testid="image-uploader" />,
}))

const renderPage = () =>
  render(
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        <LessonGeneratorPage />
      </I18nextProvider>
    </BrowserRouter>
  )

describe('LessonGeneratorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page title', () => {
    renderPage()
    expect(screen.getByText('Generuj nową lekcję')).toBeInTheDocument()
  })

  it('renders topic input', () => {
    renderPage()
    expect(screen.getByPlaceholderText(/Fotosynteza/i)).toBeInTheDocument()
  })

  it('renders generate button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /generuj lekcję ai/i })).toBeInTheDocument()
  })

  it('shows validation error when topic is too short', async () => {
    renderPage()
    const submitBtn = screen.getByRole('button', { name: /generuj lekcję ai/i })
    await userEvent.click(submitBtn)

    await waitFor(() => {
      const errors = screen.getAllByText(/temat musi mieć co najmniej 3 znaki/i)
      expect(errors.length).toBeGreaterThan(0)
    })
  })

  it('shows validation error when objectives are too short', async () => {
    renderPage()

    await userEvent.type(screen.getByPlaceholderText(/Fotosynteza/i), 'Mój temat lekcji')
    await userEvent.click(screen.getByRole('button', { name: /generuj lekcję ai/i }))

    await waitFor(() => {
      const errors = screen.getAllByText(/opisz cele lekcji/i)
      expect(errors.length).toBeGreaterThan(0)
    })
  })

  it('renders multiple select dropdowns for form fields', () => {
    renderPage()
    const selects = screen.getAllByRole('combobox')
    // subject, educationLevel, grade, learningStyle = at least 4 selects
    expect(selects.length).toBeGreaterThanOrEqual(4)
  })

  it('renders objectives textarea', () => {
    renderPage()
    const textareas = screen.getAllByRole('textbox')
    // topic input + objectives textarea
    expect(textareas.length).toBeGreaterThanOrEqual(2)
  })
})
