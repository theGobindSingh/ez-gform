import type { ExtensionMessage, ExtensionResponse } from "@ez-gform/types";

/** Chrome's tabs API surface `relayGetSource` needs, narrowed for testability without `@types/chrome`'s ambient globals. */
export interface TabsApi {
  query: (query: {
    active: boolean;
    currentWindow: boolean;
  }) => Promise<{ id?: number; url?: string }[]>;
  sendMessage: (
    tabId: number,
    message: ExtensionMessage,
  ) => Promise<ExtensionResponse>;
}

const NOT_A_GOOGLE_FORM_TAB: ExtensionResponse = {
  type: "EZ_GFORM_PARSE_ERROR",
  message:
    "The active tab is not a Google Form. Open a docs.google.com/forms page and try again.",
};

const isGoogleFormUrl = (url: string | undefined): url is string => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "docs.google.com" &&
      parsed.pathname.startsWith("/forms/")
    );
  } catch {
    return false;
  }
};

/**
 * Relays an `EZ_GFORM_GET_SOURCE` request to the active tab's content script
 * and returns its response. Pulled out of the `chrome.runtime.onMessage`
 * listener so it can be unit tested against a mocked `TabsApi` instead of the
 * real `chrome.tabs` global.
 */
export const relayGetSource = async (
  tabs: TabsApi,
): Promise<ExtensionResponse> => {
  const [activeTab] = await tabs.query({ active: true, currentWindow: true });

  if (activeTab?.id === undefined || !isGoogleFormUrl(activeTab.url)) {
    return NOT_A_GOOGLE_FORM_TAB;
  }

  try {
    return await tabs.sendMessage(activeTab.id, {
      type: "EZ_GFORM_GET_SOURCE",
    });
  } catch (error) {
    return {
      type: "EZ_GFORM_PARSE_ERROR",
      message:
        error instanceof Error
          ? `Could not reach the content script: ${error.message}`
          : "Could not reach the content script.",
    };
  }
};
