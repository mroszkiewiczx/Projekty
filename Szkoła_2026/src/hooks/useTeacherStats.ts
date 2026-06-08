import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { lessonService } from '@/services/lessonService'
import type { TeacherDashboardStats } from '@/types/lesson'

const STATS_STALE_TIME = 60_000 // 60 seconds

export interface UseTeacherStatsReturn {
  stats: TeacherDashboardStats | null
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

export function useTeacherStats(): UseTeacherStatsReturn {
  const { user } = useAuth()

  const queryResult = useQuery<TeacherDashboardStats, Error>({
    queryKey: ['teacherStats', user?.workspaceId, user?.id],
    queryFn: async () => {
      if (!user?.workspaceId || !user?.id) {
        throw new Error('Użytkownik nie jest zalogowany')
      }
      return lessonService.getTeacherDashboardStats(user.workspaceId, user.id)
    },
    enabled: Boolean(user?.workspaceId && user?.id),
    staleTime: STATS_STALE_TIME,
    refetchInterval: STATS_STALE_TIME,
    retry: 2,
  })

  return {
    stats: queryResult.data ?? null,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error ?? null,
    refetch: queryResult.refetch,
  }
}
