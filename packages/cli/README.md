# @ez-gform/cli

Point it at a public Google Form; get the form's `entry.N` ids, or ready-made
code.

```sh
npx @ez-gform/cli <form-url-or-id>
```

That prints the form's schema as JSON: every question, its type, and its
entry id.

## Generate code

```sh
npx @ez-gform/cli <form-url-or-id> --format react --out ContactForm.tsx
```

| Flag                  | What it does                                                  |
| --------------------- | ------------------------------------------------------------- |
| `--format`            | `json` (default), `types`, `react` or `html`.                 |
| `--name MyForm`       | Name for the generated types / component.                     |
| `--out <file>`        | Write to a file instead of printing.                          |
| `--json-input <file>` | Read a saved form page (HTML or JSON) instead of fetching it. |

## Test a submission

```sh
npx @ez-gform/cli submit <form-url-or-id> --data '{"entry.123":"hi"}'
```

Checks the data against the form, then submits it. Unlike a browser, the CLI
can read Google's response, so this tells you whether the submission really
worked. `--data @file.json` reads from a file.

## Good to know

- The form must be public. If it needs sign-in, the CLI tells you which Google
  Forms setting to turn off.
- Exit codes: `0` success, `1` bad usage, `2` fetch, parse or validation
  error.
- Use it often? `pnpm add -D @ez-gform/cli`.
