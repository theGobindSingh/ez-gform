# @ez-gform/codegen

Pure, framework-agnostic code generators that turn a parsed `FormSchema`
(from `@ez-gform/core`) into paste-ready output. No `fs`, no `process` — runs
in Node and the browser alike. Only runtime dependency is `@ez-gform/core`.

## Install

```sh
pnpm add @ez-gform/codegen
```

## API

```ts
import {
  generateSchemaJson,
  generateTypes,
  generateReactComponent,
  generateHtmlForm,
  toPascalCase,
  toIdentifier,
} from "@ez-gform/codegen";

generateSchemaJson(schema, { pretty: true });
// -> pretty/minified JSON text of the schema.

generateTypes(schema, { name: "MyForm" });
// -> `export const MyFormSchema = {...} as const satisfies FormSchema;`
//    plus `export type MyFormValues = { "entry.123"?: string; ... };`
//    with checkboxes/multiple_choice "Other" options, date/time, grid rows,
//    and linear-scale numbers all mapped to the right FieldValue subtype.

generateReactComponent(schema, { name: "MyForm", typescript: true });
// -> a complete .tsx component wired to `useGoogleForm` from `@ez-gform/react`.

generateHtmlForm(schema);
// -> a plain <form action="…/formResponse" method="POST"> with correct
//    `entry.N` / `entry.N_year` / `__other_option__` name attributes,
//    for people not using React.
```

## Notes

- `file_upload` questions are omitted from generated types and rendered as a
  disabled note in the React/HTML output — Google Forms doesn't accept file
  uploads through the public API without a signed-in session.
- Generated output embeds the full schema as a literal so each artifact is
  self-contained and paste-ready.
