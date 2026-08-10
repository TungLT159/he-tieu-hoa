import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import * as THREE from 'three'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ViewerV2Context } from '../../viewerV2Context'
import type { ViewerV2ContextValue } from '../../viewerV2Context'
import { OrganRegistry } from '../OrganRegistry'

const { createDigestiveMeshMaterial, disposeDigestiveMeshMaterial } = vi.hoisted(() => ({
  createDigestiveMeshMaterial: vi.fn(() => new THREE.MeshPhysicalMaterial({ color: 0xff7777 })),
  disposeDigestiveMeshMaterial: vi.fn(),
}))

vi.mock('../../modelMaterials', () => ({
  createDigestiveMeshMaterial,
  disposeDigestiveMeshMaterial,
}))

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
  return render(
    <ViewerV2Context.Provider value={createViewerValue(overrides)}>{children}</ViewerV2Context.Provider>,
  )
}

describe('OrganRegistry', () => {
  beforeEach(() => {
    createDigestiveMeshMaterial.mockClear()
    disposeDigestiveMeshMaterial.mockClear()
  })

  it('registers known non-empty meshes and marks them with logical organ names', () => {
    const scene = new THREE.Group()
    const stomachMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
    stomachMesh.name = 'digestive_system001'
    const esophagusMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
    esophagusMesh.name = 'digestive_system005'
    scene.add(stomachMesh, esophagusMesh)
    const registerOrganNode = vi.fn()
    const setIsModelLoaded = vi.fn()
    const setLoadError = vi.fn()

    renderWithViewer(<OrganRegistry scene={scene} />, {
      registerOrganNode,
      setIsModelLoaded,
      setLoadError,
    })

    expect(stomachMesh.userData.organName).toBe('da_day')
    expect(esophagusMesh.userData.organName).toBe('thuc_quan')
    expect(registerOrganNode).toHaveBeenCalledWith('da_day', stomachMesh)
    expect(registerOrganNode).toHaveBeenCalledWith('thuc_quan', esophagusMesh)
    expect(setIsModelLoaded).toHaveBeenCalledWith(true)
    expect(setLoadError).toHaveBeenCalledWith(null)
  })

  it('skips known meshes with empty geometry', () => {
    const scene = new THREE.Group()
    const emptyMesh = new THREE.Mesh(new THREE.BufferGeometry())
    emptyMesh.name = 'digestive_system001'
    const originalMaterial = emptyMesh.material
    scene.add(emptyMesh)
    const registerOrganNode = vi.fn()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    renderWithViewer(<OrganRegistry scene={scene} />, { registerOrganNode })

    expect(emptyMesh.userData.organName).toBeUndefined()
    expect(emptyMesh.material).toBe(originalMaterial)
    expect(createDigestiveMeshMaterial).not.toHaveBeenCalled()
    expect(registerOrganNode).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalledWith('No named organ meshes found in GLTF.')

    warn.mockRestore()
  })

  it('unregisters mesh, restores material, disposes replacement, and clears registry userData on cleanup', () => {
    const scene = new THREE.Group()
    const originalMaterial = new THREE.MeshBasicMaterial({ color: 0x0099ff })
    const replacementMaterial = new THREE.MeshPhysicalMaterial({ color: 0xff7777 })
    createDigestiveMeshMaterial.mockReturnValueOnce(replacementMaterial)
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), originalMaterial)
    mesh.name = 'digestive_system003'
    scene.add(mesh)
    const unregisterOrganNode = vi.fn()

    const { unmount } = renderWithViewer(<OrganRegistry scene={scene} />, { unregisterOrganNode })

    expect(mesh.material).toBe(replacementMaterial)
    expect(mesh.userData.viewerOriginalMaterial).toBe(originalMaterial)
    expect(mesh.userData.viewerBaseMaterial).toBe(replacementMaterial)
    expect(mesh.userData.organName).toBe('da_day')

    unmount()

    expect(mesh.material).toBe(originalMaterial)
    expect(unregisterOrganNode).toHaveBeenCalledWith('da_day', mesh)
    expect(disposeDigestiveMeshMaterial).toHaveBeenCalledWith(replacementMaterial)
    expect(disposeDigestiveMeshMaterial).not.toHaveBeenCalledWith(originalMaterial)
    expect(mesh.userData.viewerOriginalMaterial).toBeUndefined()
    expect(mesh.userData.viewerBaseMaterial).toBeUndefined()
    expect(mesh.userData.organName).toBeUndefined()
  })
})
