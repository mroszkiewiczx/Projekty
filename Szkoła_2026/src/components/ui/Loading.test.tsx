import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Loading } from './Loading'

describe('Loading Component', () => {
  it('renders spinner SVG', () => {
    const { container } = render(<Loading />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('displays loading text when provided', () => {
    render(<Loading text="Loading data..." />)
    expect(screen.getByText('Loading data...')).toBeInTheDocument()
  })

  it('does not display text when not provided', () => {
    render(<Loading />)
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })

  it('applies correct size classes', () => {
    const { container: smContainer } = render(<Loading size="sm" />)
    const smSvg = smContainer.querySelector('svg')
    expect(smSvg).toHaveClass('h-4')
    expect(smSvg).toHaveClass('w-4')

    const { container: mdContainer } = render(<Loading size="md" />)
    const mdSvg = mdContainer.querySelector('svg')
    expect(mdSvg).toHaveClass('h-8')
    expect(mdSvg).toHaveClass('w-8')

    const { container: lgContainer } = render(<Loading size="lg" />)
    const lgSvg = lgContainer.querySelector('svg')
    expect(lgSvg).toHaveClass('h-12')
    expect(lgSvg).toHaveClass('w-12')
  })

  it('applies default size md', () => {
    const { container } = render(<Loading />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('h-8')
    expect(svg).toHaveClass('w-8')
  })

  it('renders with animate-spin class', () => {
    const { container } = render(<Loading />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('animate-spin')
  })

  it('applies text styling', () => {
    render(<Loading text="Loading..." />)
    const text = screen.getByText('Loading...')
    expect(text).toHaveClass('text-sm')
    expect(text).toHaveClass('text-gray-600')
  })

  it('accepts custom className', () => {
    const { container } = render(<Loading className="custom-loader" />)
    const wrapper = container.querySelector('div')
    expect(wrapper).toHaveClass('custom-loader')
  })

  it('renders flex layout', () => {
    const { container } = render(<Loading text="Test" />)
    const wrapper = container.querySelector('div')
    expect(wrapper).toHaveClass('flex')
    expect(wrapper).toHaveClass('items-center')
    expect(wrapper).toHaveClass('justify-center')
  })

  it('has gap between spinner and text', () => {
    const { container } = render(<Loading text="Test" />)
    const wrapper = container.querySelector('div')
    expect(wrapper).toHaveClass('gap-2')
  })
})
