# @hitel/core

Business logic package: pure TypeScript, no React, no DOM.

## Structure

```bash
packages/core/src/
├── constants.ts        # All gov loan rules and numbers (config driven, source: docs/gov-loans.md)
├── settings.ts         # User-editable market assumptions and bank offers, with defaults
├── banks/              # One file per bank (e.g. `kh.ts`), REST API or static fallback
├── utils/              # Shared helpers for core and web: currency, date, math (incl. percent and range validation)
├── eligibility.ts      # Per-program eligibility with reasons, input normalization
├── schedule.ts         # Month-by-month repayment simulation, present value
└── plan.ts             # Picks the cheapest legal loan combination
```

## Rules

- Every number with a legal or market source goes to `constants.ts`, with the source next to it
- Bank integrations use documented REST APIs only, never web scraping. If a bank has no public API, its file says so and exports static fallback data
- Business logic must have tests (see `docs/testing.md`)
- All helpers (also the web app's formatters and validators) go to `utils/<topic>.ts`, named numbers and patterns go to `constants.ts`
- Anything the user may want to override (rates, yields, offers) belongs in `settings.ts` with a default

## Planner (`plan.ts`)

- Candidates: every order of every legal set of subsidized loans, own funds first or last (`settings.keepOwnFunds`), and CSOK Plusz at its max or at the smallest amount that still absorbs all of its forgiveness
- Filling: two needs (purchase, renovation), each loan only covers what `LOAN_PURPOSES` allows, mortgages share the LTV room, the bank loan comes last
- Ranking: covers the price, then fits the JTM limit, then the lowest cost = present value of the repayments (at the bond yield) minus the cash kept
- Only corner candidates are priced; an optimum inside (e.g. borrowing exactly up to the JTM limit) is not searched

## Using in Other Packages

```ts
import { buildPlan } from '@hitel/core/plan';
```
