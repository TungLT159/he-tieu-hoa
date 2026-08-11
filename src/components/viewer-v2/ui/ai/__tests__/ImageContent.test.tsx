import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { useImageDownload } from '@/hooks/useImageDownload'
import { generateImage } from '@/services/ai'
import { renderStarter } from '@/test/starterRender'
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ImageContent } from '../ImageContent'

vi.mock('@/services/ai', () => ({
  generateImage: vi.fn(),
}))

vi.mock('@/hooks/useImageDownload', () => ({
  useImageDownload: vi.fn(),
}))

const generateImageMock = vi.mocked(generateImage)
const useImageDownloadMock = vi.mocked(useImageDownload)
const downloadMock = vi.fn()

function renderImageContent(locale: 'en' | 'vi' = 'en') {
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
      <ImageContent />
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

function imageInput(name = 'Describe the image...') {
  return screen.getByRole('textbox', { name })
}

describe('ImageContent', () => {
  beforeEach(() => {
    generateImageMock.mockResolvedValue('https://example.com/image.png')
    downloadMock.mockResolvedValue(undefined)
    useImageDownloadMock.mockReturnValue({
      download: downloadMock,
      isDownloading: false,
      error: null,
    })
  })

  afterEach(() => {
    generateImageMock.mockReset()
    downloadMock.mockReset()
    useImageDownloadMock.mockReset()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders localized prompt input and a disabled generate button', () => {
    renderImageContent('vi')

    expect(screen.getByRole('textbox', { name: 'Mô tả hình ảnh...' })).toHaveAttribute(
      'placeholder',
      'Mô tả hình ảnh...',
    )
    expect(screen.getByRole('button', { name: 'Tạo ảnh' })).toBeDisabled()
  })

  it('does not generate a whitespace-only prompt', () => {
    renderImageContent()

    fireEvent.change(imageInput(), { target: { value: '   ' } })
    fireEvent.submit(imageInput().closest('form') as HTMLFormElement)

    expect(generateImageMock).not.toHaveBeenCalled()
  })

  it('shows a localized image skeleton while generation is pending', async () => {
    const request = deferred<string>()
    generateImageMock.mockReturnValue(request.promise)
    renderImageContent()

    fireEvent.change(imageInput(), { target: { value: 'Loading image' } })
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))

    expect(screen.getByRole('button', { name: 'Generate' })).toBeDisabled()
    expect(screen.getByRole('status', { name: 'Generating image...' })).toBeInTheDocument()

    await act(async () => {
      request.resolve('https://example.com/generated.png')
      await request.promise
    })

    await waitFor(() => {
      expect(screen.queryByRole('status', { name: 'Generating image...' })).not.toBeInTheDocument()
    })
  })

  it('displays a generated image with an accessible lightbox trigger and downloads through the hook', async () => {
    vi.setSystemTime(new Date('2026-08-10T00:00:00.000Z'))
    generateImageMock.mockResolvedValue('https://example.com/digestive.png')
    renderImageContent()

    fireEvent.change(imageInput(), { target: { value: 'Digestive diagram' } })
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))

    const image = await screen.findByRole('img', { name: 'Digestive diagram' })
    const lightboxTrigger = screen.getByRole('button', { name: 'Open image: Digestive diagram' })
    expect(generateImageMock).toHaveBeenCalledWith('Digestive diagram')
    expect(image).toHaveAttribute('src', 'https://example.com/digestive.png')
    expect(lightboxTrigger).toHaveAttribute('title', 'Open image: Digestive diagram')

    fireEvent.click(screen.getByRole('button', { name: 'Download' }))

    expect(downloadMock).toHaveBeenCalledWith(
      'https://example.com/digestive.png',
      'ai-image-1786320000000.png',
    )
  })

  it('opens the image lightbox from a keyboard-focusable image trigger', async () => {
    generateImageMock.mockResolvedValue('https://example.com/lightbox.png')
    renderImageContent()

    fireEvent.change(imageInput(), { target: { value: 'Open lightbox' } })
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))

    await screen.findByRole('img', { name: 'Open lightbox' })
    const lightboxTrigger = screen.getByRole('button', { name: 'Open image: Open lightbox' })
    lightboxTrigger.focus()
    expect(lightboxTrigger).toHaveFocus()

    fireEvent.click(lightboxTrigger)

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('img', { name: 'Open lightbox' })).toHaveAttribute(
      'src',
      'https://example.com/lightbox.png',
    )
    expect(within(dialog).getByRole('button', { name: 'Download' })).toBeInTheDocument()
  })

  it('disables download actions while downloading', async () => {
    useImageDownloadMock.mockReturnValue({
      download: downloadMock,
      isDownloading: true,
      error: null,
    })
    generateImageMock.mockResolvedValue('https://example.com/downloading.png')
    renderImageContent()

    fireEvent.change(imageInput(), { target: { value: 'Downloading image' } })
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))
    await screen.findByRole('img', { name: 'Downloading image' })

    expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Open image: Downloading image' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Download' }))

    expect(downloadMock).not.toHaveBeenCalled()
  })

  it('renders localized download errors from the image download hook', async () => {
    useImageDownloadMock.mockReturnValue({
      download: downloadMock,
      isDownloading: false,
      error: 'network failed',
    })
    generateImageMock.mockResolvedValue('https://example.com/download-error.png')
    renderImageContent('vi')

    fireEvent.change(imageInput('Mô tả hình ảnh...'), { target: { value: 'Lỗi tải xuống' } })
    fireEvent.click(screen.getByRole('button', { name: 'Tạo ảnh' }))
    await screen.findByRole('img', { name: 'Lỗi tải xuống' })

    expect(screen.getByRole('alert')).toHaveTextContent('Không thể tải ảnh xuống. Vui lòng thử lại.')
  })

  it('shows an error and retries the failed prompt after an API failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    generateImageMock.mockRejectedValueOnce(new Error('generation failed')).mockResolvedValueOnce('https://example.com/retry.png')
    renderImageContent()

    fireEvent.change(imageInput(), { target: { value: 'Retry this image' } })
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('An error occurred. Please try again.')

    fireEvent.click(screen.getByRole('button', { name: 'Regenerate' }))

    expect(generateImageMock).toHaveBeenCalledTimes(2)
    expect(generateImageMock).toHaveBeenLastCalledWith('Retry this image')
    expect(await screen.findByRole('img', { name: 'Retry this image' })).toHaveAttribute('src', 'https://example.com/retry.png')
  })

  it('handles generated image load errors as retryable image errors', async () => {
    generateImageMock.mockResolvedValueOnce('https://example.com/broken.png').mockResolvedValueOnce('https://example.com/recovered.png')
    renderImageContent()

    fireEvent.change(imageInput(), { target: { value: 'Recover image' } })
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))
    const image = await screen.findByRole('img', { name: 'Recover image' })

    fireEvent.error(image)

    expect(screen.getByRole('alert')).toHaveTextContent('An error occurred. Please try again.')
    expect(screen.queryByRole('img', { name: 'Recover image' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Regenerate' }))

    expect(generateImageMock).toHaveBeenCalledTimes(2)
    expect(generateImageMock).toHaveBeenLastCalledWith('Recover image')
    expect(await screen.findByRole('img', { name: 'Recover image' })).toHaveAttribute('src', 'https://example.com/recovered.png')
  })

  it('does not render generated image data after unmount', async () => {
    const request = deferred<string>()
    generateImageMock.mockReturnValue(request.promise)
    const { unmount } = renderImageContent()

    fireEvent.change(imageInput(), { target: { value: 'Stale image' } })
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))
    unmount()

    await act(async () => {
      request.resolve('https://example.com/stale.png')
      await request.promise
    })

    expect(screen.queryByRole('img', { name: 'Stale image' })).not.toBeInTheDocument()
  })

})
