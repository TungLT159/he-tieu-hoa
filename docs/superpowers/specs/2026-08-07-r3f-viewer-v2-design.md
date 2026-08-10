# R3F Viewer v2 — Nang cao chat luong mo hinh 3D

> **Status:** Approved | **Date:** 2026-08-07

## Overview

Viet lai toan bo 3D viewer tu FBX sang GLTF pipeline, them post-processing (bloom, SSAO, DOF), environment HDR lighting, PBR materials voi custom shaders, animation spring-based, particle effects, outline selection, va toi uu model voi LOD.

## Scope

6 huong cai tien trong 1 plan:

1. **Post-Processing** — Bloom (selective), SSAO, Depth of Field qua `@react-three/postprocessing`
2. **Anh sang nang cao** — HDR environment map, 3-point lighting, soft shadows
3. **Materials PBR + Custom Shaders** — MeshPhysicalMaterial, PBR textures, highlight shader
4. **Animation + Particle Effects** — Spring transitions, idle breathing/float, dissolve particles
5. **Outline/X-ray + Selection FX** — Selective outline layer + bloom khi chon organ
6. **Toi uu Model** — FBX -> GLTF, LOD, compression

## Architecture

### Cau truc file moi

```
src/components/viewer-v2/
├── scene/
│   ├── SceneSetup.tsx          # Canvas, lighting, environment, post-processing compose
│   ├── EnvironmentLighting.tsx  # HDR environment map + 3-point lights + soft shadows
│   └── PostProcessing.tsx       # EffectComposer: Bloom (selective), SSAO, DOF
├── model/
│   ├── ModelLoader.tsx          # useGLTF loader thay useFBX
│   ├── ModelMaterials.tsx       # MeshPhysicalMaterial + PBR texture maps
│   ├── ModelTransform.tsx       # Normalize scale (ported tu viewer cu)
│   └── OrganRegistry.tsx        # Map<organKey, THREE.Mesh[]> tu GLTF scene
├── effects/
│   ├── SelectionOutline.tsx     # Selective outline layer + bloom highlight
│   ├── HighlightShader.tsx      # Custom shader highlight (thay emissive cu)
│   └── ParticleEffects.tsx      # Particle burst khi chuyen organ
├── camera/
│   ├── CameraController.tsx     # OrbitControls + smooth lerp to organ
│   └── AutoTourController.tsx   # Fly camera auto-tour (ported tu viewer cu)
├── animation/
│   ├── OrganTransition.tsx      # Spring opacity/scale dissolve giua cac organ
│   └── IdleAnimation.tsx        # Breathing + gentle float khi idle
├── ui/
│   ├── OrganInfoCard.tsx        # Ported, cap nhat organ data moi
│   ├── DebugPanel.tsx           # Ported, cap nhat mesh metadata
│   └── ColorPickerPopover.tsx   # Ported, cap nhat model/background color
├── ViewerV2Page.tsx             # Top-level page component
├── ViewerV2Provider.tsx         # Context provider (gọn hơn viewer cu)
└── viewerV2Context.ts           # Context types + hooks
```

### Data flow

```
GLTF Model (.glb)
  │
  └─► ModelLoader (useGLTF)
       ├─► OrganRegistry: traverse scene -> Map<organKey, Mesh[]>
       ├─► ModelMaterials: apply MeshPhysicalMaterial + PBR maps
       └─► ModelTransform: normalize to 4-unit bounding sphere
            │
Canvas (R3F) ─► SceneSetup
  ├─ EnvironmentLighting: HDR envMap + key/fill/rim lights + shadowMap
  ├─ <group ref={modelRef}>
  │    ├─ OrganTransition (spring opacity/scale dissolve)
  │    ├─ SelectionOutline (selective outline layer)
  │    ├─ IdleAnimation (useFrame breathing + float)
  │    └─ ParticleEffects (burst on organ switch)
  └─ PostProcessing (EffectComposer)
       ├─ SelectiveBloom (render layer: outline only)
       ├─ SSAO (ambient occlusion)
       └─ DepthOfField (active on zoom)
```

### Context (ViewerV2Context)

| Nhom | State | Type |
|-------|-------|------|
| Selection | `selectedOrgan`, `hoveredOrgan` | `OrganKey \| null` |
| Camera | `cameraTarget`, `defaultPosition` | `THREE.Vector3` |
| Menu | `activeSheet`, `activeDialog` | `ActiveSheet \| null`, `ActiveDialog \| null` |
| Colors | `modelColor`, `backgroundColor` | `string` |
| Playback | `isAutoRotating`, `isFlyCameraActive` | `boolean` |
| Debug | `showDebugPanel`, `organMeshes` | `boolean`, `Map<OrganKey, Mesh[]>` |

### Component tree

