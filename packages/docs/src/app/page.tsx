import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <section className="hero">
        <h1>ez-gform</h1>
        <p className="lead">
          Submit your own custom form UI straight to a Google Form —{" "}
          <strong>no backend required</strong>. Get a public form&apos;s schema,
          build your own React or HTML UI against it, and POST answers directly
          to Google&apos;s <code>formResponse</code> endpoint.
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

      <div className="card-grid">
        <div className="step">
          <span className="step-number">1</span>
          <h3>Get the schema</h3>
          <p>
            Point the <Link href="/playground">playground</Link> or{" "}
            <Link href="/packages/cli">CLI</Link> at any public Google
            Form&apos;s URL. <code>@ez-gform/core</code>&apos;s{" "}
            <code>parseFormHtml</code> reads the form&apos;s embedded{" "}
            <code>FB_PUBLIC_LOAD_DATA_</code> JSON — the same data Google&apos;s
            own client uses — into a typed <code>FormSchema</code>: every
            question, its type, and its <code>entry.NNN</code> submission id.
          </p>
        </div>
        <div className="step">
          <span className="step-number">2</span>
          <h3>Build your form</h3>
          <p>
            Use <Link href="/packages/react">@ez-gform/react</Link>&apos;s{" "}
            <code>useGoogleForm</code> hook (or generate a paste-ready
            component/plain HTML form with{" "}
            <Link href="/packages/codegen">@ez-gform/codegen</Link>) to render
            whatever UI you want — no need to match Google&apos;s markup or
            styling at all.
          </p>
        </div>
        <div className="step">
          <span className="step-number">3</span>
          <h3>Submit</h3>
          <p>
            Call <code>submit()</code>. Answers are encoded per Google&apos;s
            per-question-type wire format and POSTed with{" "}
            <code>
              fetch(url, {"{"} mode: &quot;no-cors&quot; {"}"})
            </code>
            . Browser submissions are opaque by platform design — you get a
            &quot;sent&quot; status, not a guaranteed &quot;succeeded&quot;.
          </p>
        </div>
      </div>

      <h2>Why not just embed the Google Form?</h2>
      <p>
        Google&apos;s own embed is an <code>&lt;iframe&gt;</code> you can&apos;t
        restyle. ez-gform lets you keep full control of your form&apos;s markup,
        validation, and UX while still using Google Forms as the free,
        zero-backend response store. See{" "}
        <Link href="/guides/finding-your-form">
          finding your form&apos;s URL/ID
        </Link>{" "}
        and the <Link href="/guides/question-types">question types guide</Link>{" "}
        for the encoding details, or jump straight into the{" "}
        <Link href="/playground">playground</Link>.
      </p>
    </div>
  );
}
