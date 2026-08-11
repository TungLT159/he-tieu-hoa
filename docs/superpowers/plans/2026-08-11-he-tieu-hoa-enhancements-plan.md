# He Tieu Hoa App Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply 7 enhancements: rename app, change icon, fix screenshot trigger, fixed viewport chatbot, typewriter animation, organ orbit camera, reset color button.

**Architecture:** String replacements across 12 files for renaming. Tauri Rust command change for screenshot. React component refactoring for AI panel layout + typewriter hook. CameraController imperative orbit target fix. ColorPickerPopover reset button addition.

**Tech Stack:** React 19, TypeScript, Tauri 2, Rust, shadcn/ui, React Three Fiber, drei OrbitControls, Tailwind CSS v4

**Design Spec:** `docs/superpowers/specs/2026-08-11-he-tieu-hoa-enhancements-design.md`

---

### Task 1: Rename App (config + locales)

**Files:**
- Modify: `src/lib/locales/en.json`
- Modify: `src/lib/locales/vi.json`
- Modify: `index.html`
- Modify: `src-tauri/tauri.conf.json`
- Modify: `src-tauri/src/lib.rs`
- Modify: `docs/ARCHITECTURE.md`
- Modify: `docs/superpowers/specs/2026-07-10-components-gallery-expansion-design.md`

- [ ] **Step 1: Update locale files**

In `src/lib/locales/en.json` line 2, change:
```
"app.name": "Starter-Tauri-App",
```
to:
```
"app.name": "Phần mềm 3D Hệ tiêu hóa",
```

In `src/lib/locales/vi.json` line 2, same change.

- [ ] **Step 2: Update index.html title**

In `index.html` line 48, change:
```html
<title>Starter-Tauri-App</title>
```
to:
```html
<title>Phần mềm 3D Hệ tiêu hóa</title>
```

- [ ] **Step 3: Update tauri.conf.json**

In `src-tauri/tauri.conf.json`:
- Line 3: change `"productName": "Starter-Tauri-App"` to `"productName": "Phần mềm 3D Hệ tiêu hóa"`
- Line 16: change `"title": "Starter-Tauri-App"` to `"title": "Phần mềm 3D Hệ tiêu hóa"`

- [ ] **Step 4: Update Rust lib.rs**

In `src-tauri/src/lib.rs` line 102, change:
```rust
.expect("error while running Starter-Tauri-App");
```
to:
```rust
.expect("error while running Phần mềm 3D Hệ tiêu hóa");
```

- [ ] **Step 5: Update documentation**

In `docs/ARCHITECTURE.md` line 3, change `Starter-Tauri-App` to `Phần mềm 3D Hệ tiêu hóa`.

In `docs/superpowers/specs/2026-07-10-components-gallery-expansion-design.md` line 5, same change.

- [ ] **Step 6: Update test expectations**

**6a.** `src/lib/i18n.test.ts` line 22:
```
expect(t('app.name')).toBe('Phần mềm 3D Hệ tiêu hóa')
```

**6b.** `src/indexBootDiagnostics.test.ts` line 24:
```
expect(indexHtml).toContain('<title>Phần mềm 3D Hệ tiêu hóa</title>')
```

**6c.** `src/components/viewer-v2/ui/__tests__/ViewerV2Overlay.test.tsx`:
Lines 106 and 221: Change `'Starter-Tauri-App'` to `'Phần mềm 3D Hệ tiêu hóa'` in both `expect(screen.getByText(...))` and `expect(screen.queryByText(...))`.

- [ ] **Step 7: Run tests to verify**

```powershell
Set-Location "E:\he-tieu-hoa"; npx vitest run --reporter=verbose 2>&1 | Select-Object -Last 50
```
Expected: all tests pass

- [ ] **Step 8: Validate localization**

```powershell
Set-Location "E:\he-tieu-hoa"; pnpm l10n:validate
```
Expected: passes

- [ ] **Step 9: Commit**

