import { Link } from '@tanstack/react-router';
import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { entryPages, entryPath, type Image, type Media, type TimelineEntry, type TimelineYear } from '../../content/timeline';

const LABELS: Record<TimelineEntry['type'], string> = {
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
};

export function Timeline({ years }: { years: TimelineYear[] }) {
  const current = useCurrentYear(years);

  return (
    <>
      <div className="tl-years">
        {years.map(({ year, entries }) => (
          <section aria-labelledby={`year-${year}`} className="tl-year" id={year} key={year}>
            <div className="tl-year-head">
              <h2 className="tl-year-label" id={`year-${year}`}>
                {year}
              </h2>
              {years.length > 1 ? (
                <button className="tl-jump-button" popoverTarget="tl-jump" type="button">
                  Go to year
                  <Chevron />
                </button>
              ) : null}
            </div>
            <ol className="tl-entries">
              {entries.map((entry) => (
                <li className="tl-entry" data-type={entry.type} id={anchorOf(entry)} key={entry.id}>
                  <EntryMeta entry={entry} />
                  <div className="tl-body">
                    <EntryBody entry={entry} />
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
      {years.length > 1 ? <YearNav current={current} years={years} /> : null}
    </>
  );
}

/** Where `/#<anchor>` lands on the homepage: the entry's slug, or its id if it has a page elsewhere. */
function anchorOf(entry: TimelineEntry) {
  const path = entryPath(entry);
  return entryPages.has(path.slice(1)) ? path.slice(1) : entry.id;
}

/**
 * Years to jump to. On wide screens a list beside the timeline that marks the year in
 * view; on narrow ones a sheet opened from the sticky year header.
 */
function YearNav({ current, years }: { current?: string; years: TimelineYear[] }) {
  const sheet = useRef<HTMLDivElement>(null);

  return (
    <>
      <nav aria-label="Years" className="tl-yearnav">
        {years.map(({ year }) => (
          <a aria-current={year === current ? 'true' : undefined} href={`#${year}`} key={year}>
            {year}
          </a>
        ))}
      </nav>
      <div aria-label="Go to year" className="tl-jump" id="tl-jump" popover="auto" ref={sheet} role="dialog">
        <p className="tl-jump-title">Go to year</p>
        <nav aria-label="Years" className="tl-jump-years">
          {years.map(({ entries, year }) => (
            <a
              aria-current={year === current ? 'true' : undefined}
              href={`#${year}`}
              key={year}
              onClick={() => sheet.current?.hidePopover()}
            >
              {year}
              <span className="tl-jump-count">{entries.length}</span>
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}

/** The year whose section crosses a line a quarter down the viewport. */
function useCurrentYear(years: TimelineYear[]) {
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

export function EntryMeta({ entry, withYear }: { entry: TimelineEntry; withYear?: boolean }) {
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
function EntryLink({ children, className, entry }: { children: React.ReactNode; className?: string; entry: TimelineEntry }) {
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
        <Link className={className} params={{ slug: entryPath(entry).slice(1) }} to="/$slug">
          {children}
        </Link>
      );
  }
}

export function EntryBody({ entry }: { entry: TimelineEntry }) {
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
      return (
        <LinkedCard href={entry.href} media={entry.media} title={entry.title}>
          <p className="tl-text">{entry.description}</p>
          {entry.href || entry.language || entry.stars ? (
            <p className="tl-facts">
              {entry.href ? <UrlLink github={entry.href === entry.repo} href={entry.href} /> : null}
              {entry.language ? <span>{entry.language}</span> : null}
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
        <LinkedCard href={entry.href} media={entry.media} title={entry.client}>
          <p className="tl-role">{entry.role}</p>
          <p className="tl-text">{entry.description}</p>
          <p className="tl-facts tl-stack">
            {entry.stack.map((tool) => (
              <span key={tool}>{tool}</span>
            ))}
          </p>
          {entry.href ? (
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
    case 'activity':
      return (
        <OutLink className="tl-card" href={`https://www.strava.com/activities/${entry.stravaId}`}>
          <Heading>
            {entry.title}
            <Arrow />
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
        </OutLink>
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
  title,
}: {
  children: React.ReactNode;
  href?: string;
  media?: Media;
  title: string;
}) {
  return (
    <div className={href ? 'tl-card tl-card-linked' : 'tl-card'}>
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
    </div>
  );
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
 * Pictures that crossfade one after another while the gallery is in view. The bars
 * below fill up over `--tl-gallery-interval` (CSS); when the current one is full, the
 * next picture shows. They also let you pick one. Hovering
 * pauses it; with reduced motion it never advances on its own.
 */
function Gallery({ images }: { images: ReadonlyArray<Image> }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.6);
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const playing = inView && !hovered && !reducedMotion;
  const [first] = images;

  return (
    <div
      className="tl-media tl-gallery"
      data-playing={playing}
      onPointerEnter={(event) => event.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      ref={ref}
    >
      <div className="tl-gallery-frame" style={{ aspectRatio: `${first.width} / ${first.height}` }}>
        {images.map((image, i) => (
          <img
            alt={image.alt}
            aria-hidden={i !== index}
            className="tl-image tl-gallery-image"
            data-active={i === index}
            decoding="async"
            height={image.height}
            key={image.src}
            loading="lazy"
            src={image.src}
            width={image.width}
          />
        ))}
      </div>
      <div className="tl-gallery-bars">
        {images.map((image, i) => (
          <button
            aria-current={i === index}
            aria-label={`Show picture ${i + 1} of ${images.length}`}
            className="tl-gallery-bar"
            data-state={i < index ? 'done' : i === index ? 'active' : 'next'}
            key={image.src}
            onClick={() => setIndex(i)}
            type="button"
          >
            <span
              className="tl-gallery-fill"
              onAnimationEnd={i === index ? () => setIndex((i + 1) % images.length) : undefined}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

/** A silent loop that only plays while on screen, and not at all with reduced motion. */
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
      className="tl-media tl-image tl-clip"
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

function useInView(ref: React.RefObject<Element | null>, threshold: number) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return inView;
}

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED_MOTION);
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
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
