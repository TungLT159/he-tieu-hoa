import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import * as THREE from 'three'
import { describe, expect, it, vi } from 'vitest'

import { ViewerV2Context } from '../../viewerV2Context'
import type { ViewerV2ContextValue } from '../../viewerV2Context'
import { ParticleEffects } from '../ParticleEffects'
import { initializeParticleBurst, PARTICLE_COUNT } from '../particleBurst'

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

describe('ParticleEffects', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <ViewerHarness value={createViewerValue()}>
        <ParticleEffects />
      </ViewerHarness>,
    )

    expect(container).toBeTruthy()
  })

  it('initializes particle positions and velocities around a center point', () => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const velocities = new Float32Array(PARTICLE_COUNT * 3)
    const center = new THREE.Vector3(1, 2, 3)
    const random = vi.fn(() => 0.75)

    initializeParticleBurst(center, positions, velocities, random)

    expect(random).toHaveBeenCalledTimes(PARTICLE_COUNT * 6)
    expect(positions[0]).toBeCloseTo(1.125)
    expect(positions[1]).toBeCloseTo(2.125)
    expect(positions[2]).toBeCloseTo(3.125)
    expect(velocities[0]).toBeCloseTo(0.5)
    expect(velocities[1]).toBeCloseTo(1)
    expect(velocities[2]).toBeCloseTo(0.5)
  })
})
