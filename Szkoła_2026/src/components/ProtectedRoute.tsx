import { type ReactNode, useEffect } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { AuthUser } from '@/types/auth'
import type { RolePermissions } from '@/types/user'

interface ProtectedRouteProps {
  children?: ReactNode
  requiredRole?: AuthUser['role'] | AuthUser['role'][]
  requiredPermission?: keyof RolePermissions
}

export default function ProtectedRoute({ children, requiredRole, requiredPermission }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, canPerform } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600 mb-4 mx-auto" />
          <p className="text-gray-600">Ładowanie...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole && user) {
    const allowed = Array.isArray(requiredRole)
      ? requiredRole.includes(user.role)
      : user.role === requiredRole

    if (!allowed) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Brak dostępu</h1>
            <p className="text-gray-600 mt-2">Nie masz uprawnień do tej strony</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Wróć na stronę główną
            </button>
          </div>
        </div>
      )
    }
  }

  if (requiredPermission && !canPerform(requiredPermission)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Brak uprawnień</h1>
          <p className="text-gray-600 mt-2">Nie masz uprawnień do tej akcji</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Wróć
          </button>
        </div>
      </div>
    )
  }

  return children ? <>{children}</> : <Outlet />
}
