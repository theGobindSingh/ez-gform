import { formUrls } from "@ez-gform/core";
import type { FormSchema, Question } from "@ez-gform/types";

const escapeHtml = (value: string): string => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};

const attr = (name: string, value: string): string => {
  return `${name}="${escapeHtml(value)}"`;
};

const renderChoiceInputs = (
  question: Question,
  inputType: "radio" | "checkbox",
): string => {
  const options = question.options ?? [];
  const rows = options.map((option) => {
    if (option.isOther) {
      return [
        `<label><input type="${inputType}" ${attr("name", question.entryId)} value="__other_option__"> Other:</label>`,
        `<input type="text" ${attr("name", `${question.entryId}.other_option_response`)}>`,
      ].join("\n    ");
    }
    return `<label><input type="${inputType}" ${attr("name", question.entryId)} ${attr("value", option.value)}> ${escapeHtml(option.value)}</label>`;
  });
  return rows.join("\n    ");
};

const renderGrid = (question: Question): string => {
  const inputType = question.type === "checkbox_grid" ? "checkbox" : "radio";
  const columns = question.options ?? [];
  const rows = (question.rows ?? [])
    .map((row) => {
      const cells = columns
        .map((col) => {
          return `<td><input type="${inputType}" ${attr("name", row.entryId)} ${attr("value", col.value)}></td>`;
        })
        .join("");
      return `  <tr><th>${escapeHtml(row.label)}</th>${cells}</tr>`;
    })
    .join("\n");
  return `<table>\n${rows}\n</table>`;
};

const renderQuestion = (question: Question): string => {
  const label = `<label>${escapeHtml(question.title)}${question.required ? " *" : ""}</label>`;
  const requiredAttr = question.required ? " required" : "";

  switch (question.type) {
    case "short_answer":
      return `${label}\n<input type="text" ${attr("name", question.entryId)}${requiredAttr}>`;
    case "paragraph":
      return `${label}\n<textarea ${attr("name", question.entryId)}${requiredAttr}></textarea>`;
    case "multiple_choice":
      return `${label}\n${renderChoiceInputs(question, "radio")}`;
    case "checkboxes":
      return `${label}\n${renderChoiceInputs(question, "checkbox")}`;
    case "dropdown": {
      const options = (question.options ?? [])
        .map((option) => {
          return `  <option ${attr("value", option.value)}>${escapeHtml(option.value)}</option>`;
        })
        .join("\n");
      return `${label}\n<select ${attr("name", question.entryId)}${requiredAttr}>\n${options}\n</select>`;
    }
    case "linear_scale": {
      const min = question.scale?.min ?? 1;
      const max = question.scale?.max ?? 5;
      const inputs: string[] = [];
      for (let value = min; value <= max; value++) {
        inputs.push(
          `<label><input type="radio" ${attr("name", question.entryId)} ${attr("value", String(value))}> ${value}</label>`,
        );
      }
      return `${label}\n${inputs.join("\n")}`;
    }
    case "grid":
    case "checkbox_grid":
      return `${label}\n${renderGrid(question)}`;
    case "date": {
      const inputs: string[] = [];
      if (question.date?.includeYear !== false) {
        inputs.push(
          `<input type="number" ${attr("name", `${question.entryId}_year`)} placeholder="Year">`,
        );
      }
      inputs.push(
        `<input type="number" ${attr("name", `${question.entryId}_month`)} placeholder="Month">`,
      );
      inputs.push(
        `<input type="number" ${attr("name", `${question.entryId}_day`)} placeholder="Day">`,
      );
      if (question.date?.includeTime) {
        inputs.push(
          `<input type="number" ${attr("name", `${question.entryId}_hour`)} placeholder="Hour">`,
        );
        inputs.push(
          `<input type="number" ${attr("name", `${question.entryId}_minute`)} placeholder="Minute">`,
        );
      }
      return `${label}\n${inputs.join("\n")}`;
    }
    case "time":
      return `${label}\n<input type="number" ${attr("name", `${question.entryId}_hour`)} placeholder="Hour">\n<input type="number" ${attr("name", `${question.entryId}_minute`)} placeholder="Minute">`;
    case "file_upload":
      return `${label}\n<!-- file_upload is not supported by the Forms API without sign-in; no input rendered -->`;
    default:
      return label;
  }
};

/**
 * Emits a plain HTML `<form>` (no JS framework required) posting directly to
 * the form's `formResponse` endpoint, with `name` attributes following every
 * `entry.N`(`_year`/`_month`/`_day`/`_hour`/`_minute`, `__other_option__`,
 * `.other_option_response`) encoding rule in
 * `docs/research/google-forms-internals.md` §3.
 */
export const generateHtmlForm = (schema: FormSchema): string => {
  const { formResponse } = formUrls(schema.formId || "REPLACE_WITH_FORM_ID");
  const body = schema.questions.map(renderQuestion).join("\n\n");

  const hiddenFields: string[] = [];
  if (schema.multiPage) {
    hiddenFields.push(
      `<input type="hidden" ${attr("name", "fbzx")} ${attr("value", schema.fbzx ?? "")}>`,
    );
  }

  return `<!-- ${escapeHtml(schema.title)} -->
<form action="${escapeHtml(formResponse)}" method="POST">
${hiddenFields.join("\n")}
${body}

<button type="submit">Submit</button>
</form>
`;
};
