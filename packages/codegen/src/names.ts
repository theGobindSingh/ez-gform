/** Splits a free-form string (a form title, question label, etc.) into word tokens. */
const splitWords = (input: string): string[] => {
  return (
    input
      // Insert boundaries between camelCase / acronym transitions.
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
      // Replace anything that isn't a letter/digit with a space.
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .trim()
      .split(/\s+/)
      .filter((word) => {
        return word.length > 0;
      })
  );
};

/** Converts a free-form string into `PascalCase`, safe for a TS identifier/type name. */
export const toPascalCase = (input: string): string => {
  const words = splitWords(input);
  const pascal = words
    .map((word) => {
      const lower = word.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
  return pascal.length > 0 ? pascal : "Form";
};

/**
 * Converts a free-form string into a valid, sanitized JS identifier
 * (`camelCase`, no leading digit, never a reserved keyword collision risk
 * since a trailing underscore is unnecessary here — callers only use this
 * for local variable / function names, not globals).
 */
export const toIdentifier = (input: string): string => {
  const words = splitWords(input);
  if (words.length === 0) return "value";
  const [first, ...rest] = words;
  const camel =
    first!.toLowerCase() +
    rest
      .map((word) => {
        const lower = word.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      })
      .join("");
  return /^[0-9]/.test(camel) ? `_${camel}` : camel;
};
