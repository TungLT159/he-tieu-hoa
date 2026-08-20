import * as THREE from 'three'

export const DEFAULT_POSITION = new THREE.Vector3(0, 2, 8)
export const DEFAULT_TARGET = new THREE.Vector3(0, 0.5, 0)
export const DEFAULT_CAMERA_OFFSET = new THREE.Vector3(0.18, 0.38, 0.95)

interface CameraViewProfile {
  offset: THREE.Vector3
  distanceMultiplier: number
  minDistance: number
}

const DEFAULT_CAMERA_PROFILE: CameraViewProfile = {
  offset: DEFAULT_CAMERA_OFFSET,
  distanceMultiplier: 2.35,
  minDistance: 2.8,
}

const ORGAN_CAMERA_PROFILES = new Map<string, CameraViewProfile>([
  ['da_day', { offset: new THREE.Vector3(0.62, 0.28, 0.78), distanceMultiplier: 2.1, minDistance: 2.35 }],
  ['thuc_quan', { offset: new THREE.Vector3(-0.5, 0.72, 0.72), distanceMultiplier: 2.45, minDistance: 2.7 }],
  ['ruot_non', { offset: new THREE.Vector3(0.2, 0.78, 0.58), distanceMultiplier: 2.25, minDistance: 2.5 }],
  ['ruot_gia', { offset: new THREE.Vector3(-0.78, 0.48, 0.48), distanceMultiplier: 2.4, minDistance: 2.9 }],
  ['gan', { offset: new THREE.Vector3(-0.66, 0.34, 0.72), distanceMultiplier: 2.15, minDistance: 2.6 }],
  ['tui_mat', { offset: new THREE.Vector3(-0.5, 0.18, 0.86), distanceMultiplier: 1.9, minDistance: 2.05 }],
  ['tuy', { offset: new THREE.Vector3(0.42, 0.36, -0.84), distanceMultiplier: 2.05, minDistance: 2.25 }],
  ['mieng', { offset: new THREE.Vector3(0.12, 0.88, 0.46), distanceMultiplier: 2.2, minDistance: 2.4 }],
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
  const profile = ORGAN_CAMERA_PROFILES.get(target) ?? DEFAULT_CAMERA_PROFILE
  const distance = Math.max(maxDimension * profile.distanceMultiplier, profile.minDistance)
  const offset = profile.offset

  return {
    position: new THREE.Vector3(
      center.x + distance * offset.x,
      center.y + distance * offset.y,
      center.z + distance * offset.z,
    ),
    target: center,
  }
}
