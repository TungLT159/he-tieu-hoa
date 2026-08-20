import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { renderStarter } from '@/test/starterRender'
import { ViewerV2Context } from '../../viewerV2Context'
import type { ViewerV2ContextValue } from '../../viewerV2Context'
import { ViewModeControl } from '../ViewModeControl'

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
    flyCameraPaused: false,
    setFlyCameraPaused: vi.fn(),
    flyCameraOrganPopup: null,
    setFlyCameraOrganPopup: vi.fn(),
    qualityPreset: 'medium',
    setQualityPreset: vi.fn(),
    volume: 80,
    setVolume: vi.fn(),
    voice: 'bac',
    setVoice: vi.fn(),
    annotationTool: 'pen',
    setAnnotationTool: vi.fn(),
    viewMode: '3d',
    setViewMode: vi.fn(),
    ...overrides,
  }
}

function renderControl(overrides: Partial<ViewerV2ContextValue> = {}) {
  const value = createViewerValue(overrides)
  const view = renderStarter(
    <StarterSettingsContext.Provider
      value={{
        appVersion: '0.1.0',
        locale: 'en',
        resolvedThemeMode: 'light',
        settings: DEFAULT_STARTER_SETTINGS,
        updateSettings: vi.fn(),
      }}
    >
      <ViewerV2Context.Provider value={value}>
        <ViewModeControl />
      </ViewerV2Context.Provider>
    </StarterSettingsContext.Provider>,
  )

  return { ...view, value }
}

describe('ViewModeControl', () => {
  it('renders the title and current view mode selector', () => {
    renderControl({ viewMode: '2d' })

    expect(screen.getByText('View mode')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'View mode' })).toHaveTextContent('2D')
  })

  it('updates the viewer mode from the dropdown', () => {
    const setViewMode = vi.fn()
    renderControl({ setViewMode })

    fireEvent.click(screen.getByRole('combobox', { name: 'View mode' }))
    fireEvent.click(screen.getByRole('option', { name: '2D' }))

    expect(setViewMode).toHaveBeenCalledWith('2d')
  })

  it('always shows the reset button beside the mode selector', () => {
    const requestViewReset = vi.fn()
    renderControl({ requestViewReset, selectedOrgan: null })

    fireEvent.click(screen.getByRole('button', { name: 'Return to overview' }))

    expect(requestViewReset).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('combobox', { name: 'View mode' })).toBeInTheDocument()
  })
})
