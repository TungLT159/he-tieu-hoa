# Tutorial Focus Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Shrink the tutorial focus for the central 3D interaction area and keep the tutorial card beside the focus without overflowing the viewport.

**Architecture:** Keep the change inside the existing viewer-v2 tutorial layer. `tutorialSteps.ts` owns per-step configuration, while `ViewerTutorialOverlay.tsx` derives a measured focus rectangle and positions the card from that rectangle. No viewer state, 3D scene, localization, or audio behavior changes are required.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, Tailwind utility classes.

---

## File Structure

- Modify: `src/components/viewer-v2/tutorial/tutorialSteps.ts`
  - Add optional `focusScale?: number` to `TutorialStep`.
  - Set the `viewer-area` step to `placement: 'right'` and `focusScale: 0.6`.
- Modify: `src/components/viewer-v2/tutorial/ViewerTutorialOverlay.tsx`
  - Add a helper to shrink a `TargetRect` around its center.
  - Apply the active step's optional `focusScale` before spotlight and card positioning.
  - Adjust card positioning to clamp the effective card bounds inside the viewport.
- Modify: `src/components/viewer-v2/tutorial/__tests__/ViewerTutorialOverlay.test.tsx`
  - Add tests for scaled spotlight dimensions and panel clamping.
  - Update local test steps so the first step mirrors the approved side placement and focus scale.

## Task 1: Add Failing Tests For Scaled Focus And Viewport-Safe Card

**Files:**
- Modify: `src/components/viewer-v2/tutorial/__tests__/ViewerTutorialOverlay.test.tsx`

- [ ] **Step 1: Write failing tests**

Patch `src/components/viewer-v2/tutorial/__tests__/ViewerTutorialOverlay.test.tsx`:

```tsx
const baseSteps: TutorialStep[] = [
  {
    id: 'viewer-area',
    targetId: 'viewer-area',
    titleKey: 'viewer.tutorial.steps.viewerArea.title',
    descriptionKey: 'viewer.tutorial.steps.viewerArea.description',
    audioFile: 'day_la_khu_vuc_de_tuong_tac_voi_mo_hinh_3d.mp3',
    placement: 'right',
    focusScale: 0.6,
    action: { type: 'reset' },
  },
  {
    id: 'annotation',
    targetId: 'annotation-toolbar',
    titleKey: 'viewer.tutorial.steps.annotation.title',
    descriptionKey: 'viewer.tutorial.steps.annotation.description',
    audioFile: 'nut_de_battat_che_do_ve_chu_thich.mp3',
    placement: 'top',
    action: { type: 'drawing', value: true },
  },
]
```

Add these helpers after `createViewerValue`:

```tsx
function setViewport(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: height })
}

function setTutorialTargetRect(target: HTMLElement, rect: DOMRectInit) {
  target.getBoundingClientRect = vi.fn(() => ({
    x: rect.x ?? rect.left ?? 0,
    y: rect.y ?? rect.top ?? 0,
    top: rect.top ?? rect.y ?? 0,
    left: rect.left ?? rect.x ?? 0,
    right: rect.right ?? (rect.left ?? rect.x ?? 0) + (rect.width ?? 0),
    bottom: rect.bottom ?? (rect.top ?? rect.y ?? 0) + (rect.height ?? 0),
    width: rect.width ?? 0,
    height: rect.height ?? 0,
    toJSON: () => ({}),
  } as DOMRect))
}
```

Change `renderTutorial` so the viewer and annotation targets are queryable by test id:

```tsx
        <div data-testid="viewer-area-target" data-tutorial-target="viewer-area">viewer</div>
        <div data-testid="annotation-toolbar-target" data-tutorial-target="annotation-toolbar">annotation</div>
```

Add this cleanup to `beforeEach`:

```tsx
    setViewport(1024, 768)
```

Add these tests before the skip tutorial test:

