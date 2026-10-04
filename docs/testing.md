# Testing

## Scope

- Test business logic in `packages/core` (calculators, eligibility, combination rules, bank response parsing)
- Don't unit test straightforward functions, one-line wrappers, type mappers or simple transforms
- Don't test UI components unless they hold logic that can't live in `packages/core`

## Requirements

- Test positive and negative paths (ineligible applicant, illegal combination, missing data)
- Test edge cases: zero, boundary values (e.g. exactly at an age or amount limit), empty inputs
- Assert observable behavior only (input to output), never internal helpers or call order
- Use explicit assertions, no snapshot tests
- Mock the clock with `vi.setSystemTime(...)` when logic depends on today (deadlines, ages), reset with `vi.useRealTimers()`
- Mock `fetch` in bank API tests, never hit real endpoints

## Style

- One behavior per `it` block, no shared mutable state
- Group `describe` blocks by the unit under test
- Put test files next to the logic (`schedule.ts` and `schedule.test.ts`)
- Import test helpers from `vite-plus/test`
