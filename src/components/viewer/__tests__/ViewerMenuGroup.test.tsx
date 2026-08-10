import { ArrowsClockwise, Question } from '@phosphor-icons/react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ViewerMenuGroup, type MenuButtonDef } from '../ViewerMenuGroup'

const sampleButtons: MenuButtonDef[] = [
  { id: 'rotate', label: 'Rotate Model', icon: ArrowsClockwise, onClick: vi.fn() },
  { id: 'quiz', label: 'Quiz', icon: Question, onClick: vi.fn() },
]

describe('ViewerMenuGroup', () => {
  it('renders group title when expanded', () => {
    render(<ViewerMenuGroup title="Model Interaction" buttons={sampleButtons} />)

    expect(screen.getByText('Model Interaction')).toBeInTheDocument()
  })

  it('renders button labels when expanded', () => {
    render(<ViewerMenuGroup title="Test" buttons={sampleButtons} />)

    expect(screen.getByText('Rotate Model')).toBeInTheDocument()
    expect(screen.getByText('Quiz')).toBeInTheDocument()
  })

  it('calls onClick when a button is clicked', async () => {
    const onClick = vi.fn()

    render(
      <ViewerMenuGroup
        title="Test"
        buttons={[{ id: 'rotate', label: 'Rotate Model', icon: ArrowsClockwise, onClick }]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Rotate Model' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('visually hides labels when collapsed', () => {
    render(<ViewerMenuGroup title="Test" buttons={sampleButtons} collapsed />)

    expect(screen.getByText('Test')).toHaveClass('sr-only')
    expect(screen.getByText('Rotate Model')).toHaveClass('sr-only')
  })

  it('keeps collapsed disabled buttons accessible without calling onClick', () => {
    const onClick = vi.fn()

    render(
      <ViewerMenuGroup
        title="Test"
        buttons={[{ id: 'rotate', label: 'Rotate Model', icon: ArrowsClockwise, onClick, disabled: true }]}
        collapsed
      />,
    )

    const button = screen.getByRole('button', { name: 'Rotate Model' })

    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(button).not.toBeDisabled()

    fireEvent.click(button)

    expect(onClick).not.toHaveBeenCalled()
  })
})
