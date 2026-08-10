import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { ViewerDebugPanel } from '../ViewerDebugPanel'
import { ViewerContext } from '../viewerContext'
import type { ViewerContextValue } from '../viewerContext'

function renderViewerDebugPanel(viewerOverrides: Partial<ViewerContextValue> = {}) {
  return render(
    <StarterSettingsContext.Provider
      value={{
        appVersion: '0.1.0',
        locale: 'en',
        resolvedThemeMode: 'light',
        settings: DEFAULT_STARTER_SETTINGS,
        updateSettings: vi.fn(),
      }}
    >
      <ViewerContext.Provider
        value={{
          selectedOrgan: null,
          setSelectedOrgan: vi.fn(),
          organNodes: new Map(),
          registerOrganNode: vi.fn(),
          modelMeshes: [],
          registerModelMesh: vi.fn(),
          lastClickedMeshName: null,
          setLastClickedMeshName: vi.fn(),
          isDebugPanelOpen: false,
          setIsDebugPanelOpen: vi.fn(),
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
          ...viewerOverrides,
        }}
      >
        <ViewerDebugPanel />
      </ViewerContext.Provider>
    </StarterSettingsContext.Provider>,
  )
}

describe('ViewerDebugPanel', () => {
  it('renders nothing when the panel is closed', () => {
    const result = renderViewerDebugPanel()

    expect(result.container).toBeEmptyDOMElement()
  })

  it('renders debug state, mapped meshes, unmapped meshes, and empty meshes when open', () => {
    renderViewerDebugPanel({
      selectedOrgan: 'da_day',
      lastClickedMeshName: 'digestive_system001',
      isDebugPanelOpen: true,
      modelMeshes: [
        {
          meshUuid: 'mapped-1',
          meshName: 'digestive_system001',
          organName: 'da_day',
          vertexCount: 128,
          isSelectable: true,
          isEmpty: false,
        },
        {
          meshUuid: 'unmapped-1',
          meshName: 'debug_unmapped',
          organName: null,
          vertexCount: 24,
          isSelectable: false,
          isEmpty: false,
        },
        {
          meshUuid: 'empty-1',
          meshName: 'debug_empty',
          organName: null,
          vertexCount: 0,
          isSelectable: false,
          isEmpty: true,
        },
      ],
    })

    expect(screen.getByText('Mesh debug')).toBeInTheDocument()
    expect(screen.getByText('Selected organ')).toBeInTheDocument()
    expect(screen.getAllByText('da_day')).toHaveLength(2)
    expect(screen.getByText('Last clicked mesh')).toBeInTheDocument()
    expect(screen.getByText('digestive_system001')).toBeInTheDocument()
    expect(screen.getByText('Last clicked organ')).toBeInTheDocument()

    const mappedMeshes = screen.getByRole('list', { name: 'Mapped meshes' })
    expect(within(mappedMeshes).getByText(/digestive_system001/)).toBeInTheDocument()
    expect(within(mappedMeshes).getByText(/da_day/)).toBeInTheDocument()
    expect(within(mappedMeshes).getByText(/128/)).toBeInTheDocument()

    const unmappedMeshes = screen.getByRole('list', { name: 'Unmapped meshes' })
    expect(within(unmappedMeshes).getByText(/debug_unmapped/)).toBeInTheDocument()
    expect(within(unmappedMeshes).getByText(/24/)).toBeInTheDocument()

    const emptyMeshes = screen.getByRole('list', { name: 'Empty meshes' })
    expect(within(emptyMeshes).getByText(/debug_empty/)).toBeInTheDocument()
    expect(within(emptyMeshes).getByText(/empty/)).toBeInTheDocument()
  })

  it('renders localized none labels for missing selection and clicked mesh', () => {
    renderViewerDebugPanel({ isDebugPanelOpen: true })

    expect(screen.getAllByText('None')).toHaveLength(3)
  })

  it('shows none for the last clicked organ when the clicked mesh is unmapped', () => {
    renderViewerDebugPanel({
      isDebugPanelOpen: true,
      lastClickedMeshName: 'debug_unmapped',
      modelMeshes: [
        {
          meshUuid: 'unmapped-1',
          meshName: 'debug_unmapped',
          organName: null,
          vertexCount: 24,
          isSelectable: false,
          isEmpty: false,
        },
      ],
    })

    expect(screen.getByText('Last clicked organ')).toBeInTheDocument()
    expect(screen.getAllByText('None')).toHaveLength(2)
  })
})