```powershell
Set-Location "E:\he-tieu-hoa"; git add src/lib/locales/en.json src/lib/locales/vi.json index.html src-tauri/tauri.conf.json src-tauri/src/lib.rs docs/ src/lib/i18n.test.ts src/indexBootDiagnostics.test.ts "src/components/viewer-v2/ui/__tests__/ViewerV2Overlay.test.tsx"; git commit -m "feat: rename app to Phần mềm 3D Hệ tiêu hóa"
```

---

### Task 2: Change App Icon

**Files:**
- Modify: `index.html`
- Modify: `src-tauri/tauri.conf.json`
- Copy: `public/iiticon.ico` -> `src-tauri/icons/iiticon.ico`

- [ ] **Step 1: Update index.html favicon**

In `index.html`, find and replace the favicon link. Current (around line 7):
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```
Replace with:
```html
<link rel="icon" href="/iiticon.ico" />
```

- [ ] **Step 2: Copy icon to Tauri icons directory**

```powershell
Set-Location "E:\he-tieu-hoa"; Copy-Item "public\iiticon.ico" "src-tauri\icons\iiticon.ico" -Force
```

- [ ] **Step 3: Update tauri.conf.json bundle icons**

In `src-tauri/tauri.conf.json`, in the `bundle` section, change:
```json
"icon": ["icons/32x32.png", "icons/128x128.png", "icons/128x128@2x.png", "icons/icon.icns", "icons/icon.ico"],
```
to:
```json
"icon": ["icons/iiticon.ico"],
```

- [ ] **Step 4: Build to verify icon bundling**

```powershell
Set-Location "E:\he-tieu-hoa"; pnpm tauri build 2>&1 | Select-Object -Last 20
```
Expected: builds successfully, icon bundled

- [ ] **Step 5: Commit**

```powershell
Set-Location "E:\he-tieu-hoa"; git add index.html src-tauri/tauri.conf.json src-tauri/icons/iiticon.ico; git commit -m "feat: use iiticon.ico as app icon"
```

---

### Task 3: Fix Screenshot - Use ms-screenclip Overlay

**Files:**
- Modify: `src-tauri/src/lib.rs`

- [ ] **Step 1: Update Windows screenshot command**

In `src-tauri/src/lib.rs`, replace the `#[cfg(target_os = "windows")]` block (lines 54-71) with:

```rust
#[cfg(target_os = "windows")]
{
    std::process::Command::new("cmd")
        .args(["/C", "start", "", "ms-screenclip:"])
        .spawn()
        .map(|_| ())
        .or_else(|_| {
            std::process::Command::new("explorer")
                .arg("ms-screenclip:")
                .spawn()
                .map(|_| ())
        })
        .map_err(|error| format!("failed to launch Windows screenshot tool: {error}"))
}
```

- [ ] **Step 2: Verify compilation**

```powershell
Set-Location "E:\he-tieu-hoa"; Set-Location src-tauri; cargo check 2>&1 | Select-Object -Last 10
```
Expected: compiles without errors

- [ ] **Step 3: Commit**

```powershell
Set-Location "E:\he-tieu-hoa"; git add src-tauri/src/lib.rs; git commit -m "feat: use ms-screenclip overlay for Windows screenshot"
```

---

### Task 4: Reset Model Color Button

**Files:**
- Modify: `src/components/viewer-v2/ui/ColorPickerPopover.tsx`
- Modify: `src/components/viewer-v2/ui/ViewerV2Overlay.tsx`
- Modify: `src/components/viewer-v2/ui/ViewerV2SettingsPanel.tsx`

- [ ] **Step 1: Write failing test for ColorPickerPopover reset button**

Add test to existing test file or create `src/components/viewer-v2/ui/__tests__/ColorPickerPopover.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ColorPickerPopover } from '../ColorPickerPopover'

describe('ColorPickerPopover', () => {
  it('renders reset button when onReset is provided', async () => {
    const onChange = vi.fn()
    const onReset = vi.fn()
    render(
      <ColorPickerPopover
        label="Model Color"
        value="#ff0000"
        onChange={onChange}
        onReset={onReset}
      />,
    )
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })

  it('does not render reset button when onReset is not provided', () => {
    const onChange = vi.fn()
    render(
      <ColorPickerPopover
        label="Model Color"
        value="#ff0000"
        onChange={onChange}
      />,
    )
    expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument()
  })

  it('calls onReset when reset button is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onReset = vi.fn()
    render(
      <ColorPickerPopover
        label="Model Color"
        value="#ff0000"
        onChange={onChange}
        onReset={onReset}
      />,
    )
    await user.click(screen.getByRole('button', { name: /reset/i }))
    expect(onReset).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```powershell
