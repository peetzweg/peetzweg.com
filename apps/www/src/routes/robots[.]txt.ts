import { createFileRoute } from '@tanstack/react-router';
import { SITE } from '../seo';

/**
 * Host-aware: the real site is indexable, every other host (Netlify and Coolify previews,
 * the server's own address) asks crawlers to stay away, since they find preview hosts fast.
 */
export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: ({ request }) => {
        const host = new URL(request.url).host;
        const production = host === new URL(SITE.url).host || host === 'www.peetzweg.com';
        const body = production
          ? `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`
          : 'User-agent: *\nDisallow: /\n';
        return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      },
    },
  },
});
