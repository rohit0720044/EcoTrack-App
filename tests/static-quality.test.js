const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const html = read("index.html");
const css = read("styles.css");
const js = read("script.js");
const readme = read("README.md");
const security = read("SECURITY.md");

const checks = [
  ["calculator section", html.includes('id="calculator"')],
  ["dashboard section", html.includes('id="dashboard"')],
  ["goals section", html.includes('id="goals"')],
  ["awareness section", html.includes('id="learn"')],
  ["welcome intro", html.includes("Welcome to EcoTrack") && css.includes(".intro-screen")],
  ["bright/night mode", html.includes("themeToggle") && js.includes("applyTheme") && css.includes("body.night")],
  ["personalized insights", js.includes("renderInsights")],
  ["progress tracking", js.includes("progressBar") && js.includes("completedPoints")],
  ["local storage", js.includes("localStorage")],
  ["animations", css.includes("@keyframes") && css.includes("reveal-panel")],
  ["gesture interactions", js.includes("setupTiltGestures") && js.includes("setupRipples")],
  ["accessibility labels", html.includes("aria-label") && css.includes("prefers-reduced-motion")],
  ["responsive design", css.includes("@media (max-width: 680px)")],
  ["security headers", html.includes("Content-Security-Policy") && html.includes("connect-src 'none'")],
  ["safe DOM rendering", js.includes("replaceChildren") && js.includes("textContent")],
  ["input normalization", js.includes("normalizeState") && js.includes("numericLimits")],
  ["documentation", readme.includes("How To Run") && readme.includes("How To Test")],
  ["security documentation", security.includes("Content Security Policy") && security.includes("localStorage")]
];

for (const [name, passed] of checks) {
  assert.equal(passed, true, `Missing required quality check: ${name}`);
}

console.log(`EcoTrack quality checks passed: ${checks.length}/${checks.length}`);
