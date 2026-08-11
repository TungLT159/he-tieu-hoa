import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ImageSkeleton } from '../ImageSkeleton'

describe('ImageSkeleton', () => {
  it('renders an accessible animated image generation placeholder', () => {
    render(<ImageSkeleton label="Creating localized image" />)

    const skeleton = screen.getByRole('status', { name: 'Creating localized image' })

    expect(skeleton).toHaveClass(
      'w-full',
      'aspect-[3/2]',
      'rounded-md',
      'bg-gradient-to-r',
      'from-muted',
      'via-muted/50',
      'to-muted',
      'bg-[length:200%_100%]',
      'animate-pulse',
    )
  })
})
