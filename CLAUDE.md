# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`ez-gform` is a pnpm + Turborepo monorepo that lets developers submit their own custom form UI to a Google Form without a backend. It is a ground-up rebuild of `webadeva/use-easy-google-form`, its Chrome extension, and its example app. Rebuild plan and package responsibilities: @docs/ARCHITECTURE.md. What was wrong with the old code: @docs/research/gap-analysis.md.

Packages are all scoped `@ez-gform/*`: `core` (framework-agnostic parser/encoder/submit), `react` (hook), `cli` (npx generator), `apps/extension` (WXT MV3), `apps/docs` (Next.js docs + playground), `tooling/tsconfig`.

## Commands

- Root scripts all go through turbo: `pnpm build|test|lint|typecheck`. Scope with `pnpm turbo run test --filter=@ez-gform/core`.
- Lint/format is Biome (v2), not ESLint/Prettier: `pnpm biome check .` and `pnpm biome check --write .`. A PostToolUse hook auto-formats edited TS/JS/JSON files.
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
