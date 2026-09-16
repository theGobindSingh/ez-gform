/**
 * A bare published form id looks like `1FAIpQLS...` (starts with `1FAIpQLS` in
 * practice, but we don't hard-require that prefix since Google hasn't
 * documented it). We only require it to be a reasonably long token of URL-safe
 * characters with no slashes, to reject obviously-wrong input like a random
 * sentence or an empty string.
 */
const BARE_ID_RE = /^[A-Za-z0-9_-]{10,}$/;

/**
 * Accepts a bare form id, an `e/<id>` string (as stored in
 * `FB_PUBLIC_LOAD_DATA_[14]`), or any `docs.google.com/forms` URL shape
 * (including `/u/<n>/`, `/d/e/<id>/viewform`, `/d/<id>/edit`, with or without
 * query strings/trailing slashes) and returns the bare published id.
 */
export const normalizeFormId = (input: string): string => {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new Error("normalizeFormId: input is empty");
  }

  if (trimmed.startsWith("e/")) {
    const id = trimmed.slice(2);
    return normalizeFormId(id);
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("docs.google.com")) {
    const url = new URL(
      /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`,
    );
    const parts = url.pathname.split("/").filter(Boolean);
    // parts look like: ["forms", "u", "0", "d", "e", "<id>", "viewform"]
    // or: ["forms", "d", "e", "<id>", "viewform"]
    // or: ["forms", "d", "<editor-id>", "edit"]
    const dIndex = parts.indexOf("d");
    if (dIndex === -1 || dIndex + 1 >= parts.length) {
      throw new Error(
        `normalizeFormId: could not find form id in URL "${input}"`,
      );
    }
    const afterD = parts[dIndex + 1];
    const id = afterD === "e" ? parts[dIndex + 2] : afterD;
    if (!id) {
      throw new Error(
        `normalizeFormId: could not find form id in URL "${input}"`,
      );
    }
    return normalizeFormId(id);
  }

  if (!BARE_ID_RE.test(trimmed)) {
    throw new Error(
      `normalizeFormId: "${input}" is not a recognizable Google Form id or URL`,
    );
  }
  return trimmed;
};

export function formUrls(formId: string): {
  viewform: string;
  formResponse: string;
} {
  const id = normalizeFormId(formId);
  return {
    viewform: `https://docs.google.com/forms/d/e/${id}/viewform`,
    formResponse: `https://docs.google.com/forms/d/e/${id}/formResponse`,
  };
}
