import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import * as THREE from 'three'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import type { StarterSettingsContextValue } from '@/app/StarterSettingsContext'
import type { StarterSettings } from '@/app/settingsStorage'
import type { AppLocale } from '@/lib/i18n'

import { ViewerProvider } from '../ViewerContext.tsx'
import { CameraController } from '../CameraController'
import { ViewerMenu } from '../ViewerMenu'
import { useViewer } from '../viewerContext'

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
}))

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({
    camera: new THREE.PerspectiveCamera(75, 1, 0.1, 1000),
  })),
}))

function createMockSettingsContext(
  overrides: Partial<StarterSettingsContextValue> = {},
): StarterSettingsContextValue {
  return {
    locale: 'vi' as AppLocale,
    appVersion: '1.0.0',
    resolvedThemeMode: 'dark',
    settings: {
      themeMode: 'dark',
      uiLanguage: 'vi',
      profileDisplayName: 'Test',
      notificationsEnabled: false,
    } as StarterSettings,
    updateSettings: () => {},
    ...overrides,
  }
}

function ViewerColorStatus() {
  const { backgroundColor, modelColor } = useViewer()

  return <div data-testid="viewer-colors">{`${backgroundColor}:${modelColor ?? 'none'}`}</div>
}

function ViewerTourStatus() {
  const { cameraTarget, flyCameraActive, isTransitioning, selectedOrgan, setCameraTarget, setSelectedOrgan } =
    useViewer()

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setSelectedOrgan('da_day')
          setCameraTarget('da_day')
        }}
      >
        Select stomach
      </button>
      <div data-testid="viewer-tour">
        {`${selectedOrgan ?? 'none'}:${cameraTarget}:${flyCameraActive}:${isTransitioning}`}
      </div>
    </div>
  )
}

function renderMenu(locale: AppLocale = 'vi') {
  const Provider = StarterSettingsContext.Provider
  return render(
    <Provider value={createMockSettingsContext({ locale })}>
      <ViewerProvider>
        <ViewerMenu />
        <ViewerColorStatus />
        <ViewerTourStatus />
        <CameraController />
      </ViewerProvider>
    </Provider>,
  )
}

