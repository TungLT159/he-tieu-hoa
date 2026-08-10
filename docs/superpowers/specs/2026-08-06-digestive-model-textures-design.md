# Digestive Model Textures Design

**Created:** 2026-08-06
**Status:** Approved for implementation planning

## Overview

Use the existing files in `public/textures/` to create a shared material for the digestive FBX model. The model currently relies on FBX-provided/default materials; applying the provided color texture and normal map should make the model surface more detailed while preserving click selection, highlighting, zoom, and debug behavior.

## Texture Assets

Use these public assets:

- `/textures/digestive system.png` as the base color map.
- `/textures/digestive system normalmap.png` as the normal map.

## Approach

Create a small `modelMaterials.ts` module in `src/components/viewer/`. It loads both textures with `THREE.TextureLoader`, configures color space and wrapping/repeat-safe defaults, and exposes a helper that creates a `THREE.MeshStandardMaterial` for digestive model meshes.

`DigestiveModel` will apply a cloned material to every mesh with geometry vertices during FBX traversal. Empty meshes remain unmodified. Organ mapping and click behavior remain unchanged.

`OrganHighlighter` already clones selected materials and restores originals, so the textured material becomes the original material for highlight/restore purposes.

## Testing

Add focused tests to verify:

- The material helper loads the color and normal map from the expected public texture URLs.
- `DigestiveModel` applies a textured material to non-empty meshes.
- Empty meshes are not assigned the texture material.
- Existing click-to-organ mapping still works after material assignment.

## Out Of Scope

- Per-organ texture assignment.
- Adding new texture assets.
- Editing UVs, FBX geometry, or texture files.
- Changing highlight color, camera behavior, or organ mapping.
