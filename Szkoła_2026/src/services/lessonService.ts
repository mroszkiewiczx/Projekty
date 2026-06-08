import { supabase } from '@/lib/supabase'
import { LessonGeneratorInput, LessonGeneratorOutput, TeacherDashboardStats, MaterialQualityScore } from '@/types/lesson'

export const lessonService = {
  async generateLesson(workspaceId: string, userId: string, input: LessonGeneratorInput): Promise<LessonGeneratorOutput> {
    try {
      // Call AI proxy Edge Function
      const response = await fetch('/api/ai-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateLesson',
          workspaceId,
          userId,
          input
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate lesson')
      }

      const aiOutput = await response.json()

      // Save to database
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          workspace_id: workspaceId,
          teacher_id: userId,
          topic: input.topic,
          title: aiOutput.title,
          subject: input.subject || '',
          grade: input.grade || 0,
          content: {
            ...aiOutput,
            educationLevel: input.educationLevel,
            duration: input.duration,
            objectives: input.objectives,
          },
          status: 'draft' as const,
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        topic: input.topic,
        title: aiOutput.title,
        content: aiOutput.content,
        objectives: input.objectives,
        activities: aiOutput.activities || [],
        assessment: aiOutput.assessment || '',
        materials: aiOutput.materials || [],
        qualityScore: 0,
        generatedAt: new Date(data.created_at),
        status: 'draft'
      }
    } catch (error) {
      console.error('Error generating lesson:', error)
      throw error
    }
  },

  async getTeacherDashboardStats(workspaceId: string, userId: string): Promise<TeacherDashboardStats> {
    try {
      const { count: totalCount } = await supabase
        .from('lessons')
        .select('id', { count: 'exact' })
        .eq('workspace_id', workspaceId)

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

      const { count: monthCount } = await supabase
        .from('lessons')
        .select('id', { count: 'exact' })
        .eq('workspace_id', workspaceId)
        .gte('created_at', thirtyDaysAgo)

      const { data: recentMaterials } = await supabase
        .from('lessons')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: qualityScores } = await supabase
        .from('material_quality_scores')
        .select('overall_score')
        .eq('workspace_id', workspaceId)
        .limit(10)

      const averageQuality =
        qualityScores && qualityScores.length > 0
          ? qualityScores.reduce((sum, item) => sum + (item.overall_score || 0), 0) / qualityScores.length
          : 0

      return {
        materialsGenerated: totalCount || 0,
        materialsThisMonth: monthCount || 0,
        averageQuality: Math.round(averageQuality),
        recentMaterials: (recentMaterials || []).map(m => ({
          id: m.id,
          topic: m.topic,
          title: m.title,
          content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
          objectives: (m.metadata as Record<string, unknown>)?.objectives as string[] || [],
          activities: [],
          assessment: '',
          materials: [],
          qualityScore: 0,
          generatedAt: new Date(m.created_at),
          status: m.status
        }))
      }
    } catch (error) {
      console.error('Error fetching teacher stats:', error)
      return {
        materialsGenerated: 0,
        materialsThisMonth: 0,
        averageQuality: 0,
        recentMaterials: []
      }
    }
  },

  async getLesson(lessonId: string): Promise<LessonGeneratorOutput | null> {
    try {
      const { data } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single()

      if (!data) return null

      return {
        id: data.id,
        topic: data.topic,
        title: data.title,
        content: typeof data.content === 'string' ? data.content : JSON.stringify(data.content),
        objectives: (data.metadata as Record<string, unknown>)?.objectives as string[] || [],
        activities: (data.metadata as Record<string, unknown>)?.activities as [] || [],
        assessment: '',
        materials: [],
        qualityScore: 0,
        generatedAt: new Date(data.created_at),
        status: data.status
      }
    } catch (error) {
      console.error('Error fetching lesson:', error)
      return null
    }
  },

  async publishLesson(lessonId: string): Promise<void> {
    try {
      await supabase.from('lessons').update({ status: 'published' }).eq('id', lessonId)
    } catch (error) {
      console.error('Error publishing lesson:', error)
      throw error
    }
  },

  async deleteLesson(lessonId: string): Promise<void> {
    try {
      await supabase.from('lessons').update({ deleted_at: new Date().toISOString() }).eq('id', lessonId)
    } catch (error) {
      console.error('Error deleting lesson:', error)
      throw error
    }
  },

  async getQualityScore(materialId: string): Promise<MaterialQualityScore | null> {
    try {
      const { data } = await supabase
        .from('material_quality_scores')
        .select('*')
        .eq('material_id', materialId)
        .single()

      if (!data) return null

      return {
        id: data.id,
        materialId: data.material_id,
        topicalAlignment: data.topical_alignment || 0,
        gradeAppropriate: data.grade_appropriateness || 0,
        timeRealism: data.lesson_time_realism || 0,
        objectivesQuality: data.objectives_quality || 0,
        exercisesQuality: data.exercises_quality || 0,
        languageClarity: data.language_clarity || 0,
        structureFlow: data.structure_flow || 0,
        engagementPotential: data.engagement_potential || 0,
        overallScore: data.overall_score || 0,
        feedback: data.feedback || ''
      }
    } catch (error) {
      console.error('Error fetching quality score:', error)
      return null
    }
  }
}
