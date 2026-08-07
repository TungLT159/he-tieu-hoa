import { renderStarter } from '@/test/starterRender'
import { fireEvent, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import * as THREE from 'three'
import { describe, expect, it, vi } from 'vitest'

import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { ViewerV2Context } from '../../viewerV2Context'
import type { ViewerV2ContextValue } from '../../viewerV2Context'
import { FlyCameraPopup } from '../FlyCameraPopup'

vi.mock('@react-three/drei', () => ({
  Html: ({ children, position }: { children: ReactNode, position?: THREE.Vector3 }) => (
    <div data-position={position?.toArray().join(',')} data-testid="fly-camera-html">
      {children}
    </div>
  ),
}))

function createOrganMesh() {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2))
  mesh.position.set(0, 0, -5)
  mesh.updateMatrixWorld(true)
  return mesh
}

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
    ...overrides,
  }
}

function renderWithProviders(viewerOverrides: Partial<ViewerV2ContextValue> = {}) {
  return renderStarter(
    <StarterSettingsContext.Provider
      value={{
        appVersion: '0.1.0',
        locale: 'vi',
        resolvedThemeMode: 'light',
        settings: DEFAULT_STARTER_SETTINGS,
        updateSettings: vi.fn(),
      }}
    >
      <ViewerV2Context.Provider value={createViewerValue(viewerOverrides)}>
        <FlyCameraPopup />
      </ViewerV2Context.Provider>
    </StarterSettingsContext.Provider>,
  )
}

describe('FlyCameraPopup', () => {
  it('renders localized organ details for da_day', () => {
    renderWithProviders({
      flyCameraOrganPopup: 'da_day',
      organNodes: new Map([['da_day', [createOrganMesh()]]]),
    })

    expect(screen.getByText('Dạ dày')).toBeInTheDocument()
    expect(screen.getByText(/Dạ dày là cơ quan tiêu hóa hình túi/)).toBeInTheDocument()
  })

  it('renders the popup through Html anchored at the organ center', () => {
    renderWithProviders({
      flyCameraOrganPopup: 'da_day',
      organNodes: new Map([['da_day', [createOrganMesh()]]]),
    })

    expect(screen.getByTestId('fly-camera-html')).toHaveAttribute('data-position', '0,0,-5')
  })

  it('renders nothing when popup is null', () => {
    const { container } = renderWithProviders()

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when popup organ is unknown', () => {
    const { container } = renderWithProviders({
      flyCameraOrganPopup: 'unknown_organ',
      organNodes: new Map([['unknown_organ', [createOrganMesh()]]]),
    })

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when popup organ has no meshes', () => {
    const { container } = renderWithProviders({
      flyCameraOrganPopup: 'da_day',
      organNodes: new Map([['da_day', []]]),
    })

    expect(container).toBeEmptyDOMElement()
  })

  it('dispatches flycamera-advance when Continue is clicked', () => {
    const onAdvance = vi.fn()
    window.addEventListener('flycamera-advance', onAdvance)

    renderWithProviders({
      flyCameraOrganPopup: 'da_day',
      organNodes: new Map([['da_day', [createOrganMesh()]]]),
    })

    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }))

    expect(onAdvance).toHaveBeenCalledOnce()
    window.removeEventListener('flycamera-advance', onAdvance)
  })
})
