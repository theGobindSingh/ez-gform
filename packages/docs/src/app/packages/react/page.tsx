import { Code } from "@/components/Code";

const hookExample = `import { useGoogleForm } from "@ez-gform/react";
import type { FormSchema } from "@ez-gform/react";

function ContactForm({ schema }: { schema: FormSchema }) {
  const { register, registerCheckbox, submit, status, errors, isSubmitting } =
    useGoogleForm({
      formId: schema.formId, // bare id, e/<id>, or any docs.google.com/forms URL
      schema, // enables validation + multi-page field support
      initialValues: { "entry.111": "" },
      onSent: (result) => console.log("sent:", result),
      onError: (result, validationErrors) =>
        console.error(result, validationErrors),
    });

  return (
    <form onSubmit={submit}>
      <input aria-label="Your name" {...register("entry.111")} />

      <label>
        <input type="checkbox" {...registerCheckbox("entry.222", "Swimming")} />
        Swimming
      </label>

      {errors.map((e) => (
        <p key={e.entryId}>{e.message}</p>
      ))}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send"}
      </button>
      {status === "sent" && <p>Thanks!</p>}
      {status === "error" && <p>Something went wrong.</p>}
    </form>
  );
}`;

const compatExample = `import useEasyGoogleForm from "@ez-gform/react"; // default export, drop-in

function LegacyForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const onSubmit = useEasyGoogleForm({
    formRef,
    gFormId: "1FAIpQLS...",
    links: [{ entryId: "entry.111", formId: "name", type: "text" }],
  });

  return (
    <form ref={formRef} onSubmit={onSubmit}>
      <input id="name" />
      <button type="submit">Submit</button>
    </form>
  );
}`;

export default function ReactPackagePage() {
  return (
    <div>
      <h1>@ez-gform/react</h1>
      <p>
        React hooks for submitting a custom <code>&lt;form&gt;</code> UI
        straight to a Google Form, with no backend. Built on{" "}
        <code>@ez-gform/core</code>.
      </p>

      <h2>Install</h2>
      <Code language="sh">
        {`pnpm add @ez-gform/react @ez-gform/core react`}
      </Code>

      <h2>useGoogleForm</h2>
      <p>
        A controlled-values hook with an explicit <code>status</code> state
        machine (<code>idle</code> → <code>validating</code>? →{" "}
        <code>submitting</code> → <code>sent</code> / <code>ok</code> /{" "}
        <code>error</code>) and a promise-returning <code>submit</code>. A
        second <code>submit()</code> call while one is already in flight reuses
        the same in-flight promise instead of double-posting.
      </p>
      <Code language="tsx">{hookExample}</Code>
      <p>
        <code>submit</code> also accepts being passed directly as a form&apos;s{" "}
        <code>onSubmit</code> (it calls <code>event.preventDefault()</code> for
        you) or called imperatively — either way it resolves a{" "}
        <code>SubmitResult</code>. In the browser, submissions use{" "}
        <code>
          fetch(url, {"{"} mode: &quot;no-cors&quot; {"}"})
        </code>
        , so Google&apos;s response is opaque and <code>status</code> can only
        ever reach <code>&quot;sent&quot;</code>, never a confirmed{" "}
        <code>&quot;ok&quot;</code> — pass <code>mode: &quot;cors&quot;</code>{" "}
        (e.g. from a Node/CLI context) to get a real <code>&quot;ok&quot;</code>
        /<code>&quot;error&quot;</code> outcome.
      </p>
      <p>
        Also returned: <code>values</code>, <code>setValue</code>,{" "}
        <code>setValues</code>, <code>reset</code>, <code>result</code>,{" "}
        <code>prefillUrl</code> (a <code>/viewform?usp=pp_url&amp;...</code>{" "}
        link prefilled with the current values).
      </p>

      <h2>useEasyGoogleForm migration (deprecated compat shim)</h2>
      <p>
        Matches the legacy <code>use-easy-google-form</code> hook&apos;s{" "}
        <code>formRef</code>/<code>gFormId</code>/<code>links</code>{" "}
        DOM-scraping signature, so existing consumers can migrate by changing
        only the import:
      </p>
      <Code language="tsx">{compatExample}</Code>
      <p>
        Unlike the legacy hook, <code>onSubmit</code>{" "}
        <strong>
          returns a promise that resolves with the <code>SubmitResult</code>
        </strong>{" "}
        instead of firing the request and forgetting about it, and CSS id
        selectors are escaped internally (ids with spaces/leading digits no
        longer throw). New code should prefer <code>useGoogleForm</code>, which
        takes a plain values object instead of reading the DOM by id.
      </p>
    </div>
  );
}
