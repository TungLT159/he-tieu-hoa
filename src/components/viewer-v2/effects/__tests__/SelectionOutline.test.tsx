import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ViewerV2Context } from '../../viewerV2Context'
import type { ViewerV2ContextValue } from '../../viewerV2Context'
import { SelectionOutline } from '../SelectionOutline'

const { selectMock, selectionMock } = vi.hoisted(() => ({
  selectMock: vi.fn(({ children }) => <div data-testid="select">{children}</div>),
  selectionMock: vi.fn(({ children }) => <div data-testid="selection">{children}</div>),
}))

vi.mock('@react-three/postprocessing', () => ({
  Select: selectMock,
  Selection: selectionMock,
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
    ...overrides,
  }
}

function renderWithViewer(children: ReactNode, overrides: Partial<ViewerV2ContextValue> = {}) {
  return render(
    <ViewerV2Context.Provider value={createViewerValue(overrides)}>{children}</ViewerV2Context.Provider>,
  )
}

describe('SelectionOutline', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children inside the selection wrapper without selecting the whole subtree', () => {
    renderWithViewer(
      <SelectionOutline>
        <div data-testid="child">child</div>
      </SelectionOutline>,
    )

    expect(screen.getByTestId('selection')).toBeTruthy()
    expect(screen.queryByTestId('select')).not.toBeInTheDocument()
    expect(screen.getByTestId('child')).toBeTruthy()
  })

  it('does not render Select when no organ is selected', () => {
    renderWithViewer(<SelectionOutline>child</SelectionOutline>)

    expect(selectMock).not.toHaveBeenCalled()
  })

  it('enables Select when an organ is selected', () => {
    renderWithViewer(<SelectionOutline>child</SelectionOutline>, { selectedOrgan: 'da_day' })

    expect(selectMock).not.toHaveBeenCalled()
  })

  it('does not render Select while transitioning even when an organ is selected', () => {
    renderWithViewer(<SelectionOutline>child</SelectionOutline>, {
      isTransitioning: true,
      selectedOrgan: 'da_day',
    })

    expect(selectMock).not.toHaveBeenCalled()
  })
})
