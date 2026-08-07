# Viewer Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade 6 menu features in the existing `ViewerV2Overlay` collapsible sidebar from placeholder/basic state to full functionality.

**Architecture:** Extend `ViewerV2Context` with new state, add 4 new component files under `src/components/viewer-v2/ui/`, update 5 existing files. Each feature is a self-contained component with its own tests. The overlay acts as a router to show/hide panels based on context state.

**Tech Stack:** React 19, TypeScript, vitest, @testing-library/react, Three.js/react-three-fiber, shadcn/ui, phosphor-icons

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/components/viewer-v2/viewerV2Context.ts` | Modify | Add new state types |
| `src/components/viewer-v2/ViewerV2Provider.tsx` | Modify | Add new state + defaults |
| `src/components/viewer-v2/ui/ViewerV2Overlay.tsx` | Modify | Wire new components, route video as sheet |
| `src/components/viewer-v2/ui/ViewerV2SettingsPanel.tsx` | Modify | Add quality/volume/voice |
| `src/components/viewer-v2/ui/screenshot.ts` | Modify | OS-native capture |
| `src/components/viewer-v2/ui/FlyCameraTour.tsx` | Create | Tour logic + popups |
| `src/components/viewer-v2/ui/FlyCameraPopup.tsx` | Create | Organ info popup at screen pos |
| `src/components/viewer-v2/ui/AnnotationToolbar.tsx` | Create | Pen/eraser/color/clear/exit bar |
| `src/components/viewer-v2/ui/VideoPlayerPanel.tsx` | Create | Video player panel |
| `src/components/viewer-v2/scene/PostProcessing.tsx` | Modify | Consume quality preset |
| `src/components/viewer-v2/scene/SceneSetup.tsx` | Modify | Pass quality to lighting |
| `src/components/viewer-v2/scene/EnvironmentLighting.tsx` | Modify | Consume quality preset |
| `src/components/viewer-v2/camera/AutoTourController.tsx` | Modify | Integrate pause + popup state |
| `src/lib/locales/en.json` | Modify | New locale keys |
| `src/lib/locales/vi.json` | Modify | New locale keys |

---

### Task 1: Extend ViewerV2Context Types and Defaults

**Files:**
- Modify: `src/components/viewer-v2/viewerV2Context.ts`
- Modify: `src/components/viewer-v2/ViewerV2Provider.tsx`
- Modify: `src/components/viewer-v2/__tests__/viewerV2Context.test.tsx`

- [ ] **Step 1: Add failing tests for new state defaults**

In `viewerV2Context.test.tsx`, add after the last `it()` block (before closing `})`):

```typescript
  it('defaults qualityPreset to medium', () => {
    const { result } = renderHook(() => useViewerV2(), {
      wrapper: ViewerV2Provider,
    })
    expect(result.current.qualityPreset).toBe('medium')
  })

  it('defaults volume to 80', () => {
    const { result } = renderHook(() => useViewerV2(), {
      wrapper: ViewerV2Provider,
    })
    expect(result.current.volume).toBe(80)
  })

  it('defaults voice to bac', () => {
    const { result } = renderHook(() => useViewerV2(), {
      wrapper: ViewerV2Provider,
    })
    expect(result.current.voice).toBe('bac')
  })

  it('defaults annotationTool to pen', () => {
    const { result } = renderHook(() => useViewerV2(), {
      wrapper: ViewerV2Provider,
    })
    expect(result.current.annotationTool).toBe('pen')
  })

  it('defaults flyCameraOrganPopup to null', () => {
    const { result } = renderHook(() => useViewerV2(), {
      wrapper: ViewerV2Provider,
    })
    expect(result.current.flyCameraOrganPopup).toBeNull()
  })

  it('defaults flyCameraPaused to false', () => {
    const { result } = renderHook(() => useViewerV2(), {
      wrapper: ViewerV2Provider,
    })
    expect(result.current.flyCameraPaused).toBe(false)
  })
```

- [ ] **Step 2: Run tests to verify failures**

```powershell
npx vitest run src/components/viewer-v2/__tests__/viewerV2Context.test.tsx
```

Expected: FAIL with "Property 'qualityPreset' does not exist on type 'ViewerV2ContextValue'" or similar.

- [ ] **Step 3: Add types to viewerV2Context.ts**

Replace `ActiveSheet` and `ActiveDialog` types and add new state:

```typescript
export type ActiveSheet = 'chatbot' | 'settings' | 'video' | null
export type ActiveDialog = 'info' | 'quiz' | 'genai' | null

export type QualityPreset = 'low' | 'medium' | 'high'
export type VoiceOption = 'bac' | 'trung' | 'nam'
export type AnnotationTool = 'pen' | 'eraser'
```

Add to `ViewerV2ContextValue` interface (after `setFlyCameraActive`):

```typescript
  flyCameraPaused: boolean
  setFlyCameraPaused: (v: boolean) => void
  flyCameraOrganPopup: string | null
  setFlyCameraOrganPopup: (organ: string | null) => void
  qualityPreset: QualityPreset
  setQualityPreset: (q: QualityPreset) => void
  volume: number
  setVolume: (v: number) => void
  voice: VoiceOption
  setVoice: (v: VoiceOption) => void
  annotationTool: AnnotationTool
  setAnnotationTool: (tool: AnnotationTool) => void
```

- [ ] **Step 4: Add state to ViewerV2Provider.tsx**

Add imports at top:

```typescript
import type { AnnotationTool, QualityPreset, VoiceOption } from './viewerV2Context'
```

Add state hooks after line 29:

```typescript
  const [flyCameraPaused, setFlyCameraPaused] = useState(false)
  const [flyCameraOrganPopup, setFlyCameraOrganPopup] = useState<string | null>(null)
  const [qualityPreset, setQualityPreset] = useState<QualityPreset>('medium')
  const [volume, setVolume] = useState(80)
  const [voice, setVoice] = useState<VoiceOption>('bac')
  const [annotationTool, setAnnotationTool] = useState<AnnotationTool>('pen')
```

Add to the value object (after `flyCameraActive` and `setFlyCameraActive`):

```typescript
        flyCameraPaused,
        setFlyCameraPaused,
        flyCameraOrganPopup,
        setFlyCameraOrganPopup,
        qualityPreset,
        setQualityPreset,
        volume,
        setVolume,
        voice,
        setVoice,
        annotationTool,
        setAnnotationTool,
