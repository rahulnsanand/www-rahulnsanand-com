const JSON_LD_ESCAPE_MAP: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

const JSON_LD_ESCAPE_PATTERN = /[<>&\u2028\u2029]/g;

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replaceAll(JSON_LD_ESCAPE_PATTERN, (char) => JSON_LD_ESCAPE_MAP[char] ?? char);
}
