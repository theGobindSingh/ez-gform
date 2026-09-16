# Getting Started

- **Interactive playground and full walkthrough**: run the docs site with
  `pnpm --filter @ez-gform/docs dev`, then open `/getting-started` and
  `/playground` locally (or the deployed docs site — see the root
  `README.md` for the Vercel deploy target).
- **React**: `pnpm add @ez-gform/react @ez-gform/core react`, then see
  `packages/react/README.md` for the `useGoogleForm` API and a copy-paste
  example.
- **Plain HTML/no framework**: `pnpm add @ez-gform/core`, then see
  `packages/core/README.md` for the parser/encoder/submit API directly.
- **Finding your form's `entry.*` ids without either of the above**: run
  `npx @ez-gform/cli <google-form-url>` (see `packages/cli/README.md`), or
  build and load the browser extension —
  `pnpm --filter @ez-gform/extension build`, then load
  `packages/extension/dist` unpacked (Chrome only for now; see
  `packages/extension/README.md`).
