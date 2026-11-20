import mdx from '@mdx-js/rollup';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import { REDIRECTS } from './redirects';

/** Builds a Node server (`.output/server/index.mjs`), run on Coolify from the Dockerfile. */
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
        // `/#papr` is the homepage again; crawled, its copies race to write the same index.html.
        filter: ({ path }) => !path.includes('#'),
      },
      // sitemap.xml and robots.txt are server routes, not prerendered: on the Node server a
      // prerendered single-segment file isn't in Nitro's static-asset manifest, so the `/$slug`
      // route would shadow it (devops playbook, commit-history 2026-07-20).
    }),
    react(),
    nitro({
      routeRules: Object.fromEntries(
        Object.entries(REDIRECTS).map(([from, to]) => [from, { redirect: { to, status: 301 } }]),
      ),
    }),
  ],
});
