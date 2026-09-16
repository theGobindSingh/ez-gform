# ez-gform

Submit your own custom React/HTML form to a Google Form with no backend. ez-gform maps your
form's fields to a Google Form's entries and posts directly to Google's endpoint, so you get
free, serverless form submission and response collection in a Google Sheet. This monorepo
contains the core mapping/submission library, a React binding, a CLI for discovering Google
Form field IDs, a browser extension to help you inspect forms, and the project docs site.

## Packages

| Package               | Description                                                               |
| --------------------- | ------------------------------------------------------------------------- |
| `@ez-gform/core`      | Framework-agnostic core: builds and submits form payloads to Google Forms |
| `@ez-gform/react`     | React hooks/components built on `@ez-gform/core`                          |
| `@ez-gform/cli`       | CLI to discover Google Form field entry IDs                               |
| `@ez-gform/extension` | Browser extension to help inspect Google Forms                            |
| `@ez-gform/docs`      | Documentation site                                                        |

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

## License

MIT © webadeva
