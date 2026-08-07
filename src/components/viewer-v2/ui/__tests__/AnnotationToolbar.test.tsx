import { renderStarter } from '@/test/starterRender'
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { ViewerV2Context } from '../../viewerV2Context'
import type { ViewerV2ContextValue } from '../../viewerV2Context'
import { AnnotationToolbar } from '../AnnotationToolbar'

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
    isDrawing: true,
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
    qualityPreset: 'high',
    setQualityPreset: vi.fn(),
    volume: 50,
    setVolume: vi.fn(),
    voice: 'bac',
    setVoice: vi.fn(),
    annotationTool: 'pen',
    setAnnotationTool: vi.fn(),
    ...overrides,
  }
}

function renderToolbar(overrides: Partial<ViewerV2ContextValue> = {}) {
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
        <AnnotationToolbar />
      </ViewerV2Context.Provider>
    </StarterSettingsContext.Provider>,
  )

  return { ...view, value }
}

describe('AnnotationToolbar', () => {
  it('renders nothing when drawing is disabled', () => {
    const { container } = renderToolbar({ isDrawing: false })

    expect(container).toBeEmptyDOMElement()
  })

  it('shows all drawing controls when drawing is enabled', () => {
    renderToolbar()

    expect(screen.getByRole('button', { name: 'Pen' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Eraser' })).toBeInTheDocument()
    expect(screen.getByLabelText('Draw color #ff0000')).toHaveAttribute('type', 'color')
    expect(screen.getByRole('button', { name: 'Clear All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Exit Drawing' })).toBeInTheDocument()
  })

  it('marks the active annotation tool with aria-pressed', () => {
    renderToolbar({ annotationTool: 'eraser' })

    expect(screen.getByRole('button', { name: 'Pen' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Eraser' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('selects the eraser tool', () => {
    const setAnnotationTool = vi.fn()
    renderToolbar({ setAnnotationTool })

    fireEvent.click(screen.getByRole('button', { name: 'Eraser' }))

    expect(setAnnotationTool).toHaveBeenCalledWith('eraser')
  })

  it('exits drawing mode', () => {
    const setIsDrawing = vi.fn()
    renderToolbar({ setIsDrawing })

    fireEvent.click(screen.getByRole('button', { name: 'Exit Drawing' }))

    expect(setIsDrawing).toHaveBeenCalledWith(false)
  })

  it('dispatches annotation-clear on the viewer canvas', () => {
    renderToolbar()
    const canvas = document.createElement('div')
    const listener = vi.fn()
    canvas.dataset.viewerCanvas = ''
    canvas.addEventListener('annotation-clear', listener)
    document.body.appendChild(canvas)

    fireEvent.click(screen.getByRole('button', { name: 'Clear All' }))

    expect(listener).toHaveBeenCalledOnce()
    canvas.remove()
  })

  it('updates the draw color from the color input', () => {
    const setDrawColor = vi.fn()
    renderToolbar({ setDrawColor })

    fireEvent.input(screen.getByLabelText('Draw color #ff0000'), { target: { value: '#00ff00' } })

    expect(setDrawColor).toHaveBeenCalledWith('#00ff00')
  })
})
