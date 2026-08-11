import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useImageDownload } from './useImageDownload'

const mockDownloadImage = vi.fn()

vi.mock('@/services/imageDownload', () => ({
  downloadImage: (...args: unknown[]) => mockDownloadImage(...args),
}))

describe('useImageDownload', () => {
  beforeEach(() => {
    mockDownloadImage.mockReset()
    vi.useRealTimers()
  })

  it('downloads an image with a provided filename', async () => {
    mockDownloadImage.mockResolvedValueOnce(undefined)
    const { result } = renderHook(() => useImageDownload())

    await act(async () => {
      await result.current.download('https://example.com/image.png', 'image.png')
    })

    expect(mockDownloadImage).toHaveBeenCalledWith('https://example.com/image.png', 'image.png')
    expect(result.current.isDownloading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('uses a timestamped default filename when no filename is provided', async () => {
    vi.setSystemTime(new Date('2026-08-10T00:00:00.000Z'))
    mockDownloadImage.mockResolvedValueOnce(undefined)
    const { result } = renderHook(() => useImageDownload())

    await act(async () => {
      await result.current.download('https://example.com/image.png')
    })

    expect(mockDownloadImage).toHaveBeenCalledWith(
      'https://example.com/image.png',
      'ai-image-1786320000000.png',
    )
  })

  it('sets and clears download state around a pending download', async () => {
    let resolveDownload: () => void = () => undefined
    mockDownloadImage.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveDownload = resolve
      }),
    )
    const { result } = renderHook(() => useImageDownload())

    let downloadPromise: Promise<void>
    act(() => {
      downloadPromise = result.current.download('https://example.com/image.png')
    })

    expect(result.current.isDownloading).toBe(true)

    await act(async () => {
      resolveDownload()
      await downloadPromise
    })

    expect(result.current.isDownloading).toBe(false)
  })

  it('stores the error message when download fails', async () => {
    mockDownloadImage.mockRejectedValueOnce(new Error('network failed'))
    const { result } = renderHook(() => useImageDownload())

    await act(async () => {
      await result.current.download('https://example.com/image.png')
    })

    expect(result.current.error).toBe('network failed')
    expect(result.current.isDownloading).toBe(false)
  })

  it('falls back to a generic error for non-Error failures', async () => {
    mockDownloadImage.mockRejectedValueOnce('failed')
    const { result } = renderHook(() => useImageDownload())

    await act(async () => {
      await result.current.download('https://example.com/image.png')
    })

    expect(result.current.error).toBe('Download failed')
  })
})
