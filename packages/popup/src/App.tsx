import { ParseError, parseFormHtml } from "@ez-gform/core";
import type {
  CodegenFormat,
  FormSchema,
  QuestionType,
  StoredSettings,
} from "@ez-gform/types";
import { useEffect, useState } from "react";
import "./App.css";
import { buildOutput } from "./build-output.js";
import { getSource } from "./messaging.js";
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "./storage.js";

type Status =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; schema: FormSchema };

const questionTypeLabel = (type: QuestionType): string => {
  switch (type) {
    case "short_answer":
      return "Short answer";
    case "paragraph":
      return "Paragraph";
    case "multiple_choice":
      return "Multiple choice";
    case "dropdown":
      return "Dropdown";
    case "checkboxes":
      return "Checkboxes";
    case "linear_scale":
      return "Linear scale";
    case "grid":
      return "Grid";
    case "checkbox_grid":
      return "Checkbox grid";
    case "date":
      return "Date";
    case "time":
      return "Time";
    case "file_upload":
      return "File upload";
  }
};

const FORMATS: { value: CodegenFormat; label: string }[] = [
  { value: "json", label: "JSON schema" },
  { value: "types", label: "TypeScript types" },
  { value: "react", label: "React component" },
  { value: "html", label: "HTML form" },
];

interface OutputPanelProps {
  schema: FormSchema;
  settings: StoredSettings;
  copied: boolean;
  onCopy: (code: string) => Promise<void>;
  onDownload: (filename: string, code: string) => void;
}

const OutputPanel = ({
  schema,
  settings,
  copied,
  onCopy,
  onDownload,
}: OutputPanelProps) => {
  const output = buildOutput(schema, settings);

  return (
    <section className="output">
      <textarea readOnly value={output.code} rows={12} />
      <div className="actions">
        <button
          type="button"
          onClick={() => {
            void onCopy(output.code);
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          type="button"
          onClick={() => {
            onDownload(output.filename, output.code);
          }}
        >
          Download
        </button>
      </div>
    </section>
  );
};

export const App = () => {
  const [status, setStatus] = useState<Status>({ kind: "loading" });
  const [settings, setSettings] = useState<StoredSettings>(DEFAULT_SETTINGS);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void loadSettings().then(setSettings);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void getSource()
      .then((response) => {
        if (cancelled) return;

        if (response.type === "EZ_GFORM_PARSE_ERROR") {
          setStatus({ kind: "error", message: response.message });
          return;
        }

        try {
          const schema = parseFormHtml(response.html);
          setStatus({ kind: "ready", schema });
        } catch (error) {
          const message =
            error instanceof ParseError
              ? `Could not parse this page as a Google Form: ${error.message}`
              : error instanceof Error
                ? error.message
                : String(error);
          setStatus({ kind: "error", message });
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setStatus({
          kind: "error",
          message:
            error instanceof Error
              ? error.message
              : "Could not reach the active tab. Open a Google Form and try again.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const updateSettings = (next: StoredSettings): void => {
    setSettings(next);
    void saveSettings(next);
  };

  const copy = async (code: string): Promise<void> => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  const download = (filename: string, code: string): void => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="popup">
      <header className="popup-header">
        <h1>ez-gform</h1>
      </header>

      {status.kind === "loading" && <p className="status">Reading the form…</p>}

      {status.kind === "error" && (
        <p className="status status-error">{status.message}</p>
      )}

      {status.kind === "ready" && (
        <>
          <section className="form-summary">
            <h2>{status.schema.title}</h2>
            <p className="muted">{status.schema.questions.length} questions</p>
            <ul className="question-list">
              {status.schema.questions.map((question) => {
                return (
                  <li key={question.id}>
                    <span className="badge">
                      {questionTypeLabel(question.type)}
                    </span>
                    <span className="question-title">{question.title}</span>
                    {question.required && (
                      <span className="required" aria-label="required">
                        *
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="controls">
            <label>
              Format
              <select
                value={settings.format}
                onChange={(event) => {
                  updateSettings({
                    ...settings,
                    format: event.target.value as CodegenFormat,
                  });
                }}
              >
                {FORMATS.map((format) => {
                  return (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  );
                })}
              </select>
            </label>

            <label>
              Component / type name
              <input
                type="text"
                value={settings.componentName ?? ""}
                placeholder="(auto)"
                onChange={(event) => {
                  updateSettings({
                    ...settings,
                    componentName: event.target.value,
                  });
                }}
              />
            </label>
          </section>

          <OutputPanel
            schema={status.schema}
            settings={settings}
            copied={copied}
            onCopy={copy}
            onDownload={download}
          />
        </>
      )}
    </main>
  );
};
