import type { ExtensionMessage, ExtensionResponse } from "@ez-gform/types";
import { resolveSource } from "./resolve-source.js";

const SIGN_IN_MARKERS = ["accounts.google.com/ServiceLogin", "signin/v2"];

const looksLikeSignInPage = (html: string, url: string): boolean => {
  return SIGN_IN_MARKERS.some((marker) => {
    return html.includes(marker) || url.includes(marker);
  });
};

const getSource = async (): Promise<ExtensionResponse> => {
  const currentUrl = window.location.href;

  try {
    const { shouldFetch, fetchUrl } = resolveSource(currentUrl);

    if (!shouldFetch) {
      return {
        type: "EZ_GFORM_SOURCE",
        html: document.documentElement.outerHTML,
        url: currentUrl,
      };
    }

    // Mirrors the legacy extension's approach: fetch the public prefill/view
    // page with the browser's own session cookies so a signed-in editor can
    // still resolve the published form's HTML.
    const response = await fetch(fetchUrl, { credentials: "include" });
    const html = await response.text();

    if (!response.ok || looksLikeSignInPage(html, response.url)) {
      return {
        type: "EZ_GFORM_PARSE_ERROR",
        message:
          "This form requires signing in to view, or could not be loaded. Open the published /viewform link directly and try again.",
      };
    }

    return { type: "EZ_GFORM_SOURCE", html, url: fetchUrl };
  } catch (error) {
    return {
      type: "EZ_GFORM_PARSE_ERROR",
      message: error instanceof Error ? error.message : String(error),
    };
  }
};

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    if (message.type !== "EZ_GFORM_GET_SOURCE") {
      return false;
    }

    getSource()
      .then(sendResponse)
      .catch((error: unknown) => {
        sendResponse({
          type: "EZ_GFORM_PARSE_ERROR",
          message: error instanceof Error ? error.message : String(error),
        });
      });

    return true; // Keep the message channel open for the async response.
  },
);

export {};
