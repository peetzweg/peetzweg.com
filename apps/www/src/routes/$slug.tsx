import { Link, createFileRoute } from '@tanstack/react-router';
import { useRef } from 'react';
import { EntryFooter } from '../components/timeline/EntryFooter';
import { EntryBody, EntryMeta, HeadingLevel } from '../components/timeline/Timeline';
import { getEntry } from '../content/timeline/api';
import { TIMELINE_TEXT, useJustify } from '../justify/useJustify';
import { SITE, seo } from '../seo';

/** One timeline entry on its own page, at a short dateless URL like `/papr`. */
export const Route = createFileRoute('/$slug')({
  loader: ({ params }) => getEntry({ data: { slug: params.slug } }),
  staleTime: Infinity,
  head: ({ loaderData }) =>
    loaderData
      ? seo({
          title: `${loaderData.title} · ${SITE.name}`,
          description: loaderData.summary,
          path: loaderData.entry.path,
          image: loaderData.image,
          type: 'article',
        })
      : {},
  component: EntryPage,
});

function EntryPage() {
  const { entry, newer, older, title } = Route.useLoaderData();
  const main = useRef<HTMLElement>(null);
  useJustify(main, TIMELINE_TEXT);

  return (
    <main className="tl tl-page" ref={main}>
      <nav className="tl-back">
        <Link hash={entry.anchor} to="/">
          <span aria-hidden="true">←</span> {SITE.name}
        </Link>
      </nav>

      <article className="tl-single" data-type={entry.type}>
        <EntryMeta entry={entry} withYear />
        <div className="tl-body">
          <HeadingLevel value="h1">
            <EntryBody entry={entry} />
          </HeadingLevel>
        </div>
      </article>

      <EntryFooter newer={newer} older={older} title={title} />
    </main>
  );
}
