import { supabase } from '@/lib/supabase'
import { Material, LibraryFilters, LibraryStats, HistoryItem, MaterialType } from '@/types/library'

export const libraryService = {
  async getMaterials(workspaceId: string, filters: LibraryFilters = {}, limit = 50, offset = 0): Promise<Material[]> {
    try {
      let query = supabase
        .from('materials_view')
        .select('*')
        .eq('workspace_id', workspaceId)

      if (filters.type && filters.type.length > 0) {
        query = query.in('type', filters.type)
      }
      if (filters.subject) {
        query = query.eq('subject', filters.subject)
      }
      if (filters.grade) {
        query = query.eq('grade', filters.grade)
      }
      if (filters.minQuality) {
        query = query.gte('quality_score', filters.minQuality)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      const sortMap: Record<string, any> = {
        'date_newest': { column: 'created_at', ascending: false },
        'date_oldest': { column: 'created_at', ascending: true },
        'quality_high': { column: 'quality_score', ascending: false },
        'quality_low': { column: 'quality_score', ascending: true },
        'title_a_z': { column: 'title', ascending: true }
      }

      const sort = sortMap[filters.sortBy || 'date_newest']
      query = query.order(sort.column, { ascending: sort.ascending })

      const { data, error } = await query.range(offset, offset + limit - 1)

      if (error) throw error

      return (data || []).map(m => ({
        id: m.id,
        type: m.type as MaterialType,
        title: m.title,
        topic: m.topic,
        subject: m.subject,
        grade: m.grade,
        status: m.status as 'draft' | 'published' | 'archived',
        qualityScore: m.quality_score || 0,
        createdAt: new Date(m.created_at),
        updatedAt: new Date(m.updated_at),
        preview: undefined
      }))
    } catch (error) {
      console.error('Error fetching materials:', error)
      return []
    }
  },

  async searchMaterials(workspaceId: string, query: string, limit = 50): Promise<Material[]> {
    try {
      const { data, error } = await supabase
        .from('materials_view')
        .select('*')
        .eq('workspace_id', workspaceId)
        .or(`title.ilike.%${query}%,topic.ilike.%${query}%`)
        .limit(limit)

      if (error) throw error

      return (data || []).map(m => ({
        id: m.id,
        type: m.type as MaterialType,
        title: m.title,
        topic: m.topic,
        subject: m.subject,
        grade: m.grade,
        status: m.status as 'draft' | 'published' | 'archived',
        qualityScore: m.quality_score || 0,
        createdAt: new Date(m.created_at),
        updatedAt: new Date(m.updated_at)
      }))
    } catch (error) {
      console.error('Error searching materials:', error)
      return []
    }
  },

  async getLibraryStats(workspaceId: string): Promise<LibraryStats> {
    try {
      const { data } = await supabase
        .from('materials_view')
        .select('type, status, quality_score')
        .eq('workspace_id', workspaceId)

      const emptyByType: Record<MaterialType, number> = { lesson: 0, syllabus: 0, quiz: 0, test: 0, worksheet: 0, presentation: 0 }
      if (!data) return { totalMaterials: 0, byType: emptyByType, byStatus: {}, averageQuality: 0 }

      const byType: Record<MaterialType, number> = {
        lesson: 0,
        syllabus: 0,
        quiz: 0,
        test: 0,
        worksheet: 0,
        presentation: 0
      }

      const byStatus: Record<string, number> = {}
      let totalQuality = 0

      data.forEach(item => {
        byType[item.type as MaterialType]++
        byStatus[item.status] = (byStatus[item.status] || 0) + 1
        totalQuality += item.quality_score || 0
      })

      return {
        totalMaterials: data.length,
        byType,
        byStatus,
        averageQuality: data.length > 0 ? Math.round(totalQuality / data.length) : 0
      }
    } catch (error) {
      console.error('Error fetching library stats:', error)
      return { totalMaterials: 0, byType: { lesson: 0, syllabus: 0, quiz: 0, test: 0, worksheet: 0, presentation: 0 }, byStatus: {}, averageQuality: 0 }
    }
  },

  async getHistory(workspaceId: string, materialId: string): Promise<HistoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('material_history')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('material_id', materialId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map(h => ({
        id: h.id,
        materialId: h.material_id,
        version: h.version,
        title: h.title,
        status: h.is_current ? 'current' : 'archived',
        createdAt: new Date(h.created_at),
        changedBy: h.changed_by,
        change: h.change_description
      }))
    } catch (error) {
      console.error('Error fetching history:', error)
      return []
    }
  },

  async deleteMaterial(materialId: string): Promise<void> {
    try {
      await supabase
        .from('lessons')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', materialId)
    } catch (error) {
      console.error('Error deleting material:', error)
      throw error
    }
  },

  async archiveMaterial(materialId: string): Promise<void> {
    try {
      await supabase
        .from('lessons')
        .update({ status: 'archived' })
        .eq('id', materialId)
    } catch (error) {
      console.error('Error archiving material:', error)
      throw error
    }
  }
}
