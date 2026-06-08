import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { userService } from '@/services/user.service'
import type { User, UserRole } from '@/types/user'

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  teacher: 'Nauczyciel',
  student: 'Uczen',
  parent: 'Rodzic',
}

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-700',
  teacher: 'bg-blue-100 text-blue-700',
  student: 'bg-green-100 text-green-700',
  parent: 'bg-orange-100 text-orange-700',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  invited: 'bg-yellow-100 text-yellow-700',
  inactive: 'bg-gray-100 text-gray-500',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Aktywny',
  invited: 'Zaproszony',
  inactive: 'Nieaktywny',
}

export default function UserManagementPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('teacher')
  const [isInviting, setIsInviting] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null)
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all')

  useEffect(() => {
    if (!currentUser?.workspaceId) return
    loadUsers()
  }, [currentUser?.workspaceId])

  async function loadUsers() {
    if (!currentUser?.workspaceId) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await userService.getAllWorkspaceUsers(currentUser.workspaceId)
      setUsers(data)
    } catch (err: unknown) {
      setError('Nie udalo sie zaladowac uzytkownikow')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim() || !currentUser?.workspaceId || !currentUser?.id) return
    setIsInviting(true)
    setInviteSuccess(null)
    setError(null)
    try {
      await userService.inviteUser(
        inviteEmail.trim(),
        inviteRole,
        currentUser.workspaceId,
        currentUser.id
      )
      setInviteSuccess(`Zaproszenie wyslane do ${inviteEmail}`)
      setInviteEmail('')
    } catch (err: unknown) {
      setError('Nie udalo sie wyslac zaproszenia')
    } finally {
      setIsInviting(false)
    }
  }

  async function handleDeactivate(userId: string) {
    if (!confirm('Czy na pewno chcesz dezaktywowac tego uzytkownika?')) return
    try {
      await userService.deactivateUser(userId)
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: 'inactive' as const } : u))
      )
    } catch {
      setError('Nie udalo sie dezaktywowac uzytkownika')
    }
  }

  const filteredUsers =
    filterRole === 'all' ? users : users.filter((u) => u.role === filterRole)

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Zarzadzanie uzytkownikami</h1>
          <p className="text-gray-500 text-sm mt-1">
            Zapraszaj i zarzadzaj uzytkownikami w swojej szkole
          </p>
        </div>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {users.length} uzytkownikow
        </span>
      </div>

      {/* Invite form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Zapros uzytkownika</h2>

        {inviteSuccess && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {inviteSuccess}
          </div>
        )}

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            placeholder="adres@email.com"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as UserRole)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="teacher">Nauczyciel</option>
            <option value="student">Uczen</option>
            <option value="parent">Rodzic</option>
            <option value="admin">Administrator</option>
          </select>
          <button
            onClick={handleInvite}
            disabled={isInviting || !inviteEmail.trim()}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isInviting ? 'Wysylam...' : 'Zapros'}
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'teacher', 'student', 'parent', 'admin'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setFilterRole(r)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterRole === r
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {r === 'all' ? 'Wszyscy' : ROLE_LABELS[r]}
          </button>
        ))}
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium">Brak uzytkownikow</p>
            <p className="text-sm mt-1">Zapros pierwszego uzytkownika powyzej</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Uzytkownik
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Rola
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Data dolaczenia
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{u.name || '—'}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role]}`}
                    >
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[u.status] ?? ''}`}
                    >
                      {STATUS_LABELS[u.status] ?? u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {u.created_at
                      ? new Date(u.created_at).toLocaleDateString('pl-PL')
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.id !== currentUser?.id && u.status !== 'inactive' && (
                      <button
                        onClick={() => handleDeactivate(u.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                      >
                        Dezaktywuj
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