```

- [ ] **Step 5: Run tests to verify passes**

```powershell
npx vitest run src/components/viewer-v2/__tests__/viewerV2Context.test.tsx
```

Expected: PASS (all tests including new ones)

- [ ] **Step 6: Commit**

```powershell
git add src/components/viewer-v2/viewerV2Context.ts src/components/viewer-v2/ViewerV2Provider.tsx src/components/viewer-v2/__tests__/viewerV2Context.test.tsx
git commit -m "feat: add fly camera pause, quality preset, volume, voice, and annotation tool states to viewer context"
```

---

### Task 2: Upgrade AutoTourController with Pause + Popup

**Files:**
- Modify: `src/components/viewer-v2/camera/AutoTourController.tsx`

- [ ] **Step 1: Read current AutoTourController**

Already read -- the file uses `TOUR_STOP_MS = 3000` and auto-advances via `setTimeout`.

- [ ] **Step 2: Update AutoTourController.tsx**

Rewrite the file to integrate `flyCameraPaused` and `flyCameraOrganPopup` state:

```typescript
import { useEffect, useRef } from 'react'

import { useViewerV2 } from '../viewerV2Context'

export const TOUR_ORGAN_ORDER = [
  'mieng',
  'thuc_quan',
  'da_day',
  'ruot_non',
  'ruot_gia',
  'gan',
  'tui_mat',
  'tuy',
] as const

export function AutoTourController() {
  const {
    flyCameraActive,
    flyCameraPaused,
    selectedOrgan,
    setCameraTarget,
    setFlyCameraActive,
    setFlyCameraOrganPopup,
    setFlyCameraPaused,
    setSelectedOrgan,
  } = useViewerV2()
  const tourStep = useRef<number | null>(null)
  const tourSelectedOrgan = useRef<string | null>(null)
  const isSettingTourSelection = useRef(false)

  useEffect(() => {
    if (!flyCameraActive) {
      tourStep.current = null
      tourSelectedOrgan.current = null
      isSettingTourSelection.current = false
      setFlyCameraPaused(false)
      setFlyCameraOrganPopup(null)
      return
    }

    if (isSettingTourSelection.current) {
      if (selectedOrgan !== tourSelectedOrgan.current) return
      isSettingTourSelection.current = false
      setFlyCameraPaused(true)
      setFlyCameraOrganPopup(tourSelectedOrgan.current)
      return
    }

    if (tourStep.current === null) {
      const firstOrgan = TOUR_ORGAN_ORDER[0]
      tourStep.current = 0
      tourSelectedOrgan.current = firstOrgan
      isSettingTourSelection.current = true
      setSelectedOrgan(firstOrgan)
      return
    }

    if (selectedOrgan !== tourSelectedOrgan.current) {
      tourStep.current = null
      tourSelectedOrgan.current = null
      isSettingTourSelection.current = false
      setFlyCameraPaused(false)
      setFlyCameraOrganPopup(null)
      setFlyCameraActive(false)
    }
  }, [flyCameraActive, flyCameraPaused, selectedOrgan, setCameraTarget, setFlyCameraActive, setFlyCameraOrganPopup, setFlyCameraPaused, setSelectedOrgan])

  const advanceTour = () => {
    setFlyCameraPaused(false)
    setFlyCameraOrganPopup(null)

    const nextStep = (tourStep.current ?? 0) + 1

    if (nextStep >= TOUR_ORGAN_ORDER.length) {
      tourStep.current = null
      tourSelectedOrgan.current = null
      isSettingTourSelection.current = false
      setSelectedOrgan(null)
      setCameraTarget('overview')
      setFlyCameraActive(false)
      return
    }

    const nextOrgan = TOUR_ORGAN_ORDER[nextStep]
    tourStep.current = nextStep
    tourSelectedOrgan.current = nextOrgan
    isSettingTourSelection.current = true
    setSelectedOrgan(nextOrgan)
  }

  useEffect(() => {
    const cleanup = () => {
      window.removeEventListener('flycamera-advance', advanceTour)
    }

    if (flyCameraActive) {
      window.addEventListener('flycamera-advance', advanceTour)
      return cleanup
    }

    cleanup()
    return cleanup
  })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // (flyCameraActive dependency is intentional for event listener lifecycle)

  return null
}
```

- [ ] **Step 3: Commit**

```powershell
git add src/components/viewer-v2/camera/AutoTourController.tsx
git commit -m "feat: add fly camera pause and organ popup state integration"
```

---

### Task 3: Create FlyCameraPopup Component

**Files:**
- Create: `src/components/viewer-v2/ui/FlyCameraPopup.tsx`
- Create: `src/components/viewer-v2/ui/__tests__/FlyCameraPopup.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/components/viewer-v2/ui/__tests__/FlyCameraPopup.test.tsx`:

```typescript
import { renderStarter } from '@/test/starterRender'
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'

import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { ViewerV2Context } from '../../viewerV2Context'
import type { ViewerV2ContextValue } from '../../viewerV2Context'
import { FlyCameraPopup } from '../FlyCameraPopup'

vi.mock('@react-three/fiber', () => ({
  useThree: () => ({
    camera: new THREE.PerspectiveCamera(),
    gl: { domElement: document.createElement('canvas') },
  }),
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
    ...overrides,
  }
}

function renderPopup(overrides: Partial<ViewerV2ContextValue> = {}) {
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
        <FlyCameraPopup />
      </ViewerV2Context.Provider>
    </StarterSettingsContext.Provider>,
  )
}

describe('FlyCameraPopup', () => {
  it('renders organ name and description when popup is active', () => {
    renderPopup({ flyCameraOrganPopup: 'da_day' })

    expect(screen.getByText('Stomach')).toBeInTheDocument()
    expect(screen.getByText(/The stomach is a J-shaped digestive organ/)).toBeInTheDocument()
  })

  it('renders nothing when flyCameraOrganPopup is null', () => {
    const { container } = renderPopup({ flyCameraOrganPopup: null })

    expect(container.innerHTML).toBe('')
  })

  it('dispatches flycamera-advance event on Continue click', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
    const setFlyCameraOrganPopup = vi.fn()
    renderPopup({ flyCameraOrganPopup: 'da_day', setFlyCameraOrganPopup })

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'flycamera-advance' }))
  })
})
```

- [ ] **Step 2: Run test to verify failure**

```powershell
npx vitest run src/components/viewer-v2/ui/__tests__/FlyCameraPopup.test.tsx
```

Expected: FAIL (file not found)

- [ ] **Step 3: Create FlyCameraPopup.tsx**

```typescript
import { useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'

import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createTranslator } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import { getOrganInfo } from '../organConfig'
import { useViewerV2 } from '../viewerV2Context'

