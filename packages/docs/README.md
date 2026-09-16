# @ez-gform/docs

Documentation site and interactive playground for ez-gform. Next.js (App
Router), private (not published to npm).

## Develop

```sh
pnpm install
pnpm turbo run dev --filter=@ez-gform/docs
```

## Build / test / lint / type-check

```sh
pnpm turbo run build test lint type-check --filter=@ez-gform/docs
```

## Routes

- `/` — hero + 3-step overview.
- `/getting-started` — install, minimal React example, plain HTML example.
- `/guides/finding-your-form` — how to get a form's URL/ID and make it public.
- `/guides/question-types` — every `QuestionType` → `FieldValue` → wire format.
- `/packages/core`, `/packages/react`, `/packages/codegen`, `/packages/cli`,
  `/packages/extension` — per-package API reference.
- `/playground` — paste a public form URL/ID (or click "Load example" to use
  a bundled offline fixture) to see the parsed schema, generated
  json/types/react/html output, and a live form built with
  `useGoogleForm` that can actually submit to the form.
- `/api/schema` (`GET ?formId=...`) — Node-runtime route handler that fetches
  a form's `/viewform` HTML server-side and parses it with
  `@ez-gform/core`'s `parseFormHtml`. Used by the playground; also usable
  directly as an HTTP endpoint.

## Deploy (Vercel)

- **Root directory**: `packages/docs`
- **Framework preset**: Next.js
- **Install command**: `pnpm install`
- **Build command**: `pnpm turbo run build --filter=@ez-gform/docs...`

The trailing `...` in the build command tells Turborepo to also build this
package's workspace dependencies (`@ez-gform/core`, `@ez-gform/react`,
`@ez-gform/codegen`, `@ez-gform/types`) first, since Vercel only installs
and builds within `packages/docs` by default otherwise.
