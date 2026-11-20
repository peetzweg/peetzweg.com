import { Link, createFileRoute, notFound } from '@tanstack/react-router';
import { useRef } from 'react';
import { EntryFooter } from '../components/timeline/EntryFooter';
import { EntryBody, EntryMeta, HeadingLevel } from '../components/timeline/Timeline';
import {
  entryImage,
  entryPages,
  entryPath,
  entrySummary,
  entryTitle,
} from '../content/timeline';
import { TIMELINE_TEXT, useJustify } from '../justify/useJustify';
import { SITE, seo } from '../seo';

/** One timeline entry on its own page, at a short dateless URL like `/papr`. */
export const Route = createFileRoute('/$slug')({
  loader: ({ params }) => {
    if (!entryPages.has(params.slug)) {
      throw notFound();
    }
  },
  head: ({ params }) => {
    const entry = entryPages.get(params.slug);
    if (!entry) {
      return {};
    }
    const image = entryImage(entry);
    return seo({
      title: `${entryTitle(entry)} · ${SITE.name}`,
      description: entrySummary(entry),
      path: entryPath(entry),
      image: image ? { ...image, alt: image.alt || entryTitle(entry) } : undefined,
      type: 'article',
    });
  },
  component: EntryPage,
});

function EntryPage() {
  const { slug } = Route.useParams();
  const entry = entryPages.get(slug);
  const main = useRef<HTMLElement>(null);
  useJustify(main, TIMELINE_TEXT);
  if (!entry) {
    return null;
  }

  return (
    <main className="tl tl-page" ref={main}>
      <nav className="tl-back">
        <Link hash={slug} to="/">
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

      <EntryFooter entry={entry} />
    </main>
  );
}
