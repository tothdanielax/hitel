# @hitel/core

Business logic package: pure TypeScript, no React, no DOM.

## Structure

```bash
packages/core/src/
├── constants.ts        # All gov loan rules and numbers (config driven, source: docs/gov-loans.md)
├── settings.ts         # User-editable market assumptions and bank offers, with defaults
├── banks/              # One file per bank (e.g. `kh.ts`), REST API or static fallback
├── utils/              # Generic helpers: `math.ts`, `formatters.ts`
├── eligibility.ts      # Per-program eligibility with reasons, input normalization
├── schedule.ts         # Month-by-month repayment simulation, present value
├── plan.ts             # Picks the cheapest legal loan combination
└── months.ts           # ISO month arithmetic
```

## Rules

- Every number with a legal or market source goes to `constants.ts`, with the source next to it
- Bank integrations use documented REST APIs only, never web scraping. If a bank has no public API, its file says so and exports static fallback data
- Business logic must have tests (see `docs/testing.md`)
- Generic helpers go to `utils/`, named numbers and patterns go to `constants.ts`
- Anything the user may want to override (rates, yields, offers) belongs in `settings.ts` with a default

## Using in Other Packages

```ts
import { buildPlan } from '@hitel/core/plan';
```
