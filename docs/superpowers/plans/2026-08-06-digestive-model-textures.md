# Digestive Model Textures Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the existing digestive system color texture and normal map from `public/textures/` to non-empty meshes in the FBX digestive model.

**Architecture:** Add a focused `modelMaterials.ts` helper that loads public texture assets and creates `THREE.MeshStandardMaterial` instances. `DigestiveModel` applies one material instance per non-empty mesh during FBX traversal, leaving organ mapping, click selection, highlighting, debug state, and camera behavior unchanged.

**Tech Stack:** React 19, TypeScript, Three.js, @react-three/drei FBX loading, Vitest.

---

## File Structure

- Create `src/components/viewer/modelMaterials.ts`: own texture URL constants, texture loading, texture configuration, and material creation.
- Create `src/components/viewer/__tests__/modelMaterials.test.ts`: verify texture URLs and material construction behavior.
- Modify `src/components/viewer/DigestiveModel.tsx`: apply a textured material to every non-empty mesh during traversal.
- Modify `src/components/viewer/__tests__/DigestiveModel.test.tsx`: verify non-empty meshes receive texture material and empty meshes do not.

---

### Task 1: Texture Material Helper

**Files:**
- Create: `src/components/viewer/modelMaterials.ts`
- Create: `src/components/viewer/__tests__/modelMaterials.test.ts`

- [ ] **Step 1: Write the failing helper tests**

Create `src/components/viewer/__tests__/modelMaterials.test.ts`:

```ts
import * as THREE from 'three'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  DIGESTIVE_COLOR_TEXTURE_URL,
  DIGESTIVE_NORMAL_TEXTURE_URL,
  createDigestiveMeshMaterial,
} from '../modelMaterials'

const loadedTextures = new Map<string, THREE.Texture>()

vi.mock('three', async () => {
  const actual = await vi.importActual<typeof import('three')>('three')

  class MockTextureLoader {
    load(url: string) {
      const texture = new actual.Texture()
      loadedTextures.set(url, texture)
      return texture
    }
  }

  return {
    ...actual,
    TextureLoader: MockTextureLoader,
  }
})

describe('modelMaterials', () => {
  beforeEach(() => {
    loadedTextures.clear()
  })

  it('uses the public digestive texture asset URLs', () => {
    expect(DIGESTIVE_COLOR_TEXTURE_URL).toBe('/textures/digestive system.png')
    expect(DIGESTIVE_NORMAL_TEXTURE_URL).toBe('/textures/digestive system normalmap.png')
  })

  it('creates a standard material with color and normal textures', () => {
    const material = createDigestiveMeshMaterial()

    expect(material).toBeInstanceOf(THREE.MeshStandardMaterial)
    expect(loadedTextures.has(DIGESTIVE_COLOR_TEXTURE_URL)).toBe(true)
    expect(loadedTextures.has(DIGESTIVE_NORMAL_TEXTURE_URL)).toBe(true)
    expect(material.map).toBe(loadedTextures.get(DIGESTIVE_COLOR_TEXTURE_URL))
    expect(material.normalMap).toBe(loadedTextures.get(DIGESTIVE_NORMAL_TEXTURE_URL))
  })

  it('configures textures for color and repeat-safe wrapping', () => {
    const material = createDigestiveMeshMaterial()

    expect(material.map?.colorSpace).toBe(THREE.SRGBColorSpace)
    expect(material.map?.wrapS).toBe(THREE.RepeatWrapping)
    expect(material.map?.wrapT).toBe(THREE.RepeatWrapping)
    expect(material.normalMap?.wrapS).toBe(THREE.RepeatWrapping)
    expect(material.normalMap?.wrapT).toBe(THREE.RepeatWrapping)
  })
})
```

- [ ] **Step 2: Run helper tests to verify failure**

Run: `pnpm test src/components/viewer/__tests__/modelMaterials.test.ts`

Expected: FAIL because `modelMaterials.ts` does not exist.

- [ ] **Step 3: Implement the helper**

Create `src/components/viewer/modelMaterials.ts`:

```ts
import * as THREE from 'three'

export const DIGESTIVE_COLOR_TEXTURE_URL = '/textures/digestive system.png'
export const DIGESTIVE_NORMAL_TEXTURE_URL = '/textures/digestive system normalmap.png'

function loadTexture(url: string, colorSpace?: THREE.ColorSpace): THREE.Texture {
  const texture = new THREE.TextureLoader().load(url)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping

  if (colorSpace) texture.colorSpace = colorSpace

  return texture
}

export function createDigestiveMeshMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    map: loadTexture(DIGESTIVE_COLOR_TEXTURE_URL, THREE.SRGBColorSpace),
    normalMap: loadTexture(DIGESTIVE_NORMAL_TEXTURE_URL),
    roughness: 0.72,
    metalness: 0,
  })
}
```

- [ ] **Step 4: Run helper tests**

