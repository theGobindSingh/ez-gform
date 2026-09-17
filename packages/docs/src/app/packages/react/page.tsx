import { Code } from "@/components/Code";
import Link from "next/link";

const hookExample = `import { useGoogleForm } from "@ez-gform/react";

function ContactForm() {
  const { register, registerCheckbox, submit, status, isSubmitting } =
    useGoogleForm({
      formId: "https://docs.google.com/forms/d/e/1FAIpQLS.../viewform",
    });

  return (
    <form onSubmit={submit}>
      <input aria-label="Your name" {...register("entry.111")} />

      <label>
        <input type="checkbox" {...registerCheckbox("entry.222", "Swimming")} />
        Swimming
      </label>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send"}
      </button>
      {status === "sent" && <p>Thanks!</p>}
      {status === "error" && <p>Something went wrong.</p>}
    </form>
  );
}`;

const OPTIONS: [string, string][] = [
  ["formId", "The form's URL or id. Required."],
  ["schema", "A FormSchema (from the CLI). Turns on validation before submit."],
  ["validate", "Set false to skip validation even when schema is given."],
  ["initialValues", "Starting values, keyed by entry id."],
  ["resetOnSent", "Reset to initialValues after a successful submit."],
  ["onSent", "Called after a submission is sent."],
  ["onError", "Called with the result (and validation errors) on failure."],
  ["mode", `"no-cors" (default) or "cors". See below.`],
  ["fetch", "Custom fetch, for tests or non-browser runtimes."],
];

const RETURNS: [string, string][] = [
  ["register(entryId)", "Props for an input, textarea or select."],
  ["registerCheckbox(entryId, option)", "Props for one checkbox option."],
  ["submit", "Pass to onSubmit, or call it yourself. Returns a promise."],
  ["status", "idle, validating, submitting, sent, ok or error."],
  ["isSubmitting", "true while a submission is in flight."],
  ["errors", "Validation errors: { entryId, message }[]."],
  ["values, setValue, setValues", "Read or set values directly."],
  ["reset", "Back to initialValues."],
  ["result", "The last SubmitResult."],
  ["prefillUrl", "Link to the Google Form prefilled with the current values."],
];

const Table = ({ head, rows }: { head: string; rows: [string, string][] }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>{head}</th>
          <th>What it does</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([name, text]) => {
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
  );
};

export default function ReactPackagePage() {
  return (
    <div>
      <h1>@ez-gform/react</h1>
      <p>
        A React hook that submits your own <code>&lt;form&gt;</code> to a Google
        Form. No backend.
      </p>

      <h2>Install</h2>
      <Code language="sh">{`pnpm add @ez-gform/react`}</Code>

      <h2>Usage</h2>
      <Code language="tsx">{hookExample}</Code>
      <p>
        Need your entry ids? See{" "}
        <Link href="/guides/finding-your-form">finding your form</Link>. For
        dates, grids and &quot;Other&quot; options, use <code>setValue</code>{" "}
        with the shapes in{" "}
        <Link href="/guides/question-types">question types</Link>.
      </p>

      <h2>Options</h2>
      <Table head="Option" rows={OPTIONS} />

      <h2>Returns</h2>
      <Table head="Field" rows={RETURNS} />
      <p>
        Calling <code>submit()</code> again while one is in flight does not send
        twice.
      </p>

      <h2>&quot;sent&quot; is not &quot;succeeded&quot;</h2>
      <p>
        Browsers can&apos;t read Google&apos;s response (the request is{" "}
        <code>no-cors</code>), so in the browser <code>status</code> stops at{" "}
        <code>&quot;sent&quot;</code>: the request went out, but you can&apos;t
        know whether Google accepted it. Outside the browser (Node), pass{" "}
        <code>mode: &quot;cors&quot;</code> to get a real{" "}
        <code>&quot;ok&quot;</code> or <code>&quot;error&quot;</code>.
      </p>
    </div>
  );
}
