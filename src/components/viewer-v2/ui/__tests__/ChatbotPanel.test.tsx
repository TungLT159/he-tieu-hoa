import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { chat, generateImage } from '@/services/ai'
import { renderStarter } from '@/test/starterRender'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ChatbotPanel } from '../ChatbotPanel'

vi.mock('@/services/ai', () => ({
  chat: vi.fn(),
  generateImage: vi.fn(),
}))

const chatMock = vi.mocked(chat)
const generateImageMock = vi.mocked(generateImage)

function renderPanel(onClose = vi.fn(), locale: 'en' | 'vi' = 'en') {
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
      <ChatbotPanel onClose={onClose} />
    </StarterSettingsContext.Provider>,
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

function clickTab(name: string) {
  const tab = screen.getByRole('tab', { name })
  fireEvent.keyDown(tab, { key: 'Enter' })
}

function chatInput() {
  return screen.getByRole('textbox', { name: 'Type your question...' })
}

function imageInput(name = 'Describe the image...') {
  return screen.getByRole('textbox', { name })
}

describe('ChatbotPanel', () => {
  beforeEach(() => {
    chatMock.mockResolvedValue('AI reply')
    generateImageMock.mockResolvedValue('https://example.com/image.png')
  })

  afterEach(() => {
    chatMock.mockReset()
    generateImageMock.mockReset()
    vi.restoreAllMocks()
  })

  it('renders the panel title and close button', () => {
    renderPanel()

    const dialog = screen.getByRole('dialog', { name: 'AI Chatbot' })
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'false')
    expect(dialog).toHaveClass('right-4', 'top-4')
    expect(screen.getByTestId('chatbot-panel-icon')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('AI Chatbot')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('renders localized Vietnamese chatbot labels', () => {
    renderPanel(vi.fn(), 'vi')

    expect(screen.getByRole('dialog', { name: 'Chatbot AI' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Nhập câu hỏi của bạn...' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gửi' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Trò chuyện' })).toBeInTheDocument()
    clickTab('Tạo ảnh')
    expect(screen.getByRole('textbox', { name: 'Mô tả hình ảnh...' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tạo ảnh' })).toBeInTheDocument()
  })

  it('renders Chat and Image tabs', () => {
    renderPanel()

    expect(screen.getByRole('tab', { name: 'Chat' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Image' })).toBeInTheDocument()
  })

  it('renders the Chat tab input and disabled send button initially', () => {
    renderPanel()

    expect(screen.getByRole('textbox', { name: 'Type your question...' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
  })

  it('does not send whitespace-only chat input', () => {
    renderPanel()

    fireEvent.change(chatInput(), { target: { value: '   ' } })
    fireEvent.submit(chatInput().closest('form') as HTMLFormElement)

    expect(chatMock).not.toHaveBeenCalled()
  })

  it('disables send while a chat request is loading', () => {
    const request = deferred<string>()
    chatMock.mockReturnValue(request.promise)
    renderPanel()

    fireEvent.change(chatInput(), { target: { value: 'Loading question' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
  })

  it('sends a chat message and displays the user text and AI reply', async () => {
    chatMock.mockResolvedValue('Answer text')
    renderPanel()

    fireEvent.change(chatInput(), { target: { value: 'What is digestion?' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(screen.getByText('What is digestion?')).toBeInTheDocument()
    expect(chatMock).toHaveBeenCalledWith('What is digestion?')
    expect(await screen.findByText('Answer text')).toBeInTheDocument()
  })

  it('renders user messages as right-aligned bubbles and bot messages as left-aligned bubbles', async () => {
    chatMock.mockResolvedValue('Bot bubble')
    renderPanel()

    fireEvent.change(chatInput(), { target: { value: 'User bubble' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(screen.getByTestId('chatbot-message-user-1')).toHaveClass('justify-end')
    expect(screen.getByText('User bubble')).toHaveClass('bg-primary', 'text-primary-foreground')
    expect(await screen.findByTestId('chatbot-message-bot-2')).toHaveClass('justify-start')
    expect(screen.getByText('Bot bubble')).toHaveClass('bg-muted', 'text-muted-foreground')
  })

  it('auto-scrolls to the bottom when chat messages update', async () => {
    const scrollIntoView = vi.fn()
    vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(scrollIntoView)
    chatMock.mockResolvedValue('Scrolled reply')
    renderPanel()

    fireEvent.change(chatInput(), { target: { value: 'Scroll question' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    await screen.findByText('Scrolled reply')
    expect(scrollIntoView).toHaveBeenCalled()
  })

  it('announces chat messages through a live status region', async () => {
    chatMock.mockResolvedValue('Accessible reply')
    renderPanel()

    const chatStatus = screen.getByRole('log', { name: 'Chat' })
    expect(chatStatus).toHaveAttribute('aria-live', 'polite')
    expect(chatStatus).toHaveAttribute('aria-relevant', 'additions')

    fireEvent.change(chatInput(), { target: { value: 'Accessible question' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(await screen.findByText('Accessible reply')).toBeInTheDocument()
  })

  it('preserves multi-turn chat history while mounted', async () => {
    chatMock.mockResolvedValueOnce('First reply').mockResolvedValueOnce('Second reply')
    renderPanel()

    fireEvent.change(chatInput(), { target: { value: 'First question' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(await screen.findByText('First reply')).toBeInTheDocument()

    fireEvent.change(chatInput(), { target: { value: 'Second question' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(await screen.findByText('Second reply')).toBeInTheDocument()
    expect(screen.getByText('First question')).toBeInTheDocument()
    expect(screen.getByText('First reply')).toBeInTheDocument()
    expect(screen.getByText('Second question')).toBeInTheDocument()
  })

  it('displays an error when chat fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    chatMock.mockRejectedValue(new Error('request failed'))
    renderPanel()

    fireEvent.change(chatInput(), { target: { value: 'Will this fail?' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('An error occurred. Please try again.')
  })

  it('logs chat API failures', async () => {
    const error = new Error('request failed')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    chatMock.mockRejectedValue(error)
    renderPanel()

    fireEvent.change(chatInput(), { target: { value: 'Will log failure?' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    await screen.findByRole('alert')
    expect(consoleError).toHaveBeenCalledWith(error)
  })

  it('retries a failed chat prompt without duplicating the user message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    chatMock.mockRejectedValueOnce(new Error('request failed')).mockResolvedValueOnce('Retry reply')
    renderPanel()

    fireEvent.change(chatInput(), { target: { value: 'Retry this chat' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('An error occurred. Please try again.')

    fireEvent.click(screen.getByRole('button', { name: 'Regenerate' }))

    expect(chatMock).toHaveBeenCalledTimes(2)
    expect(chatMock).toHaveBeenLastCalledWith('Retry this chat')
    expect(await screen.findByText('Retry reply')).toBeInTheDocument()
    expect(screen.getAllByText('Retry this chat')).toHaveLength(1)
  })

  it('sends a chat message with Enter', async () => {
    chatMock.mockResolvedValue('Enter reply')
    renderPanel()

    fireEvent.change(chatInput(), { target: { value: 'Enter question' } })
    fireEvent.submit(chatInput().closest('form') as HTMLFormElement)

    expect(chatMock).toHaveBeenCalledWith('Enter question')
    expect(await screen.findByText('Enter reply')).toBeInTheDocument()
  })

  it('renders the Image tab input and disabled generate button initially', () => {
    renderPanel()

    clickTab('Image')

    expect(screen.getByRole('textbox', { name: 'Describe the image...' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Generate' })).toBeDisabled()
  })

  it('does not generate whitespace-only image input', () => {
    renderPanel()

    clickTab('Image')
    fireEvent.change(imageInput(), { target: { value: '   ' } })
    fireEvent.submit(imageInput().closest('form') as HTMLFormElement)

    expect(generateImageMock).not.toHaveBeenCalled()
  })

  it('disables generate while an image request is loading', () => {
    const request = deferred<string>()
    generateImageMock.mockReturnValue(request.promise)
    renderPanel()

    clickTab('Image')
    fireEvent.change(imageInput(), { target: { value: 'Loading image' } })
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))

    expect(screen.getByRole('button', { name: 'Generate' })).toBeDisabled()
  })

  it('blocks Enter submissions while image generation is loading', () => {
    const request = deferred<string>()
    generateImageMock.mockReturnValue(request.promise)
    renderPanel()

    clickTab('Image')
    fireEvent.change(imageInput(), { target: { value: 'Loading image' } })
    fireEvent.submit(imageInput().closest('form') as HTMLFormElement)
    fireEvent.submit(imageInput().closest('form') as HTMLFormElement)

    expect(generateImageMock).toHaveBeenCalledTimes(1)
  })

  it('renders localized image loading text while generation is pending', () => {
    const request = deferred<string>()
    generateImageMock.mockReturnValue(request.promise)
    renderPanel()

    clickTab('Image')
    fireEvent.change(imageInput(), { target: { value: 'Loading image text' } })
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))

    expect(screen.getByTestId('chatbot-image-status')).toHaveTextContent('Generating image...')
  })

  it('renders Vietnamese image loading text while generation is pending', () => {
    const request = deferred<string>()
    generateImageMock.mockReturnValue(request.promise)
    renderPanel(vi.fn(), 'vi')

    clickTab('Tạo ảnh')
    fireEvent.change(imageInput('Mô tả hình ảnh...'), { target: { value: 'Ảnh đang tải' } })
    fireEvent.click(screen.getByRole('button', { name: 'Tạo ảnh' }))

    expect(screen.getByTestId('chatbot-image-status')).toHaveTextContent('Đang tạo ảnh...')
  })

  it('clears the previous image when a new generation starts', async () => {
    const second = deferred<string>()
    generateImageMock.mockResolvedValueOnce('https://example.com/first.png').mockReturnValueOnce(second.promise)
    renderPanel()

    clickTab('Image')
    fireEvent.change(imageInput(), { target: { value: 'First image' } })
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))
    expect(await screen.findByRole('img', { name: 'First image' })).toHaveAttribute('src', 'https://example.com/first.png')

    fireEvent.change(imageInput(), { target: { value: 'Second image' } })
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))

    expect(screen.queryByRole('img', { name: 'First image' })).not.toBeInTheDocument()
    expect(screen.getByTestId('chatbot-image-status')).toHaveTextContent('Generating image...')
  })

  it('generates an image and displays the image URL', async () => {
    generateImageMock.mockResolvedValue('https://example.com/digestive.png')
    renderPanel()

    clickTab('Image')
    fireEvent.change(imageInput(), { target: { value: 'Digestive diagram' } })
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))

    expect(generateImageMock).toHaveBeenCalledWith('Digestive diagram')
    const image = await screen.findByRole('img', { name: 'Digestive diagram' })
    expect(image).toHaveAttribute('src', 'https://example.com/digestive.png')
  })

  it('announces generated image results through a live status region', async () => {
    generateImageMock.mockResolvedValue('https://example.com/accessibility.png')
    renderPanel()

    clickTab('Image')
    const imageStatus = screen.getByTestId('chatbot-image-status')
    expect(imageStatus).toHaveAttribute('role', 'status')
    expect(imageStatus).toHaveAttribute('aria-live', 'polite')

    fireEvent.change(imageInput(), { target: { value: 'Accessible image' } })
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))

    expect(await screen.findByRole('img', { name: 'Accessible image' })).toHaveAttribute(
      'src',
      'https://example.com/accessibility.png',
    )
  })

  it('generates an image with Enter', async () => {
    generateImageMock.mockResolvedValue('https://example.com/enter.png')
    renderPanel()

    clickTab('Image')
    fireEvent.change(imageInput(), { target: { value: 'Enter image' } })
    fireEvent.submit(imageInput().closest('form') as HTMLFormElement)

    expect(generateImageMock).toHaveBeenCalledWith('Enter image')
    expect(await screen.findByRole('img', { name: 'Enter image' })).toHaveAttribute('src', 'https://example.com/enter.png')
  })

  it('displays an error when image generation fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    generateImageMock.mockRejectedValue(new Error('generation failed'))
    renderPanel()

    clickTab('Image')
    fireEvent.change(imageInput(), { target: { value: 'Broken prompt' } })
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('An error occurred. Please try again.')
  })

  it('logs image API failures', async () => {
    const error = new Error('generation failed')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    generateImageMock.mockRejectedValue(error)
    renderPanel()

    clickTab('Image')
    fireEvent.change(imageInput(), { target: { value: 'Will log image failure' } })
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))

    await screen.findByRole('alert')
    expect(consoleError).toHaveBeenCalledWith(error)
  })

  it('retries a failed image prompt and displays the generated image', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    generateImageMock.mockRejectedValueOnce(new Error('generation failed')).mockResolvedValueOnce('https://example.com/retry.png')
    renderPanel()

    clickTab('Image')
    fireEvent.change(imageInput(), { target: { value: 'Retry this image' } })
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('An error occurred. Please try again.')

    fireEvent.click(screen.getByRole('button', { name: 'Regenerate' }))

    expect(generateImageMock).toHaveBeenCalledTimes(2)
    expect(generateImageMock).toHaveBeenLastCalledWith('Retry this image')
    expect(await screen.findByRole('img', { name: 'Retry this image' })).toHaveAttribute('src', 'https://example.com/retry.png')
  })

  it('displays an error when the generated image fails to load', async () => {
    renderPanel()

    clickTab('Image')
    fireEvent.change(imageInput(), { target: { value: 'Bad image' } })
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))
    const image = await screen.findByRole('img', { name: 'Bad image' })

    fireEvent.error(image)

    expect(screen.getByRole('alert')).toHaveTextContent('An error occurred. Please try again.')
  })

  it('retries after generated image load failure', async () => {
    generateImageMock.mockResolvedValueOnce('https://example.com/broken.png').mockResolvedValueOnce('https://example.com/recovered.png')
    renderPanel()

    clickTab('Image')
    fireEvent.change(imageInput(), { target: { value: 'Recover image' } })
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))
    const image = await screen.findByRole('img', { name: 'Recover image' })
    fireEvent.error(image)

    expect(screen.getByRole('alert')).toHaveTextContent('An error occurred. Please try again.')
    fireEvent.click(screen.getByRole('button', { name: 'Regenerate' }))

    expect(generateImageMock).toHaveBeenCalledTimes(2)
    expect(generateImageMock).toHaveBeenLastCalledWith('Recover image')
    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Recover image' })).toHaveAttribute('src', 'https://example.com/recovered.png')
    })
  })

  it('calls onClose when close is clicked', () => {
    const onClose = vi.fn()
    renderPanel(onClose)

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalled()
  })

  it('does not render stale chat data after unmount', async () => {
    const request = deferred<string>()
    chatMock.mockReturnValue(request.promise)
    const { unmount } = renderPanel()

    fireEvent.change(chatInput(), { target: { value: 'Stale question' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    unmount()
    request.resolve('Stale reply')

    await Promise.resolve()

    expect(screen.queryByText('Stale reply')).not.toBeInTheDocument()
  })

  it('does not render stale image data after unmount', async () => {
    const request = deferred<string>()
    generateImageMock.mockReturnValue(request.promise)
    const { unmount } = renderPanel()

    clickTab('Image')
    fireEvent.change(imageInput(), { target: { value: 'Stale image' } })
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))
    unmount()
    request.resolve('https://example.com/stale.png')

    await Promise.resolve()

    expect(screen.queryByRole('img', { name: 'Stale image' })).not.toBeInTheDocument()
  })

  it('ignores load errors from a stale generated image', async () => {
    generateImageMock.mockResolvedValueOnce('https://example.com/first.png').mockResolvedValueOnce('https://example.com/second.png')
    renderPanel()

    clickTab('Image')
    fireEvent.change(imageInput(), { target: { value: 'First image' } })
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))
    const firstImage = await screen.findByRole('img', { name: 'First image' })

    fireEvent.change(imageInput(), { target: { value: 'Second image' } })
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))
    expect(await screen.findByRole('img', { name: 'Second image' })).toHaveAttribute('src', 'https://example.com/second.png')

    fireEvent.error(firstImage)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
