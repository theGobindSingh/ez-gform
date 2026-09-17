import { Code } from "@/components/Code";
import Link from "next/link";

const cliCmd = `npx @ez-gform/cli "https://docs.google.com/forms/d/e/1FAIpQLS.../viewform"`;

const installCmd = `pnpm add @ez-gform/react`;

const minimalReact = `import { useGoogleForm } from "@ez-gform/react";

function ContactForm() {
  const { register, submit, status, isSubmitting } = useGoogleForm({
    formId: "https://docs.google.com/forms/d/e/1FAIpQLS.../viewform",
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

const htmlExample = `<form action="https://docs.google.com/forms/d/e/1FAIpQLS.../formResponse" method="POST">
  <label>Your name
    <input type="text" name="entry.111">
  </label>
  <button type="submit">Submit</button>
</form>`;

export default function GettingStartedPage() {
  return (
    <div>
      <h1>Getting started</h1>
      <p>Three steps, about five minutes.</p>

      <h2>1. Make your form public</h2>
      <p>
        Your Google Form must accept answers without sign-in. See{" "}
        <Link href="/guides/finding-your-form">finding your form</Link> for the
        setting and for where to copy the form&apos;s URL.
      </p>

      <h2>2. Get your field ids</h2>
      <p>
        Every question has an id like <code>entry.111</code>. List them all:
      </p>
      <Code language="sh" filename="terminal">
        {cliCmd}
      </Code>
      <p>
        Or paste the URL into the <Link href="/playground">playground</Link>.
      </p>

      <h2>3. Build the form</h2>
      <Code language="sh" filename="terminal">
        {installCmd}
      </Code>
      <Code language="tsx" filename="ContactForm.tsx">
        {minimalReact}
      </Code>
      <p>
        Swap in your form&apos;s URL and entry ids, and you&apos;re done.{" "}
        <code>status</code> becomes <code>&quot;sent&quot;</code> once the
        request goes out. Browsers can&apos;t read Google&apos;s reply, so there
        is no confirmed &quot;ok&quot;.
      </p>

      <h2>Not using React?</h2>
      <p>
        A plain HTML form works with no JavaScript at all. Use each
        question&apos;s entry id as the input <code>name</code>:
      </p>
      <Code language="html" filename="form.html">
        {htmlExample}
      </Code>
      <p>
        Generate the whole thing with{" "}
        <code>npx @ez-gform/cli &lt;form-url&gt; --format html</code>, or from
        the playground&apos;s &quot;html&quot; tab.
      </p>

      <h2>Next steps</h2>
      <ul>
        <li>
          <Link href="/guides/question-types">
            Checkboxes, dates, grids: what value each question type takes
          </Link>
        </li>
        <li>
          <Link href="/packages/react">
            Everything <code>useGoogleForm</code> can do
          </Link>
        </li>
      </ul>
    </div>
  );
}