export function FlyCameraPopup() {
  const { flyCameraOrganPopup, organNodes } = useViewerV2()
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)
  const { camera, gl } = useThree()

  const screenPos = useMemo(() => {
    if (!flyCameraOrganPopup) return null

    const meshes = organNodes.get(flyCameraOrganPopup)
    if (!meshes?.length) return null

    const box = new THREE.Box3()
    meshes.forEach((mesh) => box.expandByObject(mesh))
    const center = box.getCenter(new THREE.Vector3())

    const projected = center.clone().project(camera)

    const x = (projected.x * 0.5 + 0.5) * gl.domElement.clientWidth
    const y = (-projected.y * 0.5 + 0.5) * gl.domElement.clientHeight

    return { x, y }
  }, [flyCameraOrganPopup, organNodes, camera, gl.domElement])

  if (!flyCameraOrganPopup || !screenPos) return null

  const organInfo = getOrganInfo(flyCameraOrganPopup)
  if (!organInfo) return null

  const handleContinue = () => {
    window.dispatchEvent(new Event('flycamera-advance'))
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30"
      role="region"
      aria-label={t('viewer.flyCamera.organLabel')}
    >
      <Card
        className={cn(
          'pointer-events-auto absolute w-64 bg-card/95 shadow-lg backdrop-blur',
        )}
        style={{
          left: `${Math.min(Math.max(screenPos.x + 120, 8), gl.domElement.clientWidth - 272)}px`,
          top: `${Math.min(Math.max(screenPos.y - 60, 8), gl.domElement.clientHeight - 200)}px`,
        }}
      >
        <CardContent className="space-y-2 p-4">
          <h3 className="text-sm font-semibold">{t(organInfo.displayNameKey)}</h3>
          <p className="text-xs text-muted-foreground">{t(organInfo.descriptionKey)}</p>
          <Button type="button" size="sm" className="w-full" onClick={handleContinue}>
            {t('viewer.flyCamera.continue')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify passes**

```powershell
npx vitest run src/components/viewer-v2/ui/__tests__/FlyCameraPopup.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```powershell
git add src/components/viewer-v2/ui/FlyCameraPopup.tsx src/components/viewer-v2/ui/__tests__/FlyCameraPopup.test.tsx
git commit -m "feat: add FlyCameraPopup component with organ info at screen position"
```

---

### Task 4: Create FlyCameraTour Wrapper

**Files:**
- Create: `src/components/viewer-v2/ui/FlyCameraTour.tsx`

- [ ] **Step 1: Create FlyCameraTour.tsx**

This component wraps the `FlyCameraPopup` inside a `<Canvas>` context (it uses `useThree` so must be rendered within the R3F tree). Since `ViewerV2Canvas` already wraps everything in `<Canvas>`, we just need to render `FlyCameraPopup` inside the canvas tree.

```typescript
import { FlyCameraPopup } from './FlyCameraPopup'

export function FlyCameraTour() {
  return <FlyCameraPopup />
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/components/viewer-v2/ui/FlyCameraTour.tsx
git commit -m "feat: add FlyCameraTour wrapper component"
```

---

### Task 5: Create AnnotationToolbar Component

**Files:**
- Create: `src/components/viewer-v2/ui/AnnotationToolbar.tsx`
- Create: `src/components/viewer-v2/ui/__tests__/AnnotationToolbar.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/components/viewer-v2/ui/__tests__/AnnotationToolbar.test.tsx`:

```typescript
import { renderStarter } from '@/test/starterRender'
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { ViewerV2Context } from '../../viewerV2Context'
import type { ViewerV2ContextValue } from '../../viewerV2Context'
import { AnnotationToolbar } from '../AnnotationToolbar'

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
    ...overrides,
  }
}

function renderToolbar(overrides: Partial<ViewerV2ContextValue> = {}) {
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
        <AnnotationToolbar />
      </ViewerV2Context.Provider>
    </StarterSettingsContext.Provider>,
  )
}

