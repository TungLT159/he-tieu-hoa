import { renderStarter } from '@/test/starterRender'
import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { ViewerV2Context } from '../../viewerV2Context'
import type { ViewerV2ContextValue } from '../../viewerV2Context'
import { captureScreenshot } from '../screenshot'
import { ViewerV2Overlay } from '../ViewerV2Overlay'

vi.mock('../screenshot', () => ({
  captureScreenshot: vi.fn(),
}))

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

function renderOverlay(overrides: Partial<ViewerV2ContextValue> = {}) {
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
        <ViewerV2Overlay />
      </ViewerV2Context.Provider>
    </StarterSettingsContext.Provider>,
  )
}

describe('ViewerV2Overlay', () => {
  it('renders essential localized controls without the old viewer context', () => {
    renderOverlay()

    expect(screen.getByText('Starter-Tauri-App')).toBeInTheDocument()
    expect(screen.getByText('Model Interaction')).toBeInTheDocument()
    expect(screen.getByText('Learning')).toBeInTheDocument()
    expect(screen.getByText('Tools')).toBeInTheDocument()
    expect(screen.getByText('System')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Collapse' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rotate Model' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fly Camera' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Model Color' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Background Color' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quiz' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Information' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Annotation' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Show mesh debug' })).not.toBeInTheDocument()
  })

  it('updates v2 state through overlay controls', () => {
    const setIsSpinning = vi.fn()
    const setIsMenuOpen = vi.fn()
    const setActiveSheet = vi.fn()
    const setActiveDialog = vi.fn()
    renderOverlay({ setIsMenuOpen, setIsSpinning, setActiveSheet, setActiveDialog })

    fireEvent.click(screen.getByRole('button', { name: 'Collapse' }))
    fireEvent.click(screen.getByRole('button', { name: 'Rotate Model' }))
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    fireEvent.click(screen.getByRole('button', { name: 'Learning Video' }))

    expect(setIsMenuOpen).toHaveBeenCalledWith(false)
    expect(setIsSpinning).toHaveBeenCalledWith(true)
    expect(setActiveSheet).toHaveBeenCalledWith('settings')
    expect(setActiveSheet).toHaveBeenCalledWith('video')
    expect(setActiveDialog).not.toHaveBeenCalledWith('video')
  })

  it.each(['video', 'settings', 'chatbot'] as const)(
    'clears the active sheet before opening info while %s is active',
    (activeSheet) => {
      const setActiveSheet = vi.fn()
      const setActiveDialog = vi.fn()
      renderOverlay({ activeSheet, setActiveDialog, setActiveSheet })

      fireEvent.click(screen.getByRole('button', { name: 'Information' }))

      expect(setActiveSheet).toHaveBeenCalledWith(null)
      expect(setActiveDialog).toHaveBeenCalledWith('info')
    },
  )

  it('clears the active dialog before opening video', () => {
    const setActiveDialog = vi.fn()
    const setActiveSheet = vi.fn()
    renderOverlay({ activeDialog: 'info', setActiveDialog, setActiveSheet })

    fireEvent.click(screen.getByRole('button', { name: 'Learning Video' }))

    expect(setActiveDialog).toHaveBeenCalledWith(null)
    expect(setActiveSheet).toHaveBeenCalledWith('video')
  })

  it('shows a floating return button only when an organ is selected', () => {
    const requestViewReset = vi.fn()
    renderOverlay({ selectedOrgan: 'Stomach', requestViewReset })

    fireEvent.click(screen.getByRole('button', { name: 'Return to overview' }))

    expect(requestViewReset).toHaveBeenCalled()
  })

  it('hides the floating return button when no organ is selected', () => {
    renderOverlay({ selectedOrgan: null })

    expect(screen.queryByRole('button', { name: 'Return to overview' })).not.toBeInTheDocument()
  })

  it('hides the floating return button when a panel is open', () => {
    renderOverlay({ activeDialog: 'info', selectedOrgan: 'Stomach' })

    expect(screen.queryByRole('button', { name: 'Return to overview' })).not.toBeInTheDocument()
  })

  it('captures a screenshot from the screenshot menu action', () => {
    renderOverlay()

    fireEvent.click(screen.getByRole('button', { name: 'Screenshot' }))

    expect(captureScreenshot).toHaveBeenCalled()
  })

  it('shows and closes the v2 settings panel from active sheet state', () => {
    const setActiveSheet = vi.fn()
    renderOverlay({ activeSheet: 'settings', setActiveSheet })

    const dialog = screen.getByRole('dialog', { name: 'Settings' })
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByRole('radio', { name: 'Smooth' })).toBeInTheDocument()
    expect(within(dialog).getByRole('radio', { name: 'Medium' })).toBeChecked()
    expect(within(dialog).getByRole('radio', { name: 'High' })).toBeInTheDocument()
    expect(within(dialog).getByRole('slider', { name: 'Volume' })).toBeInTheDocument()
    expect(within(dialog).getByRole('radio', { name: 'Northern' })).toBeChecked()
    expect(within(dialog).getByRole('radio', { name: 'Central' })).toBeInTheDocument()
    expect(within(dialog).getByRole('radio', { name: 'Southern' })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Model Color' })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Background Color' })).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Close settings' }))

    expect(setActiveSheet).toHaveBeenCalledWith(null)
  })

  it('keeps Collapse visible when the menu is closed', () => {
    renderOverlay({ isMenuOpen: false })

    expect(screen.getByRole('button', { name: 'Expand' })).toBeInTheDocument()
    expect(screen.queryByText('Starter-Tauri-App')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rotate Model' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Model Color' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Background Color' })).toBeInTheDocument()
  })

  it('shows and closes the info placeholder dialog', () => {
    const setActiveDialog = vi.fn()
    renderOverlay({ activeDialog: 'info', setActiveDialog })

    const dialog = screen.getByRole('dialog', { name: 'Human Digestive System' })
    expect(within(dialog).getByText('Explore the main organs of the digestive system in the order food moves through the body.')).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }))

    expect(setActiveDialog).toHaveBeenCalledWith(null)
  })

  it('shows and closes the quiz placeholder dialog', () => {
    const setActiveDialog = vi.fn()
    renderOverlay({ activeDialog: 'quiz', setActiveDialog })

    const dialog = screen.getByRole('dialog', { name: 'Quiz' })
    expect(within(dialog).getByText('This feature is under development.')).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }))

    expect(setActiveDialog).toHaveBeenCalledWith(null)
  })

  it('shows and closes the GenAI placeholder dialog', () => {
    const setActiveDialog = vi.fn()
    renderOverlay({ activeDialog: 'genai', setActiveDialog })

    const dialog = screen.getByRole('dialog', { name: 'Digestive System Description' })
    expect(within(dialog).getByText('This feature is under development.')).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }))

    expect(setActiveDialog).toHaveBeenCalledWith(null)
  })

  it('shows and closes the video player panel from active sheet state', () => {
    const setActiveSheet = vi.fn()
    renderOverlay({ activeSheet: 'video', setActiveSheet })

    const panel = screen.getByRole('region', { name: 'Learning Video' })
    expect(within(panel).getByTestId('learning-video')).toHaveAttribute('src', '/videos/he-tieu-hoa.mp4')

    fireEvent.click(within(panel).getByRole('button', { name: 'Close' }))

    expect(setActiveSheet).toHaveBeenCalledWith(null)
  })

  it('renders annotation toolbar while drawing is active', () => {
    renderOverlay({ isDrawing: true })

    const toolbar = screen.getByRole('toolbar', { name: 'Annotation' })
    expect(within(toolbar).getByRole('button', { name: 'Pen' })).toBeInTheDocument()
    expect(within(toolbar).getByRole('button', { name: 'Eraser' })).toBeInTheDocument()
    expect(within(toolbar).getByRole('button', { name: 'Clear All' })).toBeInTheDocument()
  })

  it('shows and closes the chatbot placeholder dialog', () => {
    const setActiveSheet = vi.fn()
    renderOverlay({ activeSheet: 'chatbot', setActiveSheet })

    const dialog = screen.getByRole('dialog', { name: 'AI Chatbot' })
    expect(within(dialog).getByText('This feature is under development.')).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }))

    expect(setActiveSheet).toHaveBeenCalledWith(null)
  })
})
