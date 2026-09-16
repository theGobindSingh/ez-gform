---
name: new-package
description: Scaffold a new @ez-gform/* workspace package with the standard tsup/vitest/biome setup consistent with existing packages.
---

# Adding a package to ez-gform

1. Create `packages/<name>/` (library) or `apps/<name>/` (deployable).
2. `package.json`: name `@ez-gform/<name>`, `"type": "module"`, `exports` with `import`/`require`/`types`, `files: ["dist"]`, scripts `build`, `dev`, `test`, `lint`, `typecheck`. Copy from `packages/core/package.json`.
3. `tsconfig.json` extends `@ez-gform/tsconfig/library.json` (or `react-library.json`).
4. `tsup.config.ts` copied from core: `entry: ["src/index.ts"]`, `format: ["esm","cjs"]`, `dts: true`, `clean: true`, `sourcemap: true`.
5. Add the package to `pnpm-workspace.yaml` globs if it lives somewhere new (default globs already cover `packages/*` and `apps/*`).
6. Workspace deps use `"@ez-gform/core": "workspace:*"`.
7. Add a changeset: `pnpm changeset`.
8. Run `pnpm turbo run build test lint typecheck --filter=@ez-gform/<name>` before finishing.
