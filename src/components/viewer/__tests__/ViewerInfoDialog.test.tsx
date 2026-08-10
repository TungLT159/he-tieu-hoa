import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import type { StarterSettingsContextValue } from '@/app/StarterSettingsContext'
import type { StarterSettings } from '@/app/settingsStorage'
import type { AppLocale } from '@/lib/i18n'

import { ORGAN_LIST } from '../organConfig'
import { ViewerProvider } from '../ViewerContext.tsx'
import { ViewerInfoDialog } from '../ViewerInfoDialog'
import { useViewer } from '../viewerContext'

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

function InfoDialogTrigger() {
  const { setActiveDialog } = useViewer()

  return (
    <button type="button" onClick={() => setActiveDialog('info')}>
      Open info
    </button>
  )
}

function renderInfoDialog(locale: AppLocale = 'vi') {
  return render(
    <StarterSettingsContext.Provider value={createMockSettingsContext({ locale })}>
      <ViewerProvider>
        <InfoDialogTrigger />
        <ViewerInfoDialog />
      </ViewerProvider>
    </StarterSettingsContext.Provider>,
  )
}

describe('ViewerInfoDialog', () => {
  it('opens from active dialog state with dedicated description and learning-friendly organ order', () => {
    renderInfoDialog()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Open info' }))

    expect(screen.getByRole('heading', { name: 'Hệ tiêu hóa ở người' })).toBeInTheDocument()
    expect(
      screen.getByText('Khám phá các cơ quan chính của hệ tiêu hóa theo thứ tự thức ăn di chuyển qua cơ thể.'),
    ).toBeInTheDocument()

    const organHeadings = screen.getAllByRole('heading', { level: 3 })

    expect(organHeadings).toHaveLength(ORGAN_LIST.length)
    expect(organHeadings.map((heading) => heading.textContent)).toEqual([
      'Miệng',
      'Thực quản',
      'Dạ dày',
      'Ruột non',
      'Ruột già',
      'Gan',
      'Túi mật',
      'Tụy',
    ])
    expect(
      screen.getByText(
        'Miệng bắt đầu quá trình tiêu hóa bằng cách nhai thức ăn và trộn với nước bọt trước khi thức ăn đi vào thực quản.',
      ),
    ).toBeInTheDocument()
  })

  it('closes by clearing active dialog state', () => {
    renderInfoDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Open info' }))
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
