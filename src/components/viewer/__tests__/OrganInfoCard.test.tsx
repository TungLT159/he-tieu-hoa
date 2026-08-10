import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { OrganInfoCard } from '../OrganInfoCard'
import { ViewerContext } from '../viewerContext'
import type { ViewerContextValue } from '../viewerContext'

const setSelectedOrgan = vi.fn()

function renderOrganInfoCard(
  viewerOverrides: Partial<ViewerContextValue> = {},
  locale: 'en' | 'vi' = 'en',
) {
  return render(
    <StarterSettingsContext.Provider
      value={{
        appVersion: '0.1.0',
        locale,
        resolvedThemeMode: 'light',
        settings: DEFAULT_STARTER_SETTINGS,
        updateSettings: vi.fn(),
      }}
    >
      <ViewerContext.Provider
        value={{
          selectedOrgan: null,
          setSelectedOrgan,
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
        <OrganInfoCard />
      </ViewerContext.Provider>
    </StarterSettingsContext.Provider>,
  )
}

describe('OrganInfoCard', () => {
  beforeEach(() => {
    setSelectedOrgan.mockClear()
  })

  it('renders English organ details for a selected organ', () => {
    renderOrganInfoCard({ selectedOrgan: 'da_day' })

    expect(screen.getByText('Stomach')).toBeInTheDocument()
    expect(
      screen.getByText(/The stomach is a J-shaped digestive organ located between the esophagus/),
    ).toBeInTheDocument()
  })

  it('renders Vietnamese organ details when the app locale is Vietnamese', () => {
    renderOrganInfoCard({ selectedOrgan: 'da_day' }, 'vi')

    expect(screen.getByText('Dạ dày')).toBeInTheDocument()
    expect(screen.getByText(/Dạ dày là cơ quan tiêu hóa hình túi/)).toBeInTheDocument()
  })

  it('returns to the overview when the action is pressed', () => {
    renderOrganInfoCard({ selectedOrgan: 'da_day' })

    fireEvent.click(screen.getByRole('button', { name: 'Return to overview' }))

    expect(setSelectedOrgan).toHaveBeenCalledWith(null)
  })

  it('renders nothing without a known selected organ', () => {
    const emptyRender = renderOrganInfoCard()

    expect(emptyRender.container).toBeEmptyDOMElement()
    emptyRender.unmount()

    const unknownRender = renderOrganInfoCard({ selectedOrgan: 'unknown' })

    expect(unknownRender.container).toBeEmptyDOMElement()
  })
})
