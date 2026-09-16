import type { ExtensionResponse } from "@ez-gform/types";

/** Asks the background service worker for the active tab's Google Form HTML. */
export const getSource = async (): Promise<ExtensionResponse> => {
  const response: unknown = await chrome.runtime.sendMessage({
    type: "EZ_GFORM_GET_SOURCE",
  });
  return response as ExtensionResponse;
};
