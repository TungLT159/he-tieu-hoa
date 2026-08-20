# Abstractions

## Viewer State

`ViewerV2ContextValue` is the active shared viewer state for selection, organ mesh registration, camera targets, menu state, panels, dialogs, drawing controls, color controls, model loading state, debug panel state, auto-rotation, and fly camera mode.

The legacy `ViewerContextValue` remains in `src/components/viewer/` as retained reference and test coverage while viewer-v2 uses a temporary FBX model fallback. New viewer-facing work should target `src/components/viewer-v2/` unless the legacy viewer is being intentionally migrated or removed.

## Starter Settings

`StarterSettings` stores app-level preferences:

- `themeMode`: `light`, `dark`, or `system`
- `uiLanguage`: `en`, `vi`, or `system`
- `narrationVoice`: `bac`, `trung`, or `nam`
- `notificationsEnabled`: boolean
- `profileDisplayName`: string

## Translator

`createTranslator(locale)` returns a function that reads localized strings from JSON catalogs and falls back to English.

## Theme Mode

`themeMode.ts` normalizes selected theme values, resolves system preference, and applies the resolved mode to the document.

## Viewer Panels

`ActiveSheet` and `ActiveDialog` define which viewer-v2 sheet or dialog is open from the overlay menu. The app no longer uses default route definitions or a command palette.
