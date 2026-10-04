# Workspace

## Protocol

- Use `bun workspace` and `catalog:` protocol in `package.json` to use same version deps across packages
- Use `workspace:` protocol in `package.json` for cross-package imports (e.g. `@hitel/ui: workspace:*`)

## Extra

- Don't version packages
- Use `shortest` path imports
- Use `vp` always for managing dependencies
- Use `snake_case`-d, colon-delimited names for script names (e.g. `ui:add`)
- Add `AGENTS.md` and a `package.json` with a `@hitel/` prefix when creating a new package
