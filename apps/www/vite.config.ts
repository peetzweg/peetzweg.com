import mdx from '@mdx-js/rollup';
import netlify from '@netlify/vite-plugin-tanstack-start';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import { REDIRECTS } from './redirects';

/**
 * Where the build runs: Netlify (the default, for now) or a plain Node server for Coolify
 * (`DEPLOY_TARGET=node`, set in the Dockerfile), which serves `.output/server/index.mjs`.
 */
const target = process.env.DEPLOY_TARGET === 'node' ? 'node' : 'netlify';

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
      // sitemap.xml and robots.txt are server routes, not prerendered: on the Node server a
      // prerendered single-segment file isn't in Nitro's static-asset manifest, so the `/$slug`
      // route would shadow it (devops playbook, commit-history 2026-07-20).
    }),
    react(),
    target === 'node'
      ? nitro({
          routeRules: Object.fromEntries(
            Object.entries(REDIRECTS).map(([from, to]) => [from, { redirect: { to, status: 301 } }]),
          ),
        })
      : // Netlify's local edge-function server needs a matching Deno and crashes dev; the site has no edge functions.
        netlify({ dev: { edgeFunctions: { enabled: false } } }),
  ],
});
