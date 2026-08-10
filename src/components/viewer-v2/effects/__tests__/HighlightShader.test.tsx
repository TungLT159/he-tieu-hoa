import { act, render } from '@testing-library/react'
import type { ReactNode } from 'react'
import * as THREE from 'three'
import { describe, expect, it, vi } from 'vitest'

import { ViewerV2Context } from '../../viewerV2Context'
import type { ViewerV2ContextValue } from '../../viewerV2Context'
import { HighlightShader } from '../HighlightShader'

const { useFrameMock } = vi.hoisted(() => ({
  useFrameMock: vi.fn(),
}))

vi.mock('@react-three/fiber', () => ({
  useFrame: useFrameMock,
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

function ViewerHarness({ children, value }: { children: ReactNode; value: ViewerV2ContextValue }) {
  return <ViewerV2Context.Provider value={value}>{children}</ViewerV2Context.Provider>
}

describe('HighlightShader', () => {
  it('applies a physical highlight material to selected organ meshes', () => {
    const baseMaterial = new THREE.MeshPhysicalMaterial({ roughness: 0.6 })
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), baseMaterial)
    const organNodes = new Map([['da_day', [mesh]]])

    render(
      <ViewerHarness value={createViewerValue({ selectedOrgan: 'da_day', organNodes })}>
        <HighlightShader />
      </ViewerHarness>,
    )

    expect(mesh.material).toBeInstanceOf(THREE.MeshPhysicalMaterial)
    expect(mesh.material).not.toBe(baseMaterial)
    expect((mesh.material as THREE.MeshPhysicalMaterial).emissive.getHexString()).toBe('4fc3f7')
    expect((mesh.material as THREE.MeshPhysicalMaterial).emissiveIntensity).toBe(0.4)
  })

  it('restores the previous material and disposes the highlight when selection changes', () => {
    const baseMaterial = new THREE.MeshPhysicalMaterial()
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), baseMaterial)
    const organNodes = new Map([['da_day', [mesh]]])
    const { rerender } = render(
      <ViewerHarness value={createViewerValue({ selectedOrgan: 'da_day', organNodes })}>
        <HighlightShader />
      </ViewerHarness>,
    )
    const highlightMaterial = mesh.material as THREE.MeshPhysicalMaterial
    const disposeSpy = vi.spyOn(highlightMaterial, 'dispose')

    rerender(
      <ViewerHarness value={createViewerValue({ selectedOrgan: null, organNodes })}>
        <HighlightShader />
      </ViewerHarness>,
    )

    expect(mesh.material).toBe(baseMaterial)
    expect(disposeSpy).toHaveBeenCalledTimes(1)
    expect(mesh.userData.viewerHighlightMaterial).toBeUndefined()
  })

  it('restores the previous material and disposes the highlight on unmount', () => {
    const baseMaterial = new THREE.MeshPhysicalMaterial()
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), baseMaterial)
    const organNodes = new Map([['da_day', [mesh]]])
    const { unmount } = render(
      <ViewerHarness value={createViewerValue({ selectedOrgan: 'da_day', organNodes })}>
        <HighlightShader />
      </ViewerHarness>,
    )
    const highlightMaterial = mesh.material as THREE.MeshPhysicalMaterial
    const disposeSpy = vi.spyOn(highlightMaterial, 'dispose')

    unmount()

    expect(mesh.material).toBe(baseMaterial)
    expect(disposeSpy).toHaveBeenCalledTimes(1)
    expect(mesh.userData.viewerHighlightMaterial).toBeUndefined()
  })

  it('clears the highlight while transitioning', () => {
    const baseMaterial = new THREE.MeshPhysicalMaterial()
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), baseMaterial)
    const organNodes = new Map([['da_day', [mesh]]])
    const { rerender } = render(
      <ViewerHarness value={createViewerValue({ selectedOrgan: 'da_day', organNodes })}>
        <HighlightShader />
      </ViewerHarness>,
    )
    const highlightMaterial = mesh.material as THREE.MeshPhysicalMaterial
    const disposeSpy = vi.spyOn(highlightMaterial, 'dispose')

    rerender(
      <ViewerHarness value={createViewerValue({ selectedOrgan: 'da_day', organNodes, isTransitioning: true })}>
        <HighlightShader />
      </ViewerHarness>,
    )

    expect(mesh.material).toBe(baseMaterial)
    expect(disposeSpy).toHaveBeenCalledTimes(1)
  })

  it('pulses active highlight emissive intensity in useFrame', () => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshPhysicalMaterial(),
    )
    const organNodes = new Map([['da_day', [mesh]]])
    render(
      <ViewerHarness value={createViewerValue({ selectedOrgan: 'da_day', organNodes })}>
        <HighlightShader />
      </ViewerHarness>,
    )

    act(() => {
      useFrameMock.mock.calls.at(-1)?.[0]({} as never, 0.5)
    })

    expect((mesh.material as THREE.MeshPhysicalMaterial).emissiveIntensity).not.toBe(0.4)
  })
})
