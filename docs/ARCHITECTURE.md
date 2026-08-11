# Architecture

Phần mềm 3D Hệ tiêu hóa is a Tauri + React desktop starter focused on a single digestive 3D viewer. It provides a collapsible viewer side menu, reusable shadcn UI primitives, light/dark/system theme support, and English/Vietnamese localization.

## Layers

- Tauri shell: native window, app metadata, minimal settings commands, and the viewer screenshot tool launcher.
- React app: `StarterApp` renders `ViewerV2Page` directly; no default route table, sidebar navigation, or command palette remains.
- Viewer UI: `src/components/viewer-v2/` contains the active 3D canvas, overlays, camera controllers, scene effects, and viewer-v2 state. `src/components/viewer/` is retained temporarily because shared overlay behavior and existing tests still reference the old viewer implementation.
- UI system: shadcn primitives, CSS variables, and reusable local UI patterns.
- Preferences: starter settings persisted in browser storage with optional native command integration.
- Localization: JSON catalogs in `src/lib/locales/en.json` and `src/lib/locales/vi.json`.

## Viewer

`/` renders the viewer-only app through `ViewerV2Page`. The v2 viewer currently loads `/models/hetieuhoa.fbx` as a temporary fallback because GLB conversion is blocked in this workspace. Replace the static FBX model URL with `/models/hetieuhoa.glb` and add the matching Tauri resource after a real GLB has been produced and inspected.

`open_system_screenshot_tool` launches the OS screenshot UI on supported desktop platforms. The viewer falls back to exporting `[data-viewer-canvas]` as a PNG when the native command is unavailable or fails.

## Theme

Theme mode supports `light`, `dark`, and `system`. The selected mode is resolved by `src/lib/themeMode.ts`, then applied to `document.documentElement` with `data-theme` and the `dark` class.

## Localization

All user-facing copy lives in `src/lib/locales/en.json` and `src/lib/locales/vi.json`. English is the fallback catalog.
