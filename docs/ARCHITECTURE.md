# Architecture

This is the rebuild plan for `ez-gform`, informed by the gaps found in the
legacy `use-easy-google-form` ecosystem (see `docs/research/gap-analysis.md`
and `docs/research/legacy-overview.md`).

## Monorepo

**Turborepo + pnpm workspace**, named `ez-gform`. Rationale: the legacy
ecosystem was three separate, independently-versioned repos with no shared
types — the extension's scraped output could silently drift from what the
hook expected, and the example app depended on a package name that stopped
resolving on the registry entirely. A single workspace with one source of
truth for the form schema type eliminates that class of bug by
construction, and Turborepo's task graph/caching keeps `lint`/`test`/`build`
fast across four+ packages.

```
ez-gform/
├── packages/
│   ├── types/           # @ez-gform/types
│   ├── core/            # @ez-gform/core
│   ├── react/           # @ez-gform/react
│   ├── codegen/         # @ez-gform/codegen
│   ├── cli/             # @ez-gform/cli
│   ├── docs/            # @ez-gform/docs
│   └── tsconfig/        # @ez-gform/tsconfig
├── docs/                 # this repo's own docs (research, architecture)
├── .github/workflows/  # CI
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── eslint.config.mjs
├── .prettierrc
└── .changeset/
```

## `packages/types` — `@ez-gform/types`

A type-only package (no runtime code) holding the shared TypeScript types
every other package depends on: the form schema (`FormSchema`, `Question`,
`Section`, ...), submitted values (`FormValues`, `FieldValue`, `DateValue`,
`TimeValue`, `OtherValue`), submit/validation results (`SubmitResult`,
`SubmitOptions`, `ValidationResult`), and the codegen generators' option
types. Centralizing these avoids the exact class of drift a single source-of-truth
schema type was meant to prevent (see "Monorepo" above) — `core`, `react`,
`codegen`, and `cli` all `import type` from here and re-export what they
already exported, so this is purely an internal move with no public API
change.

## `packages/core` — `@ez-gform/core`

Framework-agnostic, **zero runtime dependencies** (the one genuinely good
property the legacy `core` package had — keep it). Contains:

- Schema types for a parsed Google Form (question, question-type union,
  entry id, options, required flag — see
  `docs/research/google-forms-internals.md` §4 for the type-code mapping
  this is built from).
- `parseFormFromHTML` — parses the embedded `FB_PUBLIC_LOAD_DATA_` JSON
  blob out of a form's HTML, replacing the legacy extension's fragile
  CSS-class/`jscontroller`-hash DOM scraping (gap-analysis `extension` #1),
  which broke on any Google Forms frontend redeploy.
- A submission encoder implementing the per-type `entry.NNN` wire format
  (text, checkbox multi-value, date `_year/_month/_day`, time
  `_hour/_minute`, grid rows, `__other_option__` — §3 of the internals doc),
  replacing the legacy hook's untested, single-file, `any`-typed switch
  statement (gap-analysis `core` #4, #8, #10).
- A prefill URL builder (`usp=pp_url` + `entry.NNN` params).
- A `submit` function using `fetch(url, { mode: 'no-cors' })` explicitly,
  returning a typed result (`sent` vs. threw) instead of the legacy
  fire-and-forget-into-a-swallowed-CORS-error pattern (gap-analysis `core`
  #2) — the opacity of the response is documented as a platform constraint,
  not hidden behind a silent catch.

Built with tsup, tested with Vitest, no framework coupling — this is what
lets `react`, `cli`, and `docs` all consume one schema and encoder
instead of three independently-drifting implementations.

## `packages/react` — `@ez-gform/react`

- `useGoogleForm` — a hook exposing an explicit
  `status: 'idle'|'submitting'|'success'|'error'` state machine and a
  promise-returning submit function, fixing the legacy hook's biggest gap
  (no way to drive a "submitting…/thanks!/error" UI — gap-analysis `core`
  #2) and its double-submit hazard (#9, fixed by rejecting submits while
  `status === 'submitting'`).

## `packages/codegen` — `@ez-gform/codegen`

Pure, framework-neutral code generators that turn a parsed `FormSchema`
into paste-ready output: `generateSchemaJson`, `generateTypes` (a `const
... satisfies FormSchema` plus a companion `Values` type), `generateReactComponent`
(a controlled React form component), and `generateHtmlForm` (a plain HTML
`<form>` with the correct `entry.NNN` `name` attributes). No I/O of its
own — `packages/cli` and the docs playground are the two callers that
fetch/parse a form and hand the resulting schema to these generators.
Kept separate from `packages/core` so `core` can stay templating-free and
zero-runtime-dependency.

## `packages/cli` — `@ez-gform/cli`

An `npx` tool: given a public form URL, fetches it, runs it through
`@ez-gform/core`'s parser, and `@ez-gform/codegen`'s generators to emit a
JSON schema, TypeScript types, or a scaffolded React component. This
replaces the legacy extension's "generate paste-ready code" role with a
CLI, and gives `packages/docs`' walkthrough a non-extension path for
obtaining `entry.*` ids — the single biggest onboarding gap identified in
the legacy `example` repo (gap-analysis `example` #3).

## `packages/docs` — `@ez-gform/docs`

**Next.js (App Router)**, deployed to **Vercel**. Rationale: the legacy
example app was stuck on Next.js 13 Pages Router, pinned to Node 16 (EOL)
in CI, and depended on a scoped package name that no longer resolves on
npm — a fresh clone couldn't even `npm install` (gap-analysis `example`
#1, #5). The rebuilt docs app consumes `@ez-gform/react`/`core` via the
pnpm workspace protocol (never an external registry pin), covers every
supported question type in an interactive playground (fixing the
6-of-N-types coverage gap, `example` #2) with a real error/loading-state
demo (fixing `example` #2 and `core-report.md`'s "no failure path shown"
finding), and documents the composite-field-free, plain-values API surface
so the old undocumented wrapper-div/named-sub-input DOM convention
(`example` #4) no longer needs to exist at all.

## Tooling

- **TypeScript strict** across every package — the legacy `core` package
  had `strict` on but still leaked `any` in its switch statement
  (gap-analysis `core` #4); strict mode plus lint rules banning `any`
  closes that gap for good.
- **tsup** builds ESM + CJS + `.d.ts` for every publishable package
  (`types`, `core`, `react`, `codegen`, `cli`).
- **Vitest** for all packages — none of the three legacy repos had a
  working test suite (`core`'s `test` script referenced an uninstalled
  `jest`; `extension` had one assertion-free manual smoke script;
  `example` had none at all).
- **ESLint** (flat config, via the shared `@kami-ui/eslint-config` package)
  for lint, **Prettier** for format — each package lints itself since the
  config is type-aware and resolves its tsconfig from the working directory;
  Prettier's config is root-only.
- **Changesets** for versioning — the legacy repos had npm/GitHub-org
  naming drift (`@webadeva/...` vs `@hymns-of-web/...`, unpublished
  versions that existed in git but not on npm); Changesets enforces a
  single coordinated release flow across all `@ez-gform/*` packages from a
  consistent scope.
- **GitHub Actions CI** (lint, type-check, test, build) gating every PR —
  none of the three legacy repos had any CI at all; this is the single
  most repeated gap across all three (gap-analysis, every section).
