export type UserRole = 'teacher' | 'student' | 'parent' | 'admin'
export type UserStatus = 'active' | 'invited' | 'inactive'

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  role: UserRole
  status: UserStatus
  workspace_id: string
  created_at: Date
  updated_at: Date
  phone?: string
  bio?: string
}

export interface UserInvite {
  id: string
  email: string
  role: UserRole
  workspace_id: string
  invite_code: string
  status: 'pending' | 'accepted' | 'expired'
  created_at: Date
  expires_at: Date
  created_by: string
}

export interface UserSettings {
  user_id: string
  notifications_enabled: boolean
  email_digest: 'daily' | 'weekly' | 'monthly' | 'never'
  theme: 'light' | 'dark' | 'auto'
  language: 'pl' | 'en'
}

export interface RolePermissions {
  role: UserRole
  can_create_lessons: boolean
  can_edit_all_lessons: boolean
  can_view_analytics: boolean
  can_manage_users: boolean
  can_grade_students: boolean
  can_access_reports: boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    role: 'admin',
    can_create_lessons: true,
    can_edit_all_lessons: true,
    can_view_analytics: true,
    can_manage_users: true,
    can_grade_students: true,
    can_access_reports: true,
  },
  teacher: {
    role: 'teacher',
    can_create_lessons: true,
    can_edit_all_lessons: false,
    can_view_analytics: true,
    can_manage_users: false,
    can_grade_students: true,
    can_access_reports: true,
  },
  student: {
    role: 'student',
    can_create_lessons: false,
    can_edit_all_lessons: false,
    can_view_analytics: false,
    can_manage_users: false,
    can_grade_students: false,
    can_access_reports: false,
  },
  parent: {
    role: 'parent',
    can_create_lessons: false,
    can_edit_all_lessons: false,
    can_view_analytics: false,
    can_manage_users: false,
    can_grade_students: false,
    can_access_reports: true,
  },
}
