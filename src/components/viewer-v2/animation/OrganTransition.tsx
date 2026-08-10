import { animated, useSpring } from '@react-spring/three'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import * as THREE from 'three'

import { useViewerV2 } from '../viewerV2Context'
import {
  applyTransitionOpacity,
  getOrganTransitionTarget,
  restoreTransitionOpacity,
} from './organTransitionMaterials'
import type { TransitionOpacityController } from './organTransitionMaterials'

interface OrganTransitionProps {
  children?: ReactNode
}

interface OpacitySpringValue {
  get: () => number
}

function TransitionOpacityController({
  opacity,
  rootRef,
}: {
  opacity: OpacitySpringValue
  rootRef: React.RefObject<THREE.Group | null>
}) {
  const controllerRef = useRef<TransitionOpacityController>({ entries: [] })

  useFrame(() => {
    const root = rootRef.current
    if (!root) return
    applyTransitionOpacity(root, opacity.get(), controllerRef.current)
  })

  useEffect(() => {
    const controller = controllerRef.current
    return () => restoreTransitionOpacity(controller)
  }, [])

  return null
}

export function OrganTransition({ children }: OrganTransitionProps) {
  const { isTransitioning } = useViewerV2()
  const groupRef = useRef<THREE.Group>(null)
  const target = getOrganTransitionTarget(isTransitioning)
  const spring = useSpring({
    ...target,
    config: { tension: 260, friction: 26 },
  })

  if (!children) return null

  return (
    <animated.group ref={groupRef} scale={spring.scale}>
      <TransitionOpacityController opacity={spring.opacity} rootRef={groupRef} />
      {children}
    </animated.group>
  )
}
