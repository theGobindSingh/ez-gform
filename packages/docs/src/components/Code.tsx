"use client";

import { useState } from "react";

export interface CodeProps {
  children: string;
  language?: string;
  filename?: string;
}

/** A `<pre>` code block with a copy-to-clipboard button. No syntax highlighting dependency required. */
export function Code({ children, language, filename }: CodeProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    void navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span>{filename ?? language ?? "code"}</span>
        <button type="button" onClick={onCopy} className="copy-button">
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre>
        <code>{children}</code>
      </pre>
    </div>
  );
}
