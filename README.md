# hitel

Hungarian home loan calculator combining government supported and bank loans <https://tothdanielax.github.io/hitel/>

## Usage

1. Fill in the household, the property and the finances
2. The best legal combination of government supported loans (Otthon Start, CSOK Plusz, Falusi CSOK, Babaváró) and bank loans shows up on the right, with monthly installments and a timeline
3. Share it: every input is part of the URL

Bank rates are hand-updated defaults (no bank has a public API), edit them under Banki ajánlatok. The result is an estimate, not an offer.

## How it works

- `packages/core`: pure TypeScript rules and math. Eligibility per program, a month-by-month repayment simulation, and a planner that tries every legal loan combination and ranks them by present value cost. Rules and their legal sources: `docs/gov-loans.md`
- `apps/web`: TanStack Start form, prerendered to static HTML for GitHub Pages
- `packages/ui`: shadcn components

## Development

```bash
mise install
vp install
vpr dev
```

See `AGENTS.md` for structure and conventions.
