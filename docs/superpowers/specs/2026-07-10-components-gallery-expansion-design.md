# Components Gallery Expansion Design

## Context

Phần mềm 3D Hệ tiêu hóa is a generic Tauri + React starter with a shell, routing, settings, theme support, localization, and a component gallery. The current gallery already demonstrates core shadcn/ui primitives across foundations, forms, overlays, navigation, feedback, and surfaces.

The next change expands the gallery into a larger starter UI kit that combines practical primitives with reusable application patterns. The implementation must stay generic, localized, accessible, and easy to copy into new projects.

## Goals

- Add a large, balanced set of component demos covering app shell patterns, data display, advanced forms, and feedback states.
- Create reusable components or patterns instead of placing all new markup directly inside `ComponentsPage.tsx`.
- Add practical primitives where they improve the starter: table, pagination, slider, and toggle group are the target set if they fit the existing Radix/shadcn stack.
- Add new demo tabs to keep the gallery scannable as it grows.
- Keep all user-facing copy in `src/lib/locales/en.json` and `src/lib/locales/vi.json`.
- Verify with full relevant checks, including localization validation, lint, typecheck, tests, and smoke testing if route/page behavior changes significantly.

## Non-Goals

- Do not add domain-specific workflows, analytics, storage, external integrations, or branded product concepts.
- Do not introduce persistent data models for the demos.
- Do not redesign the whole app shell or replace the existing visual system.
- Do not add heavyweight dependencies unless a primitive cannot be implemented with existing dependencies and the benefit is clear.

## Proposed Approach

Use a reusable pattern library plus practical primitives.

New primitive UI files should follow existing `src/components/ui/` conventions: small, typed wrappers around Radix or semantic HTML, class composition through `cn`, and shadcn-compatible data slots where useful. New reusable starter patterns should live outside `ui`, likely under `src/components/patterns/`, so they remain distinct from low-level primitives.

`ComponentsPage.tsx` should become more of a gallery composer. It can keep simple demo state and local demo data, but large visual patterns should be imported from dedicated components.

## Gallery Organization

Keep the current tabs and add pattern-oriented tabs:

- `Foundations`: current base primitives plus any small additions that belong with visual foundations.
- `Forms`: current form demos plus advanced controls like slider and toggle group.
- `Overlays`: existing dialog, dropdown, popover, sheet, and tooltip demos.
- `Navigation`: existing breadcrumb, accordion, and hover card demos.
- `Feedback`: existing alert and progress demos plus feedback-oriented patterns.
- `Surfaces`: existing scroll area and tabs demos.
- `Patterns`: reusable app shell patterns such as page header, toolbar, stat card, feature list, and empty state.
- `Data`: table, pagination, key-value list, activity timeline, and status matrix demos.
- `States`: loading, empty, warning, success, and checklist/progress demos.

Tabs should wrap on smaller screens using the existing `gallery-tabs` behavior. Demo grids should continue using responsive two-column layout with one column on mobile.

## Components And Patterns

Target reusable additions:

- `EmptyState`: icon, title, description, and optional action slot for no-content states.
- `StatCard`: label, value, trend/status, and optional icon for dashboard metrics.
- `FilterToolbar`: search input, select filter, and action slot for list filtering.
- `KeyValueList`: compact metadata rows for settings/about panels.
- `ActivityTimeline`: ordered events with title, timestamp/status, and description.
- `StatusMatrix`: small grouped status indicators for setup or system readiness.
- `PreferenceRow`: label, description, and control slot for advanced form settings.
- `InlineNotice`: lightweight toast/banner-like status message without global notification infrastructure.
- `ChecklistProgress`: progress value plus visible checklist items for setup flows.
- `FeatureList`: reusable list of starter capabilities with icons or badges.

Target primitive additions:

- `Table`: semantic table wrappers with header, body, row, head, cell, and caption components.
- `Pagination`: semantic nav with previous, next, page, ellipsis, and active state support.
- `Slider`: Radix slider wrapper if available through the existing `radix-ui` package.
- `ToggleGroup`: Radix toggle group wrapper if available through the existing `radix-ui` package.

If `Slider` or `ToggleGroup` cannot be implemented cleanly with installed dependencies, the implementation should skip that primitive and use existing controls instead. This keeps the starter dependency-light.

## Data Flow And State

All demos use local, static example data inside the gallery or colocated demo modules. Interactive examples may use local React state for selected tab, slider value, toggle group value, and existing controls. No demo state is persisted.

Reusable pattern components receive plain props and render slots where customization is useful. They should not import app settings unless a demo specifically needs localization. The page remains responsible for translated strings.

## Localization

Every new user-facing label, caption, aria label, tab label, and button text must be added to both locale catalogs. Keys should stay under the `components.*` namespace and be descriptive, for example `components.patterns.emptyState.title` or `components.data.table.caption`.

The implementation must run `pnpm l10n:validate` after editing locale files.

## Accessibility

- New primitives must use semantic HTML where possible, especially table and pagination.
- Interactive controls must have accessible labels or visible labels.
- Pagination should be wrapped in `nav` with an aria label.
- Status patterns should not rely on color alone; include text labels or icons.
- Demo-only buttons should avoid dead destructive behavior and use neutral starter copy.
- Layout must remain usable on desktop and mobile.

## Styling

Use the existing visual system: theme tokens, shadcn primitives, `Card`, `Badge`, `Button`, and current utility-style CSS in `src/index.css`. Add small, reusable classes only when needed for the new patterns. Avoid unrelated redesign, custom brand direction, or one-off product styling.

## Testing And Verification

Add or update focused tests if new components have meaningful behavior or accessibility contracts. For purely presentational wrappers, smoke-level rendering through the gallery is enough unless existing test patterns suggest otherwise.

Run the full relevant verification set:

- `pnpm l10n:validate`
- `pnpm lint`
- `npx tsc --noEmit`
- `pnpm test`
- `pnpm build`
- `pnpm playwright:smoke` if the gallery route behavior, shell navigation, settings, theme, or routing behavior changes significantly

## Acceptance Criteria

- Components page includes new `Patterns`, `Data`, and `States` tabs.
- The gallery demonstrates roughly 10-14 new primitives or reusable starter patterns.
- New reusable patterns are split into dedicated component files instead of being fully inlined into `ComponentsPage.tsx`.
- New practical primitives are added when compatible with the existing dependency stack.
- English and Vietnamese locale catalogs stay complete and valid.
- The page remains responsive and keyboard-friendly.
- Relevant checks pass or any failures are documented with the exact blocker.
