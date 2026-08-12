import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { renderStarter } from '@/test/starterRender'
import { StarterApp } from './App'

vi.mock('@/components/viewer-v2/ViewerV2Page', () => ({
  ViewerV2Page: () => <div data-testid="viewer-v2-page">Viewer v2</div>,
}))

vi.mock('@/pages/MenuPage', () => ({
  MenuPage: () => <div data-testid="menu-page">Menu</div>,
}))

vi.mock('@/pages/GuidePage', () => ({
  GuidePage: () => <div data-testid="guide-page">Guide</div>,
}))

vi.mock('./nativeSettings', () => ({
  readNativeAppVersion: vi.fn(async () => null),
  readNativeStarterSettings: vi.fn(async () => null),
  saveNativeStarterSettings: vi.fn(async () => undefined),
}))

function renderAppWithRoute(initialRoute = '/') {
  return renderStarter(
    <MemoryRouter initialEntries={[initialRoute]}>
      <StarterApp />
    </MemoryRouter>,
  )
}

afterEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('StarterApp routing', () => {
  it('renders the menu page at /', () => {
    renderAppWithRoute('/')

    expect(screen.getByTestId('menu-page')).toHaveTextContent('Menu')
  })

  it('renders the viewer page at /viewer', () => {
    renderAppWithRoute('/viewer')

    expect(screen.getByTestId('viewer-v2-page')).toHaveTextContent('Viewer v2')
  })

  it('renders the guide page at /guide', () => {
    renderAppWithRoute('/guide')

    expect(screen.getByTestId('guide-page')).toHaveTextContent('Guide')
  })
})

describe('StarterApp bootstrap', () => {
  it('prevents native context menus only in the Tauri bootstrap', async () => {
    vi.resetModules()
    const addEventListener = vi.spyOn(document, 'addEventListener')
    const render = vi.fn()
    vi.doMock('react-router-dom', async (importOriginal) => {
      const actual = await importOriginal<typeof import('react-router-dom')>()
      return {
        ...actual,
        HashRouter: ({ children }: { children: React.ReactNode }) => children,
      }
    })
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

    try {
      document.body.innerHTML = '<div id="root"></div>'
      await import('../main')

      expect(addEventListener.mock.calls.some(([type]) => type === 'contextmenu')).toBe(false)

      vi.resetModules()
      addEventListener.mockClear()
      document.body.innerHTML = '<div id="root"></div>'

      const tauriWindow = window as typeof window & { __TAURI_INTERNALS__?: object }
      tauriWindow.__TAURI_INTERNALS__ = {}

      await import('../main')

      const contextMenuCall = addEventListener.mock.calls.find(([type]) => type === 'contextmenu')
      expect(contextMenuCall?.[2]).toBe(true)

      const contextMenuEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
      document.dispatchEvent(contextMenuEvent)

      expect(contextMenuEvent.defaultPrevented).toBe(true)
    } finally {
      addEventListener.mockRestore()
      const tauriWindow = window as typeof window & { __TAURI_INTERNALS__?: object }
      delete tauriWindow.__TAURI_INTERNALS__
      vi.doUnmock('react-router-dom')
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