Set-Location "E:\he-tieu-hoa"; npx vitest run src/components/viewer-v2/ui/__tests__/ColorPickerPopover.test.tsx 2>&1 | Select-Object -Last 20
```
Expected: FAIL - reset button not found

- [ ] **Step 3: Implement reset button in ColorPickerPopover**

In `src/components/viewer-v2/ui/ColorPickerPopover.tsx`, add `onReset` prop and a reset button:

```tsx
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useStarterSettings } from '@/app/StarterSettingsContext'
import { createTranslator } from '@/lib/i18n'

const DEFAULT_PRESETS = ['#1a1a2e', '#0f172a', '#ffffff', '#f97316', '#22c55e', '#3b82f6']

interface ColorPickerPopoverProps {
  label: string
  value: string | null
  onChange: (color: string) => void
  presets?: string[]
  collapsed?: boolean
  onReset?: () => void
}

export function ColorPickerPopover({
  label,
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  collapsed = false,
  onReset,
}: ColorPickerPopoverProps) {
  const { locale } = useStarterSettings()
  const t = createTranslator(locale)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
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
      </PopoverTrigger>
      <PopoverContent align="start" className="w-52 space-y-3">
        <PopoverTitle>{label}</PopoverTitle>
        <div className="grid grid-cols-4 gap-2">
          {presets.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={color}
              aria-pressed={value === color}
              className="size-8 rounded-md border border-border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-pressed:ring-2 aria-pressed:ring-ring"
              style={{ backgroundColor: color }}
              onClick={() => onChange(color)}
            />
          ))}
        </div>
        {onReset ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onReset}
          >
            {t('viewer.colorPicker.reset')}
          </Button>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```powershell
Set-Location "E:\he-tieu-hoa"; npx vitest run src/components/viewer-v2/ui/__tests__/ColorPickerPopover.test.tsx 2>&1 | Select-Object -Last 20
```
Expected: PASS

- [ ] **Step 5: Wire onReset in ViewerV2Overlay**

In `src/components/viewer-v2/ui/ViewerV2Overlay.tsx`, find the model color `ColorPickerPopover` (around line 249). Add the `onReset` prop:

```tsx
<ColorPickerPopover
  label={t('viewer.menu.modelColor')}
  value={modelColor}
  onChange={setModelColor}
  collapsed={!isMenuOpen}
  onReset={() => setModelColor(null)}
/>
```

- [ ] **Step 6: Wire onReset in ViewerV2SettingsPanel**

In `src/components/viewer-v2/ui/ViewerV2SettingsPanel.tsx`, find the model color `ColorPickerPopover` (around line 118). Add the `onReset` prop:

```tsx
<ColorPickerPopover
  label={t('viewer.menu.modelColor')}
  value={modelColor}
  onChange={setModelColor}
  onReset={() => setModelColor(null)}
/>
```

- [ ] **Step 7: Run full test suite**

```powershell
Set-Location "E:\he-tieu-hoa"; npx vitest run --reporter=verbose 2>&1 | Select-Object -Last 30
```
Expected: all tests pass

- [ ] **Step 8: Commit**

```powershell
Set-Location "E:\he-tieu-hoa"; git add "src/components/viewer-v2/ui/ColorPickerPopover.tsx" "src/components/viewer-v2/ui/ViewerV2Overlay.tsx" "src/components/viewer-v2/ui/ViewerV2SettingsPanel.tsx" "src/components/viewer-v2/ui/__tests__/ColorPickerPopover.test.tsx"; git commit -m "feat: add reset color button to ColorPickerPopover"
```

---

### Task 5: Organ Camera - Dynamic Orbit Target

