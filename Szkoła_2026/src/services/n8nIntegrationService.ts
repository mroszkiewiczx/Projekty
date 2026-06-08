export interface N8nWorkflow {
  id: string
  name: string
  active: boolean
  webhook_path?: string
  description?: string
}

export interface N8nTrigger {
  event: 'lesson.created' | 'lesson.updated' | 'lesson.deleted' | 'material.shared'
  workspace_id: string
  data: Record<string, any>
  timestamp?: Date
}

export const n8nIntegrationService = {
  async triggerWorkflow(workflow: N8nWorkflow, data: any): Promise<{ success: boolean; executionId?: string; error?: string }> {
    try {
      if (!workflow.webhook_path) {
        return { success: false, error: 'Workflow has no webhook path configured' }
      }

      const n8nUrl = import.meta.env.VITE_N8N_URL || 'https://n8n.creativecompany.pl'
      const webhookUrl = `${n8nUrl}/webhook/${workflow.webhook_path}`

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        return { success: false, error: `Webhook returned ${response.status}` }
      }

      const result = await response.json()
      return { success: true, executionId: result.executionId }
    } catch (error) {
      console.error('n8n workflow trigger error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  },

  async onLessonCreated(workspaceId: string, lesson: any): Promise<void> {
    const trigger: N8nTrigger = {
      event: 'lesson.created',
      workspace_id: workspaceId,
      data: {
        lesson_id: lesson.id,
        lesson_title: lesson.title,
        subject: lesson.subject,
        duration_minutes: lesson.duration_minutes,
        target_group: lesson.target_group,
        created_by: lesson.created_by,
        created_at: lesson.created_at,
      },
      timestamp: new Date(),
    }

    // Trigger n8n workflow for lesson creation
    const workflow: N8nWorkflow = {
      id: 'lesson-creation-workflow',
      name: 'Lesson Creation Workflow',
      active: true,
      webhook_path: 'lesson-created',
    }

    await this.triggerWorkflow(workflow, trigger)
  },

  async onLessonShared(workspaceId: string, lesson: any, sharedWith: string[]): Promise<void> {
    const trigger: N8nTrigger = {
      event: 'material.shared',
      workspace_id: workspaceId,
      data: {
        lesson_id: lesson.id,
        lesson_title: lesson.title,
        shared_with: sharedWith,
        shared_at: new Date(),
      },
      timestamp: new Date(),
    }

    const workflow: N8nWorkflow = {
      id: 'lesson-sharing-workflow',
      name: 'Lesson Sharing Workflow',
      active: true,
      webhook_path: 'lesson-shared',
    }

    await this.triggerWorkflow(workflow, trigger)
  },

  async onMaterialUpdated(workspaceId: string, material: any): Promise<void> {
    const trigger: N8nTrigger = {
      event: 'lesson.updated',
      workspace_id: workspaceId,
      data: {
        material_id: material.id,
        material_title: material.title,
        changes: material.changes || {},
        updated_at: new Date(),
      },
      timestamp: new Date(),
    }

    const workflow: N8nWorkflow = {
      id: 'material-update-workflow',
      name: 'Material Update Workflow',
      active: true,
      webhook_path: 'material-updated',
    }

    await this.triggerWorkflow(workflow, trigger)
  },

  async listAvailableWorkflows(): Promise<N8nWorkflow[]> {
    try {
      const n8nUrl = import.meta.env.VITE_N8N_URL || 'https://n8n.creativecompany.pl'
      const response = await fetch(`${n8nUrl}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-Key': import.meta.env.VITE_N8N_API_KEY || '',
        },
      })

      if (!response.ok) {
        console.error('Failed to fetch n8n workflows')
        return []
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Error fetching n8n workflows:', error)
      return []
    }
  },
}
