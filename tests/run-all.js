const tests = [
  "static-quality.test.js",
  "security.test.js",
  "calculation.test.js"
];

for (const file of tests) {
  require(`./${file}`);
}

console.log(`All EcoTrack tests passed: ${tests.length}/${tests.length} suites`);
