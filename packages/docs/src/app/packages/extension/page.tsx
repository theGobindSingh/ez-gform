export default function ExtensionPackagePage() {
  return (
    <div>
      <h1>@ez-gform/extension</h1>
      <p>
        A <strong>WXT</strong>-based MV3 browser extension (Chrome + Firefox)
        that gives you the schema for whatever Google Form tab is currently
        open, without leaving the browser.
      </p>

      <h2>What it automates</h2>
      <p>
        Opening the popup on a Google Form tab runs the exact same{" "}
        <code>@ez-gform/core</code> parser used by the{" "}
        <a href="/playground">playground</a> and the{" "}
        <a href="/packages/cli">CLI</a> — it reads the form&apos;s embedded{" "}
        <code>FB_PUBLIC_LOAD_DATA_</code> JSON blob, never obfuscated CSS
        classes or Closure <code>jscontroller</code> hashes, so it doesn&apos;t
        break on Google Forms frontend redeploys the way DOM-scraping approaches
        do. The popup shows the parsed schema and generated code
        (JSON/types/React/HTML) with a copy button — no code is ever injected
        into the live Google Forms page.
      </p>

      <h2>Manifest</h2>
      <p>
        WXT generates the MV3 manifest for both Chrome and Firefox from one
        source, with explicit <code>host_permissions</code> for{" "}
        <code>docs.google.com</code> declared up front (rather than requesting
        broad host access at review time).
      </p>

      <h2>Multi-account URLs</h2>
      <p>
        Form URLs of the shape{" "}
        <code>/forms/u/&lt;n&gt;/d/e/&lt;id&gt;/viewform</code> (a non-default
        Google account) are parsed via the <code>URL</code> API, the same{" "}
        <code>normalizeFormId</code> used everywhere else in ez-gform — not a
        fragile regex/string-slice, so they resolve correctly regardless of
        which account tab is active.
      </p>

      <p>
        For the non-extension equivalent, see the{" "}
        <a href="/packages/cli">CLI</a> or the{" "}
        <a href="/playground">playground</a>.
      </p>
    </div>
  );
}
