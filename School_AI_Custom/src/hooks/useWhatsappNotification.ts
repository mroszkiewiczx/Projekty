import { useState, useCallback } from 'react'
import { whatsappNotificationService } from '@/services/whatsappNotificationService'
import { WhatsappRecipientGroup, WhatsappSendResult } from '@/types/notification'
import { LessonGeneratorOutput } from '@/types/lesson'

interface UseWhatsappNotificationState {
  loading: boolean
  error: string | null
  success: boolean
  recipientCount: number
}

export function useWhatsappNotification() {
  const [state, setState] = useState<UseWhatsappNotificationState>({
    loading: false,
    error: null,
    success: false,
    recipientCount: 0,
  })

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: false,
      recipientCount: 0,
    })
  }, [])

  const sendLessonNotification = useCallback(
    async (lesson: LessonGeneratorOutput | any, recipientGroup: WhatsappRecipientGroup = 'STUDENTS') => {
      reset()
      setState((prev) => ({ ...prev, loading: true }))

      try {
        const result: WhatsappSendResult = await whatsappNotificationService.sendLessonNotification(
          lesson,
          recipientGroup
        )

        if (result.success) {
          setState({
            loading: false,
            error: null,
            success: true,
            recipientCount: result.recipientCount || 0,
          })
          return result
        } else {
          setState({
            loading: false,
            error: result.error || 'Failed to send notification',
            success: false,
            recipientCount: 0,
          })
          return result
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        setState({
          loading: false,
          error: errorMessage,
          success: false,
          recipientCount: 0,
        })
        return { success: false, error: errorMessage }
      }
    },
    [reset]
  )

  const sendCustomMessage = useCallback(
    async (phoneNumber: string, message: string) => {
      reset()
      setState((prev) => ({ ...prev, loading: true }))

      try {
        const result = await whatsappNotificationService.sendCustomMessage(phoneNumber, message)

        if (result.success) {
          setState({
            loading: false,
            error: null,
            success: true,
            recipientCount: 1,
          })
        } else {
          setState({
            loading: false,
            error: result.error || 'Failed to send message',
            success: false,
            recipientCount: 0,
          })
        }
        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        setState({
          loading: false,
          error: errorMessage,
          success: false,
          recipientCount: 0,
        })
        return { success: false, error: errorMessage }
      }
    },
    [reset]
  )

  return {
    ...state,
    reset,
    sendLessonNotification,
    sendCustomMessage,
  }
}
