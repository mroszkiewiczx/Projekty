import { useState } from 'react'
import { Button, Input } from '@/components/ui'

interface Comment {
  id: string
  author: string
  content: string
  createdAt: string
  avatar?: string
}

interface CommentsSectionProps {
  comments: Comment[]
  onAddComment: (content: string) => Promise<void>
  isLoading?: boolean
}

export function CommentsSection({ comments, onAddComment, isLoading = false }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!newComment.trim()) {
      setError('Komentarz nie może być pusty')
      return
    }

    setSubmitting(true)
    try {
      await onAddComment(newComment)
      setNewComment('')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd podczas dodawania komentarza')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Komentarze ({comments.length})</h3>

      {comments.length > 0 && (
        <div className="space-y-3 max-h-80 overflow-y-auto rounded-lg bg-gray-50 p-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-l-2 border-blue-200 bg-white px-3 py-2">
              <div className="flex items-center gap-2">
                {comment.avatar && (
                  <img
                    src={comment.avatar}
                    alt={comment.author}
                    className="h-6 w-6 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900">{comment.author}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString('pl-PL')}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-700">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      {!isLoading && (
        <div className="space-y-2 rounded-lg bg-white p-3">
          <Input
            value={newComment}
            onChange={(e) => {
              setNewComment(e.target.value)
              setError(null)
            }}
            placeholder="Dodaj komentarz..."
            error={error || undefined}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              isLoading={submitting}
              disabled={!newComment.trim() || submitting}
              size="sm"
            >
              Wyślij
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