**Files:**
- Modify: `src/components/viewer-v2/camera/CameraController.tsx`
- Modify: `src/components/viewer-v2/camera/__tests__/CameraController.test.tsx`

- [ ] **Step 1: Write failing test for orbit target update after transition**

In `src/components/viewer-v2/camera/__tests__/CameraController.test.tsx`, add a test after the "finishes the transition" test (around line 314):

```tsx
it('snaps orbit target to organ position after transition completes', () => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
  const setIsTransitioning = vi.fn()

  const { rerender } = renderWithViewerContext(<CameraController />, {
    organNodes: new Map([['gan', [mesh]]]),
    selectedOrgan: 'gan',
    setCameraTarget: vi.fn(),
    setIsTransitioning,
  })

  rerender(
    <ViewerV2Context.Provider
      value={createViewerValue({
        cameraTarget: 'gan',
        isTransitioning: true,
        organNodes: new Map([['gan', [mesh]]]),
        selectedOrgan: 'gan',
        setIsTransitioning,
      })}
    >
      <CameraController />
    </ViewerV2Context.Provider>,
  )

  const frameCallback = useFrameMock.mock.calls.at(-1)?.[0]
  act(() => {
    vi.mocked(performance.now).mockReturnValue(1000)
    frameCallback()
  })

  expect(setIsTransitioning).toHaveBeenCalledWith(false)
  const controls = getControls()
  expect(controls.target.toArray()).toEqual([0, 0, 0])
})
```

- [ ] **Step 2: Run test to verify it fails (target stays at DEFAULT_TARGET)**

```powershell
Set-Location "E:\he-tieu-hoa"; npx vitest run src/components/viewer-v2/camera/__tests__/CameraController.test.tsx 2>&1 | Select-Object -Last 20
```
Expected: FAIL - controls.target stays at DEFAULT_TARGET instead of organ center

- [ ] **Step 3: Implement dynamic orbit target in CameraController**

In `src/components/viewer-v2/camera/CameraController.tsx`, modify the `useFrame` callback to snap the orbit target after transition completes:

Current `useFrame` (lines 83-96):
```tsx
useFrame(() => {
  if (!isTransitioning) return

  const controls = controlsRef.current
  const elapsed = performance.now() / 1000 - lerpStart.current
  const t = Math.min(elapsed / FLY_DURATION, 1)
  const easedT = easeSmoothstep(t)

  camera.position.lerpVectors(startPosition.current, endPosition.current, easedT)
  controls?.target.lerpVectors(startTarget.current, endTarget.current, easedT)
  controls?.update()

  if (t >= 1) setIsTransitioning(false)
})
```

Replace with:
```tsx
useFrame(() => {
  if (!isTransitioning) return

  const controls = controlsRef.current
  const elapsed = performance.now() / 1000 - lerpStart.current
  const t = Math.min(elapsed / FLY_DURATION, 1)
  const easedT = easeSmoothstep(t)

  camera.position.lerpVectors(startPosition.current, endPosition.current, easedT)
  if (controls) {
    controls.target.lerpVectors(startTarget.current, endTarget.current, easedT)
    controls.update()
  }

  if (t >= 1) {
    setIsTransitioning(false)
    if (controls) {
      controls.target.copy(endTarget.current)
      controls.update()
    }
  }
})
```

Also, remove the hardcoded `target={DEFAULT_TARGET.toArray()}` on OrbitControls (line 104) since orbit target is now managed imperatively:

```tsx
return (
  <OrbitControls
    ref={controlsRef}
    autoRotate={isSpinning && !isTransitioning}
    autoRotateSpeed={1.0}
    enabled={!isTransitioning}
    minDistance={1}
    maxDistance={20}
    makeDefault
  />
)
```

- [ ] **Step 4: Run tests**

```powershell
Set-Location "E:\he-tieu-hoa"; npx vitest run src/components/viewer-v2/camera/__tests__/CameraController.test.tsx 2>&1 | Select-Object -Last 30
```
Expected: all tests pass, including new test

- [ ] **Step 5: Update OrbitControls prop test expectation**

In the test "renders OrbitControls with the expected navigation limits" (line 153), the `target` assertion will change since we removed the `target` prop. Update the test:

