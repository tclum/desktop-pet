# Contributing

## First-time setup

After cloning, install the git hooks:

```sh
./scripts/install-hooks.sh
```

This symlinks `scripts/hooks/pre-commit` into `.git/hooks/pre-commit`. The
hook runs:

- `npx tsc --noEmit` when staged changes include TypeScript or config files
  under `src/`, `tsconfig.json`, `package.json`, or `vite.config.*`
- `cargo check` when staged changes include Rust or Cargo files under
  `src-tauri/`

Docs-only commits (e.g. `CLAUDE.md`, `SESSION_NOTES.md`) skip both checks.

## Why this exists

A prior session shipped a broken `PetView` because `npm run vite:build`
doesn't typecheck. The hook makes `tsc --noEmit` non-optional before a
commit lands, which catches the class of "it builds but doesn't run" bugs
that slipped through Vite's transform-only pipeline.

## Bypassing (don't)

`--no-verify` bypasses the hook. Don't. If the hook is wrong, fix the
hook; if the code is wrong, fix the code. Silently shipping around a
failing typecheck is how we got here the first time.
