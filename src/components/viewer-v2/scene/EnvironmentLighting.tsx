import { Environment } from '@react-three/drei'

import { useViewerV2 } from '../viewerV2Context'

const lightingQuality = {
  low: { environment: 0.4, ambient: 0.3, main: 0.8, shadows: false, shadowMapSize: 512 },
  medium: { environment: 0.6, ambient: 0.4, main: 1.2, shadows: true, shadowMapSize: 1024 },
  high: { environment: 0.8, ambient: 0.4, main: 1.4, shadows: true, shadowMapSize: 2048 },
} as const

export function EnvironmentLighting() {
  const { qualityPreset } = useViewerV2()
  const lighting = lightingQuality[qualityPreset]
  const fillLightIntensity = Number((lighting.main * 0.35).toFixed(2))
  const rimLightIntensity = Number((lighting.main * 0.2).toFixed(2))

  return (
    <>
      <Environment preset="studio" environmentIntensity={lighting.environment} />
      <ambientLight intensity={lighting.ambient} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={lighting.main}
        castShadow={lighting.shadows}
        shadow-mapSize-width={lighting.shadowMapSize}
        shadow-mapSize-height={lighting.shadowMapSize}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-far={50}
      />
      <directionalLight position={[-5, 2, -3]} intensity={fillLightIntensity} />
      <directionalLight position={[0, -2, 4]} intensity={rimLightIntensity} />
    </>
  )
}
