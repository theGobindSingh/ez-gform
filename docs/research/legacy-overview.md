# Legacy Overview

Three repos, one ecosystem, built by a single maintainer (webadeva / Gobind
Singh, formerly under the org `hymnsOfWeb`). None are published as a
coherent monorepo today; the npm package name and the GitHub org name have
drifted apart, and the example app depends on a scoped package that no
longer resolves on the public registry.

## 1. `use-easy-google-form` (npm: `@webadeva/use-easy-google-form`)

**What it is**: a single-file (212 line) React hook that lets a developer
build their own `<form>` UI and submit its values straight to a Google
Form's response endpoint, with no backend.

**API shape**:

```ts
useEasyGoogleForm({
  formRef: RefObject<HTMLFormElement | null>,
  gFormId: string,
  links: { entryId: string; formId: string; type: "text"|"radio"|"textarea"|"checkbox"|"date"|"dropdown"|"time" }[],
  extraEntries?: { entryId: string; value: string }[],
  onSubmitExtra?: SubmitEventHandler<HTMLElement>,
}) => (e?: SubmitEvent<HTMLFormElement>) => void
```

Returns a submit handler. Internally: for each `links[]` entry it reads a
DOM value by `formId` (simple `querySelector('#'+id)` for text/textarea;
`input:checked` inside a container div for radio/checkbox; named children
`day`/`month`/`year`/`hour`/`minute`/`second` for date/time), URL-encodes it,
and string-concatenates `entry.NNNN(_suffix)=value&` pairs onto
`https://docs.google.com/forms/d/<gFormId>/formResponse?...`, then does a
plain `fetch(url, {method:"POST"})` (no `mode: "no-cors"`) wrapped in a
swallow-everything try/catch. `onSubmitExtra` fires immediately after
issuing the fetch, not after it settles, so there is no real success/error
signal. Zero runtime dependencies; React is a peer dep. Rollup build →
CJS+ESM+d.ts. No tests (test script is `jest` but `jest` isn't installed),
no CI, 0 GitHub issues/stars, ~29 npm downloads/month.

## 2. `useEasyGoogleForm-extension`

**What it is**: an MV3 Chrome content script, companion to the hook above,
that runs on `docs.google.com/forms/*` edit pages and generates a
paste-ready React component wired to `useEasyGoogleForm`.

**Flow**: derives the form's `/prefill` URL from the current tab URL
(regex-based, breaks on `/forms/u/<n>/d/...` multi-account URLs) → fetches
that HTML using the browser's ambient session cookies → parses it with
`htmlparser2`/`domutils` by matching **hardcoded, obfuscated Google
internal CSS classes and Closure `jscontroller` hashes** (`Qr7Oae`,
`rDGJeb`=text, `hIYTQc`=multi-select, `pkFYWb`=single-select,
`qDmeqc`=date, `D7fEsb`=time, `jmDACb`=dropdown; `LINEAR_SCALE`=`snI0Yd` is
declared but has no handler) → builds a JSX template string with a random
5-char `nanoid` per field id → injects it as escaped text inside a `<p>`
prepended to the live Forms page DOM (no popup, no copy button, re-running
appends a duplicate block).

No `FB_PUBLIC_LOAD_DATA_` parsing at all — this is the more fragile of the
two possible extraction strategies, coupled to Google's minified frontend.
Grid, Scale, and File Upload are unsupported. No manifest
`permissions`/`host_permissions` declared. Chrome-only (no Firefox
manifest). Not published to the Chrome Web Store — manual "Load Unpacked"
from a GitHub Release zip whose download links point to a stale org name
(`hymnsOfWeb`, now `webadeva`). No CI, one manual assertion-free test
script.

## 3. `example-use-easy-google-form`

**What it is**: a Next.js 13 (Pages Router) demo app, deployed to GitHub
Pages, showing one hardcoded form (`components/form.tsx`) wired to the hook.

Demonstrates 6 of the hook's field types (`text`, `textarea`, `dropdown`,
`checkbox`, `time`, `date` — no `radio`). Confirms the composite-field DOM
convention by example: `time`/`date` need a wrapper `<div id={formId}>`
containing named number inputs (`hour`/`minute`, `year`/`month`/`day`);
`checkbox` needs a wrapper div containing multiple `<input name={formId}>`.
This convention is not documented anywhere else — it only exists as
reverse-engineerable example code. Depends on
`@hymns-of-web/use-easy-google-form@^2.0.0`, which **does not resolve on
the public npm registry** (renamed/unpublished — a fresh `npm install`
would fail). Next.js 13.5.4 vs current 16.x; CI pins Node 16 (EOL). No
tests, no walkthrough for obtaining `gFormId`/`entry.*` IDs, no
loading/error states — only a success `alert()`.

## How they fit together

`use-easy-google-form` is the runtime library. `useEasyGoogleForm-extension`
exists solely to remove the manual pain of hand-typing the `links[]`
`entryId`/`formId`/`type` mapping the hook requires, by scraping a live
Google Form and generating matching component code. `example-*` is the only
place the full config shape and the composite-field DOM convention are
demonstrated end-to-end; it is also the weakest link today since its
pinned dependency is unresolvable and its Next.js/Node versions are stale.
Together they show the intended pipeline: inspect form (extension) → paste
generated component (example pattern) → submit via hook (core) — but none
of the three pieces validate against each other (no shared schema/types),
so drift between "what the extension scrapes" and "what the hook expects"
is undetectable until runtime.
