import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { DEFAULT_GENAI_PROMPT, chat } from '@/services/ai'
import { renderStarter } from '@/test/starterRender'
import { act, fireEvent, screen } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GenAIContent } from '../GenAIContent'

vi.mock('@/services/ai', () => ({
  DEFAULT_GENAI_PROMPT: 'Test GenAI prompt',
  chat: vi.fn(),
}))

const chatMock = vi.mocked(chat)

function renderGenAIContent(locale: 'en' | 'vi' = 'en') {
  return renderStarter(
    <StarterSettingsContext.Provider
      value={{
        appVersion: '0.1.0',
        locale,
        resolvedThemeMode: 'light',
        settings: DEFAULT_STARTER_SETTINGS,
        updateSettings: vi.fn(),
      }}
    >
      <GenAIContent />
    </StarterSettingsContext.Provider>,
  )
}

function renderRefreshableGenAIContent(refreshKey: string | number) {
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
      <GenAIContent refreshKey={refreshKey} />
    </StarterSettingsContext.Provider>,
  )
}

function renderStrictGenAIContent() {
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
        <GenAIContent />
      </StarterSettingsContext.Provider>
    </StrictMode>,
  )
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined
  let reject: (error: unknown) => void = () => undefined
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve
    reject = promiseReject
  })

  return { promise, resolve, reject }
}

describe('GenAIContent', () => {
  beforeEach(() => {
    chatMock.mockReturnValue(new Promise(() => undefined))
  })

  afterEach(() => {
    chatMock.mockReset()
    vi.restoreAllMocks()
  })

  it('auto-fetches the default prompt on mount and shows localized loading state', () => {
    renderGenAIContent('vi')

    expect(chatMock).toHaveBeenCalledTimes(1)
    expect(chatMock).toHaveBeenCalledWith(DEFAULT_GENAI_PROMPT)
    expect(screen.getByText('Đang tạo mô tả...')).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'AI is thinking' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tạo lại' })).toBeDisabled()
  })

  it('starts one initial request in StrictMode', () => {
    renderStrictGenAIContent()

    expect(chatMock).toHaveBeenCalledTimes(1)
    expect(chatMock).toHaveBeenCalledWith(DEFAULT_GENAI_PROMPT)
  })

  it('renders the response as pre-wrapped scrollable content', async () => {
    chatMock.mockResolvedValue('First line\nSecond line')

    renderGenAIContent()

    const response = await screen.findByText(
      (_, element) => element?.tagName.toLowerCase() === 'p' && element.textContent === 'First line\nSecond line',
    )
    expect(response).toHaveClass('whitespace-pre-wrap')
    expect(response.closest('[data-testid="genai-response-scroll"]')).toHaveClass(
      'min-h-0',
      'flex-1',
      'overflow-y-auto',
    )
    expect(screen.getByRole('button', { name: 'Regenerate' }).parentElement).toHaveClass('shrink-0')
  })

  it('regenerates the response and disables the button while loading', async () => {
    const nextRequest = deferred<string>()
    chatMock.mockResolvedValueOnce('First response').mockReturnValueOnce(nextRequest.promise)
    renderGenAIContent()

    expect(await screen.findByText('First response')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Regenerate' }))

    expect(chatMock).toHaveBeenCalledTimes(2)
    expect(chatMock).toHaveBeenLastCalledWith(DEFAULT_GENAI_PROMPT)
    expect(screen.getByRole('button', { name: 'Regenerate' })).toBeDisabled()

    await act(async () => {
      nextRequest.resolve('Second response')
      await nextRequest.promise
    })

    expect(await screen.findByText('Second response')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Regenerate' })).toBeEnabled()
  })

  it('keeps the latest response when two requests resolve out of order', async () => {
    const olderRequest = deferred<string>()
    const latestRequest = deferred<string>()
    chatMock.mockResolvedValueOnce('Initial response')
      .mockReturnValueOnce(olderRequest.promise)
      .mockReturnValueOnce(latestRequest.promise)
    const { rerender } = renderRefreshableGenAIContent(0)

    expect(await screen.findByText('Initial response')).toBeInTheDocument()

    rerender(
      <StarterSettingsContext.Provider
        value={{
          appVersion: '0.1.0',
          locale: 'en',
          resolvedThemeMode: 'light',
          settings: DEFAULT_STARTER_SETTINGS,
          updateSettings: vi.fn(),
        }}
      >
        <GenAIContent refreshKey={1} />
      </StarterSettingsContext.Provider>,
    )
    rerender(
      <StarterSettingsContext.Provider
        value={{
          appVersion: '0.1.0',
          locale: 'en',
          resolvedThemeMode: 'light',
          settings: DEFAULT_STARTER_SETTINGS,
          updateSettings: vi.fn(),
        }}
      >
        <GenAIContent refreshKey={2} />
      </StarterSettingsContext.Provider>,
    )

    expect(chatMock).toHaveBeenCalledTimes(3)

    await act(async () => {
      latestRequest.resolve('Latest response')
      await latestRequest.promise
    })

    expect(await screen.findByText('Latest response')).toBeInTheDocument()

    await act(async () => {
      olderRequest.resolve('Older response')
      await olderRequest.promise
    })

    expect(screen.getByText('Latest response')).toBeInTheDocument()
    expect(screen.queryByText('Older response')).not.toBeInTheDocument()
  })

  it('renders a localized error alert when generation fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    chatMock.mockRejectedValue(new Error('request failed'))

    renderGenAIContent('vi')

    expect(await screen.findByRole('alert')).toHaveTextContent('Không thể tạo mô tả.')
  })

  it('does not render a response that resolves after unmount', async () => {
    const request = deferred<string>()
    chatMock.mockReturnValue(request.promise)
    const { unmount } = renderGenAIContent()

    unmount()

    await act(async () => {
      request.resolve('Stale response')
      await request.promise
    })

    expect(screen.queryByText('Stale response')).not.toBeInTheDocument()
  })
})
