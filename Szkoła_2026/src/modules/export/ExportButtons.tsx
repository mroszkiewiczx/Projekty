import { useState } from 'react'
import type { ExportLesson, ExportFormat } from '@/types/export'

interface ExportButtonsProps {
  lesson: ExportLesson
}

interface ExportState {
  format: ExportFormat | null
  isExporting: boolean
  error: string | null
}

function buildDocxContent(lesson: ExportLesson): string {
  const content = lesson.content as Record<string, unknown>
  const lines: string[] = [
    lesson.title,
    '',
    `Temat: ${lesson.topic}`,
    `Przedmiot: ${lesson.subject}`,
    `Klasa: ${lesson.grade}`,
    '',
  ]

  if (Array.isArray(content?.objectives)) {
    lines.push('CELE LEKCJI')
    for (const obj of content.objectives as string[]) {
      lines.push(`- ${obj}`)
    }
    lines.push('')
  }

  const inner = content?.content as Record<string, unknown> | undefined
  if (inner?.introduction) {
    lines.push('WSTEP')
    lines.push(String(inner.introduction))
    lines.push('')
  }

  if (Array.isArray(inner?.mainContent)) {
    lines.push('TRESC GLOWNA')
    for (const c of inner.mainContent as string[]) {
      lines.push(c)
    }
    lines.push('')
  }

  if (Array.isArray(inner?.activities)) {
    lines.push('AKTYWNOSCI')
    for (const act of inner.activities as Array<{ name: string; duration: number; description: string }>) {
      lines.push(`${act.name} (${act.duration} min): ${act.description}`)
    }
    lines.push('')
  }

  if (inner?.conclusion) {
    lines.push('PODSUMOWANIE')
    lines.push(String(inner.conclusion))
    lines.push('')
  }

  if (inner?.homework) {
    lines.push('PRACA DOMOWA')
    lines.push(String(inner.homework))
  }

  return lines.join('\n')
}

function buildHtmlContent(lesson: ExportLesson): string {
  const content = lesson.content as Record<string, unknown>
  const inner = content?.content as Record<string, unknown> | undefined
  const objectives = Array.isArray(content?.objectives) ? (content.objectives as string[]) : []
  const activities = Array.isArray(inner?.activities)
    ? (inner.activities as Array<{ name: string; duration: number; description: string; materials?: string[] }>)
    : []

  return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8" />
<title>${lesson.title}</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 210mm; margin: 0 auto; padding: 20mm; }
  h1 { font-size: 24px; color: #1e3a5f; margin-bottom: 8px; }
  h2 { font-size: 16px; color: #005BAC; border-bottom: 1px solid #DDE3EC; padding-bottom: 4px; margin-top: 20px; }
  .meta { color: #6B7280; font-size: 13px; margin-bottom: 16px; }
  ul { margin: 8px 0; padding-left: 20px; }
  li { margin: 4px 0; }
  .activity { border-left: 3px solid #005BAC; padding: 8px 12px; margin: 8px 0; background: #E8F1FA; }
  @media print { @page { size: A4; margin: 20mm; } }
</style>
</head>
<body>
<h1>${lesson.title}</h1>
<div class="meta">Temat: ${lesson.topic} | Przedmiot: ${lesson.subject} | Klasa: ${lesson.grade}</div>
${objectives.length ? `<h2>Cele lekcji</h2><ul>${objectives.map((o) => `<li>${o}</li>`).join('')}</ul>` : ''}
${inner?.introduction ? `<h2>Wstep</h2><p>${inner.introduction}</p>` : ''}
${Array.isArray(inner?.mainContent) ? `<h2>Tresc glowna</h2>${(inner.mainContent as string[]).map((c) => `<p>${c}</p>`).join('')}` : ''}
${activities.length ? `<h2>Aktywnosci</h2>${activities.map((a) => `<div class="activity"><strong>${a.name}</strong> (${a.duration} min)<br/>${a.description}</div>`).join('')}` : ''}
${inner?.conclusion ? `<h2>Podsumowanie</h2><p>${inner.conclusion}</p>` : ''}
${inner?.homework ? `<h2>Praca domowa</h2><p>${inner.homework}</p>` : ''}
</body>
</html>`
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function exportAsJson(lesson: ExportLesson): void {
  const json = JSON.stringify(
    {
      id: lesson.id,
      title: lesson.title,
      topic: lesson.topic,
      subject: lesson.subject,
      grade: lesson.grade,
      createdAt: lesson.createdAt,
      content: lesson.content,
    },
    null,
    2,
  )
  const blob = new Blob([json], { type: 'application/json' })
  downloadBlob(blob, `${lesson.title}.json`)
}

function exportAsDocx(lesson: ExportLesson): void {
  const text = buildDocxContent(lesson)
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  downloadBlob(blob, `${lesson.title}.txt`)
}

function exportAsPdf(lesson: ExportLesson): void {
  const html = buildHtmlContent(lesson)
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  win.print()
}

export function ExportButtons({ lesson }: ExportButtonsProps) {
  const [state, setState] = useState<ExportState>({
    format: null,
    isExporting: false,
    error: null,
  })

  const handleExport = async (format: ExportFormat) => {
    setState({ format, isExporting: true, error: null })

    try {
      if (format === 'json') {
        exportAsJson(lesson)
      } else if (format === 'docx') {
        exportAsDocx(lesson)
      } else if (format === 'pdf') {
        exportAsPdf(lesson)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nieznany blad'
      setState({ format, isExporting: false, error: `Blad eksportu: ${message}` })
      return
    }

    setState({ format: null, isExporting: false, error: null })
  }

  const isLoading = (format: ExportFormat) => state.isExporting && state.format === format

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => void handleExport('pdf')}
          disabled={state.isExporting}
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
        >
          {isLoading('pdf') ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          )}
          Eksport PDF
        </button>

        <button
          onClick={() => void handleExport('docx')}
          disabled={state.isExporting}
          className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-50"
        >
          {isLoading('docx') ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          Eksport DOCX
        </button>

        <button
          onClick={() => void handleExport('json')}
          disabled={state.isExporting}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
        >
          {isLoading('json') ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
          Eksport JSON
        </button>
      </div>

      {state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
    </div>
  )
}
