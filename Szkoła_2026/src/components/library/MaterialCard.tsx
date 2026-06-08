import { cn } from '@/lib/cn'
import { Card, CardContent } from '@/components/ui'
import type { MaterialType } from '@/types/common'

interface MaterialCardProps {
  id: string
  title: string
  description: string
  type: MaterialType
  author: string
  createdAt: string
  rating?: number
  downloads?: number
  onSelect?: (id: string) => void
  className?: string
}

const typeIcons: Record<MaterialType, string> = {
  lesson: '📖',
  syllabus: '📋',
  quiz: '❓',
  test: '✍️',
  worksheet: '📝',
  presentation: '🎯',
}

const typeLabels: Record<MaterialType, string> = {
  lesson: 'Lekcja',
  syllabus: 'Program',
  quiz: 'Quiz',
  test: 'Test',
  worksheet: 'Ćwiczenia',
  presentation: 'Prezentacja',
}

export function MaterialCard({
  id,
  title,
  description,
  type,
  author,
  createdAt,
  rating = 0,
  downloads = 0,
  onSelect,
  className,
}: MaterialCardProps) {
  return (
    <Card
      className={cn('cursor-pointer transition-all hover:shadow-md hover:ring-1 hover:ring-blue-300', className)}
      onClick={() => onSelect?.(id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">{typeIcons[type]}</span>
              <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                {typeLabels[type]}
              </span>
            </div>
            <h3 className="mt-2 font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{description}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
          <span>👤 {author}</span>
          <span>📅 {new Date(createdAt).toLocaleDateString('pl-PL')}</span>
          {downloads > 0 && <span>⬇️ {downloads}</span>}
        </div>

        {rating > 0 && (
          <div className="mt-3 flex items-center gap-1">
            <span className="text-sm font-medium text-yellow-500">★ {rating.toFixed(1)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
