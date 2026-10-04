# AI Agent Guidelines for hitel

This document helps AI coding assistants work on the **hitel** repository.
CLAUDE.md points here for compatibility.

## Project Overview

**hitel** is a static Hungarian home loan (lakáshitel) calculator. It combines government supported loans (Otthon Start, CSOK Plusz, Falusi CSOK, Babaváró, etc.) with bank loans, checks whether a combination is legal, and shows monthly installments and a timeline.

### Tech Stack

- TypeScript: language
- TanStack Start (React 19): framework, prerendered to static HTML (see `apps/web/vite.config.ts`)
- Vite+ / Vite Plus (see `vite.config.ts`)
  - oxfmt: formatting
  - oxlint: linting
  - tsgolint: type checking
  - vitest: testing (`vp test`)
- Tailwind CSS (v4) + shadcn (v4, BaseUI)
- bun (workspaces in root `package.json`): package manager
- mise: environment management
- GitHub Pages: hosting (see `.github/workflows/`)

## Quick Reference

- Web app: `apps/web/` (see `apps/web/AGENTS.md`)
- Business logic: `packages/core/` (see `packages/core/AGENTS.md`)
- UI package: `packages/ui/` (see `packages/ui/AGENTS.md`)
- Government loan research: `docs/gov-loans.md`
- Conventions: see `docs/`
- Agent skills: `.claude/skills/` (shadcn from github.com/shadcn-ui/ui `skills/shadcn`, ReUI from mcp.reui.io), vendored as published, update by re-downloading

## Layers

- `packages/core`: pure TypeScript, no React, no DOM. All rules, numbers and calculations live here
- `packages/ui`: generic shadcn components, no business logic
- `apps/web`: routes, forms and presentation. Calls `packages/core`, never re-implements rules

## Rendering Mode

`tanstackStart()` in `apps/web/vite.config.ts` controls it:

- `prerender: { enabled: true }`: SSG (current, GitHub Pages)
- `spa: { enabled: true }`: SPA
- neither: SSR (needs a server host)

## Commands

vp has built-in toolchain commands and a separate task runner:

```bash
vp install       # Install dependencies, add `-w` for workspace and `-d` for dev dependencies
vp check --fix   # Lint and format (oxfmt, oxlint, tsgolint)
vp test          # Run tests
vp staged        # Run check against staged files

vp run build     # Run a package.json script or configured run task
vpr build        # Shorthand for vp run build
vpr dev          # Start development server (might already be running)
vpr typecheck    # TypeScript check
vpr clean        # Clean up repo from node_modules, purge cache and etc.
vpr ui:add       # Add new shadcn component to @hitel/ui package
```

Important distinctions:

- vp test is a built-in command. vp run test runs a package.json script or vite.config.ts run task named test.
- A task name can come from package.json or vite.config.ts, but not both.

## Conventions and standards

Follow the conventions defined in `docs/[convention].md` files, if not asked otherwise.

- Workspace
  - Changes to: `package.json`, `vite.config.ts`, other general configuration
  - Reference: [workspace](docs/workspace.md)
- TypeScript
  - Changes to: `.ts`, `.tsx`, `.js`, `.jsx`
  - Reference: [typescript](docs/typescript.md)
- TSX/React
  - Changes to: `.tsx`
  - Reference: [react](docs/react.md)
- Testing
  - Changes to: `.test.ts`, `packages/core`
  - Reference: [testing](docs/testing.md)
- CSS
  - Changes to: `.css`
  - Reference: [css](docs/css.md)
- Markdown
  - Changes to: `.md`
  - Reference: [markdown](docs/markdown.md)
- Git
  - Changes to: commits, branches, pull requests
  - Reference: [git](docs/git.md)
