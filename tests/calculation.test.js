const assert = require("node:assert/strict");
const {
  calculateFootprint,
  normalizeState,
  defaultState,
  numericLimits
} = require("../script.js");

function near(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);
}

const baseline = calculateFootprint(defaultState);
near(baseline.transport, 99.7632);
near(baseline.electricity, 129.6);
near(baseline.food, 220);
near(baseline.shopping, 111.7448);
near(baseline.travel, 0);
near(baseline.total, 561.108);

const lowImpact = calculateFootprint({
  ...defaultState,
  transportMode: "cycle",
  distance: 120,
  electricity: 90,
  diet: "vegan",
  shopping: "low",
  waste: 2,
  flights: 0
});
assert.ok(lowImpact.total < baseline.total, "Low-impact choices should reduce total footprint");

const highImpact = calculateFootprint({
  ...defaultState,
  transportMode: "car",
  distance: 600,
  electricity: 900,
  diet: "meatHeavy",
  shopping: "high",
  waste: 40,
  flights: 8
});
assert.ok(highImpact.total > baseline.total, "High-impact choices should increase total footprint");

const normalized = normalizeState({
  transportMode: "<script>",
  diet: "bad-value",
  shopping: "bad-value",
  distance: 999999,
  electricity: -100,
  waste: "not a number",
  flights: 999999,
  goal: 999,
  completed: ["transit", "<img>"]
});

assert.equal(normalized.transportMode, defaultState.transportMode);
assert.equal(normalized.diet, defaultState.diet);
assert.equal(normalized.shopping, defaultState.shopping);
assert.equal(normalized.distance, numericLimits.distance);
assert.equal(normalized.electricity, 0);
assert.equal(normalized.waste, 0);
assert.equal(normalized.flights, numericLimits.flights);
assert.equal(normalized.goal, 40);
assert.deepEqual(normalized.completed, ["transit"]);

for (let index = 0; index < 500; index += 1) {
  const randomState = {
    transportMode: index % 2 === 0 ? "car" : "unknown",
    distance: index * 37 - 500,
    electricity: index * 91,
    diet: index % 3 === 0 ? "vegan" : "<bad>",
    shopping: index % 5 === 0 ? "high" : "invalid",
    waste: index * 4 - 20,
    flights: index * 2,
    goal: index,
    completed: ["transit", "invalid", "cycle"]
  };
  const result = calculateFootprint(randomState);
  const safe = normalizeState(randomState);

  assert.ok(Number.isFinite(result.total), "Fuzz result should always be finite");
  assert.ok(result.total >= 0, "Fuzz result should never be negative");
  assert.ok(safe.distance <= numericLimits.distance, "Distance should be capped");
  assert.ok(safe.electricity <= numericLimits.electricity, "Electricity should be capped");
  assert.ok(safe.waste <= numericLimits.waste, "Waste should be capped");
  assert.ok(safe.flights <= numericLimits.flights, "Flights should be capped");
  assert.deepEqual(safe.completed, ["transit", "cycle"], "Only known challenge IDs should remain");
}

console.log("Calculation and input-normalization tests passed");
