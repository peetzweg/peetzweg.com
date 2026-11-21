import { createFileRoute } from '@tanstack/react-router';
import { entryPath, entrySummary, entryTitle, timeline } from '../content/timeline';
import { SITE } from '../seo';

/** Entries in the feed, newest first. Tweets stay out: they'd be most of it, and X has them. */
const LIMIT = 50;

/** The timeline as RSS: projects, posts, work and the rest, linked to each entry's page. */
export const Route = createFileRoute('/feed.xml')({
  server: {
    handlers: {
      GET: () => {
        const entries = timeline.filter((entry) => entry.type !== 'tweet').slice(0, LIMIT);
        const items = entries
          .map((entry) => {
            const url = `${SITE.url}${entryPath(entry)}`;
            return [
              '    <item>',
              `      <title>${escape(entryTitle(entry))}</title>`,
              `      <link>${url}</link>`,
              `      <guid isPermaLink="false">${SITE.url}/#${escape(entry.id)}</guid>`,
              `      <pubDate>${rfc822(entry.date)}</pubDate>`,
              `      <description>${escape(entrySummary(entry))}</description>`,
              '    </item>',
            ].join('\n');
          })
          .join('\n');

        return new Response(
          `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(SITE.name)}</title>
    <link>${SITE.url}/</link>
    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${escape(SITE.description)}</description>
    <language>en</language>
    <lastBuildDate>${rfc822(entries[0]?.date ?? '2026')}</lastBuildDate>
${items}
  </channel>
</rss>
`,
          { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } },
        );
      },
    },
  },
});

/** Entry dates can be a year or a month (`2019`, `2019-01`); those count from their first day. */
function rfc822(date: string) {
  const [year, month = '01', day = '01'] = date.split('-');
  return new Date(`${year}-${month}-${day}T12:00:00Z`).toUTCString();
}

function escape(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
