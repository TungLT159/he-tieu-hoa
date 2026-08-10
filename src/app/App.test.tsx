import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderStarter } from '@/test/starterRender'
import { StarterApp } from './App'

vi.mock('@/components/viewer-v2/ViewerV2Page', () => ({
  ViewerV2Page: () => <div data-testid="viewer-v2-page">Viewer v2</div>,
}))

vi.mock('./nativeSettings', () => ({
  readNativeAppVersion: vi.fn(async () => null),
  readNativeStarterSettings: vi.fn(async () => null),
  saveNativeStarterSettings: vi.fn(async () => undefined),
}))

afterEach(() => {
  localStorage.clear()
  window.history.pushState(null, '', '/')
  vi.clearAllMocks()
})

describe('StarterApp', () => {
  it('renders the v2 viewer page as the default UI', () => {
    renderStarter(<StarterApp />)

    expect(screen.getByTestId('viewer-v2-page')).toHaveTextContent('Viewer v2')
  })

  it('prevents native context menus only in the Tauri bootstrap', async () => {
    vi.resetModules()
    const addEventListener = vi.spyOn(document, 'addEventListener')
    const render = vi.fn()
    vi.doMock('@/components/ui/tooltip', () => ({
      TooltipProvider: ({ children }: { children: React.ReactNode }) => children,
    }))
    vi.doMock('../components/FrontendReadyMarker', () => ({
      FrontendReadyMarker: () => null,
    }))
    vi.doMock('../components/LinuxTitlebar', () => ({
      LinuxTitlebar: () => null,
    }))
    vi.doMock('../lib/themeMode', () => ({
      applyStoredThemeMode: vi.fn(),
    }))
    vi.doMock('../utils/platform', () => ({
      isMac: vi.fn(() => false),
      shouldUseCustomWindowChrome: vi.fn(() => false),
    }))
    vi.doMock('./App', () => ({
      default: () => null,
    }))
    vi.doMock('react-dom/client', () => ({
      createRoot: vi.fn(() => ({ render })),
    }))

    const tauriWindow = window as typeof window & { __TAURI_INTERNALS__?: object }
    tauriWindow.__TAURI_INTERNALS__ = {}
    document.body.innerHTML = '<div id="root"></div>'

    try {
      await import('../main')

      const contextMenuCall = addEventListener.mock.calls.find(([type]) => type === 'contextmenu')
      expect(contextMenuCall?.[2]).toBe(true)

      const contextMenuEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
      document.dispatchEvent(contextMenuEvent)

      expect(contextMenuEvent.defaultPrevented).toBe(true)
    } finally {
      addEventListener.mockRestore()
      delete tauriWindow.__TAURI_INTERNALS__
      vi.doUnmock('@/components/ui/tooltip')
      vi.doUnmock('../components/FrontendReadyMarker')
      vi.doUnmock('../components/LinuxTitlebar')
      vi.doUnmock('../lib/themeMode')
      vi.doUnmock('../utils/platform')
      vi.doUnmock('./App')
      vi.doUnmock('react-dom/client')
      vi.resetModules()
    }
  })
})
