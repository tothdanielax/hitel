# React

## HTML

- Use semantic `HTML` tags where appropriate (`header`, `nav`, `main`, `section`, `article`, `aside`, `footer`)
- Use `div` or `span` wrappers only if they have a function and if the parent/children styling can't solve it
- Use interactive components (`Button`) for user interaction over non-interactive ones (`div` with `onClick`)

## Styling

- Use colors in the following order: 1. `globals.css` -> 2. `Tailwind` colors (`bg-gray-200`) -> 3. hex (`#f7fafc`)
- Use `flex` classes over `grid` ones for one-dimensional layouts
- Use `Tailwind` classes over inline styles
- Use `cn()` helper from `@hitel/ui/lib/utils` for conditional `className`-s (`cn(isActive ? 'flex' : 'hidden')`)
- Group classes by functionality with `cn()` helper (`flex` classes in one row) when defining 10+ classes
- Avoid `absolute` positioning
- Use the least amount of `className`-s possible

## Syntax

- Use `:Props` over `FC` generics (`export const MyComponent = ({ prop1, prop2 }: Props) => {}`)
- Use `Props` naming over `{ComponentName}Props` if not exported (`type Props = { prop1: string; prop2: number }`)
- Use `React` v19 features (`useContext` -> `use`, `forwardRef` -> `ref`), don't use `memo`, `useMemo`, `useCallback`
- `React` internal order: 1. `useState` → 2. `useRef` → 3. hooks → 4. `useEffect` -> 5. other
- Use the simplest state management possible (`useState` -> `useContext` -> `useReducer`)
- Use `Heading` and `Paragraph` components from `@hitel/ui/components/typography` for typography instead of custom styles
- Don't use `use client` or server components
- Don't export `Props` if not used elsewhere
- Don't use `useEffect` if not necessary
