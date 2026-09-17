import { Code } from "@/components/Code";
import Link from "next/link";

const api = `import {
  generateHtmlForm,
  generateReactComponent,
  generateSchemaJson,
  generateTypes,
} from "@ez-gform/codegen";

generateSchemaJson(schema); // the schema as JSON text
generateTypes(schema, { name: "MyForm" }); // MyFormSchema const + MyFormValues type
generateReactComponent(schema, { name: "MyForm" }); // a .tsx component using useGoogleForm
generateHtmlForm(schema); // a plain <form> that posts to Google, no JS`;

export default function CodegenPackagePage() {
  return (
    <div>
      <h1>@ez-gform/codegen</h1>
      <p>
        Turn a form&apos;s schema into code you can paste: TypeScript types, a
        React component, or a plain HTML form. Runs in Node and the browser.
      </p>
      <p>
        Just want the output? The <Link href="/playground">playground</Link> and
        the <Link href="/packages/cli">CLI</Link> run these generators for you.
      </p>

      <h2>Install</h2>
      <Code language="sh">{`pnpm add @ez-gform/codegen`}</Code>

      <h2>Usage</h2>
      <p>
        <code>schema</code> is a <code>FormSchema</code> from{" "}
        <code>@ez-gform/core</code>&apos;s <code>parseFormHtml</code>. Each
        function returns a string.
      </p>
      <Code language="ts">{api}</Code>

      <table>
        <thead>
          <tr>
            <th>Function</th>
            <th>Options</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>generateSchemaJson</code>
            </td>
            <td>
              <code>pretty</code> (default <code>true</code>)
            </td>
          </tr>
          <tr>
            <td>
              <code>generateTypes</code>
            </td>
            <td>
              <code>name</code> (default: from the form title)
            </td>
          </tr>
          <tr>
            <td>
              <code>generateReactComponent</code>
            </td>
            <td>
              <code>name</code>, <code>typescript</code> (default{" "}
              <code>true</code>; <code>false</code> emits plain JS + JSX)
            </td>
          </tr>
          <tr>
            <td>
              <code>generateHtmlForm</code>
            </td>
            <td>none</td>
          </tr>
        </tbody>
      </table>

      <h2>Good to know</h2>
      <ul>
        <li>
          File upload questions can&apos;t be submitted without a Google
          sign-in, so they are left out of the types and shown as a disabled
          note in React/HTML output.
        </li>
        <li>
          Output is self-contained: the schema is embedded, so you can paste a
          single file.
        </li>
      </ul>
    </div>
  );
}
