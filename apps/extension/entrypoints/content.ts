export default defineContentScript({
  matches: ["https://docs.google.com/forms/*"],
  main() {
    // TODO(@ez-gform/core): once the core parser package exists, run
    // `parseFormFromHTML` here (or in the popup, on the returned HTML) to
    // extract the `FB_PUBLIC_LOAD_DATA_` schema instead of shipping raw
    // HTML across the message channel.
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message?.type !== "EZ_GFORM_GET_SOURCE") {
        return;
      }

      sendResponse({
        html: document.documentElement.outerHTML,
        url: window.location.href,
      });

      return true;
    });
  },
});
