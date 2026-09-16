export interface ParsedFormUrl {
  kind: "published" | "edit";
  id: string;
}

/**
 * Parses a Google Forms URL into its form id and whether it is the
 * published (`viewform`) or editor (`edit`) view.
 *
 * Handles:
 * - `https://docs.google.com/forms/d/e/<id>/viewform` (published)
 * - `https://docs.google.com/forms/d/<id>/edit` (edit)
 * - `https://docs.google.com/forms/u/<n>/d/<id>/edit` (edit, multi-account)
 *
 * Returns `null` for anything else.
 */
export function parseFormUrl(url: string): ParsedFormUrl | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.hostname !== "docs.google.com") {
    return null;
  }

  const segments = parsed.pathname.split("/").filter((segment) => segment.length > 0);

  // ["forms", "d", "e", "<id>", "viewform"]
  // ["forms", "d", "<id>", "edit"]
  // ["forms", "u", "<n>", "d", "<id>", "edit"]
  if (segments[0] !== "forms") {
    return null;
  }

  let rest = segments.slice(1);

  // Strip a leading `u/<n>` multi-account prefix.
  if (rest[0] === "u" && rest[1] !== undefined) {
    rest = rest.slice(2);
  }

  if (rest[0] !== "d") {
    return null;
  }

  // Published: d/e/<id>/viewform
  if (rest[1] === "e" && rest[2] !== undefined && rest[3] === "viewform") {
    return { kind: "published", id: rest[2] };
  }

  // Edit: d/<id>/edit
  if (rest[1] !== undefined && rest[2] === "edit") {
    return { kind: "edit", id: rest[1] };
  }

  return null;
}
