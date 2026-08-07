import { act, render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { StrictMode } from 'react'
import { useEffect, useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ViewerV2Context } from '../../viewerV2Context'
import type { ViewerV2ContextValue } from '../../viewerV2Context'
import { AutoTourController } from '../AutoTourController'

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
    ...overrides,
  }
}

function renderWithViewerContext(ui: ReactNode, value: Partial<ViewerV2ContextValue> = {}) {
  return render(
    <ViewerV2Context.Provider value={createViewerValue(value)}>{ui}</ViewerV2Context.Provider>,
  )
}

describe('AutoTourController', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts at the first organ when fly camera becomes active', () => {
    const setSelectedOrgan = vi.fn()

    renderWithViewerContext(<AutoTourController />, {
      flyCameraActive: true,
      setSelectedOrgan,
    })

    expect(setSelectedOrgan).toHaveBeenCalledWith('mieng')
  })

  it('starts at the first organ when fly camera changes from inactive to active', () => {
    const setSelectedOrgan = vi.fn()

    const { rerender } = renderWithViewerContext(<AutoTourController />, {
      flyCameraActive: false,
      setSelectedOrgan,
    })

    rerender(
      <ViewerV2Context.Provider
        value={createViewerValue({
          flyCameraActive: true,
          setSelectedOrgan,
        })}
      >
        <AutoTourController />
      </ViewerV2Context.Provider>,
    )

    expect(setSelectedOrgan).toHaveBeenCalledWith('mieng')
  })

  it('starts under StrictMode without immediately disabling fly camera', () => {
    const setFlyCameraActive = vi.fn()
    const setSelectedOrgan = vi.fn()

    function StrictModeAutoTourController() {
      const [selectedOrgan, updateSelectedOrgan] = useState<string | null>(null)

      return (
        <StrictMode>
          <ViewerV2Context.Provider
            value={createViewerValue({
              flyCameraActive: true,
              selectedOrgan,
              setFlyCameraActive,
              setSelectedOrgan: (organ) => {
                setSelectedOrgan(organ)
                updateSelectedOrgan(organ)
              },
            })}
          >
            <AutoTourController />
          </ViewerV2Context.Provider>
        </StrictMode>
      )
    }

    render(<StrictModeAutoTourController />)

    expect(setSelectedOrgan).toHaveBeenCalledWith('mieng')
    expect(setFlyCameraActive).not.toHaveBeenCalledWith(false)
  })

  it('pauses with a popup after the tour selection transition completes', () => {
    vi.useFakeTimers()
    const setSelectedOrgan = vi.fn()
    const setFlyCameraPaused = vi.fn()
    const setFlyCameraOrganPopup = vi.fn()

    function StatefulAutoTourController() {
      const [selectedOrgan, updateSelectedOrgan] = useState<string | null>(null)
      const [flyCameraPaused, updateFlyCameraPaused] = useState(false)
      const [flyCameraOrganPopup, updateFlyCameraOrganPopup] = useState<string | null>(null)
      const [isTransitioning, updateIsTransitioning] = useState(true)

      useEffect(() => {
        if (selectedOrgan === 'mieng') {
          const timeoutId = window.setTimeout(() => updateIsTransitioning(false), 0)
          return () => window.clearTimeout(timeoutId)
        }

        return undefined
      }, [selectedOrgan])

      return (
        <ViewerV2Context.Provider
          value={createViewerValue({
            flyCameraActive: true,
            flyCameraPaused,
            flyCameraOrganPopup,
            isTransitioning,
            selectedOrgan,
            setFlyCameraPaused: (paused) => {
              setFlyCameraPaused(paused)
              updateFlyCameraPaused(paused)
            },
            setFlyCameraOrganPopup: (organ) => {
              setFlyCameraOrganPopup(organ)
              updateFlyCameraOrganPopup(organ)
            },
            setSelectedOrgan: (organ) => {
              setSelectedOrgan(organ)
              updateSelectedOrgan(organ)
            },
          })}
        >
          <AutoTourController />
        </ViewerV2Context.Provider>
      )
    }

    render(<StatefulAutoTourController />)

    act(() => vi.advanceTimersByTime(0))

    expect(setSelectedOrgan).toHaveBeenCalledWith('mieng')
    expect(setFlyCameraPaused).toHaveBeenCalledWith(true)
    expect(setFlyCameraOrganPopup).toHaveBeenCalledWith('mieng')
  })

  it('does not show popup until the current tour organ has transitioned from active to complete', () => {
    const setSelectedOrgan = vi.fn()
    const setFlyCameraPaused = vi.fn()
    const setFlyCameraOrganPopup = vi.fn()

    const { rerender } = renderWithViewerContext(<AutoTourController />, {
      flyCameraActive: true,
      isTransitioning: false,
      selectedOrgan: null,
      setFlyCameraPaused,
      setFlyCameraOrganPopup,
      setSelectedOrgan: (organ) => {
        setSelectedOrgan(organ)
      },
    })

    rerender(
      <ViewerV2Context.Provider
        value={createViewerValue({
          flyCameraActive: true,
          isTransitioning: false,
          selectedOrgan: 'mieng',
          setFlyCameraPaused,
          setFlyCameraOrganPopup,
          setSelectedOrgan,
        })}
      >
        <AutoTourController />
      </ViewerV2Context.Provider>,
    )

    expect(setFlyCameraPaused).not.toHaveBeenCalledWith(true)
    expect(setFlyCameraOrganPopup).not.toHaveBeenCalledWith('mieng')

    rerender(
      <ViewerV2Context.Provider
        value={createViewerValue({
          flyCameraActive: true,
          isTransitioning: true,
          selectedOrgan: 'mieng',
          setFlyCameraPaused,
          setFlyCameraOrganPopup,
          setSelectedOrgan,
        })}
      >
        <AutoTourController />
      </ViewerV2Context.Provider>,
    )

    expect(setFlyCameraPaused).not.toHaveBeenCalledWith(true)
    expect(setFlyCameraOrganPopup).not.toHaveBeenCalledWith('mieng')

    rerender(
      <ViewerV2Context.Provider
        value={createViewerValue({
          flyCameraActive: true,
          isTransitioning: false,
          selectedOrgan: 'mieng',
          setFlyCameraPaused,
          setFlyCameraOrganPopup,
          setSelectedOrgan,
        })}
      >
        <AutoTourController />
      </ViewerV2Context.Provider>,
    )

    expect(setFlyCameraPaused).toHaveBeenCalledWith(true)
    expect(setFlyCameraOrganPopup).toHaveBeenCalledWith('mieng')
  })

  it('waits for camera transition to finish before pausing with a popup', () => {
    const setSelectedOrgan = vi.fn()
    const setFlyCameraPaused = vi.fn()
    const setFlyCameraOrganPopup = vi.fn()

    const { rerender } = renderWithViewerContext(<AutoTourController />, {
      flyCameraActive: true,
      isTransitioning: true,
      selectedOrgan: null,
      setFlyCameraPaused,
      setFlyCameraOrganPopup,
      setSelectedOrgan: (organ) => {
        setSelectedOrgan(organ)
      },
    })

    rerender(
      <ViewerV2Context.Provider
        value={createViewerValue({
          flyCameraActive: true,
          isTransitioning: true,
          selectedOrgan: 'mieng',
          setFlyCameraPaused,
          setFlyCameraOrganPopup,
          setSelectedOrgan,
        })}
      >
        <AutoTourController />
      </ViewerV2Context.Provider>,
    )

    expect(setFlyCameraPaused).not.toHaveBeenCalledWith(true)
    expect(setFlyCameraOrganPopup).not.toHaveBeenCalledWith('mieng')

    rerender(
      <ViewerV2Context.Provider
        value={createViewerValue({
          flyCameraActive: true,
          isTransitioning: false,
          selectedOrgan: 'mieng',
          setFlyCameraPaused,
          setFlyCameraOrganPopup,
          setSelectedOrgan,
        })}
      >
        <AutoTourController />
      </ViewerV2Context.Provider>,
    )

    expect(setFlyCameraPaused).toHaveBeenCalledWith(true)
    expect(setFlyCameraOrganPopup).toHaveBeenCalledWith('mieng')
  })

  it('advances to the next tour organ only after the flycamera-advance event', () => {
    vi.useFakeTimers()
    const setSelectedOrgan = vi.fn()
    const setFlyCameraPaused = vi.fn()
    const setFlyCameraOrganPopup = vi.fn()

    function StatefulAutoTourController() {
      const [selectedOrgan, updateSelectedOrgan] = useState<string | null>(null)
      const [flyCameraPaused, updateFlyCameraPaused] = useState(false)
      const [flyCameraOrganPopup, updateFlyCameraOrganPopup] = useState<string | null>(null)
      const [isTransitioning, updateIsTransitioning] = useState(true)

      useEffect(() => {
        if (selectedOrgan !== null) {
          const timeoutId = window.setTimeout(() => updateIsTransitioning(false), 0)
          return () => window.clearTimeout(timeoutId)
        }

        return undefined
      }, [selectedOrgan])

      return (
        <ViewerV2Context.Provider
          value={createViewerValue({
            flyCameraActive: true,
            flyCameraPaused,
            flyCameraOrganPopup,
            isTransitioning,
            selectedOrgan,
            setFlyCameraPaused: (paused) => {
              setFlyCameraPaused(paused)
              updateFlyCameraPaused(paused)
            },
            setFlyCameraOrganPopup: (organ) => {
              setFlyCameraOrganPopup(organ)
              updateFlyCameraOrganPopup(organ)
            },
            setSelectedOrgan: (organ) => {
              setSelectedOrgan(organ)
              if (organ !== null) updateIsTransitioning(true)
              updateSelectedOrgan(organ)
            },
          })}
        >
          <AutoTourController />
        </ViewerV2Context.Provider>
      )
    }

    render(<StatefulAutoTourController />)

    act(() => vi.advanceTimersByTime(3000))

    expect(setSelectedOrgan).toHaveBeenLastCalledWith('mieng')

    act(() => window.dispatchEvent(new Event('flycamera-advance')))

    expect(setSelectedOrgan).toHaveBeenLastCalledWith('thuc_quan')
    expect(setFlyCameraPaused).toHaveBeenCalledWith(false)
    expect(setFlyCameraOrganPopup).toHaveBeenCalledWith(null)
  })

  it('ignores flycamera-advance until the current popup is ready', () => {
    const setSelectedOrgan = vi.fn()
    const setFlyCameraPaused = vi.fn()
    const setFlyCameraOrganPopup = vi.fn()

    function StatefulAutoTourController() {
      const [selectedOrgan, updateSelectedOrgan] = useState<string | null>(null)
      const [flyCameraPaused, updateFlyCameraPaused] = useState(false)
      const [flyCameraOrganPopup, updateFlyCameraOrganPopup] = useState<string | null>(null)

      return (
        <ViewerV2Context.Provider
          value={createViewerValue({
            flyCameraActive: true,
            flyCameraPaused,
            flyCameraOrganPopup,
            isTransitioning: true,
            selectedOrgan,
            setFlyCameraPaused: (paused) => {
              setFlyCameraPaused(paused)
              updateFlyCameraPaused(paused)
            },
            setFlyCameraOrganPopup: (organ) => {
              setFlyCameraOrganPopup(organ)
              updateFlyCameraOrganPopup(organ)
            },
            setSelectedOrgan: (organ) => {
              setSelectedOrgan(organ)
              updateSelectedOrgan(organ)
            },
          })}
        >
          <AutoTourController />
        </ViewerV2Context.Provider>
      )
    }

    render(<StatefulAutoTourController />)

    act(() => window.dispatchEvent(new Event('flycamera-advance')))

    expect(setSelectedOrgan).toHaveBeenLastCalledWith('mieng')
    expect(setSelectedOrgan).not.toHaveBeenCalledWith('thuc_quan')
    expect(setFlyCameraPaused).not.toHaveBeenCalledWith(false)
    expect(setFlyCameraOrganPopup).not.toHaveBeenCalledWith(null)
  })

  it('removes the flycamera-advance listener when fly camera becomes inactive', () => {
    const setSelectedOrgan = vi.fn()

    const { rerender } = renderWithViewerContext(<AutoTourController />, {
      flyCameraActive: true,
      flyCameraOrganPopup: 'mieng',
      flyCameraPaused: true,
      selectedOrgan: 'mieng',
      setSelectedOrgan,
    })

    rerender(
      <ViewerV2Context.Provider
        value={createViewerValue({
          flyCameraActive: false,
          flyCameraOrganPopup: 'mieng',
          flyCameraPaused: true,
          selectedOrgan: 'mieng',
          setSelectedOrgan,
        })}
      >
        <AutoTourController />
      </ViewerV2Context.Provider>,
    )

    act(() => window.dispatchEvent(new Event('flycamera-advance')))

    expect(setSelectedOrgan).not.toHaveBeenCalledWith('thuc_quan')
  })

  it('cancels the tour when selection changes manually', () => {
    const setFlyCameraActive = vi.fn()
    const manuallySelectOrganRef = { current: (() => undefined) as (organ: string) => void }

    function StatefulAutoTourController() {
      const [selectedOrgan, updateSelectedOrgan] = useState<string | null>(null)

      useEffect(() => {
        manuallySelectOrganRef.current = updateSelectedOrgan
      }, [])

      return (
        <ViewerV2Context.Provider
          value={createViewerValue({
            flyCameraActive: true,
            selectedOrgan,
            setFlyCameraActive,
            setSelectedOrgan: updateSelectedOrgan,
          })}
        >
          <AutoTourController />
        </ViewerV2Context.Provider>
      )
    }

    render(<StatefulAutoTourController />)

    act(() => {
      manuallySelectOrganRef.current('gan')
    })

    expect(setFlyCameraActive).toHaveBeenCalledWith(false)
  })

  it('clears pause and popup state when selection changes manually', () => {
    const setFlyCameraActive = vi.fn()
    const setFlyCameraPaused = vi.fn()
    const setFlyCameraOrganPopup = vi.fn()
    const manuallySelectOrganRef = { current: (() => undefined) as (organ: string) => void }

    function StatefulAutoTourController() {
      const [selectedOrgan, updateSelectedOrgan] = useState<string | null>(null)

      useEffect(() => {
        manuallySelectOrganRef.current = updateSelectedOrgan
      }, [])

      return (
        <ViewerV2Context.Provider
          value={createViewerValue({
            flyCameraActive: true,
            selectedOrgan,
            setFlyCameraActive,
            setFlyCameraPaused,
            setFlyCameraOrganPopup,
            setSelectedOrgan: updateSelectedOrgan,
          })}
        >
          <AutoTourController />
        </ViewerV2Context.Provider>
      )
    }

    render(<StatefulAutoTourController />)

    act(() => {
      manuallySelectOrganRef.current('gan')
    })

    expect(setFlyCameraActive).toHaveBeenCalledWith(false)
    expect(setFlyCameraPaused).toHaveBeenCalledWith(false)
    expect(setFlyCameraOrganPopup).toHaveBeenCalledWith(null)
  })

  it('clears selection, targets overview, and disables fly camera after the final stop', () => {
    const setCameraTarget = vi.fn()
    const setFlyCameraActive = vi.fn()
    const setFlyCameraPaused = vi.fn()
    const setFlyCameraOrganPopup = vi.fn()
    const setSelectedOrgan = vi.fn()

    function StatefulAutoTourController() {
      const [selectedOrgan, updateSelectedOrgan] = useState<string | null>(null)
      const [flyCameraActive, updateFlyCameraActive] = useState(true)
      const [flyCameraPaused, updateFlyCameraPaused] = useState(false)
      const [flyCameraOrganPopup, updateFlyCameraOrganPopup] = useState<string | null>(null)
      const [isTransitioning, updateIsTransitioning] = useState(true)

      useEffect(() => {
        if (selectedOrgan !== null) {
          const timeoutId = window.setTimeout(() => updateIsTransitioning(false), 0)
          return () => window.clearTimeout(timeoutId)
        }

        return undefined
      }, [selectedOrgan])

      return (
        <ViewerV2Context.Provider
          value={createViewerValue({
            flyCameraActive,
            flyCameraPaused,
            flyCameraOrganPopup,
            isTransitioning,
            selectedOrgan,
            setCameraTarget,
            setFlyCameraActive: (active) => {
              setFlyCameraActive(active)
              updateFlyCameraActive(active)
            },
            setFlyCameraPaused: (paused) => {
              setFlyCameraPaused(paused)
              updateFlyCameraPaused(paused)
            },
            setFlyCameraOrganPopup: (organ) => {
              setFlyCameraOrganPopup(organ)
              updateFlyCameraOrganPopup(organ)
            },
            setSelectedOrgan: (organ) => {
              setSelectedOrgan(organ)
              if (organ !== null) updateIsTransitioning(true)
              updateSelectedOrgan(organ)
            },
          })}
        >
          <AutoTourController />
        </ViewerV2Context.Provider>
      )
    }

    vi.useFakeTimers()

    render(<StatefulAutoTourController />)

    act(() => vi.advanceTimersByTime(0))

    for (let i = 0; i < 8; i += 1) {
      act(() => window.dispatchEvent(new Event('flycamera-advance')))
      act(() => vi.advanceTimersByTime(0))
    }

    expect(setSelectedOrgan).toHaveBeenLastCalledWith(null)
    expect(setCameraTarget).toHaveBeenCalledWith('overview')
    expect(setFlyCameraActive).toHaveBeenCalledWith(false)
    expect(setFlyCameraPaused).toHaveBeenLastCalledWith(false)
    expect(setFlyCameraOrganPopup).toHaveBeenLastCalledWith(null)
  })

  it('clears pause and popup state when fly camera becomes inactive', () => {
    const setFlyCameraPaused = vi.fn()
    const setFlyCameraOrganPopup = vi.fn()

    const { rerender } = renderWithViewerContext(<AutoTourController />, {
      flyCameraActive: true,
      selectedOrgan: 'mieng',
      flyCameraPaused: true,
      flyCameraOrganPopup: 'mieng',
      setFlyCameraPaused,
      setFlyCameraOrganPopup,
    })

    rerender(
      <ViewerV2Context.Provider
        value={createViewerValue({
          flyCameraActive: false,
          selectedOrgan: 'mieng',
          flyCameraPaused: true,
          flyCameraOrganPopup: 'mieng',
          setFlyCameraPaused,
          setFlyCameraOrganPopup,
        })}
      >
        <AutoTourController />
      </ViewerV2Context.Provider>,
    )

    expect(setFlyCameraPaused).toHaveBeenLastCalledWith(false)
    expect(setFlyCameraOrganPopup).toHaveBeenLastCalledWith(null)
  })
})
