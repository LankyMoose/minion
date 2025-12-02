import { assert } from "./assert.js";

const TYPE_DEFS = new Map<string, string[]>();
const WHITESPACE_CHARS = new Set([" ", "\t", "\n", "\r"]);

export function parse(text: string) {
  TYPE_DEFS.clear();
  assert(typeof text === "string", "invalid input");

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let idx = 0;

  for (; idx < lines.length; idx++) {
    const line = lines[idx]!;
    if (!line.startsWith("$")) break;

    const [name, ...fields] = parseTypeDef(line);
    TYPE_DEFS.set(name, fields);
  }

  const dataText = lines.slice(idx).join(" ");
  assert(dataText, "expected data following type definitions");

  return parseValue(dataText);
}

function parseTypeDef(line: string): [name: string, ...fields: string[]] {
  let i = 1;
  // skip until whitespace to find end of name
  for (; i < line.length; i++) {
    const ch = line[i]!;
    if (WHITESPACE_CHARS.has(ch)) break;
  }

  const name = line.slice(1, i);
  assert(name.length > 0, "expected type name");

  const fields = line
    .slice(i + 1)
    .trim()
    .split(",")
    .filter(Boolean);

  return [name, ...fields];
}

function splitTopLevel(expr: string): string[] {
  let out = [];
  let depth = 0;
  let current = "";
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === "(" || ch === "[") depth++;
    if (ch === ")" || ch === "]") depth--;
    if (ch === "," && depth === 0) {
      out.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) out.push(current.trim());
  return out;
}

function parseObject(text: string) {
  const open = text.indexOf("(");
  const close = text.lastIndexOf(")");
  assert(open !== -1 && close !== -1, "invalid object format");

  const name = text.slice(0, open).trim();
  const fields = TYPE_DEFS.get(name);
  assert(fields, `Unknown type definition for ${name}: ${text}`);

  const argsRaw = text.slice(open + 1, close).trim();
  const args = splitTopLevel(argsRaw).map(parseValue);

  assert(args.length === fields.length, "invalid number of arguments");

  const result: Record<string, unknown> = {};
  fields.forEach((f, i) => {
    result[f] = args[i];
  });
  return result;
}

function parseArray(raw: string) {
  assert(raw.endsWith("]"), "expected ending ']'");
  const inner = raw.slice(1, -1).trim();
  if (!inner) return [];
  return splitTopLevel(inner).map(parseValue);
}

function parseValue(v: string): unknown {
  v = v.trim();

  if (v === "null") return null;

  if (v.startsWith("[")) return parseArray(v);

  if (v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1);

  if (!isNaN(Number(v))) return Number(v);

  // Could be nested instance: User(...)
  if (v.includes("(")) return parseObject(v);

  assert(false, "unknown value: " + v);
}
