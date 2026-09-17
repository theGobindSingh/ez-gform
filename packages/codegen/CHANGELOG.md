# @ez-gform/codegen

## 0.1.0

### Minor Changes

- 7669371: Extract the shared schema/value/submit/codegen types into a new type-only `@ez-gform/types` package. `core`, `react`, `codegen`, and `cli` now `import type` from it instead of defining their own copies, and each keeps re-exporting the same type names, so this is an internal refactor with no public API change.
- ead0a26: Initial release of `@ez-gform/codegen`: pure, zero-DOM/`fs` generators that turn a `FormSchema` into `generateSchemaJson`, `generateTypes` (a `FormSchema` const plus a precise per-question `Values` type), `generateReactComponent` (a paste-ready component wired to `@ez-gform/react`'s `useGoogleForm`), and `generateHtmlForm` (a plain `<form>` posting straight to `formResponse`), plus `toPascalCase`/`toIdentifier` naming helpers.

### Patch Changes

- 6599aca: `core`: zero-pad `DateValue`'s `hour`/`minute` fields to match the `TimeValue` wire format, remove the unsourced `entry.N_sentinel` emission from `encodeValues` (an empty checkbox array now emits nothing), and document/test that a grid question can be encoded via either the nested row map or flat row `entry.N` ids. `codegen`: `toIdentifier` now guards JS/TS reserved words (appending a trailing underscore) and falls back to `Form` for empty/emoji-only input, matching `toPascalCase`.
- Updated dependencies [6599aca]
- Updated dependencies [8284fd0]
- Updated dependencies [96cd5cb]
- Updated dependencies [7669371]
- Updated dependencies [9a274db]
  - @ez-gform/core@0.1.0
  - @ez-gform/types@0.1.0
