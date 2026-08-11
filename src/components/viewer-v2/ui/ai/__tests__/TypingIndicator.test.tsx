import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TypingIndicator } from '../TypingIndicator'

describe('TypingIndicator', () => {
  it('renders three dots with animation classes and staggered delays', () => {
    const { container } = render(<TypingIndicator />)
    const dots = container.querySelectorAll('span')

    expect(dots).toHaveLength(3)

    dots.forEach((dot) => {
      expect(dot.className).toContain('animate-bounce')
      expect(dot.className).toContain('rounded-full')
    })

    expect(dots[0].style.animationDelay).toBe('0ms')
    expect(dots[1].style.animationDelay).toBe('150ms')
    expect(dots[2].style.animationDelay).toBe('300ms')
  })

  it('announces when AI is thinking', () => {
    render(<TypingIndicator />)

    expect(document.querySelector('[role="status"]')).toHaveAttribute(
      'aria-label',
      'AI is thinking',
    )
  })
})
