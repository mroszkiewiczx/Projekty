import { useState, useCallback } from 'react'
import { lessonService } from '@/services/lessonService'
import { useAuth } from '@/hooks/useAuth'
import type { LessonGeneratorInput, LessonGeneratorOutput } from '@/types/lesson'
import type { QualityScore } from '@/types/generators'

interface UseLessonGeneratorReturn {
  lesson: LessonGeneratorOutput | null
  score: QualityScore | null
  isGenerating: boolean
  progress: string
  error: string | null
  generate: (input: LessonGeneratorInput) => Promise<void>
  improve: (feedback: string) => Promise<void>
  reset: () => void
}

export function useLessonGenerator(): UseLessonGeneratorReturn {
  const { user } = useAuth()
  const [lesson, setLesson] = useState<LessonGeneratorOutput | null>(null)
  const [score, setScore] = useState<QualityScore | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(
    async (input: LessonGeneratorInput) => {
      if (!user) {
        setError('Musisz byc zalogowany, aby generowac lekcje.')
        return
      }

      setIsGenerating(true)
      setError(null)
      setProgress('Analizowanie tematu i podstawy programowej...')

      try {
        setProgress('Generowanie struktury lekcji...')
        const result = await lessonService.generateLesson(
          user.workspaceId,
          user.id,
          input,
        )

        setProgress('Ocenianie jakosci...')
        const qualityScore = await lessonService.getQualityScore(result.id).catch(() => null)

        setLesson(result)
        setScore(
          qualityScore
            ? {
                overall: qualityScore.overallScore,
                topicalAlignment: qualityScore.topicalAlignment,
                gradeAppropriate: qualityScore.gradeAppropriate,
                objectives: qualityScore.objectivesQuality,
                engagement: qualityScore.engagementPotential,
                feedback: qualityScore.feedback,
              }
            : null,
        )
        setProgress('')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Nieznany blad'
        setError(`Nie udalo sie wygenerowac lekcji: ${message}`)
        setProgress('')
      } finally {
        setIsGenerating(false)
      }
    },
    [user],
  )

  const improve = useCallback(
    async (feedback: string) => {
      if (!lesson || !user) return

      setIsGenerating(true)
      setError(null)
      setProgress('Ulepszanie lekcji na podstawie opinii...')

      try {
        const improved = await lessonService.generateLesson(user.workspaceId, user.id, {
          topic: `${lesson.topic} [Ulepszona wersja: ${feedback}]`,
          educationLevel: 'podstawowa',
          subject: '',
          grade: 0,
          duration: 1,
          objectives: lesson.objectives,
        })

        setLesson(improved)
        setProgress('')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Nieznany blad'
        setError(`Nie udalo sie ulepszyc lekcji: ${message}`)
        setProgress('')
      } finally {
        setIsGenerating(false)
      }
    },
    [lesson, user],
  )

  const reset = useCallback(() => {
    setLesson(null)
    setScore(null)
    setProgress('')
    setError(null)
  }, [])

  return { lesson, score, isGenerating, progress, error, generate, improve, reset }
}
