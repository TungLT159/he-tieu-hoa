import { Loader } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

import { SceneSetup } from './scene/SceneSetup'
import { useViewerV2 } from './viewerV2Context'

const DPR_CONFIG = { low: 0.5, medium: 0.75, high: 1.0 } as const

export function ViewerV2Canvas() {
  const { qualityPreset } = useViewerV2()

  return (
    <div
      data-tutorial-target="viewer-area"
      className="relative h-full min-h-[24rem] w-full overflow-hidden"
    >
      <Canvas
        camera={{ position: [0, 2, 8], fov: 50 }}
        className="h-full w-full"
        data-viewer-canvas="true"
        dpr={DPR_CONFIG[qualityPreset]}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      >
        <SceneSetup />
      </Canvas>
      <Loader
        containerStyles={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
