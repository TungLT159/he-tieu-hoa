import { act, render } from '@testing-library/react'
import { Suspense } from 'react'
import type { ReactNode } from 'react'
import * as THREE from 'three'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ViewerV2Context } from '../../viewerV2Context'
import type { ViewerV2ContextValue } from '../../viewerV2Context'
import { ModelLoader } from '../ModelLoader'
import { selectOrganFromPointerEvent } from '../modelSelection'

const { useFBX, normalizeModelForViewer } = vi.hoisted(() => ({
  useFBX: vi.fn(),
  normalizeModelForViewer: vi.fn(),
}))

vi.mock('@react-three/drei', () => ({
  useFBX,
}))

vi.mock('../../modelTransform', () => ({
  normalizeModelForViewer,
}))

vi.mock('../OrganRegistry', () => ({
  OrganRegistry: ({ scene }: { scene: THREE.Object3D }) => {
    scene.userData.organRegistryRendered = true
    scene.userData.normalizeCallsBeforeOrganRegistryRender = normalizeModelForViewer.mock.calls.length
    return null
  },
}))

vi.mock('../../ui/ModelColorController', () => ({
  ModelColorController: ({ object }: { object: THREE.Object3D }) => {
    object.userData.modelColorControllerRendered = true
    return null
  },
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

describe('ModelLoader', () => {
  beforeEach(() => {
    useFBX.mockReset()
    normalizeModelForViewer.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads the bundled FBX model URL while GLB conversion is blocked', () => {
    const scene = new THREE.Group()
    useFBX.mockReturnValue(scene)

    const { container } = renderWithViewer(<ModelLoader />)

    expect(useFBX).toHaveBeenCalledWith('/models/hetieuhoa.fbx')
    expect(container).toBeTruthy()
  })

  it('lets FBX Suspense promises bubble to Suspense instead of swallowing them', async () => {
    const thrownPromise = Promise.resolve()
    const setLoadError = vi.fn()
    useFBX.mockImplementation(() => {
      throw thrownPromise
    })

    const { getByTestId } = renderWithViewer(
      <Suspense fallback={<div data-testid="model-suspense-fallback" />}>
        <ModelLoader />
      </Suspense>,
      { setLoadError },
    )

    expect(getByTestId('model-suspense-fallback')).toBeTruthy()
    expect(setLoadError).not.toHaveBeenCalled()
    expect(normalizeModelForViewer).not.toHaveBeenCalled()
  })

  it('does not hide FBX load errors', () => {
    const loadError = new Error('Could not load /models/hetieuhoa.fbx')
    useFBX.mockImplementation(() => {
      throw loadError
    })

    expect(() => renderWithViewer(<ModelLoader />)).toThrow(loadError)
    expect(normalizeModelForViewer).not.toHaveBeenCalled()
  })

  it('normalizes the loaded scene and wires model helpers', () => {
    const scene = new THREE.Group()
    useFBX.mockReturnValue(scene)

    renderWithViewer(<ModelLoader />)

    expect(normalizeModelForViewer).toHaveBeenCalledWith(scene)
    expect(scene.userData.normalizeCallsBeforeOrganRegistryRender).toBe(0)
    expect(scene.userData.organRegistryRendered).toBe(true)
    expect(scene.userData.modelColorControllerRendered).toBe(true)
  })

  it('normalizes the loaded scene from an effect', async () => {
    const scene = new THREE.Group()
    useFBX.mockReturnValue(scene)

    renderWithViewer(<ModelLoader />)

    await act(async () => undefined)

    expect(scene.userData.normalizeCallsBeforeOrganRegistryRender).toBe(0)
    expect(normalizeModelForViewer).toHaveBeenCalledWith(scene)
  })

  it('selects an organ mesh from pointer events and stops propagation', () => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
    mesh.userData.organName = 'da_day'
    const stopPropagation = vi.fn()
    const setSelectedOrgan = vi.fn()

    selectOrganFromPointerEvent(mesh, stopPropagation, setSelectedOrgan)

    expect(stopPropagation).toHaveBeenCalledTimes(1)
    expect(setSelectedOrgan).toHaveBeenCalledWith('da_day')
  })
})
