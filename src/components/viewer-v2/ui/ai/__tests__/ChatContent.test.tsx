import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { useChatHistory } from '@/hooks/useChatHistory'
import { chat } from '@/services/ai'
import { renderStarter } from '@/test/starterRender'
import { act, fireEvent, renderHook, screen } from '@testing-library/react'
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

async function flushPromises() {
  await act(async () => {
    await Promise.resolve()
  })
}

function finishTyping(text: string) {
  act(() => {
    vi.advanceTimersByTime(text.length * 30)
  })
}

describe('ChatContent', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    clearChatHistory()
    chatMock.mockResolvedValue('AI reply')
  })

  afterEach(() => {
    vi.useRealTimers()
    chatMock.mockReset()
    vi.restoreAllMocks()
  })

  it('renders the chat log, localized input, and disabled send button', () => {
    renderChatContent('vi')

    const log = screen.getByRole('log', { name: 'Trò chuyện' })

    expect(log).toHaveAttribute('aria-live', 'polite')
    expect(log.parentElement).toHaveClass('min-h-0', 'flex-1', 'overflow-y-auto')
    expect(screen.getByRole('button', { name: 'Gửi' }).closest('form')).toHaveClass('shrink-0')
    expect(screen.getByRole('textbox', { name: 'Nhập câu hỏi của bạn...' })).toHaveAttribute(
      'placeholder',
      'Nhập câu hỏi của bạn...',
    )
    expect(screen.getByRole('button', { name: 'Gửi' })).toBeDisabled()
  })

  it('sends a message and renders user and bot bubbles gradually without duplicates', async () => {
    chatMock.mockResolvedValue('Bot answer')
    renderChatContent()

    fireEvent.change(chatInput(), { target: { value: 'Hello there' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(chatMock).toHaveBeenCalledWith('Hello there')
    expect(screen.getByLabelText('You: Hello there')).toHaveClass('justify-end')
    expect(screen.getByText('Hello there')).toHaveClass('bg-primary', 'text-primary-foreground')

    await flushPromises()

    expect(screen.queryByText('Bot answer')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(30)
    })

    expect(screen.getByText('B')).toHaveClass('whitespace-pre-wrap', 'bg-muted')

    finishTyping('ot answer')

    expect(screen.getByLabelText('Assistant: Bot answer')).toHaveClass('justify-start')
    expect(screen.getByText('Bot answer')).toHaveClass('whitespace-pre-wrap', 'bg-muted')
    expect(screen.getAllByText('Bot answer')).toHaveLength(1)
  })

  it('renders localized sender context for message bubbles', async () => {
    chatMock.mockResolvedValue('Câu trả lời')
    renderChatContent('vi')

    fireEvent.change(chatInput('Nhập câu hỏi của bạn...'), { target: { value: 'Xin chào' } })
    fireEvent.click(screen.getByRole('button', { name: 'Gửi' }))

    expect(screen.getByLabelText('Bạn: Xin chào')).toHaveClass('justify-end')
    await flushPromises()
    finishTyping('Câu trả lời')

    expect(screen.getByLabelText('Trợ lý: Câu trả lời')).toHaveClass('justify-start')
  })

  it('auto-scrolls to the bottom when chat messages update', async () => {
    const scrollIntoView = vi.fn()
    vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(scrollIntoView)
    chatMock.mockResolvedValue('Scrolled answer')
    renderChatContent()

    fireEvent.change(chatInput(), { target: { value: 'Scroll question' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(screen.getByText('Scroll question')).toBeInTheDocument()
    expect(scrollIntoView).toHaveBeenCalled()
    const callCountAfterUserMessage = scrollIntoView.mock.calls.length
    await flushPromises()
    finishTyping('Scrolled answer')

    expect(screen.getByText('Scrolled answer')).toBeInTheDocument()
    expect(scrollIntoView.mock.calls.length).toBeGreaterThan(callCountAfterUserMessage)
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

    expect(screen.queryByRole('status', { name: 'AI is thinking' })).not.toBeInTheDocument()
  })

  it('shows an error and retries the failed prompt without duplicating it', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    chatMock.mockRejectedValueOnce(new Error('request failed')).mockResolvedValueOnce('Retry answer')
    renderChatContent()

    fireEvent.change(chatInput(), { target: { value: 'Retry this chat' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    await flushPromises()

    expect(screen.getByRole('alert')).toHaveTextContent('An error occurred. Please try again.')

    fireEvent.click(screen.getByRole('button', { name: 'Regenerate' }))

    expect(chatMock).toHaveBeenCalledTimes(2)
    expect(chatMock).toHaveBeenLastCalledWith('Retry this chat')
    await flushPromises()
    finishTyping('Retry answer')

    expect(screen.getByText('Retry answer')).toBeInTheDocument()
    expect(screen.getAllByText('Retry this chat')).toHaveLength(1)
  })

  it('keeps chat history after unmount and remount', async () => {
    chatMock.mockResolvedValue('Persistent answer')
    const firstRender = renderChatContent()

    fireEvent.change(chatInput(), { target: { value: 'Persistent question' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    await flushPromises()
    finishTyping('Persistent answer')

    expect(screen.getByText('Persistent answer')).toBeInTheDocument()

    firstRender.unmount()
    renderChatContent()

    expect(screen.getByText('Persistent question')).toBeInTheDocument()
    expect(screen.getByText('Persistent answer')).toBeInTheDocument()
  })

  it('saves a returned bot answer when the panel closes before typewriter finishes', async () => {
    chatMock.mockResolvedValue('Answer saved after close')
    const firstRender = renderChatContent()

    fireEvent.change(chatInput(), { target: { value: 'Close during typing' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    await flushPromises()

    act(() => {
      vi.advanceTimersByTime(30)
    })
    expect(screen.getByText('A')).toBeInTheDocument()

    firstRender.unmount()
    renderChatContent()

    expect(screen.getByText('Close during typing')).toBeInTheDocument()
    expect(screen.getByText('Answer saved after close')).toBeInTheDocument()
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
