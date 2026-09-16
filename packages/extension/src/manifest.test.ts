/* eslint-disable camelcase -- chrome manifest key names */
import { describe, expect, it } from "vitest";
import { buildManifest } from "./manifest.js";

describe("buildManifest", () => {
  const manifest = buildManifest({
    name: "ez-gform",
    version: "0.1.0",
    description: "Generate ez-gform config and code from any Google Form",
  });

  it("is a valid MV3 manifest shape", () => {
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.name).toBe("ez-gform");
    expect(manifest.version).toBe("0.1.0");
  });

  it("points the popup and background at the assembled files", () => {
    expect(manifest.action.default_popup).toBe("popup.html");
    expect(manifest.background).toEqual({
      service_worker: "background.js",
      type: "module",
    });
  });

  it("only injects the content script on Google Forms pages", () => {
    expect(manifest.content_scripts).toEqual([
      {
        matches: ["https://docs.google.com/forms/*"],
        js: ["content-script.js"],
      },
    ]);
    expect(manifest.host_permissions).toEqual([
      "https://docs.google.com/forms/*",
    ]);
  });

  it("requests only the permissions it needs", () => {
    expect(manifest.permissions.sort()).toEqual(
      ["activeTab", "clipboardWrite", "storage"].sort(),
    );
  });

  it("declares all four icon sizes", () => {
    expect(Object.keys(manifest.icons).sort()).toEqual([
      "128",
      "16",
      "32",
      "48",
    ]);
  });
});
