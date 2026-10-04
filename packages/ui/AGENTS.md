# @hitel/ui

Shared UI component library

## Tech Stack

- React (v19)
- Tailwind CSS (v4), see `./src/styles/global.css`
- Shadcn (v4, see `./components.json`)
- BaseUI (v1)
- `cn` (shadcn class merger, replaces clsx + tailwind-merge)

## Structure

```bash
packages/ui/src/
├── components/           # shadcn components
│   ├── button.tsx
│   ├── ...
│   └── reui/             # ReUI registry components (badge, frame, number-field, timeline)
└── styles/
    └── globals.css       # `Tailwind` base
```

## Quick Reference

- Add component: `src/components/<name>.tsx`
- Modify styles: `src/styles/globals.css`

## Conventions

### Adding Components

1. Check if shadcn has the component you need
2. If yes: `vp run ui:add <component>` (run from root)
3. If not, check ReUI (`.claude/skills/reui`): `vp run ui:add @reui/<component>`
4. If neither: Create in `src/components/` following existing patterns

Generic controls come from shadcn; ReUI only where it adds something (rich badge variants, frame, number field, timeline). The Calendar defaults to the Hungarian locale.

### Using in Other Packages

```tsx
import { Button } from '@hitel/ui/components/button';
```

See [css](../../docs/css.md) for stylesheet conventions.
