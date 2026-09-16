import { formUrls } from "@ez-gform/core";

/**
 * Given the current tab's URL, decides how the content script should obtain
 * the form's HTML:
 * - editor URLs (`.../forms/d/<id>/edit`) require a separate fetch of the
 *   public `/viewform` page (the editor DOM has none of the answer markup);
 * - viewform/published URLs can be read directly from the live DOM.
 *
 * Only the `URL` API and `@ez-gform/core`'s id/URL helpers are used here —
 * never Google's obfuscated CSS classes (see CLAUDE.md).
 */
export interface ResolvedSource {
  /** `true` when the HTML must be fetched from `fetchUrl`; `false` when the current document can be read directly. */
  shouldFetch: boolean;
  /** The `/viewform` URL to fetch when `shouldFetch` is `true`; otherwise the current tab URL for reporting purposes. */
  fetchUrl: string;
}

const isEditUrl = (url: URL): boolean => {
  return (
    url.hostname === "docs.google.com" &&
    url.pathname.startsWith("/forms/") &&
    url.pathname.endsWith("/edit")
  );
};

export const resolveSource = (currentUrl: string): ResolvedSource => {
  const url = new URL(currentUrl);

  if (!isEditUrl(url)) {
    return { shouldFetch: false, fetchUrl: currentUrl };
  }

  // The editor URL's trailing id is the same form id used to build the
  // published viewform URL; extracting it and re-deriving the URL through
  // `formUrls` avoids ever string-slicing Google's URL shape ourselves.
  const parts = url.pathname.split("/").filter(Boolean);
  const dIndex = parts.indexOf("d");
  const formId = dIndex !== -1 ? parts[dIndex + 1] : undefined;
  if (!formId) {
    throw new Error(
      `resolveSource: could not find a form id in "${currentUrl}"`,
    );
  }

  return { shouldFetch: true, fetchUrl: formUrls(formId).viewform };
};
