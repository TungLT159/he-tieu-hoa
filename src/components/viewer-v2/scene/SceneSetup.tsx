import { Suspense } from 'react'

import { IdleAnimation } from '../animation/IdleAnimation'
import { OrganTransition } from '../animation/OrganTransition'
import { AutoTourController } from '../camera/AutoTourController'
import { CameraController } from '../camera/CameraController'
import { HighlightShader } from '../effects/HighlightShader'
import { SelectionOutlineProvider, SelectionOutlineTarget } from '../effects/SelectionOutline'
import { ModelLoader } from '../model/ModelLoader'
import { useViewerV2 } from '../viewerV2Context'
import { EnvironmentLighting } from './EnvironmentLighting'
import { PostProcessing } from './PostProcessing'
import { FlyCameraTour } from '../ui/FlyCameraTour'

function BackgroundClickPlane() {
  const { setSelectedOrgan } = useViewerV2()

  return (
    <mesh position={[0, 0, -10]} onPointerDown={() => setSelectedOrgan(null)}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}

export function SceneSetup() {
  const { backgroundColor } = useViewerV2()

  return (
    <>
      <color attach="background" args={[backgroundColor]} />
      <EnvironmentLighting />
      <Suspense fallback={null}>
        <SelectionOutlineProvider>
          <SelectionOutlineTarget>
            <OrganTransition>
              <IdleAnimation>
                <ModelLoader />
              </IdleAnimation>
            </OrganTransition>
          </SelectionOutlineTarget>
          <PostProcessing />
          <FlyCameraTour />
        </SelectionOutlineProvider>
        <HighlightShader />
      </Suspense>
      <BackgroundClickPlane />
      <CameraController />
      <AutoTourController />
    </>
  )
}
