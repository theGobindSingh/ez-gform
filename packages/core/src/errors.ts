/** Thrown when `FB_PUBLIC_LOAD_DATA_` (or a caller-supplied value) doesn't match the expected shape. */
export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

/** Thrown-shaped, but returned (not thrown) by `validateValues`. */
export class ValidationError extends Error {
  errors: { entryId: string; message: string }[];

  constructor(message: string, errors: { entryId: string; message: string }[]) {
    super(message);
    this.name = "ValidationError";
    this.errors = errors;
  }
}
