import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { lessonService } from '@/services/lessonService'
import type { TeacherDashboardStats } from '@/types/lesson'

interface UseTeacherStatsState {
  stats: TeacherDashboardStats | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useTeacherStats(): UseTeacherStatsState {
  const { user } = useAuth()
  const [stats, setStats] = useState<TeacherDashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStats = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await lessonService.getTeacherDashboardStats(user.workspaceId, user.id)
      setStats(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch teacher stats'
      setError(new Error(errorMessage))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [user?.id, user?.workspaceId])

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats
  }
}
