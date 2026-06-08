export interface EmailNotification {
  id?: string
  workspace_id: string
  recipient_email: string
  recipient_name: string
  event_type: 'lesson_created' | 'lesson_updated' | 'lesson_shared' | 'material_approved'
  subject: string
  body: string
  data: Record<string, any>
  sent_at?: Date
  read_at?: Date | null
  status: 'pending' | 'sent' | 'failed'
  retry_count?: number
}

export const emailNotificationService = {
  async sendNotification(notification: EmailNotification): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Call Supabase Edge Function for email sending
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(notification),
      })

      if (!response.ok) {
        const error = await response.json()
        return { success: false, error: error.message || 'Failed to send email' }
      }

      const result = await response.json()
      return { success: true, messageId: result.messageId }
    } catch (error) {
      console.error('Email notification error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  },

  async notifyLessonCreated(workspaceId: string, lesson: any, creatorEmail: string): Promise<void> {
    const notification: EmailNotification = {
      workspace_id: workspaceId,
      recipient_email: creatorEmail,
      recipient_name: 'Teacher',
      event_type: 'lesson_created',
      subject: `New Lesson Created: ${lesson.title}`,
      body: `Your lesson "${lesson.title}" has been successfully created in ${lesson.subject}.`,
      data: { lesson_id: lesson.id, lesson_title: lesson.title },
      status: 'pending',
    }

    await this.sendNotification(notification)
  },

  async notifyLessonShared(workspaceId: string, lesson: any, recipientEmail: string, sharedByName: string): Promise<void> {
    const notification: EmailNotification = {
      workspace_id: workspaceId,
      recipient_email: recipientEmail,
      recipient_name: 'Colleague',
      event_type: 'lesson_shared',
      subject: `Lesson Shared: ${lesson.title}`,
      body: `${sharedByName} has shared the lesson "${lesson.title}" with you.`,
      data: { lesson_id: lesson.id, lesson_title: lesson.title, shared_by: sharedByName },
      status: 'pending',
    }

    await this.sendNotification(notification)
  },

  async notifyMaterialApproved(workspaceId: string, material: any, approverEmail: string): Promise<void> {
    const notification: EmailNotification = {
      workspace_id: workspaceId,
      recipient_email: approverEmail,
      recipient_name: 'Administrator',
      event_type: 'material_approved',
      subject: `Material Approved: ${material.title}`,
      body: `The material "${material.title}" has been reviewed and approved.`,
      data: { material_id: material.id, material_title: material.title },
      status: 'pending',
    }

    await this.sendNotification(notification)
  },
}
