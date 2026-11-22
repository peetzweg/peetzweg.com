import { createFileRoute } from '@tanstack/react-router';
import { entryPath, timeline } from '../content/timeline';
import { SITE } from '../seo';

/** Every page worth indexing: the homepage, each entry's page and the older pages. */
export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () => {
        const pages = new Map<string, string | undefined>([['/', timeline[0]?.date]]);
        for (const entry of timeline) {
          if (!pages.has(entryPath(entry))) {
            pages.set(entryPath(entry), entry.date.length === 10 ? entry.date : undefined);
          }
        }
        for (const path of ['/hardware', '/running', '/strava']) {
          pages.set(path, undefined);
        }
        const urls = [...pages]
          .map(([path, date]) => `  <url><loc>${SITE.url}${path}</loc>${date ? `<lastmod>${date}</lastmod>` : ''}</url>`)
          .join('\n');

        return new Response(
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
          { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
        );
      },
    },
  },
});
