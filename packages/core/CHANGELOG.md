# @ez-gform/core

## 0.1.0

### Minor Changes

- 7669371: Extract the shared schema/value/submit/codegen types into a new type-only `@ez-gform/types` package. `core`, `react`, `codegen`, and `cli` now `import type` from it instead of defining their own copies, and each keeps re-exporting the same type names, so this is an internal refactor with no public API change.
- 9a274db: Initial release of `@ez-gform/core`: parses `FB_PUBLIC_LOAD_DATA_` into a typed `FormSchema`, encodes `FormValues` into Google Forms' `entry.NNN` wire format (text, checkboxes, "Other", date/time, grids), builds prefill URLs and submit bodies, and submits via `fetch`.

### Patch Changes

- 6599aca: `core`: zero-pad `DateValue`'s `hour`/`minute` fields to match the `TimeValue` wire format, remove the unsourced `entry.N_sentinel` emission from `encodeValues` (an empty checkbox array now emits nothing), and document/test that a grid question can be encoded via either the nested row map or flat row `entry.N` ids. `codegen`: `toIdentifier` now guards JS/TS reserved words (appending a trailing underscore) and falls back to `Form` for empty/emoji-only input, matching `toPascalCase`.
- 8284fd0: Parse Google Forms rating questions (type code 18) as `linear_scale` instead of throwing `ParseError`.
- Updated dependencies [96cd5cb]
- Updated dependencies [7669371]
  - @ez-gform/types@0.1.0
