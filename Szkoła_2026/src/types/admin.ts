export interface AdminDashboardStats {
  totalSchools: number
  totalTeachers: number
  totalMaterialsGenerated: number
  monthlyRevenueCents: number
  recentActivity: Activity[]
}

export interface Activity {
  id: string
  type: 'school_created' | 'teacher_joined' | 'material_generated' | 'payment_received'
  description: string | null
  timestamp: Date
  schoolId?: string | null
  userId?: string
}

export interface SchoolListItem {
  id: string
  name: string
  teacherCount: number
  materialsGenerated: number
  subscriptionStatus: 'active' | 'paused' | 'cancelled' | 'none'
  monthlyRevenue: number
  createdAt: Date
}

export interface UserListItem {
  id: string
  email: string
  name: string
  role: 'teacher' | 'school_admin' | 'super_admin'
  schoolId: string
  schoolName: string
  createdAt: Date
  status: 'active' | 'inactive' | 'pending'
}

export interface AnalyticsData {
  materialsPerDay: { date: string; count: number }[]
  teachersPerMonth: { month: string; count: number }[]
  revenuePerMonth: { month: string; amount: number }[]
  topSchools: { name: string; usage: number; revenue: number }[]
  aiProviderUsage: { provider: string; percentage: number }[]
}

export interface BillingItem {
  id: string
  schoolId: string
  schoolName: string
  plan: 'basic' | 'pro' | 'enterprise'
  status: 'active' | 'paused' | 'cancelled'
  renewalDate: Date
  monthlyAmount: number
  stripeSubscriptionId: string
}
