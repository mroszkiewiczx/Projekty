import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toast } from './Toast'

describe('Toast Component', () => {
  it('renders success toast', () => {
    render(<Toast type="success" message="Operation successful" />)
    expect(screen.getByText('Operation successful')).toBeInTheDocument()
  })

  it('renders error toast', () => {
    render(<Toast type="error" message="An error occurred" />)
    expect(screen.getByText('An error occurred')).toBeInTheDocument()
  })

  it('renders warning toast', () => {
    render(<Toast type="warning" message="Warning message" />)
    expect(screen.getByText('Warning message')).toBeInTheDocument()
  })

  it('renders info toast', () => {
    render(<Toast type="info" message="Information" />)
    expect(screen.getByText('Information')).toBeInTheDocument()
  })

  it('applies correct styling for success toast', () => {
    const { container } = render(<Toast type="success" message="Success" />)
    expect(container.querySelector('div')).toHaveClass('bg-green-50')
    expect(container.querySelector('div')).toHaveClass('text-green-800')
  })

  it('applies correct styling for error toast', () => {
    const { container } = render(<Toast type="error" message="Error" />)
    expect(container.querySelector('div')).toHaveClass('bg-red-50')
    expect(container.querySelector('div')).toHaveClass('text-red-800')
  })

  it('applies correct styling for warning toast', () => {
    const { container } = render(<Toast type="warning" message="Warning" />)
    expect(container.querySelector('div')).toHaveClass('bg-yellow-50')
    expect(container.querySelector('div')).toHaveClass('text-yellow-800')
  })

  it('applies correct styling for info toast', () => {
    const { container } = render(<Toast type="info" message="Info" />)
    expect(container.querySelector('div')).toHaveClass('bg-blue-50')
    expect(container.querySelector('div')).toHaveClass('text-blue-800')
  })

  it('renders close button when onClose is provided', () => {
    const { container } = render(
      <Toast type="info" message="Message" onClose={vi.fn()} />
    )
    expect(container.querySelector('button')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const handleClose = vi.fn()
    render(<Toast type="info" message="Message" onClose={handleClose} />)

    const closeButton = screen.getByRole('button')
    await userEvent.click(closeButton)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('auto-dismisses after duration', async () => {
    vi.useFakeTimers()
    const handleClose = vi.fn()

    render(
      <Toast type="success" message="Message" onClose={handleClose} duration={3000} />
    )

    vi.advanceTimersByTime(3000)
    vi.useRealTimers()

    expect(handleClose).toHaveBeenCalled()
  })

  it('does not auto-dismiss without duration', () => {
    vi.useFakeTimers()
    const handleClose = vi.fn()

    render(<Toast type="success" message="Message" onClose={handleClose} />)

    vi.advanceTimersByTime(5000)
    vi.useRealTimers()

    expect(handleClose).not.toHaveBeenCalled()
  })

  it('accepts custom className', () => {
    const { container } = render(
      <Toast type="info" message="Message" className="custom-toast" />
    )
    expect(container.querySelector('div')).toHaveClass('custom-toast')
  })

  it('renders toast with rounded border', () => {
    const { container } = render(<Toast type="info" message="Message" />)
    expect(container.querySelector('div')).toHaveClass('rounded-lg')
  })
})
