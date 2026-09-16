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
│   ├── background/      # @ez-gform/background (private, MV3 service worker)
│   ├── content-script/  # @ez-gform/content-script (private)
│   ├── popup/           # @ez-gform/popup (private, popup UI)
│   ├── extension/       # @ez-gform/extension (private, assembles the three above into dist/)
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
`SubmitOptions`, `ValidationResult`), the codegen generators' option types,
and the message contracts the upcoming boilerplate-style `extension` popup
and content script will exchange (`ExtensionMessage`, `StoredSettings`).
Centralizing these avoids the exact class of drift a single source-of-truth
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

## `packages/codegen` — `@ez-gform/codegen`

Pure, framework-neutral code generators that turn a parsed `FormSchema`
into paste-ready output: `generateSchemaJson`, `generateTypes` (a `const
... satisfies FormSchema` plus a companion `Values` type), `generateReactComponent`
(a controlled React form component), and `generateHtmlForm` (a plain HTML
`<form>` with the correct `entry.NNN` `name` attributes). No I/O of its
own — `packages/cli` and, eventually, the extension's popup are the two
callers that fetch/parse a form and hand the resulting schema to these
generators. Kept separate from `packages/core` so `core` can stay
templating-free and zero-runtime-dependency.

## `packages/cli` — `@ez-gform/cli`

An `npx` tool: given a public form URL, fetches it, runs it through
`@ez-gform/core`'s parser, and `@ez-gform/codegen`'s generators to emit a
JSON schema, TypeScript types, or a scaffolded React component. This directly replaces the legacy extension's
"generate paste-ready code" role for anyone who'd rather run a CLI than
install a browser extension, and gives `packages/docs`' walkthrough a
non-extension path for obtaining `entry.*` ids — the single biggest
onboarding gap identified in the legacy `example` repo (gap-analysis
`example` #3).

## `packages/background`, `packages/content-script`, `packages/popup`, `packages/extension`

Four private, boilerplate-style packages (Rollup/Vite build tooling, no
WXT) that together replace the legacy single-repo extension:

- `@ez-gform/background` — MV3 service worker that relays
  `EZ_GFORM_GET_SOURCE` requests from the popup to the active tab's
  content script.
- `@ez-gform/content-script` — fetches or reads a Google Form's HTML for
  the popup to parse.
- `@ez-gform/popup` — the popup UI: parses the active tab's Google Form
  via `@ez-gform/core` and generates paste-ready code via
  `@ez-gform/codegen`. Replaces the legacy extension's DOM-injection
  output entirely.
- `@ez-gform/extension` — contains no extension logic itself; it builds
  the three packages above (Turborepo `^build` dependency) and assembles
  their outputs plus generated icons into `packages/extension/dist/`,
  writing `manifest.json`.

All four use `@ez-gform/core`'s `FB_PUBLIC_LOAD_DATA_` parser instead of
hardcoded CSS-class/`jscontroller` scraping (fixing the single most
fragile part of the legacy tool, gap-analysis `extension` #1), and
explicitly handle `/forms/u/N/d/` URLs via the `URL` API rather than
string slicing (gap-analysis `extension` #8). The manifest declares
explicit `host_permissions` for `docs.google.com` (gap-analysis
`extension` #5).

**Chrome-only for now.** The manifest is MV3 with
`background.service_worker`; Firefox's MV3 service-worker support is
still incomplete, expecting `background.scripts` instead unless run
under a `browser_specific_settings.gecko` override with the newer
service-worker support enabled in `about:config`. No Firefox-specific
manifest variant is generated yet, so this closes gap-analysis
`extension` #7 for Chrome (and Chromium-based browsers — Edge, Brave,
etc.) only; a Firefox build remains open work, tracked as an explicit
unsupported-for-now limitation rather than a silent gap.

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
  (`types`, `core`, `react`, `codegen`, `cli`). The private extension
  packages build differently since they ship browser bundles, not a
  library: `background`/`content-script` use Rollup, `popup` uses Vite,
  and `extension` runs a small `tsx` script that assembles the three
  outputs into `dist/` and writes `manifest.json`.
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
