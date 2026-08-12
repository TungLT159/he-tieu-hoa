# Menu Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a menu screen with glassmorphism card, navigation buttons, and routing between menu/viewer/guide screens.

**Architecture:** Introduce `react-router-dom` v7 with three routes (`/`, `/viewer`, `/guide`). MenuPage is a centered glass card with background image. Settings opens as a Sheet overlay. GuidePage is a placeholder.

**Tech Stack:** React 19, react-router-dom v7, Tailwind CSS v4, shadcn/ui (Sheet, Button), Phosphor Icons, Vitest

---

### Task 1: Install react-router-dom

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the dependency**

```bash
pnpm add react-router-dom
```

- [ ] **Step 2: Verify installation**

```bash
node -e "require('react-router-dom/package.json').version"
```

Expected: prints version number (should be v7.x)

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat: add react-router-dom"
```

---

### Task 2: Add menu locale keys

**Files:**
- Modify: `src/lib/locales/en.json`
- Modify: `src/lib/locales/vi.json`

- [ ] **Step 1: Add English keys**

In `src/lib/locales/en.json`, add before the last `}`:

```json
  "menu.titleLine1": "3D SOFTWARE",
  "menu.titleLine2": "DIGESTIVE SYSTEM",
  "menu.start": "Start",
  "menu.guide": "Guide",
  "menu.settings": "Settings",
  "menu.guidePlaceholder": "Instruction content will be available soon."
```

- [ ] **Step 2: Add Vietnamese keys**

In `src/lib/locales/vi.json`, add before the last `}`:

```json
  "menu.titleLine1": "PHẦN MỀM 3D",
  "menu.titleLine2": "HỆ TIÊU HÓA",
  "menu.start": "Bắt đầu",
  "menu.guide": "Hướng dẫn",
  "menu.settings": "Cài đặt",
  "menu.guidePlaceholder": "Nội dung hướng dẫn sẽ được cập nhật sau."
```

- [ ] **Step 3: Validate locale JSON**

```bash
pnpm l10n:validate
```

Expected: "Locales are in sync" or PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/locales/en.json src/lib/locales/vi.json
git commit -m "feat: add menu locale keys"
```

---

### Task 3: Create GuidePage (placeholder)

**Files:**
- Create: `src/pages/GuidePage.tsx`
- Create: `src/pages/__tests__/GuidePage.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/pages/__tests__/GuidePage.test.tsx
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderStarter } from '@/test/starterRender'
import { GuidePage } from '../GuidePage'

describe('GuidePage', () => {
  it('renders a placeholder title', () => {
    renderStarter(<GuidePage />)

    expect(screen.getByRole('heading')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/pages/__tests__/GuidePage.test.tsx
```

Expected: FAIL (module not found)

- [ ] **Step 3: Write GuidePage**

```tsx
// src/pages/GuidePage.tsx
import { useStarterSettings } from '@/app/StarterSettingsContext'
import { createTranslator } from '@/lib/i18n'

export function GuidePage() {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)

  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-foreground text-xl font-semibold">
        {t('menu.guidePlaceholder')}
      </h1>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/pages/__tests__/GuidePage.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/GuidePage.tsx src/pages/__tests__/GuidePage.test.tsx
git commit -m "feat: add GuidePage placeholder"
```

---

### Task 4: Create MenuPage

**Files:**
- Create: `src/pages/MenuPage.tsx`
- Create: `src/pages/__tests__/MenuPage.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/pages/__tests__/MenuPage.test.tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderStarter } from '@/test/starterRender'
import { MenuPage } from '../MenuPage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('MenuPage', () => {
  it('renders the title and three buttons', () => {
    renderStarter(<MenuPage />)

    expect(screen.getByRole('heading')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start|bắt đầu/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /guide|hướng dẫn/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /settings|cài đặt/i })).toBeInTheDocument()
  })

  it('renders the background image', () => {
    renderStarter(<MenuPage />)

    const bg = document.querySelector('[data-testid="menu-background"]')
    expect(bg).toBeInTheDocument()
  })

  it('navigates to /viewer when start button is clicked', async () => {
    const user = userEvent.setup()
    renderStarter(<MenuPage />)

    await user.click(screen.getByRole('button', { name: /start|bắt đầu/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/viewer')
  })

  it('navigates to /guide when guide button is clicked', async () => {
    const user = userEvent.setup()
    renderStarter(<MenuPage />)

    await user.click(screen.getByRole('button', { name: /guide|hướng dẫn/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/guide')
  })

  it('opens settings sheet when settings button is clicked', async () => {
    const user = userEvent.setup()
    renderStarter(<MenuPage />)

    await user.click(screen.getByRole('button', { name: /settings|cài đặt/i }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/pages/__tests__/MenuPage.test.tsx
```

Expected: FAIL (module not found)

- [ ] **Step 3: Write MenuPage**

