import { Code } from "@/components/Code";

const usage = `import { parseFormHtml, encodeValues, submitForm } from "@ez-gform/core";

// 1. Parse a public /viewform page's HTML into a typed FormSchema.
const schema = parseFormHtml(html);

// 2. Encode plain-object answers into entry.NNN-keyed URLSearchParams,
//    per Google's per-question-type wire format.
const params = encodeValues({ "entry.123": "hello" }, schema);

// 3. POST the encoded answers to the form's formResponse endpoint.
const result = await submitForm(
  schema.formId,
  { "entry.123": "hello" },
  { schema },
);
// result: { status: "sent" } (browser, no-cors — success is never observable)
//      or { status: "ok", httpStatus } / { status: "error", error } (Node, mode: "cors")`;

export default function CorePackagePage() {
  return (
    <div>
      <h1>@ez-gform/core</h1>
      <p>
        Framework-agnostic Google Forms parser, entry encoder, and submitter.
        Zero runtime dependencies; works in Node 20+, browsers, and extension
        content scripts (no DOM access).
      </p>

      <h2>Install</h2>
      <Code language="sh">{`pnpm add @ez-gform/core`}</Code>

      <h2>The three main functions</h2>
      <Code language="ts">{usage}</Code>

      <p>
        Also exported: <code>extractPublicLoadData</code>,{" "}
        <code>parseFormData</code>, <code>normalizeFormId</code>,{" "}
        <code>formUrls</code>, <code>buildPrefillUrl</code>,{" "}
        <code>buildSubmitBody</code>, <code>validateValues</code>,{" "}
        <code>ParseError</code>, <code>ValidationError</code>,{" "}
        <code>VERSION</code>.
      </p>

      <h2>Encoding table</h2>
      <p>
        See the full <a href="/guides/question-types">question types guide</a>{" "}
        for the per-type table. <code>encodeValues</code> never throws and never
        hand-encodes strings — it builds a native <code>URLSearchParams</code>.
        Pair it with <code>validateValues(values, schema)</code> to check for
        unknown entry ids or missing required answers before submitting.
      </p>
    </div>
  );
}
