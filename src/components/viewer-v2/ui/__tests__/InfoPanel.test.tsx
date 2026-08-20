import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { renderStarter } from '@/test/starterRender'
import { fireEvent, screen } from '@testing-library/react'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ViewerV2Context } from '../../viewerV2Context'
import type { ViewerV2ContextValue, VoiceOption } from '../../viewerV2Context'
import { InfoPanel } from '../InfoPanel'

class MockAudio {
  static instances: MockAudio[] = []
  src: string
  volume = 1
  currentTime = 0
  pause = vi.fn()
  play = vi.fn().mockResolvedValue(undefined)
  onended: (() => void) | null = null

  constructor(src: string) {
    this.src = src
    MockAudio.instances.push(this)
  }
}

function createViewerValue(overrides: Partial<ViewerV2ContextValue> = {}): ViewerV2ContextValue {
  return {
    selectedOrgan: null,
    setSelectedOrgan: vi.fn(),
    organNodes: new Map(),
    registerOrganNode: vi.fn(),
    unregisterOrganNode: vi.fn(),
    cameraTarget: 'overview',
    setCameraTarget: vi.fn(),
    isTransitioning: false,
    setIsTransitioning: vi.fn(),
    isModelLoaded: false,
    setIsModelLoaded: vi.fn(),
    loadError: null,
    setLoadError: vi.fn(),
    resetViewVersion: 0,
    requestViewReset: vi.fn(),
    isMenuOpen: true,
    setIsMenuOpen: vi.fn(),
    activeSheet: null,
    setActiveSheet: vi.fn(),
    activeDialog: null,
    setActiveDialog: vi.fn(),
    isFullscreen: false,
    setIsFullscreen: vi.fn(),
    isDrawing: false,
    setIsDrawing: vi.fn(),
    drawColor: '#ff0000',
    setDrawColor: vi.fn(),
    backgroundColor: '#1a1a2e',
    setBackgroundColor: vi.fn(),
    modelColor: null,
    setModelColor: vi.fn(),
    isSpinning: false,
    setIsSpinning: vi.fn(),
    flyCameraActive: false,
    setFlyCameraActive: vi.fn(),
    flyCameraPaused: false,
    setFlyCameraPaused: vi.fn(),
    flyCameraOrganPopup: null,
    setFlyCameraOrganPopup: vi.fn(),
    qualityPreset: 'medium',
    setQualityPreset: vi.fn(),
    volume: 80,
    setVolume: vi.fn(),
    voice: 'bac',
    setVoice: vi.fn(),
    annotationTool: 'pen',
    setAnnotationTool: vi.fn(),
    viewMode: '3d',
    setViewMode: vi.fn(),
    ...overrides,
  }
}

function renderInfoPanel(
  onClose = vi.fn(),
  locale: 'en' | 'vi' = 'en',
  viewerOverrides: Partial<ViewerV2ContextValue> = {},
) {
  const viewerValue = createViewerValue(viewerOverrides)
  const result = renderStarter(
    <StarterSettingsContext.Provider
      value={{
        appVersion: '0.1.0',
        locale,
        resolvedThemeMode: 'light',
        settings: { ...DEFAULT_STARTER_SETTINGS, narrationVoice: viewerValue.voice },
        updateSettings: vi.fn(),
      }}
    >
      <ViewerV2Context.Provider value={viewerValue}>
        <InfoPanel onClose={onClose} />
      </ViewerV2Context.Provider>
    </StarterSettingsContext.Provider>,
  )

  return { ...result, viewerValue }
}

describe('InfoPanel', () => {
  beforeEach(() => {
    MockAudio.instances = []
    vi.stubGlobal('Audio', MockAudio)
  })

  it('renders detailed English digestive system content and voice controls', () => {
    renderInfoPanel()

    expect(screen.getByRole('dialog', { name: 'Human Digestive System' })).toBeInTheDocument()
    expect(screen.getByText(/The human digestive system includes the gastrointestinal tract/i)).toBeInTheDocument()
    expect(screen.getByText(/Food enters the gastrointestinal tract and undergoes digestion/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Voice' })).toHaveTextContent('Northern')
    expect(screen.getByRole('button', { name: 'Turn on narration' })).toBeInTheDocument()
  })

  it('renders detailed Vietnamese digestive system content', () => {
    renderInfoPanel(vi.fn(), 'vi')

    expect(screen.getByRole('dialog', { name: 'Hệ tiêu hóa ở người' })).toBeInTheDocument()
    expect(screen.getByText(/Hệ tiêu hóa ở người bao gồm đường tiêu hóa cộng với cơ quan phụ trợ tiêu hóa/i)).toBeInTheDocument()
    expect(screen.getByText(/Thức ăn được vào đường tiêu hóa và trải qua sự tiêu hoá/i)).toBeInTheDocument()
    expect(screen.getByText(/Thành của ống từ trong ra ngoài/i)).toBeInTheDocument()
  })

  it('updates the selected information voice', () => {
    const setVoice = vi.fn()
    renderInfoPanel(vi.fn(), 'en', { setVoice })

    fireEvent.click(screen.getByRole('combobox', { name: 'Voice' }))
    fireEvent.click(screen.getByRole('option', { name: 'Southern' }))

    expect(setVoice).toHaveBeenCalledWith('nam')
  })

  it('plays and stops the selected information audio', () => {
    renderInfoPanel(vi.fn(), 'en', { voice: 'trung', volume: 65 })

    fireEvent.click(screen.getByRole('button', { name: 'Turn on narration' }))

    expect(MockAudio.instances).toHaveLength(1)
    expect(MockAudio.instances[0]?.src).toBe('/audios/Information/Trung.mp3')
    expect(MockAudio.instances[0]?.volume).toBe(0.65)
    expect(MockAudio.instances[0]?.play).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Turn off narration' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Turn off narration' }))

    expect(MockAudio.instances[0]?.pause).toHaveBeenCalledTimes(1)
    expect(MockAudio.instances[0]?.currentTime).toBe(0)
    expect(screen.getByRole('button', { name: 'Turn on narration' })).toBeInTheDocument()
  })

  it('switches audio files from the current playback time when the voice changes during narration', () => {
    function StatefulPanel() {
      const [voice, setVoice] = useState<VoiceOption>('bac')
      return (
        <ViewerV2Context.Provider value={createViewerValue({ voice, setVoice, volume: 80 })}>
          <InfoPanel onClose={vi.fn()} />
        </ViewerV2Context.Provider>
      )
    }

    renderStarter(
      <StarterSettingsContext.Provider
        value={{
          appVersion: '0.1.0',
          locale: 'en',
          resolvedThemeMode: 'light',
          settings: { ...DEFAULT_STARTER_SETTINGS, narrationVoice: 'bac' },
          updateSettings: vi.fn(),
        }}
      >
        <StatefulPanel />
      </StarterSettingsContext.Provider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Turn on narration' }))
    const firstAudio = MockAudio.instances[0]
    if (firstAudio) firstAudio.currentTime = 12

    fireEvent.click(screen.getByRole('combobox', { name: 'Voice' }))
    fireEvent.click(screen.getByRole('option', { name: 'Central' }))

    expect(MockAudio.instances).toHaveLength(2)
    expect(MockAudio.instances[0]?.pause).toHaveBeenCalledTimes(1)
    expect(MockAudio.instances[1]?.src).toBe('/audios/Information/Trung.mp3')
    expect(MockAudio.instances[1]?.currentTime).toBe(12)
    expect(MockAudio.instances[1]?.play).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    renderInfoPanel(onClose)

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalled()
  })
})
