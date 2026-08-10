import { useEffect } from 'react'
import * as THREE from 'three'

import { useViewerV2 } from '../viewerV2Context'

interface ModelColorControllerProps {
  object: THREE.Object3D
}

const ORIGINAL_COLOR_KEY = 'viewerOriginalMaterialColor'

function materialHasColor(material: THREE.Material): material is THREE.Material & { color: THREE.Color } {
  return 'color' in material && material.color instanceof THREE.Color
}

function getMaterials(material: THREE.Mesh['material']): THREE.Material[] {
  return Array.isArray(material) ? material : [material]
}

function getBaseMaterials(mesh: THREE.Mesh): THREE.Material[] {
  const baseMaterial = mesh.userData.viewerBaseMaterial as THREE.Mesh['material'] | undefined
  return baseMaterial ? getMaterials(baseMaterial) : []
}

function updateMaterials(materials: THREE.Material[], modelColor: string | null) {
  materials.forEach((material) => {
    if (!materialHasColor(material)) return

    material.userData[ORIGINAL_COLOR_KEY] ??= material.color.clone()
    const originalColor = material.userData[ORIGINAL_COLOR_KEY] as THREE.Color
    material.color.copy(modelColor ? new THREE.Color(modelColor) : originalColor)
    material.needsUpdate = true
  })
}

function restoreMaterials(materials: THREE.Material[]) {
  materials.forEach((material) => {
    if (!materialHasColor(material)) return

    const originalColor = material.userData[ORIGINAL_COLOR_KEY]
    if (originalColor instanceof THREE.Color) {
      material.color.copy(originalColor)
      material.needsUpdate = true
    }
  })
}

export function ModelColorController({ object }: ModelColorControllerProps) {
  const { modelColor } = useViewerV2()

  useEffect(() => {
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return

      const baseMaterials = getBaseMaterials(child)
      updateMaterials(baseMaterials.length > 0 ? baseMaterials : getMaterials(child.material), modelColor)
    })

    return () => {
      object.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return

          const baseMaterials = getBaseMaterials(child)
          restoreMaterials(baseMaterials.length > 0 ? baseMaterials : getMaterials(child.material))
        })
      }
  }, [modelColor, object])

  return null
}
