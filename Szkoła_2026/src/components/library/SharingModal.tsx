import { useState } from 'react'
import { Modal, Button, Input, Label } from '@/components/ui'

interface SharingModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  onShare: (emails: string[]) => Promise<void>
}

export function SharingModal({ isOpen, onClose, title, onShare }: SharingModalProps) {
  const [emails, setEmails] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAddEmail = () => {
    const email = inputValue.trim()
    if (!email) return

    if (!email.includes('@')) {
      setError('Podaj prawidłowy email')
      return
    }

    if (emails.includes(email)) {
      setError('Ten email jest już na liście')
      return
    }

    setEmails([...emails, email])
    setInputValue('')
    setError(null)
  }

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter((e) => e !== emailToRemove))
  }

  const handleShare = async () => {
    if (emails.length === 0) {
      setError('Dodaj co najmniej jeden email')
      return
    }

    setIsLoading(true)
    try {
      await onShare(emails)
      setEmails([])
      setInputValue('')
      setError(null)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd podczas udostępniania')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Udostępnij: ${title}`} size="md">
      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Adres email</Label>
          <div className="mt-2 flex gap-2">
            <Input
              id="email"
              type="email"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                setError(null)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddEmail()
                }
              }}
              placeholder="user@example.com"
            />
            <Button onClick={handleAddEmail} variant="secondary" size="sm">
              Dodaj
            </Button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        {emails.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900">Osoby do udostępnienia ({emails.length}):</p>
            <div className="space-y-1">
              {emails.map((email) => (
                <div key={email} className="flex items-center justify-between rounded bg-gray-100 px-3 py-2">
                  <span className="text-sm text-gray-700">{email}</span>
                  <button
                    onClick={() => handleRemoveEmail(email)}
                    className="text-red-600 hover:text-red-700"
                    aria-label="Remove email"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Anuluj
          </Button>
          <Button
            onClick={handleShare}
            isLoading={isLoading}
            disabled={emails.length === 0 || isLoading}
          >
            Udostępnij
          </Button>
        </div>
      </div>
    </Modal>
  )
}
