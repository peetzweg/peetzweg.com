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
  ssr: {
    // react-tweet ships CSS modules, which Node can't import; bundle it so Vite handles them.
    noExternal: ['react-tweet'],
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
      // Not linked from any page, so the crawler wouldn't find it.
      pages: [{ path: '/sitemap.xml' }],
    }),
    react(),
    // Netlify's local edge-function server needs a matching Deno and crashes dev; the site has no edge functions.
    netlify({ dev: { edgeFunctions: { enabled: false } } }),
  ],
});
