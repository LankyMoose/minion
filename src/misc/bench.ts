import MINION from "../index.js";

/**
 * On my PC, I get fairly uniform results like this:
minion:parse: 0.0034393200000000165ms
json:parse: 0.0005815600000000387ms
minion:stringify: 0.0010825399999999832ms
json:stringify: 0.0001733800000000315ms
 * Notably slower than JSON.stringify 😭
 */

const TEST_OBJECT = {
  "Content-Type": "application/json",
  "Content-Length": 123,
};
const minionStr = MINION.stringify(TEST_OBJECT);
const jsonStr = JSON.stringify(TEST_OBJECT);

const ITERATONS = 10e3;

const benchmarks: [string, () => void][] = [
  ["minion:parse", () => MINION.parse(minionStr)],
  ["json:parse", () => JSON.parse(jsonStr)],
  ["minion:stringify", () => MINION.stringify(TEST_OBJECT)],
  ["json:stringify", () => JSON.stringify(TEST_OBJECT)],
];

for (const [label, callback] of benchmarks) {
  bench(ITERATONS, label, callback);
}

function bench(iterations: number, label: string, callback: () => void) {
  const durations: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    callback();
    durations.push(performance.now() - start);
  }

  const average = durations.reduce((a, b) => a + b, 0) / durations.length;
  console.log(`${label}: ${average}ms`);
}
