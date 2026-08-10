import * as THREE from 'three'

export function selectOrganFromPointerEvent(
  object: THREE.Object3D,
  stopPropagation: () => void,
  setSelectedOrgan: (organName: string) => void,
) {
  if (!(object instanceof THREE.Mesh)) return
  if (typeof object.userData.organName !== 'string') return

  stopPropagation()
  setSelectedOrgan(object.userData.organName)
}
