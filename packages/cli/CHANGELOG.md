# @ez-gform/cli

## 0.1.0

### Minor Changes

- ead0a26: Initial release of `@ez-gform/cli`: an `ez-gform` `npx` tool that fetches a public Google Form and emits JSON/`types`/`react`/`html` via `@ez-gform/codegen`, supports offline `--json-input` for saved `FB_PUBLIC_LOAD_DATA_`/HTML, and a `submit` subcommand for smoke-testing a payload against the live `formResponse` endpoint.
- 7669371: Extract the shared schema/value/submit/codegen types into a new type-only `@ez-gform/types` package. `core`, `react`, `codegen`, and `cli` now `import type` from it instead of defining their own copies, and each keeps re-exporting the same type names, so this is an internal refactor with no public API change.

### Patch Changes

- Updated dependencies [6599aca]
- Updated dependencies [8284fd0]
- Updated dependencies [96cd5cb]
- Updated dependencies [7669371]
- Updated dependencies [9a274db]
- Updated dependencies [ead0a26]
  - @ez-gform/core@0.1.0
  - @ez-gform/codegen@0.1.0
  - @ez-gform/types@0.1.0