```tsx
it('renders OrbitControls with the expected navigation limits', () => {
  const { container } = renderWithViewerContext(<CameraController />)

  expect(container).toBeTruthy()
  expect(orbitControlsMock).toHaveBeenCalledWith(
    expect.objectContaining({
      enabled: true,
      makeDefault: true,
      maxDistance: 20,
      minDistance: 1,
    }),
    undefined,
  )
})
```

- [ ] **Step 6: Run full test suite**

```powershell
Set-Location "E:\he-tieu-hoa"; npx vitest run --reporter=verbose 2>&1 | Select-Object -Last 30
```
Expected: all tests pass

- [ ] **Step 7: Commit**

```powershell
Set-Location "E:\he-tieu-hoa"; git add "src/components/viewer-v2/camera/CameraController.tsx" "src/components/viewer-v2/camera/__tests__/CameraController.test.tsx"; git commit -m "feat: snap orbit target to organ position after camera transition"
```

---

### Task 6: AIPanel Fixed Viewport Layout

**Files:**
- Modify: `src/components/viewer-v2/ui/ai/AIPanel.tsx`
- Modify: `src/components/viewer-v2/ui/ai/ChatContent.tsx`
- Modify: `src/components/viewer-v2/ui/ai/GenAIContent.tsx`

- [ ] **Step 1: Fix AIPanel.tsx layout**

Current `AIPanel.tsx` uses `ScrollArea` wrapping children. The `SheetContent` already has `gap-0 p-0` and `w-full sm:w-[40vw] sm:max-w-[500px]`. The fix is ensuring `h-full` propagates properly.

In `src/components/viewer-v2/ui/ai/AIPanel.tsx`, change the `SheetContent` className to enforce full height flex layout:

Current line 47-51:
```tsx
<SheetContent
  side="right"
  closeLabel={closeLabel}
  aria-describedby={undefined}
  className="w-full gap-0 bg-card/95 p-0 backdrop-blur sm:w-[40vw] sm:max-w-[500px]"
>
```

Change to:
```tsx
<SheetContent
  side="right"
  closeLabel={closeLabel}
  aria-describedby={undefined}
  className="flex h-full flex-col w-full gap-0 bg-card/95 p-0 backdrop-blur sm:w-[40vw] sm:max-w-[500px]"
>
```

Then replace both `ScrollArea` usages (one in the Tabs block, one in the else block) with simpler containers. Lines 74-81:

Replace:
```tsx
<ScrollArea className="min-h-0 flex-1 px-4 py-3">
  {activeTab ? <TabsContent value={activeTab}>{children}</TabsContent> : children}
</ScrollArea>
```

With:
```tsx
<div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
  {activeTab ? <TabsContent value={activeTab} className="h-full">{children}</TabsContent> : children}
</div>
```

And line 79-81:
```tsx
<ScrollArea className="min-h-0 flex-1 px-4 py-3">
  {children}
</ScrollArea>
```

Replace with:
```tsx
<div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
  {children}
</div>
```

- [ ] **Step 2: Fix ChatContent.tsx layout**

In `src/components/viewer-v2/ui/ai/ChatContent.tsx`, change the structure to use fixed height. Current (lines 70-143):

Replace the entire return block with:

