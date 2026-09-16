import type { ExtensionMessage } from "@ez-gform/types";
import { relayGetSource } from "./relay.js";

// MV3 service worker: the popup can't talk to the content script directly
// (it isn't a tab), so it asks the background worker to relay
// EZ_GFORM_GET_SOURCE to the active tab and forward the response back.
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    if (message.type !== "EZ_GFORM_GET_SOURCE") {
      return false;
    }

    relayGetSource(chrome.tabs)
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
