import { renderStarter } from '@/test/starterRender'
import { fireEvent, screen } from '@testing-library/react'
import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { describe, expect, it, vi } from 'vitest'
import type { ReactElement } from 'react'

import { ColorPickerPopover } from '../ColorPickerPopover'

function renderColorPicker(ui: ReactElement) {
  return renderStarter(
    <StarterSettingsContext.Provider
      value={{
        appVersion: '0.1.0',
        locale: 'en',
        resolvedThemeMode: 'light',
        settings: DEFAULT_STARTER_SETTINGS,
        updateSettings: vi.fn(),
      }}
    >
      {ui}
    </StarterSettingsContext.Provider>,
  )
}

describe('ColorPickerPopover', () => {
  it('calls onChange when a preset color is picked', () => {
    const onChange = vi.fn()
    renderColorPicker(
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
    renderColorPicker(
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

  it('shows a reset button when onReset is provided and calls it once', () => {
    const onReset = vi.fn()
    renderColorPicker(
      <ColorPickerPopover
        label="Model Color"
        value="#ffffff"
        onChange={vi.fn()}
        onReset={onReset}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Model Color' }))
    fireEvent.click(screen.getByRole('button', { name: 'Default' }))

    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('hides the reset button when onReset is omitted', () => {
    renderColorPicker(
      <ColorPickerPopover
        label="Model Color"
        value="#ffffff"
        onChange={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Model Color' }))

    expect(screen.queryByRole('button', { name: 'Default' })).not.toBeInTheDocument()
  })
})