```
ViewerV2Provider
  └─ ViewerV2Page
       ├─ DigestiveCanvas (R3F Canvas)
       │    ├─ SceneSetup
       │    │    ├─ EnvironmentLighting
       │    │    ├─ PostProcessing
       │    │    ├─ ModelLoader
       │    │    │    ├─ OrganRegistry
       │    │    │    ├─ ModelMaterials
       │    │    │    └─ ModelTransform
       │    │    ├─ SelectionOutline
       │    │    ├─ HighlightShader
       │    │    ├─ ParticleEffects
       │    │    ├─ OrganTransition
       │    │    ├─ IdleAnimation
       │    │    ├─ CameraController
       │    │    ├─ AutoTourController
       │    │    └─ BackgroundClickPlane
       │    └─ HTML Overlay
       │         ├─ OrganInfoCard
       │         └─ DebugPanel
       ├─ SideMenu (giu nguyen tu viewer cu)
       ├─ ViewerSettings (giu nguyen)
       ├─ ViewerAnnotation (giu nguyen)
       └─ ColorPickerPopover (ported)
```

## Technical Decisions

### FBX -> GLTF Migration

- Dung `@gltf-transform/cli` hoac Blender CLI script de convert `hetieuhoa.fbx` -> `hetieuhoa.glb`
- GLTF duoc R3F `useGLTF` ho tro native, khong can `FBXLoader`
- Luu GLTF vao `public/models/hetieuhoa.glb` va `src-tauri/resources/hetieuhoa.glb`
- Texture already in `public/textures/` — keep, reference from GLTF

### Post-Processing Pipeline

- `@react-three/postprocessing` cung cap EffectComposer, SelectiveBloom, SSAO, DepthOfField
- SelectiveBloom: dung `selection` prop de chi bloom tren outline layer
- SSAO: cai dat nhe de tang chieu sau, khong lam nang performance
- DOF: chi active khi camera zoom gan 1 organ (distance-based toggle)

### PBR Materials

- `MeshPhysicalMaterial` thay `MeshStandardMaterial`
- Texture maps: color (`map`), normal (`normalMap`), roughness (`roughnessMap`), metalness (`metalnessMap`)
- Fallback: neu thieu texture -> dung gia tri solid (roughness=0.6, metalness=0.1)
- Highlight: custom ShaderMaterial thay doi emissive tren material goc

### Outline Selection

- Dung `Select` component tu `@react-three/postprocessing` + `SelectiveBloom`
- Organ duoc chon -> outline glow qua selective bloom layer
- Khong con dung emissive thay doi material nhu viewer cu

### Animation

- `@react-spring/three` cho spring-based transitions (opacity, scale, position)
- OrganTransition: dissolve (opacity 1->0 + scale 0.9->1) khi chuyen organ
- IdleAnimation: `useFrame` breathing (scale sin wave) + gentle Y float
- ParticleEffects: `useFrame` particle system don gian (points di chuyen + fade)

### Model Optimization

- LOD: `useGLTF` + `drei` LOD component cho 3 muc do chi tiet
- Compression: Draco mesh compression trong GLTF pipeline
- Texture: Khong vuot qua 2048x2048, dung WebP format neu can

## Error Handling

| Scenario | Handling |
|----------|----------|
| GLTF load fail | ErrorBoundary + fallback UI "Khong tai duoc mo hinh" + retry button |
| Texture thieu | Fallback solid color tu organConfig |
| WebGL khong ho tro | Detect + notification + render simplified mode (khong post-processing) |
| Post-processing crash | ErrorBoundary bao EffectComposer, fallback ve raw render |
| HDR env fail | Fallback gradient sky + ambient light co ban |

## Dependencies

### New
- `@react-three/postprocessing` — bloom, SSAO, outline, DOF
- `@react-spring/three` — spring animations cho R3F

### Removed (from viewer cu)
- Khong xoa `three-stdlib` (van dung cho OrbitControls types)

### Keep
- `three`, `@react-three/fiber`, `@react-three/drei`

## Testing Strategy

- **Unit:** Vitest + R3F mock cho tung component (ModelLoader, OrganRegistry, SelectionOutline...)
- **Integration:** Test pipeline GLTF load -> material apply -> highlight -> selection
- **Smoke:** Playwright test verify canvas render + side menu + organ click
- **Coverage:** Giu >= muc hien tai (v8 provider)

## Migration Plan

1. Tao `src/components/viewer-v2/` song song voi `viewer/` hien tai
2. Build tung component trong `viewer-v2/`, test doc lap
3. Convert FBX -> GLTF script
4. Khi viewer-v2 pass toan bo test, swap `ViewerPage` import
5. Xoa `viewer/` cu, rename `viewer-v2/` -> `viewer/`

## Constraints (tu AGENTS.md)

- Giữ app generic: khong them product-specific workflows
- Dung shadcn/ui components cho UI overlay
- Giữ theme tokens, i18n, responsive layout
- Cap nhat locale keys trong `en.json`/`vi.json` neu co UI moi
- Khong them dependencies moi khong can thiet
