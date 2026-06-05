/**
 * Serwis eksportowania lekcji do Notion / Airtable.
 * Tworzy job w processing_jobs, worker triggeruje N8N webhook.
 */

import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

export type ExportTarget = 'notion' | 'airtable' | 'all'

export interface ExportJobResult {
  job_id: string
  target: ExportTarget
  status: 'queued'
  created_at: string
}

/**
 * Tworzy job eksportu lekcji.
 * Worker przejmie job i triggernie N8N webhook.
 */
export async function createExportJob(
  lessonId: string,
  workspaceId: string,
  target: ExportTarget = 'all',
): Promise<ExportJobResult> {
  const { data: sessionData } = await supabase.auth.getUser()
  const userId = sessionData.user?.id
  if (!userId) throw new Error('Brak zalogowanego użytkownika')

  type Insert = Database['public']['Tables']['processing_jobs']['Insert']

  const { data, error } = await supabase
    .from('processing_jobs')
    .insert({
      workspace_id: workspaceId,
      job_type: 'export_generation',
      status: 'pending',
      priority: 50,
      payload: {
        lesson_id: lessonId,
        workspace_id: workspaceId,
        target,
        user_id: userId,
      } as unknown as Insert['payload'],
      created_by: userId,
    } as Insert)
    .select('id, created_at')
    .single()

  if (error) throw new Error(`Nie udało się utworzyć joba eksportu: ${error.message}`)

  return {
    job_id: data.id,
    target,
    status: 'queued',
    created_at: data.created_at,
  }
}

/**
 * Pobiera status joba eksportu.
 */
export async function getExportJobStatus(jobId: string) {
  const { data, error } = await supabase
    .from('processing_jobs')
    .select('id, status, result, last_error, finished_at')
    .eq('id', jobId)
    .single()

  if (error) throw new Error(`Nie znaleziono joba: ${error.message}`)

  return data as {
    id: string
    status: 'pending' | 'running' | 'done' | 'failed'
    result: unknown
    last_error: string | null
    finished_at: string | null
  }
}

/**
 * Monitoruje export job do ukończenia (max 30s).
 */
export async function waitForExportCompletion(jobId: string, maxWaitMs = 30000) {
  const startTime = Date.now()

  while (Date.now() - startTime < maxWaitMs) {
    const status = await getExportJobStatus(jobId)

    if (status.status === 'done') {
      return { success: true, result: status.result }
    }

    if (status.status === 'failed') {
      return { success: false, error: status.last_error }
    }

    // Czekaj 1s przed następną próbą
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  return { success: false, error: 'Timeout czekania na ukończenie eksportu' }
}
