import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import * as THREE from 'three'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DigestiveModel } from '../DigestiveModel'
import { ViewerContext } from '../viewerContext'
import type { ViewerContextValue } from '../viewerContext'

const {
  createDigestiveMeshMaterial,
  disposeDigestiveMeshMaterial,
  fbx,
  normalizeModelForViewer,
  primitiveProps,
  controllerProps,
} = vi.hoisted(() => {
  const children: object[] = []

  return {
    createDigestiveMeshMaterial: vi.fn(() => new THREE.MeshStandardMaterial({ color: 0xff7777 })),
    disposeDigestiveMeshMaterial: vi.fn(),
    fbx: {
      add: (child: object) => children.push(child),
      clear: () => {
        children.length = 0
      },
      traverse: (visitor: (child: object) => void) => children.forEach(visitor),
    },
    normalizeModelForViewer: vi.fn(),
    primitiveProps: [] as Record<string, unknown>[],
    controllerProps: [] as Record<string, unknown>[],
  }
})

vi.mock('@react-three/drei', () => ({
  useFBX: vi.fn(() => fbx),
}))

vi.mock('../modelTransform', () => ({
  normalizeModelForViewer,
}))

vi.mock('../modelMaterials', () => ({
  createDigestiveMeshMaterial,
  disposeDigestiveMeshMaterial,
}))

vi.mock('../ModelColorController', () => ({
  ModelColorController: (props: Record<string, unknown>) => {
    controllerProps.push(props)
    return null
  },
}))

function capturePrimitiveProps(type: unknown, props: unknown) {
  if (type === 'primitive') primitiveProps.push(props as Record<string, unknown>)
}

vi.mock('react/jsx-dev-runtime', async () => {
  const actual = await vi.importActual<typeof import('react/jsx-dev-runtime')>('react/jsx-dev-runtime')

  return {
    ...actual,
      jsxDEV: vi.fn((type, props, key, isStaticChildren, source, self) => {
        capturePrimitiveProps(type, props)
        if (type === 'primitive') return null
        return actual.jsxDEV(type, props, key, isStaticChildren, source, self)
      }),
  }
})

vi.mock('react/jsx-runtime', async () => {
  const actual = await vi.importActual<typeof import('react/jsx-runtime')>('react/jsx-runtime')

  return {
    ...actual,
      jsx: vi.fn((type, props, key) => {
        capturePrimitiveProps(type, props)
        if (type === 'primitive') return null
        return actual.jsx(type, props, key)
      }),
  }
})

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

function renderWithViewer(children: ReactNode, overrides: Partial<ViewerContextValue> = {}) {
  return render(
    <ViewerContext.Provider value={createViewerValue(overrides)}>{children}</ViewerContext.Provider>,
  )
}

