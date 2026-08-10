# Viewer Side Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the multi-route starter app shell with a single-page 3D viewer featuring a collapsible left-side vertical menu with 15+ function buttons grouped in 4 categories.

**Architecture:** Extend `ViewerContext` with menu state. Build `ViewerMenu` as a left-panel with toggle, containing `ViewerMenuGroup` components. Panels (Settings, Chatbot) use shadcn `Sheet`, dialogs (Info, Quiz, GenAI) use shadcn `Dialog`. Simplify `App.tsx` to single-route viewer.

**Tech Stack:** React 19, TypeScript, shadcn/ui (Sheet, Dialog, Popover, Tooltip, Button), @phosphor-icons/react, @react-three/fiber, @tauri-apps/api, Tailwind CSS

---

### Task 1: Extend ViewerContext with menu state

**Files:**
- Modify: `src/components/viewer/viewerContext.ts`
- Modify: `src/components/viewer/ViewerContext.tsx`

- [ ] **Step 1: Write failing test for new context state**

Create `src/components/viewer/__tests__/ViewerMenuContext.test.tsx`:

```tsx
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ViewerProvider } from '../ViewerContext'
import { useViewer } from '../viewerContext'

describe('ViewerContext menu state', () => {
  it('defaults isMenuOpen to true', () => {
    const { result } = renderHook(() => useViewer(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <ViewerProvider>{children}</ViewerProvider>
      ),
    })
    expect(result.current.isMenuOpen).toBe(true)
  })

  it('toggles isMenuOpen', () => {
    const { result } = renderHook(() => useViewer(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <ViewerProvider>{children}</ViewerProvider>
      ),
    })
    act(() => result.current.setIsMenuOpen(false))
    expect(result.current.isMenuOpen).toBe(false)
  })

  it('defaults activeSheet to null', () => {
    const { result } = renderHook(() => useViewer(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <ViewerProvider>{children}</ViewerProvider>
      ),
    })
    expect(result.current.activeSheet).toBeNull()
  })

  it('sets and clears activeSheet', () => {
    const { result } = renderHook(() => useViewer(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <ViewerProvider>{children}</ViewerProvider>
      ),
    })
    act(() => result.current.setActiveSheet('settings'))
    expect(result.current.activeSheet).toBe('settings')
    act(() => result.current.setActiveSheet(null))
    expect(result.current.activeSheet).toBeNull()
  })

  it('defaults activeDialog to null', () => {
    const { result } = renderHook(() => useViewer(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <ViewerProvider>{children}</ViewerProvider>
      ),
    })
    expect(result.current.activeDialog).toBeNull()
  })

  it('sets and clears activeDialog', () => {
    const { result } = renderHook(() => useViewer(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <ViewerProvider>{children}</ViewerProvider>
      ),
    })
    act(() => result.current.setActiveDialog('info'))
    expect(result.current.activeDialog).toBe('info')
    act(() => result.current.setActiveDialog(null))
    expect(result.current.activeDialog).toBeNull()
  })

  it('defaults isFullscreen to false', () => {
    const { result } = renderHook(() => useViewer(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <ViewerProvider>{children}</ViewerProvider>
      ),
    })
    expect(result.current.isFullscreen).toBe(false)
  })

  it('defaults isDrawing to false', () => {
    const { result } = renderHook(() => useViewer(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <ViewerProvider>{children}</ViewerProvider>
      ),
    })
    expect(result.current.isDrawing).toBe(false)
  })

  it('defaults drawColor to #ff0000', () => {
    const { result } = renderHook(() => useViewer(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <ViewerProvider>{children}</ViewerProvider>
      ),
    })
    expect(result.current.drawColor).toBe('#ff0000')
  })

  it('defaults backgroundColor to #1a1a2e', () => {
    const { result } = renderHook(() => useViewer(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <ViewerProvider>{children}</ViewerProvider>
      ),
    })
    expect(result.current.backgroundColor).toBe('#1a1a2e')
  })

  it('defaults modelColor to null', () => {
    const { result } = renderHook(() => useViewer(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <ViewerProvider>{children}</ViewerProvider>
      ),
    })
    expect(result.current.modelColor).toBeNull()
  })

  it('defaults isSpinning to false', () => {
    const { result } = renderHook(() => useViewer(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <ViewerProvider>{children}</ViewerProvider>
      ),
    })
    expect(result.current.isSpinning).toBe(false)
  })

  it('defaults flyCameraActive to false', () => {
    const { result } = renderHook(() => useViewer(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <ViewerProvider>{children}</ViewerProvider>
      ),
    })
    expect(result.current.flyCameraActive).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/viewer/__tests__/ViewerMenuContext.test.tsx`
Expected: FAIL - properties not found on ViewerContextValue

- [ ] **Step 3: Add new state types and values to viewerContext.ts**

Edit `src/components/viewer/viewerContext.ts`:

```typescript
export type ActiveSheet = 'chatbot' | 'settings' | null
export type ActiveDialog = 'info' | 'quiz' | 'genai' | null

export interface ViewerContextValue {
  // ... existing fields remain ...

  // Menu
  isMenuOpen: boolean
  setIsMenuOpen: (open: boolean) => void

  // Panels
  activeSheet: ActiveSheet
  setActiveSheet: (sheet: ActiveSheet) => void
  activeDialog: ActiveDialog
  setActiveDialog: (dialog: ActiveDialog) => void

  // System
  isFullscreen: boolean
  setIsFullscreen: (fullscreen: boolean) => void

  // Drawing
  isDrawing: boolean
  setIsDrawing: (drawing: boolean) => void
  drawColor: string
  setDrawColor: (color: string) => void

  // Colors
  backgroundColor: string
  setBackgroundColor: (color: string) => void
  modelColor: string | null
  setModelColor: (color: string | null) => void

  // Auto rotate
  isSpinning: boolean
  setIsSpinning: (spinning: boolean) => void

  // Fly camera
  flyCameraActive: boolean
  setFlyCameraActive: (active: boolean) => void
}
```

- [ ] **Step 4: Implement state in ViewerContext.tsx**

Edit `src/components/viewer/ViewerContext.tsx` to add the new `useState` hooks and pass them into the context value. Add these states alongside the existing ones:

```typescript
const [isMenuOpen, setIsMenuOpen] = useState(true)
const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null)
const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null)
const [isFullscreen, setIsFullscreen] = useState(false)
const [isDrawing, setIsDrawing] = useState(false)
const [drawColor, setDrawColor] = useState('#ff0000')
const [backgroundColor, setBackgroundColor] = useState('#1a1a2e')
const [modelColor, setModelColor] = useState<string | null>(null)
const [isSpinning, setIsSpinning] = useState(false)
const [flyCameraActive, setFlyCameraActive] = useState(false)
```