```tsx
return (
  <div className="flex h-full flex-col gap-3 overflow-hidden text-sm text-muted-foreground">
    <div
      role="log"
      aria-label={t('viewer.chatbot.tabChat')}
      aria-live="polite"
      aria-relevant="additions"
      className="min-h-0 flex-1 overflow-y-auto rounded-md border border-border p-3"
    >
      {messages.map((message) => {
        const isUser = message.sender === 'user'
        const senderLabel = isUser ? t('viewer.chatbot.senderUser') : t('viewer.chatbot.senderBot')

        return (
          <div
            key={message.id}
            role="article"
            aria-label={`${senderLabel}: ${message.text}`}
            data-testid={`chatbot-message-${message.sender}-${message.id}`}
            className={`flex py-1 ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            <p
              className={`max-w-[85%] rounded-lg px-3 py-2 ${
                isUser
                  ? 'bg-primary text-primary-foreground'
                  : 'whitespace-pre-wrap bg-muted text-muted-foreground'
              }`}
            >
              {message.text}
            </p>
          </div>
        )
      })}
      {isChatLoading ? <TypingIndicator /> : null}
      <div ref={chatEndRef} />
    </div>

    {hasChatError ? (
      <Alert variant="destructive">
        <AlertDescription>
          <span>{t('viewer.chatbot.error')}</span>
          {failedChatPrompt ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => void sendChat(failedChatPrompt)}
            >
              {t('viewer.chatbot.regenerate')}
            </Button>
          ) : null}
        </AlertDescription>
      </Alert>
    ) : null}

    <form
      className="flex shrink-0 gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        void sendChat()
      }}
    >
      <Input
        value={chatInput}
        aria-label={t('viewer.chatbot.placeholder')}
        placeholder={t('viewer.chatbot.placeholder')}
        onChange={(event) => setChatInput(event.target.value)}
      />
      <Button type="submit" disabled={!chatCanSend}>
        {t('viewer.chatbot.send')}
      </Button>
    </form>
  </div>
)
```

Key changes: outer div uses `overflow-hidden` instead of leaving it unmanaged; ScrollArea replaced with simple `overflow-y-auto` div; form gets `shrink-0` to prevent squishing.

- [ ] **Step 3: Fix GenAIContent.tsx layout**

In `src/components/viewer-v2/ui/ai/GenAIContent.tsx`, change the return block (lines 71-92):

Replace:
```tsx
return (
  <div className="flex h-full flex-col gap-3 text-sm text-muted-foreground">
    <div data-testid="genai-response-scroll" className="min-h-0 flex-1 overflow-auto">
      ...
    </div>
    ...
  </div>
)
```

With:
```tsx
return (
  <div className="flex h-full flex-col gap-3 overflow-hidden text-sm text-muted-foreground">
    <div data-testid="genai-response-scroll" className="min-h-0 flex-1 overflow-y-auto">
      {isLoading ? (
        <div className="space-y-2">
          <p>{t('viewer.genai.loading')}</p>
          <TypingIndicator />
        </div>
      ) : null}
      {response ? <p className="whitespace-pre-wrap">{response}</p> : null}
    </div>

    {hasError ? (
      <Alert variant="destructive">
        <AlertDescription>{t('viewer.genai.error')}</AlertDescription>
      </Alert>
    ) : null}

    <div className="shrink-0">
      <Button type="button" variant="outline" size="sm" onClick={() => void generate()} disabled={isLoading}>
        {t('viewer.genai.regenerate')}
      </Button>
    </div>
  </div>
)
```

- [ ] **Step 4: Remove unused ScrollArea import from AIPanel.tsx**

Since we replaced ScrollArea with plain divs, remove the import:
```tsx
// Remove: import { ScrollArea } from '@/components/ui/scroll-area'
```

- [ ] **Step 5: Run tests**

```powershell
Set-Location "E:\he-tieu-hoa"; npx vitest run --reporter=verbose 2>&1 | Select-Object -Last 30
```
Expected: all tests pass

- [ ] **Step 6: Commit**

```powershell
Set-Location "E:\he-tieu-hoa"; git add "src/components/viewer-v2/ui/ai/AIPanel.tsx" "src/components/viewer-v2/ui/ai/ChatContent.tsx" "src/components/viewer-v2/ui/ai/GenAIContent.tsx"; git commit -m "feat: implement fixed viewport layout for AI panels"
```

---

### Task 7: Typewriter Animation for AI Responses

**Files:**
- Create: `src/hooks/useTypewriter.ts`
- Create: `src/hooks/__tests__/useTypewriter.test.ts`
- Modify: `src/components/viewer-v2/ui/ai/ChatContent.tsx`
- Modify: `src/components/viewer-v2/ui/ai/GenAIContent.tsx`

- [ ] **Step 1: Write failing test for useTypewriter hook**

Create `src/hooks/__tests__/useTypewriter.test.ts`:

```tsx
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTypewriter } from '../useTypewriter'

