import { act, render } from '@testing-library/react'
import type { ReactNode } from 'react'
import * as THREE from 'three'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ViewerV2Context } from '../../viewerV2Context'
import type { ViewerV2ContextValue } from '../../viewerV2Context'
import { CameraController } from '../CameraController'
import {
  computeCameraDestination,
  DEFAULT_CAMERA_OFFSET,
  DEFAULT_POSITION,
  DEFAULT_TARGET,
  easeSmoothstep,
} from '../cameraMath'

const { cameraRef, controlsRef, orbitControlsMock, useFrameMock } = vi.hoisted(() => ({
  cameraRef: { current: null as unknown },
  controlsRef: { current: null as unknown },
  orbitControlsMock: vi.fn((props: { ref?: React.Ref<unknown> }) => {
    if (typeof props.ref === 'function') props.ref(controlsRef.current)
    if (props.ref && typeof props.ref === 'object') props.ref.current = controlsRef.current
    return null
  }),
  useFrameMock: vi.fn(),
}))

vi.mock('@react-three/drei', () => ({
  OrbitControls: orbitControlsMock,
}))

vi.mock('@react-three/fiber', () => ({
  useFrame: useFrameMock,
  useThree: () => ({ camera: cameraRef.current }),
}))

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)

function getControls() {
  return controlsRef.current as { target: THREE.Vector3; update: ReturnType<typeof vi.fn> }
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
    ...overrides,
  }
}

function renderWithViewerContext(ui: ReactNode, value: Partial<ViewerV2ContextValue> = {}) {
  return render(
    <ViewerV2Context.Provider value={createViewerValue(value)}>{ui}</ViewerV2Context.Provider>,
  )
}

describe('CameraController helpers', () => {
  it('returns the overview camera destination', () => {
    const destination = computeCameraDestination('overview', new Map())

    expect(destination.position.toArray()).toEqual(DEFAULT_POSITION.toArray())
    expect(destination.target.toArray()).toEqual(DEFAULT_TARGET.toArray())
  })

  it('frames an organ using combined mesh bounds and the default offset', () => {
    const leftMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1))
    const rightMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1))
    leftMesh.position.set(-2, 0, 0)
    rightMesh.position.set(2, 0, 0)

    const destination = computeCameraDestination('gan', new Map([['gan', [leftMesh, rightMesh]]]))

    expect(destination.target.toArray()).toEqual([0, 0, 0])
    expect(destination.position.x).toBeCloseTo(0)
    expect(destination.position.y).toBeCloseTo(5)
    expect(destination.position.z).toBeCloseTo(12.5)
  })

  it('uses a rear camera offset for tuy', () => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))

    const destination = computeCameraDestination('tuy', new Map([['tuy', [mesh]]]))

    expect(destination.position.x).toBeCloseTo(0)
    expect(destination.position.y).toBeCloseTo(1.2)
    expect(destination.position.z).toBeCloseTo(-3)
  })

  it('falls back to overview when an organ has no meshes', () => {
    const destination = computeCameraDestination('gan', new Map([['gan', []]]))

    expect(destination.position.toArray()).toEqual(DEFAULT_POSITION.toArray())
    expect(destination.target.toArray()).toEqual(DEFAULT_TARGET.toArray())
  })

  it('smoothsteps normalized progress', () => {
    expect(easeSmoothstep(0)).toBe(0)
    expect(easeSmoothstep(0.5)).toBe(0.5)
    expect(easeSmoothstep(1)).toBe(1)
  })

  it('exports the default camera offset for tests and reuse', () => {
    expect(DEFAULT_CAMERA_OFFSET.toArray()).toEqual([0, 0.4, 1])
  })
})

