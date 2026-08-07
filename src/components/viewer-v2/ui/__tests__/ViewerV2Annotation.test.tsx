import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { renderStarter } from '@/test/starterRender'
import { act, fireEvent, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { ViewerV2Context } from '../../viewerV2Context'
import type { AnnotationTool, ViewerV2ContextValue } from '../../viewerV2Context'
import { ViewerV2Annotation } from '../ViewerV2Annotation'

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
    drawColor: '#22c55e',
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
    ...overrides,
  }
}

function renderAnnotation(overrides: Partial<ViewerV2ContextValue> = {}) {
  renderStarter(
    <StarterSettingsContext.Provider
      value={{
        appVersion: '0.1.0',
        locale: 'en',
        resolvedThemeMode: 'light',
        settings: DEFAULT_STARTER_SETTINGS,
        updateSettings: vi.fn(),
      }}
    >
      <ViewerV2Context.Provider value={createViewerValue(overrides)}>
        <ViewerV2Annotation />
      </ViewerV2Context.Provider>
    </StarterSettingsContext.Provider>,
  )
}

describe('ViewerV2Annotation', () => {
  it('draws a line with the active v2 draw color', () => {
    renderAnnotation({ drawColor: '#22c55e' })

    const surface = screen.getByTestId('viewer-v2-annotation-surface')
    fireEvent.pointerDown(surface, { clientX: 10, clientY: 20, pointerId: 1 })
    fireEvent.pointerMove(surface, { clientX: 30, clientY: 40, pointerId: 1 })
    fireEvent.pointerUp(surface, { pointerId: 1 })

    const line = screen.getByTestId('viewer-v2-annotation-line')
    expect(line).toHaveAttribute('stroke', '#22c55e')
    expect(line).toHaveAttribute('d', 'M 10 20 L 30 40')
  })

  it('erases a drawn line when the v2 eraser tool is active', () => {
    function Harness() {
      const [annotationTool, setAnnotationTool] = useState<AnnotationTool>('pen')

      return (
        <StarterSettingsContext.Provider
          value={{
            appVersion: '0.1.0',
            locale: 'en',
            resolvedThemeMode: 'light',
            settings: DEFAULT_STARTER_SETTINGS,
            updateSettings: vi.fn(),
          }}
        >
          <ViewerV2Context.Provider value={createViewerValue({ annotationTool, setAnnotationTool })}>
            <button type="button" onClick={() => setAnnotationTool('eraser')}>
              Switch to eraser
            </button>
            <ViewerV2Annotation />
          </ViewerV2Context.Provider>
        </StarterSettingsContext.Provider>
      )
    }

    renderStarter(<Harness />)

    const surface = screen.getByTestId('viewer-v2-annotation-surface')
    fireEvent.pointerDown(surface, { clientX: 10, clientY: 20, pointerId: 1 })
    fireEvent.pointerMove(surface, { clientX: 30, clientY: 40, pointerId: 1 })
    fireEvent.pointerUp(surface, { pointerId: 1 })
    expect(screen.getByTestId('viewer-v2-annotation-line')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Switch to eraser' }))
    fireEvent.pointerDown(screen.getByTestId('viewer-v2-annotation-line'), { clientX: 30, clientY: 40, pointerId: 2 })

    expect(screen.queryByTestId('viewer-v2-annotation-line')).not.toBeInTheDocument()
  })

  it('does not create a line while the v2 eraser tool is active', () => {
    renderStarter(
      <StarterSettingsContext.Provider
        value={{
          appVersion: '0.1.0',
          locale: 'en',
          resolvedThemeMode: 'light',
          settings: DEFAULT_STARTER_SETTINGS,
          updateSettings: vi.fn(),
        }}
      >
        <ViewerV2Context.Provider value={createViewerValue({ annotationTool: 'eraser' })}>
          <ViewerV2Annotation />
        </ViewerV2Context.Provider>
      </StarterSettingsContext.Provider>,
    )

    const surface = screen.getByTestId('viewer-v2-annotation-surface')
    fireEvent.pointerDown(surface, { clientX: 10, clientY: 20, pointerId: 1 })
    fireEvent.pointerMove(surface, { clientX: 30, clientY: 40, pointerId: 1 })
    fireEvent.pointerUp(surface, { pointerId: 1 })
    expect(screen.queryByTestId('viewer-v2-annotation-line')).not.toBeInTheDocument()
  })

  it('clears all drawn lines when annotation-clear is dispatched on the viewer canvas', () => {
    const canvas = document.createElement('div')
    canvas.setAttribute('data-viewer-canvas', 'true')
    document.body.appendChild(canvas)

    renderAnnotation()

    const surface = screen.getByTestId('viewer-v2-annotation-surface')
    fireEvent.pointerDown(surface, { clientX: 10, clientY: 20, pointerId: 1 })
    fireEvent.pointerMove(surface, { clientX: 30, clientY: 40, pointerId: 1 })
    fireEvent.pointerUp(surface, { pointerId: 1 })
    expect(screen.getByTestId('viewer-v2-annotation-line')).toBeInTheDocument()

    act(() => {
      canvas.dispatchEvent(new CustomEvent('annotation-clear'))
    })

    expect(screen.queryByTestId('viewer-v2-annotation-line')).not.toBeInTheDocument()
    canvas.remove()
  })
})
