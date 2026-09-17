import { Code } from "@/components/Code";
import Link from "next/link";

const FLAGS: [string, string][] = [
  ["--format", "json (default), types, react or html."],
  ["--name MyForm", "Name for the generated types / component."],
  ["--out <file>", "Write to a file instead of printing."],
  [
    "--json-input <file>",
    "Read a saved form page (HTML or JSON) instead of fetching it.",
  ],
];

export default function CliPackagePage() {
  return (
    <div>
      <h1>@ez-gform/cli</h1>
      <p>
        Point it at a public Google Form; get the form&apos;s entry ids, or
        ready-made code.
      </p>
      <Code language="sh">{`npx @ez-gform/cli <form-url-or-id>`}</Code>
      <p>
        That prints the form&apos;s schema as JSON: every question, its type,
        and its entry id.
      </p>

      <h2>Generate code</h2>
      <Code language="sh">
        {`npx @ez-gform/cli <form-url-or-id> --format react --out ContactForm.tsx`}
      </Code>
      <table>
        <thead>
          <tr>
            <th>Flag</th>
            <th>What it does</th>
          </tr>
        </thead>
        <tbody>
          {FLAGS.map(([flag, text]) => {
            return (
              <tr key={flag}>
                <td>
                  <code>{flag}</code>
                </td>
                <td>{text}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2>Test a submission</h2>
      <Code language="sh">
        {`npx @ez-gform/cli submit <form-url-or-id> --data '{"entry.123":"hi"}'`}
      </Code>
      <p>
        Checks the data against the form, then submits it. Unlike a browser, the
        CLI can read Google&apos;s response, so this tells you whether the
        submission really worked. <code>--data @file.json</code> reads from a
        file.
      </p>

      <h2>Good to know</h2>
      <ul>
        <li>
          The form must be public. If it needs sign-in, the CLI tells you which
          Google Forms setting to turn off (
          <Link href="/guides/finding-your-form">details</Link>).
        </li>
        <li>
          Exit codes: <code>0</code> success, <code>1</code> bad usage,{" "}
          <code>2</code> fetch, parse or validation error.
        </li>
        <li>
          Use it often? <code>pnpm add -D @ez-gform/cli</code>.
        </li>
        <li>
          Prefer HTTP? This site serves the same schema at{" "}
          <code>GET /api/schema?formId=&lt;url-or-id&gt;</code>.
        </li>
      </ul>
    </div>
  );
}
