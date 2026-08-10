# Viewer Side Menu Design

## Overview

Replace the starter app shell (sidebar, header, command palette, multi-route layout) with a focused single-page 3D viewer featuring a collapsible left-side vertical menu. The viewer becomes the application's only route, with all functionality accessible through the side menu.

## App Shell Changes

- Remove `AppSidebar`, `AppHeader`, command palette components
- Remove all routes except viewer (`/`)
- `App.tsx` renders `<ViewerPage />` directly with existing providers (theme, i18n, settings)
- `ViewerPage` becomes self-contained: no router outlet, no shell chrome

## Layout

### Menu collapsed (48px icon column)
```
┌──┬──────────────────────────────┐
│≡ │                              │
│  │        Canvas 3D             │
│  │                              │
└──┴──────────────────────────────┘
```

### Menu expanded (280px)
```
┌──────────┬──────────────────────┐
│ ◀ Thu gọn│                      │
│ ─────────│                      │
│ Group 1  │     Canvas 3D        │
│  Button  │                      │
│  Button  │                      │
│ ─────────│                      │
│ Group 2  │                      │
│  ...     │                      │
└──────────┴──────────────────────┘
```

## Menu Structure

Four logical groups separated by dividers:

### Group 1: Model Interaction
- Rotate model toggle (`ArrowsClockwise`)
- Change model color (`PaintBucket`)
- Change background color (`Image`)
- Fly camera auto-tour (`VideoCamera`)

### Group 2: Learning
- Quiz (`Question`)
- Digestive system info panel (`Info`)
- Learning video (`Play`)
- Gen AI description (`Sparkle`)

### Group 3: Tools
- Chatbot AI (`ChatsCircle`)
- Annotation drawing (`PencilSimple`) — with sub-toolbar when active
- Screenshot (`Camera`)
- External editor (`Article`)

### Group 4: System
- Settings (`GearSix`)
- Fullscreen toggle (`ArrowsOut`/`ArrowsIn`)
- Home screen (`House`) — placeholder, home page designed later

## Panel Strategy

| Content Type | Component | Behavior |
|---|---|---|
| Chatbot AI | Sheet (right) | Slides from right, ~400px wide |
| Settings | Sheet (right) | Slides from right, ~400px wide |
| Info panel | Dialog (center) | Modal overlay |
| Quiz | Dialog (center) | Modal overlay |
| Gen AI result | Dialog (center) | Modal overlay |

Rules:
- Opening a sheet closes any open sheet
- Opening a dialog closes any open dialog
- Sheet + dialog can coexist
- Menu toggle is independent of panels

## State (ViewerContext extensions)

```typescript
interface ViewerMenuState {
  isMenuOpen: boolean           // default: true
  activeSheet: 'chatbot' | 'settings' | null
  activeDialog: 'info' | 'quiz' | 'genai' | null
  isFullscreen: boolean
  isDrawing: boolean            // annotation mode
  drawColor: string             // current pen color
  backgroundColor: string
  modelColor: string | null     // null = use original
  isSpinning: boolean           // auto-rotate
}
```

## Component Tree

```
App
└── ViewerPage
    ├── DigestiveCanvas          (existing, modified for dynamic bg color)
    ├── OrganInfoCard            (existing)
    ├── ViewerMenu               (NEW)
    │   ├── MenuToggleButton     (narrow/expand)
    │   └── ViewerMenuGroup[]    (4 groups, collapsible headers)
    ├── ViewerAnnotation         (NEW, overlay when isDrawing)
    ├── ViewerChatbot            (NEW, Sheet)
    ├── ViewerSettings           (NEW, Sheet)
    ├── ViewerInfoDialog         (NEW, Dialog)
    ├── ViewerQuizDialog         (NEW, Dialog)
    └── ViewerGenAIDialog        (NEW, Dialog)
```

## New Files

