import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { invoke } = vi.hoisted(() => ({
  invoke: vi.fn(),
}))

vi.mock('@tauri-apps/api/core', () => ({ invoke }))

import { captureScreenshot } from '../screenshot'

describe('captureScreenshot', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    invoke.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    invoke.mockReset()
  })

  it('opens the native screenshot tool through Tauri', async () => {
    invoke.mockResolvedValue(undefined)
    const querySelectorSpy = vi.spyOn(document, 'querySelector')

    await captureScreenshot()

    expect(invoke).toHaveBeenCalledWith('open_system_screenshot_tool')
    expect(querySelectorSpy).not.toHaveBeenCalled()
  })

  it('falls back to downloading a PNG when Tauri invoke fails', async () => {
    invoke.mockRejectedValue(new Error('unavailable'))
    const canvas = document.createElement('canvas')
    const toDataURL = vi.fn().mockReturnValue('data:image/png;base64,abc123')
    const mockClick = vi.fn()
    const mockAnchor = {
      href: '',
      download: '',
      click: mockClick,
    } as unknown as HTMLAnchorElement

    vi.spyOn(document, 'querySelector').mockReturnValue(canvas)
    vi.spyOn(canvas, 'toDataURL').mockImplementation(toDataURL)
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor)
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(
      '2026-08-07T12:00:00.000Z',
    )

    await captureScreenshot()

    expect(invoke).toHaveBeenCalledWith('open_system_screenshot_tool')
    expect(toDataURL).toHaveBeenCalledWith('image/png')
    expect(mockAnchor.href).toBe('data:image/png;base64,abc123')
    expect(mockAnchor.download).toBe(
      'hetieuhoa-screenshot-2026-08-07T12-00-00.000Z.png',
    )
    expect(mockClick).toHaveBeenCalled()
  })

  it('falls back to downloading a PNG when Tauri invoke is unavailable', async () => {
    invoke.mockImplementation(() => {
      throw new Error('not in Tauri')
    })
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

    await captureScreenshot()

    expect(querySelectorSpy).toHaveBeenCalledWith('[data-viewer-canvas]')
    expect(toDataURL).toHaveBeenCalledWith('image/png')
    expect(mockAnchor.href).toBe('data:image/png;base64,abc123')
    expect(mockAnchor.download).toBe(
      'hetieuhoa-screenshot-2026-08-07T12-00-00.000Z.png',
    )
    expect(mockClick).toHaveBeenCalled()
  })

  it('logs a warning when canvas is not found', async () => {
    invoke.mockRejectedValue(new Error('unavailable'))
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(document, 'querySelector').mockReturnValue(null)

    await captureScreenshot()

    expect(warnSpy).toHaveBeenCalledWith(
      'Viewer canvas not found for screenshot',
    )
  })

  it('logs a warning when the viewer element is not a canvas', async () => {
    invoke.mockRejectedValue(new Error('unavailable'))
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(document, 'querySelector').mockReturnValue(
      document.createElement('div'),
    )

    await captureScreenshot()

    expect(warnSpy).toHaveBeenCalledWith(
      'Viewer canvas not found for screenshot',
    )
  })

  it('logs a warning when the viewer canvas is empty', async () => {
    invoke.mockRejectedValue(new Error('unavailable'))
    const canvas = document.createElement('canvas')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const toDataURL = vi.fn()

    canvas.width = 0
    canvas.height = 150
    vi.spyOn(document, 'querySelector').mockReturnValue(canvas)
    vi.spyOn(canvas, 'toDataURL').mockImplementation(toDataURL)

    await captureScreenshot()

    expect(warnSpy).toHaveBeenCalledWith(
      'Viewer canvas is empty for screenshot',
    )
    expect(toDataURL).not.toHaveBeenCalled()
  })

  it('logs a warning when screenshot export fails', async () => {
    invoke.mockRejectedValue(new Error('unavailable'))
    const canvas = document.createElement('canvas')
    const error = new Error('export failed')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    vi.spyOn(document, 'querySelector').mockReturnValue(canvas)
    vi.spyOn(canvas, 'toDataURL').mockImplementation(() => {
      throw error
    })

    await captureScreenshot()

    expect(warnSpy).toHaveBeenCalledWith(
      'Viewer screenshot capture failed',
      error,
    )
  })
})
