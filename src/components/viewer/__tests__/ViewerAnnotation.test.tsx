import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import type { StarterSettingsContextValue } from '@/app/StarterSettingsContext'
import type { StarterSettings } from '@/app/settingsStorage'
import type { AppLocale } from '@/lib/i18n'

import { ViewerAnnotation } from '../ViewerAnnotation'
import { ViewerContext } from '../viewerContext'
import type { ViewerContextValue } from '../viewerContext'

function createMockSettingsContext(locale: AppLocale = 'en'): StarterSettingsContextValue {
  return {
    locale,
    appVersion: '1.0.0',
    resolvedThemeMode: 'dark',
    settings: {
      themeMode: 'dark',
      uiLanguage: locale,
      profileDisplayName: 'Test',
      notificationsEnabled: false,
    } as StarterSettings,
    updateSettings: vi.fn(),
  }
}

function createMockViewerContext(overrides: Partial<ViewerContextValue> = {}): ViewerContextValue {
  return {
    selectedOrgan: null,
    setSelectedOrgan: vi.fn(),
    organNodes: new Map(),
    registerOrganNode: vi.fn(),
    modelMeshes: [],
    registerModelMesh: vi.fn(),
    lastClickedMeshName: null,
    setLastClickedMeshName: vi.fn(),
    isDebugPanelOpen: false,
    setIsDebugPanelOpen: vi.fn(),
    cameraTarget: 'overview',
    setCameraTarget: vi.fn(),
    isTransitioning: false,
    setIsTransitioning: vi.fn(),
    isModelLoaded: true,
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
    ...overrides,
  }
}

function renderAnnotation(viewerOverrides: Partial<ViewerContextValue> = {}, locale: AppLocale = 'en') {
  const viewer = createMockViewerContext(viewerOverrides)

  render(
    <StarterSettingsContext.Provider value={createMockSettingsContext(locale)}>
      <ViewerContext.Provider value={viewer}>
        <ViewerAnnotation />
      </ViewerContext.Provider>
    </StarterSettingsContext.Provider>,
  )

  return viewer
}

describe('ViewerAnnotation', () => {
  it('renders nothing while drawing mode is off', () => {
    renderAnnotation({ isDrawing: false })

    expect(screen.queryByLabelText('Pen')).not.toBeInTheDocument()
  })

  it('renders localized drawing controls while drawing mode is on', () => {
    renderAnnotation({}, 'vi')

    expect(screen.getByRole('button', { name: 'Bút vẽ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tẩy' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xóa tất cả' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Thoát vẽ' })).toBeInTheDocument()
  })

  it('draws a freehand line using the active draw color', () => {
    renderAnnotation({ drawColor: '#22c55e' })

    const drawingSurface = screen.getByTestId('annotation-drawing-surface')
    fireEvent.pointerDown(drawingSurface, { clientX: 10, clientY: 20, pointerId: 1 })
    fireEvent.pointerMove(drawingSurface, { clientX: 30, clientY: 40, pointerId: 1 })
    fireEvent.pointerUp(drawingSurface, { pointerId: 1 })

    const line = screen.getByTestId('annotation-line')
    expect(line).toHaveAttribute('stroke', '#22c55e')
    expect(line).toHaveAttribute('d', 'M 10 20 L 30 40')
  })

  it('starts a second pen stroke when drawing over an existing line', () => {
    renderAnnotation()

    const drawingSurface = screen.getByTestId('annotation-drawing-surface')
    fireEvent.pointerDown(drawingSurface, { clientX: 10, clientY: 20, pointerId: 1 })
    fireEvent.pointerMove(drawingSurface, { clientX: 30, clientY: 40, pointerId: 1 })
    fireEvent.pointerUp(drawingSurface, { pointerId: 1 })

    const firstLine = screen.getByTestId('annotation-line')
    fireEvent.pointerDown(firstLine, { clientX: 20, clientY: 30, pointerId: 2 })
    fireEvent.pointerMove(drawingSurface, { clientX: 40, clientY: 50, pointerId: 2 })
    fireEvent.pointerUp(drawingSurface, { pointerId: 2 })

    expect(screen.getAllByTestId('annotation-line')).toHaveLength(2)
  })

  it('uses localized color buttons to update the drawing color', () => {
    const viewer = renderAnnotation({ drawColor: '#ff0000' }, 'vi')

    const colorButton = screen.getByRole('button', { name: 'Màu vẽ #3b82f6' })
    fireEvent.click(colorButton)

    expect(colorButton).toHaveAttribute('title', 'Màu vẽ #3b82f6')
    expect(viewer.setDrawColor).toHaveBeenCalledWith('#3b82f6')
  })

  it('clears drawn lines and exits drawing mode', () => {
    const viewer = renderAnnotation()
    const drawingSurface = screen.getByTestId('annotation-drawing-surface')

    fireEvent.pointerDown(drawingSurface, { clientX: 10, clientY: 20, pointerId: 1 })
    fireEvent.pointerMove(drawingSurface, { clientX: 30, clientY: 40, pointerId: 1 })
    fireEvent.pointerUp(drawingSurface, { pointerId: 1 })
    expect(screen.getByTestId('annotation-line')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Clear All' }))
    expect(screen.queryByTestId('annotation-line')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Exit Drawing' }))
    expect(viewer.setIsDrawing).toHaveBeenCalledWith(false)
  })

  it('erases a clicked line', () => {
    renderAnnotation()
    const drawingSurface = screen.getByTestId('annotation-drawing-surface')

    fireEvent.pointerDown(drawingSurface, { clientX: 10, clientY: 20, pointerId: 1 })
    fireEvent.pointerMove(drawingSurface, { clientX: 30, clientY: 40, pointerId: 1 })
    fireEvent.pointerUp(drawingSurface, { pointerId: 1 })

    fireEvent.click(screen.getByRole('button', { name: 'Eraser' }))
    fireEvent.pointerDown(screen.getByTestId('annotation-line'), { clientX: 30, clientY: 40, pointerId: 2 })

    expect(screen.queryByTestId('annotation-line')).not.toBeInTheDocument()
  })
})
