# Git Hooks

This repo uses Husky hooks from `.husky/`. Those files are the source of truth.

## Installation

`pnpm install` runs the `prepare` script and installs the hooks into `.git/hooks`.

If you need to reinstall them manually:

```bash
pnpm exec husky
```

The hooks expect `node` and `pnpm` to be available. If they are installed via `nvm`, the hooks will try to load `~/.nvm/nvm.sh` automatically.

## Policy

- Commit on `main` only.
- Push from `main` to `origin/main` only.
- Never use `--no-verify`.

## Pre-commit

`.husky/pre-commit` is a fast staged-file gate:

- if only docs, workflow, or hook files are staged, app checks are skipped
- if staged JavaScript or TypeScript files exist, `pnpm lint --quiet` must pass
- TypeScript, tests, coverage, build, Playwright smoke, and Rust checks run in pre-push instead

The hook expects `node` and `pnpm` to be available, and it does not run the heavier suite during commit.

## Pre-push

`.husky/pre-push` blocks pushes unless all of the following are true:

- the current branch is `main`
- every pushed branch ref is `refs/heads/main -> refs/heads/main`
- TypeScript and the Vite build pass
- frontend coverage passes
- Rust lint and Rust coverage pass when `src-tauri/` changed
- the curated Playwright core smoke lane passes via `pnpm playwright:smoke`

## Troubleshooting

If a hook cannot find `node` or `pnpm`:

```bash
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm use node
```

Then retry the commit or push.
