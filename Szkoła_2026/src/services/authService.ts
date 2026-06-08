import { supabase } from '@/lib/supabase'
import {
  SchoolSignupFormData,
  JoinTeacherFormData,
  AuthResponse,
  AuthUser,
  InviteValidationResult,
  AuthError
} from '@/types/auth'

export const authService = {
  // Sign up a new school
  async signupSchool(data: SchoolSignupFormData): Promise<AuthResponse> {
    try {
      // Validate input
      if (!data.schoolName || data.schoolName.length < 3) {
        throw new AuthError('INVALID_SCHOOL_NAME', 'School name must be at least 3 characters')
      }
      if (!data.adminEmail || !this.isValidEmail(data.adminEmail)) {
        throw new AuthError('INVALID_EMAIL', 'Please enter a valid email')
      }
      if (!data.adminPassword || data.adminPassword.length < 8) {
        throw new AuthError('WEAK_PASSWORD', 'Password must be at least 8 characters')
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.adminEmail,
        password: data.adminPassword
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new AuthError('EMAIL_EXISTS', 'This email is already registered')
        }
        throw new AuthError('AUTH_SIGNUP_FAILED', authError.message)
      }

      if (!authData.user) {
        throw new AuthError('AUTH_SIGNUP_FAILED', 'Failed to create user')
      }

      // Create workspace
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name: data.schoolName,
          type: 'school',
          owner_id: authData.user.id,
          is_school: true,
          settings: { language: 'pl', timezone: 'Europe/Warsaw' }
        })
        .select()
        .single()

      if (workspaceError) {
        // Rollback auth user
        await supabase.auth.admin.deleteUser(authData.user.id)
        throw new AuthError('WORKSPACE_CREATE_FAILED', workspaceError.message)
      }

      // Create school profile
      const { data: schoolData, error: schoolError } = await supabase
        .from('school_profiles')
        .insert({
          workspace_id: workspaceData.id,
          name: data.schoolName,
          address: data.address,
          contact_email: data.contactEmail,
          phone: data.contactPhone
        })
        .select()
        .single()

      if (schoolError) {
        // Rollback
        await supabase.from('workspaces').delete().eq('id', workspaceData.id)
        await supabase.auth.admin.deleteUser(authData.user.id)
        throw new AuthError('SCHOOL_CREATE_FAILED', schoolError.message)
      }

      // Create user record
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          workspace_id: workspaceData.id,
          email: data.adminEmail,
          name: data.adminEmail.split('@')[0],
          role: 'school_admin' as const,
          status: 'active'
        })
        .select()
        .single()

      if (userError) {
        // Rollback
        await supabase.from('school_profiles').delete().eq('id', schoolData.id)
        await supabase.from('workspaces').delete().eq('id', workspaceData.id)
        await supabase.auth.admin.deleteUser(authData.user.id)
        throw new AuthError('USER_CREATE_FAILED', userError.message)
      }

      // TODO: Send welcome email with invite link for teachers

      return {
        user: {
          id: authData.user.id,
          email: data.adminEmail,
          name: userData.name,
          role: 'school_admin' as const,
          workspaceId: workspaceData.id,
          workspaceRole: 'school_admin'
        },
        session: {
          access_token: authData.session?.access_token || '',
          refresh_token: authData.session?.refresh_token || '',
          expires_at: authData.session?.expires_at || 0
        },
        workspace: {
          id: workspaceData.id,
          name: workspaceData.name,
          type: workspaceData.type,
          ownerId: workspaceData.owner_id,
          isSchool: true,
          schoolId: schoolData.id
        }
      }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError('UNKNOWN_ERROR', 'An unexpected error occurred')
    }
  },

  // Validate invite code
  async validateInviteCode(code: string): Promise<InviteValidationResult> {
    try {
      const { data, error } = await supabase
        .from('teacher_invites')
        .select('id, status, expires_at, workspace_id, created_by')
        .eq('invite_code', code)
        .single()

      if (error) {
        return {
          valid: false,
          error: 'Invite code not found'
        }
      }

      if (data.status === 'accepted') {
        return {
          valid: false,
          error: 'This invite has already been used'
        }
      }

      if (new Date(data.expires_at) < new Date()) {
        return {
          valid: false,
          error: 'This invite has expired'
        }
      }

      // Get school info
      const { data: schoolData } = await supabase
        .from('school_profiles')
        .select('name')
        .eq('workspace_id', data.workspace_id)
        .single()

      return {
        valid: true,
        inviteId: data.id,
        schoolName: schoolData?.name,
        adminName: undefined
      }
    } catch (error) {
      return {
        valid: false,
        error: 'Error validating invite code'
      }
    }
  },

  // Join as teacher using invite code
  async joinAsTeacher(data: JoinTeacherFormData): Promise<AuthResponse> {
    try {
      // Validate input
      if (!data.inviteCode || data.inviteCode.length < 10) {
        throw new AuthError('INVALID_CODE', 'Please enter a valid invite code')
      }
      if (!data.email || !this.isValidEmail(data.email)) {
        throw new AuthError('INVALID_EMAIL', 'Please enter a valid email')
      }
      if (!data.password || data.password.length < 8) {
        throw new AuthError('WEAK_PASSWORD', 'Password must be at least 8 characters')
      }
      if (!data.name || data.name.length < 2) {
        throw new AuthError('INVALID_NAME', 'Please enter your name')
      }

      // Validate invite
      const inviteValidation = await this.validateInviteCode(data.inviteCode)
      if (!inviteValidation.valid) {
        throw new AuthError('INVALID_INVITE', inviteValidation.error || 'Invalid invite code')
      }

      // Get invite record
      const { data: inviteData, error: inviteError } = await supabase
        .from('teacher_invites')
        .select('id, workspace_id, email')
        .eq('invite_code', data.inviteCode)
        .single()

      if (inviteError) {
        throw new AuthError('INVITE_NOT_FOUND', 'Invite not found')
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new AuthError('EMAIL_EXISTS', 'This email is already registered')
        }
        throw new AuthError('AUTH_SIGNUP_FAILED', authError.message)
      }

      if (!authData.user) {
        throw new AuthError('AUTH_SIGNUP_FAILED', 'Failed to create user')
      }

      // Create user record
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          workspace_id: inviteData.workspace_id,
          email: data.email,
          name: data.name,
          role: 'teacher' as const,
          status: 'active'
        })
        .select()
        .single()

      if (userError) {
        await supabase.auth.admin.deleteUser(authData.user.id)
        throw new AuthError('USER_CREATE_FAILED', userError.message)
      }

      // Mark invite as accepted
      const { error: updateError } = await supabase
        .from('teacher_invites')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', inviteData.id)

      if (updateError) {
        console.error('Failed to mark invite as accepted:', updateError)
      }

      // Get workspace info
      const { data: workspaceData } = await supabase
        .from('workspaces')
        .select()
        .eq('id', inviteData.workspace_id)
        .single()

      return {
        user: {
          id: authData.user.id,
          email: data.email,
          name: data.name,
          role: 'teacher',
          workspaceId: inviteData.workspace_id,
          workspaceRole: 'teacher'
        },
        session: {
          access_token: authData.session?.access_token || '',
          refresh_token: authData.session?.refresh_token || '',
          expires_at: authData.session?.expires_at || 0
        },
        workspace: {
          id: inviteData.workspace_id,
          name: workspaceData?.name || 'School',
          type: 'school',
          ownerId: workspaceData?.owner_id || '',
          isSchool: true
        }
      }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError('UNKNOWN_ERROR', 'An unexpected error occurred')
    }
  },

  // Helper: validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Get current user session
  async getCurrentSession() {
    const { data } = await supabase.auth.getSession()
    return data.session
  },

  // Sign in with email and password
  async signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        if (error.message.toLowerCase().includes('invalid')) {
          throw new AuthError('INVALID_CREDENTIALS', 'Nieprawidłowy email lub hasło')
        }
        throw new AuthError('SIGNIN_FAILED', error.message)
      }

      if (!data.user || !data.session) {
        throw new AuthError('SIGNIN_FAILED', 'Nie udało się zalogować')
      }

      const { data: userData } = await supabase
        .from('users')
        .select('name, role, workspace_id')
        .eq('id', data.user.id)
        .single()

      const { data: workspaceData } = userData?.workspace_id
        ? await supabase.from('workspaces').select().eq('id', userData.workspace_id).single()
        : { data: null }

      return {
        user: {
          id: data.user.id,
          email: data.user.email ?? '',
          name: userData?.name ?? '',
          role: userData?.role ?? 'teacher',
          workspaceId: userData?.workspace_id ?? '',
          workspaceRole: userData?.role ?? 'teacher',
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at ?? 0,
        },
        workspace: {
          id: workspaceData?.id ?? '',
          name: workspaceData?.name ?? '',
          type: workspaceData?.type ?? null,
          ownerId: workspaceData?.owner_id ?? null,
          isSchool: workspaceData?.is_school ?? false,
        },
      }
    } catch (error) {
      if (error instanceof AuthError) throw error
      throw new AuthError('UNKNOWN_ERROR', 'Wystąpił nieoczekiwany błąd')
    }
  },

  // Alias for joinAsTeacher — used in JoinTeacherPage
  async signupTeacher(data: JoinTeacherFormData): Promise<AuthResponse> {
    return this.joinAsTeacher(data)
  },

  // Logout
  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new AuthError('LOGOUT_FAILED', error.message)
    }
  }
}
