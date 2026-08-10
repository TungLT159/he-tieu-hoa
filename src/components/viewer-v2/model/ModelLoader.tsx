import { useFBX } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { useCallback, useEffect } from 'react'

import { ModelColorController } from '../ui/ModelColorController'
import { normalizeModelForViewer } from '../modelTransform'
import { useViewerV2 } from '../viewerV2Context'
import { selectOrganFromPointerEvent } from './modelSelection'
import { OrganRegistry } from './OrganRegistry'

// Temporary FBX path until a real GLB is produced from the source FBX.
const MODEL_URL = '/models/hetieuhoa.fbx'

export function ModelLoader() {
  const { setSelectedOrgan } = useViewerV2()
  const scene = useFBX(MODEL_URL)

  useEffect(() => {
    normalizeModelForViewer(scene)
  }, [scene])

  const handlePointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      selectOrganFromPointerEvent(event.object, event.stopPropagation, setSelectedOrgan)
    },
    [setSelectedOrgan],
  )

  if (!scene) return null

  return (
    <group>
      <primitive object={scene} onPointerDown={handlePointerDown} />
      <OrganRegistry scene={scene} />
      <ModelColorController object={scene} />
    </group>
  )
}
