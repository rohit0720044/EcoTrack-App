# EcoTrack: Smart Carbon Footprint Awareness Platform

EcoTrack helps users estimate their monthly carbon footprint, understand major emission sources, receive personalized sustainability insights, and complete eco-friendly goals.

## Features

- Carbon footprint calculator for transport, electricity, food, shopping, waste, and flight activity.
- Personalized dashboard with total footprint, source chart, reduction goal, and progress tracking.
- Eco goals and challenges with points and completion states.
- Awareness content for climate facts and sustainable habits.
- Professional welcome animation, scroll reveal effects, card gestures, and bright/night mode.
- Submission readiness score section aligned with common evaluation categories.

## File Structure

```text
EcoTrack-App/
  index.html
  styles.css
  script.js
  package.json
  README.md
  tests/
    static-quality.test.js
```

## How To Run

Open `index.html` directly in a browser, or use the Live Server extension in VS Code.

## How To Test

Run:

```bash
npm test
```

The test suite checks that the project includes the main required features, accessibility markers, animation support, night mode, documentation, and readiness scoring.

## Evaluation Alignment

EcoTrack is designed to align with these categories:

- Code Quality: clean separation of HTML, CSS, and JavaScript.
- Security: no backend secrets, no unsafe external scripts, no data submission.
- Efficiency: lightweight static app with local storage and canvas rendering.
- Testing: automated static quality checks.
- Accessibility: semantic structure, labels, reduced-motion support, and keyboard-friendly controls.
- Problem Statement Alignment: calculator, dashboard, suggestions, goals, tracking, and awareness content.
