import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useContext } from 'react'
import type { AuthContextValue } from '@/contexts/AuthContext'

// Mock supabase before importing modules that depend on it
vi.mock('@/lib/supabase', () => ({ supabase: { auth: { getSession: vi.fn(), onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })) } } }))
vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual<typeof import('@/contexts/AuthContext')>('@/contexts/AuthContext')
  return { ...actual }
})

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return { ...actual, useContext: vi.fn() }
})

const { useAuth } = await import('./useAuth')

vi.mock('@/services/authService', () => ({
  authService: {
    signupSchool: vi.fn(),
    joinAsTeacher: vi.fn(),
    getCurrentSession: vi.fn(),
  },
}))

const mockContextValue: AuthContextValue = {
  user: {
    id: 'user-1',
    email: 'teacher@school.pl',
    name: 'Jan Kowalski',
    role: 'teacher',
    workspaceId: 'ws-1',
    workspaceRole: 'member',
  },
  isLoading: false,
  isAuthenticated: true,
  canPerform: vi.fn(() => false),
  signOut: vi.fn(),
}

describe('useAuth', () => {
  it('returns auth context values when inside AuthProvider', () => {
    vi.mocked(useContext).mockReturnValue(mockContextValue)

    const { result } = renderHook(() => useAuth())

    expect(result.current.user?.email).toBe('teacher@school.pl')
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isLoading).toBe(false)
  })

  it('throws when used outside AuthProvider', () => {
    vi.mocked(useContext).mockReturnValue(null)

    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within AuthProvider'
    )
  })

  it('exposes signupSchool function', () => {
    vi.mocked(useContext).mockReturnValue(mockContextValue)

    const { result } = renderHook(() => useAuth())
    expect(typeof result.current.signupSchool).toBe('function')
  })

  it('exposes joinAsTeacher function', () => {
    vi.mocked(useContext).mockReturnValue(mockContextValue)

    const { result } = renderHook(() => useAuth())
    expect(typeof result.current.joinAsTeacher).toBe('function')
  })

  it('exposes getCurrentSession function', () => {
    vi.mocked(useContext).mockReturnValue(mockContextValue)

    const { result } = renderHook(() => useAuth())
    expect(typeof result.current.getCurrentSession).toBe('function')
  })
})
