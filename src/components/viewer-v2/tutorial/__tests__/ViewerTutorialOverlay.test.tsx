import { fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { ViewerV2Context } from '../../viewerV2Context'
import type { ViewerV2ContextValue } from '../../viewerV2Context'
import { ViewerTutorialOverlay } from '../ViewerTutorialOverlay'
import type { TutorialStep } from '../tutorialSteps'

class MockAudio {
  static instances: MockAudio[] = []
  src: string
  volume = 1
  pause = vi.fn()
  play = vi.fn().mockResolvedValue(undefined)

  constructor(src: string) {
    this.src = src
    MockAudio.instances.push(this)
  }
}

const baseSteps: TutorialStep[] = [
  {
    id: 'viewer-area',
    targetId: 'viewer-area',
    titleKey: 'viewer.tutorial.steps.viewerArea.title',
    descriptionKey: 'viewer.tutorial.steps.viewerArea.description',
    audioFile: 'day_la_khu_vuc_de_tuong_tac_voi_mo_hinh_3d.mp3',
    placement: 'right',
    focusScale: 0.6,
    action: { type: 'reset' },
  },
  {
    id: 'annotation',
    targetId: 'annotation-toolbar',
    titleKey: 'viewer.tutorial.steps.annotation.title',
    descriptionKey: 'viewer.tutorial.steps.annotation.description',
    audioFile: 'nut_de_battat_che_do_ve_chu_thich.mp3',
    placement: 'top',
    action: { type: 'drawing', value: true },
  },
]

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

function setViewport(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: height })
}

function setTutorialTargetRect(target: HTMLElement, rect: DOMRectInit) {
  target.getBoundingClientRect = vi.fn(
    () =>
      ({
        x: rect.x ?? rect.left ?? 0,
        y: rect.y ?? rect.top ?? 0,
        top: rect.top ?? rect.y ?? 0,
        left: rect.left ?? rect.x ?? 0,
        right: rect.right ?? (rect.left ?? rect.x ?? 0) + (rect.width ?? 0),
        bottom: rect.bottom ?? (rect.top ?? rect.y ?? 0) + (rect.height ?? 0),
        width: rect.width ?? 0,
        height: rect.height ?? 0,
        toJSON: () => ({}),
      }) as DOMRect,
  )
}

function renderTutorial(overrides: Partial<ViewerV2ContextValue> = {}, steps = baseSteps) {
  const value = createViewerValue(overrides)
  render(
    <StarterSettingsContext.Provider
      value={{
        appVersion: '0.1.0',
        locale: 'en',
        resolvedThemeMode: 'light',
        settings: { ...DEFAULT_STARTER_SETTINGS, narrationVoice: value.voice },
        updateSettings: vi.fn(),
      }}
    >
      <ViewerV2Context.Provider value={value}>
        <div data-testid="viewer-area-target" data-tutorial-target="viewer-area">
          viewer
        </div>
        <div data-testid="annotation-toolbar-target" data-tutorial-target="annotation-toolbar">
          annotation
        </div>
        <ViewerTutorialOverlay steps={steps} />
      </ViewerV2Context.Provider>
    </StarterSettingsContext.Provider>,
  )

  return value
}

describe('ViewerTutorialOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    MockAudio.instances = []
    vi.stubGlobal('Audio', MockAudio)
    setViewport(1024, 768)
  })

  it('renders the first step and plays the selected voice audio', async () => {
    renderTutorial({ voice: 'nam', volume: 35 })

    act(() => {
      vi.advanceTimersByTime(80)
    })

    expect(screen.getByRole('dialog', { name: '3D interaction area' })).toBeInTheDocument()
    expect(MockAudio.instances).toHaveLength(1)
    expect(MockAudio.instances[0]?.src).toBe('/audios/Tutorial/Nam/day_la_khu_vuc_de_tuong_tac_voi_mo_hinh_3d.mp3')
    expect(MockAudio.instances[0]?.volume).toBe(0.35)
  })

  it('moves to the next step and applies its viewer action', async () => {
    const setIsDrawing = vi.fn()
    renderTutorial({ setIsDrawing })

    act(() => {
      vi.advanceTimersByTime(80)
    })
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    act(() => {
      vi.advanceTimersByTime(80)
    })

    expect(screen.getByRole('dialog', { name: 'Turn annotation on or off' })).toBeInTheDocument()
    expect(setIsDrawing).toHaveBeenCalledWith(true)
  })

  it('applies tutorial actions for the updated view mode control', async () => {
    const setViewMode = vi.fn()
    renderTutorial({ setViewMode }, [
      {
        id: 'view-mode',
        targetId: 'view-mode',
        titleKey: 'viewer.tutorial.steps.viewMode.title',
        descriptionKey: 'viewer.tutorial.steps.viewMode.description',
        audioFile: 'thay_doi_che_do_xem_3d_hoac_2d.mp3',
        placement: 'left',
        action: { type: 'viewMode', value: '3d' },
      },
    ])

    act(() => {
      vi.advanceTimersByTime(80)
    })

    expect(screen.getByRole('dialog', { name: 'Switch between 2D and 3D' })).toBeInTheDocument()
    expect(setViewMode).toHaveBeenCalledWith('3d')
  })

  it('shrinks the viewer-area spotlight around the target center', async () => {
    renderTutorial()
    setTutorialTargetRect(screen.getByTestId('viewer-area-target'), {
      top: 40,
      left: 100,
      width: 800,
      height: 500,
    })

    act(() => {
      vi.advanceTimersByTime(80)
    })

    expect(screen.getByTestId('tutorial-spotlight')).toHaveStyle({
      top: '132px',
      left: '252px',
      width: '496px',
      height: '316px',
    })
  })

  it('keeps the side-placed tutorial card inside the viewport', async () => {
    setViewport(640, 480)
    renderTutorial()
    setTutorialTargetRect(screen.getByTestId('viewer-area-target'), {
      top: 20,
      left: 120,
      width: 620,
      height: 440,
    })

    act(() => {
      vi.advanceTimersByTime(80)
    })

    expect(screen.getByTestId('viewer-tutorial-card')).toHaveStyle({
      top: '178px',
      left: '304px',
      transform: 'none',
    })
  })

  it('keeps an oversized measured tutorial card within the viewport', async () => {
    setViewport(640, 480)
    renderTutorial()
    setTutorialTargetRect(screen.getByTestId('viewer-area-target'), {
      top: 20,
      left: 120,
      width: 620,
      height: 440,
    })

    act(() => {
      vi.advanceTimersByTime(80)
    })

    const card = screen.getByTestId('viewer-tutorial-card')
    card.getBoundingClientRect = vi.fn(
      () =>
        ({
          x: 0,
          y: 0,
          top: 0,
          left: 0,
          right: 320,
          bottom: 600,
          width: 320,
          height: 600,
          toJSON: () => ({}),
        }) as DOMRect,
    )

    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    expect(card).toHaveStyle({
      top: '16px',
      maxHeight: 'calc(100vh - 32px)',
      overflowY: 'auto',
    })
  })

  it('skips the tutorial and clears temporary tutorial state', () => {
    const setActiveDialog = vi.fn()
    const setActiveSheet = vi.fn()
    const setIsDrawing = vi.fn()
    renderTutorial({ setActiveDialog, setActiveSheet, setIsDrawing })

    fireEvent.click(screen.getByRole('button', { name: 'Skip tutorial' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(setActiveDialog).toHaveBeenCalledWith(null)
    expect(setActiveSheet).toHaveBeenCalledWith(null)
    expect(setIsDrawing).toHaveBeenCalledWith(false)
  })
})
