import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Label } from './Label'

describe('Label Component', () => {
  it('renders label element', () => {
    const { container } = render(<Label>Label text</Label>)
    expect(container.querySelector('label')).toBeInTheDocument()
  })

  it('displays label text', () => {
    render(<Label>Email Address</Label>)
    expect(screen.getByText('Email Address')).toBeInTheDocument()
  })

  it('renders required indicator when required prop is true', () => {
    render(<Label required>Required Field</Label>)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('does not render required indicator when required prop is false', () => {
    const { container } = render(<Label required={false}>Optional Field</Label>)
    const asterisks = container.querySelectorAll('span:contains("*")')
    expect(asterisks.length).toBe(0)
  })

  it('accepts htmlFor attribute', () => {
    const { container } = render(<Label htmlFor="email-input">Email</Label>)
    const label = container.querySelector('label')
    expect(label).toHaveAttribute('for', 'email-input')
  })

  it('applies text styling', () => {
    const { container } = render(<Label>Test Label</Label>)
    const label = container.querySelector('label')
    expect(label).toHaveClass('text-sm')
    expect(label).toHaveClass('font-medium')
    expect(label).toHaveClass('text-gray-900')
  })

  it('accepts custom className', () => {
    const { container } = render(<Label className="custom-label">Test</Label>)
    const label = container.querySelector('label')
    expect(label).toHaveClass('custom-label')
  })

  it('combines required indicator with label text', () => {
    render(<Label required>First Name</Label>)
    expect(screen.getByText('First Name')).toBeInTheDocument()
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('renders with children components', () => {
    render(
      <Label>
        <span>Custom content</span>
      </Label>
    )
    expect(screen.getByText('Custom content')).toBeInTheDocument()
  })
})
