import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { libraryService } from '@/services/libraryService'
import type { Material, LibraryFilters, LibraryStats } from '@/types/library'

interface UseLibrarySearchState {
  materials: Material[]
  stats: LibraryStats | null
  isLoading: boolean
  isSearching: boolean
  error: Error | null
  currentPage: number
  totalResults: number
  pageSize: number
  filters: LibraryFilters
  searchQuery: string
  setSearchQuery: (query: string) => void
  setFilters: (filters: LibraryFilters) => void
  goToPage: (page: number) => void
  search: () => Promise<void>
  clearError: () => void
}

export function useLibrarySearch(initialPageSize = 50): UseLibrarySearchState {
  const { user } = useAuth()
  const [materials, setMaterials] = useState<Material[]>([])
  const [stats, setStats] = useState<LibraryStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<LibraryFilters>({})

  const loadMaterials = useCallback(async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const offset = (currentPage - 1) * initialPageSize
      const data = await libraryService.getMaterials(
        user.workspaceId,
        filters,
        initialPageSize,
        offset
      )
      setMaterials(data)
      setTotalResults(data.length) // Simplified for demo — real impl needs count endpoint
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load materials'
      setError(new Error(errorMessage))
    } finally {
      setIsLoading(false)
    }
  }, [user?.workspaceId, currentPage, filters, initialPageSize])

  const search = useCallback(async () => {
    if (!user || !searchQuery.trim()) {
      return
    }

    try {
      setIsSearching(true)
      setError(null)
      const data = await libraryService.searchMaterials(user.workspaceId, searchQuery, initialPageSize)
      setMaterials(data)
      setTotalResults(data.length)
      setCurrentPage(1)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search materials'
      setError(new Error(errorMessage))
    } finally {
      setIsSearching(false)
    }
  }, [user?.workspaceId, searchQuery, initialPageSize])

  const loadStats = useCallback(async () => {
    if (!user) {
      return
    }

    try {
      const statsData = await libraryService.getLibraryStats(user.workspaceId)
      setStats(statsData)
    } catch (err) {
      console.error('Failed to load library stats:', err)
    }
  }, [user?.workspaceId])

  useEffect(() => {
    loadMaterials()
    loadStats()
  }, [loadMaterials, loadStats])

  const clearError = () => {
    setError(null)
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, page))
  }

  return {
    materials,
    stats,
    isLoading,
    isSearching,
    error,
    currentPage,
    totalResults,
    pageSize: initialPageSize,
    filters,
    searchQuery,
    setSearchQuery,
    setFilters,
    goToPage,
    search,
    clearError
  }
}
