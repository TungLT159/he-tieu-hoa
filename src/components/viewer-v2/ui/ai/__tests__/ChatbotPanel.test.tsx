import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { renderStarter } from '@/test/starterRender'
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ChatbotPanel } from '../ChatbotPanel'

vi.mock('../ChatContent', () => ({
  ChatContent: () => <div>Chat content</div>,
}))

vi.mock('../ImageContent', () => ({
  ImageContent: () => <div>Image content</div>,
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
      <ChatbotPanel onClose={onClose} />
    </StarterSettingsContext.Provider>,
  )

  return { onClose }
}

describe('ChatbotPanel', () => {
  it('renders the AI chatbot panel with Chat content by default', () => {
    renderPanel()

    expect(screen.getByRole('dialog', { name: 'AI Chatbot' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Chat' })).toHaveAttribute('data-state', 'active')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Chat content')
    expect(screen.getByText('Chat content')).toBeInTheDocument()
  })

  it('calls onClose when the sheet close button is clicked', () => {
    const { onClose } = renderPanel()

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('switches between Chat and Image tabs', () => {
    renderPanel()

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Image' }), { key: 'Enter' })

    expect(screen.getByRole('tab', { name: 'Image' })).toHaveAttribute('data-state', 'active')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Image content')
    expect(screen.getByText('Image content')).toBeInTheDocument()
    expect(screen.queryByText('Chat content')).not.toBeInTheDocument()

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Chat' }), { key: 'Enter' })

    expect(screen.getByRole('tab', { name: 'Chat' })).toHaveAttribute('data-state', 'active')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Chat content')
    expect(screen.getByText('Chat content')).toBeInTheDocument()
  })
})
