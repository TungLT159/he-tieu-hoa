# Tutorial Focus Panel Design

**Date:** 2026-08-20
**Status:** Approved

## Goal

Refine the viewer tutorial so the first step focuses attention on the central 3D interaction area instead of spotlighting the full canvas. The instruction panel should sit beside the focused area when space allows and must never overflow outside the viewport.

## Approved Direction

Use a configurable per-step focus scale:

- Add an optional `focusScale` field to tutorial steps.
- Apply `focusScale` by shrinking the target rectangle around its center before rendering the spotlight and positioning the panel.
- Set the `viewer-area` step to approximately `0.6`, creating a spotlight around the center 55-65% of the canvas.
- Place the first-step panel beside that focused area instead of centered over it.
- Clamp panel position to the viewport using the effective card size so it stays visible on desktop and small screens.

## Behavior

The overlay continues to read tutorial targets from `data-tutorial-target`. When a step defines `focusScale`, the overlay computes a derived focus rectangle:

- Width and height are multiplied by the scale.
- The derived rectangle remains centered on the original target.
- Existing spotlight padding is applied after the scale.

For `viewer-area`, this means the full canvas remains the measured target, but the spotlight only covers the central interaction region. Other tutorial steps keep their current full-target spotlight behavior unless they opt into `focusScale` later.

Panel placement should continue to respect each step's `placement`. For the first step, use a side placement such as `right` so the panel appears near the focused area. If the preferred side lacks space, clamping keeps the panel fully inside the viewport.

## Components

`src/components/viewer-v2/tutorial/tutorialSteps.ts`

- Extend `TutorialStep` with optional `focusScale`.
- Change `viewer-area` placement from centered to a side placement.
- Set `viewer-area.focusScale` to `0.6`.

`src/components/viewer-v2/tutorial/ViewerTutorialOverlay.tsx`

- Apply the optional focus scale while reading the target rect or before deriving spotlight/card positions.
- Keep the implementation local to the tutorial overlay; no viewer state changes are needed.
- Improve card clamping so the card does not overflow the viewport after transforms.

## Testing

Add focused tests near the existing tutorial overlay tests:

- A `viewer-area` target with a known bounding rectangle produces a smaller spotlight centered on the original target.
- The tutorial card remains within viewport bounds for side placement.
- Existing tutorial navigation, audio, and action tests remain valid.

## Out Of Scope

- Detecting the actual 3D mesh bounds in WebGL.
- Reworking all tutorial step placements.
- Changing tutorial copy, audio, route behavior, or viewer camera behavior.
