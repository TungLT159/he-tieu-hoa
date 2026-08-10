import * as THREE from 'three'

const TARGET_MODEL_SIZE = 4

export function normalizeModelForViewer(model: THREE.Object3D) {
  if (model.userData.viewerNormalized === true) return

  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const maxDimension = Math.max(size.x, size.y, size.z)

  if (maxDimension <= 0) return

  const scale = TARGET_MODEL_SIZE / maxDimension

  model.scale.multiplyScalar(scale)
  const scaledBox = new THREE.Box3().setFromObject(model)
  const scaledCenter = scaledBox.getCenter(new THREE.Vector3())
  model.position.sub(scaledCenter)
  model.userData.viewerNormalized = true
}
