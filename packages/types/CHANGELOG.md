# @ez-gform/types

## 0.1.0

### Minor Changes

- 96cd5cb: Remove the `ExtensionMessage`, `ExtensionResponse`, and `StoredSettings` types — the browser extension that consumed them has been removed from the monorepo.
- 7669371: Extract the shared schema/value/submit/codegen types into a new type-only `@ez-gform/types` package. `core`, `react`, `codegen`, and `cli` now `import type` from it instead of defining their own copies, and each keeps re-exporting the same type names, so this is an internal refactor with no public API change.