```tsx
  it('shrinks the viewer-area spotlight around the target center', async () => {
    renderTutorial()
    setTutorialTargetRect(screen.getByTestId('viewer-area-target'), {
      top: 40,
      left: 100,
      width: 800,
      height: 500,
    })

    act(() => {
      vi.advanceTimersByTime(80)
    })

    expect(screen.getByTestId('tutorial-spotlight')).toHaveStyle({
      top: '132px',
      left: '252px',
      width: '496px',
      height: '316px',
    })
  })

  it('keeps the side-placed tutorial card inside the viewport', async () => {
    setViewport(640, 480)
    renderTutorial()
    setTutorialTargetRect(screen.getByTestId('viewer-area-target'), {
      top: 20,
      left: 120,
      width: 620,
      height: 440,
    })

    act(() => {
      vi.advanceTimersByTime(80)
    })

    expect(screen.getByTestId('viewer-tutorial-card')).toHaveStyle({
      top: '178px',
      left: '304px',
      transform: 'none',
    })
  })
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pnpm test -- src/components/viewer-v2/tutorial/__tests__/ViewerTutorialOverlay.test.tsx
```

Expected: FAIL because `focusScale` does not exist on `TutorialStep`, the spotlight is still full-size, or card placement still uses transformed coordinates.

## Task 2: Implement Scaled Focus Rect And Safe Card Positioning

**Files:**
- Modify: `src/components/viewer-v2/tutorial/tutorialSteps.ts`
- Modify: `src/components/viewer-v2/tutorial/ViewerTutorialOverlay.tsx`

- [ ] **Step 1: Add focusScale to tutorial step config**

Patch `src/components/viewer-v2/tutorial/tutorialSteps.ts`:

```ts
export interface TutorialStep {
  id: string
  targetId: string
  titleKey: TranslationKey
  descriptionKey: TranslationKey
  audioFile: string
  placement: TutorialPlacement
  focusScale?: number
  action?: TutorialAction
}
```

Update the `viewer-area` step:

```ts
  {
    id: 'viewer-area',
    targetId: 'viewer-area',
    titleKey: 'viewer.tutorial.steps.viewerArea.title',
    descriptionKey: 'viewer.tutorial.steps.viewerArea.description',
    audioFile: 'day_la_khu_vuc_de_tuong_tac_voi_mo_hinh_3d.mp3',
    placement: 'right',
    focusScale: 0.6,
    action: { type: 'reset' },
  },
```

- [ ] **Step 2: Add scaled rect helper**

Patch `src/components/viewer-v2/tutorial/ViewerTutorialOverlay.tsx` after `readTargetRect`:

```tsx
function applyFocusScale(rect: TargetRect | null, focusScale?: number): TargetRect | null {
  if (!rect || !focusScale || focusScale >= 1) return rect

  const width = rect.width * focusScale
  const height = rect.height * focusScale

  return {
    top: rect.top + (rect.height - height) / 2,
    left: rect.left + (rect.width - width) / 2,
    width,
    height,
  }
}
```

- [ ] **Step 3: Replace card positioning logic**

Replace `getCardPosition` in `src/components/viewer-v2/tutorial/ViewerTutorialOverlay.tsx` with:

```tsx
function getCardPosition(rect: TargetRect | null, placement: TutorialPlacement) {
  const viewportWidth = window.innerWidth || 1024
  const viewportHeight = window.innerHeight || 768
  const cardWidth = Math.min(CARD_WIDTH, viewportWidth - VIEWPORT_PADDING * 2)
  const cardHeight = 224

  if (!rect || placement === 'center') {
    return {
      top: clamp(viewportHeight / 2 - cardHeight / 2, VIEWPORT_PADDING, viewportHeight - cardHeight - VIEWPORT_PADDING),
      left: clamp(viewportWidth / 2 - cardWidth / 2, VIEWPORT_PADDING, viewportWidth - cardWidth - VIEWPORT_PADDING),
      transform: 'none',
    }
  }

  const centeredTop = rect.top + rect.height / 2 - cardHeight / 2
  const centeredLeft = rect.left + rect.width / 2 - cardWidth / 2
  const positions = {
    top: {
      top: rect.top - cardHeight - TARGET_PADDING,
      left: centeredLeft,
      transform: 'none',
    },
    right: {
      top: centeredTop,
      left: rect.left + rect.width + TARGET_PADDING,
      transform: 'none',
    },
    bottom: {
      top: rect.top + rect.height + TARGET_PADDING,
      left: centeredLeft,
      transform: 'none',
    },
    left: {
      top: centeredTop,
      left: rect.left - cardWidth - TARGET_PADDING,
      transform: 'none',
    },
  }

  const position = positions[placement]
  return {
    ...position,
    top: clamp(position.top, VIEWPORT_PADDING, viewportHeight - cardHeight - VIEWPORT_PADDING),
    left: clamp(position.left, VIEWPORT_PADDING, viewportWidth - cardWidth - VIEWPORT_PADDING),
  }
}
```