```tsx
// src/pages/MenuPage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, BookOpen, Gear } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useStarterSettings } from '@/app/StarterSettingsContext'
import { createTranslator } from '@/lib/i18n'

export function MenuPage() {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const navigate = useNavigate()
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div
        data-testid="menu-background"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/bg_menu_phanmem3d-1.png")' }}
      />
      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10 rounded-[20px] border border-white/10 bg-white/[0.06] px-11 py-9 text-center shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-[16px]">
        <h1 className="text-xl leading-relaxed font-bold text-white select-none">
          {t('menu.titleLine1')}
          <br />
          {t('menu.titleLine2')}
        </h1>

        <div className="mt-7 flex flex-col items-center gap-2.5">
          <Button
            className="w-[210px] rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(124,58,237,0.35)] hover:from-[#6d28d9] hover:to-[#4c1d95]"
            onClick={() => navigate('/viewer')}
          >
            <Play className="size-[18px]" weight="fill" />
            {t('menu.start')}
          </Button>

          <Button
            variant="outline"
            className="w-[210px] rounded-xl border-white/10 bg-white/[0.06] py-2.5 text-sm font-medium text-[#d0d0d0] hover:bg-white/10 hover:text-white"
            onClick={() => navigate('/guide')}
          >
            <BookOpen className="size-4" />
            {t('menu.guide')}
          </Button>

          <Button
            variant="outline"
            className="w-[210px] rounded-xl border-white/10 bg-white/[0.06] py-2.5 text-sm font-medium text-[#d0d0d0] hover:bg-white/10 hover:text-white"
            onClick={() => setSettingsOpen(true)}
          >
            <Gear className="size-4" />
            {t('menu.settings')}
          </Button>
        </div>
      </div>

      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent closeLabel={t('common.close')}>
          <SheetHeader>
            <SheetTitle>{t('settings.title')}</SheetTitle>
            <SheetDescription>{t('settings.subtitle')}</SheetDescription>
          </SheetHeader>
          <div className="text-muted-foreground text-sm">
            {t('menu.guidePlaceholder')}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/pages/__tests__/MenuPage.test.tsx
```

Expected: PASS (all 5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/pages/MenuPage.tsx src/pages/__tests__/MenuPage.test.tsx
git commit -m "feat: add MenuPage with glassmorphism card and navigation"
```

---

### Task 5: Update App.tsx with Router

**Files:**
- Modify: `src/main.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/app/App.test.tsx`

- [ ] **Step 1: Update main.tsx to wrap with BrowserRouter**

Replace the render block in `src/main.tsx` (lines 50-57):

```tsx
// Add this import at top:
import { BrowserRouter } from 'react-router-dom'

// Replace the render block (lines 50-57) with:
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TooltipProvider>
        <LinuxTitlebar />
        <StarterApp />
        <FrontendReadyMarker />
      </TooltipProvider>
    </BrowserRouter>
  </StrictMode>,
)
```

- [ ] **Step 2: Update App.tsx to use Routes**

Replace `src/app/App.tsx`:

```tsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { MenuPage } from '@/pages/MenuPage'
import { GuidePage } from '@/pages/GuidePage'
import { ViewerV2Page } from '@/components/viewer-v2/ViewerV2Page'
import { applyThemeSelectionToDocument, resolveThemeMode } from '@/lib/themeMode'
import { resolveEffectiveLocale } from '@/lib/i18n'
import { readNativeAppVersion, readNativeStarterSettings, saveNativeStarterSettings } from './nativeSettings'
import { StarterSettingsContext } from './StarterSettingsContext'
import { readStarterSettings, writeStarterSettings, type StarterSettings } from './settingsStorage'

export function StarterApp() {
  const [settings, setSettings] = useState(() => readStarterSettings())
  const [appVersion, setAppVersion] = useState<string | null>(null)
  const resolvedThemeMode = resolveThemeMode(settings.themeMode)
  const locale = resolveEffectiveLocale(settings.uiLanguage)

  const updateSettings = useCallback((patch: Partial<StarterSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch }
      writeStarterSettings(window.localStorage, next)
      void saveNativeStarterSettings(next)
      return next
    })
  }, [])

  useEffect(() => {
    let cancelled = false

    async function hydrateNativeState() {
      const [nativeSettings, nativeVersion] = await Promise.all([
        readNativeStarterSettings(),
        readNativeAppVersion(),
      ])

      if (cancelled) return
      if (nativeVersion) setAppVersion(nativeVersion)
      if (!nativeSettings) return

      setSettings((current) => {
        const next = { ...current, ...nativeSettings }
        writeStarterSettings(window.localStorage, next)
        return next
      })
    }

    void hydrateNativeState()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    applyThemeSelectionToDocument(document, settings.themeMode)
  }, [settings.themeMode])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const contextValue = useMemo(() => ({
    appVersion,
    locale,
    resolvedThemeMode,
    settings,
    updateSettings,
  }), [appVersion, locale, resolvedThemeMode, settings, updateSettings])

  return (
    <StarterSettingsContext.Provider value={contextValue}>
      <Routes>
        <Route path="/" element={<MenuPage />} />
        <Route path="/viewer" element={<ViewerV2Page />} />
        <Route path="/guide" element={<GuidePage />} />
      </Routes>
    </StarterSettingsContext.Provider>
  )
}

export default StarterApp
```

- [ ] **Step 3: Update App.test.tsx to test routing**

Replace `src/app/App.test.tsx`:

```tsx
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
```

- [ ] **Step 4: Run all tests**

```bash
pnpm test
```

Expected: PASS (no failures)

- [ ] **Step 5: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/main.tsx src/app/App.tsx src/app/App.test.tsx
git commit -m "feat: add routing with MenuPage as default entry point"
```

---

### Task 6: Final verification

- [ ] **Step 1: Run lint**

```bash
pnpm lint
```

Expected: PASS (no warnings)

- [ ] **Step 2: Run full test suite**

```bash
pnpm test
```

Expected: all tests pass

- [ ] **Step 3: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Run build**

```bash
pnpm build
```

Expected: successful build

- [ ] **Step 5: Run l10n validation**

```bash
pnpm l10n:validate
```

Expected: "Locales are in sync"

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: final verification pass"
```
