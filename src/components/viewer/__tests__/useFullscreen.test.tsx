import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockTauriWindow, mockGetCurrentWindow } = vi.hoisted(() => {
  const mockTauriWindow = {
    isFullscreen: vi.fn<() => Promise<boolean>>(),
    setFullscreen: vi.fn<(fullscreen: boolean) => Promise<void>>(),
    onResized: vi.fn<() => Promise<() => void>>(),
  }

  return {
    mockTauriWindow,
    mockGetCurrentWindow: vi.fn(() => mockTauriWindow),
  }
})

vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: mockGetCurrentWindow,
}))

async function renderFullscreenHook() {
  const { useFullscreen } = await import('../useFullscreen')
  return renderHook(() => useFullscreen())
}

describe('useFullscreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(globalThis, '__TAURI__', { configurable: true, value: {} })
    Object.defineProperty(globalThis, '__TAURI_INTERNALS__', { configurable: true, value: {} })
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: null })
    mockTauriWindow.isFullscreen.mockResolvedValue(false)
    mockTauriWindow.setFullscreen.mockResolvedValue(undefined)
    mockTauriWindow.onResized.mockResolvedValue(vi.fn())
    mockGetCurrentWindow.mockReturnValue(mockTauriWindow)
  })

  it('reads the current Tauri fullscreen state on mount', async () => {
    mockTauriWindow.isFullscreen.mockResolvedValue(false)

    const { result } = await act(async () => renderFullscreenHook())

    await vi.waitFor(() => expect(mockTauriWindow.isFullscreen).toHaveBeenCalled())
    mockTauriWindow.isFullscreen.mockResolvedValue(true)
    await act(async () => {
      await mockTauriWindow.onResized.mock.calls[0][0]()
    })

    expect(result.current.isFullscreen).toBe(true)
  })

  it('toggles Tauri fullscreen state', async () => {
    mockTauriWindow.isFullscreen.mockResolvedValue(false)
    const { result } = await renderFullscreenHook()

    await vi.waitFor(() => expect(mockTauriWindow.isFullscreen).toHaveBeenCalled())

    await act(async () => {
      await result.current.toggleFullscreen()
    })

    expect(mockTauriWindow.setFullscreen).toHaveBeenCalledWith(true)
    expect(result.current.isFullscreen).toBe(true)
  })

  it('uses browser fullscreen APIs when no Tauri window is available', async () => {
    const requestFullscreen = vi.fn().mockImplementation(async () => {
      Object.defineProperty(document, 'fullscreenElement', {
        configurable: true,
        value: document.documentElement,
      })
      document.dispatchEvent(new Event('fullscreenchange'))
    })
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      configurable: true,
      value: requestFullscreen,
    })
    mockGetCurrentWindow.mockReturnValue(null)

    const { result } = await renderFullscreenHook()

    await act(async () => {
      await result.current.toggleFullscreen()
    })

    expect(requestFullscreen).toHaveBeenCalledOnce()
    expect(result.current.isFullscreen).toBe(true)
  })

  it('tracks browser fullscreen changes after mounting outside Tauri', async () => {
    mockGetCurrentWindow.mockReturnValue(null)

    const { result } = await renderFullscreenHook()

    await vi.waitFor(() => expect(mockGetCurrentWindow).toHaveBeenCalled())

    act(() => {
      Object.defineProperty(document, 'fullscreenElement', {
        configurable: true,
        value: document.documentElement,
      })
      document.dispatchEvent(new Event('fullscreenchange'))
    })

    expect(result.current.isFullscreen).toBe(true)
  })

  it('unlistens if Tauri resize subscription resolves after unmount', async () => {
    const unlisten = vi.fn()
    let resolveOnResized: (value: () => void) => void = () => {}
    mockTauriWindow.onResized.mockReturnValue(
      new Promise((resolve) => {
        resolveOnResized = resolve
      }),
    )

    const { unmount } = await renderFullscreenHook()

    await vi.waitFor(() => expect(mockTauriWindow.onResized).toHaveBeenCalled())
    unmount()

    await act(async () => {
      resolveOnResized(unlisten)
      await Promise.resolve()
    })

    expect(unlisten).toHaveBeenCalledOnce()
  })
})
