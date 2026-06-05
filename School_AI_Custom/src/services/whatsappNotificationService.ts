import { LessonGeneratorOutput } from '@/types/lesson'
import { n8nIntegrationService } from './n8nIntegrationService'

export interface WhatsappNotification {
  lessonId: string
  lessonTitle: string
  subject: string
  targetGroup: string
  recipients: string[]
  message: string
  webhookPath?: string
}

export interface WhatsappSendResult {
  success: boolean
  messageId?: string
  recipientCount?: number
  error?: string
}

export const whatsappNotificationService = {
  async sendLessonNotification(
    lesson: LessonGeneratorOutput | any,
    recipientGroup: 'STUDENTS' | 'PARENTS' | 'ALL' = 'STUDENTS'
  ): Promise<WhatsappSendResult> {
    try {
      const notification: WhatsappNotification = {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        subject: lesson.subject || 'Educational',
        targetGroup: recipientGroup,
        recipients: [], // Populated by n8n from workspace settings
        message: `📚 New Lesson: ${lesson.title}\n\nSubject: ${lesson.subject || 'Educational'}\nDuration: ${lesson.duration_minutes || 45} minutes\n\nCheck the School_AI_Custom app to view the full lesson!`,
        webhookPath: import.meta.env.VITE_N8N_WHATSAPP_WEBHOOK_PATH || 'lesson-whatsapp-alert',
      }

      const workflow = {
        id: 'lesson-whatsapp-workflow',
        name: 'Lesson WhatsApp Notification',
        active: true,
        webhook_path: notification.webhookPath,
      }

      const result = await n8nIntegrationService.triggerWorkflow(workflow, notification)

      if (result.success) {
        return {
          success: true,
          messageId: result.executionId,
          recipientCount: notification.recipients.length || 1,
        }
      } else {
        return {
          success: false,
          error: result.error || 'Failed to send WhatsApp notification',
        }
      }
    } catch (error) {
      console.error('WhatsApp notification error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  },

  async sendCustomMessage(
    phoneNumber: string,
    message: string
  ): Promise<WhatsappSendResult> {
    try {
      const notification = {
        recipients: [phoneNumber],
        message,
        webhookPath: import.meta.env.VITE_N8N_WHATSAPP_WEBHOOK_PATH || 'custom-whatsapp-message',
      }

      const workflow = {
        id: 'custom-whatsapp-workflow',
        name: 'Custom WhatsApp Message',
        active: true,
        webhook_path: notification.webhookPath,
      }

      const result = await n8nIntegrationService.triggerWorkflow(workflow, notification)

      return {
        success: result.success,
        messageId: result.executionId,
        error: result.error,
      }
    } catch (error) {
      console.error('Custom WhatsApp message error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  },
}
