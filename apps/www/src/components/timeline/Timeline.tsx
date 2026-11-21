import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { EmbeddedTweet } from 'react-tweet';
import { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
import { useInView, useReducedMotion } from '../../hooks';
import { Island } from '../../islands/Island';
import { findTimelineEntry, getTimelinePages, type TimelineQuery } from '../../content/timeline/api';
import type { Image, Media, TimelineIndex, TimelineItem } from '../../content/timeline/types';

const LABELS: Record<TimelineItem['type'], string> = {
  post: 'Writing',
  project: 'Project',
  work: 'Client work',
  photo: 'Made',
  experiment: 'Experiment',
  link: 'Link',
  collection: 'Collection',
  note: 'Note',
  activity: 'Sport',
  book: 'Book',
  video: 'Video',
  tweet: 'Post on X',
};

/**
 * Every year of the timeline, its entries loaded a page at a time. Pages not here yet hold
 * about their height, so the scrollbar, the year links and `/#<entry>` reach all of it, and
 * load when they come within two screens.
 */
export function Timeline({ index, query }: { index: TimelineIndex; query: TimelineQuery }) {
  const root = useRef<HTMLDivElement>(null);
  const hold = useKeepPlace(root);
  const pages = usePages(index, query, hold);
  const current = useCurrentYear(index.years);
  const pending = index.years.flatMap((year) => year.pages.filter((page) => !pages.get(page.key)).map((page) => page.key));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (records) => {
        const keys = records.filter((record) => record.isIntersecting).map((record) => (record.target as HTMLElement).dataset.page!);
        if (keys.length) pages.load(keys);
      },
      { rootMargin: '200% 0px' },
    );
    root.current?.querySelectorAll('.tl-pending:not([data-failed])').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [pending.join(), pages.failed]);

  useHashTarget(query, pages, hold);

  return (
    <>
      <div className="tl-years" ref={root}>
        {index.years.map(({ pages: yearPages, year }) => (
          <section aria-labelledby={`year-${year}`} className="tl-year" id={year} key={year}>
            <div className="tl-year-head">
              <h2 className="tl-year-label" id={`year-${year}`}>
                {year}
              </h2>
              {index.years.length > 1 ? (
                <button className="tl-jump-button" popoverTarget="tl-jump" type="button">
                  Go to year
                  <Chevron />
                </button>
              ) : null}
            </div>
            <ol className="tl-entries">
              {yearPages.map((page) => {
                const entries = pages.get(page.key);
                if (!entries) {
                  const failed = pages.failed.has(page.key);
                  return (
                    <li
                      aria-hidden={failed ? undefined : 'true'}
                      className="tl-pending"
                      data-failed={failed || undefined}
                      data-page={page.key}
                      key={page.key}
                      style={{ height: `${page.height}rem` }}
                    >
                      {failed ? (
                        <button className="tl-retry" onClick={() => pages.retry(page.key)} type="button">
                          {page.count === 1 ? 'An entry' : `${page.count} entries`} didn’t load. Try again
                        </button>
                      ) : null}
                    </li>
                  );
                }
                return entries.map((entry) => (
                  <li className="tl-entry" data-page={page.key} data-type={entry.type} id={entry.anchor} key={entry.id}>
                    <EntryMeta entry={entry} />
                    <div className="tl-body">
                      <EntryBody entry={entry} />
                    </div>
                  </li>
                ));
              })}
            </ol>
          </section>
        ))}
      </div>
      {index.years.length > 1 ? <YearNav current={current} hold={hold} pages={pages} years={index.years} /> : null}
    </>
  );
}

/** Pages already loaded, kept across filters, so switching one off and on again is instant. */
const loaded = new Map<string, ReadonlyArray<TimelineItem>>();

type Pages = ReturnType<typeof usePages>;

