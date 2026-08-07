import { renderStarter } from '@/test/starterRender'
import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { ViewerV2Context } from '../../viewerV2Context'
import type { ViewerV2ContextValue } from '../../viewerV2Context'
import { ViewerV2SettingsPanel } from '../ViewerV2SettingsPanel'

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

function renderPanel(overrides: Partial<ViewerV2ContextValue> = {}) {
  const value = createViewerValue(overrides)

  return renderStarter(
    <StarterSettingsContext.Provider
      value={{
        appVersion: '0.1.0',
        locale: 'en',
        resolvedThemeMode: 'light',
        settings: DEFAULT_STARTER_SETTINGS,
        updateSettings: vi.fn(),
      }}
    >
      <ViewerV2Context.Provider value={value}>
        <ViewerV2SettingsPanel />
      </ViewerV2Context.Provider>
    </StarterSettingsContext.Provider>,
  )
}

describe('ViewerV2SettingsPanel', () => {
  it('renders localized settings controls and current state', () => {
    renderPanel({ qualityPreset: 'high', volume: 55, voice: 'nam' })

    const dialog = screen.getByRole('dialog', { name: 'Settings' })
    expect(within(dialog).getByText('Quality')).toBeInTheDocument()
    expect(within(dialog).getByRole('radio', { name: 'Low' })).toHaveAttribute('data-slot', 'radio-group-item')
    expect(within(dialog).getByRole('radio', { name: 'Medium' })).toHaveAttribute('data-slot', 'radio-group-item')
    expect(within(dialog).getByRole('radio', { name: 'High' })).toBeChecked()
    expect(within(dialog).getByText('Volume')).toBeInTheDocument()
    expect(within(dialog).getByText('55')).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Mute' })).toBeInTheDocument()
    expect(within(dialog).getByText('Voice')).toBeInTheDocument()
    expect(within(dialog).getByRole('radio', { name: 'Southern' })).toBeChecked()
    expect(within(dialog).getByRole('radio', { name: 'Southern' })).toHaveAttribute('data-slot', 'radio-group-item')
    expect(within(dialog).getByRole('button', { name: 'Model Color' })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Background Color' })).toBeInTheDocument()
  })

  it('closes the settings sheet', () => {
    const setActiveSheet = vi.fn()
    renderPanel({ setActiveSheet })

    fireEvent.click(screen.getByRole('button', { name: 'Close settings' }))

    expect(setActiveSheet).toHaveBeenCalledWith(null)
  })

  it('updates quality and voice choices', () => {
    const setQualityPreset = vi.fn()
    const setVoice = vi.fn()
    renderPanel({ setQualityPreset, setVoice })

    fireEvent.click(screen.getByRole('radio', { name: 'Low' }))
    fireEvent.click(screen.getByRole('radio', { name: 'Central' }))

    expect(setQualityPreset).toHaveBeenCalledWith('low')
    expect(setVoice).toHaveBeenCalledWith('trung')
  })

  it('toggles mute between zero and default volume', () => {
    const setVolume = vi.fn()
    const { rerender } = renderPanel({ setVolume, volume: 80 })

    fireEvent.click(screen.getByRole('button', { name: 'Mute' }))
    expect(setVolume).toHaveBeenCalledWith(0)

    setVolume.mockClear()
    const value = createViewerValue({ setVolume, volume: 0 })
    rerender(
      <StarterSettingsContext.Provider
        value={{
          appVersion: '0.1.0',
          locale: 'en',
          resolvedThemeMode: 'light',
          settings: DEFAULT_STARTER_SETTINGS,
          updateSettings: vi.fn(),
        }}
      >
        <ViewerV2Context.Provider value={value}>
          <ViewerV2SettingsPanel />
        </ViewerV2Context.Provider>
      </StarterSettingsContext.Provider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Unmute' }))
    expect(setVolume).toHaveBeenCalledWith(80)
  })

  it('updates volume from the slider', () => {
    const setVolume = vi.fn()
    renderPanel({ setVolume, volume: 80 })

    fireEvent.keyDown(screen.getByRole('slider', { name: 'Volume' }), { key: 'ArrowLeft' })

    expect(setVolume).toHaveBeenCalledWith(79)
  })
})
