import type {
  DateValue,
  FieldValue,
  FormSchema,
  FormValues,
  OtherValue,
  TimeValue,
} from "./types.js";

const OTHER_SENTINEL = "__other_option__";

function isOtherValue(v: unknown): v is OtherValue {
  return typeof v === "object" && v !== null && !Array.isArray(v) && "other" in v;
}

function isDateValue(v: unknown): v is DateValue {
  return typeof v === "object" && v !== null && !Array.isArray(v) && "day" in v && "month" in v;
}

function isTimeValue(v: unknown): v is TimeValue {
  return (
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    "hour" in v &&
    "minute" in v &&
    !("day" in v)
  );
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function appendScalar(
  params: URLSearchParams,
  key: string,
  value: string | number | undefined | null,
): void {
  if (value === undefined || value === null) return;
  const str = String(value);
  if (str.length === 0) return;
  params.append(key, str);
}

function appendChoiceItem(
  params: URLSearchParams,
  entryId: string,
  item: string | OtherValue,
): void {
  if (isOtherValue(item)) {
    params.append(entryId, OTHER_SENTINEL);
    appendScalar(params, `${entryId}.other_option_response`, item.other);
  } else {
    appendScalar(params, entryId, item);
  }
}

function appendGridMap(params: URLSearchParams, gridMap: Record<string, string | string[]>): void {
  for (const [rowEntryId, colValue] of Object.entries(gridMap)) {
    if (Array.isArray(colValue)) {
      for (const v of colValue) appendScalar(params, rowEntryId, v);
    } else {
      appendScalar(params, rowEntryId, colValue);
    }
  }
}

/**
 * Encodes `FormValues` into `entry.NNN`-keyed `URLSearchParams`, per every
 * rule in `docs/research/google-forms-internals.md` §3. Pure: never throws
 * on invalid/unknown data, and never validates against `schema` — pair with
 * `validateValues` for that.
 */
export function encodeValues(values: FormValues, schema?: FormSchema): URLSearchParams {
  const params = new URLSearchParams();
  const checkboxEntryIds = new Set(
    (schema?.questions ?? []).filter((q) => q.type === "checkboxes").map((q) => q.entryId),
  );

  for (const [entryId, rawValue] of Object.entries(values)) {
    encodeOne(params, entryId, rawValue);

    if (checkboxEntryIds.has(entryId) && rawValue !== null && rawValue !== undefined) {
      params.append(`${entryId}_sentinel`, "");
    }
  }

  return params;
}

function encodeOne(params: URLSearchParams, entryId: string, value: FieldValue): void {
  if (value === null || value === undefined) return;

  if (Array.isArray(value)) {
    for (const item of value) appendChoiceItem(params, entryId, item);
    return;
  }

  if (typeof value === "string" || typeof value === "number") {
    appendScalar(params, entryId, value);
    return;
  }

  if (isOtherValue(value)) {
    appendChoiceItem(params, entryId, value);
    return;
  }

  if (isDateValue(value)) {
    if (value.year !== undefined) appendScalar(params, `${entryId}_year`, value.year);
    appendScalar(params, `${entryId}_month`, value.month);
    appendScalar(params, `${entryId}_day`, value.day);
    if (value.hour !== undefined) appendScalar(params, `${entryId}_hour`, value.hour);
    if (value.minute !== undefined) appendScalar(params, `${entryId}_minute`, value.minute);
    return;
  }

  if (isTimeValue(value)) {
    appendScalar(params, `${entryId}_hour`, pad2(value.hour));
    appendScalar(params, `${entryId}_minute`, pad2(value.minute));
    return;
  }

  // Otherwise: grid row map, Record<string, string | string[]>.
  appendGridMap(params, value as Record<string, string | string[]>);
}

export interface ValidationResult {
  ok: boolean;
  errors?: { entryId: string; message: string }[];
}

/** Validates `values` against a parsed `FormSchema`: unknown entry ids and missing required questions. */
export function validateValues(
  values: FormValues,
  schema: FormSchema,
): { ok: true } | { ok: false; errors: { entryId: string; message: string }[] } {
  const errors: { entryId: string; message: string }[] = [];

  const knownEntryIds = new Set<string>();
  for (const q of schema.questions) {
    knownEntryIds.add(q.entryId);
    for (const row of q.rows ?? []) knownEntryIds.add(row.entryId);
  }

  for (const key of Object.keys(values)) {
    if (!knownEntryIds.has(key)) {
      errors.push({
        entryId: key,
        message: `Unknown entry id "${key}" is not present in the form schema`,
      });
    }
  }

  for (const q of schema.questions) {
    if (!q.required) continue;
    const idsToCheck = q.rows && q.rows.length > 0 ? q.rows.map((r) => r.entryId) : [q.entryId];
    for (const id of idsToCheck) {
      const v = values[id];
      const isEmpty =
        v === undefined ||
        v === null ||
        v === "" ||
        (Array.isArray(v) && v.length === 0) ||
        (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0);
      if (isEmpty) {
        errors.push({
          entryId: id,
          message: `Missing required answer for question "${q.title}" (${id})`,
        });
      }
    }
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}
