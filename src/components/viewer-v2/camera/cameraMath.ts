import * as THREE from 'three'

export const DEFAULT_POSITION = new THREE.Vector3(0, 2, 8)
export const DEFAULT_TARGET = new THREE.Vector3(0, 0.5, 0)
export const DEFAULT_CAMERA_OFFSET = new THREE.Vector3(0, 0.4, 1)

const ORGAN_CAMERA_OFFSETS = new Map<string, THREE.Vector3>([
  ['tuy', new THREE.Vector3(0, 0.4, -1)],
])

interface CameraDestination {
  position: THREE.Vector3
  target: THREE.Vector3
}

export function easeSmoothstep(t: number): number {
  return t * t * (3 - 2 * t)
}

export function computeCameraDestination(
  target: string,
  organNodes: Map<string, THREE.Mesh[]>,
): CameraDestination {
  const selectedNodes = target === 'overview' ? undefined : organNodes.get(target)
  if (!selectedNodes?.length) {
    return {
      position: DEFAULT_POSITION.clone(),
      target: DEFAULT_TARGET.clone(),
    }
  }

  const box = new THREE.Box3()
  selectedNodes.forEach((selectedNode) => box.expandByObject(selectedNode))
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const maxDimension = Math.max(size.x, size.y, size.z)
  const distance = Math.max(maxDimension * 2.5, 3)
  const offset = ORGAN_CAMERA_OFFSETS.get(target) ?? DEFAULT_CAMERA_OFFSET

  return {
    position: new THREE.Vector3(
      center.x + distance * offset.x,
      center.y + distance * offset.y,
      center.z + distance * offset.z,
    ),
    target: center,
  }
}
