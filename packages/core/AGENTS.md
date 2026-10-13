# @hitel/core

Business logic package: pure TypeScript, no React, no DOM.

## Structure

```bash
packages/core/src/
├── constants.ts        # Every gov loan rule number, with its legal basis
├── settings.ts         # User-editable market assumptions and bank offers, with defaults
├── banks/              # One file per bank (e.g. `kh.ts`), hand-maintained rates
├── utils/              # Shared helpers for core and web: currency, date, math (incl. percent and range validation)
├── eligibility.ts      # Per-program eligibility with reasons, input normalization
├── schedule.ts         # Month-by-month repayment simulation, present value
└── plan.ts             # Picks the cheapest legal loan combination
```

## Rules

- Domain research lives in `docs/gov-loans.md` (facts only). Every number the code uses lives in `constants.ts` with its source, never duplicated in the doc
- Bank files hold hand-maintained rates with `asOf` and a source URL, refreshed from the bank's hirdetmény. No bank has a public mortgage API and scraping is out
- Business logic must have tests (see `docs/testing.md`)
- All helpers (also the web app's formatters and validators) go to `utils/<topic>.ts`, named numbers and patterns go to `constants.ts`
- Anything the user may want to override (rates, yields, offers) belongs in `settings.ts` with a default

## Planner (`plan.ts`)

- Candidates: every order of every legal set of subsidized loans, own funds all up front or (with `settings.keepOwnFunds`) loans first with only as much own funds up front as the JTM limit needs (binary search), and CSOK Plusz at its max or at the smallest amount that still absorbs all of its forgiveness
- Filling: two needs (purchase, renovation), each loan only covers what `LOAN_PURPOSES` allows, mortgages share the LTV room, the bank loan comes last
- Down payment: mortgages stay within the LTV share of the price; the rest is own funds, grants and (with `settings.babavaroAsDownPayment`, bank-dependent) Babaváró. Without it the down payment is paid from own funds first, a gap is a shortfall
- Planned wedding (`input.plannedMarriageMonth`, unmarried only): existing loans cannot be refinanced into Otthon Start or CSOK Plusz (purchase only). The outlook prices a Babaváró taken after the wedding (prepay the dearest loan above the bond yield, 1% fee, or invest) and the same purchase made after the wedding (price grows with inflation, own funds with the bond yield, rent not included)
- `input.excludedPrograms` rules programs out (already used once, or not wanted)
- Bank offer: the enabled market offer with the lowest present value (a short fixation reprices to `settings.repriceRate`), not the lowest headline rate
- Stamp duty exemption counts only programs actually disbursed. CSOK Plusz below `CSOK_PLUSZ.minAmount` is never planned
- CSOK Plusz in the plan disables jelzáloghitel-elengedés (same child cannot get both, ?)
- Ranking: covers the price, then fits the JTM limit, then the lowest cost = present value of the repayments (at the bond yield) plus stamp duty minus the cash kept

## Simplifications

Deliberate: each needs an input too specific for the app, or is a small effect.

- Not modeled: the 180 day employment rule, price versus bank valuation, the 1 year TB for self-employed, the Falusi CSOK modernization-only grant, building plots, the exact preferált kistelepülés list (VILLAGE stands for it), existing debts of the household
- Babaváró without a child in 5 years: the penalty charge uses alapkamat + 3 pp (never the subsidy received), children born later keep their pause and forgiveness
- CSOK Plusz pause: unpaid interest is added to the principal (the decree keeps it apart and repays it yearly)
- CSOK Plusz minimum: OTP's 500k, the lowest bank minimum (the decree sets none)
- Home swap: the sold home is assumed sold within the window, the young first-home relief uses the wife's age for the whole purchase
- Green home: the loan limits apply, the lower green rates are left to the bank offers

## Using in Other Packages

```ts
import { buildPlan } from '@hitel/core/plan';
```
