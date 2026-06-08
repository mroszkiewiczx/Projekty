import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from './Card'

describe('Card Component', () => {
  it('renders Card wrapper', () => {
    const { container } = render(
      <Card>
        <div>Content</div>
      </Card>
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(container.querySelector('div')).toHaveClass('rounded-lg')
  })

  it('renders CardHeader', () => {
    render(
      <Card>
        <CardHeader>Header content</CardHeader>
      </Card>
    )
    expect(screen.getByText('Header content')).toBeInTheDocument()
  })

  it('applies CardHeader styling', () => {
    const { container } = render(
      <Card>
        <CardHeader>Header</CardHeader>
      </Card>
    )
    const header = container.querySelector('[class*="border-b"]')
    expect(header).toBeInTheDocument()
  })

  it('renders CardContent', () => {
    render(
      <Card>
        <CardContent>Main content</CardContent>
      </Card>
    )
    expect(screen.getByText('Main content')).toBeInTheDocument()
  })

  it('renders CardFooter', () => {
    render(
      <Card>
        <CardFooter>Footer content</CardFooter>
      </Card>
    )
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })

  it('applies CardFooter styling with border-top', () => {
    const { container } = render(
      <Card>
        <CardFooter>Footer</CardFooter>
      </Card>
    )
    const footer = container.querySelector('[class*="border-t"]')
    expect(footer).toBeInTheDocument()
  })

  it('renders CardTitle', () => {
    render(
      <Card>
        <CardTitle>Title</CardTitle>
      </Card>
    )
    expect(screen.getByText('Title')).toBeInTheDocument()
  })

  it('renders CardTitle as h2', () => {
    const { container } = render(
      <Card>
        <CardTitle>Title</CardTitle>
      </Card>
    )
    expect(container.querySelector('h2')).toBeInTheDocument()
  })

  it('renders CardDescription', () => {
    render(
      <Card>
        <CardDescription>Description text</CardDescription>
      </Card>
    )
    expect(screen.getByText('Description text')).toBeInTheDocument()
  })

  it('renders complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description</CardDescription>
        </CardHeader>
        <CardContent>Card content</CardContent>
        <CardFooter>Card footer</CardFooter>
      </Card>
    )

    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card description')).toBeInTheDocument()
    expect(screen.getByText('Card content')).toBeInTheDocument()
    expect(screen.getByText('Card footer')).toBeInTheDocument()
  })

  it('accepts custom className', () => {
    const { container } = render(
      <Card className="custom-card">Content</Card>
    )
    const card = container.querySelector('div')
    expect(card).toHaveClass('custom-card')
  })
})
