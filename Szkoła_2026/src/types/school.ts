export interface SchoolDashboardStats {
  schoolName: string
  teacherCount: number
  materialsGeneratedThisMonth: number
  usagePercentage: number
  subscriptionStatus: 'active' | 'paused' | 'cancelled' | 'trial' | 'none'
  subscriptionPlan: 'basic' | 'pro' | 'enterprise'
  renewalDate: Date
  monthlyLimit: number
  monthlyUsed: number
}

export interface TeacherItem {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive' | 'pending'
  materialsGenerated: number
  createdAt: Date
}

export interface SchoolSettings {
  schoolName: string
  address: string
  contactEmail: string
  contactPhone: string
  logo?: string
  enableNotifications: boolean
  language: 'pl' | 'en'
}

export interface InviteTeacherData {
  email: string
  name: string
}
