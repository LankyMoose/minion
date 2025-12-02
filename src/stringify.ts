import { assert } from "./assert.js";

interface TypeInfo {
  name: string;
  fields: string[];
}

let typeCounter = 1;
const SHAPES = new Map<string, TypeInfo>();

/**
 * Converts a value to a string representation.
 *
 * Objects:
 * ```
 * stringify({ name: "John Doe", age: 42 });
 * // => `$User name,age\nUser("John Doe",42)`
 * ```
 * Arrays:
 * ```
 * stringify([ { name: "John Doe", age: 42 }, { name: "Jane Doe", age: 43 } ]);
 * // => `$User name,age\n[User("John Doe",42),User("Jane Doe",43)]`
 * ```
 */

export function stringify(value: any): string {
  SHAPES.clear();
  typeCounter = 1;

  collectTypes(value);

  const lines: string[] = [];
  for (const info of SHAPES.values()) {
    lines.push(`\$${info.name} ${info.fields.join(",")}`);
  }

  lines.push(stringifyValue(value));

  return lines.join("\n");
}

function stringifyValue(value: any): string {
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value === null) return "null";

  if (Array.isArray(value)) {
    return "[" + value.map(stringifyValue).join(",") + "]";
  }

  assert(typeof value === "object", "Unsupported value: " + value);

  const fields = Object.keys(value);
  const type = SHAPES.get(fields.join(","))!;
  const args = type.fields.map((f) => stringifyValue(value[f]));
  return `${type.name}(${args.join(",")})`;
}

function collectTypes(value: any) {
  if (value == null) return;
  if (typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const v of value) collectTypes(v);
    return;
  }

  const fields = Object.keys(value);
  const signature = fields.join(",");

  if (!SHAPES.has(signature)) {
    SHAPES.set(signature, {
      name: alphaId(typeCounter++),
      fields,
    });
  }

  for (const f of fields) {
    collectTypes(value[f]);
  }
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
