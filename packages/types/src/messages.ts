import type { CodegenFormat } from "./codegen.js";

/** Messages the popup/background of the upcoming boilerplate-style extension sends to the content script. */
export type ExtensionMessage =
  | { type: "EZ_GFORM_GET_SOURCE" }
  | { type: "EZ_GFORM_SOURCE"; html: string; url: string }
  | { type: "EZ_GFORM_PARSE_ERROR"; message: string };

/** The subset of `ExtensionMessage` variants the content script sends back in response to `EZ_GFORM_GET_SOURCE`. */
export type ExtensionResponse = Extract<
  ExtensionMessage,
  { type: "EZ_GFORM_SOURCE" } | { type: "EZ_GFORM_PARSE_ERROR" }
>;

/** Popup-persisted codegen preferences. */
export interface StoredSettings {
  format: CodegenFormat;
  componentName?: string;
  typescript: boolean;
}
