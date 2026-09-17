"use client";

import { Code } from "@/components/Code";
import { SchemaForm } from "@/components/SchemaForm";
import {
  generateHtmlForm,
  generateReactComponent,
  generateSchemaJson,
  generateTypes,
} from "@ez-gform/codegen";
import { parseFormData } from "@ez-gform/core";
import type { FormSchema } from "@ez-gform/types";
import { useMemo, useState } from "react";
import questionTypesDemo from "./question-types-demo.fixture.json";

type Tab = "json" | "types" | "react" | "html";

const TABS: { id: Tab; label: string }[] = [
  { id: "json", label: "json" },
  { id: "types", label: "types" },
  { id: "react", label: "react" },
  { id: "html", label: "html" },
];

export const PlaygroundClient = () => {
  const [input, setInput] = useState("");
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("json");

  const loadFromUrl = async () => {
    if (!input.trim()) {
      setError("Enter a Google Form URL or id first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/schema?formId=${encodeURIComponent(input.trim())}`,
      );
      const body = (await response.json()) as
        { schema: FormSchema } | { error: string };
      if (!response.ok || "error" in body) {
        setError(
          "error" in body ? body.error : `Request failed (${response.status})`,
        );
        setSchema(null);
        return;
      }
      setSchema(body.schema);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setSchema(null);
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    setError(null);
    try {
      // The fixture is the raw FB_PUBLIC_LOAD_DATA_ JSON captured from a
      // live form; parseFormData turns it into a typed FormSchema, entirely
      // client-side, so the playground works with no network access.
      const parsed = parseFormData(questionTypesDemo);
      setSchema(parsed);
      setInput(parsed.formId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  const generated = useMemo(() => {
    if (!schema) return null;
    return {
      json: generateSchemaJson(schema),
      types: generateTypes(schema),
      react: generateReactComponent(schema),
      html: generateHtmlForm(schema),
    };
  }, [schema]);

  return (
    <div>
      <div className="form-row">
        <input
          type="text"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
          }}
          placeholder="https://docs.google.com/forms/d/e/.../viewform or bare form id"
          aria-label="Google Form URL or id"
        />
        <button
          type="button"
          className="btn"
          onClick={() => {
            return void loadFromUrl();
          }}
          disabled={loading}
        >
          {loading ? "Loading…" : "Load schema"}
        </button>
        <button type="button" className="btn secondary" onClick={loadExample}>
          Load example
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      {schema && generated && (
        <div className="playground-grid two-col">
          <div>
            <h2>Generated output</h2>
            <div className="tabs">
              {TABS.map((t) => {
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={
                      tab === t.id ? "tab-button active" : "tab-button"
                    }
                    onClick={() => {
                      setTab(t.id);
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
            <Code
              language={tab}
              filename={`${schema.title || "form"}.${tab === "json" ? "json" : tab === "types" ? "ts" : tab === "react" ? "tsx" : "html"}`}
            >
              {generated[tab]}
            </Code>
          </div>

          <div>
            <h2>Live form</h2>
            <p style={{ color: "var(--muted)" }}>
              Rendered from the parsed schema via <code>useGoogleForm</code>.
              Submitting uses <code>mode: &quot;no-cors&quot;</code>, so a
              successful-looking &quot;sent&quot; status doesn&apos;t confirm
              Google accepted it.
            </p>
            <SchemaForm schema={schema} />
          </div>
        </div>
      )}
    </div>
  );
};
