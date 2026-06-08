// School signup form
export interface SchoolSignupFormData {
  schoolName: string
  address: string
  contactEmail: string
  contactPhone: string
  adminEmail: string
  adminPassword: string
}

// Teacher join form
export interface JoinTeacherFormData {
  inviteCode: string
  email: string
  password: string
  name: string
}

// Auth response
export interface AuthResponse {
  user: AuthUser
  session: Session
  workspace: Workspace
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'teacher' | 'school_admin' | 'super_admin'
  workspaceId: string
  workspaceRole: string
}

export interface Session {
  access_token: string
  refresh_token: string
  expires_at: number
}

export interface Workspace {
  id: string
  name: string
  type: string | null
  ownerId: string | null
  isSchool: boolean
  schoolId?: string
}

// Invite validation result
export interface InviteValidationResult {
  valid: boolean
  inviteId?: string
  schoolName?: string
  adminName?: string
  error?: string
}

// Auth error
export class AuthError extends Error {
  constructor(public code: string, message: string) {
    super(message)
    this.name = 'AuthError'
  }
}
