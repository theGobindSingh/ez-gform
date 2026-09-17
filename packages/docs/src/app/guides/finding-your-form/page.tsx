import { Code } from "@/components/Code";
import Link from "next/link";

export default function FindingYourFormPage() {
  return (
    <div>
      <h1>Finding your form</h1>

      <h2>1. Make the form public</h2>
      <p>
        ez-gform only works with forms that don&apos;t require sign-in. In
        Google Forms:
      </p>
      <p className="card">
        <strong>Settings → Responses →</strong> turn <em>off</em> &quot;Restrict
        to users in <code>&lt;your organization&gt;</code> and its trusted
        organizations&quot;.
      </p>
      <p>
        No such toggle? Then the form is already public. That&apos;s the default
        for personal Google accounts.
      </p>

      <h2>2. Copy the form&apos;s URL</h2>
      <p>
        Click <strong>Send</strong> → the link icon, or open the form as a
        respondent and copy the address bar. It looks like:
      </p>
      <Code language="text">
        {`https://docs.google.com/forms/d/e/1FAIpQLSf.../viewform`}
      </Code>
      <p>
        Pass that whole URL as <code>formId</code>. The bare id (the long part
        after <code>/d/e/</code>) works too.
      </p>
      <p className="card">
        <strong>Don&apos;t use the editor URL</strong> (the one ending in{" "}
        <code>/edit</code>). It has a different id and submissions to it fail.
      </p>

      <h2>3. Get the entry ids</h2>
      <p>
        Every question has a hidden id like <code>entry.1234567</code>. No need
        to dig through page source. Either:
      </p>
      <ul>
        <li>
          paste the URL into the <Link href="/playground">playground</Link>, or
        </li>
        <li>
          run <code>npx @ez-gform/cli &lt;form-url&gt;</code> (
          <Link href="/packages/cli">CLI docs</Link>).
        </li>
      </ul>
      <p>
        Both list every question with its type and entry id, and can generate
        the form code for you.
      </p>
    </div>
  );
}
