# UI Normalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize the existing Tauri starter UI and fix layout, responsive, contrast, and interaction issues without changing the starter app's identity.

**Architecture:** Keep the current React component tree, shadcn/ui primitives, CSS-token theme model, and route structure. Make most visual fixes in `src/index.css`, then apply narrow component changes only where markup or state semantics are needed.

**Tech Stack:** Tauri, React 19, TypeScript, Vite, React Router, Tailwind CSS v4, shadcn/ui-style components, Radix UI primitives, Phosphor icons, Vitest, Testing Library, Playwright smoke tests.

## Global Constraints

- Keep the app generic: shell, routing, settings, theme, localization, and reusable UI patterns only.
- Do not add product-specific workflows, analytics, storage systems, external task systems, or brand/domain references.
- Use existing shadcn/ui components from `src/components/ui/` for user-facing interactive elements.
- Preserve the starter visual system: theme tokens, responsive layout, accessible contrast, and keyboard-friendly interactions.
- User-facing copy lives in `src/lib/locales/en.json` and `src/lib/locales/vi.json`.
- Do not introduce new dependencies for this work.
- Do not commit changes unless the user explicitly asks for a commit.
- After modifying code files, run `python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"` to keep the graph current.

---

## File Structure

- Modify `src/index.css`: Owns theme tokens, shell layout, responsive behavior, shared utility classes, and UI polish for gallery/pattern demos.
- Modify `src/appShellLayout.test.ts`: Extends the existing CSS contract test to cover shell, mobile collapse, typography tokens, and command palette constraints.
- Modify `src/components/command-palette/CommandPalette.tsx`: Adds narrow behavior/semantics for empty results and query reset on close.
- Modify `src/components/command-palette/CommandPalette.test.tsx`: Covers the command palette behavior changes.
- Modify `src/components/settings/SettingsPage.tsx`: Marks current language quick-pick buttons with active visual state and pressed semantics.
- Modify `src/app/App.test.tsx`: Asserts the settings language buttons remain usable and expose active pressed semantics after language switches.

No new runtime source files are needed. The CSS contract remains centralized in the existing `src/appShellLayout.test.ts` file so layout checks stay easy to find.

---

### Task 1: Expand UI Layout Contract Tests

**Files:**
- Modify: `src/appShellLayout.test.ts`

**Interfaces:**
- Consumes: `src/index.css` as raw text.
- Produces: CSS contract tests that later tasks must satisfy.

- [ ] **Step 1: Replace the current test file with expanded contract tests**

Use this complete file content:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(`${process.cwd()}/src/index.css`, 'utf8')

function ruleFor(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))

  return match?.[1] ?? ''
}

function mediaBlock(query: string): string {
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const start = css.search(new RegExp(`@media\\s*${escapedQuery}\\s*\\{`))
  if (start === -1) return ''

  let depth = 0
  for (let index = start; index < css.length; index += 1) {
    if (css[index] === '{') depth += 1
    if (css[index] === '}') depth -= 1
    if (depth === 0 && index > start) return css.slice(start, index + 1)
  }

  return ''
}