describe('CameraController', () => {
  beforeEach(() => {
    cameraRef.current = camera
    controlsRef.current = {
      target: new THREE.Vector3(0, 0, 0),
      update: vi.fn(),
    }
    orbitControlsMock.mockClear()
    useFrameMock.mockClear()
    camera.position.set(0, 2, 8)
    vi.spyOn(performance, 'now').mockReturnValue(0)
  })

  it('renders OrbitControls with the expected navigation limits without a fixed target prop', () => {
    const { container } = renderWithViewerContext(<CameraController />)

    expect(container).toBeTruthy()
    expect(orbitControlsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        makeDefault: true,
        maxDistance: 20,
        minDistance: 1,
      }),
      undefined,
    )
    expect(orbitControlsMock.mock.calls.at(-1)?.[0]).not.toHaveProperty('target')
  })

  it('initializes OrbitControls to the overview target on mount', () => {
    renderWithViewerContext(<CameraController />)

    const controls = getControls()
    expect(controls.target.toArray()).toEqual(DEFAULT_TARGET.toArray())
    expect(controls.update).toHaveBeenCalledTimes(1)
  })

  it('disables OrbitControls while transitioning', () => {
    renderWithViewerContext(<CameraController />, { isTransitioning: true })

    expect(orbitControlsMock).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
      undefined,
    )
  })

  it('enables autoRotate on OrbitControls when isSpinning is true', () => {
    renderWithViewerContext(<CameraController />, { isSpinning: true })

    expect(orbitControlsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        autoRotate: true,
        autoRotateSpeed: 1.0,
      }),
      undefined,
    )
  })

  it('disables autoRotate when isSpinning is false', () => {
    renderWithViewerContext(<CameraController />, { isSpinning: false })

    expect(orbitControlsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        autoRotate: false,
        autoRotateSpeed: 1.0,
      }),
      undefined,
    )
  })

  it('disables autoRotate while transitioning even if isSpinning is true', () => {
    renderWithViewerContext(<CameraController />, { isSpinning: true, isTransitioning: true })

    expect(orbitControlsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        autoRotate: false,
        autoRotateSpeed: 1.0,
      }),
      undefined,
    )
  })

  it('starts a transition when selectedOrgan has registered meshes', () => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
    const setCameraTarget = vi.fn()
    const setIsTransitioning = vi.fn()

    renderWithViewerContext(<CameraController />, {
      organNodes: new Map([['gan', [mesh]]]),
      selectedOrgan: 'gan',
      setCameraTarget,
      setIsTransitioning,
    })

    expect(setCameraTarget).toHaveBeenCalledWith('gan')
    expect(setIsTransitioning).toHaveBeenCalledWith(true)
  })

  it('lerps camera and controls target during an active transition', () => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
    const setCameraTarget = vi.fn()
    const setIsTransitioning = vi.fn()

    const { rerender } = renderWithViewerContext(<CameraController />, {
      organNodes: new Map([['gan', [mesh]]]),
      selectedOrgan: 'gan',
      setCameraTarget,
      setIsTransitioning,
    })

    rerender(
      <ViewerV2Context.Provider
        value={createViewerValue({
          cameraTarget: 'gan',
          isTransitioning: true,
          organNodes: new Map([['gan', [mesh]]]),
          selectedOrgan: 'gan',
          setCameraTarget,
          setIsTransitioning,
        })}
      >
        <CameraController />
      </ViewerV2Context.Provider>,
    )

    const frameCallback = useFrameMock.mock.calls.at(-1)?.[0]
    expect(frameCallback).toBeDefined()

    act(() => {
      vi.mocked(performance.now).mockReturnValue(500)
      frameCallback()
    })

    expect(camera.position.x).toBeCloseTo(0)
    expect(camera.position.y).toBeCloseTo(1.6)
    expect(camera.position.z).toBeCloseTo(5.5)
    const controls = getControls()
    expect(controls.target.x).toBeCloseTo(0)
    expect(controls.target.y).toBeCloseTo(0.25)
    expect(controls.target.z).toBeCloseTo(0)
    expect(controls.update).toHaveBeenCalledTimes(2)
    expect(setIsTransitioning).not.toHaveBeenCalledWith(false)
  })

  it('finishes the transition and clears isTransitioning at completion', () => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
    const setIsTransitioning = vi.fn()

    const { rerender } = renderWithViewerContext(<CameraController />, {
      organNodes: new Map([['gan', [mesh]]]),
      selectedOrgan: 'gan',
      setCameraTarget: vi.fn(),
      setIsTransitioning,
    })

    rerender(
      <ViewerV2Context.Provider
        value={createViewerValue({
          cameraTarget: 'gan',
          isTransitioning: true,
          organNodes: new Map([['gan', [mesh]]]),
          selectedOrgan: 'gan',
          setIsTransitioning,
        })}
      >
        <CameraController />
      </ViewerV2Context.Provider>,
    )

    const frameCallback = useFrameMock.mock.calls.at(-1)?.[0]
    act(() => {
      vi.mocked(performance.now).mockReturnValue(1000)
      frameCallback()
    })

    expect(camera.position.x).toBeCloseTo(0)
    expect(camera.position.y).toBeCloseTo(1.2)
    expect(camera.position.z).toBeCloseTo(3)
    const controls = getControls()
    expect(controls.target.toArray()).toEqual([0, 0, 0])
    expect(controls.update).toHaveBeenCalledTimes(3)
    expect(setIsTransitioning).toHaveBeenCalledWith(false)
  })

  it('snaps controls target to organ center and updates controls when transition completes', () => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2))
    mesh.position.set(3, 4, 5)
    const setIsTransitioning = vi.fn()

    const { rerender } = renderWithViewerContext(<CameraController />, {
      organNodes: new Map([['gan', [mesh]]]),
      selectedOrgan: 'gan',
      setCameraTarget: vi.fn(),
      setIsTransitioning,
    })

    rerender(
      <ViewerV2Context.Provider
        value={createViewerValue({
          cameraTarget: 'gan',
          isTransitioning: true,
          organNodes: new Map([['gan', [mesh]]]),
          selectedOrgan: 'gan',
          setIsTransitioning,
        })}
      >
        <CameraController />
      </ViewerV2Context.Provider>,
    )

    const frameCallback = useFrameMock.mock.calls.at(-1)?.[0]
    act(() => {
      vi.mocked(performance.now).mockReturnValue(1000)
      frameCallback()
    })

    const controls = getControls()
    expect(controls.target.toArray()).toEqual([3, 4, 5])
    expect(controls.update).toHaveBeenCalledTimes(3)
    expect(setIsTransitioning).toHaveBeenCalledWith(false)
  })

  it('clears selection, disables fly camera, and returns to overview on reset', () => {
    const setCameraTarget = vi.fn()
    const setFlyCameraActive = vi.fn()
    const setIsTransitioning = vi.fn()
    const setSelectedOrgan = vi.fn()
    const { rerender } = renderWithViewerContext(<CameraController />, {
      cameraTarget: 'gan',
      flyCameraActive: true,
      resetViewVersion: 0,
      selectedOrgan: 'gan',
      setCameraTarget,
      setFlyCameraActive,
      setIsTransitioning,
      setSelectedOrgan,
    })

    rerender(
      <ViewerV2Context.Provider
        value={createViewerValue({
          cameraTarget: 'gan',
          flyCameraActive: true,
          resetViewVersion: 1,
          selectedOrgan: 'gan',
          setCameraTarget,
          setFlyCameraActive,
          setIsTransitioning,
          setSelectedOrgan,
        })}
      >
        <CameraController />
      </ViewerV2Context.Provider>,
    )

    expect(setSelectedOrgan).toHaveBeenCalledWith(null)
    expect(setFlyCameraActive).toHaveBeenCalledWith(false)
    expect(setCameraTarget).toHaveBeenCalledWith('overview')
    expect(setIsTransitioning).toHaveBeenCalledWith(true)
  })
})
