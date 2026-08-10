import { useEffect } from 'react'
import * as THREE from 'three'

import { useViewer } from './viewerContext'

function applyMaterialColor(material: THREE.Mesh['material'], color: string | null) {
  const materials = Array.isArray(material) ? material : [material]

  materials.forEach((currentMaterial) => {
    if (currentMaterial instanceof THREE.MeshStandardMaterial) {
      currentMaterial.color.set(color ?? '#ffffff')
    }
  })
}

function getColorTargetMaterial(mesh: THREE.Mesh): THREE.Mesh['material'] {
  const material = mesh.userData.viewerBaseMaterial

  return material instanceof THREE.Material || Array.isArray(material) ? material : mesh.material
}

interface ModelColorControllerProps {
  object: THREE.Object3D
}

export function ModelColorController({ object }: ModelColorControllerProps) {
  const { modelColor } = useViewer()

  useEffect(() => {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry.attributes.position?.count) {
        applyMaterialColor(getColorTargetMaterial(child), modelColor)
      }
    })
  }, [modelColor, object])

  return null
}
