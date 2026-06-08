import { supabase } from '@/lib/supabase'
import { SchoolDashboardStats, TeacherItem, SchoolSettings, InviteTeacherData } from '@/types/school'
import { v4 as uuidv4 } from 'uuid'

export const schoolService = {
  async getSchoolDashboardStats(workspaceId: string): Promise<SchoolDashboardStats> {
    try {
      const { data: schoolData } = await supabase
        .from('school_profiles')
        .select('*')
        .eq('workspace_id', workspaceId)
        .single()

      const { data: workspaceData } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single()

      const { count: teacherCount } = await supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('workspace_id', workspaceId)
        .eq('role', 'teacher')

      const { count: materialCount } = await supabase
        .from('lessons')
        .select('id', { count: 'exact' })
        .eq('workspace_id', workspaceId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('workspace_id', workspaceId)
        .single()

      const { count: usageCount } = await supabase
        .from('ai_usage_logs')
        .select('id', { count: 'exact' })
        .eq('workspace_id', workspaceId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      return {
        schoolName: schoolData?.name || 'Unknown School',
        teacherCount: teacherCount || 0,
        materialsGeneratedThisMonth: materialCount || 0,
        usagePercentage: Math.min(100, ((usageCount || 0) / (subscription?.monthly_limit_materials || 1)) * 100),
        subscriptionStatus: subscription?.status || 'none',
        subscriptionPlan: subscription?.plan_tier || 'basic',
        renewalDate: subscription?.renewal_date ? new Date(subscription.renewal_date) : new Date(),
        monthlyLimit: subscription?.monthly_limit_materials || 0,
        monthlyUsed: usageCount || 0
      }
    } catch (error) {
      console.error('Error fetching school stats:', error)
      throw error
    }
  },

  async getTeachers(workspaceId: string): Promise<TeacherItem[]> {
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('role', 'teacher')
        .order('created_at', { ascending: false })

      if (!data) return []

      const teachers: TeacherItem[] = []

      for (const teacher of data) {
        const { count } = await supabase
          .from('lessons')
          .select('id', { count: 'exact' })
          .eq('teacher_id', teacher.id)

        teachers.push({
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          status: teacher.status,
          materialsGenerated: count || 0,
          createdAt: new Date(teacher.created_at)
        })
      }

      return teachers
    } catch (error) {
      console.error('Error fetching teachers:', error)
      return []
    }
  },

  async inviteTeacher(workspaceId: string, data: InviteTeacherData): Promise<string> {
    try {
      const inviteCode = uuidv4().substring(0, 20).toUpperCase()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

      const { data: invite, error } = await supabase
        .from('teacher_invites')
        .insert({
          workspace_id: workspaceId,
          email: data.email,
          invite_code: inviteCode,
          status: 'pending',
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single()

      if (error) throw error

      return inviteCode
    } catch (error) {
      console.error('Error inviting teacher:', error)
      throw error
    }
  },

  async removeTeacher(teacherId: string): Promise<void> {
    try {
      await supabase.from('users').update({ status: 'inactive' }).eq('id', teacherId)
    } catch (error) {
      console.error('Error removing teacher:', error)
      throw error
    }
  },

  async getSchoolSettings(workspaceId: string): Promise<SchoolSettings> {
    try {
      const { data } = await supabase
        .from('school_profiles')
        .select('*')
        .eq('workspace_id', workspaceId)
        .single()

      const { data: workspace } = await supabase
        .from('workspaces')
        .select('settings')
        .eq('id', workspaceId)
        .single()

      return {
        schoolName: data?.name || '',
        address: data?.address || '',
        contactEmail: data?.contact_email || '',
        contactPhone: data?.phone || '',
        logo: data?.logo_url ?? undefined,
        enableNotifications: true,
        language: (workspace?.settings as Record<string, unknown>)?.language as 'pl' | 'en' || 'pl'
      }
    } catch (error) {
      console.error('Error fetching school settings:', error)
      throw error
    }
  },

  async updateSchoolSettings(workspaceId: string, settings: SchoolSettings): Promise<void> {
    try {
      const { data: school } = await supabase
        .from('school_profiles')
        .select('id')
        .eq('workspace_id', workspaceId)
        .single()

      await supabase
        .from('school_profiles')
        .update({
          name: settings.schoolName,
          address: settings.address,
          contact_email: settings.contactEmail,
          phone: settings.contactPhone,
          logo_url: settings.logo
        })
        .eq('id', school?.id ?? '')

      await supabase
        .from('workspaces')
        .update({
          settings: { language: settings.language }
        })
        .eq('id', workspaceId)
    } catch (error) {
      console.error('Error updating school settings:', error)
      throw error
    }
  }
}
