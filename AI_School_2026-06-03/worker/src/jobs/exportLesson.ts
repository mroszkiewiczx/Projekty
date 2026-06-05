/**
 * Export lekcji do Notion / Airtable przez N8N webhook.
 * Payload: { lesson_id, workspace_id, target: 'notion' | 'airtable', user_id }
 */

import { supabase } from '../supabase.js'

interface ExportPayload {
  lesson_id: string
  workspace_id: string
  target: 'notion' | 'airtable' | 'all'
  user_id: string
}

interface ExportResult {
  status: 'success' | 'error'
  target: string
  n8n_execution_id?: string
  error?: string
  timestamp: string
}

/**
 * Pobiera lekcję z bazy.
 */
async function getLesson(lessonId: string) {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single()

  if (error) throw new Error(`Nie znaleziono lekcji: ${error.message}`)
  return data
}

/**
 * Triggeruje N8N webhook do eksportu lekcji.
 */
async function triggerN8nExport(
  lesson: any,
  target: 'notion' | 'airtable',
  workspaceId: string,
  userId: string,
): Promise<{ execution_id: string }> {
  const webhookUrl = process.env[`N8N_WEBHOOK_EXPORT_${target.toUpperCase()}`]
  if (!process.env.N8N_WEBHOOK_SECRET) {
    throw new Error('N8N_WEBHOOK_SECRET not configured')
  }

  if (!webhookUrl) {
    throw new Error(`N8N_WEBHOOK_EXPORT_${target.toUpperCase()} not configured`)
  }

  const payload = {
    lesson: {
      id: lesson.id,
      title: lesson.title,
      subject: lesson.subject,
      content: lesson.content,
      objectives: lesson.objectives,
      duration_minutes: lesson.duration_minutes,
      target_group: lesson.target_group,
      ai_model: lesson.ai_model,
      tokens_used: lesson.tokens_used,
      created_at: lesson.created_at,
      created_by: lesson.created_by,
    },
    workspace_id: workspaceId,
    user_id: userId,
    ai_school_source: {
      app_url: process.env.APP_URL || 'https://ai.school.creativecompany.pl',
      lesson_link: `${process.env.APP_URL || 'https://ai.school.creativecompany.pl'}/lessongen?view=${lesson.id}`,
      exported_at: new Date().toISOString(),
    },
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.N8N_WEBHOOK_SECRET}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`N8N webhook failed (${response.status}): ${errorText}`)
  }

  const result = await response.json()
  return result as { execution_id: string }
}

/**
 * Główna funckcja handlerowania export joba.
 */
export async function handleExportLesson(payload: unknown): Promise<ExportResult[]> {
  const p = payload as ExportPayload

  console.log(
    `[export] Eksportowanie lekcji ${p.lesson_id} do ${p.target} (workspace=${p.workspace_id})`,
  )

  // Pobierz lekcję
  const lesson = await getLesson(p.lesson_id)

  // Określ cele eksportu
  const targets: Array<'notion' | 'airtable'> =
    p.target === 'all' ? ['notion', 'airtable'] : [p.target]

  // Triggeruj N8N dla każdego targetu
  const results: ExportResult[] = []

  for (const target of targets) {
    try {
      const n8nResult = await triggerN8nExport(lesson, target, p.workspace_id, p.user_id)

      results.push({
        status: 'success',
        target,
        n8n_execution_id: n8nResult.execution_id,
        timestamp: new Date().toISOString(),
      })

      console.log(`[export] ✓ ${target} execution_id=${n8nResult.execution_id}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      results.push({
        status: 'error',
        target,
        error: msg,
        timestamp: new Date().toISOString(),
      })

      console.error(`[export] ✗ ${target} error: ${msg}`)
    }
  }

  return results
}
