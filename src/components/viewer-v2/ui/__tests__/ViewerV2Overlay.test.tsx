import { renderStarter } from '@/test/starterRender'
import { fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { ViewerV2Context } from '../../viewerV2Context'
import type { ViewerV2ContextValue } from '../../viewerV2Context'
import { captureScreenshot } from '../screenshot'
import { ViewerV2Overlay } from '../ViewerV2Overlay'

const mockNavigate = vi.hoisted(() => vi.fn())

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../screenshot', () => ({
  captureScreenshot: vi.fn(),
}))

vi.mock('@/services/ai', () => ({
  DEFAULT_GENAI_PROMPT: 'Explain the digestive system',
  chat: vi.fn().mockResolvedValue('Generated digestive system description.'),
  generateImage: vi.fn().mockResolvedValue('https://example.test/generated.png'),
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
    viewMode: '3d',
    setViewMode: vi.fn(),
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
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([{ question: 'Question one?', options: ['Correct', 'Wrong'], correct_answer: 0 }]),
      }),
    )
    mockNavigate.mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders essential localized controls without the old viewer context', () => {
    renderOverlay()

    expect(screen.getByText('Phần mềm 3D Hệ tiêu hóa')).toBeInTheDocument()
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
    expect(screen.getByRole('combobox', { name: 'View mode' })).toHaveTextContent('3D')
    expect(screen.queryByRole('button', { name: 'Show mesh debug' })).not.toBeInTheDocument()
  })

  it('updates the view mode from the floating selector', () => {
    const setViewMode = vi.fn()
    renderOverlay({ setViewMode })

    fireEvent.click(screen.getByRole('combobox', { name: 'View mode' }))
    fireEvent.click(screen.getByRole('option', { name: '2D' }))

    expect(setViewMode).toHaveBeenCalledWith('2d')
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

  it('navigates back to the menu from the home button', () => {
    renderOverlay()

    fireEvent.click(screen.getByRole('button', { name: 'Home' }))

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it.each(['video', 'settings'] as const)(
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

  it('shows the return button beside the view mode selector', () => {
    const requestViewReset = vi.fn()
    renderOverlay({ selectedOrgan: null, requestViewReset })

    fireEvent.click(screen.getByRole('button', { name: 'Return to overview' }))

    expect(requestViewReset).toHaveBeenCalled()
    expect(screen.getByRole('combobox', { name: 'View mode' })).toBeInTheDocument()
  })

  it('hides the return and view mode controls when a panel is open', () => {
    renderOverlay({ activeDialog: 'info', selectedOrgan: 'Stomach' })

    expect(screen.queryByRole('button', { name: 'Return to overview' })).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'View mode' })).not.toBeInTheDocument()
  })

  it('captures a screenshot from the screenshot menu action', () => {
    renderOverlay()

    fireEvent.click(screen.getByRole('button', { name: 'Screenshot' }))

    expect(captureScreenshot).toHaveBeenCalled()
  })

  it('resets the model color from the overlay color picker', () => {
    const setModelColor = vi.fn()
    renderOverlay({ modelColor: '#ffffff', setModelColor })

    fireEvent.click(screen.getByRole('button', { name: 'Model Color' }))
    fireEvent.click(screen.getByRole('button', { name: 'Default' }))

    expect(setModelColor).toHaveBeenCalledTimes(1)
    expect(setModelColor).toHaveBeenCalledWith(null)
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
    expect(screen.queryByText('Phần mềm 3D Hệ tiêu hóa')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rotate Model' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Model Color' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Background Color' })).toBeInTheDocument()
  })

  it('shows and closes the detailed info panel', () => {
    const setActiveDialog = vi.fn()
    renderOverlay({ activeDialog: 'info', setActiveDialog })

    const dialog = screen.getByRole('dialog', { name: 'Human Digestive System' })
    expect(within(dialog).getByText(/The human digestive system includes the gastrointestinal tract/i)).toBeInTheDocument()
    expect(within(dialog).getByRole('combobox', { name: 'Voice' })).toHaveTextContent('Northern')
    expect(within(dialog).getByRole('button', { name: 'Turn on narration' })).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }))

    expect(setActiveDialog).toHaveBeenCalledWith(null)
  })

  it('shows and closes the quiz panel', async () => {
    const setActiveDialog = vi.fn()
    renderOverlay({ activeDialog: 'quiz', setActiveDialog })

    const dialog = screen.getByRole('dialog', { name: 'Quiz' })
    expect(await within(dialog).findByText('1 questions available in the source.')).toBeInTheDocument()
    expect(within(dialog).queryByText('This feature is under development.')).not.toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }))

    expect(setActiveDialog).toHaveBeenCalledWith(null)
  })

  it('shows and closes the GenAI panel instead of the placeholder dialog', async () => {
    const setActiveDialog = vi.fn()
    renderOverlay({ activeDialog: 'genai', setActiveDialog })

    const dialog = screen.getByRole('dialog', { name: 'Digestive System Description' })
    expect(await within(dialog).findByText('Regenerate')).toBeInTheDocument()
    expect(within(dialog).queryByText('This feature is under development.')).not.toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }))

    expect(setActiveDialog).toHaveBeenCalledWith(null)
  })

  it('shows and closes the video player panel from active sheet state', () => {
    const setActiveSheet = vi.fn()
    renderOverlay({ activeSheet: 'video', setActiveSheet })

    const panel = screen.getByRole('region', { name: 'Learning Video' })
    expect(within(panel).getByRole('combobox', { name: 'Voice' })).toHaveTextContent('Northern')
    expect(within(panel).getByTestId('learning-video')).toHaveAttribute('src', '/videos/b%E1%BA%AFc.mp4')

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

  it('shows and closes the chatbot panel instead of the placeholder dialog', () => {
    const setActiveSheet = vi.fn()
    renderOverlay({ activeSheet: 'chatbot', setActiveSheet })

    const dialog = screen.getByRole('dialog', { name: 'AI Chatbot' })
    expect(within(dialog).getByRole('tab', { name: 'Chat' })).toBeInTheDocument()
    expect(within(dialog).getByRole('tab', { name: 'Image' })).toBeInTheDocument()
    expect(within(dialog).queryByText('This feature is under development.')).not.toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }))

    expect(setActiveSheet).toHaveBeenCalledWith(null)
  })
})