describe('AnnotationToolbar', () => {
  it('renders nothing when isDrawing is false', () => {
    const { container } = renderToolbar({ isDrawing: false })

    expect(container.innerHTML).toBe('')
  })

  it('renders pen, eraser, color, clear all, and exit buttons when drawing', () => {
    renderToolbar({ isDrawing: true })

    expect(screen.getByRole('button', { name: 'Pen' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Eraser' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Draw color red' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Exit Drawing' })).toBeInTheDocument()
  })

  it('highlights pen button when annotationTool is pen', () => {
    renderToolbar({ isDrawing: true, annotationTool: 'pen' })

    const penButton = screen.getByRole('button', { name: 'Pen' })
    expect(penButton.getAttribute('aria-pressed')).toBe('true')
  })

  it('highlights eraser button when annotationTool is eraser', () => {
    renderToolbar({ isDrawing: true, annotationTool: 'eraser' })

    const eraserButton = screen.getByRole('button', { name: 'Eraser' })
    expect(eraserButton.getAttribute('aria-pressed')).toBe('true')
  })

  it('calls setAnnotationTool when clicking pen or eraser', () => {
    const setAnnotationTool = vi.fn()
    renderToolbar({ isDrawing: true, annotationTool: 'pen', setAnnotationTool })

    fireEvent.click(screen.getByRole('button', { name: 'Eraser' }))

    expect(setAnnotationTool).toHaveBeenCalledWith('eraser')
  })

  it('calls setIsDrawing(false) on exit', () => {
    const setIsDrawing = vi.fn()
    renderToolbar({ isDrawing: true, setIsDrawing })

    fireEvent.click(screen.getByRole('button', { name: 'Exit Drawing' }))

    expect(setIsDrawing).toHaveBeenCalledWith(false)
  })
})
```

- [ ] **Step 2: Run test to verify failure**

```powershell
npx vitest run src/components/viewer-v2/ui/__tests__/AnnotationToolbar.test.tsx
```

Expected: FAIL (file not found)

- [ ] **Step 3: Create AnnotationToolbar.tsx**

```typescript
import { Eraser, PaintBrush, Palette, Trash, X } from '@phosphor-icons/react'

import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { createTranslator } from '@/lib/i18n'

import { useViewerV2 } from '../viewerV2Context'

export function AnnotationToolbar() {
  const {
    annotationTool,
    drawColor,
    isDrawing,
    setAnnotationTool,
    setDrawColor,
    setIsDrawing,
  } = useViewerV2()
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)

  if (!isDrawing) return null

  return (
    <div
      className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-lg border bg-background/95 p-1.5 shadow-lg backdrop-blur"
      role="toolbar"
      aria-label={t('viewer.menu.annotation')}
    >
      <Button
        type="button"
        variant={annotationTool === 'pen' ? 'secondary' : 'ghost'}
        size="sm"
        aria-pressed={annotationTool === 'pen'}
        aria-label={t('viewer.annotation.pen')}
        onClick={() => setAnnotationTool('pen')}
      >
        <PaintBrush className="h-4 w-4" aria-hidden />
      </Button>
      <Button
        type="button"
        variant={annotationTool === 'eraser' ? 'secondary' : 'ghost'}
        size="sm"
        aria-pressed={annotationTool === 'eraser'}
        aria-label={t('viewer.annotation.eraser')}
        onClick={() => setAnnotationTool('eraser')}
      >
        <Eraser className="h-4 w-4" aria-hidden />
      </Button>
      <div className="mx-0.5 h-5 w-px bg-border" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label={t('viewer.annotation.color', { color: drawColor })}
        onClick={() => {
          const input = document.createElement('input')
          input.type = 'color'
          input.value = drawColor
          input.addEventListener('input', (e) => {
            if (e.target instanceof HTMLInputElement) setDrawColor(e.target.value)
          })
          input.click()
        }}
      >
        <Palette className="h-4 w-4" aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label={t('viewer.annotation.clearAll')}
        onClick={() => {
          const canvas = document.querySelector('[data-viewer-canvas]')
          if (canvas) {
            const event = new CustomEvent('annotation-clear')
            canvas.dispatchEvent(event)
          }
        }}
      >
        <Trash className="h-4 w-4" aria-hidden />
      </Button>
      <div className="mx-0.5 h-5 w-px bg-border" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label={t('viewer.annotation.exit')}
        onClick={() => setIsDrawing(false)}
      >
        <X className="h-4 w-4" aria-hidden />
      </Button>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify passes**

```powershell
npx vitest run src/components/viewer-v2/ui/__tests__/AnnotationToolbar.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```powershell
git add src/components/viewer-v2/ui/AnnotationToolbar.tsx src/components/viewer-v2/ui/__tests__/AnnotationToolbar.test.tsx
git commit -m "feat: add AnnotationToolbar with pen, eraser, color, clear, and exit"
```

---

### Task 6: Upgrade Settings Panel with Quality, Volume, Voice

**Files:**
- Modify: `src/components/viewer-v2/ui/ViewerV2SettingsPanel.tsx` → extract into new file
- Modify: `src/components/viewer-v2/ui/ViewerV2Overlay.tsx` → use new component

The settings panel is currently defined inside `ViewerV2Overlay.tsx`. We'll extract it to a standalone component with the new sections.

- [ ] **Step 1: Check the current settings panel code**

The `ViewerV2SettingsPanel` is at lines 89-137 of `ViewerV2Overlay.tsx`. It's a function inside the overlay file.

- [ ] **Step 2: Create standalone ViewerV2SettingsPanel.tsx in ui/**

Create proper `src/components/viewer-v2/ui/ViewerV2SettingsPanel.tsx` (overwrite the inline version):

```typescript
import { SpeakerHigh, SpeakerX } from '@phosphor-icons/react'

import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { createTranslator } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import { useViewerV2 } from '../viewerV2Context'
import { ColorPickerPopover } from './ColorPickerPopover'

export function ViewerV2SettingsPanel() {
  const {
    backgroundColor,
    modelColor,
    qualityPreset,
    voice,
    volume,
    setActiveSheet,
    setBackgroundColor,
    setModelColor,
    setQualityPreset,
    setVoice,
    setVolume,
  } = useViewerV2()
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)

  return (
    <Card
      role="dialog"
      aria-modal="false"
      aria-labelledby="viewer-v2-settings-title"
      className="absolute right-4 top-4 z-20 w-80 bg-card/95 shadow-lg backdrop-blur"
    >
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id="viewer-v2-settings-title" className="text-sm font-semibold text-card-foreground">
            {t('viewer.settings.title')}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`${t('common.close')} ${t('viewer.menu.settings').toLowerCase()}`}
            onClick={() => setActiveSheet(null)}
          >
            {t('common.close')}
          </Button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">{t('viewer.settings.quality')}</Label>
            <RadioGroup
              value={qualityPreset}
              onValueChange={(v) => setQualityPreset(v as 'low' | 'medium' | 'high')}
              className="flex gap-1"
            >
              <div className={cn(
                'flex-1 rounded-md border px-3 py-2 text-center text-xs cursor-pointer transition-colors',
                qualityPreset === 'low' ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-accent',
              )}
              onClick={() => setQualityPreset('low')}
              role="radio"
              aria-checked={qualityPreset === 'low'}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setQualityPreset('low') } }}
              >
                {t('viewer.settings.quality.low')}
              </div>
              <div className={cn(
                'flex-1 rounded-md border px-3 py-2 text-center text-xs cursor-pointer transition-colors',
                qualityPreset === 'medium' ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-accent',
              )}
              onClick={() => setQualityPreset('medium')}
              role="radio"
              aria-checked={qualityPreset === 'medium'}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setQualityPreset('medium') } }}
              >
                {t('viewer.settings.quality.medium')}
              </div>
              <div className={cn(
                'flex-1 rounded-md border px-3 py-2 text-center text-xs cursor-pointer transition-colors',
                qualityPreset === 'high' ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-accent',
              )}
              onClick={() => setQualityPreset('high')}
              role="radio"
              aria-checked={qualityPreset === 'high'}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setQualityPreset('high') } }}
              >
                {t('viewer.settings.quality.high')}
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">{t('viewer.settings.volume')}</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label={t('viewer.settings.mute')}
                onClick={() => setVolume(volume === 0 ? 80 : 0)}
              >
                {volume === 0 ? <SpeakerX className="h-3.5 w-3.5" aria-hidden /> : <SpeakerHigh className="h-3.5 w-3.5" aria-hidden />}
              </Button>
              <Slider
                value={[volume]}
                onValueChange={([v]) => setVolume(v)}
                max={100}
                min={0}
                step={1}
                className="flex-1"
                aria-label={t('viewer.settings.volume')}
              />
              <span className="w-8 text-right text-xs text-muted-foreground">{volume}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">{t('viewer.settings.voice')}</Label>
            <RadioGroup
              value={voice}
              onValueChange={(v) => setVoice(v as 'bac' | 'trung' | 'nam')}
              className="flex gap-1"
            >
              <div className={cn(
                'flex-1 rounded-md border px-3 py-2 text-center text-xs cursor-pointer transition-colors',
                voice === 'bac' ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-accent',
              )}
              onClick={() => setVoice('bac')}
              role="radio"
              aria-checked={voice === 'bac'}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setVoice('bac') } }}
              >
                {t('viewer.settings.voice.bac')}
              </div>
              <div className={cn(
                'flex-1 rounded-md border px-3 py-2 text-center text-xs cursor-pointer transition-colors',
                voice === 'trung' ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-accent',
              )}
              onClick={() => setVoice('trung')}
              role="radio"
              aria-checked={voice === 'trung'}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setVoice('trung') } }}
              >
                {t('viewer.settings.voice.trung')}
              </div>
              <div className={cn(
                'flex-1 rounded-md border px-3 py-2 text-center text-xs cursor-pointer transition-colors',
                voice === 'nam' ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-accent',
              )}
              onClick={() => setVoice('nam')}
              role="radio"
              aria-checked={voice === 'nam'}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setVoice('nam') } }}
              >
                {t('viewer.settings.voice.nam')}
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="border-t pt-3">
          <Label className="mb-2 block text-xs font-medium">{t('viewer.settings.colors')}</Label>
          <div className="space-y-2">
            <ColorPickerPopover
              label={t('viewer.menu.modelColor')}
              value={modelColor}
              onChange={setModelColor}
            />
            <ColorPickerPopover
              label={t('viewer.menu.backgroundColor')}
              value={backgroundColor}
              onChange={setBackgroundColor}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Update ViewerV2Overlay.test.tsx for new settings fields**

