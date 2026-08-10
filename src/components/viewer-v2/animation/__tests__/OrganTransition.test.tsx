import { render } from '@testing-library/react'
import * as THREE from 'three'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ViewerV2Context } from '../../viewerV2Context'
import type { ViewerV2ContextValue } from '../../viewerV2Context'
import { OrganTransition } from '../OrganTransition'
import {
  applyTransitionOpacity,
  getOrganTransitionTarget,
  restoreTransitionOpacity,
} from '../organTransitionMaterials'

const { animatedGroupMock, mockGroupRef, springOpacity, useFrameMock } = vi.hoisted(() => ({
  animatedGroupMock: vi.fn(
    ({ children, ref, ...props }: { children?: React.ReactNode; ref?: React.Ref<unknown>; [key: string]: unknown }) => {
      if (mockGroupRef.current) {
        if (typeof ref === 'function') ref(mockGroupRef.current)
        if (ref && typeof ref === 'object') ref.current = mockGroupRef.current
      }

      return (
        <r3f-node data-node-type="animated.group" {...props}>
          {children}
        </r3f-node>
      )
    },
  ),
  mockGroupRef: { current: null as unknown },
  springOpacity: { current: 0.35 },
  useFrameMock: vi.fn(),
}))

vi.mock('@react-three/fiber', () => ({
  useFrame: useFrameMock,
}))

vi.mock('@react-spring/three', () => ({
  animated: {
    group: animatedGroupMock,
  },
  useSpring: (target: { opacity: number; scale: number }) => ({
    ...target,
    opacity: { get: () => springOpacity.current },
  }),
}))

const baseViewerContext: ViewerV2ContextValue = {
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
}

function renderWithViewerContext(
  ui: React.ReactNode,
  value: Partial<ViewerV2ContextValue> = {},
) {
  return render(
    <ViewerV2Context.Provider value={{ ...baseViewerContext, ...value }}>
      {ui}
    </ViewerV2Context.Provider>,
  )
}

describe('OrganTransition', () => {
  beforeEach(() => {
    animatedGroupMock.mockClear()
    useFrameMock.mockClear()
    mockGroupRef.current = null
    springOpacity.current = 0.35
  })

  it('renders without crashing and returns null when there are no children', () => {
    const { container } = renderWithViewerContext(<OrganTransition />)

    expect(container).toBeTruthy()
    expect(animatedGroupMock).not.toHaveBeenCalled()
  })

  it('wraps children in an animated group', () => {
    const { container } = renderWithViewerContext(
      <OrganTransition>
        <div data-testid="child" />
      </OrganTransition>,
    )

    expect(container.querySelector('[data-node-type="animated.group"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="child"]')).not.toBeNull()
  })

  it('uses the assigned group ref and current spring opacity on each frame', () => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ opacity: 1 }),
    )
    const group = new THREE.Group()
    group.add(mesh)
    mockGroupRef.current = group

    renderWithViewerContext(
      <OrganTransition>
        <div />
      </OrganTransition>,
      { isTransitioning: true },
    )
    const frameCallback = useFrameMock.mock.calls[0]?.[0]

    springOpacity.current = 0.42
    frameCallback()

    expect((mesh.material as THREE.Material).opacity).toBe(0.42)
    springOpacity.current = 1
    frameCallback()

    expect((mesh.material as THREE.Material).opacity).toBe(1)
  })

  it('maps idle transition state to full scale and opacity', () => {
    expect(getOrganTransitionTarget(false)).toEqual({ opacity: 1, scale: 1 })
  })

  it('maps active transition state to reduced scale and opacity', () => {
    expect(getOrganTransitionTarget(true)).toEqual({ opacity: 0.35, scale: 0.96 })
  })

  it('applies transition opacity with temporary cloned material and restores original material', () => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ opacity: 1, transparent: false }),
    )
    const originalMaterial = mesh.material as THREE.MeshBasicMaterial
    const group = new THREE.Group()
    group.add(mesh)

    const controller = applyTransitionOpacity(group, 0.35)
    const transitionMaterial = mesh.material as THREE.MeshBasicMaterial

    expect(transitionMaterial).not.toBe(originalMaterial)
    expect(transitionMaterial.opacity).toBe(0.35)
    expect(transitionMaterial.transparent).toBe(true)
    expect(originalMaterial.opacity).toBe(1)
    expect(originalMaterial.transparent).toBe(false)

    restoreTransitionOpacity(controller)

    expect(mesh.material).toBe(originalMaterial)
  })

  it('updates and disposes temporary material without replacing the original', () => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ opacity: 1 }),
    )
    const originalMaterial = mesh.material as THREE.MeshBasicMaterial
    const group = new THREE.Group()
    group.add(mesh)

    const controller = applyTransitionOpacity(group, 0.35)
    const transitionMaterial = mesh.material as THREE.MeshBasicMaterial
    const disposeSpy = vi.spyOn(transitionMaterial, 'dispose')

    applyTransitionOpacity(group, 0.7, controller)

    expect(mesh.material).toBe(transitionMaterial)
    expect(transitionMaterial.opacity).toBe(0.7)
    expect(originalMaterial.opacity).toBe(1)

    restoreTransitionOpacity(controller)

    expect(disposeSpy).toHaveBeenCalledTimes(1)
    expect(mesh.material).toBe(originalMaterial)
  })
})
