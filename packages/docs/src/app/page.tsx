import { Code } from "@/components/Code";
import Link from "next/link";

const example = `import { useGoogleForm } from "@ez-gform/react";

function ContactForm() {
  const { register, submit, status } = useGoogleForm({
    formId: "https://docs.google.com/forms/d/e/1FAIpQLS.../viewform",
  });

  return (
    <form onSubmit={submit}>
      <input aria-label="Your name" {...register("entry.111")} />
      <button type="submit">Send</button>
      {status === "sent" && <p>Thanks!</p>}
    </form>
  );
}`;

export default function HomePage() {
  return (
    <div>
      <section className="hero">
        <h1>ez-gform</h1>
        <p className="lead">
          Build your own form UI and submit it straight to a Google Form.{" "}
          <strong>No backend.</strong> Responses land in your Google Form and
          its Sheet.
        </p>
        <div className="form-row">
          <Link className="btn" href="/getting-started">
            Get started
          </Link>
          <Link className="btn secondary" href="/playground">
            Try the playground
          </Link>
        </div>
      </section>

      <Code language="tsx" filename="ContactForm.tsx">
        {example}
      </Code>

      <h2>How it works</h2>
      <div className="card-grid">
        <div className="step">
          <span className="step-number">1</span>
          <h3>Get your field ids</h3>
          <p>
            Every question in a Google Form has an id like{" "}
            <code>entry.111</code>. Paste your form&apos;s URL into the{" "}
            <Link href="/playground">playground</Link> or the{" "}
            <Link href="/packages/cli">CLI</Link> to list them.
          </p>
        </div>
        <div className="step">
          <span className="step-number">2</span>
          <h3>Build your form</h3>
          <p>
            Any markup, any styling. Wire it up with the{" "}
            <Link href="/packages/react">useGoogleForm</Link> hook, or have{" "}
            <Link href="/packages/codegen">codegen</Link> write the component
            for you.
          </p>
        </div>
        <div className="step">
          <span className="step-number">3</span>
          <h3>Submit</h3>
          <p>
            Answers go directly from the browser to Google. Nothing to host,
            nothing to pay for.
          </p>
        </div>
      </div>

      <h2>Why not embed the Google Form?</h2>
      <p>
        Google&apos;s embed is an <code>&lt;iframe&gt;</code> you can&apos;t
        restyle. With ez-gform the form is yours (markup, validation, UX) and
        Google Forms is just where the answers go.
      </p>

      <h2>One thing to know</h2>
      <p>
        Browsers aren&apos;t allowed to read Google&apos;s response, so a
        submission ends as <code>&quot;sent&quot;</code>, not
        &quot;confirmed&quot;. To check your setup, the{" "}
        <Link href="/packages/cli">CLI</Link> can make a real submission and
        show you Google&apos;s answer.
      </p>
    </div>
  );
}
