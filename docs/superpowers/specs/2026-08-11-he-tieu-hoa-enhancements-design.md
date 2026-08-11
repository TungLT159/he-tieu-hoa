# Design: He Tieu Hoa App Enhancements

**Date:** 2026-08-11
**Status:** Approved
**Scope:** 7 enhancements across branding, features, and UI

---

## 1. Rename App: "Starter-Tauri-App" -> "Phần mềm 3D Hệ tiêu hóa"

**Approach:** String replacement across all locations. 12 files affected.

### Files to modify:
| File | Change |
|------|--------|
| `index.html:48` | `<title>` tag text |
| `src-tauri/tauri.conf.json:3` | `productName` field |
| `src-tauri/tauri.conf.json:16` | Window `title` field |
| `src-tauri/src/lib.rs:102` | `expect()` message string |
| `src/lib/locales/en.json:2` | `app.name` value (keep key, change value) |
| `src/lib/locales/vi.json:2` | `app.name` value |
| `src/lib/i18n.test.ts:22` | Test expectation |
| `src/indexBootDiagnostics.test.ts:24` | Test expectation |
| `src/components/viewer-v2/ui/__tests__/ViewerV2Overlay.test.tsx:106` | Test expectation |
| `src/components/viewer-v2/ui/__tests__/ViewerV2Overlay.test.tsx:221` | Test expectation |
| `docs/ARCHITECTURE.md:3` | Doc reference |
| `docs/superpowers/specs/2026-07-10-...design.md:5` | Spec reference |

### Key: `app.name` locale value changes from `"Starter-Tauri-App"` to `"Phần mềm 3D Hệ tiêu hóa"` in both en.json and vi.json.

---

## 2. Icon: Use `public/iiticon.ico`

### Files to modify:

**`index.html`:**
- Change `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` to `<link rel="icon" href="/iiticon.ico" />`

**`src-tauri/tauri.conf.json` - `bundle.icon`:**
- Replace the icon array with `["icons/iiticon.ico"]`
- Copy `public/iiticon.ico` to `src-tauri/icons/iiticon.ico`

Tauri will auto-generate platform-specific icon sizes from the source .ico file.

---

## 3. Screenshot: Trigger OS Snipping Overlay

**Problem:** `SnippingTool.exe /clip` captures directly to clipboard without showing the snipping UI. User wants the overlay UI like Win+Shift+S.

### Changes in `src-tauri/src/lib.rs`:

**Windows:** Replace `SnippingTool.exe /clip` with `explorer ms-screenclip:`
```rust
#[cfg(target_os = "windows")]
{
    std::process::Command::new("cmd")
        .args(["/C", "explorer", "ms-screenclip:"])
        .spawn()
        .map(|_| ())
        .or_else(|_| {
            // Fallback: try direct invocation
            std::process::Command::new("explorer")
                .arg("ms-screenclip:")
                .spawn()
                .map(|_| ())
        })
        .map_err(|error| format!("failed to launch Windows screenshot tool: {error}"))
}
```

**macOS:** Keep `screencapture -i` (already shows capture UI).

**Fallback:** Canvas capture in `screenshot.ts` remains unchanged.

---

## 4. Chatbot/GenAI UI: Fixed Viewport (ChatGPT-style)

**Problem:** Both panels use `flex-1` on `ScrollArea` which lets content determine the sheet height. User wants a fixed-height panel with scrollable chat area.

### Changes to `AIPanel.tsx`:

Current structure:
```tsx
// AIPanel: SheetContent -> Tabs -> ScrollArea -> children
// ChatContent: div.flex.flex-col -> ScrollArea (flex-1) -> form (input+button)
```

The `SheetContent` already uses `className="w-full gap-0 bg-card/95 p-0 backdrop-blur sm:w-[40vw] sm:max-w-[500px]"`. The fix is to ensure:
1. `SheetContent` has `flex flex-col h-full` structure enforced
2. Chat area takes remaining space with `flex-1 overflow-hidden`
3. Input bar is always pinned to bottom

### Implementation:

**`AIPanel.tsx`:**
- The Tabs container already has `min-h-0 flex-1 gap-0`
- Ensure ScrollArea children fill the available height properly
- Remove padding from inner scroll area and let child components handle their own padding

**`ChatContent.tsx`:**
- Add `overflow-hidden` to outer container
- Replace `ScrollArea` with a simpler `div` scrollable area for better height control
- Ensure `h-full` propagates correctly through all flex containers

**`GenAIContent.tsx`:**
- Same fixed height approach: outer div with `flex flex-col h-full overflow-hidden`
- Scrollable content area with `flex-1 overflow-y-auto`
- Regenerate button pinned to bottom

