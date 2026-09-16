/** Output format emitted by `@ez-gform/codegen` / `@ez-gform/cli`. */
export type CodegenFormat = "json" | "types" | "react" | "html";

export interface GenerateTypesOptions {
  /** Base name for the generated `const` and `type`. Defaults to a PascalCase form of `schema.title`. */
  name?: string;
}

export interface GenerateReactOptions {
  /** Component name. Defaults to a PascalCase form of `schema.title` + `Form`. */
  name?: string;
  /** Emit TypeScript (`.tsx`) vs. plain JS-in-JSX. Defaults to `true`. */
  typescript?: boolean;
  /** Reserved for future styling presets. Only `"none"` is currently supported. */
  styling?: "none";
}

export interface GenerateSchemaJsonOptions {
  /** Pretty-print with 2-space indentation. Defaults to `true`. */
  pretty?: boolean;
}