The test `'renders essential localized controls'` in `ViewerV2Overlay.test.tsx` will need a type update for `createViewerValue`. We'll do that in Task 11 when we update the overlay.

For now, skip updating overlay tests -- we'll handle it in Task 11.

- [ ] **Step 3: Commit**

```powershell
git add src/components/viewer-v2/ui/ViewerV2SettingsPanel.tsx
git commit -m "feat: add quality preset, volume, and voice controls to settings panel"
```

---

### Task 7: Create Video Player Panel

**Files:**
- Create: `src/components/viewer-v2/ui/VideoPlayerPanel.tsx`
- Create: `src/components/viewer-v2/ui/__tests__/VideoPlayerPanel.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/components/viewer-v2/ui/__tests__/VideoPlayerPanel.test.tsx`:

```typescript
import { renderStarter } from '@/test/starterRender'
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { StarterSettingsContext } from '@/app/StarterSettingsContext'
import { DEFAULT_STARTER_SETTINGS } from '@/app/settingsStorage'
import { VideoPlayerPanel } from '../VideoPlayerPanel'

describe('VideoPlayerPanel', () => {
  it('renders close button', () => {
    const onClose = vi.fn()
    renderStarter(
      <StarterSettingsContext.Provider
        value={{
          appVersion: '0.1.0',
          locale: 'en',
          resolvedThemeMode: 'light',
          settings: DEFAULT_STARTER_SETTINGS,
          updateSettings: vi.fn(),
        }}
      >
        <VideoPlayerPanel onClose={onClose} />
      </StarterSettingsContext.Provider>,
    )

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    renderStarter(
      <StarterSettingsContext.Provider
        value={{
          appVersion: '0.1.0',
          locale: 'en',
          resolvedThemeMode: 'light',
          settings: DEFAULT_STARTER_SETTINGS,
          updateSettings: vi.fn(),
        }}
      >
        <VideoPlayerPanel onClose={onClose} />
      </StarterSettingsContext.Provider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('renders video element with controls', () => {
    const onClose = vi.fn()
    renderStarter(
      <StarterSettingsContext.Provider
        value={{
          appVersion: '0.1.0',
          locale: 'en',
          resolvedThemeMode: 'light',
          settings: DEFAULT_STARTER_SETTINGS,
          updateSettings: vi.fn(),
        }}
      >
        <VideoPlayerPanel onClose={onClose} />
      </StarterSettingsContext.Provider>,
    )

    const video = screen.getByRole('region', { name: 'Learning Video' })
    expect(video.querySelector('video')).toBeInTheDocument()
    expect(video.querySelector('video')).toHaveAttribute('controls')
  })
})
```

- [ ] **Step 2: Run test to verify failure**

```powershell
npx vitest run src/components/viewer-v2/ui/__tests__/VideoPlayerPanel.test.tsx
```

Expected: FAIL (file not found)

- [ ] **Step 3: Create VideoPlayerPanel.tsx**

```typescript
import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createTranslator } from '@/lib/i18n'

interface VideoPlayerPanelProps {
  onClose: () => void
}

export function VideoPlayerPanel({ onClose }: VideoPlayerPanelProps) {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)

  return (
    <Card
      role="region"
      aria-label={t('viewer.menu.video')}
      className="absolute left-1/2 top-4 z-20 w-[720px] max-w-[calc(100vw-2rem)] -translate-x-1/2 bg-card/95 shadow-lg backdrop-blur"
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-card-foreground">
            {t('viewer.menu.video')}
          </h2>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-md bg-black">
          <video
            className="h-full w-full"
            controls
            src="/videos/he-tieu-hoa.mp4"
          >
            <track kind="captions" />
            {t('viewer.video.fallback')}
          </video>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Run tests to verify passes**

```powershell
npx vitest run src/components/viewer-v2/ui/__tests__/VideoPlayerPanel.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```powershell
git add src/components/viewer-v2/ui/VideoPlayerPanel.tsx src/components/viewer-v2/ui/__tests__/VideoPlayerPanel.test.tsx
git commit -m "feat: add VideoPlayerPanel component"
```

---

### Task 8: Update Screenshot to OS-native

**Files:**
- Modify: `src/components/viewer-v2/ui/screenshot.ts`
- Modify: `src/components/viewer-v2/ui/__tests__/screenshot.test.ts`

- [ ] **Step 1: Update screenshot.ts**

Replace the entire file:

```typescript
export function captureScreenshot(): void {
  try {
    const isWindows = navigator.userAgent.includes('Windows')
    
    if (isWindows) {
      window.open('explorer ms-screenclip:', '_blank')
      return
    }

    const isMac = navigator.userAgent.includes('Mac')
    if (isMac) {
      const anchor = document.createElement('a')
      anchor.href = 'screencapture://'
      anchor.click()
      return
    }

    fallbackCanvasCapture()
  } catch {
    fallbackCanvasCapture()
  }
}

function fallbackCanvasCapture(): void {
  const element = document.querySelector('[data-viewer-canvas]')

  if (!(element instanceof HTMLCanvasElement)) {
    console.warn('Viewer canvas not found for screenshot')
    return
  }

  if (element.width <= 0 || element.height <= 0) {
    console.warn('Viewer canvas is empty for screenshot')
    return
  }

  try {
    const dataUrl = element.toDataURL('image/png')
    const anchor = document.createElement('a')
    const timestamp = new Date().toISOString().replaceAll(':', '-')
    anchor.href = dataUrl
    anchor.download = `hetieuhoa-screenshot-${timestamp}.png`
    anchor.click()
  } catch (error) {
    console.warn('Viewer screenshot capture failed', error)
  }
}
```

