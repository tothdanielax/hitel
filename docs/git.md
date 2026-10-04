# Git

## Workflow

- Every change goes through a pull request, direct pushes to `main` are forbidden
- Never push, force push or open/update a pull request without explicit permission
- Merged pull requests deploy `main` to GitHub Pages

## Semantic Commits

- Use `type: summary` with a lowercase imperative summary (e.g. `feat: add gov loan constants`)
- Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `perf`
- Keep one concern per commit, split unrelated changes

## Branches

- Use `<type>/<short-description>` in kebab-case (e.g. `feature/calculator`, `fix/jtm-limit`)

## Pull Requests

- Title follows the semantic commit format (`feat: add loan combination planner`)
- Description says what changed, why, and any important decision