Update the context value to include all new state properties.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/viewer/__tests__/ViewerMenuContext.test.tsx`
Expected: PASS - all 12 tests

- [ ] **Step 6: Commit**

```bash
git add src/components/viewer/viewerContext.ts src/components/viewer/ViewerContext.tsx src/components/viewer/__tests__/ViewerMenuContext.test.tsx
git commit -m "feat: extend ViewerContext with menu, panel, drawing, color and system state"
```

---

### Task 2: Add locale keys for menu

**Files:**
- Modify: `src/lib/locales/vi.json`
- Modify: `src/lib/locales/en.json`

- [ ] **Step 1: Write validation test**

Run existing locale validation first to see baseline:
Run: `pnpm l10n:validate`

- [ ] **Step 2: Add locale keys to vi.json**

Insert after existing `viewer.*` keys:

```json
"viewer.menu.collapse": "Thu gọn",
"viewer.menu.expand": "Mở rộng",
"viewer.menu.group.modelInteraction": "Tương tác mô hình",
"viewer.menu.group.learning": "Học tập",
"viewer.menu.group.tools": "Công cụ",
"viewer.menu.group.system": "Hệ thống",
"viewer.menu.rotateModel": "Xoay mô hình",
"viewer.menu.modelColor": "Đổi màu mô hình",
"viewer.menu.backgroundColor": "Đổi màu nền",
"viewer.menu.flyCamera": "Fly camera",
"viewer.menu.quiz": "Câu hỏi trắc nghiệm",
"viewer.menu.info": "Thông tin",
"viewer.menu.video": "Video học liệu",
"viewer.menu.genai": "Gen AI mô tả",
"viewer.menu.chatbot": "Chatbot AI",
"viewer.menu.annotation": "Vẽ chú thích",
"viewer.menu.screenshot": "Chụp màn hình",
"viewer.menu.editor": "Bộ soạn thảo",
"viewer.menu.settings": "Cài đặt",
"viewer.menu.fullscreen": "Toàn màn hình",
"viewer.menu.exitFullscreen": "Thoát toàn màn hình",
"viewer.menu.home": "Màn hình chính",
"viewer.annotation.pen": "Bút vẽ",
"viewer.annotation.eraser": "Tẩy",
"viewer.annotation.clearAll": "Xóa tất cả",
"viewer.annotation.exit": "Thoát vẽ",
"viewer.settings.title": "Cài đặt",
"viewer.settings.resolution": "Độ phân giải",
"viewer.settings.lighting": "Ánh sáng",
"viewer.settings.shadows": "Đổ bóng",
"viewer.settings.volume": "Âm lượng",
"viewer.settings.voice": "Giọng",
"viewer.settings.voice.bac": "Bắc",
"viewer.settings.voice.trung": "Trung",
"viewer.settings.voice.nam": "Nam",
"viewer.settings.resetColors": "Khôi phục màu mặc định",
"viewer.info.title": "Hệ tiêu hóa ở người",
"viewer.chatbot.title": "Chatbot AI",
"viewer.chatbot.placeholder": "Nhập câu hỏi của bạn...",
"viewer.quiz.title": "Câu hỏi trắc nghiệm",
"viewer.genai.title": "Mô tả hệ tiêu hóa",
"viewer.colorPicker.modelTitle": "Màu mô hình",
"viewer.colorPicker.backgroundTitle": "Màu nền",
"viewer.colorPicker.reset": "Mặc định",
"viewer.flyCamera.stopping": "Đang dừng fly camera..."
```

- [ ] **Step 3: Add matching locale keys to en.json**

```json
"viewer.menu.collapse": "Collapse",
"viewer.menu.expand": "Expand",
"viewer.menu.group.modelInteraction": "Model Interaction",
"viewer.menu.group.learning": "Learning",
"viewer.menu.group.tools": "Tools",
"viewer.menu.group.system": "System",
"viewer.menu.rotateModel": "Rotate Model",
"viewer.menu.modelColor": "Model Color",
"viewer.menu.backgroundColor": "Background Color",
"viewer.menu.flyCamera": "Fly Camera",
"viewer.menu.quiz": "Quiz",
"viewer.menu.info": "Information",
"viewer.menu.video": "Learning Video",
"viewer.menu.genai": "Gen AI Description",
"viewer.menu.chatbot": "Chatbot AI",
"viewer.menu.annotation": "Annotation",
"viewer.menu.screenshot": "Screenshot",
"viewer.menu.editor": "Editor",
"viewer.menu.settings": "Settings",
"viewer.menu.fullscreen": "Fullscreen",
"viewer.menu.exitFullscreen": "Exit Fullscreen",
"viewer.menu.home": "Home",
"viewer.annotation.pen": "Pen",
"viewer.annotation.eraser": "Eraser",
"viewer.annotation.clearAll": "Clear All",
"viewer.annotation.exit": "Exit Drawing",
"viewer.settings.title": "Settings",
"viewer.settings.resolution": "Resolution",
"viewer.settings.lighting": "Lighting",
"viewer.settings.shadows": "Shadows",
"viewer.settings.volume": "Volume",
"viewer.settings.voice": "Voice",
"viewer.settings.voice.bac": "Northern",
"viewer.settings.voice.trung": "Central",
"viewer.settings.voice.nam": "Southern",
"viewer.settings.resetColors": "Reset Default Colors",
"viewer.info.title": "Human Digestive System",
"viewer.chatbot.title": "AI Chatbot",
"viewer.chatbot.placeholder": "Type your question...",
"viewer.quiz.title": "Quiz",
"viewer.genai.title": "Digestive System Description",
"viewer.colorPicker.modelTitle": "Model Color",
"viewer.colorPicker.backgroundTitle": "Background Color",
"viewer.colorPicker.reset": "Default",
"viewer.flyCamera.stopping": "Stopping fly camera..."
```

- [ ] **Step 4: Run l10n validation**

Run: `pnpm l10n:validate`
Expected: PASS, no missing/extra keys

- [ ] **Step 5: Commit**

```bash
git add src/lib/locales/vi.json src/lib/locales/en.json
git commit -m "feat: add viewer menu and panel locale keys"
```

---

### Task 3: Simplify App.tsx to single-route viewer

**Files:**
- Modify: `src/app/App.tsx`
- Modify: `src/app/App.test.tsx`
- Remove test: `src/appShellLayout.test.ts` (references AppShell which we remove)

- [ ] **Step 1: Update App.test.tsx**

Read existing `src/app/App.test.tsx` to understand current test patterns, then rewrite:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import StarterApp from './App'

vi.mock('@/components/viewer/ViewerPage', () => ({
  ViewerPage: () => <div data-testid="viewer-page">Viewer</div>,
}))

describe('StarterApp', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.style.removeProperty('data-theme')
    document.documentElement.classList.remove('dark')
  })

  it('renders the viewer page as the default route', () => {
    render(<StarterApp />)
    expect(screen.getByTestId('viewer-page')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/App.test.tsx`
Expected: FAIL - old tests may still reference router

- [ ] **Step 3: Rewrite App.tsx**

Replace `src/app/App.tsx` content:

```tsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ViewerPage } from '@/components/viewer/ViewerPage'
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
      <ViewerPage />
    </StarterSettingsContext.Provider>
  )
}

export default StarterApp
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/App.test.tsx`
Expected: PASS

- [ ] **Step 5: Delete shell layout test**

Delete `src/appShellLayout.test.ts` since it tests components we are removing.

- [ ] **Step 6: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add src/app/App.tsx src/app/App.test.tsx
git rm src/appShellLayout.test.ts
git commit -m "refactor: simplify App.tsx to single-route viewer, remove router"
```

---

### Task 4: Create ViewerMenuGroup component

**Files:**
- Create: `src/components/viewer/ViewerMenuGroup.tsx`

- [ ] **Step 1: Write test for ViewerMenuGroup**

Create `src/components/viewer/__tests__/ViewerMenuGroup.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ArrowsClockwise, Question } from '@phosphor-icons/react'
import { ViewerMenuGroup, type MenuButtonDef } from '../ViewerMenuGroup'

const sampleButtons: MenuButtonDef[] = [
  { id: 'rotate', label: 'Rotate Model', icon: ArrowsClockwise, onClick: vi.fn() },
  { id: 'quiz', label: 'Quiz', icon: Question, onClick: vi.fn() },
]

