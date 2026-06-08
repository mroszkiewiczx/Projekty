// ============================================================
// src/modules/analytics/AnalyticsCard.tsx
// Karta KPI z wartością, ikoną i opcjonalnym trendem
// ============================================================

interface AnalyticsCardProps {
  title: string
  value: number | string
  unit?: string
  icon: React.ReactNode
  trend?: number  // % zmiana względem poprzedniego okresu
  color?: 'blue' | 'green' | 'yellow' | 'purple'
}

const colorMap: Record<string, string> = {
  blue:   'bg-blue-50 border-blue-200',
  green:  'bg-green-50 border-green-200',
  yellow: 'bg-yellow-50 border-yellow-200',
  purple: 'bg-purple-50 border-purple-200',
}

const valueColorMap: Record<string, string> = {
  blue:   'text-blue-700',
  green:  'text-green-700',
  yellow: 'text-yellow-700',
  purple: 'text-purple-700',
}

export function AnalyticsCard({
  title,
  value,
  unit,
  icon,
  trend,
  color = 'blue',
}: AnalyticsCardProps) {
  const cardCls = colorMap[color]
  const valueCls = valueColorMap[color]

  return (
    <div className={`rounded-xl border p-6 ${cardCls}`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={`mt-2 text-3xl font-bold ${valueCls}`}>{value}</p>
          {unit && <p className="mt-1 text-xs text-gray-400">{unit}</p>}
        </div>
        <span className="ml-4 text-3xl">{icon}</span>
      </div>

      {trend !== undefined && (
        <div className={`mt-4 flex items-center gap-1 text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          <span>{trend >= 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(trend)}% vs ubiegły miesiąc</span>
        </div>
      )}
    </div>
  )
}
