# Getting Started

## Install

```bash
pnpm install
```

## Web Development

```bash
pnpm dev
```

Open `http://localhost:5202`.

## Tauri Development

```bash
pnpm tauri dev
```

## Test

```bash
pnpm lint
npx tsc --noEmit
pnpm test
pnpm playwright:smoke
pnpm build
```

## Work On Viewer Features

1. Add active viewer components under `src/components/viewer-v2/`.
2. Add or extend viewer-v2 state in `src/components/viewer-v2/ViewerV2Provider.tsx` and `viewerV2Context.ts` when shared state is needed.
3. Add user-facing labels to `src/lib/locales/en.json` and `src/lib/locales/vi.json`.
4. Add focused tests near the changed viewer-v2 code.
5. Keep `src/components/viewer/` until old imports and tests are safely migrated or removed.

## Viewer Model Asset

The active viewer-v2 currently loads `/models/hetieuhoa.fbx`. GLB conversion is blocked in this workspace, so the FBX path is temporary. After producing and inspecting a valid `hetieuhoa.glb`, update the viewer model URL and Tauri bundled resources together.

## Add A Setting

1. Add the field to `StarterSettings` in `src/app/settingsStorage.ts`.
2. Add viewer-facing controls in `src/components/viewer-v2/ui/ViewerV2Overlay.tsx` or a focused v2 UI component if the setting is exposed in the active viewer.
3. Add localized labels to both locale catalogs.
4. Add persistence tests in `src/app/settingsStorage.test.ts`.
