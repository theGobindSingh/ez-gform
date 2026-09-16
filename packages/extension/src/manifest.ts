/* eslint-disable camelcase -- chrome manifest key names */

/** Minimal MV3 manifest shape this package writes. Kept local rather than pulled from `@types/chrome` (which has no manifest type). */
export interface Manifest {
  manifest_version: 3;
  name: string;
  version: string;
  description: string;
  action: {
    default_popup: string;
    default_icon: Record<string, string>;
  };
  background: {
    service_worker: string;
    type: "module";
  };
  content_scripts: {
    matches: string[];
    js: string[];
  }[];
  permissions: string[];
  host_permissions: string[];
  icons: Record<string, string>;
}

export interface BuildManifestOptions {
  name: string;
  version: string;
  description: string;
}

const GOOGLE_FORMS_MATCH = "https://docs.google.com/forms/*";

/**
 * Pure manifest builder, kept free of `fs`/`path` so it can be unit tested
 * without touching disk. `src/index.ts` is the only caller that writes the
 * result to `dist/manifest.json`.
 */
export const buildManifest = (options: BuildManifestOptions): Manifest => {
  return {
    manifest_version: 3,
    name: options.name,
    version: options.version,
    description: options.description,
    action: {
      default_popup: "popup.html",
      default_icon: {
        16: "icons/icon16.png",
        32: "icons/icon32.png",
        48: "icons/icon48.png",
        128: "icons/icon128.png",
      },
    },
    background: {
      service_worker: "background.js",
      type: "module",
    },
    content_scripts: [
      {
        matches: [GOOGLE_FORMS_MATCH],
        js: ["content-script.js"],
      },
    ],
    permissions: ["activeTab", "storage", "clipboardWrite"],
    host_permissions: [GOOGLE_FORMS_MATCH],
    icons: {
      16: "icons/icon16.png",
      32: "icons/icon32.png",
      48: "icons/icon48.png",
      128: "icons/icon128.png",
    },
  };
};
