import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('applies primary variant by default', () => {
    const { container } = render(<Button>Test</Button>)
    const button = container.querySelector('button')
    expect(button).toHaveClass('bg-blue-600')
  })

  it('applies secondary variant', () => {
    const { container } = render(<Button variant="secondary">Test</Button>)
    const button = container.querySelector('button')
    expect(button).toHaveClass('bg-gray-200')
  })

  it('applies outline variant', () => {
    const { container } = render(<Button variant="outline">Test</Button>)
    const button = container.querySelector('button')
    expect(button).toHaveClass('border')
  })

  it('applies danger variant', () => {
    const { container } = render(<Button variant="danger">Test</Button>)
    const button = container.querySelector('button')
    expect(button).toHaveClass('bg-red-600')
  })

  it('applies size md by default', () => {
    const { container } = render(<Button>Test</Button>)
    const button = container.querySelector('button')
    expect(button).toHaveClass('h-10')
  })

  it('applies different sizes', () => {
    const { container: smContainer } = render(<Button size="sm">Test</Button>)
    expect(smContainer.querySelector('button')).toHaveClass('h-9')

    const { container: lgContainer } = render(<Button size="lg">Test</Button>)
    expect(lgContainer.querySelector('button')).toHaveClass('h-12')
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)

    const button = screen.getByText('Click')
    await userEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByText('Disabled')).toBeDisabled()
  })

  it('disables button when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>)
    expect(screen.getByText('Loading')).toBeDisabled()
  })

  it('shows loading spinner when isLoading is true', () => {
    const { container } = render(<Button isLoading>Loading</Button>)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Button className="custom-class">Test</Button>)
    const button = container.querySelector('button')
    expect(button).toHaveClass('custom-class')
  })
})
