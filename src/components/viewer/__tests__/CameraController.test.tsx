import { act, render } from '@testing-library/react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import * as THREE from 'three'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'

import { CameraController } from '../CameraController'
import { ViewerContext } from '../viewerContext'
import type { ViewerContextValue } from '../viewerContext'

const orbitControlsProps: Record<string, unknown>[] = []
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)

vi.mock('@react-three/drei', () => ({
  OrbitControls: vi.fn((props: Record<string, unknown>) => {
    orbitControlsProps.push(props)
    return null
  }),
}))

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({
    camera,
  })),
}))

async function getFiberMocks() {
  return (await import('@react-three/fiber')) as typeof import('@react-three/fiber') & {
    useFrame: Mock
  }
}

function createViewerTree(children: ReactNode, overrides: Partial<ViewerContextValue> = {}) {
  return (
    <ViewerContext.Provider
      value={{
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
      }}
    >
      {children}
    </ViewerContext.Provider>
  )
}

function renderWithViewer(children: ReactNode, overrides: Partial<ViewerContextValue> = {}) {
  return render(createViewerTree(children, overrides))
}

describe('CameraController', () => {
  beforeEach(() => {
    orbitControlsProps.length = 0
    camera.position.set(0, 2, 8)
    vi.spyOn(performance, 'now').mockReturnValue(0)
    vi.useRealTimers()
  })

  it('renders orbit controls configured for overview navigation', () => {
    renderWithViewer(<CameraController />)

    expect(orbitControlsProps).toHaveLength(1)
    expect(orbitControlsProps[0]).toMatchObject({
      enabled: true,
      makeDefault: true,
      minDistance: 1,
      maxDistance: 20,
    })
    expect(orbitControlsProps[0].target).toEqual([0, 0.5, 0])
  })

  it('waits for a selected organ to register before starting a fly-to transition', () => {
    const selectedOrgan = 'stomach'
    const setCameraTarget = vi.fn()
    const setIsTransitioning = vi.fn()
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
    const { rerender } = renderWithViewer(<CameraController />, {
      selectedOrgan,
      setCameraTarget,
      setIsTransitioning,
    })

    expect(setCameraTarget).not.toHaveBeenCalled()
    expect(setIsTransitioning).not.toHaveBeenCalled()

    rerender(
      createViewerTree(<CameraController />, {
        selectedOrgan,
        setCameraTarget,
        setIsTransitioning,
        organNodes: new Map([[selectedOrgan, [mesh]]]),
      }),
    )

    expect(setCameraTarget).toHaveBeenCalledTimes(1)
    expect(setCameraTarget).toHaveBeenCalledWith(selectedOrgan)
    expect(setIsTransitioning).toHaveBeenCalledTimes(1)
    expect(setIsTransitioning).toHaveBeenCalledWith(true)
  })

  it('does not start a selected organ transition when the registered group has no meshes', () => {
    const selectedOrgan = 'stomach'
    const setCameraTarget = vi.fn()
    const setIsTransitioning = vi.fn()

    renderWithViewer(<CameraController />, {
      selectedOrgan,
      setCameraTarget,
      setIsTransitioning,
      organNodes: new Map([[selectedOrgan, []]]),
    })

    expect(setCameraTarget).not.toHaveBeenCalled()
    expect(setIsTransitioning).not.toHaveBeenCalled()
  })

  it('frames a selected organ using the combined bounds of every registered mesh', async () => {
    const selectedOrgan = 'stomach'
    const leftMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
    const rightMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
    leftMesh.position.set(-5, 0, 0)
    rightMesh.position.set(5, 0, 0)

    renderWithViewer(<CameraController />, {
      selectedOrgan,
      organNodes: new Map([[selectedOrgan, [leftMesh, rightMesh]]]),
      setCameraTarget: vi.fn(),
      isTransitioning: true,
      setIsTransitioning: vi.fn(),
    })

    const { useFrame } = await getFiberMocks()
    vi.mocked(performance.now).mockReturnValue(1000)
    useFrame.mock.calls.at(-1)?.[0]({} as never)

    expect(camera.position.x).toBeCloseTo(0)
    expect(camera.position.y).toBeCloseTo(11)
    expect(camera.position.z).toBeCloseTo(27.5)
  })

  it('flies to a rear camera position for the pancreas', async () => {
    const selectedOrgan = 'tuy'
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))

    renderWithViewer(<CameraController />, {
      selectedOrgan,
      organNodes: new Map([[selectedOrgan, [mesh]]]),
      setCameraTarget: vi.fn(),
      isTransitioning: true,
      setIsTransitioning: vi.fn(),
    })

    const { useFrame } = await getFiberMocks()
    vi.mocked(performance.now).mockReturnValue(1000)
    useFrame.mock.calls.at(-1)?.[0]({} as never)

    expect(camera.position.x).toBeCloseTo(0)
    expect(camera.position.y).toBeCloseTo(1.2)
    expect(camera.position.z).toBeCloseTo(-3)
  })

  it('flies to the default front camera position for a non-pancreas organ', async () => {
    const selectedOrgan = 'gan'
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))

    renderWithViewer(<CameraController />, {
      selectedOrgan,
      organNodes: new Map([[selectedOrgan, [mesh]]]),
      setCameraTarget: vi.fn(),
      isTransitioning: true,
      setIsTransitioning: vi.fn(),
    })

    const { useFrame } = await getFiberMocks()
    vi.mocked(performance.now).mockReturnValue(1000)
    useFrame.mock.calls.at(-1)?.[0]({} as never)

    expect(camera.position.x).toBeCloseTo(0)
    expect(camera.position.y).toBeCloseTo(1.2)
    expect(camera.position.z).toBeCloseTo(3)
  })

  it('starts an overview transition when reset is requested from the overview', () => {
    const setIsTransitioning = vi.fn()
    const { rerender } = renderWithViewer(<CameraController />, {
      cameraTarget: 'overview',
      selectedOrgan: null,
      resetViewVersion: 0,
      setIsTransitioning,
    })

    expect(setIsTransitioning).not.toHaveBeenCalled()

    rerender(
      createViewerTree(<CameraController />, {
        cameraTarget: 'overview',
        selectedOrgan: null,
        resetViewVersion: 1,
        setIsTransitioning,
      }),
    )

    expect(setIsTransitioning).toHaveBeenCalledTimes(1)
    expect(setIsTransitioning).toHaveBeenCalledWith(true)
  })

  it('clears a selected organ when a reset signal requests the overview', () => {
    const selectedOrgan = 'stomach'
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
    const setSelectedOrgan = vi.fn()
    const setCameraTarget = vi.fn()
    const setIsTransitioning = vi.fn()
    const { rerender } = renderWithViewer(<CameraController />, {
      selectedOrgan,
      setSelectedOrgan,
      organNodes: new Map([[selectedOrgan, [mesh]]]),
      cameraTarget: selectedOrgan,
      setCameraTarget,
      setIsTransitioning,
      resetViewVersion: 0,
    })

    expect(setSelectedOrgan).not.toHaveBeenCalled()

    rerender(
      createViewerTree(<CameraController />, {
        selectedOrgan,
        setSelectedOrgan,
        organNodes: new Map([[selectedOrgan, [mesh]]]),
        cameraTarget: selectedOrgan,
        setCameraTarget,
        setIsTransitioning,
        resetViewVersion: 1,
      }),
    )

    expect(setSelectedOrgan).toHaveBeenCalledWith(null)
    expect(setCameraTarget).toHaveBeenCalledWith('overview')
    expect(setIsTransitioning).toHaveBeenCalledWith(true)
  })

  it('sequences the fly camera tour through organs and returns to overview', () => {
    vi.useFakeTimers()
    const setSelectedOrgan = vi.fn()
    const setFlyCameraActive = vi.fn()
    const setCameraTarget = vi.fn()

    function StatefulCameraController() {
      const [selectedOrgan, updateSelectedOrgan] = useState<string | null>(null)
      const [flyCameraActive, updateFlyCameraActive] = useState(true)

      return createViewerTree(<CameraController />, {
        selectedOrgan,
        setSelectedOrgan: (organ) => {
          setSelectedOrgan(organ)
          updateSelectedOrgan(organ)
        },
        flyCameraActive,
        setFlyCameraActive: (active) => {
          setFlyCameraActive(active)
          updateFlyCameraActive(active)
        },
        setCameraTarget,
      })
    }

    render(<StatefulCameraController />)

    expect(setSelectedOrgan).toHaveBeenCalledWith('mieng')

    const expectedStops = ['thuc_quan', 'da_day', 'ruot_non', 'ruot_gia', 'gan', 'tui_mat', 'tuy']
    for (const organ of expectedStops) {
      act(() => vi.advanceTimersByTime(3000))
      expect(setSelectedOrgan).toHaveBeenLastCalledWith(organ)
    }

    act(() => vi.advanceTimersByTime(3000))

    expect(setSelectedOrgan).toHaveBeenLastCalledWith(null)
    expect(setCameraTarget).toHaveBeenCalledWith('overview')
    expect(setFlyCameraActive).toHaveBeenCalledWith(false)
  })

  it('cancels the fly camera tour when the active selection changes outside the tour', () => {
    const setFlyCameraActive = vi.fn()
    const { rerender } = renderWithViewer(<CameraController />, {
      flyCameraActive: true,
      selectedOrgan: 'mieng',
      setFlyCameraActive,
    })

    rerender(
      createViewerTree(<CameraController />, {
        flyCameraActive: true,
        selectedOrgan: 'gan',
        setFlyCameraActive,
      }),
    )

    expect(setFlyCameraActive).toHaveBeenCalledWith(false)
  })
})
