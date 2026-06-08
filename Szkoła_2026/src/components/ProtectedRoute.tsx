import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { AuthUser } from '@/types/auth'

interface ProtectedRouteProps {
  requiredRole?: AuthUser['role'] | AuthUser['role'][]
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (requiredRole && user) {
    const allowed = Array.isArray(requiredRole)
      ? requiredRole.includes(user.role)
      : user.role === requiredRole

    if (!allowed) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return <Outlet />
}
