import { Code } from "@/components/Code";
import Link from "next/link";

const installCmd = `pnpm add @ez-gform/react @ez-gform/core react`;

const minimalReact = `import { useGoogleForm } from "@ez-gform/react";

function ContactForm() {
  const { register, submit, status, isSubmitting } = useGoogleForm({
    // The long id from https://docs.google.com/forms/d/e/<FORM_ID>/viewform
    formId: "1FAIpQLS...",
  });

  return (
    <form onSubmit={submit}>
      <input aria-label="Your name" {...register("entry.111")} />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send"}
      </button>
      {status === "sent" && <p>Thanks!</p>}
    </form>
  );
}`;

const htmlExample = `<!-- Output of @ez-gform/codegen's generateHtmlForm(schema) -->
<form action="https://docs.google.com/forms/d/e/1FAIpQLS.../formResponse" method="POST">
  <label>Your name
    <input type="text" name="entry.111">
  </label>
  <button type="submit">Submit</button>
</form>`;

export default function GettingStartedPage() {
  return (
    <div>
      <h1>Getting started</h1>
      <p>
        ez-gform lets you submit a custom form UI directly to a Google Form,
        without running a backend of your own. Google Forms is the response
        store; you own the UI.
      </p>

      <h2>Install</h2>
      <Code language="sh" filename="terminal">
        {installCmd}
      </Code>
      <p>
        <code>@ez-gform/react</code> depends on <code>@ez-gform/core</code> (the
        framework-agnostic parser/encoder/ submit client) — installing both gets
        you the hook plus the underlying primitives.
      </p>

      <h2>Minimal React example</h2>
      <p>
        You need two things: a public form&apos;s id (see{" "}
        <Link href="/guides/finding-your-form">finding your form</Link>) and the{" "}
        <code>entry.NNN</code> id for each field you want to fill in (found the
        same way, or generated for you by the{" "}
        <Link href="/playground">playground</Link> or{" "}
        <Link href="/packages/cli">CLI</Link>).
      </p>
      <Code language="tsx" filename="ContactForm.tsx">
        {minimalReact}
      </Code>
      <p>
        <code>submit</code> can be passed straight to <code>onSubmit</code> (it
        calls <code>preventDefault()</code> for you) and resolves a{" "}
        <code>SubmitResult</code>. In the browser, submissions use{" "}
        <code>
          fetch(url, {"{"} mode: &quot;no-cors&quot; {"}"})
        </code>
        , so Google&apos;s response is opaque — <code>status</code> reaches{" "}
        <code>&quot;sent&quot;</code>, never a confirmed{" "}
        <code>&quot;ok&quot;</code>, from a browser.
      </p>

      <h2>Plain HTML example</h2>
      <p>
        Not using React? <code>@ez-gform/codegen</code>&apos;s{" "}
        <code>generateHtmlForm(schema)</code> emits a plain{" "}
        <code>&lt;form&gt;</code> with the correct <code>entry.NNN</code>{" "}
        <code>name</code> attributes, ready to submit with no JavaScript at all
        (the browser&apos;s native form POST handles the cross-origin request):
      </p>
      <Code language="html" filename="form.html">
        {htmlExample}
      </Code>
      <p>
        Generate this for any public form in the{" "}
        <Link href="/playground">playground</Link>&apos;s &quot;html&quot; tab,
        or via <code>npx @ez-gform/cli &lt;form-url&gt; --format html</code>.
      </p>

      <h2>Next steps</h2>
      <ul>
        <li>
          <Link href="/guides/finding-your-form">
            How to get a form&apos;s URL/ID and make it public
          </Link>
        </li>
        <li>
          <Link href="/guides/question-types">
            Every question type and how it&apos;s encoded on submit
          </Link>
        </li>
        <li>
          <Link href="/packages/react">
            Full <code>useGoogleForm</code> API reference
          </Link>
        </li>
      </ul>
    </div>
  );
}
