# Gap Analysis

Every concrete gap/bug/DX problem found in the three legacy repos, grouped by
package, each with a one-line rebuild fix.

## `core` (`use-easy-google-form`)

1. **`npm test` is broken** — `test` script runs `jest`, which isn't a
   dependency. *Fix: real Vitest suite wired to `test` script.*
2. **No submission outcome signal** — `fetch(...).catch(()=>{})` is
   fire-and-forget; `onSubmitExtra` fires before the fetch settles, not
   after success. *Fix: `useGoogleForm` exposes a
   `status: 'idle'|'submitting'|'success'|'error'` state machine, and the
   submit function returns/resolves a promise.*
3. **No CSS-selector escaping** — `formId` is interpolated directly into
   `querySelector('#'+id)`; ids with spaces/leading digits throw an
   uncaught `DOMException`. *Fix: `CSS.escape()` all selector interpolation,
   or avoid `querySelector` entirely by taking values directly instead of
   DOM ids (core package doesn't touch the DOM at all — only `react`
   package does, and should use registered refs, not id lookups).*
4. **`any` typing in the switch statement**, inconsistent with
   `strict`/`noImplicitAny` elsewhere. *Fix: TypeScript strict mode with no
   `any`, discriminated unions per question type.*
5. **Non-null assertion on possibly-undefined event** (`onSubmitExtra(e!)`
   called even when `e` is `undefined`). *Fix: correct optional typing, no
   assertions.*
6. **Dead script**: `postbuild: rimraf dist/hooks` removes a directory the
   build never creates. *Fix: drop dead scripts; tsup build config audited.*
7. **No required-field/entry-format validation** — a typo'd `entryId` or
   missing required field fails silently server-side only. *Fix: core
   `parseFormFromHTML`/schema validates required fields at submit time
   against the parsed `FB_PUBLIC_LOAD_DATA_` schema before sending.*
8. **Unsupported question types** (file upload, grid, linear scale) not in
   the type union; `switch` has no `default`, so unknown types silently
   no-op. *Fix: exhaustive discriminated union covering all Google Forms
   question types the API supports, with a compile-time `never` check on
   the switch default.*
9. **No debounce/guard against double-submission.** *Fix: state machine
   rejects a second submit while `status === 'submitting'`.*
10. **All logic in one untested 212-line file**, despite pure/testable
    helpers. *Fix: split parser / encoder / submit into separate,
    independently unit-tested modules in `@ez-gform/core`.*
11. **No CI** (no `.github/workflows` at all). *Fix: GitHub Actions running
    lint/typecheck/test/build on every PR.*
12. **Type/peer-dep mismatch** — dev types pinned to React 19's
    `RefObject<T | null>` while peer range is `react >= 16`. *Fix: pin peer
    range to what's actually tested, or avoid ref-based DOM reads in
    `@ez-gform/react` altogether (controlled-value API instead).*
13. **No zero-dependency guarantee documented/enforced.** *Fix: keep
    `@ez-gform/core` zero-runtime-deps, enforced by a CI check (e.g.
    `pnpm why` / bundle-size budget).*

## `extension` (`useEasyGoogleForm-extension`)

1. **Scraping is coupled to obfuscated Google internals** — hardcoded CSS
   classes (`Qr7Oae`, `Ltcunf`, `BdZlM`, `docssharedWizToggleLabeledContainer`)
   and Closure `jscontroller` hashes (`rDGJeb`, `hIYTQc`, `pkFYWb`, `qDmeqc`,
   `D7fEsb`, `jmDACb`) that can break on any Google Forms frontend redeploy,
   with silent `catch {}` everywhere. *Fix: parse the embedded
   `FB_PUBLIC_LOAD_DATA_` JSON blob (see google-forms-internals.md) via
   `@ez-gform/core`'s parser instead of DOM/class scraping.*
2. **`LINEAR_SCALE` declared but never implemented** — silently dropped.
   *Fix: full type coverage including linear scale, grid, file upload
   (documented as unsupported where genuinely unsupported by the
   `formResponse` endpoint).*
