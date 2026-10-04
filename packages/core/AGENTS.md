# @hitel/core

Business logic package: pure TypeScript, no React, no DOM.

## Structure

```bash
packages/core/src/
├── constants.ts        # All gov loan rules and numbers (config driven, source: docs/gov-loans.md)
├── banks/              # One file per bank (e.g. `kh.ts`), REST API or static fallback
└── *.ts                # Calculators (annuity, schedule, eligibility, combinations)
```

## Rules

- Every number with a legal or market source goes to `constants.ts`, with the source next to it
- Bank integrations use documented REST APIs only, never web scraping. If a bank has no public API, its file says so and exports static fallback data
- Business logic must have tests (see `docs/testing.md`)

## Using in Other Packages

```ts
import { GOV_LOANS } from '@hitel/core/constants';
```
