import { Bloom, EffectComposer, SSAO } from '@react-three/postprocessing'

import { useViewerV2 } from '../viewerV2Context'

const qualityEffects = {
  medium: { ssaoSamples: 8, ssaoRadius: 0.15, ssaoIntensity: 8, bloomIntensity: 0.15 },
  high: { ssaoSamples: 16, ssaoRadius: 0.1, ssaoIntensity: 15, bloomIntensity: 0.3 },
} as const

export function PostProcessing() {
  const { qualityPreset } = useViewerV2()
  const effects = qualityPreset === 'low' ? null : qualityEffects[qualityPreset]

  if (!effects) {
    return (
      <EffectComposer multisampling={0}>
        <></>
      </EffectComposer>
    )
  }

  return (
    <EffectComposer multisampling={0}>
      <SSAO
        samples={effects.ssaoSamples}
        radius={effects.ssaoRadius}
        intensity={effects.ssaoIntensity}
        luminanceInfluence={0.5}
      />
      <Bloom
        intensity={effects.bloomIntensity}
        luminanceThreshold={0.6}
        luminanceSmoothing={0.9}
      />
    </EffectComposer>
  )
}
