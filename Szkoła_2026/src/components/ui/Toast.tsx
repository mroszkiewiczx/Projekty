import { HTMLAttributes, useEffect, forwardRef } from 'react'
import { cn } from '@/lib/cn'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  type?: ToastType
  message: string
  onClose?: () => void
  duration?: number
}

const typeClasses: Record<ToastType, { bg: string; text: string; border: string; icon: string }> = {
  success: {
    bg: 'bg-green-50',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: '✓',
  },
  error: {
    bg: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: '✕',
  },
  warning: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    icon: '!',
  },
  info: {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: 'ⓘ',
  },
}

const Toast = forwardRef<HTMLDivElement, ToastProps>(
  ({ className, type = 'info', message, onClose, duration = 5000, ...props }, ref) => {
    useEffect(() => {
      if (duration && onClose) {
        const timer = setTimeout(onClose, duration)
        return () => clearTimeout(timer)
      }
    }, [duration, onClose])

    const styles = typeClasses[type]

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-3 rounded-lg border px-4 py-3',
          styles.bg,
          styles.text,
          styles.border,
          className
        )}
        {...props}
      >
        <span className="font-bold">{styles.icon}</span>
        <p className="flex-1 text-sm">{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded p-1 hover:opacity-70"
            aria-label="Close toast"
          >
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    )
  }
)

Toast.displayName = 'Toast'

export { Toast }