describe('useTypewriter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns empty string and isTyping false when text is null', () => {
    const { result } = renderHook(() => useTypewriter(null))

    expect(result.current.displayedText).toBe('')
    expect(result.current.isTyping).toBe(false)
  })

  it('reveals text character by character', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useTypewriter(text),
      { initialProps: { text: null as string | null } },
    )

    rerender({ text: 'Hello' })

    expect(result.current.displayedText).toBe('')
    expect(result.current.isTyping).toBe(true)

    act(() => { vi.advanceTimersByTime(30) })
    expect(result.current.displayedText).toBe('H')
    expect(result.current.isTyping).toBe(true)

    act(() => { vi.advanceTimersByTime(30) })
    expect(result.current.displayedText).toBe('He')

    act(() => { vi.advanceTimersByTime(120) })
    expect(result.current.displayedText).toBe('Hello')
    expect(result.current.isTyping).toBe(false)
  })

  it('resets when text changes', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useTypewriter(text),
      { initialProps: { text: null as string | null } },
    )

    rerender({ text: 'AB' })
    act(() => { vi.advanceTimersByTime(60) })
    expect(result.current.displayedText).toBe('AB')

    rerender({ text: 'CD' })
    expect(result.current.displayedText).toBe('')
    expect(result.current.isTyping).toBe(true)

    act(() => { vi.advanceTimersByTime(60) })
    expect(result.current.displayedText).toBe('CD')
  })

  it('uses provided speed', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useTypewriter(text, 10),
      { initialProps: { text: null as string | null } },
    )

    rerender({ text: 'Test' })
    act(() => { vi.advanceTimersByTime(10) })
    expect(result.current.displayedText).toBe('T')
    act(() => { vi.advanceTimersByTime(10) })
    expect(result.current.displayedText).toBe('Te')
  })

  it('cleans up interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval')
    const { unmount } = renderHook(() => useTypewriter('test'))

    unmount()
    expect(clearIntervalSpy).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```powershell
Set-Location "E:\he-tieu-hoa"; npx vitest run src/hooks/__tests__/useTypewriter.test.ts 2>&1 | Select-Object -Last 20
```
Expected: FAIL - module not found

- [ ] **Step 3: Implement useTypewriter hook**

Create `src/hooks/useTypewriter.ts`:

```ts
import { useEffect, useRef, useState } from 'react'

export function useTypewriter(text: string | null, speed = 30): {
  displayedText: string
  isTyping: boolean
} {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (text === null || text === '') {
      setDisplayedText('')
      setIsTyping(false)
      return
    }

    let index = 0
    setDisplayedText('')
    setIsTyping(true)

    intervalRef.current = setInterval(() => {
      index += 1
      if (index >= text.length) {
        setDisplayedText(text)
        setIsTyping(false)
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      } else {
        setDisplayedText(text.slice(0, index + 1))
      }
    }, speed)

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [text, speed])

  return { displayedText, isTyping }
}
```

- [ ] **Step 4: Run test to verify it passes**

```powershell
Set-Location "E:\he-tieu-hoa"; npx vitest run src/hooks/__tests__/useTypewriter.test.ts 2>&1 | Select-Object -Last 20
```
Expected: all 5 tests pass

- [ ] **Step 5: Integrate useTypewriter into GenAIContent**

In `src/components/viewer-v2/ui/ai/GenAIContent.tsx`, add the import and use the hook:

Add import at top:
```tsx
import { useTypewriter } from '@/hooks/useTypewriter'
```

After the `const isMountedRef = useRef(false)` line, add:
```tsx
const { displayedText, isTyping: isTypingText } = useTypewriter(response)
```

In the return JSX, replace `{response ? <p ...>{response}</p> : null}` with:
```tsx
{displayedText ? <p className="whitespace-pre-wrap">{displayedText}</p> : null}
```

Replace the TypingIndicator condition to show during both loading AND typewriter typing:
```tsx
{isLoading || isTypingText ? (
  <div className="space-y-2">
    <p>{t('viewer.genai.loading')}</p>
    <TypingIndicator />
  </div>
) : null}
```

