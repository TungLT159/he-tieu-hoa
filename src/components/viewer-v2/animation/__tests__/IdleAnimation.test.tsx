import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { IdleAnimation } from '../IdleAnimation'
import { calculateIdleTransform } from '../idleAnimationMath'

const { useFrameMock } = vi.hoisted(() => ({
  useFrameMock: vi.fn(),
}))

vi.mock('@react-three/fiber', () => ({
  useFrame: useFrameMock,
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

describe('IdleAnimation', () => {
  it('renders children inside a group', () => {
    const { container } = render(
      <IdleAnimation>
        <mesh>
          <boxGeometry />
          <meshBasicMaterial />
        </mesh>
      </IdleAnimation>,
    )

    const group = container.querySelector('[data-node-type="group"]')
    expect(group).not.toBeNull()
    expect(group?.querySelector('[data-node-type="mesh"]')).not.toBeNull()
  })

  it('calculates subtle breathing scale and y float from elapsed time', () => {
    const transform = calculateIdleTransform(2.5)

    expect(transform.scale).toBeCloseTo(1 + Math.sin(2.5 * 0.8) * 0.005)
    expect(transform.y).toBeCloseTo(Math.sin(2.5 * 0.5) * 0.05)
  })
})
