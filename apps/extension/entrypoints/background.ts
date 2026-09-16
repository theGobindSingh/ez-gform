export default defineBackground(() => {
  // Relays EZ_GFORM_GET_SOURCE requests from the popup to the content
  // script running in the active tab, and relays the response back.
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "EZ_GFORM_GET_SOURCE") {
      return;
    }

    browser.tabs
      .query({ active: true, currentWindow: true })
      .then(([tab]) => {
        if (!tab?.id) {
          sendResponse(null);
          return;
        }
        return browser.tabs.sendMessage(tab.id, message).then(sendResponse);
      })
      .catch(() => sendResponse(null));

    return true;
  });
});
