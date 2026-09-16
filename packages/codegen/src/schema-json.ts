import type { FormSchema } from "@ez-gform/core";

export interface GenerateSchemaJsonOptions {
  /** Pretty-print with 2-space indentation. Defaults to `true`. */
  pretty?: boolean;
}

/** Serializes a `FormSchema` back to JSON text. Round-trips structurally with `JSON.parse`. */
export const generateSchemaJson = (
  schema: FormSchema,
  options: GenerateSchemaJsonOptions = {},
): string => {
  const pretty = options.pretty ?? true;
  return pretty ? JSON.stringify(schema, null, 2) : JSON.stringify(schema);
};
