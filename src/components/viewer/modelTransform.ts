import * as THREE from 'three'

const TARGET_MODEL_SIZE = 4

export function normalizeModelForViewer(model: THREE.Object3D) {
  if (model.userData.viewerNormalized === true) return

  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const maxDimension = Math.max(size.x, size.y, size.z)

  if (maxDimension <= 0) return


  const center = box.getCenter(new THREE.Vector3())
  const scale = TARGET_MODEL_SIZE / maxDimension

  model.scale.multiplyScalar(scale)
  model.position.sub(center.multiplyScalar(scale))
  model.userData.viewerNormalized = true
}
