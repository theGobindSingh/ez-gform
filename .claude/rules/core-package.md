---
paths:
  - "packages/core/**"
---

`@ez-gform/core` must not import `react`, touch `document`/`window`, or add runtime dependencies, other than the type-only `@ez-gform/types` package (shared schema/value/submit types — no runtime code). Every public function needs a Vitest test, and parser tests must run against the live-captured fixtures in `src/__fixtures__/`, not hand-written JSON.
