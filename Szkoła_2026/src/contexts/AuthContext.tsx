import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { AuthUser } from '@/types/auth'
import type { UserRole, RolePermissions } from '@/types/user'
import { ROLE_PERMISSIONS } from '@/types/user'

export interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  canPerform: (permission: keyof RolePermissions) => boolean
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          name: session.user.user_metadata?.name ?? '',
          role: session.user.user_metadata?.role ?? 'teacher',
          workspaceId: session.user.user_metadata?.workspace_id ?? '',
          workspaceRole: session.user.user_metadata?.workspace_role ?? 'member',
        })
      }
      setIsLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          name: session.user.user_metadata?.name ?? '',
          role: session.user.user_metadata?.role ?? 'teacher',
          workspaceId: session.user.user_metadata?.workspace_id ?? '',
          workspaceRole: session.user.user_metadata?.workspace_role ?? 'member',
        })
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const canPerform = (permission: keyof RolePermissions): boolean => {
    if (!user) return false
    const role = user.role as UserRole
    const perms = ROLE_PERMISSIONS[role]
    if (!perms) return false
    const value = perms[permission]
    return typeof value === 'boolean' ? value : false
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, canPerform, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
