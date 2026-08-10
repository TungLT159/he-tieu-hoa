import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { renderStarter } from '@/test/starterRender'
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { PlaceholderDialog } from '../PlaceholderDialog'

function renderDialog(onClose = vi.fn()) {
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
      <PlaceholderDialog
        titleKey="viewer.quiz.title"
        placeholderKey="viewer.quiz.placeholder"
        onClose={onClose}
      />
    </StarterSettingsContext.Provider>,
  )
}

describe('PlaceholderDialog', () => {
  it('renders the title, placeholder body, and close button', () => {
    renderDialog()

    expect(screen.getByRole('dialog', { name: 'Quiz' })).toBeInTheDocument()
    expect(screen.getByText('Quiz')).toBeInTheDocument()
    expect(screen.getByText('This feature is under development.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    renderDialog(onClose)

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalled()
  })
})
