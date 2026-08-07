import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { captureScreenshot } from '../screenshot'

describe('captureScreenshot', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function mockPlatform(platform: string, userAgent = platform): void {
    vi.spyOn(window.navigator, 'platform', 'get').mockReturnValue(platform)
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(userAgent)
  }

  it('opens the Windows screen clipping tool', () => {
    mockPlatform('Win32')
    const openedWindow = {} as Window
    const openSpy = vi
      .spyOn(window, 'open')
      .mockImplementation(() => openedWindow)
    const querySelectorSpy = vi.spyOn(document, 'querySelector')

    captureScreenshot()

    expect(openSpy).toHaveBeenCalledWith(
      'ms-screenclip:',
      '_blank',
      'noopener,noreferrer',
    )
    expect(querySelectorSpy).not.toHaveBeenCalled()
  })

  it('falls back to downloading a PNG when Windows screen clipping is blocked', () => {
    mockPlatform('Win32')
    const canvas = document.createElement('canvas')
    const toDataURL = vi.fn().mockReturnValue('data:image/png;base64,abc123')
    const mockClick = vi.fn()
    const mockAnchor = {
      href: '',
      download: '',
      click: mockClick,
    } as unknown as HTMLAnchorElement

    vi.spyOn(window, 'open').mockImplementation(() => null)
    vi.spyOn(document, 'querySelector').mockReturnValue(canvas)
    vi.spyOn(canvas, 'toDataURL').mockImplementation(toDataURL)
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor)
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(
      '2026-08-07T12:00:00.000Z',
    )

    captureScreenshot()

    expect(toDataURL).toHaveBeenCalledWith('image/png')
    expect(mockAnchor.href).toBe('data:image/png;base64,abc123')
    expect(mockAnchor.download).toBe(
      'hetieuhoa-screenshot-2026-08-07T12-00-00.000Z.png',
    )
    expect(mockClick).toHaveBeenCalled()
  })

  it('falls back to downloading a PNG when Windows screen clipping throws', () => {
    mockPlatform('Win32')
    const canvas = document.createElement('canvas')
    const toDataURL = vi.fn().mockReturnValue('data:image/png;base64,abc123')
    const mockClick = vi.fn()
    const mockAnchor = {
      href: '',
      download: '',
      click: mockClick,
    } as unknown as HTMLAnchorElement

    vi.spyOn(window, 'open').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(document, 'querySelector').mockReturnValue(canvas)
    vi.spyOn(canvas, 'toDataURL').mockImplementation(toDataURL)
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor)
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(
      '2026-08-07T12:00:00.000Z',
    )

    captureScreenshot()

    expect(toDataURL).toHaveBeenCalledWith('image/png')
    expect(mockAnchor.href).toBe('data:image/png;base64,abc123')
    expect(mockClick).toHaveBeenCalled()
  })

  it('falls back to downloading a PNG from the viewer canvas', () => {
    mockPlatform('Linux x86_64')
    const canvas = document.createElement('canvas')
    const toDataURL = vi.fn().mockReturnValue('data:image/png;base64,abc123')
    const mockClick = vi.fn()
    const mockAnchor = {
      href: '',
      download: '',
      click: mockClick,
    } as unknown as HTMLAnchorElement

    const querySelectorSpy = vi
      .spyOn(document, 'querySelector')
      .mockReturnValue(canvas)
    vi.spyOn(canvas, 'toDataURL').mockImplementation(toDataURL)
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor)
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(
      '2026-08-07T12:00:00.000Z',
    )

    captureScreenshot()

    expect(querySelectorSpy).toHaveBeenCalledWith('[data-viewer-canvas]')
    expect(toDataURL).toHaveBeenCalledWith('image/png')
    expect(mockAnchor.href).toBe('data:image/png;base64,abc123')
    expect(mockAnchor.download).toBe(
      'hetieuhoa-screenshot-2026-08-07T12-00-00.000Z.png',
    )
    expect(mockClick).toHaveBeenCalled()
  })

  it('logs a warning when canvas is not found', () => {
    mockPlatform('Linux x86_64')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(document, 'querySelector').mockReturnValue(null)

    captureScreenshot()

    expect(warnSpy).toHaveBeenCalledWith(
      'Viewer canvas not found for screenshot',
    )
  })

  it('logs a warning when the viewer element is not a canvas', () => {
    mockPlatform('Linux x86_64')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(document, 'querySelector').mockReturnValue(
      document.createElement('div'),
    )

    captureScreenshot()

    expect(warnSpy).toHaveBeenCalledWith(
      'Viewer canvas not found for screenshot',
    )
  })

  it('logs a warning when the viewer canvas is empty', () => {
    mockPlatform('Linux x86_64')
    const canvas = document.createElement('canvas')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const toDataURL = vi.fn()

    canvas.width = 0
    canvas.height = 150
    vi.spyOn(document, 'querySelector').mockReturnValue(canvas)
    vi.spyOn(canvas, 'toDataURL').mockImplementation(toDataURL)

    captureScreenshot()

    expect(warnSpy).toHaveBeenCalledWith(
      'Viewer canvas is empty for screenshot',
    )
    expect(toDataURL).not.toHaveBeenCalled()
  })

  it('logs a warning when screenshot export fails', () => {
    mockPlatform('Linux x86_64')
    const canvas = document.createElement('canvas')
    const error = new Error('export failed')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    vi.spyOn(document, 'querySelector').mockReturnValue(canvas)
    vi.spyOn(canvas, 'toDataURL').mockImplementation(() => {
      throw error
    })

    captureScreenshot()

    expect(warnSpy).toHaveBeenCalledWith(
      'Viewer screenshot capture failed',
      error,
    )
  })
})
