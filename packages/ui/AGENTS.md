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
├── components/           # UI components
│   ├── button.tsx
│   └── ...
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
3. If no: Create in `src/components/` following existing patterns

### Using in Other Packages

```tsx
import { Button } from '@hitel/ui/components/button';
```

## CSS (`.css`)

- we have a global stylesheet (`src/styles/globals.css`) with Tailwind base
- use `Tailwind` classes when possible
- when editing `root` update `:dark` also if needed
