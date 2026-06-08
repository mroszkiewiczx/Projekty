'use client'

import { useRef, useState } from 'react'
import { importCurriculum } from '@/services/curriculumParser'
import type { CurriculumImportResult, CurriculumStandard } from '@/types/curriculum'

const ACCEPTED_EXTENSIONS = '.xlsx,.xls,.csv'
const PREVIEW_LIMIT = 3

function StandardCard({ standard }: { standard: CurriculumStandard }) {
  return (
    <div className="rounded border bg-gray-50 p-4">
      <p className="font-semibold">
        {standard.subject} — Klasa {standard.grade}
      </p>
      <p className="mt-1 text-sm text-gray-600">{standard.topic}</p>
      <p className="mt-1 text-xs text-gray-500">Czas: {standard.duration} min</p>
    </div>
  )
}

function ImportSummary({ result }: { result: CurriculumImportResult }) {
  const isSuccess = result.success
  const containerClass = isSuccess
    ? 'rounded-lg border border-green-200 bg-green-50 p-4'
    : 'rounded-lg border border-red-200 bg-red-50 p-4'

  return (
    <div className={containerClass}>
      <h3 className="mb-2 font-bold">
        {isSuccess ? 'Importowanie udane' : 'Blad importowania'}
      </h3>
      <p>Zaimportowano: {result.imported} standardow</p>
      {result.errors.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm text-red-600">
          {result.errors.map((err, i) => (
            <li key={i}>• {err}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

interface CurriculumUploaderProps {
  onSave?: (standards: CurriculumStandard[]) => Promise<void>
}

export function CurriculumUploader({ onSave }: CurriculumUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [result, setResult] = useState<CurriculumImportResult | null>(null)

  const processFile = async (file: File) => {
    setIsLoading(true)
    setResult(null)
    const importResult = await importCurriculum(file)
    setResult(importResult)
    setIsLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) processFile(selectedFile)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) processFile(dropped)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleSave = async () => {
    if (!result?.standards?.length || !onSave) return
    setIsSaving(true)
    try {
      await onSave(result.standards)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const dropZoneClass = [
    'cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
    isDragging ? 'border-blue-500 bg-blue-50' : 'border-blue-300 hover:border-blue-500',
  ].join(' ')

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="rounded-lg bg-white p-8 shadow">
        <h2 className="mb-6 text-2xl font-bold">Import Curriculum</h2>

        <div
          className={dropZoneClass}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            onChange={handleInputChange}
            disabled={isLoading}
            className="hidden"
          />
          <div className="text-4xl mb-2">📄</div>
          <p className="font-semibold">Kliknij lub przeciagnij plik</p>
          <p className="mt-1 text-sm text-gray-500">Excel (.xlsx, .xls) lub CSV</p>
        </div>

        {isLoading && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-blue-600" />
            <span>Wczytywanie...</span>
          </div>
        )}

        {result && (
          <div className="mt-6">
            <ImportSummary result={result} />
          </div>
        )}

        {result?.standards && result.standards.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="font-bold">Podglad ({result.standards.length} rekordow):</h3>
            {result.standards.slice(0, PREVIEW_LIMIT).map((std) => (
              <StandardCard key={std.id} standard={std} />
            ))}
            {result.standards.length > PREVIEW_LIMIT && (
              <p className="text-sm text-gray-600">
                ... i {result.standards.length - PREVIEW_LIMIT} wiecej
              </p>
            )}
          </div>
        )}

        {result?.success && result.standards.length > 0 && (
          <div className="mt-6 flex gap-3">
            {onSave && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {isSaving ? 'Zapisywanie...' : `Zapisz ${result.imported} standardow`}
              </button>
            )}
            <button
              onClick={handleReset}
              className="flex-1 rounded bg-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-400"
            >
              Anuluj
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
