import { Code } from "@/components/Code";
import Link from "next/link";

export default function FindingYourFormPage() {
  return (
    <div>
      <h1>Finding your form&apos;s URL/ID</h1>

      <h2>1. The form must be public</h2>
      <p>
        ez-gform (and Google&apos;s own <code>formResponse</code> endpoint) only
        works with forms that don&apos;t require sign-in. If your form is
        restricted, requests will redirect to a Google sign-in page instead of
        returning the form.
      </p>
      <p>Check/uncheck this in Google Forms:</p>
      <p className="card">
        <strong>Settings → Responses →</strong> turn <em>off</em> &quot;Restrict
        to users in <code>&lt;your organization&gt;</code> and its trusted
        organizations&quot;.
      </p>
      <p>
        If that toggle isn&apos;t present at all, your form is already public
        (personal Google accounts, not Workspace, default to public).
      </p>

      <h2>2. Get the published form URL</h2>
      <p>
        Open the form as a respondent (not the editor) — <strong>Send</strong> →
        the link icon, or just visit the form and copy the address bar URL. It
        looks like:
      </p>
      <Code language="text">
        {`https://docs.google.com/forms/d/e/1FAIpQLSf.../viewform`}
      </Code>
      <p>
        The long token after <code>/d/e/</code> is the form id. ez-gform&apos;s{" "}
        <code>normalizeFormId</code> also accepts:
      </p>
      <ul>
        <li>
          the bare id itself, e.g. <code>1FAIpQLSf...</code>
        </li>
        <li>
          the <code>e/&lt;id&gt;</code> form (as Google&apos;s own internal data
          uses it)
        </li>
        <li>
          multi-account URLs like{" "}
          <code>/forms/u/2/d/e/1FAIpQLSf.../viewform</code>
        </li>
      </ul>
      <p>
        The <strong>editor</strong> URL (
        <code>/forms/d/&lt;editor-id&gt;/edit</code>) uses a <em>different</em>{" "}
        id and will not work for submissions — always use the published{" "}
        <code>/viewform</code> link.
      </p>

      <h2>3. Get each field&apos;s entry id</h2>
      <p>
        Every input on a Google Form has a hidden <code>entry.NNNNNNNN</code>{" "}
        submission id. You never need to hunt for these by hand — three tools
        automate it, all built on <code>@ez-gform/core</code>&apos;s{" "}
        <code>parseFormHtml</code>, which reads the form&apos;s embedded{" "}
        <code>FB_PUBLIC_LOAD_DATA_</code> JSON blob (the same structured data
        Google&apos;s own client renders from) instead of scraping obfuscated
        CSS classes:
      </p>
      <ul>
        <li>
          The <Link href="/playground">playground</Link> — paste a URL, get the
          full schema plus generated code, all client-triggered via a server
          route.
        </li>
        <li>
          The <Link href="/packages/cli">CLI</Link> —{" "}
          <code>npx @ez-gform/cli &lt;form-url&gt;</code> for scripting/CI.
        </li>
        <li>
          The <Link href="/packages/extension">browser extension</Link> — a
          popup that shows the schema for whatever form tab is open.
        </li>
      </ul>
      <p>
        All three return the same <code>FormSchema</code> type from{" "}
        <code>@ez-gform/types</code>, so there&apos;s no drift between whichever
        tool you used and what <code>@ez-gform/react</code> expects at runtime.
      </p>
    </div>
  );
}
