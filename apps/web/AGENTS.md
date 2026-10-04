# @hitel/web

Frontend package

## Tech Stack

- TanStack Start + TanStack Router (file based routes in `src/routes/`)
- React (v19 with React Compiler)
- Vite (v8, see `./vite.config.ts`)
- Tailwind CSS (v4)
- Shadcn (v4, see `./components.json`)

## Structure

```bash
apps/web/src/
├── routes/                    # File based routes, thin: import a module and render it
├── modules/                   # Feature modules, one per route
│   └── <module>/
│       ├── index.tsx          # Module entry point
│       ├── components/        # Module-only components
│       ├── hooks/             # Module-only hooks
├── components/                # Shared cross-module components
├── hooks/                     # Shared hooks
├── constants.ts               # App (UI) constants, business constants live in @hitel/core
└── router.tsx                 # Router factory
```

## Conventions

- `routeTree.gen.ts` is generated, don't edit it
- `dev` script calls the local `vp` binary: the global one loads its own Vite copy and TanStack Start returns 404 (vite-plus issue #1391)
- Modules CANNOT import from other modules. Shared code → `src/{folder}/` or `@hitel/ui`
- No business rules or helpers in this package: rules and utils (formatters, validators) live in `@hitel/core`
- Use `@hitel/ui` for base components (e.g. `Button`, `Card`)