```
src/components/viewer/
├── ViewerMenu.tsx              — main menu container
├── ViewerMenuGroup.tsx         — single group with header + buttons
├── ViewerAnnotation.tsx        — SVG/Canvas overlay for freehand drawing
├── ViewerChatbot.tsx           — chatbot Sheet with message UI
├── ViewerSettings.tsx          — settings Sheet (resolution, lighting, audio)
├── ViewerInfoDialog.tsx        — dialog with full digestive system info
├── ViewerQuizDialog.tsx        — multiple-choice quiz dialog
└── ViewerGenAIDialog.tsx       — AI-generated description display
```

Modified files:
```
src/app/App.tsx                 — simplified, no router
src/app/routes.tsx              — removed or reduced to viewer-only
src/components/viewer/ViewerPage.tsx  — integrated menu + panels
src/components/viewer/ViewerContext.tsx — extended state
src/components/viewer/DigestiveCanvas.tsx — dynamic background color
src/components/viewer/modelTransform.ts  — auto-rotate logic
src/components/app-shell/       — may be removed or archived
src/components/command-palette/ — may be removed or archived
src/components/dashboard/       — may be removed or archived
src/components/gallery/         — may be removed or archived
src/components/settings/        — may be removed or archived
src/lib/locales/en.json         — new locale keys
src/lib/locales/vi.json         — new locale keys
```

## Tauri Integration

| Feature | Tauri API |
|---------|-----------|
| Fullscreen toggle | `@tauri-apps/api/window` (`setFullscreen`) |
| Open external .exe | `@tauri-apps/plugin-shell` (`open`) or custom command |
| Screenshot | `html2canvas` library (browser) or Tauri screenshot plugin |
| Learning video | Local file path via `@tauri-apps/api/path` + `<video>` element |
| Settings persistence | `localStorage` for preferences; Tauri commands for system settings |

## Icons

All icons from `@phosphor-icons/react` (already in dependencies):

| Button | Icon Component |
|--------|---------------|
| Rotate model | `ArrowsClockwise` |
| Model color | `PaintBucket` |
| Background color | `Image` |
| Fly camera | `VideoCamera` |
| Quiz | `Question` |
| Info | `Info` |
| Video | `Play` |
| Gen AI | `Sparkle` |
| Chatbot | `ChatsCircle` |
| Annotation | `PencilSimple` |
| Screenshot | `Camera` |
| Editor | `Article` |
| Settings | `GearSix` |
| Fullscreen | `ArrowsOut` / `ArrowsIn` |
| Home | `House` |
| Menu toggle | `CaretLeft` / `CaretRight` |

## Annotation Sub-toolbar

When `isDrawing` is true, a floating sub-toolbar appears near the annotation button:

- Pen tool (activate drawing mode)
- Eraser tool
- Color picker (preset colors)
- Clear all (remove all annotations)
- Exit drawing mode

Annotations render on an overlay layer above the 3D canvas using SVG or Canvas API. All annotations are ephemeral (cleared on page refresh).

## Fly Camera Auto-Tour

When activated, camera sequentially flies to each organ in order: Mouth → Esophagus → Stomach → Small Intestine → Large Intestine → Liver → Gallbladder → Pancreas → overview. At each stop, the OrganInfoCard appears for that organ. Tour duration per organ: ~3 seconds. Can be cancelled by user click.

## Color Controls

- **Background color**: Opens a small popover with preset color swatches. On selection, updates the Canvas background color (`<color attach="background">`) via ViewerContext. Default: `#1a1a2e`.
- **Model color**: Opens a popover with preset color swatches. On selection, overrides the model's material color. Selecting "Reset" clears the override and restores original materials.

## Feature Scope Notes

- Quiz, Chatbot AI, and Gen AI are UI placeholders in this spec. Their internal logic (question bank, AI integration, etc.) will be specified in follow-up specs.
- "Home screen" button is a placeholder pending main menu design.

## Localization

All user-facing text in `vi.json` and `en.json` under namespace `viewer.menu.*`.

## Testing

- Unit tests for `ViewerContext` state transitions
- Component tests for `ViewerMenu` open/close, group rendering
- Component tests for Sheet/Dialog open/close behavior
- Smoke test for viewer page basic rendering
- Existing tests for removed components should be cleaned up
