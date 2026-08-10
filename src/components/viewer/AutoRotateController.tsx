import { useFrame } from '@react-three/fiber'
import type { ReactNode } from 'react'
import { useRef } from 'react'
import * as THREE from 'three'

import { useViewer } from './viewerContext'

const ROTATION_SPEED = 0.3

interface AutoRotateControllerProps {
  children: ReactNode
}

export function AutoRotateController({ children }: AutoRotateControllerProps) {
  const { isSpinning } = useViewer()
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (!isSpinning || !groupRef.current) return
    groupRef.current.rotation.y += ROTATION_SPEED * delta
  })

  return <group ref={groupRef}>{children}</group>
}
