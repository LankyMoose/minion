import { describe, it } from "node:test";
import assert from "node:assert";

import { stringify } from "./stringify.js";

describe("stringify", () => {
  it("stringifies instances", () => {
    const result = stringify({ name: "John Doe", age: 42 });

    assert.strictEqual(result, `$A name,age\nA("John Doe",42)`);
  });

  it("stringifies nested instances", () => {
    const expected = `$A user,meta
$B name,age
$C created,updated
A(B("John",42),C("2020-01-01","2020-02-01"))`;

    const result = stringify({
      user: { name: "John", age: 42 },
      meta: { created: "2020-01-01", updated: "2020-02-01" },
    });

    assert.strictEqual(result, expected);
  });

  it("stringifies arrays of instances", () => {
    const expected = `$A name,age
[A("John Doe",42),A("Jane Doe",43)]`;

    const result = stringify([
      { name: "John Doe", age: 42 },
      { name: "Jane Doe", age: 43 },
    ]);

    assert.strictEqual(result, expected);
  });

  it("handles keys with hyphens", () => {
    const expected = `$A Content-Type,Content-Length
A("application/json",123)`;

    const result = stringify({
      "Content-Type": "application/json",
      "Content-Length": 123,
    });

    assert.strictEqual(result, expected);
  });

  it("throws on circular references", () => {
    const x: any = {};
    x.self = x;

    assert.throws(() => stringify(x), /Circular reference/);
  });

  it("omits undefined keys", () => {
    const result = stringify({ name: "John Doe", age: undefined });
    assert.strictEqual(result, `$A name\nA("John Doe")`);

    const result2 = stringify({ name: undefined });
    assert.strictEqual(result2, `$A \nA()`);
  });
});
