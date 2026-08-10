import { render } from '@testing-library/react'
import * as THREE from 'three'
import { describe, expect, it, vi } from 'vitest'

import { ModelColorController } from '../ModelColorController'
import { ViewerContext } from '../viewerContext'
import type { ViewerContextValue } from '../viewerContext'

function createViewerValue(overrides: Partial<ViewerContextValue> = {}): ViewerContextValue {
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

function renderWithViewer(object: THREE.Object3D, overrides: Partial<ViewerContextValue> = {}) {
  return render(
    <ViewerContext.Provider value={createViewerValue(overrides)}>
      <ModelColorController object={object} />
    </ViewerContext.Provider>,
  )
}

describe('ModelColorController', () => {
  it('applies model color override to non-empty standard mesh materials', () => {
    const object = new THREE.Group()
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff })
    object.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material))

    renderWithViewer(object, { modelColor: '#f97316' })

    expect(material.color.getHexString()).toBe('f97316')
  })

  it('resets model color override to the original textured material color', () => {
    const object = new THREE.Group()
    const material = new THREE.MeshStandardMaterial({ color: 0xf97316 })
    object.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material))

    renderWithViewer(object, { modelColor: null })

    expect(material.color.getHexString()).toBe('ffffff')
  })

  it('updates the generated base material while a highlight clone is assigned', () => {
    const object = new THREE.Group()
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff })
    const highlightedMaterial = baseMaterial.clone()
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), highlightedMaterial)
    mesh.userData.viewerBaseMaterial = baseMaterial
    object.add(mesh)

    renderWithViewer(object, { modelColor: '#f97316' })

    expect(baseMaterial.color.getHexString()).toBe('f97316')
    expect(highlightedMaterial.color.getHexString()).toBe('ffffff')
  })
})
