import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { lessonService } from '@/services/lessonService'
import type { LessonGeneratorInput, LessonGeneratorOutput } from '@/types/lesson'

interface UseLessonEditorState {
  currentLesson: LessonGeneratorOutput | null
  isLoading: boolean
  isSaving: boolean
  error: Error | null
  generateLesson: (input: LessonGeneratorInput) => Promise<LessonGeneratorOutput>
  publishLesson: (lessonId: string) => Promise<void>
  deleteLesson: (lessonId: string) => Promise<void>
  loadLesson: (lessonId: string) => Promise<void>
  clearError: () => void
}

export function useLessonEditor(): UseLessonEditorState {
  const { user } = useAuth()
  const [currentLesson, setCurrentLesson] = useState<LessonGeneratorOutput | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const generateLesson = async (input: LessonGeneratorInput): Promise<LessonGeneratorOutput> => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      setIsSaving(true)
      setError(null)
      const lesson = await lessonService.generateLesson(user.workspaceId, user.id, input)
      setCurrentLesson(lesson)
      return lesson
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate lesson'
      const newError = new Error(errorMessage)
      setError(newError)
      throw newError
    } finally {
      setIsSaving(false)
    }
  }

  const publishLesson = async (lessonId: string): Promise<void> => {
    try {
      setIsSaving(true)
      setError(null)
      await lessonService.publishLesson(lessonId)
      if (currentLesson && currentLesson.id === lessonId) {
        setCurrentLesson({
          ...currentLesson,
          status: 'published'
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish lesson'
      const newError = new Error(errorMessage)
      setError(newError)
      throw newError
    } finally {
      setIsSaving(false)
    }
  }

  const deleteLesson = async (lessonId: string): Promise<void> => {
    try {
      setIsSaving(true)
      setError(null)
      await lessonService.deleteLesson(lessonId)
      if (currentLesson && currentLesson.id === lessonId) {
        setCurrentLesson(null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete lesson'
      const newError = new Error(errorMessage)
      setError(newError)
      throw newError
    } finally {
      setIsSaving(false)
    }
  }

  const loadLesson = async (lessonId: string): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)
      const lesson = await lessonService.getLesson(lessonId)
      if (lesson) {
        setCurrentLesson(lesson)
      } else {
        throw new Error('Lesson not found')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load lesson'
      const newError = new Error(errorMessage)
      setError(newError)
      throw newError
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    currentLesson,
    isLoading,
    isSaving,
    error,
    generateLesson,
    publishLesson,
    deleteLesson,
    loadLesson,
    clearError
  }
}
