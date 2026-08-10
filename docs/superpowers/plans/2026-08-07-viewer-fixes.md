# Viewer Fixes & Improvements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 7 viewer issues: auto-rotate, separate color buttons, floating return-to-overview, remove DOF blur, placeholder dialogs for all features, screenshot, remove debug toggle.

**Architecture:** Modify `CameraController` for auto-rotate, restructure `ViewerV2Overlay` for new UI layout and dialog rendering, remove `DepthOfField` from `PostProcessing`, add reusable `PlaceholderDialog` component and `screenshot.ts` utility, update locales.

**Tech Stack:** React 19, TypeScript, React Three Fiber, @phosphor-icons/react, shadcn/ui, Vitest

---

### Task 1: Remove DepthOfField from PostProcessing

**Files:**
- Modify: `src/components/viewer-v2/scene/PostProcessing.tsx`

- [ ] **Step 1: Remove CameraDepthOfField component**

Remove the `CameraDepthOfField` function and its `<CameraDepthOfField />` usage from `PostProcessing.tsx`. The file should end up as:

```tsx
import { Bloom, EffectComposer, SSAO } from '@react-three/postprocessing'

export function PostProcessing() {
  return (
    <EffectComposer multisampling={0}>
      <SSAO
        samples={16}
        radius={0.1}
        intensity={15}
        luminanceInfluence={0.5}
      />
      <Bloom
        intensity={0.3}
        luminanceThreshold={0.6}
        luminanceSmoothing={0.9}
      />
    </EffectComposer>
  )
}
```

Also remove the import for `useViewerV2` (no longer needed).

- [ ] **Step 2: Run typecheck**

```bash
npx tsc --noEmit
```
Expected: no errors in `PostProcessing.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/viewer-v2/scene/PostProcessing.tsx
git commit -m "fix: remove DepthOfField causing close-up blur in viewer"
```

---

### Task 2: Add Auto-Rotate to CameraController

**Files:**
- Modify: `src/components/viewer-v2/camera/CameraController.tsx`
- Modify: `src/components/viewer-v2/camera/__tests__/CameraController.test.tsx`

- [ ] **Step 1: Write failing test for auto-rotate**

Add to `CameraController.test.tsx` after the existing tests:

```typescript
  it('enables autoRotate on OrbitControls when isSpinning is true', () => {
    renderWithViewerContext(<CameraController />, { isSpinning: true })

    expect(orbitControlsMock).toHaveBeenCalledWith(
      expect.objectContaining({ autoRotate: true, autoRotateSpeed: 1.0 }),
      undefined,
    )
  })

  it('disables autoRotate on OrbitControls when isSpinning is false', () => {
    renderWithViewerContext(<CameraController />, { isSpinning: false })

    expect(orbitControlsMock).toHaveBeenCalledWith(
      expect.objectContaining({ autoRotate: false }),
      undefined,
    )
  })

  it('disables autoRotate while transitioning even if isSpinning is true', () => {
    renderWithViewerContext(<CameraController />, { isSpinning: true, isTransitioning: true })

    expect(orbitControlsMock).toHaveBeenCalledWith(
      expect.objectContaining({ autoRotate: false }),
      undefined,
    )
  })
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/viewer-v2/camera/__tests__/CameraController.test.tsx
```
Expected: 3 new tests FAIL.

- [ ] **Step 3: Implement auto-rotate in CameraController**

In `CameraController.tsx`, read `isSpinning` from context and pass `autoRotate`/`autoRotateSpeed` props to `OrbitControls`.

Add `isSpinning` to the context destructuring:

```typescript
const {
    cameraTarget,
    flyCameraActive,
    isSpinning,        // add this
    isTransitioning,
    // ... rest
} = useViewerV2()
```

Modify the `OrbitControls` return:

```tsx
<OrbitControls
  ref={controlsRef}
  enabled={!isTransitioning}
  target={DEFAULT_TARGET.toArray()}
  minDistance={1}
  maxDistance={20}
  makeDefault
  autoRotate={isSpinning && !isTransitioning}
  autoRotateSpeed={1.0}
/>
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/components/viewer-v2/camera/__tests__/CameraController.test.tsx
```
Expected: all tests PASS (existing + 3 new).

