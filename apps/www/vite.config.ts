import mdx from '@mdx-js/rollup';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
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
  environments: {
    // Timeline pictures are only imported on the server now; see publishServerAssets.
    ssr: { build: { emitAssets: true } },
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
    publishServerAssets(),
    nitro({
      routeRules: Object.fromEntries(
        Object.entries(REDIRECTS).map(([from, to]) => [from, { redirect: { to, status: 301 } }]),
      ),
    }),
  ],
});

/**
 * The timeline reaches the browser through server functions, so its pictures and clips are
 * imported by server code alone (content/timeline/api.ts). Vite leaves assets of the server
 * build out of the site, expecting the client build to emit them, so they're copied into
 * Nitro's public folder here, next to the client's assets. Media only: the server build's
 * scripts stay private.
 */
function publishServerAssets(): Plugin {
  const publicDir = new URL('.output/public/', import.meta.url);
  return {
    name: 'publish-server-assets',
    applyToEnvironment: (environment) => environment.name === 'ssr',
    writeBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type === 'asset' && /\.(avif|gif|jpe?g|mp4|png|svg|webm|webp)$/.test(file.fileName)) {
          const to = new URL(file.fileName, publicDir);
          mkdirSync(dirname(to.pathname), { recursive: true });
          writeFileSync(to, file.source);
        }
      }
    },
  };
}
