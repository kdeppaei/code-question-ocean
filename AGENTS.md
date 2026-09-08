# CodeDive project instructions

## Question-bank growth

- Every user-visible site update must add a large problem batch: at least 100 new problems in total and at least 20 for each of C, C++, Python, SQL, and GDB.
- Preserve all published problem IDs and slugs so saved progress and links remain valid.
- Every new problem must include a reference solution, explanation, hints, constraints, and a visible “show solution” path.
- C, C++, Python, and SQL additions must have sandbox judge definitions and hidden cases. GDB additions must have guided structural checks.
- Update the exact expectations in `scripts/verify-judge-coverage.ts`, then run `pnpm run verify:coverage`, type checking, and the production build before publishing.
