import { supabase } from '@/lib/supabase'
import {
  AdminDashboardStats,
  Activity,
  SchoolListItem,
  UserListItem,
  AnalyticsData,
  BillingItem
} from '@/types/admin'

export const adminService = {
  async getAdminDashboardStats(): Promise<AdminDashboardStats> {
    try {
      const { data: schoolCount } = await supabase
        .from('school_profiles')
        .select('id', { count: 'exact' })

      const { data: teacherCount } = await supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('role', 'teacher')

      const { data: materialCount } = await supabase
        .from('lessons')
        .select('id', { count: 'exact' })

      const { data: invoices } = await supabase
        .from('billing_invoices')
        .select('amount_cents')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      const monthlyRevenue = (invoices || []).reduce((sum, inv) => sum + (inv.amount_cents || 0), 0)

      const { data: activities } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      return {
        totalSchools: schoolCount?.length || 0,
        totalTeachers: teacherCount?.length || 0,
        totalMaterialsGenerated: materialCount?.length || 0,
        monthlyRevenueCents: monthlyRevenue,
        recentActivity: (activities || []).map(a => ({
          id: a.id,
          type: a.action as any,
          description: a.message,
          timestamp: new Date(a.created_at),
          schoolId: a.workspace_id
        }))
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        totalSchools: 0,
        totalTeachers: 0,
        totalMaterialsGenerated: 0,
        monthlyRevenueCents: 0,
        recentActivity: []
      }
    }
  },

  async getSchools(limit = 50, offset = 0): Promise<SchoolListItem[]> {
    try {
      const { data } = await supabase
        .from('school_profiles')
        .select('*')
        .range(offset, offset + limit - 1)

      if (!data) return []

      const schools: SchoolListItem[] = []

      for (const school of data) {
        const { count: teacherCount } = await supabase
          .from('users')
          .select('id', { count: 'exact' })
          .eq('workspace_id', school.workspace_id)
          .eq('role', 'teacher')

        const { count: materialCount } = await supabase
          .from('lessons')
          .select('id', { count: 'exact' })
          .eq('workspace_id', school.workspace_id)

        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('status, monthly_limit_materials')
          .eq('workspace_id', school.workspace_id)
          .single()

        schools.push({
          id: school.id,
          name: school.name,
          teacherCount: teacherCount || 0,
          materialsGenerated: materialCount || 0,
          subscriptionStatus: (subscription?.status as any) || 'none',
          monthlyRevenue: 0,
          createdAt: new Date(school.created_at)
        })
      }

      return schools
    } catch (error) {
      console.error('Error fetching schools:', error)
      return []
    }
  },

  async getUsers(schoolId?: string, role?: string, limit = 50, offset = 0): Promise<UserListItem[]> {
    try {
      let query = supabase.from('users').select('*')

      if (schoolId) {
        query = query.eq('workspace_id', schoolId)
      }

      if (role) {
        query = query.eq('role', role as 'school_admin' | 'teacher' | 'super_admin')
      }

      const { data } = await query.range(offset, offset + limit - 1)

      if (!data) return []

      const users: UserListItem[] = []

      for (const user of data) {
        const { data: school } = await supabase
          .from('school_profiles')
          .select('name')
          .eq('workspace_id', user.workspace_id)
          .single()

        users.push({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          schoolId: user.workspace_id,
          schoolName: school?.name || 'Unknown',
          createdAt: new Date(user.created_at),
          status: user.status
        })
      }

      return users
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  },

  async deleteSchool(schoolId: string): Promise<void> {
    try {
      const { data: school } = await supabase
        .from('school_profiles')
        .select('workspace_id')
        .eq('id', schoolId)
        .single()

      if (school) {
        await supabase
          .from('workspaces')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', school.workspace_id)
      }
    } catch (error) {
      console.error('Error deleting school:', error)
      throw error
    }
  },

  async deleteUser(userId: string): Promise<void> {
    try {
      await supabase.from('users').update({ status: 'inactive' }).eq('id', userId)
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  },

  async updateUserRole(userId: string, newRole: string): Promise<void> {
    try {
      await supabase.from('users').update({ role: newRole as 'school_admin' | 'teacher' | 'super_admin' }).eq('id', userId)
    } catch (error) {
      console.error('Error updating user role:', error)
      throw error
    }
  },

  async getAnalytics(): Promise<AnalyticsData> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      const { data: materials } = await supabase
        .from('lessons')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())

      const { data: teachers } = await supabase
        .from('users')
        .select('created_at')
        .eq('role', 'teacher')
        .gte('created_at', thirtyDaysAgo.toISOString())

      const { data: invoices } = await supabase
        .from('billing_invoices')
        .select('created_at, amount_usd')
        .gte('created_at', thirtyDaysAgo.toISOString())

      return {
        materialsPerDay: [],
        teachersPerMonth: [],
        revenuePerMonth: [],
        topSchools: [],
        aiProviderUsage: []
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      return {
        materialsPerDay: [],
        teachersPerMonth: [],
        revenuePerMonth: [],
        topSchools: [],
        aiProviderUsage: []
      }
    }
  }
}
