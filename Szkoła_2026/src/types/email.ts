export type EmailTemplate =
  | 'school_welcome'
  | 'teacher_invite'
  | 'material_generated'
  | 'usage_warning'
  | 'renewal_reminder'

export interface EmailMessage {
  to: string
  subject: string
  htmlContent: string
  template: EmailTemplate
  data: Record<string, any>
}

export interface SchoolWelcomeData {
  schoolName: string
  adminEmail: string
  loginUrl: string
}

export interface TeacherInviteData {
  teacherEmail: string
  schoolName: string
  inviteCode: string
  inviteLink: string
  expiresAt: Date
}

export interface MaterialGeneratedData {
  teacherName: string
  materialTitle: string
  materialType: string
  materialLink: string
}

export interface UsageWarningData {
  schoolName: string
  usagePercentage: number
  monthlyLimit: number
  monthlyUsed: number
  upgradeLinkUrl: string
}

export interface RenewalReminderData {
  schoolName: string
  planName: string
  renewalDate: Date
  monthlyAmount: number
  manageLink: string
}
