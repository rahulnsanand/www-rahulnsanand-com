/**
 * Minimal YAML front matter reader for the blog collection.
 *
 * The posts are written both by hand and by Sveltia CMS, so this has to cope with everything a
 * real YAML emitter produces for flat string/list front matter: quoted scalars with escapes, flow
 * sequences, block sequences and block scalars. Anything deeper than that (nested mappings, anchors,
 * multi-document files) is rejected rather than silently mis-parsed.
 */

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const KEY_PATTERN = /^([A-Za-z][A-Za-z0-9_-]*):(?:\s+(.*))?$/;
const LIST_ITEM_PATTERN = /^\s*-\s*(.*)$/;
const BLOCK_SCALAR_PATTERN = /^([|>])([-+]?)$/;

const ESCAPES = {
  n: "\n",
  t: "\t",
  r: "\r",
  b: "\b",
  f: "\f",
  0: "\0",
  '"': '"',
  "'": "'",
  "\\": "\\",
  "/": "/",
};

/**
 * Read a double-quoted scalar starting at `start`.
 * @returns {{ value: string, end: number }} Parsed value and index just past the closing quote.
 */
function readDoubleQuoted(text, start) {
  let value = "";
  let index = start + 1;

  while (index < text.length) {
    const char = text[index];

    if (char === "\\") {
      const next = text[index + 1] ?? "";

      if (next === "u") {
        value += String.fromCharCode(Number.parseInt(text.slice(index + 2, index + 6), 16) || 0);
        index += 6;
        continue;
      }

      value += ESCAPES[next] ?? next;
      index += 2;
      continue;
    }

    if (char === '"') {
      return { value, end: index + 1 };
    }

    value += char;
    index += 1;
  }

  throw new Error("Unterminated double-quoted string in front matter.");
}

/**
 * Read a single-quoted scalar starting at `start`. In YAML `''` is an escaped quote.
 * @returns {{ value: string, end: number }} Parsed value and index just past the closing quote.
 */
function readSingleQuoted(text, start) {
  let value = "";
  let index = start + 1;

  while (index < text.length) {
    const char = text[index];

    if (char === "'") {
      if (text[index + 1] === "'") {
        value += "'";
        index += 2;
        continue;
      }

      return { value, end: index + 1 };
    }

    value += char;
    index += 1;
  }

  throw new Error("Unterminated single-quoted string in front matter.");
}

/** Parse one scalar: quoted, or plain up to the end of the line. */
function parseScalar(raw) {
  const text = raw.trim();
  if (!text) return "";

  if (text.startsWith('"')) return readDoubleQuoted(text, 0).value;
  if (text.startsWith("'")) return readSingleQuoted(text, 0).value;

  return text;
}

/** Parse a flow sequence such as `[a, "b, c"]`. */
function parseFlowSequence(raw) {
  const text = raw.trim();
  const inner = text.slice(1, -1);
  const items = [];
  let current = "";
  let index = 0;

  while (index < inner.length) {
    const char = inner[index];

    if (char === '"' || char === "'") {
      const { value, end } = char === '"' ? readDoubleQuoted(inner, index) : readSingleQuoted(inner, index);
      current += value;
      index = end;
      continue;
    }

    if (char === ",") {
      items.push(current.trim());
      current = "";
      index += 1;
      continue;
    }

    current += char;
    index += 1;
  }

  if (current.trim()) items.push(current.trim());

  return items.filter(Boolean);
}

/** Collect the indented body of a `|` or `>` block scalar. */
function readBlockScalar(lines, startIndex, style, chomping) {
  const collected = [];
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index];
    if (line.trim() && !/^\s/.test(line)) break;
    collected.push(line);
    index += 1;
  }

  while (collected.length && !collected[collected.length - 1].trim()) {
    collected.pop();
  }

  const indent = collected.reduce((min, line) => {
    if (!line.trim()) return min;
    const width = line.length - line.trimStart().length;
    return Math.min(min, width);
  }, Number.POSITIVE_INFINITY);

  const body = collected.map((line) => (line.trim() ? line.slice(indent) : ""));
  const joined = style === ">" ? body.join(" ").replace(/\s+/g, " ").trim() : body.join("\n");
  // Trailing blank lines were already dropped above, so `+` (keep) and the default (clip) agree.
  const value = chomping === "-" ? joined : `${joined}\n`;

  return { value, next: index };
}

/**
 * Split a markdown file into its front matter object and body.
 * @param {string} raw Raw file contents.
 * @returns {{ frontmatter: Record<string, string | string[]>, body: string }} Parsed file.
 */
export function parseFrontmatter(raw) {
  const match = raw.match(FRONTMATTER_PATTERN);

  if (!match) {
    throw new Error("Missing or invalid front matter block.");
  }

  const lines = match[1].split(/\r?\n/);
  const body = match[2] ?? "";
  const frontmatter = {};
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim() || line.trimStart().startsWith("#")) {
      index += 1;
      continue;
    }

    const keyMatch = line.match(KEY_PATTERN);

    if (!keyMatch) {
      throw new Error(`Unsupported front matter line: "${line}"`);
    }

    const key = keyMatch[1];
    const rest = (keyMatch[2] ?? "").trim();
    index += 1;

    const blockScalar = rest.match(BLOCK_SCALAR_PATTERN);

    if (blockScalar) {
      const { value, next } = readBlockScalar(lines, index, blockScalar[1], blockScalar[2]);
      frontmatter[key] = value;
      index = next;
      continue;
    }

    if (rest.startsWith("[")) {
      frontmatter[key] = parseFlowSequence(rest);
      continue;
    }

    if (rest) {
      frontmatter[key] = parseScalar(rest);
      continue;
    }

    // No inline value: either an empty scalar or the start of a block sequence.
    const items = [];

    while (index < lines.length) {
      const itemMatch = lines[index].match(LIST_ITEM_PATTERN);
      if (!itemMatch) break;
      const item = parseScalar(itemMatch[1]);
      if (item) items.push(item);
      index += 1;
    }

    frontmatter[key] = items.length ? items : "";
  }

  return { frontmatter, body };
}

/** Coerce a front matter value to a trimmed string, or `undefined` when absent. */
export function readString(frontmatter, key) {
  const value = frontmatter[key];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

/** Coerce a front matter value to a string array. Single scalars become a one-item list. */
export function readStringList(frontmatter, key) {
  const value = frontmatter[key];
  if (Array.isArray(value)) return value.map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}
