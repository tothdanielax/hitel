import { defineConfig } from 'vite-plus';

export default defineConfig({
  run: {
    cache: true,
    enablePrePostScripts: true
  },

  lint: {
    ignorePatterns: ['**/routeTree.gen.ts'],
    options: {
      typeAware: true,
      typeCheck: true
    }
  },

  fmt: {
    // Agent skills are vendored as published, so updates stay clean diffs.
    ignorePatterns: ['**/routeTree.gen.ts', '.claude/skills/**'],
    trailingComma: 'none',
    singleQuote: true,
    jsxSingleQuote: true,
    sortTailwindcss: true
  },

  test: {
    include: ['**/*.test.{ts,tsx}'],
    passWithNoTests: true
  },

  staged: {
    '*': 'vp check --fix',
    '*.{js,jsx,ts,tsx}': () => 'vp run typecheck'
  }
});