- [ ] **Step 2: Update screenshot.test.ts**

Replace the test file to test the new behavior:

```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { captureScreenshot } from '../screenshot'

describe('captureScreenshot', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('opens Windows snipping tool when on Windows', () => {
    const originalUserAgent = navigator.userAgent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0)',
      configurable: true,
    })
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    captureScreenshot()

    expect(windowOpenSpy).toHaveBeenCalledWith('explorer ms-screenclip:', '_blank')

    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true,
    })
    windowOpenSpy.mockRestore()
  })

  it('falls back to canvas capture when canvas element exists', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (X11; Linux)',
      configurable: true,
    })

    const canvas = document.createElement('canvas')
    const toDataURL = vi.fn().mockReturnValue('data:image/png;base64,abc123')
    const mockClick = vi.fn()
    const mockAnchor = {
      href: '',
      download: '',
      click: mockClick,
    } as unknown as HTMLAnchorElement

    vi.spyOn(document, 'querySelector').mockReturnValue(canvas)
    vi.spyOn(canvas, 'toDataURL').mockImplementation(toDataURL)
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor)
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2026-08-07T12:00:00.000Z')

    captureScreenshot()

    expect(toDataURL).toHaveBeenCalledWith('image/png')
    expect(mockAnchor.href).toBe('data:image/png;base64,abc123')
    expect(mockClick).toHaveBeenCalled()
  })

  it('logs a warning when fallback canvas is not found', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (X11; Linux)',
      configurable: true,
    })

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(document, 'querySelector').mockReturnValue(null)

    captureScreenshot()

    expect(warnSpy).toHaveBeenCalledWith('Viewer canvas not found for screenshot')
  })
})
```

- [ ] **Step 3: Run tests**

```powershell
npx vitest run src/components/viewer-v2/ui/__tests__/screenshot.test.ts
```

Expected: PASS

- [ ] **Step 4: Commit**

```powershell
git add src/components/viewer-v2/ui/screenshot.ts src/components/viewer-v2/ui/__tests__/screenshot.test.ts
git commit -m "feat: use OS-native screenshot tool with canvas fallback"
```

---

### Task 9: Upgrade PostProcessing with Quality Presets

**Files:**
- Modify: `src/components/viewer-v2/scene/PostProcessing.tsx`
- Modify: `src/components/viewer-v2/scene/__tests__/PostProcessing.test.tsx`

- [ ] **Step 1: Update PostProcessing.tsx**

```typescript
import { Bloom, EffectComposer, SSAO } from '@react-three/postprocessing'

import { useViewerV2 } from '../viewerV2Context'

const QUALITY_CONFIG = {
  low: { ssao: false, bloom: false, samples: 0 },
  medium: { ssao: true, bloom: true, samples: 8, intensity: 0.15, ssaoIntensity: 8, radius: 0.15 },
  high: { ssao: true, bloom: true, samples: 16, intensity: 0.3, ssaoIntensity: 15, radius: 0.1 },
} as const

export function PostProcessing() {
  const { qualityPreset } = useViewerV2()
  const config = QUALITY_CONFIG[qualityPreset]

  return (
    <EffectComposer multisampling={0}>
      {config.ssao ? (
        <SSAO
          samples={config.samples}
          radius={config.radius}
          intensity={config.ssaoIntensity}
          luminanceInfluence={0.5}
        />
      ) : null}
      {config.bloom ? (
        <Bloom
          intensity={config.intensity}
          luminanceThreshold={0.6}
          luminanceSmoothing={0.9}
        />
      ) : null}
    </EffectComposer>
  )
}
```

- [ ] **Step 2: Update PostProcessing test**

Replace `PostProcessing.test.tsx`:

```typescript
import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ViewerV2Provider } from '../../ViewerV2Provider'
import { PostProcessing } from '../PostProcessing'

const { bloomMock, effectComposerMock, ssaoMock } = vi.hoisted(() => ({
  bloomMock: vi.fn(() => null),
  effectComposerMock: vi.fn(({ children }) => <>{children}</>),
  ssaoMock: vi.fn(() => null),
}))

vi.mock('@react-three/postprocessing', () => ({
  Bloom: bloomMock,
  EffectComposer: effectComposerMock,
  SSAO: ssaoMock,
}))

describe('PostProcessing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders composer with bloom and ssao at medium quality', () => {
    render(
      <ViewerV2Provider>
        <PostProcessing />
      </ViewerV2Provider>,
    )

    expect(effectComposerMock).toHaveBeenCalled()
    expect(bloomMock).toHaveBeenCalledWith(
      expect.objectContaining({ intensity: 0.15 }),
      undefined,
    )
    expect(ssaoMock).toHaveBeenCalledWith(
      expect.objectContaining({
        samples: 8,
        intensity: 8,
        radius: 0.15,
      }),
      undefined,
    )
  })
})
```

- [ ] **Step 3: Run tests**

```powershell
npx vitest run src/components/viewer-v2/scene/__tests__/PostProcessing.test.tsx
```

Expected: PASS

- [ ] **Step 4: Commit**

```powershell
git add src/components/viewer-v2/scene/PostProcessing.tsx src/components/viewer-v2/scene/__tests__/PostProcessing.test.tsx
git commit -m "feat: consume quality preset in PostProcessing (ssao/bloom toggle)"
```

---

### Task 10: Upgrade EnvironmentLighting with Quality Presets

**Files:**
- Modify: `src/components/viewer-v2/scene/EnvironmentLighting.tsx`
- Modify: `src/components/viewer-v2/scene/__tests__/EnvironmentLighting.test.tsx`

- [ ] **Step 1: Update EnvironmentLighting.tsx**

