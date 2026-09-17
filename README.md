# ez-gform

Submit your own custom React/HTML form to a Google Form with no backend. ez-gform maps your
form's fields to a Google Form's entries and posts directly to Google's endpoint, so you get
free, serverless form submission and response collection in a Google Sheet. This monorepo
contains the core mapping/submission library, a React binding, a CLI for discovering Google
Form field IDs, and the project docs site.

## Packages

Published to npm:

| Package             | Description                                                               |
| ------------------- | ------------------------------------------------------------------------- |
| `@ez-gform/types`   | Shared TypeScript types (schema, values, submit, codegen)                 |
| `@ez-gform/core`    | Framework-agnostic core: builds and submits form payloads to Google Forms |
| `@ez-gform/react`   | React hooks/components built on `@ez-gform/core`                          |
| `@ez-gform/codegen` | Pure code generators (JSON schema, TS types, React component, HTML form)  |
| `@ez-gform/cli`     | `npx` tool to discover Google Form field entry IDs and generate code      |

Private apps (not published):

| Package          | Description                                                        |
| ---------------- | ------------------------------------------------------------------ |
| `@ez-gform/docs` | Documentation site and interactive playground (Next.js App Router) |

## Development

This is a pnpm + Turborepo monorepo.

```bash
pnpm install       # install dependencies
pnpm build         # build all packages
pnpm dev           # run dev mode across packages
pnpm test          # run tests
pnpm lint          # lint
pnpm lint:fix       # lint and fix
pnpm format         # format with prettier
pnpm type-check     # type-check
pnpm clean          # clean build artifacts
pnpm changeset      # add a changeset
pnpm version-packages # bump versions from changesets
pnpm release        # build and publish
```

Scope any task to one package with `--filter`, e.g.
`pnpm turbo run test --filter=@ez-gform/core`.

## Quick start (React)

```sh
pnpm add @ez-gform/react @ez-gform/core react
```

```tsx
import { useGoogleForm } from "@ez-gform/react";

function ContactForm({ schema }) {
  const { register, submit, status } = useGoogleForm({
    formId: schema.formId,
    schema,
  });

  return (
    <form onSubmit={submit}>
      <input aria-label="Your name" {...register("entry.111")} />
      <button type="submit">Send</button>
      {status === "sent" && <p>Thanks!</p>}
    </form>
  );
}
```

See `packages/react/README.md` for the full API.

## CLI

```sh
npx @ez-gform/cli <google-form-url>
```

## Docs

The docs site lives in `packages/docs`; deploy to Vercel with root
directory `packages/docs`.

## License

MIT © webadeva
