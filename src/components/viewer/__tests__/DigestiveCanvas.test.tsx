import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

const environmentMock = vi.hoisted(() => vi.fn(() => null))
const threeElement = vi.hoisted(() => vi.fn(() => null))
const canvasProps = vi.hoisted(() => vi.fn())

vi.mock('@react-three/drei', () => ({
  Environment: environmentMock,
  Loader: () => null,
}))

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => {
    canvasProps(props)

    return (
      <div data-testid="viewer-canvas" {...props}>
        {children}
      </div>
    )
  },
}))

vi.mock('react/jsx-dev-runtime', async () => {
  const actual = await vi.importActual<typeof import('react/jsx-dev-runtime')>('react/jsx-dev-runtime')

  return {
    ...actual,
    jsxDEV: vi.fn((type, props, key, isStaticChildren, source, self) => {
      if (['color', 'ambientLight', 'directionalLight'].includes(String(type))) {
        threeElement(type, props)
        return null
      }

      return actual.jsxDEV(type, props, key, isStaticChildren, source, self)
    }),
  }
})

vi.mock('react/jsx-runtime', async () => {
  const actual = await vi.importActual<typeof import('react/jsx-runtime')>('react/jsx-runtime')

  return {
    ...actual,
    jsx: vi.fn((type, props, key) => {
      if (['color', 'ambientLight', 'directionalLight'].includes(String(type))) {
        threeElement(type, props)
        return null
      }

      return actual.jsx(type, props, key)
    }),
    jsxs: vi.fn((type, props, key) => {
      if (['color', 'ambientLight', 'directionalLight'].includes(String(type))) {
        threeElement(type, props)
        return null
      }

      return actual.jsxs(type, props, key)
    }),
  }
})

vi.mock('../BackgroundClickPlane', () => ({
  BackgroundClickPlane: () => null,
}))

vi.mock('../CameraController', () => ({
  CameraController: () => null,
}))

vi.mock('../DigestiveModel', () => ({
  DigestiveModel: () => <div data-testid="digestive-model" />,
}))

vi.mock('../AutoRotateController', () => ({
  AutoRotateController: ({ children }: { children: ReactNode }) => (
    <div data-testid="auto-rotate-controller">{children}</div>
  ),
}))

vi.mock('../OrganHighlighter', () => ({
  OrganHighlighter: () => null,
}))

import { DigestiveCanvas } from '../DigestiveCanvas'
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

function renderWithViewer(overrides: Partial<ViewerContextValue> = {}) {
  return render(
    <ViewerContext.Provider value={createViewerValue(overrides)}>
      <DigestiveCanvas />
    </ViewerContext.Provider>,
  )
}

describe('DigestiveCanvas', () => {
  it('keeps packaged viewer rendering local by not mounting a drei Environment preset', () => {
    renderWithViewer()

    expect(screen.getByTestId('digestive-model')).toBeInTheDocument()
    expect(environmentMock).not.toHaveBeenCalled()
  })

  it('uses the viewer background color from context', () => {
    renderWithViewer({ backgroundColor: '#0f172a' })

    expect(threeElement).toHaveBeenCalledWith('color', {
      attach: 'background',
      args: ['#0f172a'],
    })
  })

  it('marks the viewer canvas for scoped screenshots', () => {
    renderWithViewer()

    expect(screen.getByTestId('viewer-canvas')).toHaveAttribute('data-viewer-canvas', 'true')
  })

  it('preserves the WebGL drawing buffer so screenshots can read rendered pixels', () => {
    renderWithViewer()

    expect(canvasProps).toHaveBeenCalledWith(
      expect.objectContaining({
        gl: expect.objectContaining({ antialias: true, alpha: true, preserveDrawingBuffer: true }),
      }),
    )
  })

  it('wraps only the digestive model with auto rotate controller', () => {
    renderWithViewer()

    const autoRotateController = screen.getByTestId('auto-rotate-controller')
    expect(autoRotateController).toContainElement(screen.getByTestId('digestive-model'))
    expect(autoRotateController.children).toHaveLength(1)
  })
})
