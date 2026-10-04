import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { defineConfig } from 'vite-plus';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';

// Rendering mode lives here: `prerender` = SSG, `spa` = SPA, neither = SSR.
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/hitel/' : '/',

  plugins: [
    tanstackStart({
      prerender: { enabled: true }
    }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss()
  ],

  // Prerendered HTML and the first client render must agree on the default start month.
  define: {
    'import.meta.env.VITE_BUILD_MONTH': JSON.stringify(new Date().toISOString().slice(0, 7))
  },

  resolve: {
    tsconfigPaths: true
  }
});
