import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { renderStarter } from '@/test/starterRender'
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { InfoPanel } from '../InfoPanel'

function renderInfoPanel(onClose = vi.fn(), locale: 'en' | 'vi' = 'en') {
  return renderStarter(
    <StarterSettingsContext.Provider
      value={{
        appVersion: '0.1.0',
        locale,
        resolvedThemeMode: 'light',
        settings: DEFAULT_STARTER_SETTINGS,
        updateSettings: vi.fn(),
      }}
    >
      <InfoPanel onClose={onClose} />
    </StarterSettingsContext.Provider>,
  )
}

describe('InfoPanel', () => {
  it('renders detailed English digestive system content', () => {
    renderInfoPanel()

    expect(screen.getByRole('dialog', { name: 'Human Digestive System' })).toBeInTheDocument()
    expect(screen.getByText(/Digestion begins in the mouth/i)).toBeInTheDocument()
    expect(screen.getByText(/The stomach churns food/i)).toBeInTheDocument()
    expect(screen.getByText(/The small intestine absorbs/i)).toBeInTheDocument()
  })

  it('renders detailed Vietnamese digestive system content', () => {
    renderInfoPanel(vi.fn(), 'vi')

    expect(screen.getByRole('dialog', { name: 'Hệ tiêu hóa ở người' })).toBeInTheDocument()
    expect(screen.getByText(/Quá trình tiêu hóa bắt đầu ở miệng/i)).toBeInTheDocument()
    expect(screen.getByText(/Dạ dày nhào trộn thức ăn/i)).toBeInTheDocument()
    expect(screen.getByText(/Ruột non hấp thụ/i)).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    renderInfoPanel(onClose)

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalled()
  })
})
