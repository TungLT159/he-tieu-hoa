# AGENTS.md — Starter Tauri App

## Project Context

- This repository is a Tauri + React starter app, not a domain product.
- Keep the app generic: shell, routing, settings, theme, localization, and reusable UI patterns only.
- Do not add product-specific workflows, analytics, storage systems, external task systems, or brand/domain references unless a task explicitly introduces them.
- Prefer small, reversible changes that keep the starter easy to copy into a new app.

## Development Workflow

- Read the task and relevant docs before editing: `README.md`, `docs/ARCHITECTURE.md`, `docs/ABSTRACTIONS.md`, and `docs/GETTING-STARTED.md`.
- Use TDD for behavior changes and add focused tests near the changed code.
- Keep commits focused and use conventional prefixes such as `feat:`, `fix:`, `refactor:`, `test:`, and `docs:`.
- Do not use `--no-verify`; hooks are part of the release gate.

## Verification

- Run the relevant local checks before committing; for broad changes run `pnpm lint`, `npx tsc --noEmit`, `pnpm test`, and `pnpm build`.
- Run `pnpm playwright:smoke` when the shell, navigation, settings, theme, or route behavior changes.
- Pre-commit is a lightweight staged JS/TS lint gate. Pre-push runs the heavier build, test, coverage, Playwright smoke, and Rust gates when applicable.
- If a hook fails, fix the underlying issue and commit the fix normally.

## UI Rules

- Use existing shadcn/ui components from `src/components/ui/` for user-facing interactive elements.
- Preserve the starter visual system: theme tokens, responsive layout, accessible contrast, and keyboard-friendly interactions.
- Avoid raw browser-default controls when a shadcn/ui equivalent exists.
- Keep new components reusable and free of domain assumptions.

## Localization

- User-facing copy lives in `src/lib/locales/en.json` and `src/lib/locales/vi.json`.
- Keep locale keys stable, descriptive, and grouped by feature.
- Run `pnpm l10n:validate` after editing locale files.

## Tauri And Docs

- Keep Tauri commands minimal and documented in `docs/ARCHITECTURE.md` or `docs/ABSTRACTIONS.md` when adding a new integration point.
- Update `docs/GETTING-STARTED.md` when setup, scripts, or developer workflow changes.
- Do not introduce new dependencies, persistent storage strategies, or platform assumptions without documenting the decision.
