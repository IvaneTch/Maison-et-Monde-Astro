import { defineConfig } from 'astro/config';

// Configuration réservée à GitHub Pages. La configuration SSR reste inchangée.
export default defineConfig({
  site: 'https://ivanetch.github.io',
  base: '/Maison-et-Monde-Astro',
  srcDir: './.demo/src',
  outDir: './dist-demo',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
