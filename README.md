# EcoTrack: Smart Carbon Footprint Awareness Platform

EcoTrack helps users estimate their monthly carbon footprint, understand major emission sources, receive personalized sustainability insights, and complete eco-friendly goals.

## Features

- Carbon footprint calculator for transport, electricity, food, shopping, waste, and flight activity.
- Personalized dashboard with total footprint, source chart, reduction goal, and progress tracking.
- Eco goals and challenges with points and completion states.
- Awareness content for climate facts and sustainable habits.
- Professional welcome animation, scroll reveal effects, card gestures, and bright/night mode.
- Security hardening with Content Security Policy, referrer protection, safe DOM rendering, and input normalization.
- Automated quality, security, and calculator logic tests.

## File Structure

```text
EcoTrack-App/
  index.html
  styles.css
  script.js
  package.json
  README.md
  SECURITY.md
  tests/
    static-quality.test.js
    security.test.js
    calculation.test.js
    run-all.js
```

## How To Run

Open `index.html` directly in a browser, or use the Live Server extension in VS Code.

## How To Test

Run:

```bash
npm test
```

The test suite runs multiple checks:

- Static quality checks for required project features.
- Security checks for CSP, unsafe JavaScript patterns, external scripts, and unsafe DOM rendering.
- Calculation tests for baseline, low-impact, high-impact, and invalid input scenarios.

## Project Quality Alignment

EcoTrack is designed to align with these categories:

- Code Quality: clean separation of HTML, CSS, and JavaScript.
- Security: CSP, no backend secrets, no unsafe external scripts, no data submission, safe DOM updates, and normalized inputs.
- Efficiency: lightweight static app with local storage and canvas rendering.
- Testing: automated quality, security, and calculator logic checks.
- Accessibility: semantic structure, labels, reduced-motion support, and keyboard-friendly controls.
- Problem Statement Alignment: calculator, dashboard, suggestions, goals, tracking, and awareness content.
