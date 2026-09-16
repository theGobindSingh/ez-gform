# @ez-gform/cli

`npx` tool: fetch a public Google Form and emit a JSON schema, TypeScript
types, a paste-ready React component, or a plain HTML form — the
non-extension path for getting `entry.*` ids and generated code.

## Usage

```sh
npx @ez-gform/cli <form-url-or-id> [--format json|types|react|html] [--name MyForm] [--out <file>] [--json-input <file>]
npx @ez-gform/cli submit <form-url-or-id> --data '{"entry.123":"hi"}'
npx @ez-gform/cli --help
npx @ez-gform/cli --version
```

- `--format` defaults to `json`.
- `--name` sets the base name used by the `types`/`react` formats.
- `--out <file>` writes to a file instead of stdout.
- `--json-input <file>` reads a saved `FB_PUBLIC_LOAD_DATA_` JSON array or a
  saved `/viewform` HTML page instead of fetching over the network.
- `submit --data '<json>'` or `--data @file.json` validates the payload
  against the fetched schema, then POSTs it with `mode: "cors"` (so the
  response can actually be read, unlike a browser submission) — useful as a
  smoke test.

Exit codes: `0` success, `1` usage error, `2` fetch/parse/validation error.

If a form requires sign-in, the CLI prints a clear error instead of a
confusing HTML dump:

> This form requires sign-in; ez-gform only works with forms that are public
> (Settings → Responses → 'Restrict to users in `<org>`' off)

## Install

```sh
pnpm add -D @ez-gform/cli
```
