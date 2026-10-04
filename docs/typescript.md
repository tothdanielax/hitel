# TypeScript

## Principles

- Don't export and share code if not used elsewhere (not even for testing)
- Don't add unnecessary comments, prefer self-documenting code
- Don't do premature optimizations, prefer code readability
- Don't repeat yourself, prefer code reuse
- Don't over-abstact, prefer code clarity
- Use constants over magic numbers, prefer code clarity (`const MY_SPECIFIC_RATE = 0.4`)
- Prefer code locality
- Follow ponytail guidelines

## Export/Import

- Use named imports over default ones (`import { useState } from 'react'`)
- Use named exports over `default` ones (`export const MyComponent = () => {}`)
- Use explicit returns over implicit ones (`const myFunction = (): number => { return 1 }`)
- Avoid importing with aliases (`import { useState as useMyState } from 'react'`)

## Type

- Use `type` over `interface` for type syntax (`type MyType = {}`)
- Use `unknown` over `any` as last resort

## Casing

- Use `PascalCase` for type casing
- Use `SCREAMING_SNAKE_CASE` for enum casing
- Use `PascalCase` for component names (`MyComponent`)
- Use kebab-case for file names (e.g. `my-file.ts`)

## Syntax

- Use `const` objects with `as const` annotation over `enum` (`const MY_ENUM = { MY_VALUE: 'MY_VALUE' } as const`)
- Use functional `React` over classes (`const MyComponent = () => {}`)
- Use arrow functions over function declarations

## Extra

- Don't create `.d.ts` files, define types in `.ts` files only
- Match the exported function's name when creating a new file (`const MyComponent = () => {}`, `my-component.tsx`)
- Import constants from closest `constants.ts` file (`import { MY_SPECIFIC_RATE } from './constants'`)

## Code Quality

- Don't leave logs in the code (`console.log`)
- Don't leave debug statements in the code (`debugger`)
- Inline code if not used elsewhere
- Don't create empty files
- Don't create empty namespaces
- Use self explaining variable names
- Calculate complex stuff on backend
- Enum key-values must match
- Move non-exported functions to the end of the namespace or file

## Comments

- Comments explain why, never what. Two lines maximum
- Default to no comment, write one only for a non-obvious constraint or a rule from outside the repo (e.g. a law or a bank's API quirk)

## Copy

- No em dashes (use `-`), simple quotes only (`'` / `"`)
- User-facing copy is Hungarian, code and docs are English
