import { useState, useRef } from 'react'
import { cn } from '@/lib/cn'

interface ImageUploaderProps {
  onUpload: (file: File) => Promise<string>
  accept?: string
  maxSize?: number
}

export function ImageUploader({ onUpload, accept = 'image/*', maxSize = 5 * 1024 * 1024 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    if (file.size > maxSize) {
      setError(`Plik jest za duży. Maksymalny rozmiar: ${maxSize / 1024 / 1024}MB`)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      await onUpload(file)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd przesyłania pliku')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="w-full">
      <div
        className={cn(
          'rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors',
          'hover:border-blue-400 hover:bg-blue-50',
          uploading && 'opacity-50'
        )}
        onDragOver={(e) => {
          e.preventDefault()
          e.currentTarget.classList.add('border-blue-400', 'bg-blue-50')
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
          const file = e.dataTransfer.files?.[0]
          if (file && fileInputRef.current) {
            const dataTransfer = new DataTransfer()
            dataTransfer.items.add(file)
            fileInputRef.current.files = dataTransfer.files
            handleFileChange({ target: fileInputRef.current } as any)
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
        {preview ? (
          <div className="space-y-2">
            <img src={preview} alt="Preview" className="h-32 w-32 rounded-lg object-cover" />
            <button
              onClick={() => {
                setPreview(null)
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
              }}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Usuń obraz
            </button>
          </div>
        ) : (
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-14-12l6 6m0 0l-6-6m6 6v12m6-26a2 2 0 11-4 0 2 2 0 014 0z"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">Przeciągnij obraz lub <button type="button" onClick={() => fileInputRef.current?.click()} className="font-medium text-blue-600 hover:text-blue-700">kliknij aby wybrać</button></p>
            <p className="mt-1 text-xs text-gray-500">PNG, JPG do {maxSize / 1024 / 1024}MB</p>
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {uploading && <p className="mt-2 text-sm text-gray-600">Przesyłanie...</p>}
    </div>
  )
}
