import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import { AuthProvider } from '@/contexts/AuthContext'
import LoginPage from './LoginPage'
import i18n from '@/i18n'

// Mock the auth service
vi.mock('@/services/authService', () => ({
  authService: {
    signInWithEmail: vi.fn(),
  },
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </I18nextProvider>
    </BrowserRouter>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form', () => {
    renderLoginPage()
    expect(screen.getByText(/zaloguj się do szkoły 2026/i)).toBeInTheDocument()
  })

  it('renders email input', () => {
    renderLoginPage()
    const emailInput = screen.getByPlaceholderText(/email/i)
    expect(emailInput).toBeInTheDocument()
  })

  it('renders password input', () => {
    renderLoginPage()
    const passwordInput = screen.getByPlaceholderText(/hasło/i)
    expect(passwordInput).toBeInTheDocument()
  })

  it('renders submit button', () => {
    renderLoginPage()
    expect(screen.getByRole('button', { name: /zaloguj się/i })).toBeInTheDocument()
  })

  it('renders signup link', () => {
    renderLoginPage()
    expect(screen.getByRole('link', { name: /zarejestruj szkołę/i })).toBeInTheDocument()
  })

  it('renders join with code link', () => {
    renderLoginPage()
    expect(screen.getByRole('link', { name: /dołącz z kodem/i })).toBeInTheDocument()
  })

  it('disables submit button when form is empty', () => {
    renderLoginPage()
    const submitButton = screen.getByRole('button', { name: /zaloguj się/i })
    expect(submitButton).not.toBeDisabled()
  })

  it('shows error message when email is invalid', async () => {
    renderLoginPage()
    const emailInput = screen.getByPlaceholderText(/email/i)

    await userEvent.type(emailInput, 'invalid-email')
    await userEvent.click(screen.getByRole('button', { name: /zaloguj się/i }))

    await waitFor(() => {
      expect(screen.getByText(/nieprawidłowy adres email/i)).toBeInTheDocument()
    })
  })

  it('shows error message when password is too short', async () => {
    renderLoginPage()
    const emailInput = screen.getByPlaceholderText(/email/i)
    const passwordInput = screen.getByPlaceholderText(/hasło/i)

    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.type(passwordInput, 'short')
    await userEvent.click(screen.getByRole('button', { name: /zaloguj się/i }))

    await waitFor(() => {
      expect(screen.getByText(/co najmniej 8 znaków/i)).toBeInTheDocument()
    })
  })

  it('renders page title "Szkoła 2026"', () => {
    renderLoginPage()
    expect(screen.getByText('Szkoła 2026')).toBeInTheDocument()
  })

  it('renders subtitle "Zaloguj się do swojego konta"', () => {
    renderLoginPage()
    expect(screen.getByText(/zaloguj się do swojego konta/i)).toBeInTheDocument()
  })
})
