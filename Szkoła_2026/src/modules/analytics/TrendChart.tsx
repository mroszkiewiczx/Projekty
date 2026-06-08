// ============================================================
// src/modules/analytics/TrendChart.tsx
// Wykres trendów — SVG sparkline, bez zewnętrznych bibliotek
// ============================================================

import type { TrendPoint } from '@/types/analytics'

interface TrendChartProps {
  data: TrendPoint[]
}

function buildPolyline(values: number[], width: number, height: number): string {
  if (!values.length) return ''
  const max = Math.max(...values, 1)
  const step = width / (values.length - 1)
  return values
    .map((v, i) => `${Math.round(i * step)},${Math.round(height - (v / max) * height)}`)
    .join(' ')
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'short' }).format(
    date instanceof Date ? date : new Date(date),
  )
}

export function TrendChart({ data }: TrendChartProps) {
  if (!data.length) {
    return <p className="text-sm text-gray-400">Brak danych do wyświetlenia.</p>
  }

  const W = 600
  const H = 120
  const engagementLine = buildPolyline(data.map((d) => d.engagement), W, H)
  const completionLine = buildPolyline(data.map((d) => d.completion), W, H)

  // Etykiety: pierwsza i ostatnia data
  const firstLabel = formatDate(data[0].date)
  const lastLabel = formatDate(data[data.length - 1].date)

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-4 rounded-full bg-blue-500" />
          Zaangażowanie
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-4 rounded-full bg-green-500" />
          Ukończenie
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H + 20}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ minWidth: 320, height: 140 }}
        aria-label="Wykres trendów nauki"
        role="img"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((pct) => (
          <line
            key={pct}
            x1={0}
            y1={Math.round(H - (pct / 100) * H)}
            x2={W}
            y2={Math.round(H - (pct / 100) * H)}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        ))}

        {/* Engagement line */}
        <polyline
          points={engagementLine}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Completion line */}
        <polyline
          points={completionLine}
          fill="none"
          stroke="#22c55e"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Date labels */}
        <text x={0} y={H + 16} fontSize={10} fill="#9ca3af">{firstLabel}</text>
        <text x={W} y={H + 16} fontSize={10} fill="#9ca3af" textAnchor="end">{lastLabel}</text>
      </svg>
    </div>
  )
}
