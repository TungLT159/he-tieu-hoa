import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { useChatHistory } from '@/hooks/useChatHistory'
import { chat } from '@/services/ai'
import { renderStarter } from '@/test/starterRender'
import { act, fireEvent, renderHook, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ChatContent } from '../ChatContent'

vi.mock('@/services/ai', () => ({
  chat: vi.fn(),
}))

const chatMock = vi.mocked(chat)

function renderChatContent(locale: 'en' | 'vi' = 'en') {
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
      <ChatContent />
    </StarterSettingsContext.Provider>,
  )
}

function clearChatHistory() {
  const { result, unmount } = renderHook(() => useChatHistory())

  act(() => {
    result.current.clearMessages()
  })

  unmount()
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

function chatInput(name = 'Type your question...') {
  return screen.getByRole('textbox', { name })
}

describe('ChatContent', () => {
  beforeEach(() => {
    clearChatHistory()
    chatMock.mockResolvedValue('AI reply')
  })

  afterEach(() => {
    chatMock.mockReset()
    vi.restoreAllMocks()
  })

  it('renders the chat log, localized input, and disabled send button', () => {
    renderChatContent('vi')

    expect(screen.getByRole('log', { name: 'Trò chuyện' })).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('textbox', { name: 'Nhập câu hỏi của bạn...' })).toHaveAttribute(
      'placeholder',
      'Nhập câu hỏi của bạn...',
    )
    expect(screen.getByRole('button', { name: 'Gửi' })).toBeDisabled()
  })

  it('sends a message and renders user and bot bubbles', async () => {
    chatMock.mockResolvedValue('Bot answer')
    renderChatContent()

    fireEvent.change(chatInput(), { target: { value: 'Hello there' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(chatMock).toHaveBeenCalledWith('Hello there')
    expect(screen.getByLabelText('You: Hello there')).toHaveClass('justify-end')
    expect(screen.getByText('Hello there')).toHaveClass('bg-primary', 'text-primary-foreground')

    expect(await screen.findByLabelText('Assistant: Bot answer')).toHaveClass('justify-start')
    expect(screen.getByText('Bot answer')).toHaveClass('whitespace-pre-wrap', 'bg-muted')
  })

  it('renders localized sender context for message bubbles', async () => {
    chatMock.mockResolvedValue('Câu trả lời')
    renderChatContent('vi')

    fireEvent.change(chatInput('Nhập câu hỏi của bạn...'), { target: { value: 'Xin chào' } })
    fireEvent.click(screen.getByRole('button', { name: 'Gửi' }))

    expect(screen.getByLabelText('Bạn: Xin chào')).toHaveClass('justify-end')
    expect(await screen.findByLabelText('Trợ lý: Câu trả lời')).toHaveClass('justify-start')
  })

  it('auto-scrolls to the bottom when chat messages update', async () => {
    const scrollIntoView = vi.fn()
    vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(scrollIntoView)
    chatMock.mockResolvedValue('Scrolled answer')
    renderChatContent()

    fireEvent.change(chatInput(), { target: { value: 'Scroll question' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(screen.getByText('Scroll question')).toBeInTheDocument()
    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalled()
    })
    expect(await screen.findByText('Scrolled answer')).toBeInTheDocument()
    expect(scrollIntoView).toHaveBeenCalledTimes(2)
  })

  it('shows the typing indicator while a chat request is loading', async () => {
    const request = deferred<string>()
    chatMock.mockReturnValue(request.promise)
    renderChatContent()

    fireEvent.change(chatInput(), { target: { value: 'Loading question' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(screen.getByRole('status', { name: 'AI is thinking' })).toBeInTheDocument()

    await act(async () => {
      request.resolve('Loaded answer')
      await request.promise
    })

    await waitFor(() => {
      expect(screen.queryByRole('status', { name: 'AI is thinking' })).not.toBeInTheDocument()
    })
  })

  it('shows an error and retries the failed prompt without duplicating it', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    chatMock.mockRejectedValueOnce(new Error('request failed')).mockResolvedValueOnce('Retry answer')
    renderChatContent()

    fireEvent.change(chatInput(), { target: { value: 'Retry this chat' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('An error occurred. Please try again.')

    fireEvent.click(screen.getByRole('button', { name: 'Regenerate' }))

    expect(chatMock).toHaveBeenCalledTimes(2)
    expect(chatMock).toHaveBeenLastCalledWith('Retry this chat')
    expect(await screen.findByText('Retry answer')).toBeInTheDocument()
    expect(screen.getAllByText('Retry this chat')).toHaveLength(1)
  })

  it('keeps chat history after unmount and remount', async () => {
    chatMock.mockResolvedValue('Persistent answer')
    const firstRender = renderChatContent()

    fireEvent.change(chatInput(), { target: { value: 'Persistent question' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(await screen.findByText('Persistent answer')).toBeInTheDocument()

    firstRender.unmount()
    renderChatContent()

    expect(screen.getByText('Persistent question')).toBeInTheDocument()
    expect(screen.getByText('Persistent answer')).toBeInTheDocument()
  })

  it('does not add a bot message when the chat promise resolves after unmount', async () => {
    const request = deferred<string>()
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    chatMock.mockReturnValue(request.promise)
    const { unmount } = renderChatContent()

    fireEvent.change(chatInput(), { target: { value: 'Stale question' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    unmount()

    await act(async () => {
      request.resolve('Stale answer')
      await request.promise
    })

    renderChatContent()

    expect(screen.getByText('Stale question')).toBeInTheDocument()
    expect(screen.queryByText('Stale answer')).not.toBeInTheDocument()
    expect(consoleError).not.toHaveBeenCalled()
  })
})
