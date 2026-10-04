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
    ignorePatterns: ['**/routeTree.gen.ts'],
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
