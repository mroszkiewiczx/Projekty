// ============================================================
// src/hooks/useAnalytics.ts
// Hook do pobierania danych analytics — TanStack Query
// ============================================================

import { useQuery } from '@tanstack/react-query'
import { getAnalyticsOverview } from '@/services/analyticsService'
import type { AnalyticsOverview } from '@/types/analytics'

const STALE_TIME = 5 * 60_000 // 5 minut

export interface UseAnalyticsReturn {
  data: AnalyticsOverview | null
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

export function useAnalytics(workspace_id: string): UseAnalyticsReturn {
  const result = useQuery<AnalyticsOverview, Error>({
    queryKey: ['analytics', workspace_id],
    queryFn: () => getAnalyticsOverview(workspace_id),
    enabled: Boolean(workspace_id),
    staleTime: STALE_TIME,
    refetchInterval: STALE_TIME,
    retry: 2,
  })

  return {
    data: result.data ?? null,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error ?? null,
    refetch: result.refetch,
  }
}