/** The timeline's pages: the ones the homepage came with and those loaded since. */
function usePages(index: TimelineIndex, query: TimelineQuery, hold: (renew?: boolean) => void) {
  const prefix = `${query.filter ?? ''}|${query.order ?? ''}|`;
  for (const [key, entries] of Object.entries(index.pages)) {
    loaded.set(prefix + key, entries);
  }
  const fetchPages = useServerFn(getTimelinePages);
  const [, rerender] = useReducer((count: number) => count + 1, 0);
  const [failed, setFailed] = useState<ReadonlySet<string>>(new Set());
  const loading = useRef(new Set<string>());

  async function load(keys: string[]) {
    const todo = keys.filter((key) => !loaded.has(prefix + key) && !loading.current.has(prefix + key));
    if (!todo.length) return;
    todo.forEach((key) => loading.current.add(prefix + key));
    try {
      const result = await fetchPages({ data: { ...query, keys: todo } });
      for (const [key, entries] of Object.entries(result)) {
        loaded.set(prefix + key, entries);
      }
      hold();
      rerender();
    } catch {
      setFailed((current) => new Set([...current, ...todo]));
    } finally {
      todo.forEach((key) => loading.current.delete(prefix + key));
    }
  }

  function retry(key: string) {
    setFailed((current) => new Set([...current].filter((other) => other !== key)));
    load([key]);
  }

  return { failed, get: (key: string) => loaded.get(prefix + key), load, retry };
}

/**
 * Keeps what's on screen where it is while the timeline changes size above it: pages filling
 * in, and then their pictures. Browsers' own scroll anchoring would do this, but Safari has none
 * and Chrome's picks the sticky year heading, so it's off for the timeline (CSS) and done here,
 * from a load or jump until you scroll yourself.
 */
function useKeepPlace(root: React.RefObject<HTMLElement | null>) {
  const held = useRef<ReturnType<typeof topOfScreen>>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const resized = new ResizeObserver(() => {
      const kept = held.current;
      const anchor = kept?.find();
      if (!kept || !anchor) return;
      const moved = anchor.getBoundingClientRect().top - kept.top;
      if (Math.abs(moved) > 1) window.scrollBy({ behavior: 'instant', top: moved });
    });
    const release = () => {
      held.current = null;
    };
    const input = ['wheel', 'touchstart', 'keydown', 'mousedown'] as const;
    resized.observe(element);
    input.forEach((type) => window.addEventListener(type, release, { passive: true }));
    return () => {
      resized.disconnect();
      input.forEach((type) => window.removeEventListener(type, release));
    };
  }, [root]);

  /** Holds what's on screen now; a newer jump takes over, but a load keeps what's held already. */
  return (renew = false) => {
    if (renew || !held.current?.find()) held.current = topOfScreen();
  };
}

/**
 * What to hold in place while pages above it fill in: the year or entry jumped to if it's on
 * screen, or else the first year, entry or loading page that starts on screen. A page that's
 * loading gives way to its entries; then the first of them takes its place.
 */
function topOfScreen() {
  const target = document.querySelector<HTMLElement>('[data-target], .tl-year:target, .tl-entry:target');
  const candidates = [target, ...Array.from(document.querySelectorAll<HTMLElement>('.tl-year, .tl-entry, .tl-pending'))];
  for (const element of candidates) {
    const top = element?.getBoundingClientRect().top ?? -1;
    if (element && top > -2 && top < window.innerHeight) {
      const page = element.dataset.page;
      return { find: () => (element.isConnected ? element : document.querySelector(`[data-page="${page}"]`)), top };
    }
  }
  return null;
}

