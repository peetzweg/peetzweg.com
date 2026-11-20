import { Link, createFileRoute, notFound } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { EntryBody, EntryMeta, HeadingLevel } from '../components/timeline/Timeline';
import {
  entryImage,
  entryPages,
  entryPath,
  entrySummary,
  entryTitle,
  neighbours,
  type TimelineEntry,
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
  const { newer, older } = neighbours(entry);

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

      <ShareButton title={entryTitle(entry)} />

      <nav aria-label="More from the timeline" className="tl-pager">
        {older ? <Neighbour direction="Older" entry={older} /> : <span />}
        {newer ? <Neighbour direction="Newer" entry={newer} /> : null}
      </nav>
    </main>
  );
}

function Neighbour({ direction, entry }: { direction: 'Older' | 'Newer'; entry: TimelineEntry }) {
  const path = entryPath(entry);

  return (
    <a className="tl-neighbour" data-direction={direction.toLowerCase()} href={path}>
      <span className="tl-neighbour-label">{direction}</span>
      <span className="tl-neighbour-title">{entryTitle(entry)}</span>
    </a>
  );
}

/** Opens the share sheet where there is one, and copies the link everywhere else. */
function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href.split('#')[0];
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      await navigator.share({ title, url }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button className="tl-share" data-copied={copied} onClick={share} type="button">
      <span aria-live="polite">{copied ? 'Link copied' : 'Share'}</span>
    </button>
  );
}
