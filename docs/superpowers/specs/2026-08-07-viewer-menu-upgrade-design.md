# Viewer Menu Upgrade Design

## Summary

Upgrade the existing collapsible sidebar menu in `ViewerV2Overlay` with 6 functional improvements and a new fly camera tour. The menu already has 15 buttons; most are placeholders or feature basic implementations.

## Scope

| # | Button | Change |
|---|--------|--------|
| 1 | Rotate Model | No change (working) |
| 2 | **Fly Camera** | Upgrade: auto-tour with organ info popups |
| 3 | Model Color | No change (working) |
| 4 | Background Color | No change (working) |
| 5 | Quiz | No change (placeholder) |
| 6 | **Info** | Upgrade: show real digestive system content |
| 7 | **Video** | Upgrade: video player from publish folder |
| 8 | Gen AI | No change (placeholder) |
| 9 | Chatbot AI | No change (placeholder) |
| 10 | **Annotation** | Upgrade: add sub-toolbar (pen, eraser, color, clear, exit) |
| 11 | **Screenshot** | Change: OS-native screenshot tool via Tauri |
| 12 | Editor | No change (placeholder) |
| 13 | **Settings** | Upgrade: quality presets, volume, voice |
| 14 | Fullscreen | No change (working) |
| 15 | Home | No change (placeholder) |

## State Additions to ViewerV2Context

```
flyCameraPaused: boolean
flyCameraOrganPopup: string | null
flyCameraTourIndex: number
qualityPreset: 'low' | 'medium' | 'high'
volume: number           // 0-100
voice: 'bac' | 'trung' | 'nam'
annotationTool: 'pen' | 'eraser'
```

## Component Architecture

Each feature becomes its own component under `src/components/viewer-v2/ui/`:

```
ui/
  ViewerV2Overlay.tsx        (updated: route panels, add state)
  ViewerV2SettingsPanel.tsx  (updated: quality, volume, voice)
  FlyCameraTour.tsx          (new: tour controller + popup logic)
  FlyCameraPopup.tsx          (new: organ info popup at screen position)
  AnnotationToolbar.tsx      (new: pen/eraser/color/clear/exit bar)
  InfoPanel.tsx              (updated: real digestive system content)
  VideoPlayerPanel.tsx       (new: <video> player panel)
  ColorPickerPopover.tsx     (no change)
  OrganInfoCard.tsx          (no change)
  screenshot.ts              (updated: OS-native fallback)
```

## Feature Details

### Fly Camera Tour

1. User clicks Fly Camera → camera begins a tour through organs in digestive order: Mouth → Esophagus → Stomach → Small Intestine → Large Intestine → Liver → Gallbladder → Pancreas
2. At each organ, camera pauses and shows a popup card near the organ's screen-space position
3. Popup contains organ name + description (from existing locale keys)
4. User clicks "Continue" → popup closes, camera flies to next organ
5. After last organ → tour ends, view resets to overview
6. User can cancel at any time by clicking Fly Camera button again

**Camera math**: reuses existing `cameraMath.ts` for target lookups per organ config.

**Organ tour order** defined in a constant array, independent from organ registry.

### Annotation Toolbar

When `isDrawing = true`, show a floating toolbar at screen bottom:

- Pen (default) — draw freehand strokes on a 2D canvas overlay
- Eraser — erase individual strokes
- Color picker — changes `drawColor`
- Clear All — removes all strokes
- Exit — sets `isDrawing = false`, hides toolbar

Toolbar uses shadcn `Button` with `variant="ghost"` and phosphor icons. Active tool has `variant="secondary"`.

### Settings Panel

Extends the existing `ViewerV2SettingsPanel` with three new sections:

**Quality Preset** — three radio-style buttons:
- Mượt (low): renderScale=0.5, shadows off, no bloom/AO
- Trung bình (medium): renderScale=0.75, basic shadows, light bloom
- Cao (high): renderScale=1.0, full shadows, bloom + AO

State flows through `ViewerV2Context.qualityPreset` → consumed by `PostProcessing.tsx` and `SceneSetup.tsx`.

**Volume** — shadcn `Slider` 0-100

**Voice** — three radio buttons: Bắc / Trung / Nam

All locale keys already exist in `en.json` and `vi.json`.

### Info Panel

Replace `PlaceholderDialog` with real content:
- Title: "Human Digestive System" / "Hệ tiêu hóa ở người"
- Body: rich text describing the digestive system (organs list, function overview, digestion process)
- Content stored as locale keys (`viewer.info.title`, `viewer.info.description`, `viewer.info.details`)

### Video Player

New `<video>` element panel. Source path from Tauri resource or `public/videos/` directory. Controls enabled. Fallback text if video unavailable.

### Screenshot (OS-native)

Replace `canvas.toBlob()` with OS-specific screenshot tool:
- Windows: spawn `snippingtool.exe` via Tauri `shell` command (`@tauri-apps/plugin-shell`)
- macOS: spawn `screencapture`
- Browser/dev mode fallback: keep canvas capture

## Files Modified

- `src/components/viewer-v2/viewerV2Context.ts` — add new state types
- `src/components/viewer-v2/ViewerV2Provider.tsx` — add new state + defaults
- `src/components/viewer-v2/ui/ViewerV2Overlay.tsx` — wire new components
- `src/components/viewer-v2/ui/screenshot.ts` — OS-native capture

## Files Created

- `src/components/viewer-v2/ui/FlyCameraTour.tsx`
- `src/components/viewer-v2/ui/FlyCameraPopup.tsx`
- `src/components/viewer-v2/ui/AnnotationToolbar.tsx`
- `src/components/viewer-v2/ui/VideoPlayerPanel.tsx`

## Files Updated

- `src/components/viewer-v2/ui/ViewerV2SettingsPanel.tsx` — quality/volume/voice
- `src/components/viewer-v2/ui/PlaceholderDialog.tsx` → info uses real content (or new `InfoPanel.tsx`)

## Locale

- New keys for fly camera (`viewer.flyCamera.continue`, `viewer.flyCamera.organLabel`)
- New keys for info details (`viewer.info.details`)
- All other keys already exist

## Testing

- Unit tests for each new component
- Context state tests for new state additions
- Smoke test update for new UI elements

## Out of Scope

- Chatbot AI (chat + image generation)
- Gen AI description generation
- Editor (.exe launcher)
- Home screen navigation
- Quiz functionality
- TTS (text-to-speech) for info/fly-camera
- Tauri Rust commands beyond shell plugin for screenshot
