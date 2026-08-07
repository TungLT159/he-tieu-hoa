import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PostProcessing } from '../PostProcessing'

const { bloomMock, effectComposerMock, ssaoMock, useViewerV2Mock } = vi.hoisted(() => ({
  bloomMock: vi.fn(() => null),
  effectComposerMock: vi.fn(({ children }) => <>{children}</>),
  ssaoMock: vi.fn(() => null),
  useViewerV2Mock: vi.fn(() => ({ qualityPreset: 'medium' })),
}))

vi.mock('@react-three/postprocessing', () => ({
  Bloom: bloomMock,
  EffectComposer: effectComposerMock,
  SSAO: ssaoMock,
}))

vi.mock('../../viewerV2Context', () => ({
  useViewerV2: useViewerV2Mock,
}))

describe('PostProcessing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useViewerV2Mock.mockReturnValue({ qualityPreset: 'medium' })
  })

  it('renders medium quality effects by default', () => {
    render(<PostProcessing />)

    expect(effectComposerMock).toHaveBeenCalledWith(
      expect.objectContaining({ multisampling: 0 }),
      undefined,
    )
    expect(ssaoMock).toHaveBeenCalledWith(
      expect.objectContaining({
        samples: 8,
        radius: 0.15,
        intensity: 8,
        luminanceInfluence: 0.5,
      }),
      undefined,
    )
    expect(bloomMock).toHaveBeenCalledWith(
      expect.objectContaining({
        intensity: 0.15,
        luminanceThreshold: 0.6,
        luminanceSmoothing: 0.9,
      }),
      undefined,
    )
  })

  it('renders only the composer for low quality', () => {
    useViewerV2Mock.mockReturnValue({ qualityPreset: 'low' })

    render(<PostProcessing />)

    expect(effectComposerMock).toHaveBeenCalledWith(
      expect.objectContaining({ multisampling: 0 }),
      undefined,
    )
    expect(ssaoMock).not.toHaveBeenCalled()
    expect(bloomMock).not.toHaveBeenCalled()
  })
})