describe('ViewerMenuGroup', () => {
  it('renders group title', () => {
    render(<ViewerMenuGroup title="Model Interaction" buttons={sampleButtons} />)
    expect(screen.getByText('Model Interaction')).toBeInTheDocument()
  })

  it('renders all button labels', () => {
    render(<ViewerMenuGroup title="Test" buttons={sampleButtons} />)
    expect(screen.getByText('Rotate Model')).toBeInTheDocument()
    expect(screen.getByText('Quiz')).toBeInTheDocument()
  })

  it('calls onClick when button is clicked', async () => {
    const user = userEvent.setup()
    render(<ViewerMenuGroup title="Test" buttons={sampleButtons} />)
    await user.click(screen.getByText('Rotate Model'))
    expect(sampleButtons[0].onClick).toHaveBeenCalledTimes(1)
  })

  it('visually hides labels when collapsed', () => {
    render(<ViewerMenuGroup title="Test" buttons={sampleButtons} collapsed />)
    const label = screen.getByText('Rotate Model')
    expect(label.className).toContain('sr-only')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/viewer/__tests__/ViewerMenuGroup.test.tsx`
Expected: FAIL - module not found

- [ ] **Step 3: Implement ViewerMenuGroup**

Create `src/components/viewer/ViewerMenuGroup.tsx`:

```tsx
import type { Icon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface MenuButtonDef {
  id: string
  label: string
  icon: Icon
  onClick: () => void
  active?: boolean
  disabled?: boolean
  children?: ReactNode
}

interface ViewerMenuGroupProps {
  title: string
  buttons: MenuButtonDef[]
  collapsed?: boolean
}

export function ViewerMenuGroup({ title, buttons, collapsed }: ViewerMenuGroupProps) {
  return (
    <div className="space-y-1 px-2">
      <p className={cn('px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground', collapsed && 'sr-only')}>
        {title}
      </p>
      <div className="space-y-0.5">
        {buttons.map((btn) => (
          <Tooltip key={btn.id} delayDuration={300}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant={btn.active ? 'secondary' : 'ghost'}
                size={collapsed ? 'icon' : 'default'}
                className={cn('w-full justify-start gap-2', collapsed && 'h-9 w-9')}
                disabled={btn.disabled}
                onClick={btn.onClick}
                aria-pressed={btn.active}
              >
                <btn.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className={cn('truncate', collapsed && 'sr-only')}>
                  {btn.label}
                </span>
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="z-50">
                <p>{btn.label}</p>
              </TooltipContent>
            )}
          </Tooltip>
          {btn.children}
        ))}
      </div>
      <Separator className="my-1" />
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/viewer/__tests__/ViewerMenuGroup.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/viewer/ViewerMenuGroup.tsx src/components/viewer/__tests__/ViewerMenuGroup.test.tsx
git commit -m "feat: add ViewerMenuGroup component with collapse support"
```

---

### Task 5: Create ViewerMenu component

**Files:**
- Create: `src/components/viewer/ViewerMenu.tsx`

- [ ] **Step 1: Write test for ViewerMenu**

Create `src/components/viewer/__tests__/ViewerMenu.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { ViewerMenu } from '../ViewerMenu'
import { ViewerProvider } from '../ViewerContext'
import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import type { StarterSettingsContextValue } from '@/app/StarterSettingsContext'
import type { AppLocale } from '@/lib/i18n'
import type { StarterSettings } from '@/app/settingsStorage'

function createMockSettingsContext(overrides: Partial<StarterSettingsContextValue> = {}): StarterSettingsContextValue {
  return {
    locale: 'vi' as AppLocale,
    appVersion: '1.0.0',
    resolvedThemeMode: 'dark',
    settings: { themeMode: 'dark', uiLanguage: 'vi', displayName: 'Test', notificationsEnabled: false } as StarterSettings,
    updateSettings: () => {},
    ...overrides,
  }
}

function renderMenu(locale: AppLocale = 'vi') {
  return render(
    <StarterSettingsContext.Provider value={createMockSettingsContext({ locale })}>
      <ViewerProvider>
        <ViewerMenu />
      </ViewerProvider>
    </StarterSettingsContext.Provider>,
  )
}

describe('ViewerMenu', () => {
  it('renders menu with all four groups when open', () => {
    renderMenu()
    expect(screen.getByText('Tương tác mô hình')).toBeInTheDocument()
    expect(screen.getByText('Học tập')).toBeInTheDocument()
    expect(screen.getByText('Công cụ')).toBeInTheDocument()
    expect(screen.getByText('Hệ thống')).toBeInTheDocument()
  })

  it('renders 15+ buttons', () => {
    renderMenu()
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(15)
  })

  it('toggles menu open/close', async () => {
    const user = userEvent.setup()
    renderMenu()
    const toggleButton = screen.getByLabelText('Thu gọn')
    await user.click(toggleButton)
    expect(screen.queryByText('Tương tác mô hình')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/viewer/__tests__/ViewerMenu.test.tsx`
Expected: FAIL - module not found

- [ ] **Step 3: Implement ViewerMenu**

Create `src/components/viewer/ViewerMenu.tsx`:

```tsx
import {
  ArrowsClockwise,
  ArrowsIn,
  ArrowsOut,
  Article,
  Camera,
  CaretLeft,
  CaretRight,
  ChatsCircle,
  GearSix,
  House,
  Image,
  Info,
  PaintBucket,
  PencilSimple,
  Play,
  Question,
  Sparkle,
  VideoCamera,
} from '@phosphor-icons/react'
import { useCallback } from 'react'
import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { createTranslator } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useViewer } from './viewerContext'
import { ViewerMenuGroup, type MenuButtonDef } from './ViewerMenuGroup'

export function ViewerMenu() {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const {
    isMenuOpen,
    setIsMenuOpen,
    isSpinning,
    setIsSpinning,
    isFullscreen,
    isDrawing,
    isFlyCameraActive,
    activeSheet,
    setActiveSheet,
    setActiveDialog,
    setIsDrawing,
  } = useViewer()

  const toggleSheet = useCallback(
    (sheet: 'chatbot' | 'settings') => {
      setActiveSheet(activeSheet === sheet ? null : sheet)
    },
    [activeSheet, setActiveSheet],
  )

  const modelInteractionButtons: MenuButtonDef[] = [
    { id: 'rotate', label: t('viewer.menu.rotateModel'), icon: ArrowsClockwise, onClick: () => setIsSpinning(!isSpinning), active: isSpinning, disabled: isFlyCameraActive },
    { id: 'modelColor', label: t('viewer.menu.modelColor'), icon: PaintBucket, onClick: () => {}, disabled: isFlyCameraActive },
    { id: 'bgColor', label: t('viewer.menu.backgroundColor'), icon: Image, onClick: () => {}, disabled: isFlyCameraActive },
    { id: 'flyCamera', label: t('viewer.menu.flyCamera'), icon: VideoCamera, onClick: () => setFlyCameraActive(!flyCameraActive), active: isFlyCameraActive, disabled: isSpinning },
  ]

  const learningButtons: MenuButtonDef[] = [
    { id: 'quiz', label: t('viewer.menu.quiz'), icon: Question, onClick: () => setActiveDialog('quiz') },
    { id: 'info', label: t('viewer.menu.info'), icon: Info, onClick: () => setActiveDialog('info') },
    { id: 'video', label: t('viewer.menu.video'), icon: Play, onClick: () => {} },
    { id: 'genai', label: t('viewer.menu.genai'), icon: Sparkle, onClick: () => setActiveDialog('genai') },
  ]

  const toolsButtons: MenuButtonDef[] = [
    { id: 'chatbot', label: t('viewer.menu.chatbot'), icon: ChatsCircle, onClick: () => toggleSheet('chatbot'), active: activeSheet === 'chatbot' },
    { id: 'annotation', label: t('viewer.menu.annotation'), icon: PencilSimple, onClick: () => setIsDrawing(!isDrawing), active: isDrawing },
    { id: 'screenshot', label: t('viewer.menu.screenshot'), icon: Camera, onClick: () => {} },
    { id: 'editor', label: t('viewer.menu.editor'), icon: Article, onClick: () => {} },
  ]

  const systemButtons: MenuButtonDef[] = [
    { id: 'settings', label: t('viewer.menu.settings'), icon: GearSix, onClick: () => toggleSheet('settings'), active: activeSheet === 'settings' },
    { id: 'fullscreen', label: isFullscreen ? t('viewer.menu.exitFullscreen') : t('viewer.menu.fullscreen'), icon: isFullscreen ? ArrowsIn : ArrowsOut, onClick: () => {} },
    { id: 'home', label: t('viewer.menu.home'), icon: House, onClick: () => {} },
  ]

  return (
    <div className={cn('flex h-full flex-col border-r bg-background transition-all duration-200', isMenuOpen ? 'w-[280px]' : 'w-[52px]')}>
      <div className={cn('flex items-center border-b p-2', !isMenuOpen && 'justify-center')}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={isMenuOpen ? t('viewer.menu.collapse') : t('viewer.menu.expand')}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <CaretLeft aria-hidden="true" /> : <CaretRight aria-hidden="true" />}
        </Button>
        {isMenuOpen && <span className="ml-2 text-sm font-medium truncate">{t('app.name')}</span>}
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        <ViewerMenuGroup title={t('viewer.menu.group.modelInteraction')} buttons={modelInteractionButtons} collapsed={!isMenuOpen} />
        <ViewerMenuGroup title={t('viewer.menu.group.learning')} buttons={learningButtons} collapsed={!isMenuOpen} />
        <ViewerMenuGroup title={t('viewer.menu.group.tools')} buttons={toolsButtons} collapsed={!isMenuOpen} />
        <ViewerMenuGroup title={t('viewer.menu.group.system')} buttons={systemButtons} collapsed={!isMenuOpen} />
      </div>
    </div>
  )
}
```

Note: The modelColor, bgColor, video, screenshot, editor, fullscreen, and home handlers will be implemented in later tasks. Keep those placeholder buttons disabled in Task 5 so the UI does not expose non-working controls. Later implementation tasks must explicitly re-enable the controls they implement.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/viewer/__tests__/ViewerMenu.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/viewer/ViewerMenu.tsx src/components/viewer/__tests__/ViewerMenu.test.tsx
git commit -m "feat: add ViewerMenu with 4 groups and toggle collapse"
```

---

### Task 6: Update ViewerPage to integrate menu

**Files:**
- Modify: `src/components/viewer/ViewerPage.tsx`

- [ ] **Step 1: Write test for updated ViewerPage**

Update `src/components/viewer/__tests__/ViewerPage.test.tsx` (create if not exists):

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ViewerPage } from '../ViewerPage'
import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import type { StarterSettingsContextValue } from '@/app/StarterSettingsContext'
import type { AppLocale } from '@/lib/i18n'
import type { StarterSettings } from '@/app/settingsStorage'

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="canvas">{children}</div>,
}))
vi.mock('@react-three/drei', () => ({
  Loader: () => null,
  OrbitControls: () => null,
}))
vi.mock('../DigestiveModel', () => ({
  DigestiveModel: () => null,
}))

function createMockSettingsContext(overrides: Partial<StarterSettingsContextValue> = {}): StarterSettingsContextValue {
  return {
    locale: 'vi' as AppLocale,
    appVersion: '1.0.0',
    resolvedThemeMode: 'dark',
    settings: { themeMode: 'dark', uiLanguage: 'vi', displayName: 'Test', notificationsEnabled: false } as StarterSettings,
    updateSettings: () => {},
    ...overrides,
  }
}

function renderPage() {
  return render(
    <StarterSettingsContext.Provider value={createMockSettingsContext()}>
      <ViewerPage />
    </StarterSettingsContext.Provider>,
  )
}

describe('ViewerPage', () => {
  it('renders the side menu', () => {
    renderPage()
    expect(screen.getByLabelText('Thu gọn')).toBeInTheDocument()
  })

  it('renders the 3D canvas', () => {
    renderPage()
    expect(screen.getByTestId('canvas')).toBeInTheDocument()
  })

  it('has horizontal flex layout', () => {
    renderPage()
    const section = document.querySelector('section')
    expect(section?.className).toContain('flex')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/viewer/__tests__/ViewerPage.test.tsx`
Expected: FAIL - ViewerPage has old layout

- [ ] **Step 3: Rewrite ViewerPage**

Replace `src/components/viewer/ViewerPage.tsx`:

```tsx
import { DigestiveCanvas } from './DigestiveCanvas'
import { OrganInfoCard } from './OrganInfoCard'
import { ViewerMenu } from './ViewerMenu'
import { ViewerProvider } from './ViewerContext.tsx'

export function ViewerPage() {
  return (
    <ViewerProvider>
      <section className="flex h-screen w-screen overflow-hidden">
        <ViewerMenu />
        <div className="relative flex-1 h-full min-h-[24rem] overflow-hidden">
          <DigestiveCanvas />
          <OrganInfoCard />
        </div>
      </section>
    </ViewerProvider>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/viewer/__tests__/ViewerPage.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/viewer/ViewerPage.tsx src/components/viewer/__tests__/ViewerPage.test.tsx
git commit -m "feat: integrate ViewerMenu into ViewerPage with flex layout"
```

---

### Task 7: Create ViewerInfoDialog

**Files:**
- Create: `src/components/viewer/ViewerInfoDialog.tsx`

- [ ] **Step 1: Implement ViewerInfoDialog**

Create `src/components/viewer/ViewerInfoDialog.tsx`:

```tsx
import { BookOpen } from '@phosphor-icons/react'
import { useStarterSettings } from '@/app/StarterSettingsContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createTranslator } from '@/lib/i18n'
import { useViewer } from './viewerContext'
import { getOrganInfo } from './organConfig'

const ORGAN_KEYS = ['mieng', 'thucQuan', 'daDay', 'ruotNon', 'ruotGia', 'gan', 'tuiMat', 'tuy']

export function ViewerInfoDialog() {
  const { activeDialog, setActiveDialog } = useViewer()
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)

  const open = activeDialog === 'info'

  return (
    <Dialog open={open} onOpenChange={(open) => setActiveDialog(open ? 'info' : null)}>
      <DialogContent className="max-h-[80vh] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
            {t('viewer.info.title')}
          </DialogTitle>
          <DialogDescription>
            {t('viewer.organ.daDay.description')}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {ORGAN_KEYS.map((key) => {
              const organ = getOrganInfo(key)
              if (!organ) return null
              return (
                <div key={key} className="rounded-lg border p-4">
                  <h3 className="font-semibold text-lg">{t(organ.displayNameKey)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t(organ.descriptionKey)}</p>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Wire into ViewerPage**

Edit `src/components/viewer/ViewerPage.tsx` to import and render `ViewerInfoDialog`:

Add import: `import { ViewerInfoDialog } from './ViewerInfoDialog'`
Add `<ViewerInfoDialog />` inside the `ViewerProvider` region (after `OrganInfoCard`).

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/viewer/ViewerInfoDialog.tsx src/components/viewer/ViewerPage.tsx
git commit -m "feat: add ViewerInfoDialog with all organ details"
```

---

### Task 8: Create ViewerSettings sheet

**Files:**
- Create: `src/components/viewer/ViewerSettings.tsx`

- [ ] **Step 1: Implement ViewerSettings**

Create `src/components/viewer/ViewerSettings.tsx`:

```tsx
import { GearSix } from '@phosphor-icons/react'
import { useState } from 'react'
import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { createTranslator } from '@/lib/i18n'
import { useViewer } from './viewerContext'

export function ViewerSettings() {
  const { activeSheet, setActiveSheet, backgroundColor, setBackgroundColor, modelColor, setModelColor } = useViewer()
  const { locale, settings, updateSettings } = useStarterSettings()
  const t = createTranslator(locale)
  const [volume, setVolume] = useState(80)
  const [shadowsEnabled, setShadowsEnabled] = useState(true)
  const [lightingIntensity, setLightingIntensity] = useState(80)

  const open = activeSheet === 'settings'

  return (
    <Sheet open={open} onOpenChange={(open) => setActiveSheet(open ? 'settings' : null)}>
      <SheetContent side="right" className="w-[400px] sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <GearSix className="h-5 w-5" aria-hidden="true" />
            {t('viewer.settings.title')}
          </SheetTitle>
          <SheetDescription>{t('settings.subtitle')}</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">{t('settings.appearance')}</h4>
            <div className="space-y-2">
              <Label>{t('settings.theme')}</Label>
              <RadioGroup
                value={settings.themeMode}
                onValueChange={(value) => updateSettings({ themeMode: value as 'light' | 'dark' | 'system' })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="theme-light" />
                  <Label htmlFor="theme-light">{t('settings.theme.light')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="theme-dark" />
                  <Label htmlFor="theme-dark">{t('settings.theme.dark')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="theme-system" />
                  <Label htmlFor="theme-system">{t('settings.theme.system')}</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">{t('viewer.settings.lighting')}</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t('viewer.settings.shadows')}</Label>
                <Switch checked={shadowsEnabled} onCheckedChange={setShadowsEnabled} id="shadows" />
              </div>
              <div className="space-y-1">
                <Label>{t('viewer.settings.lighting')}: {lightingIntensity}%</Label>
                <Slider value={[lightingIntensity]} onValueChange={([v]) => setLightingIntensity(v)} min={10} max={100} step={10} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">{t('settings.language')}</h4>
            <RadioGroup
              value={settings.uiLanguage}
              onValueChange={(value) => updateSettings({ uiLanguage: value as 'en' | 'vi' | 'system' })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vi" id="lang-vi" />
                <Label htmlFor="lang-vi">{t('settings.language.vietnamese')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="en" id="lang-en" />
                <Label htmlFor="lang-en">{t('settings.language.english')}</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">{t('viewer.settings.volume')}</h4>
            <div className="space-y-1">
              <Label>{t('viewer.settings.volume')}: {volume}%</Label>
              <Slider value={[volume]} onValueChange={([v]) => setVolume(v)} min={0} max={100} step={5} />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">{t('viewer.settings.voice')}</h4>
            <RadioGroup defaultValue="bac">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bac" id="voice-bac" />
                <Label htmlFor="voice-bac">{t('viewer.settings.voice.bac')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="trung" id="voice-trung" />
                <Label htmlFor="voice-trung">{t('viewer.settings.voice.trung')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nam" id="voice-nam" />
                <Label htmlFor="voice-nam">{t('viewer.settings.voice.nam')}</Label>
              </div>
            </RadioGroup>
          </div>

          <Button type="button" variant="outline" className="w-full" onClick={() => { setBackgroundColor('#1a1a2e'); setModelColor(null) }}>
            {t('viewer.settings.resetColors')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 2: Wire into ViewerPage**

Edit `src/components/viewer/ViewerPage.tsx`:
Add import: `import { ViewerSettings } from './ViewerSettings'`
Add `<ViewerSettings />` in the JSX.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/viewer/ViewerSettings.tsx src/components/viewer/ViewerPage.tsx
git commit -m "feat: add ViewerSettings sheet with theme, lighting, volume, voice controls"
```

---

### Task 9: Create placeholder dialogs (Quiz, Chatbot, GenAI)

**Files:**
- Create: `src/components/viewer/ViewerQuizDialog.tsx`
- Create: `src/components/viewer/ViewerChatbot.tsx`
- Create: `src/components/viewer/ViewerGenAIDialog.tsx`

- [ ] **Step 1: Create ViewerQuizDialog placeholder**

Create `src/components/viewer/ViewerQuizDialog.tsx`:

```tsx
import { Question } from '@phosphor-icons/react'
import { useStarterSettings } from '@/app/StarterSettingsContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createTranslator } from '@/lib/i18n'
import { useViewer } from './viewerContext'

export function ViewerQuizDialog() {
  const { activeDialog, setActiveDialog } = useViewer()
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)

  return (
    <Dialog open={activeDialog === 'quiz'} onOpenChange={(open) => setActiveDialog(open ? 'quiz' : null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Question className="h-5 w-5" aria-hidden="true" />
            {t('viewer.quiz.title')}
          </DialogTitle>
          <DialogDescription>
            Tính năng đang được phát triển.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Create ViewerChatbot placeholder**

Create `src/components/viewer/ViewerChatbot.tsx`:

```tsx
import { ChatsCircle } from '@phosphor-icons/react'
import { useStarterSettings } from '@/app/StarterSettingsContext'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { createTranslator } from '@/lib/i18n'
import { useViewer } from './viewerContext'

export function ViewerChatbot() {
  const { activeSheet, setActiveSheet } = useViewer()
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)

  return (
    <Sheet open={activeSheet === 'chatbot'} onOpenChange={(open) => setActiveSheet(open ? 'chatbot' : null)}>
      <SheetContent side="right" className="w-[400px] sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ChatsCircle className="h-5 w-5" aria-hidden="true" />
            {t('viewer.chatbot.title')}
          </SheetTitle>
          <SheetDescription>
            Tính năng đang được phát triển.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 3: Create ViewerGenAIDialog placeholder**

Create `src/components/viewer/ViewerGenAIDialog.tsx`:

```tsx
import { Sparkle } from '@phosphor-icons/react'
import { useStarterSettings } from '@/app/StarterSettingsContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createTranslator } from '@/lib/i18n'
import { useViewer } from './viewerContext'

export function ViewerGenAIDialog() {
  const { activeDialog, setActiveDialog } = useViewer()
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)

  return (
    <Dialog open={activeDialog === 'genai'} onOpenChange={(open) => setActiveDialog(open ? 'genai' : null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkle className="h-5 w-5" aria-hidden="true" />
            {t('viewer.genai.title')}
          </DialogTitle>
          <DialogDescription>
            Tính năng đang được phát triển.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Wire all three into ViewerPage**

Edit `src/components/viewer/ViewerPage.tsx` to add imports and render `<ViewerQuizDialog />`, `<ViewerChatbot />`, `<ViewerGenAIDialog />`.

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/components/viewer/ViewerQuizDialog.tsx src/components/viewer/ViewerChatbot.tsx src/components/viewer/ViewerGenAIDialog.tsx src/components/viewer/ViewerPage.tsx
git commit -m "feat: add placeholder dialogs for Quiz, Chatbot, and Gen AI"
```

---

### Task 10: Implement background and model color controls

**Files:**
- Modify: `src/components/viewer/DigestiveCanvas.tsx`
- Create: `src/components/viewer/ColorPickerPopover.tsx`

- [ ] **Step 1: Create ColorPickerPopover**

Create `src/components/viewer/ColorPickerPopover.tsx`:

```tsx
import { Check, PaintBucket } from '@phosphor-icons/react'
import { type ReactNode } from 'react'
import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { createTranslator } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useViewer } from './viewerContext'

const PRESET_COLORS = [
  '#1a1a2e', '#16213e', '#0f3460', '#533483',
  '#e94560', '#f5f5f5', '#ffd700', '#00ff88',
  '#ff6b35', '#4ecdc4', '#2c3e50', '#8e44ad',
]

interface ColorPickerPopoverProps {
  type: 'model' | 'background'
  children: ReactNode
}

export function ColorPickerPopover({ type, children }: ColorPickerPopoverProps) {
  const { backgroundColor, setBackgroundColor, modelColor, setModelColor } = useViewer()
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)

  const currentColor = type === 'background' ? backgroundColor : (modelColor ?? null)
  const title = type === 'background' ? t('viewer.colorPicker.backgroundTitle') : t('viewer.colorPicker.modelTitle')

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-52">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">{title}</h4>
          <div className="grid grid-cols-6 gap-1.5">
            {PRESET_COLORS.map((color) => (
              <Tooltip key={color} delayDuration={200}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className={cn('h-7 w-7 rounded-full border-2 transition-all hover:scale-110', currentColor === color ? 'border-foreground' : 'border-transparent')}
                    style={{ backgroundColor: color }}
                    onClick={() => type === 'background' ? setBackgroundColor(color) : setModelColor(color)}
                    aria-label={color}
                  >
                    {currentColor === color && <Check className="h-3 w-3 text-white drop-shadow" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>{color}</p></TooltipContent>
              </Tooltip>
            ))}
          </div>
          {type === 'model' && modelColor != null && (
            <Button type="button" variant="ghost" size="sm" className="w-full" onClick={() => setModelColor(null)}>
              {t('viewer.colorPicker.reset')}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
```

- [ ] **Step 2: Update ViewerMenu to use ColorPickerPopover**

Edit `src/components/viewer/ViewerMenu.tsx`:

Add import: `import { ColorPickerPopover } from './ColorPickerPopover'`

Re-enable the model color and background color buttons when wiring their popovers.

Change the `modelColor` and `bgColor` button definitions to include `children` with the ColorPickerPopover:

In `modelInteractionButtons`, replace the modelColor and bgColor entries:

```typescript
{
  id: 'modelColor',
  label: t('viewer.menu.modelColor'),
  icon: PaintBucket,
  onClick: () => {},
  disabled: isFlyCameraActive,
  children: (
    <ColorPickerPopover type="model">
      <span className="sr-only">{t('viewer.menu.modelColor')}</span>
    </ColorPickerPopover>
  ),
},
{
  id: 'bgColor',
  label: t('viewer.menu.backgroundColor'),
  icon: Image,
  onClick: () => {},
  disabled: isFlyCameraActive,
  children: (
    <ColorPickerPopover type="background">
      <span className="sr-only">{t('viewer.menu.backgroundColor')}</span>
    </ColorPickerPopover>
  ),
},
```

Note: The color picker pops up from the button icon area. We need to restructure how the menu button renders these: the popover trigger wraps the icon directly for these two buttons. Update ViewerMenuGroup to support an optional `popover` field on `MenuButtonDef` that renders as a child inside the button.

Actually, let's take a simpler approach: render the `ColorPickerPopover` as a child of the button in ViewerMenuGroup. The `children` from MenuButtonDef are already rendered after the button content. Let's modify to render the popover trigger around the button instead.

Let me redesign: the ColorPickerPopover wraps the entire button for modelColor and bgColor. So in ViewerMenu, we'll handle these two buttons specially. But for the plan to stay clean, let me just use a separate approach: update `MenuButtonDef` to have an optional `popoverContent` field, and ViewerMenuGroup renders a Popover around the button when that field is present.

Let me keep it simpler in the plan. I'll implement this in a more direct way in the actual code. For now, let me continue with the plan.

- [ ] **Step 3: Update DigestiveCanvas to use backgroundColor from context**

Edit `src/components/viewer/DigestiveCanvas.tsx`:

```tsx
import { useViewer } from './viewerContext'

// Inside the component, get backgroundColor:
const { backgroundColor } = useViewer()

// Replace the hardcoded color:
<color attach="background" args={[backgroundColor]} />
```

Instead of `<color attach="background" args={["#1a1a2e"]} />`.

- [ ] **Step 4: Create ModelColorController for model color override**

Create `src/components/viewer/ModelColorController.tsx`:

```tsx
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useViewer } from './viewerContext'

export function ModelColorController() {
  const { modelColor, organNodes } = useViewer()
  const originalMaterials = useRef(new Map<string, THREE.Material | THREE.Material[]>())

  useEffect(() => {
    if (modelColor == null) {
      originalMaterials.current.forEach((material, uuid) => {
        const meshes = Array.from(organNodes.values()).flat()
        const mesh = meshes.find((m) => m.uuid === uuid)
        if (mesh) mesh.material = material
      })
      originalMaterials.current.clear()
      return
    }

    organNodes.forEach((meshes) => {
      meshes.forEach((mesh) => {
        if (!originalMaterials.current.has(mesh.uuid)) {
          originalMaterials.current.set(mesh.uuid, mesh.material)
        }

        const newMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color(modelColor),
          roughness: 0.72,
          metalness: 0,
        })

        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map(() => newMaterial.clone())
        } else {
          mesh.material = newMaterial
        }
      })
    })

    return () => {
      originalMaterials.current.forEach((material, uuid) => {
        const meshes = Array.from(organNodes.values()).flat()
        const mesh = meshes.find((m) => m.uuid === uuid)
        if (mesh) mesh.material = material
      })
      originalMaterials.current.clear()
    }
  }, [modelColor, organNodes])

  return null
}
```

Add `<ModelColorController />` inside `<Suspense>` in `DigestiveCanvas.tsx`.

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/components/viewer/ColorPickerPopover.tsx src/components/viewer/ViewerMenu.tsx src/components/viewer/DigestiveCanvas.tsx src/components/viewer/ModelColorController.tsx
git commit -m "feat: add color picker for background and model with preset swatches"
```

---

### Task 11: Implement model auto-rotate toggle

**Files:**
- Modify: `src/components/viewer/DigestiveCanvas.tsx`
- Create: `src/components/viewer/AutoRotateController.tsx`

- [ ] **Step 1: Create AutoRotateController**

Create `src/components/viewer/AutoRotateController.tsx`:

```tsx
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useViewer } from './viewerContext'

const ROTATION_SPEED = 0.3

export function AutoRotateController() {
  const { isSpinning } = useViewer()
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (!isSpinning || !groupRef.current) return
    groupRef.current.rotation.y += ROTATION_SPEED * delta
  })

  return <group ref={groupRef} />
}
```

- [ ] **Step 2: Integrate into DigestiveCanvas**

Wrap the model content in `DigestiveCanvas.tsx` with `AutoRotateController`. The model needs to be a child of the rotating group. Update `DigestiveModel` rendering:

```tsx
<AutoRotateController>
  <DigestiveModel />
</AutoRotateController>
```

But this requires `AutoRotateController` to accept children and wrap them. Update:

```tsx
import type { ReactNode } from 'react'

interface AutoRotateControllerProps {
  children: ReactNode
}

export function AutoRotateController({ children }: AutoRotateControllerProps) {
  const { isSpinning } = useViewer()
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (!isSpinning || !groupRef.current) return
    groupRef.current.rotation.y += ROTATION_SPEED * delta
  })

  return <group ref={groupRef}>{children}</group>
}
```

- [ ] **Step 3: Toggle button already wired in Task 5**

The rotate button in ViewerMenu already calls `setIsSpinning(!isSpinning)`.

- [ ] **Step 4: Commit**

```bash
git add src/components/viewer/AutoRotateController.tsx src/components/viewer/DigestiveCanvas.tsx
git commit -m "feat: add model auto-rotate toggle via AutoRotateController"
```

---

### Task 12: Implement fly camera auto-tour

**Files:**
- Modify: `src/components/viewer/CameraController.tsx`
- Modify: `src/components/viewer/ViewerMenu.tsx`

- [ ] **Step 1: Extend CameraController for fly camera tour**

Edit `src/components/viewer/CameraController.tsx`. Add a `useEffect` that watches `flyCameraActive` from context and drives the camera through organ stops:

```typescript
import { useViewer } from './viewerContext'

// Inside CameraController, add:
const { flyCameraActive, setFlyCameraActive, setSelectedOrgan } = useViewer()
const tourStops = ['mieng', 'thucQuan', 'daDay', 'ruotNon', 'ruotGia', 'gan', 'tuiMat', 'tuy']
const tourIndex = useRef(0)
const tourTimer = useRef(0)
const TOUR_DURATION_PER_STOP = 3

const cancelTour = useCallback(() => {
  setFlyCameraActive(false)
  setSelectedOrgan(null)
  tourIndex.current = 0
  tourTimer.current = 0
}, [setFlyCameraActive, setSelectedOrgan])

useFrame((_, delta) => {
  if (!flyCameraActive || isTransitioning) return

  tourTimer.current += delta

  if (tourTimer.current >= TOUR_DURATION_PER_STOP) {
    tourTimer.current = 0

    if (tourIndex.current >= tourStops.length) {
      // Tour complete, go back to overview
      setSelectedOrgan(null)
      setCameraTarget('overview')
      cancelTour()
      return
    }

    const nextOrgan = tourStops[tourIndex.current]
    tourIndex.current += 1
    setSelectedOrgan(nextOrgan)
    setCameraTarget(nextOrgan)
    animateCamera(nextOrgan)
  }
})
```

- [ ] **Step 2: Wire fly camera button in ViewerMenu**

Replace the flyCamera button `onClick`:

```typescript
{ id: 'flyCamera', label: t('viewer.menu.flyCamera'), icon: VideoCamera, onClick: () => { if (flyCameraActive) { setFlyCameraActive(false); setSelectedOrgan(null) } else { setFlyCameraActive(true) } }, active: flyCameraActive, disabled: isSpinning }
```

- [ ] **Step 3: Import setSelectedOrgan where needed**

Ensure `setSelectedOrgan` is imported in `ViewerMenu.tsx` from `useViewer()`.

- [ ] **Step 4: Commit**

```bash
git add src/components/viewer/CameraController.tsx src/components/viewer/ViewerMenu.tsx
git commit -m "feat: implement fly camera auto-tour through all organs"
```

---

### Task 13: Implement annotation drawing overlay

**Files:**
- Create: `src/components/viewer/ViewerAnnotation.tsx`

- [ ] **Step 1: Create ViewerAnnotation**

Create `src/components/viewer/ViewerAnnotation.tsx`:

```tsx
import { Eraser, PencilSimple, XCircle, PaintBucket } from '@phosphor-icons/react'
import { useCallback, useRef, useState } from 'react'
import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { createTranslator } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useViewer } from './viewerContext'

interface Line {
  points: { x: number; y: number }[]
  color: string
}

const ANNOTATION_COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#000000']

export function ViewerAnnotation() {
  const { isDrawing, setIsDrawing, drawColor, setDrawColor } = useViewer()
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const [lines, setLines] = useState<Line[]>([])
  const [currentLine, setCurrentLine] = useState<{ points: { x: number; y: number }[] } | null>(null)
  const [isErasing, setIsErasing] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  const getSvgPoint = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const svg = svgRef.current
    if (!svg) return null
    const rect = svg.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0]?.clientX ?? -1 : e.clientX
    const clientY = 'touches' in e ? e.touches[0]?.clientY ?? -1 : e.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }, [])

  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isErasing) return
    const point = getSvgPoint(e)
    if (!point) return
    setCurrentLine({ points: [point] })
  }, [getSvgPoint, isErasing])

  const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const point = getSvgPoint(e)
    if (!point) return
    if (currentLine) {
      setCurrentLine((prev) => prev ? { points: [...prev.points, point] } : null)
    }
  }, [getSvgPoint, currentLine])

  const handlePointerUp = useCallback(() => {
    if (currentLine && currentLine.points.length > 1) {
      setLines((prev) => [...prev, { points: currentLine.points, color: drawColor }])
    }
    setCurrentLine(null)
  }, [currentLine, drawColor])

  const handleEraseClick = useCallback((e: React.MouseEvent) => {
    if (!isErasing) return
    const point = getSvgPoint(e)
    if (!point) return
    setLines((prev) => prev.filter((line) => {
      return !line.points.some((p) => Math.hypot(p.x - point.x, p.y - point.y) < 15)
    }))
  }, [getSvgPoint, isErasing])

  const clearAll = useCallback(() => setLines([]), [])
  const exitDrawing = useCallback(() => setIsDrawing(false), [setIsDrawing])

  if (!isDrawing) return null

  return (
    <div className="absolute inset-0 z-20">
      <svg
        ref={svgRef}
        className="absolute inset-0 h-full w-full"
        style={{ touchAction: 'none' }}
        onPointerDown={isErasing ? handleEraseClick : handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {lines.map((line, i) => (
          <polyline key={i} points={line.points.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={line.color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {currentLine && (
          <polyline points={currentLine.points.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={drawColor} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>

      <div className="absolute right-4 top-4 flex flex-col gap-1 rounded-lg border bg-background/95 p-1.5 shadow-lg backdrop-blur">
        <Button type="button" variant={isErasing ? 'secondary' : 'ghost'} size="icon" onClick={() => setIsErasing(false)} title={t('viewer.annotation.pen')}>
          <PencilSimple className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button type="button" variant={isErasing ? 'ghost' : 'secondary'} size="icon" onClick={() => setIsErasing(!isErasing)} title={t('viewer.annotation.eraser')}>
          <Eraser className="h-4 w-4" aria-hidden="true" />
        </Button>
        <div className="flex flex-col gap-0.5 py-1">
          {ANNOTATION_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={cn('h-5 w-5 rounded-full border-2 transition-all hover:scale-110', drawColor === color ? 'border-foreground' : 'border-transparent')}
              style={{ backgroundColor: color }}
              onClick={() => { setDrawColor(color); setIsErasing(false) }}
              aria-label={color}
            />
          ))}
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={clearAll} title={t('viewer.annotation.clearAll')}>
          <XCircle className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={exitDrawing} title={t('viewer.annotation.exit')}>
          <PaintBucket className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Wire into ViewerPage**

Add import and render `<ViewerAnnotation />` in `ViewerPage.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/viewer/ViewerAnnotation.tsx src/components/viewer/ViewerPage.tsx
git commit -m "feat: add SVG annotation overlay with pen, eraser, and color picker"
```

---

### Task 14: Implement fullscreen toggle via Tauri

**Files:**
- Create: `src/components/viewer/useFullscreen.ts`
- Modify: `src/components/viewer/ViewerMenu.tsx`

- [ ] **Step 1: Create useFullscreen hook**

Create `src/components/viewer/useFullscreen.ts`:

```typescript
import { useCallback, useEffect, useState } from 'react'

async function getTauriWindow() {
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window')
    return getCurrentWindow()
  } catch {
    return null
  }
}

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function init() {
      const win = await getTauriWindow()
      if (!win || cancelled) return

      const current = await win.isFullscreen()
      if (!cancelled) setIsFullscreen(current)

      const unlisten = await win.onResized(async () => {
        if (!cancelled) {
          const full = await win.isFullscreen()
          setIsFullscreen(full)
        }
      })

      return unlisten
    }

    init()

    return () => {
      cancelled = true
    }
  }, [])

  const toggleFullscreen = useCallback(async () => {
    const win = await getTauriWindow()
    if (!win) {
      // Fallback: use Fullscreen API for browser
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
      return
    }

    const current = await win.isFullscreen()
    await win.setFullscreen(!current)
    setIsFullscreen(!current)
  }, [])

  return { isFullscreen, toggleFullscreen }
}
```

- [ ] **Step 2: Wire into ViewerMenu**

In `ViewerMenu.tsx`:
- Import `useFullscreen` and replace the local `isFullscreen` from context with the hook value
- Wire the fullscreen button's `onClick` to `toggleFullscreen`
- Re-enable the fullscreen button now that it has a working handler

```typescript
const { isFullscreen, toggleFullscreen } = useFullscreen()
```

- [ ] **Step 3: Commit**

```bash
git add src/components/viewer/useFullscreen.ts src/components/viewer/ViewerMenu.tsx
git commit -m "feat: add fullscreen toggle via Tauri window API with browser fallback"
```

---

### Task 15: Implement remaining feature buttons (screenshot, video, editor)

**Files:**
- Modify: `src/components/viewer/ViewerMenu.tsx`

- [ ] **Step 1: Implement screenshot button**

In `ViewerMenu.tsx`, the screenshot button:

Re-enable the screenshot button and set its handler:

```typescript
{
  id: 'screenshot',
  label: t('viewer.menu.screenshot'),
  icon: Camera,
  onClick: async () => {
    try {
      const canvas = document.querySelector('canvas')
      if (!canvas) return
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `screenshot-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    } catch {
      // Silently fail in non-Tauri environments
    }
  },
},
```

- [ ] **Step 2: Implement video button**

Re-enable the video button and set its handler:

```typescript
{
  id: 'video',
  label: t('viewer.menu.video'),
  icon: Play,
  onClick: () => {
    setActiveDialog(activeDialog === 'video' ? null : 'video')
  },
},
```

Create a new dialog `ViewerVideoDialog.tsx` for video playback. But since the spec says "mở video học liệu từ file có sẵn trong publish", this opens a local video file. Create:

Create `src/components/viewer/ViewerVideoDialog.tsx`:

```tsx
import { Play } from '@phosphor-icons/react'
import { useEffect, useRef } from 'react'
import { useStarterSettings } from '@/app/StarterSettingsContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createTranslator } from '@/lib/i18n'
import { useViewer } from './viewerContext'

const VIDEO_PATH = '/videos/learning.mp4'

export function ViewerVideoDialog() {
  const { activeDialog, setActiveDialog } = useViewer()
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const videoRef = useRef<HTMLVideoElement>(null)

  const open = activeDialog === 'video'

  useEffect(() => {
    if (!open && videoRef.current) {
      videoRef.current.pause()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={(open) => setActiveDialog(open ? 'video' : null)}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" aria-hidden="true" />
            {t('viewer.menu.video')}
          </DialogTitle>
          <DialogDescription>
            Video học liệu về hệ tiêu hóa.
          </DialogDescription>
        </DialogHeader>
        <video
          ref={videoRef}
          src={VIDEO_PATH}
          controls
          className="w-full rounded-lg"
          preload="metadata"
        >
          Trình duyệt không hỗ trợ video.
        </video>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: Implement editor button**

Re-enable the editor button and set its handler:

```typescript
{
  id: 'editor',
  label: t('viewer.menu.editor'),
  icon: Article,
  onClick: async () => {
    try {
      const { open } = await import('@tauri-apps/plugin-shell')
      await open('notepad.exe')
    } catch {
      // Silently fail outside Tauri
    }
  },
},
```

Note: `@tauri-apps/plugin-shell` may need to be added to dependencies and the Tauri plugin configured in `src-tauri/Cargo.toml` and `src-tauri/src/lib.rs`. For now, the try/catch handles the case where it's not available.

- [ ] **Step 4: Update ViewerPage**

Add `<ViewerVideoDialog />` import and render, and add `'video'` to the `ActiveDialog` type in viewerContext.ts.

- [ ] **Step 5: Update context type for video dialog**

In `viewerContext.ts`, update `ActiveDialog` type to include `'video'`:

```typescript
export type ActiveDialog = 'info' | 'quiz' | 'genai' | 'video' | null
```

- [ ] **Step 6: Commit**

```bash
git add src/components/viewer/ViewerMenu.tsx src/components/viewer/ViewerVideoDialog.tsx src/components/viewer/ViewerPage.tsx src/components/viewer/viewerContext.ts
git commit -m "feat: implement screenshot, video, and editor buttons"
```

---

### Task 16: Remove old app shell files

**Files:**
- Remove: `src/components/app-shell/`
- Remove: `src/components/command-palette/`
- Remove: `src/components/dashboard/`
- Remove: `src/components/gallery/`
- Remove: `src/components/settings/` (SettingsPage, keep any reusable primitives)
- Modify: `src/app/routes.tsx` (simplify or remove)
- Modify: `src/app/App.tsx` (remove unused imports)

- [ ] **Step 1: Remove directories**

```bash
git rm -r src/components/app-shell/
git rm -r src/components/command-palette/
git rm -r src/components/dashboard/
git rm -r src/components/gallery/
git rm -r src/components/settings/
```

- [ ] **Step 2: Update routes.tsx**

If routes.tsx is still imported anywhere, simplify to just the viewer route or remove entirely. Since `App.tsx` no longer uses routes, remove it.

```bash
git rm src/app/routes.tsx
```

- [ ] **Step 3: Verify the build compiles**

Run: `npx tsc --noEmit`
Run: `pnpm build`
Expected: No errors

- [ ] **Step 4: Fix any remaining import errors**

Check for any files still importing from removed directories and clean them up.

- [ ] **Step 5: Commit**

```bash
git commit -m "refactor: remove old app shell, command palette, dashboard, gallery, and settings pages"
```

---

### Task 17: Final smoke test and verification

**Files:**
- Run: all verification commands

- [ ] **Step 1: Run lint**

Run: `pnpm lint`
Expected: PASS, 0 warnings

- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run unit tests**

Run: `pnpm test`
Expected: All tests pass

- [ ] **Step 4: Run build**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 5: Commit any remaining fixes**

```bash
git add -A
git commit -m "fix: resolve remaining lint and type errors after shell removal"
```

---

## Plan Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Extend ViewerContext with menu state | `viewerContext.ts`, `ViewerContext.tsx` |
| 2 | Add locale keys | `vi.json`, `en.json` |
| 3 | Simplify App.tsx to single-route | `App.tsx`, `App.test.tsx` |
| 4 | Create ViewerMenuGroup | `ViewerMenuGroup.tsx` |
| 5 | Create ViewerMenu | `ViewerMenu.tsx` |
| 6 | Update ViewerPage layout | `ViewerPage.tsx` |
| 7 | ViewerInfoDialog | `ViewerInfoDialog.tsx` |
| 8 | ViewerSettings sheet | `ViewerSettings.tsx` |
| 9 | Placeholder dialogs (Quiz, Chatbot, GenAI) | 3 new files |
| 10 | Color controls | `ColorPickerPopover.tsx`, `DigestiveCanvas.tsx`, `ModelColorController.tsx` |
| 11 | Auto-rotate toggle | `AutoRotateController.tsx` |
| 12 | Fly camera auto-tour | `CameraController.tsx` |
| 13 | Annotation overlay | `ViewerAnnotation.tsx` |
| 14 | Fullscreen toggle | `useFullscreen.ts` |
| 15 | Screenshot, video, editor | `ViewerVideoDialog.tsx`, `ViewerMenu.tsx` |
| 16 | Remove old shell files | Delete 5 directories + routes.tsx |
| 17 | Final verification | lint, tsc, test, build |
