import { Code } from "@/components/Code";

const api = `import {
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
// -> \`export const MyFormSchema = {...} as const satisfies FormSchema;\`
//    plus \`export type MyFormValues = { "entry.123"?: string; ... };\`
//    with checkboxes/multiple_choice "Other" options, date/time, grid rows,
//    and linear-scale numbers all mapped to the right FieldValue subtype.

generateReactComponent(schema, { name: "MyForm", typescript: true });
// -> a complete .tsx component wired to \`useGoogleForm\` from \`@ez-gform/react\`.

generateHtmlForm(schema);
// -> a plain <form action="…/formResponse" method="POST"> with correct
//    entry.N / entry.N_year / __other_option__ name attributes,
//    for people not using React.`;

export default function CodegenPackagePage() {
  return (
    <div>
      <h1>@ez-gform/codegen</h1>
      <p>
        Pure, framework-agnostic code generators that turn a parsed{" "}
        <code>FormSchema</code> (from <code>@ez-gform/core</code>) into
        paste-ready output. No <code>fs</code>, no <code>process</code> — runs
        in Node and the browser alike. Only runtime dependency is{" "}
        <code>@ez-gform/core</code>.
      </p>

      <h2>Install</h2>
      <Code language="sh">{`pnpm add @ez-gform/codegen`}</Code>

      <h2>API</h2>
      <Code language="ts">{api}</Code>

      <p>
        Try all four generators live against any public form in the{" "}
        <a href="/playground">playground</a>.
      </p>

      <h2>Notes</h2>
      <ul>
        <li>
          <code>file_upload</code> questions are omitted from generated types
          and rendered as a disabled note in the React/HTML output — Google
          Forms doesn&apos;t accept file uploads through the public API without
          a signed-in session.
        </li>
        <li>
          Generated output embeds the full schema as a literal so each artifact
          is self-contained and paste-ready.
        </li>
      </ul>
    </div>
  );
}