describe('DigestiveModel', () => {
  beforeEach(() => {
    fbx.clear()
    createDigestiveMeshMaterial.mockClear()
    disposeDigestiveMeshMaterial.mockClear()
    normalizeModelForViewer.mockClear()
    primitiveProps.length = 0
    controllerProps.length = 0
  })

  it('registers every mesh with debug metadata', () => {
    const registerOrganNode = vi.fn()
    const registerModelMesh = vi.fn()
    const mappedMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
    mappedMesh.name = 'digestive_system003'
    const emptyUnmappedMesh = new THREE.Mesh(new THREE.BufferGeometry())
    emptyUnmappedMesh.name = 'digestive_system002'
    fbx.add(mappedMesh)
    fbx.add(emptyUnmappedMesh)

    renderWithViewer(<DigestiveModel />, { registerOrganNode, registerModelMesh })

    expect(normalizeModelForViewer).toHaveBeenCalledWith(fbx)
    expect(registerModelMesh).toHaveBeenCalledWith({
      meshUuid: mappedMesh.uuid,
      meshName: 'digestive_system003',
      organName: 'da_day',
      vertexCount: 24,
      isSelectable: true,
      isEmpty: false,
    })
    expect(registerModelMesh).toHaveBeenCalledWith({
      meshUuid: emptyUnmappedMesh.uuid,
      meshName: 'digestive_system002',
      organName: null,
      vertexCount: 0,
      isSelectable: false,
      isEmpty: true,
    })
    expect(mappedMesh.userData.organName).toBe('da_day')
    expect(emptyUnmappedMesh.userData.organName).toBeUndefined()
    expect(registerOrganNode).toHaveBeenCalledWith('da_day', mappedMesh)
    expect(registerOrganNode).not.toHaveBeenCalledWith(expect.anything(), emptyUnmappedMesh)
  })

  it('applies digestive texture materials to non-empty meshes only', () => {
    const texturedMaterial = new THREE.MeshStandardMaterial({ color: 0xff7777 })
    createDigestiveMeshMaterial.mockReturnValueOnce(texturedMaterial)
    const nonEmptyMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
    nonEmptyMesh.name = 'digestive_system003'
    const emptyMesh = new THREE.Mesh(new THREE.BufferGeometry())
    const emptyMaterial = new THREE.MeshBasicMaterial()
    emptyMesh.name = 'digestive_system002'
    emptyMesh.material = emptyMaterial
    fbx.add(nonEmptyMesh)
    fbx.add(emptyMesh)

    renderWithViewer(<DigestiveModel />)

    expect(createDigestiveMeshMaterial).toHaveBeenCalledTimes(1)
    expect(nonEmptyMesh.material).toBe(texturedMaterial)
    expect(nonEmptyMesh.userData.viewerOriginalMaterial).toBeDefined()
    expect(nonEmptyMesh.userData.viewerBaseMaterial).toBe(texturedMaterial)
    expect(emptyMesh.material).toBe(emptyMaterial)
  })

  it('restores original materials and disposes owned textured materials on cleanup', () => {
    const originalMaterial = new THREE.MeshBasicMaterial()
    const texturedMaterial = new THREE.MeshStandardMaterial({ color: 0xff7777 })
    createDigestiveMeshMaterial.mockReturnValueOnce(texturedMaterial)
    const nonEmptyMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), originalMaterial)
    nonEmptyMesh.name = 'digestive_system003'
    fbx.add(nonEmptyMesh)

    const { unmount } = renderWithViewer(<DigestiveModel />)

    expect(nonEmptyMesh.material).toBe(texturedMaterial)

    unmount()

    expect(nonEmptyMesh.material).toBe(originalMaterial)
    expect(nonEmptyMesh.userData.viewerOriginalMaterial).toBe(originalMaterial)
    expect(nonEmptyMesh.userData.viewerBaseMaterial).toBe(texturedMaterial)
    expect(nonEmptyMesh.userData.viewerModelRestored).toBe(true)
    expect(disposeDigestiveMeshMaterial).toHaveBeenCalledWith(texturedMaterial)
    expect(disposeDigestiveMeshMaterial).not.toHaveBeenCalledWith(originalMaterial)
  })

  it('resets model restored state when reinitializing a cached mesh with a new viewer material', () => {
    const originalMaterial = new THREE.MeshBasicMaterial()
    const firstTexturedMaterial = new THREE.MeshStandardMaterial({ color: 0xff7777 })
    const secondTexturedMaterial = new THREE.MeshStandardMaterial({ color: 0x77ff77 })
    createDigestiveMeshMaterial.mockReturnValueOnce(firstTexturedMaterial).mockReturnValueOnce(secondTexturedMaterial)
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), originalMaterial)
    mesh.name = 'digestive_system003'
    fbx.add(mesh)

    const { unmount } = renderWithViewer(<DigestiveModel />)

    unmount()
    expect(mesh.userData.viewerModelRestored).toBe(true)

    renderWithViewer(<DigestiveModel />)

    expect(mesh.material).toBe(secondTexturedMaterial)
    expect(mesh.userData.viewerBaseMaterial).toBe(secondTexturedMaterial)
    expect(mesh.userData.viewerOriginalMaterial).toBe(originalMaterial)
    expect(mesh.userData.viewerModelRestored).toBe(false)
  })

  it('mounts model color controller with the loaded model object', () => {
    const texturedMaterial = new THREE.MeshStandardMaterial({ color: 0xff7777 })
    createDigestiveMeshMaterial.mockReturnValueOnce(texturedMaterial)
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
    mesh.name = 'digestive_system003'
    fbx.add(mesh)

    const { rerender } = render(
      <ViewerContext.Provider value={createViewerValue({ modelColor: '#f97316' })}>
        <DigestiveModel />
      </ViewerContext.Provider>,
    )

    expect(controllerProps[0]).toEqual({ object: fbx })

    rerender(
      <ViewerContext.Provider value={createViewerValue({ modelColor: null })}>
        <DigestiveModel />
      </ViewerContext.Provider>,
    )

    expect(texturedMaterial.color.getHexString()).toBe('ff7777')
  })

  it('registers both stomach meshes under the same logical organ', () => {
    const registerOrganNode = vi.fn()
    const firstStomachMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
    firstStomachMesh.name = 'digestive_system001'
    const secondStomachMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
    secondStomachMesh.name = 'digestive_system003'
    fbx.add(firstStomachMesh)
    fbx.add(secondStomachMesh)

    renderWithViewer(<DigestiveModel />, { registerOrganNode })

    expect(firstStomachMesh.userData.organName).toBe('da_day')
    expect(secondStomachMesh.userData.organName).toBe('da_day')
    expect(registerOrganNode).toHaveBeenCalledWith('da_day', firstStomachMesh)
    expect(registerOrganNode).toHaveBeenCalledWith('da_day', secondStomachMesh)
  })

  it('selects logical organ and records mesh name when clicking a mapped mesh', () => {
    const setLastClickedMeshName = vi.fn()
    const setSelectedOrgan = vi.fn()
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
    mesh.name = 'digestive_system003'
    fbx.add(mesh)

    renderWithViewer(<DigestiveModel />, { setLastClickedMeshName, setSelectedOrgan })

    expect(mesh.userData.organName).toBe('da_day')

    const handlePointerDown = primitiveProps[0].onPointerDown as (event: {
      object: THREE.Object3D
      stopPropagation: () => void
    }) => void
    const stopPropagation = vi.fn()

    handlePointerDown({ object: mesh, stopPropagation })

    expect(setLastClickedMeshName).toHaveBeenCalledWith('digestive_system003')
    expect(stopPropagation).toHaveBeenCalledTimes(1)
    expect(setSelectedOrgan).toHaveBeenCalledWith('da_day')
  })

  it('records mesh name without selecting or stopping propagation for unmapped meshes', () => {
    const setLastClickedMeshName = vi.fn()
    const setSelectedOrgan = vi.fn()
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
    mesh.name = 'digestive_system002'
    fbx.add(mesh)

    renderWithViewer(<DigestiveModel />, { setLastClickedMeshName, setSelectedOrgan })

    const handlePointerDown = primitiveProps[0].onPointerDown as (event: {
      object: THREE.Object3D
      stopPropagation: () => void
    }) => void
    const stopPropagation = vi.fn()

    handlePointerDown({ object: mesh, stopPropagation })

    expect(setLastClickedMeshName).toHaveBeenCalledWith('digestive_system002')
    expect(stopPropagation).not.toHaveBeenCalled()
    expect(setSelectedOrgan).not.toHaveBeenCalled()
  })
})
