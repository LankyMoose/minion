import { assert } from "./assert.js";

interface TypeInfo {
  name: string;
  fields: string[];
}

let typeCounter = 1;
const SHAPES = new Map<string, TypeInfo>();
const SEEN = new Set<any>(); // active recursion stack
const CACHE = new Map<any, string>(); // finished objects → encoded form

// JSON.stringify undefined rules:
// - root → undefined (no output)
// - array slot → "null"
// - object property → omitted

export function stringify(input: any): string {
  // @ts-expect-error (same as JSON.stringify)
  if (input === undefined) return undefined;

  typeCounter = 1;
  SHAPES.clear();
  SEEN.clear();
  CACHE.clear();

  const body = visit(input);
  const header = [...SHAPES.values()]
    .map((info) => `$${info.name} ${info.fields.join(",")}`)
    .join("\n");

  return header + "\n" + body;
}

function visit(value: any, isArrayValue = false): string | undefined {
  if (value === undefined) {
    if (isArrayValue) return "null";
    return undefined;
  }

  // Primitive
  if (value === null) return "null";
  const t = typeof value;
  if (t === "string") return `"${value}"`;
  if (t === "number") return String(value);
  if (t === "boolean") return value ? "true" : "false";

  // Cached object result
  if (CACHE.has(value)) return CACHE.get(value)!;

  // Cycle detection
  if (SEEN.has(value)) {
    throw new Error("Circular reference");
  }

  SEEN.add(value);
  try {
    if (Array.isArray(value)) {
      const parts = value.map((v) => visit(v, true) ?? "null");
      const str = `[${parts.join(",")}]`;
      CACHE.set(value, str);
      return str;
    }

    assert(t === "object", "Unsupported value: " + value);

    const allFields = Object.keys(value);

    // IMPORTANT: match JSON: undefined object props are omitted,
    // but do NOT visit them here or type-definition order changes.
    const keptFields = allFields.filter((k) => value[k] !== undefined);

    // If all fields disappeared → use empty shape `{}`-equivalent
    if (keptFields.length === 0) {
      const info = getOrAssignType([]); // empty field list = empty shape
      const str = `${info.name}()`; // same style as your non-empty shapes
      CACHE.set(value, str);
      return str;
    }

    const info = getOrAssignType(keptFields);
    const args = info.fields.map((f) => visit(value[f])!);
    const str = `${info.name}(${args.join(",")})`;
    CACHE.set(value, str);
    return str;
  } finally {
    SEEN.delete(value);
  }
}

function getOrAssignType(fields: string[]): TypeInfo {
  const signature = fields.join(",");
  let info = SHAPES.get(signature);
  if (!info) {
    info = { name: alphaId(typeCounter++), fields };
    SHAPES.set(signature, info);
  }
  return info;
}

function alphaId(n: number): string {
  let s = "";
  while (n > 0) {
    n--;
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
}