```typescript
import { Environment } from '@react-three/drei'

import { useViewerV2 } from '../viewerV2Context'

const QUALITY_LIGHTING = {
  low: { environmentIntensity: 0.4, ambientIntensity: 0.3, mainLightIntensity: 0.8, shadows: false },
  medium: { environmentIntensity: 0.6, ambientIntensity: 0.4, mainLightIntensity: 1.2, shadows: true },
  high: { environmentIntensity: 0.8, ambientIntensity: 0.4, mainLightIntensity: 1.4, shadows: true },
} as const

const SHADOW_MAP_SIZES = {
  low: 512,
  medium: 1024,
  high: 2048,
} as const

export function EnvironmentLighting() {
  const { qualityPreset } = useViewerV2()
  const cfg = QUALITY_LIGHTING[qualityPreset]
  const shadowSize = SHADOW_MAP_SIZES[qualityPreset]

  return (
    <>
      <Environment preset="studio" environmentIntensity={cfg.environmentIntensity} />
      <ambientLight intensity={cfg.ambientIntensity} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={cfg.mainLightIntensity}
        castShadow={cfg.shadows}
        shadow-mapSize-width={shadowSize}
        shadow-mapSize-height={shadowSize}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-far={50}
      />
      <directionalLight position={[-5, 2, -3]} intensity={cfg.mainLightIntensity * 0.35} />
      <directionalLight position={[0, -2, 4]} intensity={cfg.mainLightIntensity * 0.2} />
    </>
  )
}
```

- [ ] **Step 2: Update EnvironmentLighting test**

Replace `src/components/viewer-v2/scene/__tests__/EnvironmentLighting.test.tsx`:

```typescript
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ViewerV2Provider } from '../../ViewerV2Provider'
import { EnvironmentLighting } from '../EnvironmentLighting'

const { environmentMock } = vi.hoisted(() => ({
  environmentMock: vi.fn(() => null),
}))

vi.mock('@react-three/drei', () => ({
  Environment: environmentMock,
}))

vi.mock('react/jsx-runtime', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react/jsx-runtime')>()
  return {
    ...actual,
    jsx: (type: unknown, props: Record<string, unknown>, key?: string) => {
      if (typeof type === 'string') {
        return actual.jsx('r3f-node', { 'data-node-type': type, ...props }, key)
      }
      return actual.jsx(type, props, key)
    },
    jsxs: (type: unknown, props: Record<string, unknown>, key?: string) => {
      if (typeof type === 'string') {
        return actual.jsxs('r3f-node', { 'data-node-type': type, ...props }, key)
      }
      return actual.jsxs(type, props, key)
    },
  }
})

vi.mock('react/jsx-dev-runtime', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react/jsx-dev-runtime')>()
  return {
    ...actual,
    jsxDEV: (
      type: unknown,
      props: Record<string, unknown>,
      key: string | undefined,
      isStaticChildren: boolean,
      source: unknown,
      self: unknown,
    ) => {
      if (typeof type === 'string') {
        const sourceKey =
          source && typeof source === 'object' && 'lineNumber' in source
            ? `${type}-${String(source.lineNumber)}`
            : type
        return actual.jsxDEV(
          'r3f-node',
          { 'data-node-type': type, ...props },
          key ?? sourceKey,
          isStaticChildren,
          source,
          self,
        )
      }
      return actual.jsxDEV(type, props, key, isStaticChildren, source, self)
    },
  }
})

describe('EnvironmentLighting', () => {
  it('renders the studio environment preset', () => {
    render(
      <ViewerV2Provider>
        <EnvironmentLighting />
      </ViewerV2Provider>,
    )

    expect(environmentMock).toHaveBeenCalledWith(
      expect.objectContaining({ preset: 'studio' }),
      undefined,
    )
  })

  it('renders ambient, key, fill, and rim lights at medium quality', () => {
    const { container } = render(
      <ViewerV2Provider>
        <EnvironmentLighting />
      </ViewerV2Provider>,
    )
    const lights = Array.from(container.querySelectorAll('r3f-node'))

    expect(lights).toHaveLength(4)
    expect(lights[0]).toHaveAttribute('data-node-type', 'ambientLight')
    expect(lights[0]).toHaveAttribute('intensity', '0.4')
    expect(lights[1]).toHaveAttribute('data-node-type', 'directionalLight')
    expect(lights[1]).toHaveAttribute('position', '5,8,5')
    expect(lights[1]).toHaveAttribute('intensity', '1.2')
    expect(lights[1]).toHaveAttribute('castShadow')
    expect(lights[1]).toHaveAttribute('shadow-mapSize-width', '1024')
  })

  it('does not attach arbitrary primitives to the scene', () => {
    const { container } = render(
      <ViewerV2Provider>
        <EnvironmentLighting />
      </ViewerV2Provider>,
    )

    expect(container.querySelector('[data-node-type="primitive"]')).toBeNull()
  })
})
```

- [ ] **Step 3: Run EnvironmentLighting tests**

```powershell
npx vitest run src/components/viewer-v2/scene/__tests__/EnvironmentLighting.test.tsx
```

Expected: PASS

- [ ] **Step 4: Commit**

```powershell
git add src/components/viewer-v2/scene/EnvironmentLighting.tsx src/components/viewer-v2/scene/__tests__/EnvironmentLighting.test.tsx
git commit -m "feat: consume quality preset in EnvironmentLighting (shadows, intensities)"
```

---

### Task 11: Add Locale Keys

**Files:**
- Modify: `src/lib/locales/en.json`
- Modify: `src/lib/locales/vi.json`

- [ ] **Step 1: Add new keys to en.json**

After line 86 (`"viewer.flyCamera.stopping"`), add:

```json
  "viewer.flyCamera.continue": "Continue",
  "viewer.flyCamera.organLabel": "Organ information",
```

After line 69 (`"viewer.settings.voice.nam"`), add quality keys:

```json
  "viewer.settings.quality": "Quality",
  "viewer.settings.quality.low": "Smooth",
  "viewer.settings.quality.medium": "Medium",
  "viewer.settings.quality.high": "High",
  "viewer.settings.mute": "Mute",
  "viewer.settings.colors": "Colors",
```

- [ ] **Step 2: Add new keys to vi.json**

After line 86 (`"viewer.flyCamera.stopping"`):

```json
  "viewer.flyCamera.continue": "Tiếp tục",
  "viewer.flyCamera.organLabel": "Thông tin cơ quan",
```

After line 68 (`"viewer.settings.voice.nam"`):

```json
  "viewer.settings.quality": "Chất lượng",
  "viewer.settings.quality.low": "Mượt",
  "viewer.settings.quality.medium": "Trung bình",
  "viewer.settings.quality.high": "Cao",
  "viewer.settings.mute": "Tắt tiếng",
  "viewer.settings.colors": "Màu sắc",
```

- [ ] **Step 3: Validate locales**

```powershell
pnpm l10n:validate
```

Expected: PASS

- [ ] **Step 4: Commit**

```powershell
git add src/lib/locales/en.json src/lib/locales/vi.json
git commit -m "feat: add locale keys for fly camera, quality, volume, and voice"
```