---

## 5. Typewriter Animation for AI Responses

**Approach:** Client-side character-by-character reveal using `useEffect` + `setInterval`.

### Changes:

**New hook `useTypewriter.ts`** in `src/hooks/`:
```ts
function useTypewriter(text: string | null, speed: number = 30): {
  displayedText: string
  isTyping: boolean
}
```
- When `text` becomes non-null, clear previous interval, start new one
- Reveal one character every `speed`ms
- Return `displayedText` (the visible portion) and `isTyping` (whether still revealing)

**`ChatContent.tsx`:**
- Store `pendingResponse: string | null` state instead of directly adding bot message
- When API returns, set `pendingResponse` instead of calling `addMessage`
- Use `useTypewriter(pendingResponse)` to get `displayedText` and `isTyping`
- When `isTyping` becomes false, call `addMessage(displayedText, 'bot')` and clear `pendingResponse`
- During typing, show a temporary bot message bubble that updates with each character

**`GenAIContent.tsx`:**
- Use `useTypewriter(response)` to display text character by character
- Show `TypingIndicator` until both loading completes AND typing finishes

---

## 6. Organ Click: Free Rotate/Zoom at Organ

**Problem:** When camera flies to an organ, `OrbitControls` target stays at `DEFAULT_TARGET`, so dragging orbits around the wrong point.

### Changes to `CameraController.tsx` (viewer-v2):

1. **Dynamic orbit target:** Track the current orbit target in a ref. After transition completes, update the target to the organ position.

```tsx
const orbitTarget = useRef(DEFAULT_TARGET.clone())

// After transition ends, update orbit target to match endTarget
useFrame(() => {
  if (!isTransitioning) return
  // ... lerp logic ...
  if (t >= 1) {
    setIsTransitioning(false)
    orbitTarget.current.copy(endTarget.current)
  }
})

// In OrbitControls, use the dynamic target
<OrbitControls
  target={orbitTarget.current.toArray()}
  // ... rest
/>
```

Actually, the simpler approach: after transition completes, call `controls.target.copy(endTarget.current)` to snap the orbit target to the organ's position.

2. **Disable auto-rotation when viewing organ:** When `selectedOrgan` is set, `isSpinning` should be false. This is already handled by the controls logic (`autoRotate={isSpinning && !isTransitioning}`), but ensure the orbit target is correct.

3. **Return button:** Already exists in `ViewerV2Overlay.tsx:267-278` - shows a House icon button when `selectedOrgan` is set. Calls `requestViewReset()`. This already works correctly - the reset handler in CameraController calls `animateCamera('overview')`, sets `selectedOrgan` to null, and resets the view.

**Key fix:** The orbit target must update to the organ's center after the camera transition completes, allowing the user to freely orbit around the selected organ.

---

## 7. Reset Model Color Button

### Changes:

**`ColorPickerPopover.tsx`:**
- Add optional `onReset?: () => void` prop
- When provided, show a "Reset" button inside the popover content
- The reset action calls `onReset()` which sets color to `null` (default/transparent)

**`ViewerV2Overlay.tsx` (menu color picker):**
- Pass `onReset={() => setModelColor(null)}` to `ColorPickerPopover` for model color

**`ViewerV2SettingsPanel.tsx` (settings color picker):**
- Same: pass `onReset={() => setModelColor(null)}` to the model color picker

**Locale keys needed:**
```json
"viewer.menu.resetColor": "Reset color" / "Đặt lại màu"
```

---

## Test Plan

1. **Renaming:** Update 6 test files with new expected strings
2. **Icon:** Visual verification only (binary asset)
3. **Screenshot:** Existing screenshot tests should pass; manual verify `ms-screenclip:` launch
4. **Chatbot UI:** Update `ChatContent` tests for fixed height structure; add test for typewriter behavior
5. **Typewriter:** New `useTypewriter.test.ts` hook tests
6. **Camera:** Update `CameraController.test.tsx` for dynamic orbit target behavior
7. **Reset color:** Test button renders and calls setModelColor(null)

---

## Locale Keys to Add

```json
{
  "viewer.menu.resetColor": "Đặt lại màu"
}
```

Also add English:
```json
{
  "viewer.menu.resetColor": "Reset color"
}
```

---

## Implementation Order

1. **Phase 1 (config):** Rename app, change icon - quick string changes
2. **Phase 2 (features):** Screenshot fix, reset color button, organ camera orbit fix
3. **Phase 3 (UI):** AIPanel fixed viewport, typewriter animation
