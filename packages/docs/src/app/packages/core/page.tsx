import { Code } from "@/components/Code";
import Link from "next/link";

const usage = `import { parseFormHtml, submitForm } from "@ez-gform/core";

// 1. Turn a public form's /viewform HTML into a typed schema.
const schema = parseFormHtml(html);

// 2. Submit answers, keyed by entry id.
const result = await submitForm(
  schema.formId,
  { "entry.123": "hello" },
  { schema },
);`;

const EXPORTS: [string, string][] = [
  [
    "validateValues(values, schema)",
    "Finds unknown entry ids and missing required answers.",
  ],
  [
    "encodeValues(values, schema)",
    "Answers → URLSearchParams, without submitting.",
  ],
  ["buildSubmitBody", "The exact POST body submitForm sends."],
  ["buildPrefillUrl", "A link to the form prefilled with your values."],
  [
    "normalizeFormId, formUrls",
    "Accept any form URL or id; get its endpoints.",
  ],
  [
    "parseFormData, extractPublicLoadData",
    "Lower-level parsing steps behind parseFormHtml.",
  ],
  ["ParseError, ValidationError", "Error classes."],
];

export default function CorePackagePage() {
  return (
    <div>
      <h1>@ez-gform/core</h1>
      <p>
        Read a Google Form&apos;s questions and submit answers to it, from any
        JavaScript. No dependencies. Works in Node 20+ and browsers.
      </p>
      <p>
        Using React? You want{" "}
        <Link href="/packages/react">@ez-gform/react</Link> instead.
      </p>

      <h2>Install</h2>
      <Code language="sh">{`pnpm add @ez-gform/core`}</Code>

      <h2>Usage</h2>
      <Code language="ts">{usage}</Code>
      <p>
        <code>result.status</code> is <code>&quot;sent&quot;</code> by default:
        the request is <code>no-cors</code> (browsers require it), so you
        can&apos;t know whether Google accepted it. Outside the browser, pass{" "}
        <code>mode: &quot;cors&quot;</code> to get a real{" "}
        <code>&quot;ok&quot;</code> or <code>&quot;error&quot;</code>.
      </p>
      <p>
        What to pass for each kind of question is in the{" "}
        <Link href="/guides/question-types">question types guide</Link>.
      </p>

      <h2>Other exports</h2>
      <table>
        <thead>
          <tr>
            <th>Export</th>
            <th>What it does</th>
          </tr>
        </thead>
        <tbody>
          {EXPORTS.map(([name, text]) => {
            return (
              <tr key={name}>
                <td>
                  <code>{name}</code>
                </td>
                <td>{text}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
