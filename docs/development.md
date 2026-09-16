# Development

## Install

```bash
pnpm install
```

Requires Node 24 (see `.nvmrc`) and pnpm (pinned via `packageManager` in
`package.json`).

## Scripts

Every script is a Turborepo task, run from the repo root and fanned out to
each package:

```bash
pnpm build         # tsup builds ESM + CJS + .d.ts for every publishable package
pnpm dev           # watch mode across packages
pnpm test          # vitest run
pnpm lint          # eslint . (per package)
pnpm lint:fix      # eslint . --fix
pnpm format        # prettier --write . (root-only)
pnpm format:check  # prettier --check .
pnpm type-check    # tsc --noEmit
pnpm clean         # rm -rf dist
```

Scope any task to one package with `--filter`:

```bash
pnpm turbo run test --filter=@ez-gform/core
```

Two packages are commonly run standalone rather than through the full
`turbo` fan-out:

- `pnpm --filter @ez-gform/docs dev` — run the docs/playground site
  locally.
- `pnpm --filter @ez-gform/extension build` — builds
  `@ez-gform/background`, `@ez-gform/content-script`, and
  `@ez-gform/popup` first (Turborepo's `^build` dependency), then
  assembles them into `packages/extension/dist`. Load that directory
  unpacked at `chrome://extensions` (Developer mode → Load unpacked); see
  `packages/extension/README.md` for the full walkthrough. Chrome-only
  for now — Firefox's MV3 service-worker support is incomplete (see
  `docs/ARCHITECTURE.md`).

## Lint and format

Lint is ESLint flat config, sourced from the shared `@kami-ui/eslint-config`
npm package (not a workspace package). Each package has its own
`eslint.config.mjs` that imports the matching entry point:

- `@kami-ui/eslint-config/base` — plain TypeScript libraries and the CLI.
- `@kami-ui/eslint-config/react` — React packages.
- `@kami-ui/eslint-config/next` — the docs app.

Lint always runs from inside the package directory (Turborepo does this by
default) because the config is type-aware: it sets
`parserOptions.projectService = true` with `tsconfigRootDir: process.cwd()`,
so it resolves each package's own `tsconfig.json`.

Prettier is configured once at the repo root (`.prettierrc`) and applies to
the whole workspace; there is no per-package Prettier config.

## Adding a package

Use the `new-package` skill (`.claude/skills/new-package/SKILL.md`), or by
hand:

1. `packages/<name>/` with a `package.json` (`@ez-gform/<name>`, uniform
   scripts), `tsconfig.json` extending `@ez-gform/tsconfig/<kind>.json`,
   `eslint.config.mjs`, and `tsup.config.ts`.
2. Add the package to the root `tsconfig.json` `references` array.
3. Add a changeset (`pnpm changeset`).
4. `pnpm turbo run build test lint type-check --filter=@ez-gform/<name>`.
