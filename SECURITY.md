# Security Policy

EcoTrack is a static client-side app. It does not collect passwords, payments, API keys, private tokens, or server-side credentials.

## Security Controls

- Content Security Policy limits scripts, styles, objects, forms, and network connections.
- Referrer policy is set to `no-referrer`.
- No third-party scripts, trackers, analytics, fonts, or external stylesheets are loaded.
- User data stays in browser `localStorage`; there is no remote submission.
- Dynamic UI cards are rendered with `createElement`, `textContent`, and `replaceChildren` instead of unsafe HTML injection.
- Numeric inputs are normalized and capped before calculation.
- Select values are validated against known allowed values.
- Stored challenge IDs are filtered against known challenge definitions.

## Testing

Run:

```bash
npm test
```

The test suite includes:

- Static feature and accessibility checks.
- Security checks for unsafe JavaScript patterns and external resources.
- Calculator logic tests.
- Input normalization and fuzz-style invalid input tests.

## Reporting Issues

For a classroom or demo submission, report issues directly to the project maintainer before sharing the app publicly.
