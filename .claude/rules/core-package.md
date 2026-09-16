---
paths:
  - "packages/core/**"
---

`@ez-gform/core` must not import `react`, touch `document`/`window`, or add runtime dependencies. Every public function needs a Vitest test, and parser tests must run against the live-captured fixtures in `src/__fixtures__/`, not hand-written JSON.
