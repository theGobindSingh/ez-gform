import type { FormSchema } from "./schema.js";

export type SubmitResult =
  | { status: "sent" }
  | { status: "ok"; httpStatus: number }
  | { status: "error"; error: unknown; httpStatus?: number };

export interface SubmitOptions {
  schema?: FormSchema;
  fetch?: typeof fetch;
  mode?: "no-cors" | "cors";
  signal?: AbortSignal;
}

export interface ValidationIssue {
  entryId: string;
  message: string;
}

export type ValidationResult =
  { ok: true } | { ok: false; errors: ValidationIssue[] };
