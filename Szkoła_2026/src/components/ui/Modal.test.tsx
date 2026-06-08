import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'

describe('Modal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={vi.fn()}>
        Modal content
      </Modal>
    )
    expect(container.querySelector('[class*="fixed"]')).not.toBeInTheDocument()
  })

  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        Modal content
      </Modal>
    )
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('renders title when provided', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Modal Title">
        Content
      </Modal>
    )
    expect(screen.getByText('Modal Title')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const handleClose = vi.fn()
    const { container } = render(
      <Modal isOpen={true} onClose={handleClose} closeButton>
        Content
      </Modal>
    )

    const closeButton = container.querySelector('button[aria-label="Close modal"]')
    if (closeButton) {
      await userEvent.click(closeButton)
      expect(handleClose).toHaveBeenCalledTimes(1)
    }
  })

  it('hides close button when closeButton is false', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={vi.fn()} closeButton={false}>
        Content
      </Modal>
    )
    expect(container.querySelector('button[aria-label="Close modal"]')).not.toBeInTheDocument()
  })

  it('applies correct size class', () => {
    const { container: smContainer } = render(
      <Modal isOpen={true} onClose={vi.fn()} size="sm">
        Content
      </Modal>
    )
    expect(smContainer.querySelector('[class*="max-w-sm"]')).toBeInTheDocument()

    const { container: lgContainer } = render(
      <Modal isOpen={true} onClose={vi.fn()} size="lg">
        Content
      </Modal>
    )
    expect(lgContainer.querySelector('[class*="max-w-lg"]')).toBeInTheDocument()
  })

  it('renders backdrop', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={vi.fn()}>
        Content
      </Modal>
    )
    expect(container.querySelector('[class*="bg-black"]')).toBeInTheDocument()
  })

  it('renders modal content in the modal', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <p>Custom content</p>
      </Modal>
    )
    expect(screen.getByText('Custom content')).toBeInTheDocument()
  })

  it('renders header section with title and close button', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Title" closeButton>
        Content
      </Modal>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(container.querySelector('button[aria-label="Close modal"]')).toBeInTheDocument()
  })
})
