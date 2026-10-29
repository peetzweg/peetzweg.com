import mdx from '@mdx-js/rollup';
import netlify from '@netlify/vite-plugin-tanstack-start';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';

export default defineConfig({
  server: {
    // Lets the dev server be opened from other devices through `tailscale serve`.
    allowedHosts: ['.ts.net'],
  },
  plugins: [
    mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
      providerImportSource: '@mdx-js/react',
    }),
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true,
      },
    }),
    react(),
    // Netlify's local edge-function server needs a matching Deno and crashes dev; the site has no edge functions.
    netlify({ dev: { edgeFunctions: { enabled: false } } }),
  ],
});
