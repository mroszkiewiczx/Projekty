/**
 * Export wyników oceny batch do Notion / Airtable.
 * Eksportuje podsumowania prac wraz z ocenami i rekomendacjami.
 */

import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

export type BatchExportTarget = 'notion' | 'airtable' | 'all'

export interface BatchExportPayload {
  batch_id: string
  workspace_id: string
  target: BatchExportTarget
  user_id: string
  include_rejected?: boolean // czy eksportować tylko zatwierdzone oceny
}

export interface BatchExportResult {
  job_id: string
  batch_id: string
  target: BatchExportTarget
  total_works: number
  status: 'queued'
  created_at: string
}

/**
 * Pobiera podsumowanie batcha + powiązane wyniki.
 */
async function getBatchWithResults(batchId: string) {
  const { data, error } = await supabase
    .from('student_work_batches')
    .select(
      `
      id,
      name,
      status,
      total_works,
      processed_works,
      created_at,
      created_by,
      student_works (
        id,
        student_name,
        file_name,
        status,
        summary:student_work_summaries (
          id,
          thesis,
          summary,
          strengths,
          weaknesses,
          recommendations,
          ai_involvement_likelihood,
          proposed_grade,
          approved,
          final_grade,
          approved_by,
          approved_at,
          ai_model,
          tokens_used
        )
      )
    `
    )
    .eq('id', batchId)
    .single()

  if (error) throw new Error(`Nie znaleziono batcha: ${error.message}`)
  return data
}

/**
 * Tworzy job eksportu wyników batcha.
 */
export async function createBatchExportJob(
  batchId: string,
  workspaceId: string,
  target: BatchExportTarget = 'all',
  includeRejected = false,
): Promise<BatchExportResult> {
  const { data: sessionData } = await supabase.auth.getUser()
  const userId = sessionData.user?.id
  if (!userId) throw new Error('Brak zalogowanego użytkownika')

  // Pobierz batch info
  const batch = await getBatchWithResults(batchId)

  type Insert = Database['public']['Tables']['processing_jobs']['Insert']

  const { data, error } = await supabase
    .from('processing_jobs')
    .insert({
      workspace_id: workspaceId,
      batch_id: batchId,
      job_type: 'batch_export',
      status: 'pending',
      priority: 40,
      payload: {
        batch_id: batchId,
        workspace_id: workspaceId,
        target,
        user_id: userId,
        include_rejected: includeRejected,
        batch_name: batch.name,
        total_works: batch.total_works,
        processed_works: batch.processed_works,
      } as unknown as Insert['payload'],
      created_by: userId,
    } as Insert)
    .select('id, created_at')
    .single()

  if (error) throw new Error(`Nie udało się utworzyć joba: ${error.message}`)

  return {
    job_id: data.id,
    batch_id: batchId,
    target,
    total_works: batch.total_works,
    status: 'queued',
    created_at: data.created_at,
  }
}

/**
 * Pobiera status job eksportu batcha.
 */
export async function getBatchExportJobStatus(jobId: string) {
  const { data, error } = await supabase
    .from('processing_jobs')
    .select('id, batch_id, status, result, last_error, finished_at, attempts')
    .eq('id', jobId)
    .single()

  if (error) throw new Error(`Nie znaleziono joba: ${error.message}`)

  return data as {
    id: string
    batch_id: string
    status: 'pending' | 'running' | 'done' | 'failed'
    result: unknown
    last_error: string | null
    finished_at: string | null
    attempts: number
  }
}