Full updated return block:
```tsx
return (
  <div className="flex h-full flex-col gap-3 overflow-hidden text-sm text-muted-foreground">
    <div data-testid="genai-response-scroll" className="min-h-0 flex-1 overflow-y-auto">
      {isLoading || isTypingText ? (
        <div className="space-y-2">
          <p>{t('viewer.genai.loading')}</p>
          <TypingIndicator />
        </div>
      ) : null}
      {displayedText ? <p className="whitespace-pre-wrap">{displayedText}</p> : null}
    </div>

    {hasError ? (
      <Alert variant="destructive">
        <AlertDescription>{t('viewer.genai.error')}</AlertDescription>
      </Alert>
    ) : null}

    <div className="shrink-0">
      <Button type="button" variant="outline" size="sm" onClick={() => void generate()} disabled={isLoading || isTypingText}>
        {t('viewer.genai.regenerate')}
      </Button>
    </div>
  </div>
)
```

- [ ] **Step 6: Integrate useTypewriter into ChatContent**

In `src/components/viewer-v2/ui/ai/ChatContent.tsx`, add the import:
```tsx
import { useTypewriter } from '@/hooks/useTypewriter'
```

Add a new state for pending response. After:
```tsx
const [failedChatPrompt, setFailedChatPrompt] = useState<string | null>(null)
```
add:
```tsx
const [pendingBotReply, setPendingBotReply] = useState<string | null>(null)
```

Add the typewriter hook after isMountedRef:
```tsx
const { displayedText, isTyping: isTypingText } = useTypewriter(pendingBotReply)
```

Add an effect to commit the displayed text to chat history when typing finishes:
```tsx
useEffect(() => {
  if (!isTypingText && pendingBotReply !== null && displayedText === pendingBotReply) {
    addMessage(displayedText, 'bot')
    setPendingBotReply(null)
  }
}, [isTypingText, pendingBotReply, displayedText, addMessage])
```

Modify the `sendChat` function's try block. Replace:
```tsx
const reply = await chat(text)
if (!isMountedRef.current) return
addMessage(reply, 'bot')
```
with:
```tsx
const reply = await chat(text)
if (!isMountedRef.current) return
setPendingBotReply(reply)
```

In the messages rendering, after the static messages loop and before `isChatLoading`, add rendering of the streaming message:

```tsx
{displayedText && pendingBotReply ? (
  <div className="flex justify-start">
    <p className="max-w-[85%] rounded-lg bg-muted px-3 py-2 whitespace-pre-wrap text-muted-foreground">
      {displayedText}
    </p>
  </div>
) : null}
{isChatLoading ? <TypingIndicator /> : null}
```

- [ ] **Step 7: Run full test suite**

```powershell
Set-Location "E:\he-tieu-hoa"; npx vitest run --reporter=verbose 2>&1 | Select-Object -Last 40
```
Expected: all tests pass

- [ ] **Step 8: Run typecheck**

```powershell
Set-Location "E:\he-tieu-hoa"; npx tsc --noEmit 2>&1 | Select-Object -Last 10
```
Expected: no errors

- [ ] **Step 9: Run lint**

```powershell
Set-Location "E:\he-tieu-hoa"; pnpm lint 2>&1 | Select-Object -Last 20
```
Expected: passes

- [ ] **Step 10: Commit**

```powershell
Set-Location "E:\he-tieu-hoa"; git add src/hooks/useTypewriter.ts "src/hooks/__tests__/useTypewriter.test.ts" "src/components/viewer-v2/ui/ai/ChatContent.tsx" "src/components/viewer-v2/ui/ai/GenAIContent.tsx"; git commit -m "feat: add typewriter animation for AI responses"
```

---

### Task 8: Final Verification

- [ ] **Step 1: Run all checks**

```powershell
Set-Location "E:\he-tieu-hoa"; pnpm lint; npx tsc --noEmit; npx vitest run --reporter=verbose; pnpm build
```
Expected: all pass with no errors

- [ ] **Step 2: Final commit (if any cleanup needed)**

```powershell
Set-Location "E:\he-tieu-hoa"; git status; git log --oneline -10
```
