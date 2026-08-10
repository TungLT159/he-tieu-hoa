import { Loader } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'

import { AutoRotateController } from './AutoRotateController'
import { BackgroundClickPlane } from './BackgroundClickPlane'
import { CameraController } from './CameraController'
import { DigestiveModel } from './DigestiveModel'
import { OrganHighlighter } from './OrganHighlighter'
import { useViewer } from './viewerContext'

export function DigestiveCanvas() {
  const { backgroundColor } = useViewer()

  return (
    <div className="relative h-full min-h-[24rem] w-full overflow-hidden">
      <Canvas
        camera={{ position: [0, 2, 8], fov: 50 }}
        className="w-full h-full"
        data-viewer-canvas="true"
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      >
        <color attach="background" args={[backgroundColor]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-5, 0, -3]} intensity={0.4} />
        <Suspense fallback={null}>
          <AutoRotateController>
            <DigestiveModel />
          </AutoRotateController>
          <OrganHighlighter />
        </Suspense>
        <BackgroundClickPlane />
        <CameraController />
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
