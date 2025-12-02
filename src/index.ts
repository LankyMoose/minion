import { parse } from "./parse.js";
import { stringify } from "./stringify.js";

export const MINION = {
  /**
   * Converts a MINION string to a JavaScript object or array.
   *
   * Objects:
   * ```
   * MINION.parse(`$User name,age\nUser("John Doe",42)`);
   * // => { name: "John Doe", age: 42 }
   * ```
   * Arrays:
   * ```
   * MINION.parse(`$User name,age\n[User("John Doe",42),User("Jane Doe",43)]`);
   * // => [{ name: "John Doe", age: 42 }, { name: "Jane Doe", age: 43 }]
   * ```
   */
  parse,
  /**
   * Converts a value to a MINION string.
   *
   * Objects:
   * ```
   * MINION.stringify({ name: "John Doe", age: 42 });
   * // => `$User name,age\nUser("John Doe",42)`
   * ```
   * Arrays:
   * ```
   * MINION.stringify([ { name: "John Doe", age: 42 }, { name: "Jane Doe", age: 43 } ]);
   * // => `$User name,age\n[User("John Doe",42),User("Jane Doe",43)]`
   * ```
   */
  stringify,
};
export default MINION;
