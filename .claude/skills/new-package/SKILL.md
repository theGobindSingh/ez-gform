---
name: new-package
description: Scaffold a new @ez-gform/* workspace package with the standard tsup/vitest/eslint setup consistent with existing packages.
---

# Adding a package to ez-gform

1. Create `packages/<name>/`.
2. `package.json`: name `@ez-gform/<name>`, `"type": "module"`, `exports` with `import`/`require`/`types`, `files: ["dist"]`, scripts `dev`, `build`, `test`, `lint`, `lint:fix`, `type-check`, `clean`. Copy from `packages/core/package.json`.
3. `tsconfig.json` extends `@ez-gform/tsconfig/library.json` (or `react-library.json`, `nextjs.json`).
4. `eslint.config.mjs` importing the matching `@kami-ui/eslint-config` entry point (`/base` for libraries/CLI, `/react` for React packages, `/next` for the docs app).
5. `tsup.config.ts` copied from core: `entry: ["src/index.ts"]`, `format: ["esm","cjs"]`, `dts: true`, `clean: true`, `sourcemap: true`.
6. Add the package to `pnpm-workspace.yaml` globs if it lives somewhere new (default glob already covers `packages/*`).
7. Add the package to the root `tsconfig.json` `references` array.
8. Workspace deps use `"@ez-gform/core": "workspace:*"`.
9. Run `pnpm turbo run build test lint type-check --filter=@ez-gform/<name>` before finishing.
