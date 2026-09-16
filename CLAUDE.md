# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`ez-gform` is a pnpm + Turborepo monorepo that lets developers submit their own custom form UI to a Google Form without a backend. It is a ground-up rebuild of `webadeva/use-easy-google-form`, its Chrome extension, and its example app. Rebuild plan and package responsibilities: @docs/ARCHITECTURE.md. What was wrong with the old code: @docs/research/gap-analysis.md.

Packages are all scoped `@ez-gform/*`, and all live under `packages/`: `types` (shared TypeScript types), `core` (framework-agnostic parser/encoder/submit), `react` (hook), `codegen` (pure code generators: JSON/types/React/HTML), `cli` (npx generator), `background`/`content-script`/`popup` (private, boilerplate-style Rollup/Vite MV3 extension pieces, Chrome-only, no WXT) assembled by `extension` (private), `docs` (Next.js 16 App Router docs + playground), `tsconfig` (shared TS configs).

## Commands

- Root scripts all go through turbo: `pnpm build|test|lint|type-check`. Scope with `pnpm turbo run test --filter=@ez-gform/core`.
- Lint is ESLint flat config via `@kami-ui/eslint-config` (`base` for libraries/CLI, `react` for React packages, `next` for the docs app); Prettier is root-only, config in `.prettierrc`; lint runs per package because the config is type-aware and resolves tsconfig from cwd.
- Versioning is Changesets: run `pnpm changeset` for any publishable change.
- Shared deps use the pnpm catalog (`"react": "catalog:"`); workspace deps use `workspace:*`.

## Google Forms rules that are easy to get wrong

Invoke the `gform-internals` skill before touching encoding, parsing, or submit code. Key points: browser submissions are `fetch` with `mode: "no-cors"` so success is never observable (report "sent", not "succeeded"); date and time questions split into `entry.N_year/_month/_day` and `_hour/_minute`; checkbox repeats `entry.N`; "Other" uses `__other_option__` plus `entry.N.other_option_response`; question metadata must come from the `FB_PUBLIC_LOAD_DATA_` JSON, never from Google's obfuscated CSS classes. Source of truth: @docs/research/google-forms-internals.md. Test fixtures captured from live forms live in `packages/core/src/__fixtures__/`.

## Conventions

- TypeScript strict with `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (from `@ez-gform/tsconfig`); use `import type`.
- Libraries build with tsup to ESM + CJS + d.ts; `@ez-gform/core` must stay zero-runtime-dependency and browser/Node neutral (no DOM access outside `packages/react`).
- Tests are Vitest, colocated as `*.test.ts` next to the source.
- Commits: Conventional Commits, single author, no `Co-Authored-By` trailers.
- Use the `new-package` skill to add a workspace package so it matches the existing layout.
