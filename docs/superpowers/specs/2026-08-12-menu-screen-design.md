# Menu Screen Design

**Date:** 2026-08-12
**Status:** Approved

## Overview

Add a menu screen as the app's entry point (`/` route), replacing the current direct-to-viewer flow. The menu provides navigation to the 3D viewer, a guide screen, and a settings panel.

## Architecture

### Routing

Introduce **React Router v7** with the following routes:

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `MenuPage` | Main menu with title and navigation buttons |
| `/viewer` | `ViewerV2Page` | Existing 3D model viewer |
| `/guide` | `GuidePage` | Guide/instruction screen (placeholder for now) |
| `/settings` | (optional, settings uses Sheet overlay on `/`) | Settings page |

Settings is handled as a **Sheet (slide-in panel)** from the right on the menu page, consistent with the existing `ActiveSheet` pattern in `ViewerV2Overlay`. No separate route needed.

### Component Tree

```
<Router>
  <Routes>
    <Route path="/" element={<MenuPage />} />
    <Route path="/viewer" element={<ViewerV2Page />} />
    <Route path="/guide" element={<GuidePage />} />
  </Routes>
</Router>
```

### MenuPage Component

```
MenuPage
├── BackgroundLayer      (full-screen img with dark overlay)
├── GlassCard            (centered, glassmorphism)
│   ├── Title ("PHẦN MỀM 3D" / "HỆ TIÊU HÓA")
│   ├── StartButton      (Play icon + text, primary gradient)
│   ├── GuideButton      (BookOpen icon + text, secondary outline)
│   └── SettingsButton   (Gear icon + text, secondary outline)
└── SettingsSheet        (shadcn/ui Sheet, slides from right)
    └── (existing settings content / placeholder)
```

## Visual Design

### Layout: Centered Card + Glassmorphism

- Full-screen background image with dark semi-transparent overlay
- Glass card centered vertically and horizontally:
  - `background: rgba(255,255,255,0.06)`
  - `backdrop-filter: blur(16px)`
  - `border-radius: 20px`
  - `border: 1px solid rgba(255,255,255,0.12)`
  - `box-shadow: 0 8px 32px rgba(0,0,0,0.3)`

### Buttons (with Phosphor Icons)

| Button | Icon | Style | Action |
|--------|------|-------|--------|
| Bắt đầu | `Play` | Primary (gradient purple `#7c3aed → #5b21b6`) | Navigate to `/viewer` |
| Hướng dẫn | `BookOpen` | Secondary outline (`border`, transparent bg) | Navigate to `/guide` |
| Cài đặt | `Gear` | Secondary outline | Open Settings Sheet |

- All buttons: `w-[210px]`, rounded-xl, icon on left, text centered
- Primary button has shadow glow: `shadow-[0_4px_14px_rgba(124,58,237,0.35)]`

### Background Treatment

- `bg_menu_phanmem3d-1.png` set as `background-image` with `background-size: cover`
- Dark overlay: `rgba(0,0,0,0.45)` to ensure text/button readability
- Position: `fixed inset-0`

## Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `src/pages/MenuPage.tsx` | Menu screen component |
| `src/pages/GuidePage.tsx` | Guide screen (placeholder) |

### Modified Files

| File | Change |
|------|--------|
| `src/main.tsx` | Wrap with Router provider, add routes |
| `package.json` | Add `react-router-dom` dependency |
| `src/lib/locales/en.json` | Add `menu.*` keys |
| `src/lib/locales/vi.json` | Add `menu.*` keys (Vietnamese) |

### New Locale Keys

```json
{
  "menu": {
    "titleLine1": "PHẦN MỀM 3D",
    "titleLine2": "HỆ TIÊU HÓA",
    "start": "Bắt đầu",
    "guide": "Hướng dẫn",
    "settings": "Cài đặt",
    "guideContent": "Nội dung hướng dẫn sẽ được cập nhật sau."
  }
}
```

**Vietnamese** keys have identical structure with Vietnamese values.

## Dependencies

- `react-router-dom` (~v7) — new dependency for routing
- Existing: `@phosphor-icons/react`, `shadcn/ui Sheet`, `shadcn/ui Button`, Tailwind CSS v4

## Edge Cases / States

- **Loading**: Menu page renders synchronously (no async data), no loading state needed
- **Empty/Error**: Background image missing → fallback to gradient background
- **Settings**: Sheet open/close state managed by `useState` in `MenuPage`

## Testing

- Unit test: `MenuPage` renders title and three buttons
- Integration test: Click "Bắt đầu" navigates to `/viewer`
- Smoke test: Menu page loads and displays correctly
- Verify localization works for both `en` and `vi`

## Out of Scope

- Guide page content (placeholder only in this iteration)
- Settings panel content (reuse or placeholder)
- Menu animations/transitions (simple routing is sufficient)
- Back button from viewer to menu (handled by browser/Tauri window navigation)
