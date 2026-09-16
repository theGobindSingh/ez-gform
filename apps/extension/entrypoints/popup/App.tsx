import { useEffect, useRef, useState } from "react";
import { parseFormUrl } from "../../src/lib/form-url";

export default function App() {
  const [tabUrl, setTabUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    browser.tabs
      .query({ active: true, currentWindow: true })
      .then(([tab]) => setTabUrl(tab?.url ?? null))
      .catch(() => setTabUrl(null));
  }, []);

  const parsed = tabUrl ? parseFormUrl(tabUrl) : null;

  async function handleCopy() {
    const value = textareaRef.current?.value ?? "";
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main>
      <h1>ez-gform</h1>
      {parsed ? (
        <p className="hint">
          Found a {parsed.kind} form: <code>{parsed.id}</code>
        </p>
      ) : (
        <p className="hint">Open a Google Form to generate its ez-gform config.</p>
      )}

      <button type="button" disabled title="parser coming soon">
        Generate
      </button>

      <textarea ref={textareaRef} readOnly placeholder="Generated config will appear here" />

      <button type="button" onClick={handleCopy}>
        {copied ? "Copied!" : "Copy"}
      </button>
    </main>
  );
}
