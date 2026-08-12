# Menu Visual Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the menu card larger, more premium, and more visually appropriate for the app window while preserving current menu behavior.

**Architecture:** Keep the existing `MenuPage` component and tests. Update only visual structure/classes plus focused visual-contract tests; routing, settings behavior, and assets stay unchanged.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui Button/Sheet/Select, Vitest, Playwright smoke.

---

### Task 1: Upgrade Menu Hero Card Visuals

**Files:**
- Modify: `src/pages/MenuPage.tsx`
- Modify: `src/pages/__tests__/MenuPage.test.tsx`

- [ ] **Step 1: Write the failing visual-contract test**

In `src/pages/__tests__/MenuPage.test.tsx`, add this test after the background image test:

```tsx
  it('renders an upgraded hero card sized for the menu window', () => {
    renderMenuPage()

    const card = screen.getByTestId('menu-hero-card')
    expect(card).toHaveClass('w-[min(760px,calc(100vw-48px))]')
    expect(card).toHaveClass('md:px-16')
    expect(card).toHaveClass('md:py-14')
    expect(card).toHaveClass('backdrop-blur-2xl')
  })
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/pages/__tests__/MenuPage.test.tsx
```

Expected: FAIL because `menu-hero-card` does not exist yet.

- [ ] **Step 3: Implement the visual upgrade**

In `src/pages/MenuPage.tsx`, replace the top-level background/card/title/button classes with this structure while preserving all existing click handlers, settings sheet, and translated labels:

```tsx
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-8">
      <div
        data-testid="menu-background"
        className="absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/bg_menu_phanmem3d-1.png")' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,12,80,0.2),rgba(0,0,0,0.72))]" />
      <div className="absolute inset-0 bg-black/25" />

      <div className="pointer-events-none absolute h-[34rem] w-[34rem] rounded-full bg-violet-500/20 blur-3xl" />

      <div
        data-testid="menu-hero-card"
        className="relative z-10 w-[min(760px,calc(100vw-48px))] overflow-hidden rounded-[32px] border border-white/20 bg-white/[0.075] px-8 py-10 text-center shadow-[0_28px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl md:px-16 md:py-14"
      >
        <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(124,58,237,0.08),rgba(255,255,255,0.04))]" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <div className="relative">
          <h1 className="select-none text-4xl font-black leading-tight tracking-[0.12em] text-white drop-shadow-[0_0_22px_rgba(255,255,255,0.28)] sm:text-5xl md:text-6xl">
            {t('menu.titleLine1')}
            <br />
            <span className="bg-gradient-to-r from-white via-violet-100 to-cyan-100 bg-clip-text text-transparent">
              {t('menu.titleLine2')}
            </span>
          </h1>

          <div className="mx-auto mt-7 h-px w-40 bg-gradient-to-r from-transparent via-white/70 to-transparent" />

          <div className="mt-10 flex flex-col items-center gap-4">
            <Button
              className="h-14 w-full max-w-[340px] rounded-2xl bg-gradient-to-br from-[#8b5cf6] via-[#7c3aed] to-[#4c1d95] text-base font-bold text-white shadow-[0_12px_32px_rgba(124,58,237,0.45)] hover:from-[#a78bfa] hover:via-[#7c3aed] hover:to-[#5b21b6]"
              onClick={() => navigate('/viewer')}
            >
              <Play className="size-6" weight="fill" />
              {t('menu.start')}
            </Button>

            <Button
              variant="outline"
              className="h-13 w-full max-w-[340px] rounded-2xl border-white/15 bg-white/[0.08] text-base font-semibold text-white/90 hover:bg-white/15 hover:text-white"
              onClick={() => navigate('/guide')}
            >
              <BookOpen className="size-5" />
              {t('menu.guide')}
            </Button>

            <Button
              variant="outline"
              className="h-13 w-full max-w-[340px] rounded-2xl border-white/15 bg-white/[0.08] text-base font-semibold text-white/90 hover:bg-white/15 hover:text-white"
              onClick={() => setSettingsOpen(true)}
            >
              <Gear className="size-5" />
              {t('menu.settings')}
            </Button>
          </div>
        </div>
      </div>
```

- [ ] **Step 4: Run focused tests**

```bash
npx vitest run src/pages/__tests__/MenuPage.test.tsx
```

Expected: PASS, all MenuPage tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/pages/MenuPage.tsx src/pages/__tests__/MenuPage.test.tsx
git commit -m "style: upgrade menu hero card"
```

---

### Task 2: Verify Menu Flow

**Files:**
- No planned code changes

- [ ] **Step 1: Run focused unit and smoke checks**

```bash
npx vitest run src/pages/__tests__/MenuPage.test.tsx src/app/App.test.tsx
pnpm playwright:smoke
```

Expected: both commands PASS.

- [ ] **Step 2: Run final checks**

```bash
pnpm lint
npx tsc --noEmit
pnpm build
```

Expected: lint and TypeScript pass; build completes. Existing Vite chunk warnings are acceptable if build exits successfully.

- [ ] **Step 3: Commit only if verification required fixes**

If verification required code changes, commit only those changed files:

```bash
git add <changed-files>
git commit -m "fix: stabilize upgraded menu visuals"
```

If no files changed, do not create an empty commit.
