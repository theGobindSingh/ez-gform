# @ez-gform/docs

The ez-gform docs site and playground. Next.js App Router; not published to
npm.

## Run it

```sh
pnpm install
pnpm turbo run dev --filter=@ez-gform/docs
```

Build, test, lint and type-check:

```sh
pnpm turbo run build test lint type-check --filter=@ez-gform/docs
```

## What's in it

| Route                         | What it is                                                    |
| ----------------------------- | ------------------------------------------------------------- |
| `/`                           | Overview                                                      |
| `/getting-started`            | Install and first form                                        |
| `/guides/finding-your-form`   | Getting a form's URL and making it public                     |
| `/guides/question-types`      | What value each question type takes                           |
| `/packages/*`                 | Reference for core, react, codegen and cli                    |
| `/playground`                 | Paste a form URL: see its schema, generated code, a live form |
| `/api/schema?formId=<url-id>` | Fetches and parses a form server-side; used by the playground |

## Deploy (Vercel)

| Setting         | Value                                             |
| --------------- | ------------------------------------------------- |
| Root directory  | `packages/docs`                                   |
| Framework       | Next.js                                           |
| Install command | `pnpm install`                                    |
| Build command   | `pnpm turbo run build --filter=@ez-gform/docs...` |

Keep the trailing `...` in the build command: it builds the workspace packages
the site depends on first.
