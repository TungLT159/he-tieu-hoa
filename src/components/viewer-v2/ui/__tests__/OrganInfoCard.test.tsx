import { renderStarter } from '@/test/starterRender'
import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import type { AppLocale } from '@/lib/i18n'
import { ViewerV2Context } from '../../viewerV2Context'
import type { ViewerV2ContextValue } from '../../viewerV2Context'
import { OrganInfoCard } from '../OrganInfoCard'

function createViewerValue(overrides: Partial<ViewerV2ContextValue> = {}): ViewerV2ContextValue {
  return {
    selectedOrgan: null,
    setSelectedOrgan: vi.fn(),
    organNodes: new Map(),
    registerOrganNode: vi.fn(),
    unregisterOrganNode: vi.fn(),
    cameraTarget: 'overview',
    setCameraTarget: vi.fn(),
    isTransitioning: false,
    setIsTransitioning: vi.fn(),
    isModelLoaded: false,
    setIsModelLoaded: vi.fn(),
    loadError: null,
    setLoadError: vi.fn(),
    resetViewVersion: 0,
    requestViewReset: vi.fn(),
    isMenuOpen: true,
    setIsMenuOpen: vi.fn(),
    activeSheet: null,
    setActiveSheet: vi.fn(),
    activeDialog: null,
    setActiveDialog: vi.fn(),
    isFullscreen: false,
    setIsFullscreen: vi.fn(),
    isDrawing: false,
    setIsDrawing: vi.fn(),
    drawColor: '#ff0000',
    setDrawColor: vi.fn(),
    backgroundColor: '#1a1a2e',
    setBackgroundColor: vi.fn(),
    modelColor: null,
    setModelColor: vi.fn(),
    isSpinning: false,
    setIsSpinning: vi.fn(),
    flyCameraActive: false,
    setFlyCameraActive: vi.fn(),
    ...overrides,
  }
}

function renderOrganInfoCard(
  viewerOverrides: Partial<ViewerV2ContextValue> = {},
  locale: AppLocale = 'en',
) {
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
      <ViewerV2Context.Provider value={createViewerValue(viewerOverrides)}>
        <OrganInfoCard />
      </ViewerV2Context.Provider>
    </StarterSettingsContext.Provider>,
  )
}

describe('OrganInfoCard', () => {
  it('renders nothing when no organ is selected', () => {
    const { container } = renderOrganInfoCard()

    expect(container).toBeEmptyDOMElement()
  })

  it('renders localized organ details when an organ is selected', () => {
    renderOrganInfoCard({ selectedOrgan: 'da_day' }, 'vi')

    expect(screen.getByText('Dạ dày')).toBeInTheDocument()
    expect(screen.getByText(/Dạ dày là cơ quan tiêu hóa hình túi/)).toBeInTheDocument()
  })

  it('positions selected organ details in the lower-right corner', () => {
    const { container } = renderOrganInfoCard({ selectedOrgan: 'gan' }, 'en')

    expect(container.firstElementChild).toHaveClass('bottom-4', 'right-4')
    expect(container.firstElementChild).not.toHaveClass('left-4')
  })
})
