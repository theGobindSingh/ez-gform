import { Code } from "@/components/Code";

const usage = `npx @ez-gform/cli <form-url-or-id> [--format json|types|react|html] [--name MyForm] [--out <file>] [--json-input <file>]
npx @ez-gform/cli submit <form-url-or-id> --data '{"entry.123":"hi"}'
npx @ez-gform/cli --help
npx @ez-gform/cli --version`;

export default function CliPackagePage() {
  return (
    <div>
      <h1>@ez-gform/cli</h1>
      <p>
        <code>npx</code> tool: fetch a public Google Form and emit a JSON
        schema, TypeScript types, a paste-ready React component, or a plain HTML
        form — the non-extension path for getting <code>entry.*</code> ids and
        generated code.
      </p>

      <h2>Usage</h2>
      <Code language="sh">{usage}</Code>

      <ul>
        <li>
          <code>--format</code> defaults to <code>json</code>.
        </li>
        <li>
          <code>--name</code> sets the base name used by the <code>types</code>/
          <code>react</code> formats.
        </li>
        <li>
          <code>--out &lt;file&gt;</code> writes to a file instead of stdout.
        </li>
        <li>
          <code>--json-input &lt;file&gt;</code> reads a saved{" "}
          <code>FB_PUBLIC_LOAD_DATA_</code> JSON array or a saved{" "}
          <code>/viewform</code> HTML page instead of fetching over the network.
        </li>
        <li>
          <code>submit --data &apos;&lt;json&gt;&apos;</code> or{" "}
          <code>--data @file.json</code> validates the payload against the
          fetched schema, then POSTs it with <code>mode: &quot;cors&quot;</code>{" "}
          (so the response can actually be read, unlike a browser submission) —
          useful as a smoke test.
        </li>
      </ul>

      <p>
        Exit codes: 0 success, 1 usage error, 2 fetch/parse/validation error.
      </p>

      <p>
        If a form requires sign-in, the CLI prints a clear error instead of a
        confusing HTML dump:
      </p>
      <p className="card">
        This form requires sign-in; ez-gform only works with forms that are
        public (Settings → Responses → &apos;Restrict to users in{" "}
        <code>&lt;org&gt;</code>&apos; off)
      </p>

      <h2>Install</h2>
      <Code language="sh">{`pnpm add -D @ez-gform/cli`}</Code>

      <h2>
        The playground&apos;s <code>/api/schema</code> route
      </h2>
      <p>
        The <a href="/playground">playground</a> exposes the same fetch-parse
        pipeline as a server route,{" "}
        <code>GET /api/schema?formId=&lt;url-or-id&gt;</code>, if you&apos;d
        rather call an HTTP endpoint from your own tooling than shell out to the
        CLI. It returns the same <code>FormSchema</code> JSON (or a
        <code>{"{ error }"}</code> body on failure) that{" "}
        <code>parseFormHtml</code> produces.
      </p>
    </div>
  );
}
