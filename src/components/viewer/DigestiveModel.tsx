import { useFBX } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { useCallback, useEffect } from 'react'
import * as THREE from 'three'

import { createDigestiveMeshMaterial, disposeDigestiveMeshMaterial } from './modelMaterials'
import { ModelColorController } from './ModelColorController'
import { normalizeModelForViewer } from './modelTransform'
import { getOrganInfoByMeshName } from './organConfig'
import { useViewer } from './viewerContext'

function resolveModelUrl(): string {
  return '/models/hetieuhoa.fbx'
}

function getVertexCount(mesh: THREE.Mesh): number {
  return mesh.geometry.attributes.position?.count ?? 0
}

export function DigestiveModel() {
  const fbx = useFBX(resolveModelUrl())
  const {
    registerModelMesh,
    registerOrganNode,
    setIsModelLoaded,
    setLastClickedMeshName,
    setLoadError,
    setSelectedOrgan,
  } = useViewer()

  useEffect(() => {
    let foundNamedOrgan = false
    const replacedMaterials: Array<{
      mesh: THREE.Mesh
      originalMaterial: THREE.Mesh['material']
      texturedMaterial: THREE.Mesh['material']
    }> = []

    normalizeModelForViewer(fbx)

    fbx.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return

      const organ = getOrganInfoByMeshName(child.name)
      const vertexCount = getVertexCount(child)
      const organName = organ?.nodeName ?? null
      const isSelectable = organName !== null && vertexCount > 0

      if (vertexCount > 0) {
        const originalMaterial = child.material
        const texturedMaterial = createDigestiveMeshMaterial()
        child.userData.viewerOriginalMaterial = originalMaterial
        child.userData.viewerBaseMaterial = texturedMaterial
        child.userData.viewerModelRestored = false
        child.material = texturedMaterial
        replacedMaterials.push({ mesh: child, originalMaterial, texturedMaterial })
      }

      registerModelMesh({
        meshUuid: child.uuid,
        meshName: child.name,
        organName,
        vertexCount,
        isSelectable,
        isEmpty: vertexCount === 0,
      })

      if (!organ || vertexCount === 0) return

      child.userData.organName = organ.nodeName
      registerOrganNode(organ.nodeName, child)
      foundNamedOrgan = true
    })

    setIsModelLoaded(true)
    setLoadError(null)

    if (!foundNamedOrgan) {
      console.warn('No named organ meshes found in FBX. Click-to-select disabled.')
    }

    return () => {
      replacedMaterials.forEach(({ mesh, originalMaterial, texturedMaterial }) => {
        mesh.userData.viewerModelRestored = true
        mesh.material = originalMaterial

        disposeDigestiveMeshMaterial(texturedMaterial)
      })
    }
  }, [fbx, registerModelMesh, registerOrganNode, setIsModelLoaded, setLoadError])

  const handlePointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      const object = event.object
      if (!(object instanceof THREE.Mesh)) return

      setLastClickedMeshName(object.name)
      if (typeof object.userData.organName !== 'string') return

      event.stopPropagation()
      setSelectedOrgan(object.userData.organName)
    },
    [setLastClickedMeshName, setSelectedOrgan],
  )

  return (
    <>
      <primitive object={fbx} onPointerDown={handlePointerDown} />
      <ModelColorController object={fbx} />
    </>
  )
}
