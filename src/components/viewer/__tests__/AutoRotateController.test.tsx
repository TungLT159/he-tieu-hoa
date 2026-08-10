import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import * as THREE from 'three'
import { describe, expect, it, vi } from 'vitest'

import { AutoRotateController } from '../AutoRotateController'
import { ViewerContext } from '../viewerContext'
import type { ViewerContextValue } from '../viewerContext'

const { frameCallbacks, groupRef } = vi.hoisted(() => ({
  frameCallbacks: [] as Array<(state: unknown, delta: number) => void>,
  groupRef: { current: null as THREE.Group | null },
}))

vi.mock('@react-three/fiber', () => ({
  useFrame: (callback: (state: unknown, delta: number) => void) => {
    frameCallbacks.push(callback)
  },
}))

function captureGroupRef(type: unknown, props: unknown) {
  if (type !== 'group') return

  const group = new THREE.Group()
  groupRef.current = group
  const ref = (props as { ref?: React.Ref<THREE.Group> }).ref

  if (typeof ref === 'function') ref(group)
  else if (ref && 'current' in ref) ref.current = group
}

vi.mock('react/jsx-dev-runtime', async () => {
  const actual = await vi.importActual<typeof import('react/jsx-dev-runtime')>('react/jsx-dev-runtime')

  return {
    ...actual,
    jsxDEV: vi.fn((type, props, key, isStaticChildren, source, self) => {
      captureGroupRef(type, props)
      if (type === 'group') return <div data-testid="auto-rotate-group">{props.children}</div>
      return actual.jsxDEV(type, props, key, isStaticChildren, source, self)
    }),
  }
})

vi.mock('react/jsx-runtime', async () => {
  const actual = await vi.importActual<typeof import('react/jsx-runtime')>('react/jsx-runtime')

  return {
    ...actual,
    jsx: vi.fn((type, props, key) => {
      captureGroupRef(type, props)
      if (type === 'group') return <div data-testid="auto-rotate-group">{props.children}</div>
      return actual.jsx(type, props, key)
    }),
    jsxs: vi.fn((type, props, key) => {
      captureGroupRef(type, props)
      if (type === 'group') return <div data-testid="auto-rotate-group">{props.children}</div>
      return actual.jsxs(type, props, key)
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
  frameCallbacks.length = 0
  groupRef.current = null

  return render(
    <ViewerContext.Provider value={createViewerValue(overrides)}>
      <AutoRotateController>{children}</AutoRotateController>
    </ViewerContext.Provider>,
  )
}

describe('AutoRotateController', () => {
  it('rotates its group around the Y axis when spinning is enabled', () => {
    renderWithViewer(<div>model</div>, { isSpinning: true })

    frameCallbacks[0]({}, 2)

    expect(groupRef.current?.rotation.y).toBeCloseTo(0.6)
  })

  it('does not rotate its group when spinning is disabled', () => {
    renderWithViewer(<div>model</div>, { isSpinning: false })

    frameCallbacks[0]({}, 2)

    expect(groupRef.current?.rotation.y).toBe(0)
  })
})