describe('ViewerMenu', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders menu with all four groups when open', () => {
    renderMenu()

    expect(screen.getByText('Tương tác mô hình')).toBeInTheDocument()
    expect(screen.getByText('Học tập')).toBeInTheDocument()
    expect(screen.getByText('Công cụ')).toBeInTheDocument()
    expect(screen.getByText('Hệ thống')).toBeInTheDocument()
  })

  it('renders all intended menu buttons', () => {
    renderMenu()

    const labels = [
      'Xoay mô hình',
      'Đổi màu mô hình',
      'Đổi màu nền',
      'Fly camera',
      'Câu hỏi trắc nghiệm',
      'Thông tin',
      'Video học liệu',
      'Gen AI mô tả',
      'Chatbot AI',
      'Vẽ chú thích',
      'Chụp màn hình',
      'Bộ soạn thảo',
      'Cài đặt',
      'Toàn màn hình',
      'Màn hình chính',
    ]

    for (const label of labels) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
  })

  it('keeps unavailable placeholders disabled without active behavior', () => {
    renderMenu()

    const placeholderLabels = [
      'Video học liệu',
      'Bộ soạn thảo',
      'Màn hình chính',
    ]

    for (const label of placeholderLabels) {
      const button = screen.getByRole('button', { name: label })

      // ViewerMenuGroup uses aria-disabled so collapsed disabled icon buttons can still show tooltips.
      expect(button).toHaveAttribute('aria-disabled', 'true')
      expect(button).not.toBeDisabled()
      expect(button).not.toHaveAttribute('aria-pressed')
    }

    expect(screen.getByRole('button', { name: 'Chụp màn hình' })).not.toHaveAttribute('aria-disabled')
  })

  it('explains why the video button is unavailable', () => {
    renderMenu('en')

    expect(screen.getByRole('button', { name: 'Learning Video' })).toHaveAttribute(
      'title',
      'Learning video is unavailable until a video asset is provided.',
    )
  })

  it('explains why the editor button is unavailable', () => {
    renderMenu('en')

    expect(screen.getByRole('button', { name: 'Editor' })).toHaveAttribute(
      'title',
      'External editor integration is not configured yet.',
    )
  })

  it('explains why the home button is unavailable', () => {
    renderMenu('en')

    expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute(
      'title',
      'Home navigation is not available in this single-page viewer yet.',
    )
  })

  it('downloads the scoped viewer canvas as a PNG screenshot and cleans up the object URL', async () => {
    const otherCanvas = document.createElement('canvas')
    otherCanvas.width = 100
    otherCanvas.height = 100
    const viewerCanvas = document.createElement('canvas')
    viewerCanvas.width = 100
    viewerCanvas.height = 100
    viewerCanvas.setAttribute('data-viewer-canvas', 'true')
    document.body.append(otherCanvas, viewerCanvas)
    const blob = new Blob(['screenshot'], { type: 'image/png' })
    const otherToBlob = vi.fn()
    const viewerToBlob = vi.fn((callback: BlobCallback) => callback(blob))
    Object.defineProperty(otherCanvas, 'toBlob', { configurable: true, value: otherToBlob })
    Object.defineProperty(viewerCanvas, 'toBlob', { configurable: true, value: viewerToBlob })
    const createObjectURL = vi.fn(() => 'blob:viewer-screenshot')
    const revokeObjectURL = vi.fn()
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL })
    const click = vi.fn()
    const anchor = document.createElement('a')
    Object.defineProperty(anchor, 'click', { configurable: true, value: click })
    const createElement = Document.prototype.createElement
    vi.spyOn(document, 'createElement').mockImplementation(function mockCreateElement(tagName: string) {
      if (tagName === 'a') return anchor

      return createElement.call(document, tagName)
    })

    renderMenu()

    fireEvent.click(screen.getByRole('button', { name: 'Chụp màn hình' }))

    await waitFor(() => expect(viewerToBlob).toHaveBeenCalledWith(expect.any(Function), 'image/png'))
    expect(otherToBlob).not.toHaveBeenCalled()
    expect(createObjectURL).toHaveBeenCalledWith(blob)
    expect(anchor.href).toBe('blob:viewer-screenshot')
    expect(anchor.download).toMatch(/^screenshot-.*\.png$/)
    expect(click).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:viewer-screenshot')

    otherCanvas.remove()
    viewerCanvas.remove()
  })

  it('revokes the screenshot object URL when the download click fails', async () => {
    const viewerCanvas = document.createElement('canvas')
    viewerCanvas.width = 100
    viewerCanvas.height = 100
    viewerCanvas.setAttribute('data-viewer-canvas', 'true')
    document.body.append(viewerCanvas)
    const blob = new Blob(['screenshot'], { type: 'image/png' })
    Object.defineProperty(viewerCanvas, 'toBlob', {
      configurable: true,
      value: (callback: BlobCallback) => callback(blob),
    })
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:viewer-screenshot') })
    const revokeObjectURL = vi.fn()
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL })
    const anchor = document.createElement('a')
    Object.defineProperty(anchor, 'click', {
      configurable: true,
      value: vi.fn(() => {
        throw new Error('download blocked')
      }),
    })
    const createElement = Document.prototype.createElement
    vi.spyOn(document, 'createElement').mockImplementation(function mockCreateElement(tagName: string) {
      if (tagName === 'a') return anchor

      return createElement.call(document, tagName)
    })

    renderMenu()

    fireEvent.click(screen.getByRole('button', { name: 'Chụp màn hình' }))

    await waitFor(() => expect(revokeObjectURL).toHaveBeenCalledWith('blob:viewer-screenshot'))

    viewerCanvas.remove()
  })

  it('does not download a zero-sized screenshot canvas', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 0
    canvas.height = 0
    canvas.setAttribute('data-viewer-canvas', 'true')
    document.body.append(canvas)
    const toBlob = vi.fn()
    Object.defineProperty(canvas, 'toBlob', { configurable: true, value: toBlob })

    renderMenu()

    fireEvent.click(screen.getByRole('button', { name: 'Chụp màn hình' }))

    expect(toBlob).not.toHaveBeenCalled()

    canvas.remove()
  })

  it('does not throw when screenshot capture has no canvas', () => {
    renderMenu()

    expect(() => fireEvent.click(screen.getByRole('button', { name: 'Chụp màn hình' }))).not.toThrow()
  })

  it('toggles fullscreen through the browser fallback when Tauri is unavailable', async () => {
    const requestFullscreen = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      configurable: true,
      value: requestFullscreen,
    })

    renderMenu()

    const fullscreenButton = screen.getByRole('button', { name: 'Toàn màn hình' })
    expect(fullscreenButton).not.toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(fullscreenButton)

    await waitFor(() => expect(requestFullscreen).toHaveBeenCalledOnce())
  })

  it('opens background color choices and updates viewer background color', () => {
    renderMenu('en')

    fireEvent.click(screen.getByRole('button', { name: 'Background Color' }))
    fireEvent.click(screen.getByRole('button', { name: '#0f172a' }))

    expect(screen.getByTestId('viewer-colors')).toHaveTextContent('#0f172a:none')
  })

  it('opens model color choices, updates model color, and can reset it', () => {
    renderMenu('en')

    fireEvent.click(screen.getByRole('button', { name: 'Model Color' }))
    fireEvent.click(screen.getByRole('button', { name: '#f97316' }))

    expect(screen.getByTestId('viewer-colors')).toHaveTextContent('#1a1a2e:#f97316')

    fireEvent.click(screen.getByRole('button', { name: 'Default' }))

    expect(screen.getByTestId('viewer-colors')).toHaveTextContent('#1a1a2e:none')
  })

  it('toggles menu open and closed while visually hiding group titles', () => {
    renderMenu()

    fireEvent.click(screen.getByLabelText('Thu gọn'))

    expect(screen.getByLabelText('Mở rộng')).toBeInTheDocument()
    expect(screen.getByText('Tương tác mô hình')).toHaveClass('sr-only')
  })

  it('toggles chatbot active state', () => {
    renderMenu()

    const chatbotButton = screen.getByRole('button', { name: 'Chatbot AI' })

    expect(chatbotButton).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(chatbotButton)
    expect(chatbotButton).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(chatbotButton)
    expect(chatbotButton).toHaveAttribute('aria-pressed', 'false')
  })

  it('cancels an active fly camera tour and resets the selection', () => {
    renderMenu()

    fireEvent.click(screen.getByRole('button', { name: 'Select stomach' }))
    expect(screen.getByTestId('viewer-tour')).toHaveTextContent('da_day:da_day:false:false')

    fireEvent.click(screen.getByRole('button', { name: 'Fly camera' }))
    expect(screen.getByTestId('viewer-tour')).toHaveTextContent('mieng:da_day:true:false')

    fireEvent.click(screen.getByRole('button', { name: 'Fly camera' }))

    expect(screen.getByTestId('viewer-tour')).toHaveTextContent('none:overview:false:true')
  })
})
