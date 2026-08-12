# Menu Visual Upgrade Design

**Date:** 2026-08-12
**Status:** Approved

## Goal

Improve the existing menu screen so it feels more substantial, polished, and appropriate for the app window size. The current menu is functional but too small and visually simple.

## Approved Direction

Use a **Premium Hero Card** treatment:

- Keep the current centered glassmorphism layout.
- Make the menu card significantly larger and responsive to the viewport.
- Make the title the dominant visual element.
- Add subtle depth through glow, gradient border, and background vignette.
- Make buttons larger and more deliberate.
- Avoid adding unrelated menu features.

## Visual Changes

### Card

- Increase card width to approximately `min(760px, calc(100vw - 48px))`.
- Increase responsive padding:
  - mobile/small windows: comfortable spacing
  - desktop: larger horizontal and vertical spacing
- Add layered glass effect:
  - stronger blur
  - gradient border treatment
  - larger shadow
  - subtle radial glow behind card

### Title

- Increase title size from small `text-xl` to a responsive hero scale.
- Use stronger font weight and wider tracking.
- Keep two-line structure:
  - `PHẦN MỀM 3D`
  - `HỆ TIÊU HÓA`
- Add text shadow/glow for emphasis and readability on the image background.

### Buttons

- Increase button width and height.
- Keep icons.
- Keep Start button as primary gradient.
- Keep Guide and Settings as secondary glass/outline buttons.
- Improve hover/focus states while preserving accessibility.

### Background

- Continue using `/bg_menu_phanmem3d-1.png`.
- Add stronger overlay/vignette so the larger hero card and title remain readable.
- Do not replace the image asset in this iteration.

## Functional Behavior

No route or behavior changes:

- Start still navigates to `/viewer`.
- Guide still navigates to `/guide`.
- Settings still opens the existing menu settings Sheet.
- Theme/language settings remain functional.

## Testing

Update or add focused tests for visual contract without over-testing CSS details:

- Menu still renders title and three buttons.
- Menu card has a stable test id for the upgraded hero card.
- Background image test remains.
- Navigation/settings behavior tests remain passing.
- Smoke test remains menu-first and viewer-launch flow.

## Out Of Scope

- New guide page content.
- New menu copy beyond the existing title/buttons.
- Replacing or optimizing the background image.
- New animations unless achievable through existing CSS utility classes with minimal risk.
