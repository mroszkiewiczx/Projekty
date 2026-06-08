import { HTMLAttributes, ReactNode, forwardRef, useCallback, useEffect } from 'react'
import { cn } from '@/lib/cn'
import { Button } from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  closeButton?: boolean
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ isOpen, onClose, title, children, size = 'md', closeButton = true }, ref) => {
    const handleEscape = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      },
      [onClose]
    )

    useEffect(() => {
      if (isOpen) {
        document.addEventListener('keydown', handleEscape)
        document.body.style.overflow = 'hidden'
        return () => {
          document.removeEventListener('keydown', handleEscape)
          document.body.style.overflow = 'unset'
        }
      }
    }, [isOpen, handleEscape])

    if (!isOpen) {
      return null
    }

    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div
          ref={ref}
          className={cn(
            'w-full rounded-lg bg-white shadow-lg',
            sizeClasses[size]
          )}
        >
          {(title || closeButton) && (
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
              {closeButton && (
                <button
                  onClick={onClose}
                  className="ml-auto inline-flex items-center justify-center rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Close modal"
                >
                  <svg
                    className="h-5 w-5"
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
          )}
          <div className="px-6 py-4">{children}</div>
        </div>
      </div>
    )
  }
)

Modal.displayName = 'Modal'

export { Modal }