---

### Task 12: Wire Components in ViewerV2Overlay and SceneSetup

**Files:**
- Modify: `src/components/viewer-v2/ui/ViewerV2Overlay.tsx`
- Modify: `src/components/viewer-v2/scene/SceneSetup.tsx`
- Modify: `src/components/viewer-v2/ViewerV2Canvas.tsx`
- Modify: `src/components/viewer-v2/ui/__tests__/ViewerV2Overlay.test.tsx`

- [ ] **Step 1: Update ViewerV2Overlay.tsx**

Changes needed:
1. Import new components
2. Change the inline `ViewerV2SettingsPanel` to import the standalone one
3. Replace the video `PlaceholderDialog` with `VideoPlayerPanel`
4. Add `FlyCameraTour` rendering
5. Add `AnnotationToolbar` rendering
6. Update `createViewerValue` in test file to include new types

Import additions at top:

```typescript
import { AnnotationToolbar } from './AnnotationToolbar'
import { FlyCameraTour } from './FlyCameraTour'
import { ViewerV2SettingsPanel } from './ViewerV2SettingsPanel'
import { VideoPlayerPanel } from './VideoPlayerPanel'
```

Remove the inline `ViewerV2SettingsPanel` function (lines 89-137) entirely.

In the `VideoPlayerPanel` section replace:

```typescript
      {activeDialog === 'video' ? (
        <PlaceholderDialog
          titleKey="viewer.menu.video"
          placeholderKey="viewer.video.placeholder"
          onClose={() => setActiveDialog(null)}
        />
      ) : null}
```

With:

```typescript
      {activeSheet === 'video' ? (
        <VideoPlayerPanel onClose={() => setActiveSheet(null)} />
      ) : null}
```

Change the video button onClick from `() => setActiveDialog('video')` to `() => toggleSheet('video')` (note: video is now in ActiveSheet).

Before the closing `</>` of the return, add:

```typescript
      <FlyCameraTour />
      <AnnotationToolbar />
```

- [ ] **Step 2: Update SceneSetup.tsx**

Import and add `FlyCameraTour` inside the canvas tree (since it uses `useThree`):

Add import:
```typescript
import { FlyCameraTour } from '../ui/FlyCameraTour'
```

Add `<FlyCameraTour />` inside the `<Suspense>` block, after `<PostProcessing />`:

```typescript
            <PostProcessing />
            <FlyCameraTour />
```

- [ ] **Step 3: Update ViewerV2Canvas.tsx**

Import and pass quality preset to Canvas DPR:

```typescript
import { Loader } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

import { SceneSetup } from './scene/SceneSetup'
import { useViewerV2 } from './viewerV2Context'

const DPR_CONFIG = { low: 0.5, medium: 0.75, high: 1.0 } as const

export function ViewerV2Canvas() {
  const { qualityPreset } = useViewerV2()

  return (
    <div className="relative h-full min-h-[24rem] w-full overflow-hidden">
      <Canvas
        camera={{ position: [0, 2, 8], fov: 50 }}
        className="h-full w-full"
        data-viewer-canvas="true"
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        dpr={DPR_CONFIG[qualityPreset]}
      >
        <SceneSetup />
      </Canvas>
      <Loader
        containerStyles={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
```

- [ ] **Step 4: Update ViewerV2Overlay.test.tsx**

Update `createViewerValue` to include all new context fields:

```typescript
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
    ...overrides,
  }
}
```

Update the settings panel test to expect quality/volume/voice controls:

```typescript
  it('shows and closes the v2 settings panel with quality, volume, and voice', () => {
    const setActiveSheet = vi.fn()
    renderOverlay({ activeSheet: 'settings', setActiveSheet })

    const dialog = screen.getByRole('dialog', { name: 'Settings' })
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByText('Smooth')).toBeInTheDocument()
    expect(within(dialog).getByText('Medium')).toBeInTheDocument()
    expect(within(dialog).getByText('High')).toBeInTheDocument()
    expect(within(dialog).getByText('Northern')).toBeInTheDocument()
    expect(within(dialog).getByText('Central')).toBeInTheDocument()
    expect(within(dialog).getByText('Southern')).toBeInTheDocument()
    expect(within(dialog).getByText('Model Color')).toBeInTheDocument()
    expect(within(dialog).getByText('Background Color')).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Close settings' }))
    expect(setActiveSheet).toHaveBeenCalledWith(null)
  })
```

Update the video test:
```typescript
  it('shows and closes the video player panel', () => {
    const setActiveSheet = vi.fn()
    renderOverlay({ activeSheet: 'video', setActiveSheet })

    const panel = screen.getByRole('region', { name: 'Learning Video' })
    expect(panel).toBeInTheDocument()
    expect(panel.querySelector('video')).toBeInTheDocument()

    fireEvent.click(within(panel).getByRole('button', { name: 'Close' }))
    expect(setActiveSheet).toHaveBeenCalledWith(null)
  })
```

Remove the old `shows and closes the video placeholder dialog` test.

- [ ] **Step 5: Run all tests**

```powershell
npx vitest run
```

Expected: ALL PASS

- [ ] **Step 6: Run typecheck**

```powershell
npx tsc --noEmit
```

Expected: PASS

- [ ] **Step 7: Commit**

```powershell
git add src/components/viewer-v2/ui/ViewerV2Overlay.tsx src/components/viewer-v2/scene/SceneSetup.tsx src/components/viewer-v2/ViewerV2Canvas.tsx src/components/viewer-v2/ui/__tests__/ViewerV2Overlay.test.tsx
git commit -m "feat: wire FlyCameraTour, VideoPlayerPanel, AnnotationToolbar, and quality DPR into overlay and scene"
```

---

### Task 13: Build and Smoke Test

**Files:**
- Run commands only

- [ ] **Step 1: Run full lint**

```powershell
pnpm lint
```

Expected: PASS (no warnings)

- [ ] **Step 2: Run full typecheck**

```powershell
npx tsc --noEmit
```

Expected: PASS

- [ ] **Step 3: Run all tests with coverage**

```powershell
pnpm test:coverage
```

Expected: PASS, coverage maintained or improved

- [ ] **Step 4: Build**

```powershell
pnpm build
```

Expected: PASS

- [ ] **Step 5: Run playwright smoke tests**

```powershell
pnpm playwright:smoke
```

Expected: PASS

- [ ] **Step 6: Commit if anything changed**

Only if needed (lint fixes etc):

```powershell
git add -u
git commit -m "chore: final lint and test fixes for menu upgrade"
```
