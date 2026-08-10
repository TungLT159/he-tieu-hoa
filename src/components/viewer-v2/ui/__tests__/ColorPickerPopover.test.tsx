import { renderStarter } from '@/test/starterRender'
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ColorPickerPopover } from '../ColorPickerPopover'

describe('ColorPickerPopover', () => {
  it('calls onChange when a preset color is picked', () => {
    const onChange = vi.fn()
    renderStarter(
      <ColorPickerPopover
        label="Model Color"
        value="#ffffff"
        onChange={onChange}
        presets={['#ffffff', '#ff0000']}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Model Color' }))
    fireEvent.click(screen.getByRole('button', { name: '#ff0000' }))

    expect(onChange).toHaveBeenCalledWith('#ff0000')
  })

  it('keeps the label accessible but visually hidden when collapsed', () => {
    renderStarter(
      <ColorPickerPopover
        label="Model Color"
        value="#ffffff"
        onChange={vi.fn()}
        collapsed
      />,
    )

    const button = screen.getByRole('button', { name: 'Model Color' })
    expect(button).toHaveAttribute('title', 'Model Color')
    expect(button).toHaveClass('h-9', 'w-9')
    expect(screen.getByText('Model Color')).toHaveClass('sr-only')
  })
})
