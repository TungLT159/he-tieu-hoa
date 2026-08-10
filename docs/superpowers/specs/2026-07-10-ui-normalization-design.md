# UI Normalization Design

## Context

This project is a generic Tauri + React starter app. It includes a fixed app shell, sidebar navigation, header actions, command palette, dashboard, component gallery, settings screen, theme support, and English/Vietnamese localization.

The UI work should preserve the starter-app identity. The goal is not a marketing redesign or a domain-specific workflow. The goal is to standardize the existing shell and fix UI issues that could make the starter feel inconsistent, fragile, or hard to copy into new apps.

Design read: a developer-facing starter app with a restrained product-shell language, shadcn/ui primitives, app-owned CSS tokens, low motion, and medium interface density.

Design dials:

- `DESIGN_VARIANCE: 4`
- `MOTION_INTENSITY: 2`
- `VISUAL_DENSITY: 5`

## Goals

- Keep the existing visual direction recognizable.
- Improve UI consistency across dashboard, settings, command palette, component gallery, and reusable patterns.
- Fix responsive layout issues in the shell, route content, grids, tabs, forms, and command palette.
- Improve contrast, focus states, hover states, and active states without changing component APIs.
- Keep all user-facing copy localized in `src/lib/locales/en.json` and `src/lib/locales/vi.json` if copy changes are needed.
- Add focused tests for changed UI contracts where practical.

## Non-Goals

- Do not add product-specific features, analytics, storage systems, or external integrations.
- Do not replace shadcn/ui primitives or introduce a new design system.
- Do not add new dependencies unless an existing UI bug cannot be fixed without one.
- Do not redesign the app into a landing page, portfolio, or branded product.
- Do not change routing, settings persistence, theme semantics, or localization architecture unless a UI fix requires a narrow adjustment.

## Approach

Use a conservative polish pass over the current UI. Keep the current CSS-token model and component structure, but normalize repeated patterns and harden responsive behavior.

Primary files likely to change:

- `src/index.css`
- `src/components/app-shell/AppSidebar.tsx`
- `src/components/app-shell/AppHeader.tsx`
- `src/components/command-palette/CommandPalette.tsx`
- `src/components/dashboard/DashboardPage.tsx`
- `src/components/gallery/ComponentsPage.tsx`
- `src/components/settings/SettingsPage.tsx`
- reusable pattern components under `src/components/patterns/`
- focused tests near changed behavior

## UI Standards

### Theme And Tokens

The app keeps app-owned CSS variables as the source of truth for light and dark mode. Changes should prefer semantic tokens over hard-coded colors. Light and dark modes should preserve similar hierarchy and contrast.

The current neutral shell can remain. The primary accent stays the existing blue role. Accent colors should not expand into unrelated section colors unless the component demonstrates status semantics.

### Typography

Typography should feel neutral and developer-tool appropriate. Avoid repeated hard-coded font declarations. If font tokens are introduced, they should remain generic and self-contained, with no external font loading requirement.

Page headings should keep strong hierarchy but avoid overflow on small screens. Eyebrow labels should be used sparingly and consistently.

### Layout

The shell remains fixed-height with route content scrolling inside `starter-content`. Mobile layout should collapse cleanly to a single-column shell without horizontal overflow.

Grids should use explicit responsive collapse rules. Tabs should wrap or scroll without breaking their container. Command palette content should fit narrow screens and constrain result list scrolling.

### Components And States

Interactive controls should have visible hover, focus, disabled, and active states. Buttons should keep readable text/background contrast in both themes.

Forms should use labels above or beside controls, not placeholder-only labels. Inputs, selects, switches, checkboxes, radios, and toggle groups should remain keyboard-friendly.

Cards and pattern demos should use consistent radius, spacing, borders, and dividers. Shadows should be restrained and tinted through existing tokens where possible.

### Motion

No new cinematic motion is needed. Keep motion to existing UI transitions and basic tactile feedback. Any added animation should respect reduced-motion preferences.

## Testing

Add or update focused tests where a UI contract can be asserted reliably:

- CSS shell layout and responsive rules where practical.
- Component render tests for command palette, settings, dashboard, or gallery changes.
- Existing pattern tests if reusable pattern markup or accessibility changes.

Manual and automated verification should include:

- `pnpm lint`
- `npx tsc --noEmit`
- `pnpm test`
- `pnpm build`
- `pnpm l10n:validate` if locale files change
- `pnpm playwright:smoke` if the local environment can run Playwright

## Risks And Mitigations

- Risk: polishing CSS changes visual behavior across many components. Mitigation: keep changes token-based and validate dashboard, settings, gallery, command palette, light mode, dark mode, desktop, and mobile.
- Risk: component gallery contains many demos with different layout needs. Mitigation: update shared utility classes first, then patch individual demos only when a concrete issue remains.
- Risk: mobile shell can become too tall if sidebar, header, and content all stack. Mitigation: explicitly test small viewport behavior and avoid fixed heights that hide controls.

## Acceptance Criteria

- The app keeps the current starter identity and does not introduce domain-specific UI.
- Shell, dashboard, settings, command palette, and component gallery render without obvious overflow or broken spacing on desktop and mobile.
- Light and dark themes preserve readable contrast for primary text, muted text, inputs, cards, and buttons.
- Interactive elements expose clear hover/focus/active states and remain keyboard accessible.
- Existing tests pass, and focused tests cover any changed behavior that can be asserted.
- Required verification commands are run or any environment blockers are reported.