3. **Grid and File Upload entirely unhandled**, unrecognized types silently
   omit the field. *Fix: parser reports unsupported types explicitly instead
   of silently dropping fields.*
4. **Relies on ambient session cookies fetching `/prefill`**; doesn't
   distinguish "not logged in" from "parse failure" from "malformed URL."
   *Fix: explicit error states in extension UI (not-public form,
   fetch-failed, unsupported-question-type-found).*
5. **No `permissions`/`host_permissions` in manifest** — Web Store review
   risk. *Fix: WXT-managed manifest with explicit `host_permissions` for
   `docs.google.com`.*
6. **Output UI is escaped text dumped into a `<p>` on the live Forms page**,
   duplicates on every reload (no dedup check before
   `containerDiv.innerHTML = newHtml + oldHtml`). *Fix: popup UI (WXT) with
   syntax highlighting and a copy button, not DOM injection into Google's
   page.*
7. **Chrome-only** (no Firefox `browser_specific_settings`). *Fix: WXT
   cross-browser build target (Chrome + Firefox).*
8. **URL parsing via fragile regex/string-slicing**, mishandles
   `/forms/u/<n>/d/...` multi-account URLs — a near-certain real bug for
   any non-default Google account. *Fix: proper `URL`/path-segment parsing
   that handles `/forms/u/N/d/...`.*
9. **No packaged `dist` in repo**, README implies a directly-loadable clone.
   *Fix: CI produces a release artifact (zip) per tag.*
10. **Non-deterministic generated field ids** (random `nanoid` per scrape),
    unstable across re-runs. *Fix: derive ids deterministically from the
    `entry.NNNN` value.*
11. **Zero automated tests**, one manual assertion-free smoke script.
    *Fix: Vitest coverage across a matrix of question types/edge cases.*
12. **No CI**, stale README release links (org renamed `hymnsOfWeb` →
    `webadeva`). *Fix: GitHub Actions CI + Chrome Web Store / Firefox
    Add-ons submission pipeline.*

## `example` (docs/demo app)

1. **Pinned dependency (`@hymns-of-web/use-easy-google-form@^2.0.0`) doesn't
   resolve on the public npm registry** — a fresh `npm install` fails today.
   *Fix: `apps/docs` depends on the workspace package via pnpm workspace
   protocol, never a stale external registry name.*
2. **Only 6 of the supported field types demonstrated**, no `radio`, no
   error/loading states, no validation example. *Fix: interactive
   playground in `apps/docs` covering every supported question type plus
   error/loading UI, driven by `@ez-gform/react`'s state machine.*
3. **No walkthrough for obtaining `gFormId`/`entry.*` IDs** — the single
   biggest onboarding gap. *Fix: `apps/docs` documents the CLI/extension
   flow that eliminates manual ID-hunting entirely.*
4. **Composite-field DOM convention (wrapper div + named sub-inputs) is
   undocumented outside example source.** *Fix: `@ez-gform/react`'s hook API
   doesn't require this convention at all — it takes a plain values object,
   documented in the core/react API reference.*
5. **Stale toolchain**: Next.js 13 vs current 16, CI pinned to EOL Node 16,
   unused `basePath` config. *Fix: `apps/docs` on current Next.js
   (App Router) and Node LTS, deployed via Vercel.*
6. **No tests**, generic unedited CNA README, cosmetic-only git history.
   *Fix: `apps/docs` treated as a first-class package with lint/build
   checked in CI like every other workspace package.*

## Cross-cutting (ecosystem-level)

- **No shared type/schema across the three repos** — the extension's
  scraped output and the hook's expected `links[]` shape can drift silently.
  *Fix: `@ez-gform/core` is the single source of truth for the form schema
  type, consumed by `react`, `cli`, and `extension` alike.*
- **npm/org naming drift** (`@webadeva/...` vs `@hymns-of-web/...`, GitHub
  org renamed without redirecting release links). *Fix: single consistent
  `@ez-gform/*` npm scope and GitHub org from day one, enforced by
  Changesets release config.*
- **No CI anywhere in any of the three repos.** *Fix: one Turborepo-wide
  GitHub Actions workflow (lint, typecheck, test, build) gating every PR
  across all packages.*
