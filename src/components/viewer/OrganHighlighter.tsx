import { useEffect, useRef } from 'react'
import * as THREE from 'three'

import { useViewer } from './viewerContext'

const HIGHLIGHT_EMISSIVE = 0x44ff88
const HIGHLIGHT_EMISSIVE_INTENSITY = 0.6

type MeshMaterial = THREE.Mesh['material']
type EmissiveMaterial = THREE.Material & {
  emissive: THREE.Color
  emissiveIntensity: number
}
interface HighlightedMaterialRecord {
  original: MeshMaterial
  highlighted: MeshMaterial
  mesh: THREE.Mesh
}

function getTrackedMaterial(mesh: THREE.Mesh, key: 'viewerBaseMaterial' | 'viewerOriginalMaterial'): MeshMaterial | null {
  const material = mesh.userData[key]

  return material instanceof THREE.Material || Array.isArray(material) ? material : null
}

function getNormalRestorableMaterial(mesh: THREE.Mesh, fallback: MeshMaterial): MeshMaterial {
  return getTrackedMaterial(mesh, 'viewerBaseMaterial') ?? fallback
}

function getFinalRestorableMaterial(mesh: THREE.Mesh, fallback: MeshMaterial): MeshMaterial {
  if (mesh.userData.viewerModelRestored === true) {
    return getTrackedMaterial(mesh, 'viewerOriginalMaterial') ?? mesh.material
  }

  return getNormalRestorableMaterial(mesh, fallback)
}

function materialSupportsEmissive(material: THREE.Material): material is EmissiveMaterial {
  const maybeEmissiveMaterial = material as Partial<EmissiveMaterial>
  return typeof maybeEmissiveMaterial.emissive?.setHex === 'function' && 'emissiveIntensity' in material
}

function disposeMaterial(material: MeshMaterial) {
  if (Array.isArray(material)) {
    material.forEach((currentMaterial) => currentMaterial.dispose())
    return
  }

  material.dispose()
}

function applyModelColor(material: MeshMaterial, modelColor: string | null) {
  const materials = Array.isArray(material) ? material : [material]

  materials.forEach((currentMaterial) => {
    if (currentMaterial instanceof THREE.MeshStandardMaterial) {
      currentMaterial.color.set(modelColor ?? '#ffffff')
    }
  })
}

function highlightMaterial(material: MeshMaterial): MeshMaterial {
  const materials = Array.isArray(material) ? material : [material]
  const highlightedMaterials = materials.map((currentMaterial) => {
    const highlightedMaterial = currentMaterial.clone()

    if (materialSupportsEmissive(highlightedMaterial)) {
      highlightedMaterial.emissive.setHex(HIGHLIGHT_EMISSIVE)
      highlightedMaterial.emissiveIntensity = HIGHLIGHT_EMISSIVE_INTENSITY
    }

    return highlightedMaterial
  })

  return Array.isArray(material) ? highlightedMaterials : highlightedMaterials[0]
}

export function OrganHighlighter() {
  const { selectedOrgan, organNodes, modelColor } = useViewer()
  const highlightedMaterials = useRef(new Map<string, HighlightedMaterialRecord>())

  useEffect(() => {
    const materialsToRestore = highlightedMaterials.current

    const getRecordKey = (organName: string, mesh: THREE.Mesh) => `${organName}:${mesh.uuid}`

    const restoreOrganMaterial = (recordKey: string) => {
      const record = materialsToRestore.get(recordKey)
      if (!record) return

      record.mesh.material = getNormalRestorableMaterial(record.mesh, record.original)
      disposeMaterial(record.highlighted)
      materialsToRestore.delete(recordKey)
    }

    organNodes.forEach((meshes, organName) => {
      meshes.forEach((mesh) => {
        const recordKey = getRecordKey(organName, mesh)
        if (organName === selectedOrgan) {
          restoreOrganMaterial(recordKey)

          applyModelColor(mesh.material, modelColor)
          const highlightedMaterial = highlightMaterial(mesh.material)
          materialsToRestore.set(recordKey, {
            original: mesh.material,
            highlighted: highlightedMaterial,
            mesh,
          })
          mesh.material = highlightedMaterial
        } else {
          restoreOrganMaterial(recordKey)
        }
      })
    })

    return () => {
      materialsToRestore.forEach((record) => {
        record.mesh.material = getFinalRestorableMaterial(record.mesh, record.original)
        disposeMaterial(record.highlighted)
      })
      materialsToRestore.clear()
    }
  }, [modelColor, organNodes, selectedOrgan])

  return null
}
