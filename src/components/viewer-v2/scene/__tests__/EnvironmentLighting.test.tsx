import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { EnvironmentLighting } from '../EnvironmentLighting'

const { environmentMock, useViewerV2Mock } = vi.hoisted(() => ({
  environmentMock: vi.fn(() => null),
  useViewerV2Mock: vi.fn(() => ({ qualityPreset: 'medium' })),
}))

vi.mock('@react-three/drei', () => ({
  Environment: environmentMock,
}))

vi.mock('../../viewerV2Context', () => ({
  useViewerV2: useViewerV2Mock,
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

describe('EnvironmentLighting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useViewerV2Mock.mockReturnValue({ qualityPreset: 'medium' })
  })

  it('renders the studio environment preset at medium quality by default', () => {
    render(<EnvironmentLighting />)

    expect(environmentMock).toHaveBeenCalledWith(
      expect.objectContaining({ preset: 'studio', environmentIntensity: 0.6 }),
      undefined,
    )
  })

  it('renders ambient, key, fill, and rim lights with configured props', () => {
    const { container } = render(<EnvironmentLighting />)
    const lights = Array.from(container.querySelectorAll('r3f-node'))

    expect(lights).toHaveLength(4)
    expect(lights[0]).toHaveAttribute('data-node-type', 'ambientLight')
    expect(lights[0]).toHaveAttribute('intensity', '0.4')
    expect(lights[1]).toHaveAttribute('data-node-type', 'directionalLight')
    expect(lights[1]).toHaveAttribute('position', '5,8,5')
    expect(lights[1]).toHaveAttribute('intensity', '1.2')
    expect(lights[1]).toHaveAttribute('castShadow')
    expect(lights[1]).toHaveAttribute('shadow-mapSize-width', '1024')
    expect(lights[1]).toHaveAttribute('shadow-mapSize-height', '1024')
    expect(lights[1]).toHaveAttribute('shadow-camera-left', '-10')
    expect(lights[1]).toHaveAttribute('shadow-camera-right', '10')
    expect(lights[1]).toHaveAttribute('shadow-camera-top', '10')
    expect(lights[1]).toHaveAttribute('shadow-camera-bottom', '-10')
    expect(lights[1]).toHaveAttribute('shadow-camera-far', '50')
    expect(lights[2]).toHaveAttribute('data-node-type', 'directionalLight')
    expect(lights[2]).toHaveAttribute('position', '-5,2,-3')
    expect(lights[2]).toHaveAttribute('intensity', '0.42')
    expect(lights[3]).toHaveAttribute('data-node-type', 'directionalLight')
    expect(lights[3]).toHaveAttribute('position', '0,-2,4')
    expect(lights[3]).toHaveAttribute('intensity', '0.24')
  })

  it('reduces lighting and disables shadows for low quality', () => {
    useViewerV2Mock.mockReturnValue({ qualityPreset: 'low' })

    const { container } = render(<EnvironmentLighting />)
    const lights = Array.from(container.querySelectorAll('r3f-node'))

    expect(environmentMock).toHaveBeenCalledWith(
      expect.objectContaining({ environmentIntensity: 0.4 }),
      undefined,
    )
    expect(lights[0]).toHaveAttribute('intensity', '0.3')
    expect(lights[1]).toHaveAttribute('intensity', '0.8')
    expect(lights[1]).not.toHaveAttribute('castShadow')
    expect(lights[1]).toHaveAttribute('shadow-mapSize-width', '512')
    expect(lights[1]).toHaveAttribute('shadow-mapSize-height', '512')
    expect(lights[2]).toHaveAttribute('intensity', '0.28')
    expect(lights[3]).toHaveAttribute('intensity', '0.16')
  })

  it('increases lighting and shadow map size for high quality', () => {
    useViewerV2Mock.mockReturnValue({ qualityPreset: 'high' })

    const { container } = render(<EnvironmentLighting />)
    const lights = Array.from(container.querySelectorAll('r3f-node'))

    expect(environmentMock).toHaveBeenCalledWith(
      expect.objectContaining({ environmentIntensity: 0.8 }),
      undefined,
    )
    expect(lights[0]).toHaveAttribute('intensity', '0.4')
    expect(lights[1]).toHaveAttribute('intensity', '1.4')
    expect(lights[1]).toHaveAttribute('castShadow')
    expect(lights[1]).toHaveAttribute('shadow-mapSize-width', '2048')
    expect(lights[1]).toHaveAttribute('shadow-mapSize-height', '2048')
    expect(lights[2]).toHaveAttribute('intensity', '0.49')
    expect(lights[3]).toHaveAttribute('intensity', '0.28')
  })

  it('does not attach arbitrary primitives to the scene', () => {
    const { container } = render(<EnvironmentLighting />)

    expect(container.querySelector('[data-node-type="primitive"]')).toBeNull()
  })
})
