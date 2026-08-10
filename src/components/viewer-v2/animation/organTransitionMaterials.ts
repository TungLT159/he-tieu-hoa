import * as THREE from 'three'

interface TransitionMaterialEntry {
  mesh: THREE.Mesh
  originalMaterial: THREE.Mesh['material']
  transitionMaterial: THREE.Mesh['material']
}

export interface TransitionOpacityController {
  entries: TransitionMaterialEntry[]
}

export function getOrganTransitionTarget(isTransitioning: boolean): {
  opacity: number
  scale: number
} {
  return isTransitioning ? { opacity: 0.35, scale: 0.96 } : { opacity: 1, scale: 1 }
}

function cloneMaterialForOpacity(material: THREE.Material, opacity: number): THREE.Material {
  const transitionMaterial = material.clone()
  transitionMaterial.transparent = opacity < 1 || material.transparent
  transitionMaterial.opacity = opacity
  transitionMaterial.needsUpdate = true
  return transitionMaterial
}

function cloneMeshMaterialForOpacity(
  material: THREE.Mesh['material'],
  opacity: number,
): THREE.Mesh['material'] {
  if (Array.isArray(material)) {
    return material.map((entry) => cloneMaterialForOpacity(entry, opacity))
  }

  return cloneMaterialForOpacity(material, opacity)
}

function setMeshMaterialOpacity(material: THREE.Mesh['material'], opacity: number): void {
  const materials = Array.isArray(material) ? material : [material]
  materials.forEach((entry) => {
    entry.transparent = opacity < 1 || entry.transparent
    entry.opacity = opacity
    entry.needsUpdate = true
  })
}

function disposeMeshMaterial(material: THREE.Mesh['material']): void {
  const materials = Array.isArray(material) ? material : [material]
  materials.forEach((entry) => entry.dispose())
}

export function restoreTransitionOpacity(controller: TransitionOpacityController): void {
  controller.entries.forEach(({ mesh, originalMaterial, transitionMaterial }) => {
    if (mesh.material === transitionMaterial) {
      mesh.material = originalMaterial
    }
    disposeMeshMaterial(transitionMaterial)
  })
  controller.entries = []
}

export function applyTransitionOpacity(
  root: THREE.Object3D,
  opacity: number,
  controller: TransitionOpacityController = { entries: [] },
): TransitionOpacityController {
  if (opacity >= 1) {
    restoreTransitionOpacity(controller)
    return controller
  }

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return

    const existingEntry = controller.entries.find((entry) => entry.mesh === object)
    if (existingEntry) {
      setMeshMaterialOpacity(existingEntry.transitionMaterial, opacity)
      return
    }

    const originalMaterial = object.material
    const transitionMaterial = cloneMeshMaterialForOpacity(originalMaterial, opacity)
    object.material = transitionMaterial
    controller.entries.push({ mesh: object, originalMaterial, transitionMaterial })
  })

  return controller
}
