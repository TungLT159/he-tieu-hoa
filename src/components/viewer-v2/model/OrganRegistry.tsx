import { useEffect, useRef } from 'react'
import * as THREE from 'three'

import { getOrganInfoByMeshName } from '../organConfig'
import { createDigestiveMeshMaterial, disposeDigestiveMeshMaterial } from '../modelMaterials'
import { useViewerV2 } from '../viewerV2Context'

interface OrganRegistryProps {
  scene: THREE.Object3D
}

function getVertexCount(mesh: THREE.Mesh): number {
  return mesh.geometry.attributes.position?.count ?? 0
}

export function OrganRegistry({ scene }: OrganRegistryProps) {
  const { registerOrganNode, setIsModelLoaded, setLoadError, unregisterOrganNode } = useViewerV2()
  const registeredRef = useRef(false)

  useEffect(() => {
    if (registeredRef.current) return undefined

    registeredRef.current = true
    let foundOrgan = false
    const replacements: Array<{
      mesh: THREE.Mesh
      organName: string
      originalMaterial: THREE.Mesh['material']
      replacementMaterial: THREE.Mesh['material']
    }> = []

    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      if (getVertexCount(child) === 0) return

      const organ = getOrganInfoByMeshName(child.name)
      if (!organ) return

      const originalMaterial = child.material
      const replacementMaterial = createDigestiveMeshMaterial()

      child.userData.organName = organ.nodeName
      child.userData.viewerOriginalMaterial = originalMaterial
      child.userData.viewerBaseMaterial = replacementMaterial
      child.material = replacementMaterial
      registerOrganNode(organ.nodeName, child)
      replacements.push({ mesh: child, organName: organ.nodeName, originalMaterial, replacementMaterial })
      foundOrgan = true
    })

    setIsModelLoaded(true)
    setLoadError(null)

    if (!foundOrgan) {
      console.warn('No named organ meshes found in GLTF.')
    }

    return () => {
      registeredRef.current = false

      replacements.forEach(({ mesh, organName, originalMaterial, replacementMaterial }) => {
        unregisterOrganNode(organName, mesh)
        mesh.material = originalMaterial
        disposeDigestiveMeshMaterial(replacementMaterial)
        delete mesh.userData.viewerOriginalMaterial
        delete mesh.userData.viewerBaseMaterial
        delete mesh.userData.organName
      })
    }
  }, [scene, registerOrganNode, setIsModelLoaded, setLoadError, unregisterOrganNode])

  return null
}
