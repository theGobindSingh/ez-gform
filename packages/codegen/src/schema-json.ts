import type { FormSchema, GenerateSchemaJsonOptions } from "@ez-gform/types";

export type { GenerateSchemaJsonOptions } from "@ez-gform/types";

/** Serializes a `FormSchema` back to JSON text. Round-trips structurally with `JSON.parse`. */
export const generateSchemaJson = (
  schema: FormSchema,
  options: GenerateSchemaJsonOptions = {},
): string => {
  const pretty = options.pretty ?? true;
  return pretty ? JSON.stringify(schema, null, 2) : JSON.stringify(schema);
};
