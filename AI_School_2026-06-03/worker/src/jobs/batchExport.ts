/**
 * Export wyników oceny batch do Notion / Airtable.
 */

import { supabase } from '../supabase.js'

interface BatchExportPayload {
  batch_id: string
  workspace_id: string
  target: 'notion' | 'airtable'
  user_id: string
  include_rejected?: boolean
  batch_name: string
  total_works: number
  processed_works: number
}

interface ExportResult {
  status: 'success' | 'error'
  target: string
  n8n_execution_id?: string
  records_exported?: number
  error?: string
  timestamp: string
}

/**
 * Pobiera wyniki batcha do eksportu.
 */
async function getBatchResults(batchId: string, includeRejected = false) {
  let query = supabase
    .from('student_works')
    .select(
      `
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
        proposed_grade,
        final_grade,
        approved,
        ai_model,
        tokens_used
      )
    `
    )
    .eq('batch_id', batchId)

  if (!includeRejected) {
    query = query.eq('summary.approved', true)
  }

  const { data, error } = await query

  if (error) throw new Error(`Nie znaleziono wyników: ${error.message}`)
  return data
}

/**
 * Triggeruje N8N webhook do eksportu batch.
 */
async function triggerN8nBatchExport(
  batchId: string,
  batchName: string,
  results: any[],
  target: 'notion' | 'airtable',
  workspaceId: string,
  userId: string,
): Promise<{ execution_id: string }> {
  const webhookUrl = process.env[`N8N_WEBHOOK_BATCH_EXPORT_${target.toUpperCase()}`]
  if (!process.env.N8N_WEBHOOK_SECRET) {
    throw new Error('N8N_WEBHOOK_SECRET not configured')
  }

  if (!webhookUrl) {
    throw new Error(`N8N_WEBHOOK_BATCH_EXPORT_${target.toUpperCase()} not configured`)
  }

  const payload = {
    batch: {
      id: batchId,
      name: batchName,
      total_records: results.length,
      exported_at: new Date().toISOString(),
    },
    results: results.map((work) => ({
      work_id: work.id,
      student_name: work.student_name,
      file_name: work.file_name,
      thesis: work.summary?.[0]?.thesis,
      summary: work.summary?.[0]?.summary,
      strengths: work.summary?.[0]?.strengths,
      weaknesses: work.summary?.[0]?.weaknesses,
      recommendations: work.summary?.[0]?.recommendations,
      proposed_grade: work.summary?.[0]?.proposed_grade,
      final_grade: work.summary?.[0]?.final_grade,
      approved: work.summary?.[0]?.approved,
      ai_model: work.summary?.[0]?.ai_model,
      tokens_used: work.summary?.[0]?.tokens_used,
    })),
    metadata: {
      workspace_id: workspaceId,
      user_id: userId,
      app_url: process.env.APP_URL || 'https://ai.school.creativecompany.pl',
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
 * Główny handler batch export.
 */
export async function handleBatchExport(payload: unknown): Promise<ExportResult[]> {
  const p = payload as BatchExportPayload

  console.log(
    `[batch-export] Eksportowanie batch ${p.batch_id} do ${p.target} (workspace=${p.workspace_id})`,
  )

  // Pobierz wyniki
  const results = await getBatchResults(p.batch_id, p.include_rejected)

  if (!results || results.length === 0) {
    console.warn(`[batch-export] Brak wyników do eksportu dla batch ${p.batch_id}`)
    return [
      {
        status: 'error',
        target: p.target,
        error: 'Brak wyników do eksportu',
        timestamp: new Date().toISOString(),
      },
    ]
  }

  // Triggeruj N8N
  try {
    const n8nResult = await triggerN8nBatchExport(
      p.batch_id,
      p.batch_name,
      results,
      p.target,
      p.workspace_id,
      p.user_id,
    )

    console.log(
      `[batch-export] ✓ ${p.target} execution_id=${n8nResult.execution_id} (${results.length} records)`,
    )

    return [
      {
        status: 'success',
        target: p.target,
        n8n_execution_id: n8nResult.execution_id,
        records_exported: results.length,
        timestamp: new Date().toISOString(),
      },
    ]
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)

    console.error(`[batch-export] ✗ ${p.target} error: ${msg}`)

    return [
      {
        status: 'error',
        target: p.target,
        error: msg,
        timestamp: new Date().toISOString(),
      },
    ]
  }
}