- [ ] **Step 5: Run typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add src/components/viewer-v2/camera/CameraController.tsx src/components/viewer-v2/camera/__tests__/CameraController.test.tsx
git commit -m "feat: implement auto-rotate model via isSpinning state"
```

---

### Task 3: Create PlaceholderDialog Component

**Files:**
- Create: `src/components/viewer-v2/ui/PlaceholderDialog.tsx`
- Create: `src/components/viewer-v2/ui/__tests__/PlaceholderDialog.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/components/viewer-v2/ui/__tests__/PlaceholderDialog.test.tsx`:

```typescript
import { renderStarter } from '@/test/starterRender'
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { PlaceholderDialog } from '../PlaceholderDialog'

describe('PlaceholderDialog', () => {
  it('renders the title and placeholder body', () => {
    renderStarter(
      <PlaceholderDialog titleKey="viewer.quiz.title" placeholderKey="viewer.quiz.placeholder" onClose={vi.fn()} />,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Quiz')).toBeInTheDocument()
    expect(screen.getByText('This feature is under development.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    renderStarter(
      <PlaceholderDialog titleKey="viewer.quiz.title" placeholderKey="viewer.quiz.placeholder" onClose={onClose} />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/viewer-v2/ui/__tests__/PlaceholderDialog.test.tsx
```
Expected: FAIL — module not found or component not exported.

- [ ] **Step 3: Implement PlaceholderDialog**

Create `src/components/viewer-v2/ui/PlaceholderDialog.tsx`:

```typescript
import { useStarterSettings } from '@/app/StarterSettingsContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createTranslator, type TranslationKey } from '@/lib/i18n'

interface PlaceholderDialogProps {
  titleKey: TranslationKey
  placeholderKey?: TranslationKey
  onClose: () => void
}

export function PlaceholderDialog({ titleKey, placeholderKey, onClose }: PlaceholderDialogProps) {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)

  return (
    <Card
      role="dialog"
      aria-modal="false"
      className="absolute right-4 top-4 z-20 w-80 bg-card/95 shadow-lg backdrop-blur"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold">{t(titleKey)}</CardTitle>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {t('common.close')}
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {placeholderKey ? t(placeholderKey) : t('viewer.chatbot.placeholderBody')}
        </p>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/components/viewer-v2/ui/__tests__/PlaceholderDialog.test.tsx
```
Expected: 2 tests PASS.

- [ ] **Step 5: Run typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add src/components/viewer-v2/ui/PlaceholderDialog.tsx src/components/viewer-v2/ui/__tests__/PlaceholderDialog.test.tsx
git commit -m "feat: add reusable PlaceholderDialog component"
```

---

### Task 4: Create Screenshot Utility

**Files:**
- Create: `src/components/viewer-v2/ui/screenshot.ts`
- Create: `src/components/viewer-v2/ui/__tests__/screenshot.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/components/viewer-v2/ui/__tests__/screenshot.test.ts`:

```typescript
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { captureScreenshot } from '../screenshot'

describe('captureScreenshot', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('downloads a PNG from the viewer canvas', () => {
    const toDataURL = vi.fn().mockReturnValue('data:image/png;base64,abc123')
    const mockClick = vi.fn()
    const mockAnchor = { href: '', download: '', click: mockClick } as unknown as HTMLAnchorElement

    vi.spyOn(document, 'querySelector').mockReturnValue({
      toDataURL,
    } as unknown as HTMLCanvasElement)
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor)
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2026-08-07T12-00-00.000Z')

    captureScreenshot()

    expect(toDataURL).toHaveBeenCalledWith('image/png')
    expect(mockAnchor.href).toBe('data:image/png;base64,abc123')
    expect(mockAnchor.download).toBe('hetieuhoa-screenshot-2026-08-07T12-00-00.000Z.png')
    expect(mockClick).toHaveBeenCalled()
  })

  it('logs a warning when canvas is not found', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(document, 'querySelector').mockReturnValue(null)

    captureScreenshot()

    expect(warnSpy).toHaveBeenCalledWith('Viewer canvas not found for screenshot')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/viewer-v2/ui/__tests__/screenshot.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement screenshot utility**

Create `src/components/viewer-v2/ui/screenshot.ts`:

```typescript
export function captureScreenshot(): void {
  const canvas = document.querySelector('[data-viewer-canvas]') as HTMLCanvasElement | null

  if (!canvas) {
    console.warn('Viewer canvas not found for screenshot')
    return
  }

  const dataUrl = canvas.toDataURL('image/png')
  const anchor = document.createElement('a')
  anchor.href = dataUrl
  anchor.download = `hetieuhoa-screenshot-${new Date().toISOString()}.png`
  anchor.click()
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/components/viewer-v2/ui/__tests__/screenshot.test.ts
```
Expected: 2 tests PASS.

- [ ] **Step 5: Run typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add src/components/viewer-v2/ui/screenshot.ts src/components/viewer-v2/ui/__tests__/screenshot.test.ts
git commit -m "feat: add screenshot capture utility"
```

---

### Task 5: Add New Locale Keys

**Files:**
- Modify: `src/lib/locales/en.json`
- Modify: `src/lib/locales/vi.json`

- [ ] **Step 1: Add keys to en.json**

After `"viewer.colorPicker.reset": "Default",` (line 82), insert:

```json
"viewer.placeholder.underDevelopment": "This feature is under development.",
```

After `"viewer.flyCamera.stopping": "Stopping fly camera...",` (line 83), insert:

```json
"viewer.screenshot.saved": "Screenshot saved",
"viewer.menu.modelColor.short": "Model",
"viewer.menu.backgroundColor.short": "Background",
```

- [ ] **Step 2: Add keys to vi.json**

After `"viewer.colorPicker.reset": "Mặc định",` (line 82), insert:

```json
"viewer.placeholder.underDevelopment": "Tính năng đang được phát triển.",
```

After `"viewer.flyCamera.stopping": "Đang dừng fly camera...",` (line 83), insert:

```json
"viewer.screenshot.saved": "Đã chụp màn hình",
"viewer.menu.modelColor.short": "Mô hình",
"viewer.menu.backgroundColor.short": "Nền",
```

- [ ] **Step 3: Run l10n validation**

```bash
pnpm l10n:validate
```
Expected: no errors, key sets match between en and vi.

- [ ] **Step 4: Commit**

```bash
git add src/lib/locales/en.json src/lib/locales/vi.json
git commit -m "feat: add placeholder and screenshot locale keys"
```

---

### Task 6: Restructure ViewerV2Overlay

**Files:**
- Modify: `src/components/viewer-v2/ui/ViewerV2Overlay.tsx`
- Modify: `src/components/viewer-v2/ui/__tests__/ViewerV2Overlay.test.tsx`

This is the largest change. We will:
1. Add `PaintBucket` and `Image` icon imports
2. Remove the two `ColorPickerPopover` from the expanded menu block
3. Add `modelColor` and `backgroundColor` as `MenuButtonDef` entries in `modelInteractionButtons`
4. Remove the "Return to overview" button from the sidebar
5. Add a floating `House` button at top-right (visible only when `selectedOrgan !== null`)
6. Remove the debug mesh toggle button
7. Add render blocks for `activeDialog` (`info`, `quiz`, `genai`, `video`) and `activeSheet === 'chatbot'`
8. Wire screenshot onClick
9. Update tests

- [ ] **Step 1: Update imports in ViewerV2Overlay.tsx**

Add `Image` and `PaintBucket` to the `@phosphor-icons/react` import:

```typescript
import {
  // ... existing imports
  Image,
  PaintBucket,
  // ... rest
} from '@phosphor-icons/react'
```

Add new imports at top:

```typescript
import { PlaceholderDialog } from './PlaceholderDialog'
import { captureScreenshot } from './screenshot'
```

- [ ] **Step 2: Add color buttons to modelInteractionButtons group**

Add state for tracking which color popover is open in `ViewerV2Overlay` component body:

```typescript
const [colorPopoverTarget, setColorPopoverTarget] = useState<'model' | 'background' | null>(null)
```

Add to `modelInteractionButtons` array (after `flyCamera` entry), inserting before the closing `]`:

```typescript
{
  id: 'modelColor',
  label: t('viewer.menu.modelColor.short'),
  icon: PaintBucket,
  onClick: () => setColorPopoverTarget(colorPopoverTarget === 'model' ? null : 'model'),
  active: colorPopoverTarget === 'model',
},
{
  id: 'backgroundColor',
  label: t('viewer.menu.backgroundColor.short'),
  icon: Image,
  onClick: () => setColorPopoverTarget(colorPopoverTarget === 'background' ? null : 'background'),
  active: colorPopoverTarget === 'background',
},
```

- [ ] **Step 3: Remove old color pickers and return-to-overview button from sidebar**

Remove this entire block (lines 279-296 of the current file):

```tsx
{isMenuOpen ? (
  <>
    <Button type="button" variant="ghost" className="w-full justify-start gap-2" onClick={requestViewReset}>
      <House className="h-4 w-4 shrink-0" aria-hidden />
      {t('viewer.returnToOverview')}
    </Button>
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
  </>
) : null}
```

Also remove the unused `backgroundColor`, `modelColor`, `setBackgroundColor`, `setModelColor` from the destructured context (lines 141, 148, 153, 158) if they're only used in the removed block. Keep `requestViewReset` since it's used elsewhere.

Actually, `backgroundColor` is still used for the settings panel. Keep it. Let me check: `modelColor` and `setModelColor` are still used in the `ColorPickerPopover` for the floating popover. `setBackgroundColor` and `backgroundColor` are used in settings panel. So keep all.

Wait, but we removed the old color pickers and are adding them as menu buttons. The floating popover still needs the state. Keep all context variables.

- [ ] **Step 4: Remove debug mesh toggle button**

Remove this block (lines 301-314):

```tsx
<div className="space-y-0.5 px-2">
  <Button
    type="button"
    variant="ghost"
    size={isMenuOpen ? 'default' : 'icon'}
    className={cn('w-full justify-start gap-2', !isMenuOpen && 'h-9 w-9 justify-center')}
    onClick={() => setIsDebugPanelOpen(!isDebugPanelOpen)}
  >
    <Info className="h-4 w-4 shrink-0" aria-hidden />
    <span className={cn('truncate', !isMenuOpen && 'sr-only')}>
      {t(isDebugPanelOpen ? 'viewer.debug.hide' : 'viewer.debug.show')}
    </span>
  </Button>
</div>
```

- [ ] **Step 5: Wire screenshot button onClick**

In the `toolsButtons` array, change the screenshot entry from:

```typescript
{ id: 'screenshot', label: t('viewer.menu.screenshot'), icon: Camera, onClick: () => {} },
```

to:

```typescript
{ id: 'screenshot', label: t('viewer.menu.screenshot'), icon: Camera, onClick: () => captureScreenshot() },
```

- [ ] **Step 6: Add floating return-to-overview button**

Add after the sidebar div's closing `</div>` and before `{activeSheet === 'settings' ? ...}`, insert:

```tsx
{selectedOrgan ? (
  <Button
    type="button"
    variant="outline"
    size="icon"
    className="absolute right-4 top-4 z-20 rounded-full bg-background/80 backdrop-blur"
    aria-label={t('viewer.returnToOverview')}
    onClick={requestViewReset}
  >
    <House className="h-4 w-4" aria-hidden />
  </Button>
) : null}
```

- [ ] **Step 7: Render color popover when a color button is active**

After the floating return button and before the settings panel check, add:

```tsx
{colorPopoverTarget ? (
  <div className="absolute left-[60px] top-[140px] z-20">
    <ColorPickerPopover
      label={colorPopoverTarget === 'model' ? t('viewer.colorPicker.modelTitle') : t('viewer.colorPicker.backgroundTitle')}
      value={colorPopoverTarget === 'model' ? modelColor : backgroundColor}
      onChange={(color) => {
        if (colorPopoverTarget === 'model') {
          setModelColor(color)
        } else {
          setBackgroundColor(color)
        }
        setColorPopoverTarget(null)
      }}
    />
  </div>
) : null}
```

Wait — `ColorPickerPopover` uses `Popover` internally, so it will handle its own rendering. The issue is that in `MenuButtonDef`, clicking the button toggles the popover. But `ColorPickerPopover` itself renders inside a `Popover` which would need to be controlled. Let me rethink.

Actually, looking at `ColorPickerPopover`, its popover is self-contained — it uses `PopoverTrigger` and `PopoverContent`. So it's not a good fit for a `MenuButtonDef` since the popover opens inline. 

Better approach: Instead of making them `MenuButtonDef` entries, add a dedicated section in the sidebar with color buttons that trigger popovers. Or simpler: put the `ColorPickerPopover` components directly below `ViewerV2MenuGroup` for model interaction, always visible (both when collapsed and expanded).

Actually, let me reconsider. The user said "tách nút đổi màu nền và đổi màu mô hình ra làm 2". The simplest approach that works:

Put both `ColorPickerPopover` components directly in the sidebar markup (not inside `isMenuOpen` block), after the model interaction menu group. When menu is collapsed, they show only the color dot (using the icon variant).

Let me revise this approach. Actually the `ColorPickerPopover` already handles its own rendering via `Popover`, so we just need to place it in the sidebar. When collapsed, we need it to show compact.

Let me simplify: put two ColorPickerPopover after the `ViewerV2MenuGroup` for modelInteraction, always visible. When collapsed, use `size="icon"` style via Button variant.

Actually, looking more carefully at the current code (lines 277-297), the `ViewerV2MenuGroup` for modelInteraction is at line 277, and immediately after it (lines 278-297) is a `<div>` with the old return button and color pickers inside `isMenuOpen` check. I'll replace lines 278-297 with just the two `ColorPickerPopover`:

```tsx
<div className="space-y-0.5 px-2">
  <ColorPickerPopover
    label={isMenuOpen ? t('viewer.menu.modelColor') : ''}
    value={modelColor}
    onChange={setModelColor}
  />
  <ColorPickerPopover
    label={isMenuOpen ? t('viewer.menu.backgroundColor') : ''}
    value={backgroundColor}
    onChange={setBackgroundColor}
  />
</div>
```

But `ColorPickerPopover` uses `Button variant="outline"` and wraps in a Popover, so it will show the label + color dot. When collapsed, we want just the color dot. Let me adjust: pass `collapsed` prop or just check if label is empty.

Actually, the simpler thing is to just replicate the pattern. When `isMenuOpen`, show full label. When collapsed, only show icon style. Let me just make the `ColorPickerPopover` accept an optional `iconOnly` prop and adjust Button styles.

Hmm, this is getting complex for the plan. Let me keep it simple: the two `ColorPickerPopover` components go in the sidebar below model interaction group, with `isMenuOpen` controlling what they look like. I'll adjust `ColorPickerPopover` to accept a `collapsed` prop that controls if label is shown or hidden.

Actually the simplest: just place them with `isMenuOpen ? <full_label> : <empty_label_or_icon_only>`. But `ColorPickerPopover` already has a button with the label text - I can just pass `label=""` when collapsed and CSS `sr-only` won't work because the button doesn't use that pattern.

Let me take the simplest approach: pass a `collapsed` boolean to `ColorPickerPopover`, use it to hide the label text with `sr-only` class.

So I need to modify `ColorPickerPopover.tsx` too. Let me add that to this task.

OK, let me revise Task 6 to include `ColorPickerPopover` changes, and remove the `MenuButtonDef` approach for colors.

Let me rewrite the task 6 more carefully.

- [ ] **Step 6a: Update ColorPickerPopover to support collapsed state**

In `ColorPickerPopover.tsx`, add `collapsed` prop:

```typescript
interface ColorPickerPopoverProps {
  label: string
  value: string | null
  onChange: (color: string) => void
  presets?: string[]
  collapsed?: boolean
}
```

Destructure `collapsed` and use it:

```typescript
export function ColorPickerPopover({
  label,
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  collapsed = false,
}: ColorPickerPopoverProps) {
```

In the Button, change:

```tsx
<Button type="button" variant="outline" className="justify-start gap-2">
  <span
    aria-hidden="true"
    className="size-3 rounded-full border border-border"
    style={{ backgroundColor: value ?? 'transparent' }}
  />
  {label}
</Button>
```

to:

```tsx
<Button
  type="button"
  variant={collapsed ? 'ghost' : 'outline'}
  size={collapsed ? 'icon' : 'default'}
  className={cn('justify-start gap-2', collapsed && 'h-9 w-9 justify-center')}
  title={collapsed ? label : undefined}
>
  <span
    aria-hidden="true"
    className="size-3 rounded-full border border-border"
    style={{ backgroundColor: value ?? 'transparent' }}
  />
  <span className={cn(collapsed && 'sr-only')}>{label}</span>
</Button>
```

Import `cn` from `@/lib/utils` (already imported? Check the file — no, need to add).

- [ ] **Step 6b: Restructure sidebar in ViewerV2Overlay**

Replace lines 277-297 (the block after modelInteraction group with return-to-overview + color pickers) with just the two `ColorPickerPopover` components and the new floating return button logic:

```tsx
<ViewerV2MenuGroup title={t('viewer.menu.group.modelInteraction')} buttons={modelInteractionButtons} collapsed={!isMenuOpen} />
<div className="space-y-0.5 px-2">
  <ColorPickerPopover
    label={t('viewer.menu.modelColor')}
    value={modelColor}
    onChange={setModelColor}
    collapsed={!isMenuOpen}
  />
  <ColorPickerPopover
    label={t('viewer.menu.backgroundColor')}
    value={backgroundColor}
    onChange={setBackgroundColor}
    collapsed={!isMenuOpen}
  />
</div>
```

- [ ] **Step 6c: Remove unused imports**

Remove `isDebugPanelOpen`, `setIsDebugPanelOpen`, `Info` from destructured context and imports since they're no longer used in the overlay. Remove `Card`, `CardContent` from unused imports related to the debug panel if no longer needed.

Actually, keep `Info` since OrganInfoCard still uses it elsewhere. But remove `isDebugPanelOpen` and `setIsDebugPanelOpen` from the destructured context in `ViewerV2Overlay`.

- [ ] **Step 6d: Add floating return button and dialog renders**

After the sidebar closing `</div>`, add:

```tsx
{selectedOrgan ? (
  <Button
    type="button"
    variant="outline"
    size="icon"
    className="absolute right-4 top-4 z-20 rounded-full bg-background/80 shadow backdrop-blur"
    aria-label={t('viewer.returnToOverview')}
    onClick={requestViewReset}
  >
    <House className="h-4 w-4" aria-hidden />
  </Button>
) : null}
```

- [ ] **Step 6e: Add dialog/sheet renders**

After the floating return button, add:

```tsx
{activeSheet === 'settings' ? <ViewerV2SettingsPanel /> : null}
{activeSheet === 'chatbot' ? (
  <PlaceholderDialog
    titleKey="viewer.chatbot.title"
    placeholderKey="viewer.chatbot.placeholderBody"
    onClose={() => setActiveSheet(null)}
  />
) : null}
{activeDialog === 'info' ? (
  <PlaceholderDialog
    titleKey="viewer.info.title"
    placeholderKey="viewer.info.description"
    onClose={() => setActiveDialog(null)}
  />
) : null}
{activeDialog === 'quiz' ? (
  <PlaceholderDialog
    titleKey="viewer.quiz.title"
    placeholderKey="viewer.quiz.placeholder"
    onClose={() => setActiveDialog(null)}
  />
) : null}
{activeDialog === 'genai' ? (
  <PlaceholderDialog
    titleKey="viewer.genai.title"
    placeholderKey="viewer.genai.placeholder"
    onClose={() => setActiveDialog(null)}
  />
) : null}
{activeDialog === 'video' ? (
  <PlaceholderDialog
    titleKey="viewer.menu.video"
    placeholderKey="viewer.video.placeholder"
    onClose={() => setActiveDialog(null)}
  />
) : null}
```

- [ ] **Step 6f: Update tests**

Update `ViewerV2Overlay.test.tsx` to reflect the new layout:

1. The "Return to overview" button is no longer in the sidebar — it's a floating button at top-right. When `selectedOrgan` is null, it's not rendered. Update test that checks for it.

2. Remove test assertion for debug mesh toggle.

3. Add test for floating return button visibility:
```typescript
it('shows floating return-to-overview button when an organ is selected', () => {
  renderOverlay({ selectedOrgan: 'gan' })
  expect(screen.getByRole('button', { name: 'Return to overview' })).toBeInTheDocument()
})

it('hides floating return-to-overview button when no organ is selected', () => {
  renderOverlay({ selectedOrgan: null })
  expect(screen.queryByRole('button', { name: 'Return to overview' })).not.toBeInTheDocument()
})
```

4. Add test for placeholder dialogs:
```typescript
it('renders info placeholder dialog when activeDialog is info', () => {
  renderOverlay({ activeDialog: 'info' })
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getByText('Human Digestive System')).toBeInTheDocument()
})

it('renders quiz placeholder dialog when activeDialog is quiz', () => {
  renderOverlay({ activeDialog: 'quiz' })
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getByText('Quiz')).toBeInTheDocument()
})

it('renders chatbot placeholder when activeSheet is chatbot', () => {
  renderOverlay({ activeSheet: 'chatbot' })
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getByText('AI Chatbot')).toBeInTheDocument()
})
```

5. Update the "renders essential controls" test to remove the "Return to overview" and "Show mesh debug" assertions, and add color picker assertions.

6. Update the "updates v2 state" test to remove the "Return to overview" button click test (since it's not rendered when selectedOrgan is null).

- [ ] **Step 6g: Run tests**

```bash
npx vitest run src/components/viewer-v2/ui/__tests__/ViewerV2Overlay.test.tsx src/components/viewer-v2/ui/__tests__/PlaceholderDialog.test.tsx
```
Expected: all tests PASS.

- [ ] **Step 6h: Run typecheck and lint**

```bash
npx tsc --noEmit
pnpm lint
```

- [ ] **Step 6i: Commit**

```bash
git add src/components/viewer-v2/ui/ViewerV2Overlay.tsx src/components/viewer-v2/ui/__tests__/ViewerV2Overlay.test.tsx src/components/viewer-v2/ui/ColorPickerPopover.tsx
git commit -m "feat: restructure viewer overlay - separate color buttons, floating return, dialogs, screenshot, remove debug toggle"
```

---

### Task 7: Final Verification

**Files:**
- None (verification only)

- [ ] **Step 1: Run full test suite**

```bash
npx vitest run
```
Expected: all tests PASS.

- [ ] **Step 2: Run typecheck**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Run lint**

```bash
pnpm lint
```
Expected: no warnings.

- [ ] **Step 4: Run l10n validation**

```bash
pnpm l10n:validate
```
Expected: no errors.

- [ ] **Step 5: Run build**

```bash
pnpm build
```
Expected: build succeeds.

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Remove DepthOfField | `PostProcessing.tsx` |
| 2 | Auto-rotate model | `CameraController.tsx`, test |
| 3 | PlaceholderDialog component | `PlaceholderDialog.tsx` (new), test |
| 4 | Screenshot utility | `screenshot.ts` (new), test |
| 5 | Locale keys | `en.json`, `vi.json` |
| 6 | Restructure overlay | `ViewerV2Overlay.tsx`, `ColorPickerPopover.tsx`, overlay test |
| 7 | Final verification | All tests, typecheck, lint, build |
