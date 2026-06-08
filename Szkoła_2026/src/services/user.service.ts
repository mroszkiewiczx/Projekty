import { supabase } from '@/lib/supabase'
import type { User, UserInvite, UserSettings, UserRole, RolePermissions } from '@/types/user'
import { ROLE_PERMISSIONS } from '@/types/user'

type DbUser = {
  id: string
  email: string
  name: string
  role: string
  status: string
  workspace_id: string
  created_at: string
  updated_at: string
  avatar_url?: string
  phone?: string
  bio?: string
}

function mapDbUser(row: DbUser): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as UserRole,
    status: row.status as User['status'],
    workspace_id: row.workspace_id,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
    avatar_url: row.avatar_url,
    phone: row.phone,
    bio: row.bio,
  }
}

export const userService = {
  async getCurrentUser(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !data) return null
    return mapDbUser(data as unknown as DbUser)
  },

  async getUsersByRole(workspaceId: string, role: UserRole): Promise<User[]> {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('workspace_id', workspaceId)

    if (!data) return []
    return (data as unknown as DbUser[])
      .filter((u) => u.role === role)
      .map(mapDbUser)
  },

  async getAllWorkspaceUsers(workspaceId: string): Promise<User[]> {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })

    if (!data) return []
    return (data as unknown as DbUser[]).map(mapDbUser)
  },

  async inviteUser(
    email: string,
    role: UserRole,
    workspaceId: string,
    invitedBy: string
  ): Promise<UserInvite> {
    const inviteCode = generateInviteCode()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const { data, error } = await supabase
      .from('teacher_invites')
      .insert([
        {
          email,
          invite_code: inviteCode,
          status: 'pending',
          workspace_id: workspaceId,
          created_by: invitedBy,
          expires_at: expiresAt.toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw new Error(error.message)

    const row = data as unknown as {
      id: string
      email: string
      workspace_id: string
      invite_code: string
      status: string
      created_at: string
      expires_at: string
      created_by: string
    }

    return {
      id: row.id,
      email: row.email,
      role,
      workspace_id: row.workspace_id,
      invite_code: row.invite_code,
      status: row.status as UserInvite['status'],
      created_at: new Date(row.created_at),
      expires_at: new Date(row.expires_at),
      created_by: row.created_by,
    }
  },

  async acceptInvite(inviteCode: string, name: string): Promise<User> {
    const { data: invite, error: inviteError } = await supabase
      .from('teacher_invites')
      .select('*')
      .eq('invite_code', inviteCode)
      .single()

    if (inviteError || !invite) throw new Error('Nieprawidlowy kod zaproszenia')

    const inviteRow = invite as unknown as {
      id: string
      email: string
      workspace_id: string
      expires_at: string
    }

    if (new Date(inviteRow.expires_at) < new Date()) {
      throw new Error('Zaproszenie wygaslo')
    }

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([
        {
          email: inviteRow.email,
          name,
          role: 'teacher',
          workspace_id: inviteRow.workspace_id,
          status: 'active',
        },
      ])
      .select()
      .single()

    if (createError) throw new Error(createError.message)

    await supabase
      .from('teacher_invites')
      .update({ status: 'accepted' })
      .eq('id', inviteRow.id)

    return mapDbUser(newUser as unknown as DbUser)
  },

  async updateUserProfile(userId: string, updates: Partial<Pick<User, 'name'>>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ name: updates.name, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return mapDbUser(data as unknown as DbUser)
  },

  async deactivateUser(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ status: 'inactive' })
      .eq('id', userId)

    if (error) throw new Error(error.message)
  },

  // user_settings tabela nie istnieje w schemacie DB — zwracamy domyslne wartosci
  getUserSettings(userId: string): UserSettings {
    return {
      user_id: userId,
      notifications_enabled: true,
      email_digest: 'weekly',
      theme: 'auto',
      language: 'pl',
    }
  },
}

export function canUserPerform(
  userRole: UserRole,
  permission: keyof RolePermissions
): boolean {
  const perms = ROLE_PERMISSIONS[userRole]
  const value = perms[permission]
  return typeof value === 'boolean' ? value : false
}

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}
