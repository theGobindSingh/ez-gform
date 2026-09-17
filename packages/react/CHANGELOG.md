# @ez-gform/react

## 0.1.0

### Minor Changes

- 4cbe1bd: Initial release of `@ez-gform/react`: `useGoogleForm`, a controlled-values hook with an explicit `idle`/`validating`/`submitting`/`sent`/`ok`/`error` status machine, promise-returning `submit`, schema-driven validation, and `register`/`registerCheckbox` field bindings.
- 7669371: Extract the shared schema/value/submit/codegen types into a new type-only `@ez-gform/types` package. `core`, `react`, `codegen`, and `cli` now `import type` from it instead of defining their own copies, and each keeps re-exporting the same type names, so this is an internal refactor with no public API change.

### Patch Changes

- Updated dependencies [6599aca]
- Updated dependencies [8284fd0]
- Updated dependencies [96cd5cb]
- Updated dependencies [7669371]
- Updated dependencies [9a274db]
  - @ez-gform/core@0.1.0
  - @ez-gform/types@0.1.0
