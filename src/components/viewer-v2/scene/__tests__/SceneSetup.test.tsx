import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import * as THREE from 'three'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ViewerV2Context } from '../../viewerV2Context'
import type { ViewerV2ContextValue } from '../../viewerV2Context'
import { SceneSetup } from '../SceneSetup'

const { componentMock, suspenseMock } = vi.hoisted(() => ({
  componentMock: vi.fn((name: string, children?: ReactNode) => (
    <div data-testid={name}>{children}</div>
  )),
  suspenseMock: vi.fn(({ children }: { children?: ReactNode }) => (
    <div data-testid="Suspense">{children}</div>
  )),
}))

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    Suspense: suspenseMock,
  }
})

vi.mock('../../model/ModelLoader', () => ({
  ModelLoader: () => componentMock('ModelLoader'),
}))

vi.mock('../../animation/IdleAnimation', () => ({
  IdleAnimation: ({ children }: { children: ReactNode }) => componentMock('IdleAnimation', children),
}))

vi.mock('../../animation/OrganTransition', () => ({
  OrganTransition: ({ children }: { children?: ReactNode }) => componentMock('OrganTransition', children),
}))

vi.mock('../../effects/SelectionOutline', () => ({
  SelectionOutlineProvider: ({ children }: { children: ReactNode }) => componentMock('SelectionOutline', children),
  SelectionOutlineTarget: ({ children }: { children: ReactNode }) => componentMock('SelectionOutlineTarget', children),
}))

vi.mock('../../effects/HighlightShader', () => ({
  HighlightShader: () => componentMock('HighlightShader'),
}))

vi.mock('../../effects/ParticleEffects', () => ({
  ParticleEffects: () => componentMock('ParticleEffects'),
}))

vi.mock('../../camera/CameraController', () => ({
  CameraController: () => componentMock('CameraController'),
}))

vi.mock('../../camera/AutoTourController', () => ({
  AutoTourController: () => componentMock('AutoTourController'),
}))

vi.mock('../../ui/FlyCameraTour', () => ({
  FlyCameraTour: () => componentMock('FlyCameraTour'),
}))

vi.mock('../EnvironmentLighting', () => ({
  EnvironmentLighting: () => componentMock('EnvironmentLighting'),
}))

vi.mock('../PostProcessing', () => ({
  PostProcessing: () => componentMock('PostProcessing'),
}))

vi.mock('react/jsx-runtime', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react/jsx-runtime')>()
  return {
    ...actual,
    jsx: (type: unknown, props: Record<string, unknown>, key?: string) => {
      if (typeof type === 'string') {
        return actual.jsx('r3f-node', { 'data-node-type': type, ...props }, key)
      }
      return actual.jsx(type, props, key)
    },
    jsxs: (type: unknown, props: Record<string, unknown>, key?: string) => {
      if (typeof type === 'string') {
        return actual.jsxs('r3f-node', { 'data-node-type': type, ...props }, key)
      }
      return actual.jsxs(type, props, key)
    },
  }
})

vi.mock('react/jsx-dev-runtime', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react/jsx-dev-runtime')>()
  return {
    ...actual,
    jsxDEV: (
      type: unknown,
      props: Record<string, unknown>,
      key: string | undefined,
      isStaticChildren: boolean,
      source: unknown,
      self: unknown,
    ) => {
      if (typeof type === 'string') {
        const sourceKey =
          source && typeof source === 'object' && 'lineNumber' in source
            ? `${type}-${String(source.lineNumber)}`
            : type
        return actual.jsxDEV(
          'r3f-node',
          { 'data-node-type': type, ...props },
          key ?? sourceKey,
          isStaticChildren,
          source,
          self,
        )
      }
      return actual.jsxDEV(type, props, key, isStaticChildren, source, self)
    },
  }
})

