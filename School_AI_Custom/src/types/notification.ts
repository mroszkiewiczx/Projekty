export type WhatsappRecipientGroup = 'STUDENTS' | 'PARENTS' | 'ALL'

export interface WhatsappNotificationPayload {
  lessonId: string
  lessonTitle: string
  subject: string
  targetGroup: WhatsappRecipientGroup
  recipients: string[]
  message: string
  timestamp?: Date
}

export interface WhatsappSendResult {
  success: boolean
  messageId?: string
  recipientCount?: number
  error?: string
  timestamp?: Date
}

export interface WhatsappNotificationLog {
  id: string
  lessonId: string
  lessonTitle: string
  recipientGroup: WhatsappRecipientGroup
  recipientCount: number
  status: 'pending' | 'sent' | 'failed'
  error?: string
  sentAt: Date
  createdAt: Date
}
