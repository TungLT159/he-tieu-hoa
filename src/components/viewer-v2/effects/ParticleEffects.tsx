import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

import { useViewerV2 } from '../viewerV2Context'
import { initializeParticleBurst, PARTICLE_COUNT } from './particleBurst'

const PARTICLE_LIFETIME_SECONDS = 1

export function ParticleEffects() {
  const { selectedOrgan, organNodes, isTransitioning } = useViewerV2()
  const activeRef = useRef(false)
  const previousOrganRef = useRef<string | null>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const velocitiesRef = useRef(new Float32Array(PARTICLE_COUNT * 3))
  const elapsedRef = useRef(0)
  const [positions] = useState(() => new Float32Array(PARTICLE_COUNT * 3))

  const geometry = useMemo(() => {
    const bufferGeometry = new THREE.BufferGeometry()
    bufferGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return bufferGeometry
  }, [positions])

  useEffect(() => {
    return () => {
      geometry.dispose()
    }
  }, [geometry])

  useEffect(() => {
    const selectionChanged = previousOrganRef.current !== selectedOrgan
    previousOrganRef.current = selectedOrgan

    if (!selectionChanged || !selectedOrgan || isTransitioning) return

    const meshes = organNodes.get(selectedOrgan)
    if (!meshes?.length) return

    const bounds = new THREE.Box3()
    meshes.forEach((mesh) => bounds.expandByObject(mesh))
    if (bounds.isEmpty()) return

    initializeParticleBurst(
      bounds.getCenter(new THREE.Vector3()),
      positions,
      velocitiesRef.current,
    )
    const positionAttribute = geometry.getAttribute('position')
    if (positionAttribute) positionAttribute.needsUpdate = true
    elapsedRef.current = 0
    activeRef.current = true
  }, [geometry, isTransitioning, organNodes, positions, selectedOrgan])

  useFrame((_, delta) => {
    if (!activeRef.current) return

    elapsedRef.current += delta


    if (elapsedRef.current >= PARTICLE_LIFETIME_SECONDS) {
      activeRef.current = false
      return
    }

    const positionAttribute = particlesRef.current?.geometry.getAttribute('position')
    if (!positionAttribute) return


    const positions = positionAttribute.array as Float32Array
    const velocities = velocitiesRef.current
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const positionIndex = i * 3
      positions[positionIndex] += velocities[positionIndex] * delta
      positions[positionIndex + 1] += velocities[positionIndex + 1] * delta
      positions[positionIndex + 2] += velocities[positionIndex + 2] * delta
    }
    positionAttribute.needsUpdate = true
  })

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        size={0.03}
        color="#4fc3f7"
        transparent
        opacity={0.8}
        depthWrite={false}
      />
    </points>
  )
}
