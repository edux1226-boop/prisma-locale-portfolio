import { defineConfig } from 'astro/config';

// Sito statico. Nessuno script inline, nessuna source map pubblica: la CSP resta rigorosa.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://www.grillburger.it',
  base: process.env.BASE_PATH ?? '/',
  output: 'static',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'always', format: 'directory' },
  devToolbar: { enabled: false },
  vite: {
    build: { assetsInlineLimit: 0, sourcemap: false, cssCodeSplit: false },
  },
});
