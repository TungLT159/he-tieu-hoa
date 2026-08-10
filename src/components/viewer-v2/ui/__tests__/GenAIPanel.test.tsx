import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { DEFAULT_GENAI_PROMPT, chat } from '@/services/ai'
import { renderStarter } from '@/test/starterRender'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GenAIPanel } from '../GenAIPanel'

vi.mock('@/services/ai', () => ({
  DEFAULT_GENAI_PROMPT: 'Test GenAI prompt',
  chat: vi.fn(),
}))

const chatMock = vi.mocked(chat)

function renderPanel(onClose = vi.fn()) {
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
      <GenAIPanel onClose={onClose} />
    </StarterSettingsContext.Provider>,
  )
}

function renderStrictPanel(onClose = vi.fn()) {
  return renderStarter(
    <StrictMode>
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
      </StarterSettingsContext.Provider>
    </StrictMode>,
  )
}

describe('GenAIPanel', () => {
  beforeEach(() => {
    chatMock.mockReturnValue(new Promise(() => undefined))
  })

  afterEach(() => {
    chatMock.mockReset()
  })

  it('renders the title and close button', () => {
    renderPanel()

    expect(screen.getByRole('dialog', { name: 'Digestive System Description' })).toBeInTheDocument()
    expect(screen.getByText('Digestive System Description')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('shows loading state on mount and calls chat with the default prompt', () => {
    renderPanel()

    expect(screen.getByRole('status')).toHaveTextContent('Generating description...')
    expect(chatMock).toHaveBeenCalledWith(DEFAULT_GENAI_PROMPT)
  })

  it('starts one initial request in StrictMode', () => {
    renderStrictPanel()

    expect(chatMock).toHaveBeenCalledTimes(1)
    expect(chatMock).toHaveBeenCalledWith(DEFAULT_GENAI_PROMPT)
  })

  it('displays the successful response text', async () => {
    chatMock.mockResolvedValue('First line\nSecond line')

    renderPanel()

    expect((await screen.findByRole('status')).textContent).toBe('First line\nSecond line')
  })

  it('displays an error state when chat fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    chatMock.mockRejectedValue(new Error('request failed'))

    renderPanel()

    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to generate description.')
    expect(consoleError).toHaveBeenCalled()

    consoleError.mockRestore()
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    renderPanel(onClose)

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalled()
  })

  it('regenerates the response when regenerate is clicked', async () => {
    chatMock.mockResolvedValueOnce('First response').mockResolvedValueOnce('Second response')

    renderPanel()
    expect(await screen.findByText('First response')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Regenerate' }))

    await waitFor(() => {
      expect(chatMock).toHaveBeenCalledTimes(2)
    })
    expect(chatMock).toHaveBeenLastCalledWith(DEFAULT_GENAI_PROMPT)
    expect(await screen.findByText('Second response')).toBeInTheDocument()
  })

  it('does not regenerate while a request is loading', () => {
    renderPanel()

    fireEvent.click(screen.getByRole('button', { name: 'Regenerate' }))

    expect(chatMock).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Regenerate' })).toBeDisabled()
  })

  it('ignores request completion after unmount', async () => {
    let resolveRequest: (value: string) => void = () => undefined
    chatMock.mockReturnValue(new Promise((resolve) => {
      resolveRequest = resolve
    }))

    const { unmount } = renderPanel()
    expect(screen.getByRole('status')).toHaveTextContent('Generating description...')

    unmount()
    resolveRequest('Stale response')

    await Promise.resolve()

    expect(screen.queryByText('Stale response')).not.toBeInTheDocument()
  })
})
