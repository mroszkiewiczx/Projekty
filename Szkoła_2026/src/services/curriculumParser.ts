import type { CurriculumImportResult, CurriculumStandard } from '@/types/curriculum'

function splitBySemicolon(value: unknown): string[] {
  if (typeof value !== 'string') return []
  return value.split(';').map((s) => s.trim()).filter(Boolean)
}

function toInt(value: unknown, fallback: number): number {
  const parsed = parseInt(String(value ?? ''), 10)
  return isNaN(parsed) ? fallback : parsed
}

function toString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function rowToStandard(row: Record<string, unknown>, idx: number): CurriculumStandard {
  return {
    id: `std-${Date.now()}-${idx}`,
    subject: toString(row.Subject ?? row.Przedmiot),
    grade: toInt(row.Grade ?? row.Klasa, 0),
    topic: toString(row.Topic ?? row.Temat),
    objectives: splitBySemicolon(row.Objectives ?? row['Cele nauczania']),
    competencies: splitBySemicolon(row.Competencies ?? row['Kompetencje']),
    content: toString(row.Content ?? row['Treść']),
    assessmentMethods: splitBySemicolon(row.Assessment ?? row['Ocena']),
    duration: toInt(row.Duration ?? row['Czas'], 45),
    resources: splitBySemicolon(row.Resources ?? row['Zasoby']),
  }
}

async function parseExcelCurriculum(file: File): Promise<CurriculumStandard[]> {
  const XLSX = await import('xlsx')

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'array' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[]
        resolve(rows.map((row, idx) => rowToStandard(row, idx)))
      } catch (error: unknown) {
        reject(new Error(`Błąd parsowania Excel: ${error instanceof Error ? error.message : String(error)}`))
      }
    }

    reader.onerror = () => reject(new Error('Nie udało się odczytać pliku'))
    reader.readAsArrayBuffer(file)
  })
}

async function parseCsvCurriculum(file: File): Promise<CurriculumStandard[]> {
  const XLSX = await import('xlsx')

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const workbook = XLSX.read(text, { type: 'string' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[]
        resolve(rows.map((row, idx) => rowToStandard(row, idx)))
      } catch (error: unknown) {
        reject(new Error(`Błąd parsowania CSV: ${error instanceof Error ? error.message : String(error)}`))
      }
    }

    reader.onerror = () => reject(new Error('Nie udało się odczytać pliku'))
    reader.readAsText(file)
  })
}

export async function importCurriculum(file: File): Promise<CurriculumImportResult> {
  const isCsv = file.name.toLowerCase().endsWith('.csv')

  try {
    const standards = isCsv
      ? await parseCsvCurriculum(file)
      : await parseExcelCurriculum(file)

    return {
      success: true,
      imported: standards.length,
      failed: 0,
      standards,
      errors: [],
    }
  } catch (error: unknown) {
    return {
      success: false,
      imported: 0,
      failed: 1,
      standards: [],
      errors: [error instanceof Error ? error.message : 'Nieznany błąd'],
    }
  }
}
