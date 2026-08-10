import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

import { useViewerV2 } from '../viewerV2Context'

const HIGHLIGHT_COLOR = new THREE.Color('#4fc3f7')
const HIGHLIGHT_INTENSITY = 0.4

type HighlightedMesh = {
  mesh: THREE.Mesh
  baseMaterial: THREE.Mesh['material']
  highlightMaterial: THREE.MeshPhysicalMaterial
}

function createHighlightMaterial(baseMaterial: THREE.Mesh['material']): THREE.MeshPhysicalMaterial {
  const base = Array.isArray(baseMaterial) ? baseMaterial[0] : baseMaterial
  const physicalBase = base instanceof THREE.MeshPhysicalMaterial ? base : undefined

  return new THREE.MeshPhysicalMaterial({
    map: physicalBase?.map ?? null,
    normalMap: physicalBase?.normalMap ?? null,
    roughness: 0.3,
    metalness: 0.1,
    emissive: HIGHLIGHT_COLOR,
    emissiveIntensity: HIGHLIGHT_INTENSITY,
  })
}

export function HighlightShader() {
  const { selectedOrgan, organNodes, isTransitioning } = useViewerV2()
  const highlightedRef = useRef<HighlightedMesh[]>([])
  const timeRef = useRef(0)

  function cleanupHighlights() {
    highlightedRef.current.forEach(({ mesh, baseMaterial, highlightMaterial }) => {
      if (mesh.material === highlightMaterial) {
        mesh.material = baseMaterial
      }
      highlightMaterial.dispose()
      if (mesh.userData.viewerHighlightMaterial === highlightMaterial) {
        delete mesh.userData.viewerHighlightMaterial
      }
    })
    highlightedRef.current = []
  }

  useEffect(() => {
    cleanupHighlights()

    if (!selectedOrgan || isTransitioning) return cleanupHighlights

    const meshes = organNodes.get(selectedOrgan)
    if (!meshes?.length) return cleanupHighlights

    highlightedRef.current = meshes.map((mesh) => {
      const baseMaterial = mesh.material
      const highlightMaterial = createHighlightMaterial(baseMaterial)

      mesh.userData.viewerHighlightMaterial = highlightMaterial
      mesh.material = highlightMaterial

      return { mesh, baseMaterial, highlightMaterial }
    })

    return cleanupHighlights
  }, [selectedOrgan, organNodes, isTransitioning])

  useFrame((_, delta) => {
    timeRef.current += delta
    const pulse = Math.sin(timeRef.current * 2) * 0.15 + HIGHLIGHT_INTENSITY
    highlightedRef.current.forEach(({ mesh, highlightMaterial }) => {
      if (mesh.material === highlightMaterial) {
        highlightMaterial.emissiveIntensity = pulse
      }
    })
  })

  return null
}
