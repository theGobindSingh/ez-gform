---
"@ez-gform/codegen": minor
---

Initial release of `@ez-gform/codegen`: pure, zero-DOM/`fs` generators that turn a `FormSchema` into `generateSchemaJson`, `generateTypes` (a `FormSchema` const plus a precise per-question `Values` type), `generateReactComponent` (a paste-ready component wired to `@ez-gform/react`'s `useGoogleForm`), and `generateHtmlForm` (a plain `<form>` posting straight to `formResponse`), plus `toPascalCase`/`toIdentifier` naming helpers.
