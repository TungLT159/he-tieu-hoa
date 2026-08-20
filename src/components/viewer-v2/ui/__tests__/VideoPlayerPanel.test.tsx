import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { renderStarter } from '@/test/starterRender'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ViewerV2Context } from '../../viewerV2Context'
import type { ViewerV2ContextValue, VoiceOption } from '../../viewerV2Context'
import { VideoPlayerPanel } from '../VideoPlayerPanel'

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

function renderPanel(
  onClose = vi.fn(),
  locale: 'en' | 'vi' = 'en',
  viewerOverrides: Partial<ViewerV2ContextValue> = {},
) {
  const viewerValue = createViewerValue(viewerOverrides)
  return renderStarter(
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
        <VideoPlayerPanel onClose={onClose} />
      </ViewerV2Context.Provider>
    </StarterSettingsContext.Provider>,
  )
}

describe('VideoPlayerPanel', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders a localized close button', () => {
    renderPanel()

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    renderPanel(onClose)

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalled()
  })

  it('renders a localized region with the video player', () => {
    renderPanel()

    const region = screen.getByRole('region', { name: 'Learning Video' })

    expect(within(region).getByText('Learning Video')).toBeInTheDocument()
    expect(within(region).getByTestId('learning-video')).toBeInTheDocument()
  })

  it('uses controls and the expected video source', () => {
    renderPanel()

    const video = screen.getByTestId('learning-video')

    expect(video).toHaveAttribute('controls')
    expect(video).toHaveAttribute('src', '/videos/b%E1%BA%AFc.mp4')
  })

  it('uses the selected voice video source from the public videos folder', () => {
    renderPanel(vi.fn(), 'en', { voice: 'trung' })

    expect(screen.getByTestId('learning-video')).toHaveAttribute('src', '/videos/trung.mp4')
    expect(fetch).toHaveBeenCalledWith('/videos/trung.mp4', expect.objectContaining({ method: 'HEAD' }))
  })

  it('updates the selected video voice', () => {
    const setVoice = vi.fn()
    renderPanel(vi.fn(), 'en', { setVoice })

    fireEvent.click(screen.getByRole('combobox', { name: 'Voice' }))
    fireEvent.click(screen.getByRole('option', { name: 'Southern' }))

    expect(setVoice).toHaveBeenCalledWith('nam')
  })

  it('switches video sources from the current playback time when the voice changes', () => {
    function StatefulPanel() {
      const [voice, setVoice] = useState<VoiceOption>('bac')
      return (
        <ViewerV2Context.Provider value={createViewerValue({ voice, setVoice })}>
          <VideoPlayerPanel onClose={vi.fn()} />
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

    const firstVideo = screen.getByTestId('learning-video') as HTMLVideoElement
    Object.defineProperty(firstVideo, 'currentTime', { configurable: true, writable: true, value: 32 })
    Object.defineProperty(firstVideo, 'paused', { configurable: true, value: false })
    Object.defineProperty(firstVideo, 'ended', { configurable: true, value: false })
    firstVideo.play = vi.fn().mockResolvedValue(undefined)
    fireEvent.timeUpdate(firstVideo)

    fireEvent.click(screen.getByRole('combobox', { name: 'Voice' }))
    fireEvent.click(screen.getByRole('option', { name: 'Central' }))

    const nextVideo = screen.getByTestId('learning-video') as HTMLVideoElement
    Object.defineProperty(nextVideo, 'currentTime', { configurable: true, writable: true, value: 0 })
    nextVideo.play = vi.fn().mockResolvedValue(undefined)
    fireEvent.loadedMetadata(nextVideo)

    expect(nextVideo).toHaveAttribute('src', '/videos/trung.mp4')
    expect(nextVideo.currentTime).toBe(32)
    expect(nextVideo.play).toHaveBeenCalledTimes(1)
  })

  it('shows localized fallback text when the video fails to load', () => {
    renderPanel()

    expect(screen.queryByTestId('learning-video-error')).not.toBeInTheDocument()

    fireEvent.error(screen.getByTestId('learning-video'))

    expect(screen.getByTestId('learning-video-error')).toHaveTextContent('Your browser cannot play this learning video.')
  })

  it('shows fallback text when the video asset is unavailable before playback', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false }),
    )

    renderPanel()

    await waitFor(() => {
      expect(screen.getByTestId('learning-video-error')).toHaveTextContent('Your browser cannot play this learning video.')
    })
  })

  it('ignores aborted availability checks', async () => {
    const abortError = new DOMException('The operation was aborted.', 'AbortError')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError))

    renderPanel()

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/videos/b%E1%BA%AFc.mp4', expect.objectContaining({ method: 'HEAD' }))
    })

    expect(screen.queryByTestId('learning-video-error')).not.toBeInTheDocument()
  })

  it('adds localized metadata to the captions track', () => {
    const { rerender } = renderPanel()

    const track = screen.getByTestId('learning-video').querySelector('track')

    expect(track).toHaveAttribute('srcLang', 'en')
    expect(track).toHaveAttribute('label', 'English')

    rerender(
      <StarterSettingsContext.Provider
        value={{
          appVersion: '0.1.0',
          locale: 'vi',
          resolvedThemeMode: 'light',
          settings: DEFAULT_STARTER_SETTINGS,
          updateSettings: vi.fn(),
        }}
      >
        <ViewerV2Context.Provider value={createViewerValue()}>
          <VideoPlayerPanel onClose={vi.fn()} />
        </ViewerV2Context.Provider>
      </StarterSettingsContext.Provider>,
    )

    const vietnameseTrack = screen.getByTestId('learning-video').querySelector('track')

    expect(vietnameseTrack).toHaveAttribute('srcLang', 'vi')
    expect(vietnameseTrack).toHaveAttribute('label', 'Tiếng Việt')
  })

  it('gives the video an accessible localized title', () => {
    renderPanel()

    expect(screen.getByTitle('Learning Video')).toBe(screen.getByTestId('learning-video'))
  })
})