describe('app shell layout', () => {
  it('scrolls route content inside the fixed-height shell', () => {
    expect(ruleFor('.starter-shell')).toMatch(/height:\s*100%/)
    expect(ruleFor('.starter-main')).toMatch(/min-height:\s*0/)
    expect(ruleFor('.starter-content')).toMatch(/overflow:\s*auto/)
  })

  it('declares app-owned typography and shadow tokens', () => {
    expect(ruleFor(':root')).toMatch(/--font-sans:/)
    expect(ruleFor(':root')).toMatch(/--font-mono:/)
    expect(ruleFor(':root')).toMatch(/--shadow-panel:/)
    expect(ruleFor(':root')).toMatch(/font-family:\s*var\(--font-sans\)/)
  })

  it('keeps navigation and header controls keyboard-visible', () => {
    expect(ruleFor('.app-sidebar__link')).toMatch(/transition:/)
    expect(css).toMatch(/\.app-sidebar__link:focus-visible/)
    expect(css).toMatch(/\.app-header__actions/)
    expect(css).toMatch(/\.app-header__actions \[data-slot='button'\]/)
  })

  it('constrains command palette and gallery tabs for narrow screens', () => {
    expect(ruleFor('.command-palette')).toMatch(/width:\s*min\(calc\(100vw - 32px\), 680px\)/)
    expect(ruleFor('.command-list')).toMatch(/max-height:\s*min\(420px, 60vh\)/)
    expect(ruleFor('.gallery-tabs')).toMatch(/overflow-x:\s*auto/)
  })

  it('defines explicit mobile shell collapse rules', () => {
    const mobile = mediaBlock('\\(max-width: 780px\\)')

    expect(mobile).toContain('.starter-shell')
    expect(mobile).toMatch(/grid-template-columns:\s*1fr/)
    expect(mobile).toMatch(/grid-template-rows:\s*auto minmax\(0, 1fr\)/)
    expect(mobile).toContain('.app-sidebar__nav')
    expect(mobile).toMatch(/overflow-x:\s*auto/)
    expect(mobile).toContain('.starter-content')
  })
})
```

- [ ] **Step 2: Run the focused failing test**

Run:

```bash
pnpm test src/appShellLayout.test.ts
```

Expected result before implementation: FAIL. Expected failures mention missing `--font-sans`, missing `--shadow-panel`, missing `overflow-x: auto`, and missing mobile `grid-template-rows`.

---

### Task 2: Normalize Shell, Tokens, Responsive Layout, And Shared States

**Files:**
- Modify: `src/index.css`
- Test: `src/appShellLayout.test.ts`

**Interfaces:**
- Consumes: CSS tests from Task 1.
- Produces: Stable shell layout, app-owned typography tokens, responsive collapse rules, and shared interaction states.

- [ ] **Step 1: Update the `:root` base token block**

Replace lines 8-19 of `src/index.css` with this content:

```css
:root {
  /* --- Font defaults --- */
  --font-sans: ui-sans-serif, "Segoe UI Variable", "Segoe UI", Helvetica, Arial, sans-serif;
  --font-mono: "Cascadia Code", "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  --shadow-panel: 0 18px 48px color-mix(in oklab, var(--foreground) 12%, transparent);
  --shadow-panel-soft: 0 10px 30px color-mix(in oklab, var(--foreground) 8%, transparent);
  font-family: var(--font-sans);
  line-height: 1.5;
  font-weight: 400;
  font-size: 14px;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

- [ ] **Step 2: Replace the app shell and shared layout section**

In `src/index.css`, replace the block from `.starter-shell {` through `.command-item small { color: var(--muted-foreground); }` with this content:

```css
.starter-shell {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  background:
    radial-gradient(circle at top left, color-mix(in oklab, var(--primary) 14%, transparent), transparent 30rem),
    var(--background);
  color: var(--foreground);
}

.app-sidebar {
  min-height: 0;
  overflow: auto;
  border-right: 1px solid var(--border);
  background: color-mix(in oklab, var(--card) 90%, transparent);
  padding: 20px;
}

.app-sidebar__brand {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 28px;
}

.app-sidebar__brand strong,
.app-header strong {
  letter-spacing: -0.02em;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: var(--primary);
  color: var(--primary-foreground);
  font-weight: 800;
  box-shadow: 0 8px 18px color-mix(in oklab, var(--primary) 24%, transparent);
}

.app-sidebar__brand small {
  display: block;
  color: var(--muted-foreground);
  margin-top: 2px;
}

.app-sidebar__nav {
  display: grid;
  gap: 8px;
}

.app-sidebar__link {
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 12px;
  color: var(--muted-foreground);
  padding: 10px 12px;
  text-decoration: none;
  transition: background-color 160ms ease, color 160ms ease, transform 160ms ease;
}

.app-sidebar__link.active,
.app-sidebar__link:hover {
  background: var(--accent);
  color: var(--accent-foreground);
}

.app-sidebar__link:active {
  transform: translateY(1px);
}

.app-sidebar__link:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

.starter-main {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  overflow: hidden;
}

.app-header {
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid var(--border);
  padding: 0 28px;
  background: color-mix(in oklab, var(--background) 84%, transparent);
  backdrop-filter: blur(18px);
}

.app-header__actions,
.button-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.app-header__actions [data-slot='button'] {
  flex-shrink: 0;
}

.starter-content {
  min-height: 0;
  overflow: auto;
  padding: clamp(18px, 3vw, 28px);
}

.page-stack {
  display: grid;
  gap: 22px;
  width: min(100%, 1120px);
}

.page-heading h1,
.hero-panel h1 {
  font-size: clamp(2rem, 4vw, 4.25rem);
  line-height: 1;
  letter-spacing: -0.055em;
  margin: 0;
  text-wrap: balance;
}

.page-heading p,
.hero-panel p {
  color: var(--muted-foreground);
  max-width: 680px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.72rem;
  color: var(--muted-foreground);
}

.hero-panel {
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: clamp(28px, 5vw, 52px);
  background: linear-gradient(135deg, var(--card), color-mix(in oklab, var(--primary) 18%, var(--card)));
  box-shadow: var(--shadow-panel);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.status-list,
.form-stack,
.settings-stack {
  display: grid;
  gap: 12px;
}

.status-pill,
.inline-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.gallery-tabs {
  max-width: 100%;
  height: auto;
  min-height: 2.25rem;
  justify-content: flex-start;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
}

.form-field {
  display: grid;
  gap: 6px;
}

.form-field > span {
  font-weight: 650;
}

.separator-demo {
  display: grid;
  gap: 12px;
}

.gallery-scroll-area {
  height: 180px;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
}

.pattern-card-wide {
  grid-column: 1 / -1;
}

.pattern-page-header-demo {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 20px;
  background: color-mix(in oklab, var(--primary) 10%, var(--card));
}

.pattern-page-header-demo h2 {
  margin: 0;
  font-size: clamp(1.5rem, 3vw, 2.75rem);
  line-height: 1;
  letter-spacing: -0.04em;
  text-wrap: balance;
}

.pattern-page-header-demo p {
  color: var(--muted-foreground);
  max-width: 560px;
}

.mini-stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.stat-card [data-slot='card-content'] {
  display: grid;
  gap: 10px;
  padding-top: 18px;
}

.stat-card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted-foreground);
}

.stat-card strong {
  font-size: 2rem;
  letter-spacing: -0.04em;
}

.feature-list,
.key-value-list,
.activity-timeline,
.checklist-progress ul {
  display: grid;
  gap: 10px;
}

.feature-list__item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 12px;
}

.feature-list__item p,
.empty-state p,
.preference-row p,
.inline-notice p,
.activity-timeline p {
  color: var(--muted-foreground);
  margin: 4px 0 0;
}

.empty-state {
  display: grid;
  place-items: center;
  gap: 12px;
  text-align: center;
  border: 1px dashed var(--border);
  border-radius: 18px;
  padding: 28px;
}

.empty-state h3 {
  margin: 0;
}

.filter-toolbar {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(150px, 0.5fr) auto;
  gap: 10px;
  align-items: center;
}

.filter-toolbar__search {
  position: relative;
}

.filter-toolbar__search svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted-foreground);
}

.filter-toolbar__search input {
  padding-left: 34px;
}

.key-value-list {
  margin: 0;
}

.key-value-list__row,
.preference-row,
.status-matrix__item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  border-bottom: 1px solid var(--border);
  padding: 10px 0;
}

.key-value-list__row:last-child,
.status-matrix__item:last-child {
  border-bottom: 0;
}

.key-value-list dt {
  color: var(--muted-foreground);
}

.key-value-list dd {
  margin: 0;
  font-weight: 650;
}

.activity-timeline {
  list-style: none;
  margin: 0;
  padding: 0;
}

.activity-timeline__item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
}

.activity-timeline__dot {
  margin-top: 6px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--primary);
  box-shadow: 0 0 0 4px color-mix(in oklab, var(--primary) 18%, transparent);
}

.activity-timeline__heading {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.activity-timeline__heading small {
  color: var(--muted-foreground);
}

.status-matrix {
  display: grid;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 4px 12px;
}

.inline-notice {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 14px;
  background: color-mix(in oklab, var(--primary) 8%, var(--card));
}

.inline-notice--success {
  background: color-mix(in oklab, var(--accent-green) 10%, var(--card));
}

.inline-notice--warning {
  background: color-mix(in oklab, var(--destructive) 8%, var(--card));
}

.checklist-progress {
  display: grid;
  gap: 14px;
}

.checklist-progress ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.checklist-progress li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-row {
  display: grid;
  grid-template-columns: minmax(180px, 0.6fr) minmax(240px, 1fr);
  gap: 16px;
  align-items: center;
}

.field-row__label {
  font-weight: 650;
}

.field-row__description {
  color: var(--muted-foreground);
  margin: 4px 0 0;
}

.command-palette {
  width: min(calc(100vw - 32px), 680px);
  max-width: 680px;
}

.command-list {
  display: grid;
  gap: 6px;
  max-height: min(420px, 60vh);
  overflow: auto;
}

.command-empty {
  margin: 0;
  border: 1px dashed var(--border);
  border-radius: 12px;
  padding: 18px;
  color: var(--muted-foreground);
  text-align: center;
}

.command-item {
  justify-content: space-between;
  width: 100%;
}

.command-item small {
  color: var(--muted-foreground);
}
```

- [ ] **Step 3: Replace the mobile media query**

Replace the existing `@media (max-width: 780px)` block at the end of `src/index.css` with this content:

```css
@media (max-width: 780px) {
  .starter-shell {
    height: 100dvh;
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
  }

  .app-sidebar {
    overflow: visible;
    border-right: 0;
    border-bottom: 1px solid var(--border);
    padding: 14px 16px;
  }

  .app-sidebar__brand {
    margin-bottom: 12px;
  }

  .app-sidebar__nav {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 2px;
    scrollbar-width: thin;
  }

  .app-sidebar__link {
    flex: 0 0 auto;
  }

  .app-header {
    min-height: auto;
    align-items: flex-start;
    flex-wrap: wrap;
    padding: 14px 16px;
  }

  .starter-content {
    padding: 16px;
  }

  .page-heading h1,
  .hero-panel h1 {
    font-size: clamp(2rem, 12vw, 3rem);
  }

  .dashboard-grid,
  .field-row,
  .component-grid {
    grid-template-columns: 1fr;
  }

  .pattern-page-header-demo,
  .preference-row,
  .key-value-list__row,
  .status-matrix__item {
    align-items: flex-start;
    flex-direction: column;
  }

  .filter-toolbar,
  .mini-stat-grid {
    grid-template-columns: 1fr;
  }

  .button-row,
  .app-header__actions {
    width: 100%;
  }

  .button-row [data-slot='button'],
  .app-header__actions [data-slot='button'] {
    min-width: 0;
  }
}
```

- [ ] **Step 4: Run the focused layout test**

Run:

```bash
pnpm test src/appShellLayout.test.ts
```

Expected result: PASS.

---

### Task 3: Add Command Palette Empty-State Semantics And Query Reset

**Files:**
- Modify: `src/components/command-palette/CommandPalette.tsx`
- Modify: `src/components/command-palette/CommandPalette.test.tsx`
- Depends on: `.command-empty` CSS from Task 2

**Interfaces:**
- Consumes: `CommandPalette` props already defined in `CommandPalette.tsx`.
- Produces: empty-result status region and reset-on-close behavior.

- [ ] **Step 1: Add failing tests**

Append these tests inside the existing `describe('CommandPalette', () => { ... })` block in `src/components/command-palette/CommandPalette.test.tsx`:

```tsx
  it('announces an empty result state', () => {
    renderStarter(
      <CommandPalette
        locale="en"
        commands={[{ id: 'one', group: 'Test', label: 'Open Settings', keywords: ['settings'], execute: vi.fn() }]}
        open
        onOpenChange={() => {}}
      />,
    )

    fireEvent.change(screen.getByRole('textbox', { name: 'Search commands' }), { target: { value: 'missing' } })

    expect(screen.getByRole('status')).toHaveTextContent('No matching commands')
  })

  it('clears the search query when the palette closes', () => {
    const { rerender } = renderStarter(
      <CommandPalette
        locale="en"
        commands={[{ id: 'one', group: 'Test', label: 'Open Settings', keywords: ['settings'], execute: vi.fn() }]}
        open
        onOpenChange={() => {}}
      />,
    )

    fireEvent.change(screen.getByRole('textbox', { name: 'Search commands' }), { target: { value: 'settings' } })

    rerender(
      <CommandPalette
        locale="en"
        commands={[{ id: 'one', group: 'Test', label: 'Open Settings', keywords: ['settings'], execute: vi.fn() }]}
        open={false}
        onOpenChange={() => {}}
      />,
    )

    rerender(
      <CommandPalette
        locale="en"
        commands={[{ id: 'one', group: 'Test', label: 'Open Settings', keywords: ['settings'], execute: vi.fn() }]}
        open
        onOpenChange={() => {}}
      />,
    )

    expect(screen.getByRole('textbox', { name: 'Search commands' })).toHaveValue('')
  })
```

- [ ] **Step 2: Run the focused failing tests**

Run:

```bash
pnpm test src/components/command-palette/CommandPalette.test.tsx
```

Expected result before implementation: FAIL. The empty-state test cannot find role `status`, and the reset test still sees the old query.

- [ ] **Step 3: Update command palette implementation**

Replace `src/components/command-palette/CommandPalette.tsx` with this complete content:

```tsx
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { createTranslator, type AppLocale } from '@/lib/i18n'
import type { StarterCommand } from './commandRegistry'

interface CommandPaletteProps {
  commands: readonly StarterCommand[]
  locale: AppLocale
  onOpenChange: (open: boolean) => void
  open: boolean
}

export function CommandPalette({ commands, locale, onOpenChange, open }: CommandPaletteProps) {
  const t = createTranslator(locale)
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLowerCase()
  const filteredCommands = useMemo(() => {
    if (!normalizedQuery) return commands
    return commands.filter((command) => {
      const haystack = [command.label, command.group, ...command.keywords].join(' ').toLowerCase()
      return haystack.includes(normalizedQuery)
    })
  }, [commands, normalizedQuery])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="command-palette">
        <DialogHeader>
          <DialogTitle>{t('command.open')}</DialogTitle>
        </DialogHeader>
        <Input
          aria-label={t('command.searchLabel')}
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('command.placeholder')}
        />
        <div className="command-list" aria-live="polite">
          {filteredCommands.length === 0 ? <p className="command-empty" role="status">{t('command.empty')}</p> : null}
          {filteredCommands.map((command) => (
            <Button
              className="command-item"
              key={command.id}
              variant="ghost"
              onClick={() => {
                command.execute()
                onOpenChange(false)
              }}
            >
              <span>{command.label}</span>
              <small aria-hidden="true">{command.group}</small>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Run the focused command palette tests**

Run:

```bash
pnpm test src/components/command-palette/CommandPalette.test.tsx
```

Expected result: PASS.

---

### Task 4: Mark Settings Language Quick-Picks As Active

**Files:**
- Modify: `src/components/settings/SettingsPage.tsx`
- Modify: `src/app/App.test.tsx`

**Interfaces:**
- Consumes: `settings.uiLanguage`, resolved `locale`, and `updateSettings` from `useStarterSettings()`.
- Produces: English and Vietnamese quick-pick buttons with `aria-pressed` and active visual variants.

- [ ] **Step 1: Add a failing app behavior assertion**

In `src/app/App.test.tsx`, inside the `renders dashboard, navigates to components, and switches language` test, replace this block:

```tsx
    fireEvent.click(screen.getByRole('button', { name: 'Vietnamese' }))
    expect(await screen.findByRole('heading', { name: 'Cài đặt' })).toBeInTheDocument()
```

with this block:

```tsx
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Vietnamese' })).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(screen.getByRole('button', { name: 'Vietnamese' }))
    expect(await screen.findByRole('heading', { name: 'Cài đặt' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tiếng Anh' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Tiếng Việt' })).toHaveAttribute('aria-pressed', 'true')
```

- [ ] **Step 2: Run the focused failing app test**

Run:

```bash
pnpm test src/app/App.test.tsx
```

Expected result before implementation: FAIL because the language buttons do not expose `aria-pressed`.

- [ ] **Step 3: Update settings language buttons**

In `src/components/settings/SettingsPage.tsx`, add this line after `const t = createTranslator(locale)`:

```tsx
  const activeLanguage = settings.uiLanguage === 'system' ? locale : settings.uiLanguage
```

Then replace the language button row inside the `FieldRow` for `settings.language` with this content:

```tsx
            <div className="button-row">
              <Button
                type="button"
                variant={activeLanguage === 'en' ? 'secondary' : 'outline'}
                aria-pressed={activeLanguage === 'en'}
                onClick={() => updateSettings({ uiLanguage: 'en' })}
              >
                {t('settings.language.english')}
              </Button>
              <Button
                type="button"
                variant={activeLanguage === 'vi' ? 'secondary' : 'outline'}
                aria-pressed={activeLanguage === 'vi'}
                onClick={() => updateSettings({ uiLanguage: 'vi' })}
              >
                {t('settings.language.vietnamese')}
              </Button>
              <Select value={settings.uiLanguage} onValueChange={(value) => updateSettings({ uiLanguage: value as UiLanguagePreference })}>
                <SelectTrigger aria-labelledby="starter-language-label">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">{t('settings.language.system')}</SelectItem>
                  <SelectItem value="en">{t('settings.language.english')}</SelectItem>
                  <SelectItem value="vi">{t('settings.language.vietnamese')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
```

- [ ] **Step 4: Run the focused app test**

Run:

```bash
pnpm test src/app/App.test.tsx
```

Expected result: PASS.

---

### Task 5: Run UI-Focused Regression Tests

**Files:**
- Test only: `src/appShellLayout.test.ts`, `src/components/command-palette/CommandPalette.test.tsx`, `src/app/App.test.tsx`, `src/components/gallery/ComponentsPage.test.tsx`, `src/components/patterns/patterns.test.tsx`

**Interfaces:**
- Consumes: all changes from Tasks 1-4.
- Produces: evidence that the changed UI contracts and adjacent gallery/pattern surfaces still work.

- [ ] **Step 1: Run focused tests together**

Run:

```bash
pnpm test src/appShellLayout.test.ts src/components/command-palette/CommandPalette.test.tsx src/app/App.test.tsx src/components/gallery/ComponentsPage.test.tsx src/components/patterns/patterns.test.tsx
```

Expected result: PASS for all listed test files.

- [ ] **Step 2: Run locale validation if no locale files changed**

Run this anyway to verify the existing localized UI still validates:

```bash
pnpm l10n:validate
```

Expected result: command exits with code 0 and reports valid locale catalogs.

---

### Task 6: Run Full Verification And Graph Refresh

**Files:**
- Verification only

**Interfaces:**
- Consumes: complete implementation from Tasks 1-5.
- Produces: final pass/fail evidence for lint, typecheck, tests, build, smoke, and graph refresh.

- [ ] **Step 1: Run lint**

Run:

```bash
pnpm lint
```

Expected result: PASS with zero warnings.

- [ ] **Step 2: Run TypeScript check**

Run:

```bash
npx tsc --noEmit
```

Expected result: PASS with no TypeScript errors.

- [ ] **Step 3: Run all tests**

Run:

```bash
pnpm test
```

Expected result: PASS for the full Vitest suite.

- [ ] **Step 4: Run production build**

Run:

```bash
pnpm build
```

Expected result: PASS and Vite build completes.

- [ ] **Step 5: Run Playwright smoke test**

Run:

```bash
pnpm playwright:smoke
```

Expected result: PASS. If the command fails because browsers or system dependencies are missing, capture the exact error and report that blocker.

- [ ] **Step 6: Refresh graphify code graph**

Run:

```bash
python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"
```

Expected result: command exits with code 0. If `python3` or `graphify` is unavailable, capture the exact error and report that blocker.

---

## Plan Self-Review

- Spec coverage: The plan preserves the app identity, keeps shadcn/ui and CSS tokens, fixes shell/mobile/tabs/command palette behavior, improves interaction semantics, avoids new dependencies, and includes verification.
- Placeholder scan: The plan contains no placeholder implementation steps and no unresolved names.
- Type consistency: `activeLanguage` is local to `SettingsPage`, `CommandPalette` prop types remain unchanged, and tests use existing Testing Library helpers.