function createViewerValue(overrides: Partial<ViewerV2ContextValue> = {}): ViewerV2ContextValue {
  return {
    selectedOrgan: null,
    setSelectedOrgan: vi.fn(),
    organNodes: new Map<string, THREE.Mesh[]>(),
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
    backgroundColor: '#123456',
    setBackgroundColor: vi.fn(),
    modelColor: null,
    setModelColor: vi.fn(),
    isSpinning: false,
    setIsSpinning: vi.fn(),
    flyCameraActive: false,
    setFlyCameraActive: vi.fn(),
    flyCameraPaused: false,
    setFlyCameraPaused: vi.fn(),
    flyCameraOrganPopup: null,
    setFlyCameraOrganPopup: vi.fn(),
    qualityPreset: 'medium',
    setQualityPreset: vi.fn(),
    volume: 80,
    setVolume: vi.fn(),
    voice: 'bac',
    setVoice: vi.fn(),
    annotationTool: 'pen',
    setAnnotationTool: vi.fn(),
    ...overrides,
  }
}

function renderWithViewer(overrides: Partial<ViewerV2ContextValue> = {}) {
  const value = createViewerValue(overrides)

  return {
    value,
    ...render(
      <ViewerV2Context.Provider value={value}>
        <SceneSetup />
      </ViewerV2Context.Provider>,
    ),
  }
}

describe('SceneSetup', () => {
  beforeEach(() => {
    componentMock.mockClear()
    suspenseMock.mockClear()
  })

  it('uses the configured viewer background color', () => {
    const { container } = renderWithViewer({ backgroundColor: '#abcdef' })

    const background = container.querySelector('[data-node-type="color"]')
    expect(background).toHaveAttribute('attach', 'background')
    expect(background).toHaveAttribute('args', '#abcdef')
  })

  it('composes lighting, effects, controls, and post-processing', () => {
    renderWithViewer()

    expect(screen.getByTestId('EnvironmentLighting')).toBeTruthy()
    expect(screen.getByTestId('HighlightShader')).toBeTruthy()
    expect(screen.queryByTestId('ParticleEffects')).not.toBeInTheDocument()
    expect(screen.getByTestId('CameraController')).toBeTruthy()
    expect(screen.getByTestId('AutoTourController')).toBeTruthy()
    expect(screen.getByTestId('PostProcessing')).toBeTruthy()
    expect(screen.getByTestId('FlyCameraTour')).toBeTruthy()
    expect(suspenseMock).toHaveBeenCalledWith(
      expect.objectContaining({ fallback: null }),
      undefined,
    )
  })

  it('wraps the model with selection outline, organ transition, and idle animation in order', () => {
    renderWithViewer()

    const selection = screen.getByTestId('SelectionOutline')
    const target = screen.getByTestId('SelectionOutlineTarget')
    const transition = screen.getByTestId('OrganTransition')
    const idle = screen.getByTestId('IdleAnimation')
    const model = screen.getByTestId('ModelLoader')

    expect(selection.contains(target)).toBe(true)
    expect(target.contains(transition)).toBe(true)
    expect(transition.contains(idle)).toBe(true)
    expect(idle.contains(model)).toBe(true)
  })

  it('keeps post-processing inside the selection provider without selecting it', () => {
    renderWithViewer()

    const selection = screen.getByTestId('SelectionOutline')
    const target = screen.getByTestId('SelectionOutlineTarget')
    const transition = screen.getByTestId('OrganTransition')
    const postProcessing = screen.getByTestId('PostProcessing')
    const flyCameraTour = screen.getByTestId('FlyCameraTour')

    expect(selection.contains(transition)).toBe(true)
    expect(selection.contains(postProcessing)).toBe(true)
    expect(selection.contains(flyCameraTour)).toBe(true)
    expect(target.contains(postProcessing)).toBe(false)
    expect(target.contains(flyCameraTour)).toBe(false)
  })

  it('clears the current selection when the background plane is clicked', () => {
    const setSelectedOrgan = vi.fn()
    const { container } = renderWithViewer({ selectedOrgan: 'da_day', setSelectedOrgan })
    const plane = container.querySelector('[data-node-type="mesh"]')

    expect(plane).not.toBeNull()
    fireEvent.pointerDown(plane as Element)

    expect(setSelectedOrgan).toHaveBeenCalledWith(null)
  })
})
