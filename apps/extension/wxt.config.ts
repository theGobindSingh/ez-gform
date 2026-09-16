import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  // Firefox defaults to MV2; force MV3 on both targets per the architecture.
  manifestVersion: 3,
  manifest: {
    name: "ez-gform",
    description: "Generate ez-gform config from any Google Form",
    permissions: ["activeTab", "clipboardWrite", "storage"],
    host_permissions: ["https://docs.google.com/forms/*"],
  },
});
