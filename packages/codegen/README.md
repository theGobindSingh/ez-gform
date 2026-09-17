# @ez-gform/codegen

Turn a form's schema into code you can paste: TypeScript types, a React
component, or a plain HTML form. Runs in Node and the browser.

Just want the output? `npx @ez-gform/cli <google-form-url> --format react`
does this for you, no install needed.

## Install

```sh
pnpm add @ez-gform/codegen
```

## Usage

`schema` is a `FormSchema` from `@ez-gform/core`'s `parseFormHtml`.

```ts
import {
  generateHtmlForm,
  generateReactComponent,
  generateSchemaJson,
  generateTypes,
} from "@ez-gform/codegen";

generateSchemaJson(schema); // the schema as JSON text
generateTypes(schema, { name: "MyForm" }); // MyFormSchema const + MyFormValues type
generateReactComponent(schema, { name: "MyForm" }); // a .tsx component using useGoogleForm
generateHtmlForm(schema); // a plain <form> that posts to Google, no JS
```

Each function returns a string.

| Function                 | Options                                                             |
| ------------------------ | ------------------------------------------------------------------- |
| `generateSchemaJson`     | `pretty` (default `true`)                                           |
| `generateTypes`          | `name` (default: from the form title)                               |
| `generateReactComponent` | `name`, `typescript` (default `true`; `false` emits plain JS + JSX) |
| `generateHtmlForm`       | none                                                                |

Also exported: `toPascalCase`, `toIdentifier` (the naming helpers used above).

## Good to know

- File upload questions can't be submitted without a Google sign-in, so they
  are left out of the types and shown as a disabled note in React/HTML output.
- Output is self-contained: the schema is embedded, so you can paste a single
  file.
