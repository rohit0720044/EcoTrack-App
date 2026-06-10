const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const html = read("index.html");
const js = read("script.js");
const packageJson = JSON.parse(read("package.json"));

const forbiddenPatterns = [
  ["eval usage", /\beval\s*\(/],
  ["Function constructor", /new\s+Function\s*\(/],
  ["document.write", /document\.write\s*\(/],
  ["unsafe innerHTML", /\.innerHTML\s*=/],
  ["inline event handlers", /\son[a-z]+\s*=/i],
  ["external scripts", /<script[^>]+src=["']https?:\/\//i],
  ["external stylesheets", /<link[^>]+href=["']https?:\/\//i]
];

for (const [name, pattern] of forbiddenPatterns) {
  assert.equal(pattern.test(`${html}\n${js}`), false, `Security issue found: ${name}`);
}

assert.match(html, /Content-Security-Policy/);
assert.match(html, /default-src 'self'/);
assert.match(html, /script-src 'self'/);
assert.match(html, /connect-src 'none'/);
assert.match(html, /object-src 'none'/);
assert.match(html, /form-action 'none'/);
assert.match(html, /name="referrer" content="no-referrer"/);

assert.equal(packageJson.private, true, "Project package should be private");
assert.equal(Object.prototype.hasOwnProperty.call(packageJson, "dependencies"), false, "No runtime dependencies should be required");

console.log("Security hardening tests passed");
