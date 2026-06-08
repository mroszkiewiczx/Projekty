import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from '@/contexts/AuthContext'
import { authService } from '@/services/authService'
import type { SchoolSignupFormData, JoinTeacherFormData } from '@/types/auth'

export type UseAuthReturn = AuthContextValue & {
  signupSchool: (data: SchoolSignupFormData) => Promise<void>
  joinAsTeacher: (data: JoinTeacherFormData) => Promise<void>
  getCurrentSession: () => Promise<any>
}

export function useAuth(): UseAuthReturn {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return {
    user: ctx.user,
    isLoading: ctx.isLoading,
    isAuthenticated: ctx.isAuthenticated,
    signOut: ctx.signOut,
    signupSchool: authService.signupSchool.bind(authService),
    joinAsTeacher: authService.joinAsTeacher.bind(authService),
    getCurrentSession: authService.getCurrentSession.bind(authService)
  }
}
