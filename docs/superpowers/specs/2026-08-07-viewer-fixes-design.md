# Viewer Fixes & Improvements — Design Spec

**Date:** 2026-08-07
**Status:** Draft

---

## Overview

Fix 7 issues in the v2 3D viewer and add screenshot capability. Covers rotation, color UI separation, return-to-overview relocation, DOF removal, placeholder dialogs, and screenshot feature. Removes debug mesh toggle.

---

## 1. Auto-Rotate Model

**Problem:** `isSpinning` state toggles but no code reads it to auto-rotate.

**Design:**
- In `CameraController.tsx`, read `isSpinning` from context.
- In `useFrame`, when `isSpinning && !isTransitioning`, set `controls.autoRotate = true` and `controls.autoRotateSpeed = 1.0`.
- When `isSpinning` becomes `false`, revert `autoRotate = false`.

**Files modified:** `src/components/viewer-v2/camera/CameraController.tsx`

---

## 2. Separate Model Color & Background Color Buttons

**Problem:** Both color pickers are inline inside the sidebar, only visible when menu is expanded.

**Design:**
- Remove the two `ColorPickerPopover` blocks from inside the expanded menu section.
- Add two new `MenuButtonDef` entries to the `modelInteractionButtons` group:
  - `modelColor`: icon `PaintBucket` (needs new icon import), opens color popover overlay.
  - `backgroundColor`: icon `Image`, opens color popover overlay.
- When a color button is clicked, toggle a local state tracking which popover is open (`colorPopoverTarget: 'model' | 'background' | null`).
- Render a `ColorPickerPopover` anchored near the sidebar when `colorPopoverTarget` is set.

**Files modified:**
- `src/components/viewer-v2/ui/ViewerV2Overlay.tsx`
- `src/components/viewer-v2/ui/ColorPickerPopover.tsx` (no changes needed)

---

## 3. Floating "Return to Overview" Button (Top-Right)

**Problem:** Return-to-overview button is buried in the sidebar.

**Design:**
- Remove the `Button` with `requestViewReset` from the sidebar's expanded menu block.
- Add a floating icon button at `absolute top-4 right-4 z-20` in `ViewerV2Overlay`.
- Use `House` icon from `@phosphor-icons/react` (already imported).
- Style: rounded-full, bg-background/80 backdrop-blur, visible only when `selectedOrgan !== null`.
- On click, call `requestViewReset()`.

**Files modified:** `src/components/viewer-v2/ui/ViewerV2Overlay.tsx`

---

## 4. Remove DepthOfField (Fix Close-Up Blur)

**Problem:** `DepthOfField` with `focusDistance={0}` causes heavy blur when zoomed on an organ.

**Design:**
- Remove `CameraDepthOfField` component entirely from `PostProcessing.tsx`.
- Keep `SSAO` and `Bloom` unchanged.

**Files modified:** `src/components/viewer-v2/scene/PostProcessing.tsx`

---

## 5. Placeholder Dialogs for All Inactive Features

**Problem:** Many buttons (info, quiz, genai, video, chatbot) set `activeDialog`/`activeSheet` but no UI renders.

**Design:**
- Create reusable `PlaceholderDialog` component accepting `titleKey: TranslationKey` and `icon`.
- Render dialogs when `activeDialog` is set:
  - `'info'`: renders actual content (organ overview info from locale `viewer.info.*`)
  - `'quiz'`, `'genai'`, `'video'`: placeholder dialog with "under development" message
- Render chatbot sheet when `activeSheet === 'chatbot'`: placeholder panel.
- All dialogs use the same pattern as `ViewerV2SettingsPanel` (positioned card with close button).

**New files:**
- `src/components/viewer-v2/ui/PlaceholderDialog.tsx`

**Files modified:**
- `src/components/viewer-v2/ui/ViewerV2Overlay.tsx` (add render blocks for each dialog/sheet)

---

## 6. Screenshot Feature

**Problem:** Screenshot button has empty `onClick`.

**Design:**
- Create `src/components/viewer-v2/ui/screenshot.ts` utility with `captureScreenshot()` function.
- Logic:
  1. Query canvas: `document.querySelector('[data-viewer-canvas]')`  
  2. Call `canvas.toDataURL('image/png')`
  3. Create `<a>` element with `download="hetieuhoa-screenshot-{timestamp}.png"` and trigger click
- Wire it to the screenshot button's `onClick`.
- Add locale key: `viewer.menu.screenshotTaken` for feedback.

**New files:**
- `src/components/viewer-v2/ui/screenshot.ts`

**Files modified:**
- `src/components/viewer-v2/ui/ViewerV2Overlay.tsx`
- `src/lib/locales/en.json`
- `src/lib/locales/vi.json`

---

## 7. Remove Debug Mesh Toggle Button

**Problem:** Requested removal.

**Design:**
- Remove the debug mesh button block from the bottom of the sidebar menu.
- Keep `DebugPanel` component and `isDebugPanelOpen` state for potential internal use.
- Remove associated locale keys if unused elsewhere.

**Files modified:**
- `src/components/viewer-v2/ui/ViewerV2Overlay.tsx`

---

## Summary of All File Changes

| File | Change |
|------|--------|
| `src/components/viewer-v2/camera/CameraController.tsx` | Add auto-rotate via `isSpinning` |
| `src/components/viewer-v2/scene/PostProcessing.tsx` | Remove `CameraDepthOfField` |
| `src/components/viewer-v2/ui/ViewerV2Overlay.tsx` | Major: restructure color buttons, add floating return button, render all dialogs/sheets, remove debug toggle, wire screenshot |
| `src/components/viewer-v2/ui/PlaceholderDialog.tsx` | **New**: reusable placeholder dialog component |
| `src/components/viewer-v2/ui/screenshot.ts` | **New**: screenshot capture utility |
| `src/lib/locales/en.json` | Add placeholder dialog and screenshot locale keys |
| `src/lib/locales/vi.json` | Add placeholder dialog and screenshot locale keys |
