import type { ReactNode } from 'react'
import * as THREE from 'three'
import { describe, expect, it, vi } from 'vitest'

import { renderStarter } from '@/test/starterRender'
import { ViewerV2Context } from '../../viewerV2Context'
import type { ViewerV2ContextValue } from '../../viewerV2Context'
import { ModelColorController } from '../ModelColorController'

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

function renderWithViewer(children: ReactNode, overrides: Partial<ViewerV2ContextValue> = {}) {
  return renderStarter(
    <ViewerV2Context.Provider value={createViewerValue(overrides)}>{children}</ViewerV2Context.Provider>,
  )
}

describe('ModelColorController', () => {
  it('applies modelColor to mesh materials with colors', () => {
    const object = new THREE.Group()
    const material = new THREE.MeshBasicMaterial({ color: '#123456' })
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material)
    object.add(mesh)

    renderWithViewer(<ModelColorController object={object} />, {
      modelColor: '#00ff00',
    })

    expect(material.color.getHexString()).toBe('00ff00')
  })

  it('restores the original mesh material color when modelColor is cleared', () => {
    const object = new THREE.Group()
    const material = new THREE.MeshBasicMaterial({ color: '#123456' })
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material)
    object.add(mesh)

    const { rerender } = renderWithViewer(<ModelColorController object={object} />, {
      modelColor: '#ff0000',
    })
    expect(material.color.getHexString()).toBe('ff0000')

    rerender(
      <ViewerV2Context.Provider value={createViewerValue({ modelColor: null })}>
        <ModelColorController object={object} />
      </ViewerV2Context.Provider>,
    )

    expect(material.color.getHexString()).toBe('123456')
  })

  it('updates viewerBaseMaterial while a highlight material is attached', () => {
    const object = new THREE.Group()
    const baseMaterial = new THREE.MeshBasicMaterial({ color: '#123456' })
    const highlightMaterial = new THREE.MeshBasicMaterial({ color: '#4fc3f7' })
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), highlightMaterial)
    mesh.userData.viewerBaseMaterial = baseMaterial
    object.add(mesh)

    renderWithViewer(<ModelColorController object={object} />, {
      modelColor: '#00ff00',
    })

    expect(baseMaterial.color.getHexString()).toBe('00ff00')
    expect(highlightMaterial.color.getHexString()).toBe('4fc3f7')
  })
})
