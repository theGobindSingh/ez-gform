export const VERSION = "0.1.0";

export type { ValidationResult } from "./encode.js";
export { encodeValues, validateValues } from "./encode.js";
export { ParseError, ValidationError } from "./errors.js";
export { extractPublicLoadData } from "./extract.js";
export { parseFormData, parseFormHtml } from "./parse.js";
export type { SubmitOptions, SubmitResult } from "./submit.js";
export { buildPrefillUrl, buildSubmitBody, submitForm } from "./submit.js";
export type {
  ChoiceOption,
  DateValue,
  FieldValue,
  FormSchema,
  FormValues,
  GridRow,
  OtherValue,
  Question,
  QuestionType,
  Section,
  TimeValue,
} from "./types.js";
export { formUrls, normalizeFormId } from "./url.js";
