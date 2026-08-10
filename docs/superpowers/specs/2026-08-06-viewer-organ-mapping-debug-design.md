# Viewer Organ Mapping And Debug Design

**Created:** 2026-08-06
**Status:** Approved for implementation planning

## Overview

Update the 3D digestive viewer so each clickable FBX mesh selects the intended anatomical part, zooms the camera to that part, highlights it, and shows the correct detail card. The current FBX uses generic mesh names such as `digestive_system001`, so the viewer needs an explicit mesh-to-organ mapping plus a lightweight debug panel for validating that mapping in the app.

## Goals

- Map actual FBX mesh names to stable organ identifiers used by selection, highlighting, camera zoom, and info cards.
- Support organs made from more than one mesh.
- Add an in-viewer debug panel that can be toggled from the toolbar.
- Show enough debug information to verify which mesh was clicked and which organ it maps to.
- Keep the change local to the generic viewer and avoid adding external storage or product-specific workflows.

## FBX Evidence

The model at `public/models/hetieuhoa.fbx` contains these geometry meshes:

| Mesh name | Vertices | Proposed organ |
| --- | ---: | --- |
| `digestive_system001` | 7,830 | Dạ dày group |
| `digestive_system003` | 17,550 | Dạ dày group |
| `digestive_system005` | 4,938 | Thực quản |
| `digestive_system009` | 61,296 | Ruột non |
| `digestive_system008` | 137,280 | Ruột già |
| `digestive_system006` | 14,934 | Gan |
| `digestive_system007` | 7,764 | Túi mật |
| `digestive_system010` | 8,832 | Tụy |
| `digestive_system004` | 25,368 | Miệng / vùng trên |

`digestive_system` and `digestive_system002` have 0 vertices and should not be selectable organs.

## Data Model

`organConfig.ts` will keep one entry per logical organ. Each entry includes a stable `nodeName`, a `meshNames` array, and existing localized name/description keys.

The initial mapping is:

| Organ id | Mesh names |
| --- | --- |
| `da_day` | `digestive_system001`, `digestive_system003` |
| `thuc_quan` | `digestive_system005` |
| `ruot_non` | `digestive_system009` |
| `ruot_gia` | `digestive_system008` |
| `gan` | `digestive_system006` |
| `tui_mat` | `digestive_system007` |
| `tuy` | `digestive_system010` |
| `mieng` | `digestive_system004` |

The config will expose helpers for both directions: organ lookup by organ id and organ lookup by mesh name.

## Interaction Flow

When the FBX loads, `DigestiveModel` traverses all meshes. For each mesh whose name appears in the mapping, it stores the logical organ id in `mesh.userData.organName` and registers the mesh under that organ id in viewer state.

When the user clicks a mapped mesh, the viewer selects the logical organ id, not the raw mesh name. Existing UI then uses that organ id to show the localized info card, highlight the selected mesh group, and fly the camera toward the selected part. Clicking unmapped or empty meshes does not select an organ.

For organs with multiple meshes, selection should behave as one organ. The dạ dày group is the initial case, using both `digestive_system001` and `digestive_system003`.

## Debug Panel

Add a small debug panel component under `src/components/viewer/`. The toolbar gets a secondary toggle button, localized in English and Vietnamese, to show or hide the panel.

The panel shows:

- Current selected organ id.
- Last clicked mesh name and the organ it mapped to.
- Registered organ-to-mesh mappings.
- Model mesh names that are present but not selectable.
- Empty meshes with 0 vertices when known.

This panel is intentionally local to the viewer and uses React state only. It is not persisted and does not introduce external storage.

## Testing

Add or update focused tests near the changed code:

- `organConfig.test.ts` verifies all mapped mesh names are real, organ ids are unique, mesh names are unique, and mesh lookup returns the correct organ.
- `DigestiveModel.test.tsx` verifies raw mesh clicks select the logical organ id and multi-mesh organs register correctly.
- Toolbar/debug panel tests verify the debug toggle appears, can open/close the panel, and displays mapped/clicked state.
- Existing highlighter and camera tests should continue to pass with logical organ ids.

Run `pnpm l10n:validate` after locale updates and run the focused viewer tests before broader checks.

## Out Of Scope

- Editing or renaming the FBX asset.
- Persisting mapping changes from the UI.
- Adding analytics, storage, narration, or extra product workflows.
- Reworking the general app shell outside what the viewer route needs.