Run: `pnpm test src/components/viewer/__tests__/modelMaterials.test.ts`

Expected: PASS.

- [ ] **Step 5: Run TypeScript check**

Run: `npx tsc --noEmit`

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/components/viewer/modelMaterials.ts src/components/viewer/__tests__/modelMaterials.test.ts docs/superpowers/specs/2026-08-06-digestive-model-textures-design.md docs/superpowers/plans/2026-08-06-digestive-model-textures.md
git commit -m "feat: add digestive model texture material"
```

If the workspace is not a git repository, skip the commit and report that no commit was made.

---

### Task 2: Apply Textured Material To FBX Meshes

**Files:**
- Modify: `src/components/viewer/DigestiveModel.tsx`
- Modify: `src/components/viewer/__tests__/DigestiveModel.test.tsx`

- [ ] **Step 1: Write failing model material tests**

In `src/components/viewer/__tests__/DigestiveModel.test.tsx`, add `createDigestiveMeshMaterial` to the hoisted mocks:

```ts
const { fbx, normalizeModelForViewer, primitiveProps, createDigestiveMeshMaterial } = vi.hoisted(() => {
  const children: object[] = []

  return {
    fbx: {
      add: (child: object) => children.push(child),
      clear: () => {
        children.length = 0
      },
      traverse: (visitor: (child: object) => void) => children.forEach(visitor),
    },
    normalizeModelForViewer: vi.fn(),
    primitiveProps: [] as Record<string, unknown>[],
    createDigestiveMeshMaterial: vi.fn(() => new THREE.MeshStandardMaterial({ color: 0xff7777 })),
  }
})
```

Add this mock near the existing `modelTransform` mock:

```ts
vi.mock('../modelMaterials', () => ({
  createDigestiveMeshMaterial,
}))
```

Clear the mock in `beforeEach`:

```ts
createDigestiveMeshMaterial.mockClear()
```

Add this test:

```ts
it('applies digestive texture materials to non-empty meshes only', () => {
  const texturedMaterial = new THREE.MeshStandardMaterial({ color: 0xff7777 })
  createDigestiveMeshMaterial.mockReturnValueOnce(texturedMaterial)
  const nonEmptyMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
  nonEmptyMesh.name = 'digestive_system003'
  const emptyMesh = new THREE.Mesh(new THREE.BufferGeometry())
  const emptyMaterial = new THREE.MeshBasicMaterial()
  emptyMesh.name = 'digestive_system002'
  emptyMesh.material = emptyMaterial
  fbx.add(nonEmptyMesh)
  fbx.add(emptyMesh)

  renderWithViewer(<DigestiveModel />)

  expect(createDigestiveMeshMaterial).toHaveBeenCalledTimes(1)
  expect(nonEmptyMesh.material).toBe(texturedMaterial)
  expect(emptyMesh.material).toBe(emptyMaterial)
})
```

Ensure the existing click mapping tests still assert `setSelectedOrgan('da_day')` for `digestive_system003`.

- [ ] **Step 2: Run model tests to verify failure**

Run: `pnpm test src/components/viewer/__tests__/DigestiveModel.test.tsx`

Expected: FAIL because `DigestiveModel` does not apply texture materials yet.

- [ ] **Step 3: Apply material in `DigestiveModel`**

In `src/components/viewer/DigestiveModel.tsx`, add import:

```ts
import { createDigestiveMeshMaterial } from './modelMaterials'
```

Inside the traversal, after `vertexCount` is calculated and before debug registration returns for empty meshes, assign material only when `vertexCount > 0`:

```ts
if (vertexCount > 0) {
  child.material = createDigestiveMeshMaterial()
}
```

The surrounding traversal should still:

- Register debug metadata for every mesh.
- Leave empty meshes unmodified.
- Map and register selectable organs exactly as before.

- [ ] **Step 4: Run focused model tests**

Run: `pnpm test src/components/viewer/__tests__/DigestiveModel.test.tsx src/components/viewer/__tests__/OrganHighlighter.test.tsx`

Expected: PASS.

- [ ] **Step 5: Run all viewer tests and TypeScript**

Run: `pnpm test src/components/viewer/__tests__`

Expected: PASS.

Run: `npx tsc --noEmit`

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/components/viewer/DigestiveModel.tsx src/components/viewer/__tests__/DigestiveModel.test.tsx
git commit -m "feat: texture digestive model meshes"
```

If the workspace is not a git repository, skip the commit and report that no commit was made.

---

## Self-Review Notes

- Spec coverage: Task 1 covers texture URL loading and material creation. Task 2 covers material assignment to non-empty FBX meshes while preserving mapping and highlight behavior.
- Placeholder scan: No placeholders or deferred implementation remain.
- Type consistency: `createDigestiveMeshMaterial` returns `THREE.MeshStandardMaterial`; `DigestiveModel` assigns it to `THREE.Mesh.material` only for non-empty meshes.
