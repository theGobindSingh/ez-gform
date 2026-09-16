import {
  generateHtmlForm,
  generateReactComponent,
  generateSchemaJson,
  generateTypes,
} from "@ez-gform/codegen";
import type { FormSchema, StoredSettings } from "@ez-gform/types";

export interface CodegenOutput {
  code: string;
  filename: string;
  language: "json" | "typescript" | "tsx" | "html";
}

/**
 * Pure mapping from a parsed `FormSchema` + the popup's persisted settings to
 * generated code. Kept free of any `chrome.*` API so it's testable without a
 * browser environment (App.tsx is the only caller that needs jsdom/chrome).
 */
export const buildOutput = (
  schema: FormSchema,
  settings: StoredSettings,
): CodegenOutput => {
  const trimmedName = settings.componentName?.trim();
  const name = trimmedName === "" ? undefined : trimmedName;

  switch (settings.format) {
    case "json":
      return {
        code: generateSchemaJson(schema),
        filename: "form-schema.json",
        language: "json",
      };
    case "types":
      return {
        code: generateTypes(schema, { name }),
        filename: "form-types.ts",
        language: "typescript",
      };
    case "react":
      return {
        code: generateReactComponent(schema, {
          name,
          typescript: settings.typescript,
        }),
        filename: settings.typescript
          ? "FormComponent.tsx"
          : "FormComponent.jsx",
        language: settings.typescript ? "tsx" : "typescript",
      };
    case "html":
      return {
        code: generateHtmlForm(schema),
        filename: "form.html",
        language: "html",
      };
  }
};
