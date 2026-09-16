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
│   ├── core/          # @ez-gform/core
│   ├── react/          # @ez-gform/react
│   └── cli/             # @ez-gform/cli
├── apps/
│   ├── extension/     # @ez-gform/extension
│   └── docs/            # @ez-gform/docs
├── docs/                 # this repo's own docs (research, architecture)
├── .github/workflows/  # CI
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── biome.json
└── .changeset/
```

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
lets `react`, `cli`, and `extension` all consume one schema and encoder
instead of three independently-drifting implementations.

## `packages/react` — `@ez-gform/react`

- `useGoogleForm` — a hook exposing an explicit
  `status: 'idle'|'submitting'|'success'|'error'` state machine and a
  promise-returning submit function, fixing the legacy hook's biggest gap
  (no way to drive a "submitting…/thanks!/error" UI — gap-analysis `core`
  #2) and its double-submit hazard (#9, fixed by rejecting submits while
  `status === 'submitting'`).
- A compat `useEasyGoogleForm` adapter matching the **old**
  `formRef`/`gFormId`/`links` signature, so existing consumers of the
  legacy package can migrate by changing only the import — while the new
  code underneath uses `@ez-gform/core`'s validated encoder instead of the
  legacy per-call DOM `querySelector` reads (fixing the unescaped-selector
  crash, gap-analysis `core` #3).

## `packages/cli` — `@ez-gform/cli`

An `npx` tool: given a public form URL, fetches it, runs it through
`@ez-gform/core`'s parser, and emits a JSON schema, TypeScript types, or a
scaffolded React component. This directly replaces the legacy extension's
"generate paste-ready code" role for anyone who'd rather run a CLI than
install a browser extension, and gives `apps/docs`' walkthrough a
non-extension path for obtaining `entry.*` ids — the single biggest
onboarding gap identified in the legacy `example` repo (gap-analysis
`example` #3).

## `apps/extension` — `@ez-gform/extension`

**WXT**, MV3, Chrome + Firefox. Rationale: the legacy extension was
Chrome-only with no `permissions`/`host_permissions` declared (a Web Store
review risk), injected escaped code as a `<p>` into the live Google Forms
page with no dedup guard (duplicating on every reload), and used a
fragile regex that mishandled `/forms/u/<n>/d/...` multi-account URLs
(gap-analysis `extension` #5, #6, #8). WXT gives cross-browser manifest
generation for free, and a proper popup UI (with a copy button) replaces
DOM injection entirely. Uses `@ez-gform/core`'s `FB_PUBLIC_LOAD_DATA_`
parser instead of hardcoded CSS-class/`jscontroller` scraping (fixing the
single most fragile part of the legacy tool, gap-analysis `extension` #1),
and explicitly handles `/forms/u/N/d/` URLs via the `URL` API rather than
string slicing.

## `apps/docs` — `@ez-gform/docs`

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
- **tsup** builds ESM + CJS + `.d.ts` for every publishable package —
  matches the legacy Rollup output shape (CJS+ESM+types) without Rollup's
  two-pass config duplication.
- **Vitest** for all packages — none of the three legacy repos had a
  working test suite (`core`'s `test` script referenced an uninstalled
  `jest`; `extension` had one assertion-free manual smoke script;
  `example` had none at all).
- **Biome** for lint + format — single fast tool instead of
  ESLint+Prettier, consistent config shared at the workspace root.
- **Changesets** for versioning — the legacy repos had npm/GitHub-org
  naming drift (`@webadeva/...` vs `@hymns-of-web/...`, unpublished
  versions that existed in git but not on npm); Changesets enforces a
  single coordinated release flow across all `@ez-gform/*` packages from a
  consistent scope.
- **GitHub Actions CI** (lint, typecheck, test, build) gating every PR —
  none of the three legacy repos had any CI at all; this is the single
  most repeated gap across all three (gap-analysis, every section).
