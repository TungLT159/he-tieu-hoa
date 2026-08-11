import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { renderStarter } from '@/test/starterRender'
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { GenAIPanel } from '../GenAIPanel'

vi.mock('../GenAIContent', () => ({
  GenAIContent: () => <div data-testid="genai-content">Generated AI content</div>,
}))

function renderPanel(onClose = vi.fn()) {
  renderStarter(
    <StarterSettingsContext.Provider
      value={{
        appVersion: '0.1.0',
        locale: 'en',
        resolvedThemeMode: 'light',
        settings: DEFAULT_STARTER_SETTINGS,
        updateSettings: vi.fn(),
      }}
    >
      <GenAIPanel onClose={onClose} />
    </StarterSettingsContext.Provider>,
  )

  return { onClose }
}

describe('GenAIPanel', () => {
  it('renders the AI generated description panel with GenAI content', () => {
    renderPanel()

    expect(screen.getByRole('dialog', { name: 'Digestive System Description' })).toBeInTheDocument()
    expect(screen.getByText('Digestive System Description')).toBeInTheDocument()
    expect(screen.getByTestId('genai-content')).toHaveTextContent('Generated AI content')
  })

  it('calls onClose when the sheet close button is clicked', () => {
    const { onClose } = renderPanel()

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
