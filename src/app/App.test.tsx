import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { renderStarter } from '@/test/starterRender'
import { StarterApp } from './App'

vi.mock('@/components/viewer-v2/ViewerV2Page', () => ({
  ViewerV2Page: () => <div data-testid="viewer-v2-page">Viewer v2</div>,
}))

vi.mock('@/pages/MenuPage', () => ({
  MenuPage: () => <div data-testid="menu-page">Menu</div>,
}))

vi.mock('@/pages/GuidePage', () => ({
  GuidePage: () => <div data-testid="guide-page">Guide</div>,
}))

vi.mock('./nativeSettings', () => ({
  readNativeAppVersion: vi.fn(async () => null),
  readNativeStarterSettings: vi.fn(async () => null),
  saveNativeStarterSettings: vi.fn(async () => undefined),
}))

function renderAppWithRoute(initialRoute = '/') {
  return renderStarter(
    <MemoryRouter initialEntries={[initialRoute]}>
      <StarterApp />
    </MemoryRouter>,
  )
}

afterEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('StarterApp routing', () => {
  it('renders the menu page at /', () => {
    renderAppWithRoute('/')

    expect(screen.getByTestId('menu-page')).toHaveTextContent('Menu')
  })

  it('renders the viewer page at /viewer', () => {
    renderAppWithRoute('/viewer')

    expect(screen.getByTestId('viewer-v2-page')).toHaveTextContent('Viewer v2')
  })

  it('renders the guide page at /guide', () => {
    renderAppWithRoute('/guide')

    expect(screen.getByTestId('guide-page')).toHaveTextContent('Guide')
  })
})