/** `/#<entry>` for an entry whose page isn't loaded yet: find its page, load it, then go there. */
function useHashTarget(query: TimelineQuery, pages: Pages, hold: (renew?: boolean) => void) {
  const hash = useLocation({ select: (location) => location.hash });
  const find = useServerFn(findTimelineEntry);

  useEffect(() => {
    if (!hash || document.getElementById(hash)) return;
    let cancelled = false;
    find({ data: { ...query, anchor: hash } })
      .then(async (key) => {
        if (!key || cancelled) return;
        await pages.load([key]);
        for (let frame = 0; frame < 30 && !cancelled; frame++) {
          if (goTo(hash)) return hold(true);
          await new Promise(requestAnimationFrame);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [hash, query.filter, query.order]);
}

/** Marks the year or entry with this id as the one gone to and puts it at the top, at once. */
function goTo(id: string) {
  const target = document.getElementById(id);
  if (!target) return false;
  document.querySelectorAll('[data-target]').forEach((element) => element.removeAttribute('data-target'));
  target.dataset.target = '';
  target.scrollIntoView({ behavior: 'instant', block: 'start' });
  return true;
}

/**
 * Years to jump to. On wide screens a list beside the timeline that marks the year in
 * view; on narrow ones a sheet opened from the sticky year header. Pointing at a year
 * starts loading it; choosing one waits for it and jumps there, without the smooth scroll,
 * which would only pass through pages still loading.
 */
function YearNav({ current, hold, pages, years }: { current?: string; hold: (renew?: boolean) => void; pages: Pages; years: TimelineIndex['years'] }) {
  const sheet = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const prefetch = (year: TimelineIndex['years'][number]) => () => pages.load(year.pages.slice(0, 1).map((page) => page.key));

  function jump(year: TimelineIndex['years'][number]) {
    return async (event: React.MouseEvent) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      sheet.current?.hidePopover();
      await pages.load(year.pages.slice(0, 1).map((page) => page.key));
      await navigate({ to: '.', search: (search) => search, hash: year.year, hashScrollIntoView: false, resetScroll: false });
      requestAnimationFrame(() => goTo(year.year) && hold(true));
    };
  }

  return (
    <>
      <nav aria-label="Years" className="tl-yearnav">
        {years.map((year) => (
          <a
            aria-current={year.year === current ? 'true' : undefined}
            href={`#${year.year}`}
            key={year.year}
            onClick={jump(year)}
            onFocus={prefetch(year)}
            onPointerEnter={prefetch(year)}
          >
            {year.year}
          </a>
        ))}
      </nav>
      <div aria-label="Go to year" className="tl-jump" id="tl-jump" popover="auto" ref={sheet} role="dialog">
        <p className="tl-jump-title">Go to year</p>
        <nav aria-label="Years" className="tl-jump-years">
          {years.map((year) => (
            <a
              aria-current={year.year === current ? 'true' : undefined}
              href={`#${year.year}`}
              key={year.year}
              onClick={jump(year)}
              onPointerDown={prefetch(year)}
            >
              {year.year}
              <span className="tl-jump-count">{year.count}</span>
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}

/** The year whose section crosses a line a quarter down the viewport. */
function useCurrentYear(years: TimelineIndex['years']) {
  const [current, setCurrent] = useState<string>();
  const keys = years.map(({ year }) => year).join();

  useEffect(() => {
    const sections = keys.split(',').flatMap((year) => document.getElementById(year) ?? []);
    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          if (record.isIntersecting) {
            setCurrent(record.target.id);
          }
        }
      },
      { rootMargin: '-25% 0px -74% 0px' },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [keys]);

  // Above the first section, the first year is the one coming up.
  return current ?? years[0]?.year;
}

/** Entry titles are h3 under the year on the timeline, and the page's h1 on an entry page. */
export const HeadingLevel = createContext<'h1' | 'h3'>('h3');

function Heading({ children }: { children: React.ReactNode }) {
  const Tag = useContext(HeadingLevel);
  return <Tag className="tl-title">{children}</Tag>;
}

export function EntryMeta({ entry, withYear }: { entry: TimelineItem; withYear?: boolean }) {
  return (
    <p className="tl-meta">
      <EntryLink className="tl-date" entry={entry}>
        <time dateTime={entry.date} title={entry.approximate ? 'Approximate date' : undefined}>
          {entry.approximate ? '~' : ''}
          {formatDate(entry.date, withYear)}
        </time>
      </EntryLink>
      <span className="tl-kind">{entry.type === 'activity' ? entry.sport : LABELS[entry.type]}</span>
    </p>
  );
}

/** A link to the entry's own page, like a tweet's timestamp. */
function EntryLink({ children, className, entry }: { children: React.ReactNode; className?: string; entry: TimelineItem }) {
  switch (entry.type) {
    case 'post':
      return (
        <Link className={className} params={{ slug: entry.slug }} to="/posts/$slug">
          {children}
        </Link>
      );
    case 'experiment':
    case 'collection':
      return (
        <Link className={className} to={entry.to}>
          {children}
        </Link>
      );
    default:
      return (
        <Link className={className} params={{ slug: entry.path.slice(1) }} to="/$slug">
          {children}
        </Link>
      );
  }
}

export function EntryBody({ entry }: { entry: TimelineItem }) {
  switch (entry.type) {
    case 'post':
      return (
        <Link className="tl-card" params={{ slug: entry.slug }} to="/posts/$slug">
          <Heading>{entry.title}</Heading>
          <p className="tl-text">{entry.excerpt}</p>
        </Link>
      );
    case 'project': {
      const repo = entry.repo && entry.repo !== entry.href ? entry.repo : undefined;
      // With a picture of it, the address goes below the picture, as its source.
      const url = entry.href && !isFigure(entry.media) ? entry.href : undefined;
      return (
        <LinkedCard href={entry.href} media={entry.media} source={entry.href} title={entry.title}>
          <p className="tl-text">{entry.description}</p>
          {url || entry.stars || repo ? (
            <p className="tl-facts">
              {url ? <UrlLink github={url === entry.repo} href={url} /> : null}
              {entry.stars ? (
                <span className="tl-stars">
                  <StarIcon />
                  {entry.stars.toLocaleString('en-US')}
                  <span className="sr-only"> GitHub stars</span>
                </span>
              ) : null}
              {repo ? (
                <a className="tl-repo" href={repo} rel="noreferrer" target="_blank">
                  <GitHubIcon />
                  GitHub
                </a>
              ) : null}
            </p>
          ) : null}
        </LinkedCard>
      );
    }
    case 'work':
      return (
        <LinkedCard href={entry.href} media={entry.media} source={entry.href} title={entry.client}>
          <p className="tl-role">{entry.role}</p>
          <p className="tl-text">{entry.description}</p>
          <p className="tl-facts tl-stack">
            {entry.stack.map((tool) => (
              <span key={tool}>{tool}</span>
            ))}
          </p>
          {entry.href && !isFigure(entry.media) ? (
            <p className="tl-facts">
              <UrlLink href={entry.href} />
            </p>
          ) : null}
        </LinkedCard>
      );
    case 'photo':
      return (
        <figure className="tl-figure">
          <Picture image={entry.image} />
          <figcaption className="tl-text">{entry.caption}</figcaption>
        </figure>
      );
    case 'experiment':
      return (
        <Link className="tl-card" to={entry.to}>
          <Heading>{entry.title}</Heading>
          <p className="tl-text">{entry.description}</p>
          <EntryMedia media={entry.media} />
        </Link>
      );
    case 'link':
      return (
        <OutLink className="tl-card tl-card-inline" href={entry.href}>
          <WithThumb media={entry.media}>
            <span className="tl-title">
              {entry.title}
              <Arrow />
            </span>
            <span className="tl-facts">
              {entry.note ? <span>{entry.note}</span> : null}
              <span className="tl-url">
                <span className="tl-url-text">{displayUrl(entry.href)}</span>
              </span>
            </span>
          </WithThumb>
          <EntryMedia media={entry.media} />
        </OutLink>
      );
    case 'collection':
      return (
        <Link className="tl-card" to={entry.to}>
          <Heading>{entry.title}</Heading>
          <p className="tl-text">{entry.description}</p>
          <ul className="tl-preview">
            {entry.preview.map((title) => (
              <li key={title}>{title}</li>
            ))}
          </ul>
        </Link>
      );
    case 'note':
      return <p className="tl-note">{entry.text}</p>;
    case 'activity': {
      const href = `https://www.strava.com/activities/${entry.stravaId}`;
      return (
        <div className="tl-card tl-card-linked" onClick={followCardLink}>
          <Heading>
            <a className="tl-card-link" href={href} rel="noreferrer" target="_blank">
              {entry.title}
              <Arrow />
            </a>
          </Heading>
          {entry.stats ? (
            <dl className="tl-stats">
              <div>
                <dt>Distance</dt>
                <dd>{entry.stats.distance.toLocaleString('en-US')} km</dd>
              </div>
              <div>
                <dt>Elevation</dt>
                <dd>{entry.stats.elevation.toLocaleString('en-US')} m</dd>
              </div>
              <div>
                <dt>Time</dt>
                <dd>{entry.stats.time}</dd>
              </div>
            </dl>
          ) : null}
          <Picture className="tl-media" image={entry.map} />
          {entry.photos.length ? (
            <span className="tl-media tl-strip">
              {entry.photos.map((photo) => (
                <Picture image={photo} key={photo.src} />
              ))}
            </span>
          ) : null}
          <Source href={href} />
        </div>
      );
    }
    case 'video':
      return <YouTube duration={entry.duration} thumbnail={entry.thumbnail} title={entry.title} youtubeId={entry.youtubeId} />;
    case 'tweet':
      return (
        <div className="tl-tweet">
          <EmbeddedTweet tweet={entry.tweet} />
        </div>
      );
    case 'book':
      return (
        <OutLink className="tl-card tl-row" href={entry.href}>
          {entry.cover ? <Picture className="tl-cover" decorative image={entry.cover} /> : null}
          <span>
            <span className="tl-title">{entry.title}</span>
            <span className="tl-text tl-author">{entry.author}</span>
          </span>
        </OutLink>
      );
  }
}

/**
 * A card whose title is the link. The link's hit area stretches over the whole card,
 * so the card can also hold its own links and buttons, which an `<a>` can't.
 */
function LinkedCard({
  children,
  href,
  media,
  source,
  title,
}: {
  children: React.ReactNode;
  href?: string;
  media?: Media;
  /** Where the media comes from, shown below it. */
  source?: string;
  title: string;
}) {
  return (
    <div className={href ? 'tl-card tl-card-linked' : 'tl-card'} onClick={href ? followCardLink : undefined}>
      <WithThumb media={media}>
        <Heading>
          {href ? (
            <a className="tl-card-link" href={href} rel="noreferrer" target="_blank">
              {title}
              <Arrow />
            </a>
          ) : (
            title
          )}
        </Heading>
        {children}
      </WithThumb>
      <EntryMedia media={media} />
      {source && isFigure(media) ? <Source href={source} /> : null}
    </div>
  );
}

/** Pictures and clips below the text, which get a source line; snippets and thumbnails don't. */
function isFigure(media?: Media) {
  return (
    media?.kind === 'image' ||
    media?.kind === 'gallery' ||
    media?.kind === 'row' ||
    media?.kind === 'video' ||
    media?.kind === 'scroll'
  );
}

/** A figure's source line, as in a paper: the page the picture or video above comes from. */
function Source({ href }: { href: string }) {
  return (
    <p className="tl-source">
      <span className="tl-source-label">Source</span>
      <a href={href} rel="noreferrer" target="_blank" title={href}>
        <span className="tl-url-text">{displayUrl(href)}</span>
      </a>
    </p>
  );
}

/**
 * The title link's `::after` covers the card, but pictures that fade into colour paint above it
 * (a filter makes them a layer of their own), and strips need their own pointer events to scroll.
 * So a click anywhere else in the card is passed on to the title link, modifier keys and all.
 */
function followCardLink(event: React.MouseEvent<HTMLDivElement>) {
  const target = event.target as Element;
  if (target.closest('a, button') || window.getSelection()?.toString()) {
    return;
  }
  const link = event.currentTarget.querySelector<HTMLAnchorElement>('.tl-card-link');
  const { altKey, button, ctrlKey, metaKey, shiftKey } = event;
  link?.dispatchEvent(new MouseEvent('click', { altKey, bubbles: true, button, cancelable: true, ctrlKey, metaKey, shiftKey }));
}

/** Puts a thumbnail beside the text. Other media go below it, see EntryMedia. */
function WithThumb({ children, media }: { children: React.ReactNode; media?: Media }) {
  if (media?.kind !== 'thumb') {
    return children;
  }

  return (
    <span className="tl-row">
      <Picture className="tl-thumb" image={media.image} />
      <span className="tl-row-text">{children}</span>
    </span>
  );
}

function EntryMedia({ media }: { media?: Media }) {
  switch (media?.kind) {
    case 'image':
      return <Picture className="tl-media" image={media.image} />;
    case 'gallery':
      return <Gallery images={media.images} />;
    case 'row':
      return (
        <div className="tl-media tl-strip">
          {media.images.map((image) => (
            <Picture image={image} key={image.src} />
          ))}
        </div>
      );
    case 'video':
      return <Clip poster={media.poster} src={media.src} />;
    case 'scroll':
      return <Scroll image={media.image} />;
    case 'code':
      return (
        <pre className="tl-media tl-code">
          <code>{media.code}</code>
        </pre>
      );
    case 'words':
      return (
        <dl className="tl-media tl-words">
          {media.words.map(([word, translation]) => (
            <div key={word}>
              <dt>{word}</dt>
              <dd>{translation}</dd>
            </div>
          ))}
        </dl>
      );
    case 'punchcard':
      return <Punchcard days={media.days} />;
    case 'live':
      return <Island className="tl-media" name={media.island} poster={media.poster} />;
    default:
      return null;
  }
}

function Picture({ className, decorative, image }: { className?: string; decorative?: boolean; image: Image }) {
  return (
    <img
      alt={decorative ? '' : image.alt}
      className={className ? `tl-image ${className}` : 'tl-image'}
      decoding="async"
      height={image.height}
      loading="lazy"
      src={image.src}
      width={image.width}
    />
  );
}

/**
 * Pictures side by side in a strip, as many as fit, sliding on by one picture at a time while
 * the strip is in view. The bars below fill up over `--tl-gallery-interval` (CSS); when the
 * current one is full, the strip moves on, and back to the start after the end. Swipe or scroll
 * it sideways to move yourself; with a mouse, hovering pauses it and shows buttons to step
 * through. With reduced motion it never moves on its own.
 */
function Gallery({ images }: { images: ReadonlyArray<Image> }) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const inView = useInView(root, 0.6);
  const reducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [touching, setTouching] = useState(false);
  /** Where the strip can rest: each picture's left edge, up to where the last one is fully in. */
  const [stops, setStops] = useState<number[]>([]);
  const [index, setIndex] = useState(0);
  /** Until when the strip is sliding on its own, so its scroll events aren't taken as a hand. */
  const sliding = useRef(0);
  const playing = inView && !hovered && !touching && !reducedMotion && stops.length > 1;

  useEffect(() => {
    const strip = track.current;
    if (!strip) return;
    const measure = () => {
      const end = strip.scrollWidth - strip.clientWidth;
      const lefts = Array.from(strip.children, (child) => Math.min((child as HTMLElement).offsetLeft - strip.offsetLeft, end));
      setStops([...new Set(lefts.map(Math.round))].filter((left, i, all) => i === 0 || left - all[i - 1] > 4));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(strip);
    return () => observer.disconnect();
  }, []);

  /** Follows the strip when it's scrolled by hand, so the bars show where it is. */
  function onScroll() {
    const strip = track.current;
    if (!strip || !stops.length || performance.now() < sliding.current) return;
    const nearest = stops.reduce((best, left, i) => (Math.abs(left - strip.scrollLeft) < Math.abs(stops[best] - strip.scrollLeft) ? i : best), 0);
    if (nearest !== index) setIndex(nearest);
  }

  function go(next: number) {
    const count = stops.length;
    if (!count) return;
    const target = (next + count) % count;
    setIndex(target);
    sliding.current = performance.now() + 800;
    track.current?.scrollTo({ left: stops[target], behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  return (
    <div
      className="tl-media tl-gallery"
      data-playing={playing}
      onPointerEnter={(event) => event.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      ref={root}
    >
      <div className="tl-gallery-viewport">
        <div
          aria-label={`${images.length} pictures`}
          className="tl-gallery-track"
          onScroll={onScroll}
          onTouchEnd={() => setTouching(false)}
          onTouchStart={() => setTouching(true)}
          ref={track}
          role="group"
          tabIndex={0}
        >
          {images.map((image) => (
            <Picture image={image} key={image.src} />
          ))}
        </div>
        {stops.length > 1 ? (
          <>
            <button aria-label="Previous picture" className="tl-gallery-step" data-direction="previous" onClick={() => go(index - 1)} type="button">
              <Chevron />
            </button>
            <button aria-label="Next picture" className="tl-gallery-step" data-direction="next" onClick={() => go(index + 1)} type="button">
              <Chevron />
            </button>
          </>
        ) : null}
      </div>
      <div aria-hidden={stops.length < 2} className="tl-gallery-bars">
        {stops.length > 1
          ? stops.map((left, i) => (
              <button
                aria-current={i === index}
                aria-label={`Show picture ${i + 1} of ${stops.length}`}
                className="tl-gallery-bar"
                data-state={i < index ? 'done' : i === index ? 'active' : 'next'}
                key={left}
                onClick={() => go(i)}
                type="button"
              >
                <span className="tl-gallery-fill" onAnimationEnd={i === index ? () => go(index + 1) : undefined} />
              </button>
            ))
          : null}
      </div>
    </div>
  );
}

/**
 * A YouTube video that stays a plain picture until you press play; only then does the
 * player (and YouTube) load, from the privacy-enhanced domain.
 */
function YouTube({
  duration,
  thumbnail,
  title,
  youtubeId,
}: {
  duration: number;
  thumbnail: Image;
  title: string;
  youtubeId: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="tl-card">
      <Heading>
        <a className="tl-card-link" href={`https://www.youtube.com/watch?v=${youtubeId}`} rel="noreferrer" target="_blank">
          {title}
          <Arrow />
        </a>
      </Heading>
      <div className="tl-media tl-youtube" data-playing={playing}>
        {playing ? (
          <iframe
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&playsinline=1&rel=0`}
            title={title}
          />
        ) : (
          <button aria-label={`Play ${title} (${formatDuration(duration)})`} className="tl-youtube-poster" onClick={() => setPlaying(true)} type="button">
            <Picture decorative image={thumbnail} />
            <span aria-hidden="true" className="tl-play">
              <svg fill="currentColor" height="14" viewBox="0 0 14 14" width="14">
                <path d="M3.5 1.9v10.2c0 .6.7 1 1.2.7l8-5.1a.8.8 0 0 0 0-1.4l-8-5.1c-.5-.3-1.2.1-1.2.7Z" />
              </svg>
            </span>
            <span aria-hidden="true" className="tl-duration">
              {formatDuration(duration)}
            </span>
          </button>
        )}
      </div>
      <Source href={`https://www.youtube.com/watch?v=${youtubeId}`} />
    </div>
  );
}

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/** A silent loop that only plays while on screen, and not at all with reduced motion. */
/**
 * A whole page in a window-shaped frame, scrolling down to its end and back up while in view,
 * slower the taller it is. Hovering pauses it. With reduced motion it stays put and the frame
 * scrolls by hand instead.
 */
function Scroll({ image }: { image: Image }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.5);
  const seconds = Math.round((image.height / image.width) * 6);

  return (
    <div
      className="tl-media tl-scroll"
      data-playing={inView || undefined}
      ref={ref}
      style={{ '--tl-scroll-duration': `${seconds}s` } as React.CSSProperties}
    >
      <Picture image={image} />
    </div>
  );
}

function Clip({ poster, src }: { poster: Image; src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref, 0.5);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video) {
      return;
    }
    if (inView && !reducedMotion) {
      // Browsers may refuse to autoplay (data saver, low power); the poster stays then.
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [inView, reducedMotion]);

  return (
    <video
      aria-label={poster.alt}
      className={poster.height > poster.width ? 'tl-media tl-image tl-clip tl-clip-portrait' : 'tl-media tl-image tl-clip'}
      height={poster.height}
      loop
      muted
      playsInline
      poster={poster.src}
      preload="none"
      ref={ref}
      src={src}
      width={poster.width}
    />
  );
}

const DAY = 86_400_000;
const WEEKS_PER_ROW = 26;
const CELL = 10;
const ROW_GAP = 14;

/**
 * Week-by-day dots, half a year per row: a punched hole for every day in `days`.
 * Weeks start on Monday, like the old /punchcard.
 */
function Punchcard({ days }: { days: ReadonlyArray<string> }) {
  const punched = new Set(days);
  const first = Date.parse(days[0]);
  const last = Date.parse(days[days.length - 1]);
  const start = first - ((new Date(first).getUTCDay() + 6) % 7) * DAY;
  const rows = Math.ceil((last - start + DAY) / (DAY * 7 * WEEKS_PER_ROW));
  const holes: React.ReactNode[] = [];

  for (let time = start; time <= last; time += DAY) {
    const index = Math.round((time - start) / DAY);
    const week = Math.floor(index / 7);
    const day = new Date(time).toISOString().slice(0, 10);
    const isPunched = punched.has(day);
    holes.push(
      <circle
        className={isPunched ? 'tl-punched' : undefined}
        cx={(week % WEEKS_PER_ROW) * CELL + CELL / 2}
        cy={Math.floor(week / WEEKS_PER_ROW) * (7 * CELL + ROW_GAP) + (index % 7) * CELL + CELL / 2}
        key={day}
        r={isPunched ? 3.25 : 1.25}
      />,
    );
  }

  return (
    <svg
      aria-label={`Reading days from ${days[0]} to ${days[days.length - 1]}`}
      className="tl-media tl-punchcard"
      role="img"
      viewBox={`0 0 ${WEEKS_PER_ROW * CELL} ${rows * 7 * CELL + (rows - 1) * ROW_GAP}`}
    >
      {holes}
    </svg>
  );
}

/** The address a card opens, shown so you can see where it goes before you click. */
function UrlLink({ github, href }: { github?: boolean; href: string }) {
  return (
    <a className="tl-url" href={href} rel="noreferrer" target="_blank" title={href}>
      {github ? <GitHubIcon /> : null}
      <span className="tl-url-text">{displayUrl(href)}</span>
    </a>
  );
}

/** `https://www.example.com/path/` → `example.com/path`. */
function displayUrl(href: string) {
  const url = new URL(href);
  const path = `${url.pathname}${url.search}`.replace(/\/$/, '');
  return `${url.hostname.replace(/^www\./, '')}${path}`;
}

function OutLink({ children, className, href }: { children: React.ReactNode; className: string; href?: string }) {
  if (!href) {
    return <div className={className}>{children}</div>;
  }

  return (
    <a className={className} href={href} rel="noreferrer" target="_blank">
      {children}
    </a>
  );
}

function Chevron() {
  return (
    <svg aria-hidden="true" className="tl-chevron" fill="none" height="12" viewBox="0 0 12 12" width="12">
      <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
    </svg>
  );
}

function Arrow() {
  return (
    <span aria-hidden="true" className="tl-arrow">
      ↗
    </span>
  );
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" className="tl-star" fill="currentColor" height="12" viewBox="0 0 16 16" width="12">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg aria-hidden="true" className="tl-star" fill="none" height="12" viewBox="0 0 16 16" width="12">
      <path
        d="M8 1.75l1.86 3.94 4.3.52-3.17 2.96.82 4.26L8 11.3l-3.81 2.13.82-4.26L1.84 6.2l4.3-.52L8 1.75z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.25"
      />
    </svg>
  );
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** On the timeline the year is the section heading, so entries only show month and day. */
function formatDate(date: string, withYear?: boolean) {
  const [year, month, day] = date.split('-');
  if (!month) {
    return year;
  }
  const name = MONTHS[Number(month) - 1];
  const monthDay = day ? `${name} ${Number(day)}` : name;

  return withYear ? `${monthDay}, ${year}` : monthDay;
}
