# ez-gform

Build your own form UI and submit it straight to a Google Form. No backend —
responses land in your Google Form (and its Sheet) like any other.

## Quick start (React)

```sh
pnpm add @ez-gform/react
```

```tsx
import { useGoogleForm } from "@ez-gform/react";

function ContactForm() {
  const { register, submit, status } = useGoogleForm({
    formId: "https://docs.google.com/forms/d/e/1FAIpQLS.../viewform",
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

Each field needs its Google Form `entry.N` id. Get them all in one command:

```sh
npx @ez-gform/cli <google-form-url>
```

The form must be public (no sign-in required).

## Packages

| Package                                 | Use it to                                                |
| --------------------------------------- | -------------------------------------------------------- |
| [`@ez-gform/react`](packages/react)     | Submit from React with the `useGoogleForm` hook          |
| [`@ez-gform/core`](packages/core)       | Parse, encode and submit from any JS (no framework)      |
| [`@ez-gform/cli`](packages/cli)         | Find a form's `entry.N` ids and generate code, via `npx` |
| [`@ez-gform/codegen`](packages/codegen) | Generate types, a React component, or plain HTML         |
| [`@ez-gform/types`](packages/types)     | Shared TypeScript types                                  |

The docs site and playground live in [`packages/docs`](packages/docs).

## Contributing

pnpm + Turborepo monorepo: `pnpm install`, then `pnpm build`, `pnpm test`,
`pnpm lint`. Details in [docs/development.md](docs/development.md).

## License

MIT © webadeva
