import { Button } from '@/components/ui'

interface LessonActionsProps {
  onShare?: () => void
  onPublish?: () => void
  onDelete?: () => void
  onExport?: () => void
  isPublished?: boolean
  isLoading?: boolean
}

export function LessonActions({
  onShare,
  onPublish,
  onDelete,
  onExport,
  isPublished = false,
  isLoading = false,
}: LessonActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {onShare && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onShare}
          disabled={isLoading}
        >
          📤 Udostępnij
        </Button>
      )}
      {onPublish && (
        <Button
          variant={isPublished ? 'secondary' : 'primary'}
          size="sm"
          onClick={onPublish}
          isLoading={isLoading}
        >
          {isPublished ? '✓ Opublikowana' : 'Opublikuj'}
        </Button>
      )}
      {onExport && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onExport}
          disabled={isLoading}
        >
          📥 Eksportuj
        </Button>
      )}
      {onDelete && (
        <Button
          variant="danger"
          size="sm"
          onClick={onDelete}
          disabled={isLoading}
        >
          🗑️ Usuń
        </Button>
      )}
    </div>
  )
}
