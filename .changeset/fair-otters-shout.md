---
"@ez-gform/core": patch
"@ez-gform/codegen": patch
---

`core`: zero-pad `DateValue`'s `hour`/`minute` fields to match the `TimeValue` wire format, remove the unsourced `entry.N_sentinel` emission from `encodeValues` (an empty checkbox array now emits nothing), and document/test that a grid question can be encoded via either the nested row map or flat row `entry.N` ids. `codegen`: `toIdentifier` now guards JS/TS reserved words (appending a trailing underscore) and falls back to `Form` for empty/emoji-only input, matching `toPascalCase`.