- [ ] **Step 4: Apply focusScale before computing card and spotlight**

In `ViewerTutorialOverlay`, add a memoized focus rect before `cardPosition`:

```tsx
  const focusRect = useMemo(
    () => applyFocusScale(targetRect, step?.focusScale),
    [step?.focusScale, targetRect],
  )
```

Then update `cardPosition`:

```tsx
  const cardPosition = useMemo(
    () => getCardPosition(focusRect, step?.placement ?? 'center'),
    [focusRect, step?.placement],
  )
```

Then update spotlight to use `focusRect`:

```tsx
  const spotlight = focusRect
    ? {
        top: focusRect.top - TARGET_PADDING,
        left: focusRect.left - TARGET_PADDING,
        width: focusRect.width + TARGET_PADDING * 2,
        height: focusRect.height + TARGET_PADDING * 2,
      }
    : null
```

Update the card class condition to use `focusRect`:

```tsx
          focusRect && step.placement !== 'center' && 'before:absolute before:size-3 before:rotate-45 before:border before:border-border before:bg-card',
```

- [ ] **Step 5: Run focused tests**

Run:

```bash
pnpm test -- src/components/viewer-v2/tutorial/__tests__/ViewerTutorialOverlay.test.tsx
```

Expected: PASS.

## Task 3: Verify Contracts And Type Safety

**Files:**
- Verify: `src/components/viewer-v2/tutorial/ViewerTutorialOverlay.tsx`
- Verify: `src/components/viewer-v2/tutorial/tutorialSteps.ts`
- Verify: `src/components/viewer-v2/tutorial/__tests__/ViewerTutorialOverlay.test.tsx`

- [ ] **Step 1: Run tutorial and step config tests**

Run:

```bash
pnpm test -- src/components/viewer-v2/tutorial/__tests__/ViewerTutorialOverlay.test.tsx src/components/viewer-v2/tutorial/__tests__/tutorialSteps.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run TypeScript check**

Run:

```bash
npx tsc --noEmit
```

Expected: PASS with no TypeScript diagnostics.

- [ ] **Step 3: Run l10n validation only if locale files changed**

This plan should not change locale files. If implementation unexpectedly changes `src/lib/locales/en.json` or `src/lib/locales/vi.json`, run:

```bash
pnpm l10n:validate
```

Expected: PASS.

- [ ] **Step 4: Inspect git diff for intended scope**

Run:

```bash
git diff -- src/components/viewer-v2/tutorial/ViewerTutorialOverlay.tsx src/components/viewer-v2/tutorial/tutorialSteps.ts src/components/viewer-v2/tutorial/__tests__/ViewerTutorialOverlay.test.tsx docs/superpowers/specs/2026-08-20-tutorial-focus-panel-design.md docs/superpowers/plans/2026-08-20-tutorial-focus-panel.md
```

Expected: Diff only contains tutorial focus scaling, card clamping, focused tests, and the spec/plan docs.

## Commit Guidance

Do not commit unrelated existing worktree changes. If committing is requested after implementation, stage only these files:

```bash
git add docs/superpowers/specs/2026-08-20-tutorial-focus-panel-design.md docs/superpowers/plans/2026-08-20-tutorial-focus-panel.md src/components/viewer-v2/tutorial/ViewerTutorialOverlay.tsx src/components/viewer-v2/tutorial/tutorialSteps.ts src/components/viewer-v2/tutorial/__tests__/ViewerTutorialOverlay.test.tsx
git commit -m "fix: keep tutorial focus panel in view"
```

## Self-Review

- Spec coverage: The plan adds `focusScale`, shrinks the first-step spotlight to 60%, moves the first-step panel beside the focus, clamps card bounds, and verifies the behavior with focused tests.
- Placeholder scan: No `TBD`, `TODO`, or unspecified implementation steps remain.
- Type consistency: The plan consistently uses `focusScale?: number`, `TargetRect`, `applyFocusScale`, and existing `TutorialPlacement` values.
