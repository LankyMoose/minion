import { assert } from "./assert.js";

interface TypeInfo {
  name: string;
  fields: string[];
}

let typeCounter = 1;
const SHAPES = new Map<string, TypeInfo>();
const SEEN = new Set<any>(); // active recursion stack
const CACHE = new Map<any, string>(); // finished objects → encoded form

export function stringify(input: any): string {
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

function visit(value: any): string {
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
      const parts = value.map(visit).join(",");
      const str = `[${parts}]`;
      CACHE.set(value, str);
      return str;
    }

    assert(t === "object", "Unsupported value: " + value);

    const fields = Object.keys(value);
    const info = getOrAssignType(fields);
    const args = info.fields.map((f) => visit(value[f]));
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
