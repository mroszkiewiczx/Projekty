import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Input Component', () => {
  it('renders input element', () => {
    const { container } = render(<Input />)
    expect(container.querySelector('input')).toBeInTheDocument()
  })

  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('handles input change', async () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)

    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'hello')

    expect(handleChange).toHaveBeenCalled()
  })

  it('displays error message', () => {
    render(<Input error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('displays helper text', () => {
    render(<Input helperText="This is a helper text" />)
    expect(screen.getByText('This is a helper text')).toBeInTheDocument()
  })

  it('does not show helper text when error is present', () => {
    render(<Input error="Error" helperText="Helper" />)
    expect(screen.queryByText('Helper')).not.toBeInTheDocument()
  })

  it('applies error styling when error prop is set', () => {
    const { container } = render(<Input error="Error" />)
    const input = container.querySelector('input')
    expect(input).toHaveClass('border-red-500')
  })

  it('disables input when disabled prop is true', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('applies disabled styling', () => {
    const { container } = render(<Input disabled />)
    const input = container.querySelector('input')
    expect(input).toHaveClass('disabled:bg-gray-100')
  })

  it('accepts value prop', () => {
    render(<Input value="test value" onChange={() => {}} />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('test value')
  })

  it('accepts type attribute', () => {
    render(<Input type="email" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('applies custom className', () => {
    const { container } = render(<Input className="custom-class" />)
    const input = container.querySelector('input')
    expect(input).toHaveClass('custom-class')
  })
})
