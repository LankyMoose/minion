import { describe, it } from "node:test";
import assert from "node:assert";

import { parse } from "./parse.js";

describe("parse", () => {
  it("parses lists of instances", () => {
    const expected = [
      { name: "John Doe", age: 42 },
      { name: "Jane Doe", age: 43 },
    ];
    const result = parse(
      `$User name,age\n[User("John Doe",42),User("Jane Doe",43)]`
    );

    assert.deepStrictEqual(result, expected);
  });
  it("parses instances", () => {
    const expected = { name: "John Doe", age: 42 };
    const result = parse(`$User name,age\nUser("John Doe",42)`);

    assert.deepStrictEqual(result, expected);
  });
});
