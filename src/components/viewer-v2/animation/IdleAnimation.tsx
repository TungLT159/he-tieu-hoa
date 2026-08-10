import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { ReactNode } from 'react'
import type { Group } from 'three'

import { calculateIdleTransform } from './idleAnimationMath'

interface IdleAnimationProps {
  children: ReactNode
}

export function IdleAnimation({ children }: IdleAnimationProps) {
  const groupRef = useRef<Group>(null)
  const timeRef = useRef(0)

  useFrame((_, delta) => {
    timeRef.current += delta
    if (!groupRef.current) return

    const transform = calculateIdleTransform(timeRef.current)
    groupRef.current.scale.setScalar(transform.scale)
    groupRef.current.position.y = transform.y
  })

  return <group ref={groupRef}>{children}</group>
}
