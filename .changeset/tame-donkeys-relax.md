---
"@ez-gform/types": minor
"@ez-gform/core": minor
"@ez-gform/react": minor
"@ez-gform/codegen": minor
"@ez-gform/cli": minor
---

Extract the shared schema/value/submit/codegen types into a new type-only `@ez-gform/types` package. `core`, `react`, `codegen`, and `cli` now `import type` from it instead of defining their own copies, and each keeps re-exporting the same type names, so this is an internal refactor with no public API change.
