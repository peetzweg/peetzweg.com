import { Link } from '@tanstack/react-router';
import type { TimelineEntry, TimelineYear } from '../../content/timeline';
import { StravaEmbed, useStravaScript } from '../StravaEmbeds';

const LABELS: Record<TimelineEntry['type'], string> = {
  post: 'Writing',
  project: 'Project',
  photo: 'Made',
  experiment: 'Experiment',
  link: 'Link',
  collection: 'Collection',
  note: 'Note',
  activity: 'Sport',
  book: 'Book',
};

export function Timeline({ years }: { years: TimelineYear[] }) {
  // Filtering mounts different embeds, which Strava's script has to pick up again.
  useStravaScript(years);

  return (
    <div className="tl-years">
      {years.map(({ year, entries }) => (
        <section aria-labelledby={`year-${year}`} className="tl-year" key={year}>
          <h2 className="tl-year-label" id={`year-${year}`}>
            {year}
          </h2>
          <ol className="tl-entries">
            {entries.map((entry) => (
              <li className="tl-entry" data-type={entry.type} key={entry.id}>
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
  );
}

function EntryMeta({ entry }: { entry: TimelineEntry }) {
  return (
    <p className="tl-meta">
      <time dateTime={entry.date} title={entry.approximate ? 'Approximate date' : undefined}>
        {entry.approximate ? '~' : ''}
        {formatDate(entry.date)}
      </time>
      <span className="tl-kind">{LABELS[entry.type]}</span>
    </p>
  );
}

function EntryBody({ entry }: { entry: TimelineEntry }) {
  switch (entry.type) {
    case 'post':
      return (
        <Link className="tl-card" params={{ slug: entry.slug }} to="/posts/$slug">
          <h3 className="tl-title">{entry.title}</h3>
          <p className="tl-text">{entry.excerpt}</p>
        </Link>
      );
    case 'project':
      return (
        <OutLink className="tl-card" href={entry.href}>
          <h3 className="tl-title">
            {entry.title}
            {entry.href ? <Arrow /> : null}
          </h3>
          <p className="tl-text">{entry.description}</p>
          {entry.language || entry.stars ? (
            <p className="tl-facts">
              {entry.language ? <span>{entry.language}</span> : null}
              {entry.stars ? (
                <span className="tl-stars">
                  <StarIcon />
                  {entry.stars.toLocaleString('en-US')}
                  <span className="sr-only"> GitHub stars</span>
                </span>
              ) : null}
            </p>
          ) : null}
        </OutLink>
      );
    case 'photo':
      return (
        <figure className="tl-figure">
          <img
            alt={entry.image.alt}
            className="tl-image"
            decoding="async"
            height={entry.image.height}
            loading="lazy"
            src={entry.image.src}
            width={entry.image.width}
          />
          <figcaption className="tl-text">{entry.caption}</figcaption>
        </figure>
      );
    case 'experiment':
      return (
        <Link className="tl-card" to={entry.to}>
          <h3 className="tl-title">{entry.title}</h3>
          <p className="tl-text">{entry.description}</p>
        </Link>
      );
    case 'link':
      return (
        <OutLink className="tl-card tl-card-inline" href={entry.href}>
          <span className="tl-title">
            {entry.title}
            <Arrow />
          </span>
          {entry.note ? <span className="tl-facts">{entry.note}</span> : null}
        </OutLink>
      );
    case 'collection':
      return (
        <Link className="tl-card" to={entry.to}>
          <h3 className="tl-title">{entry.title}</h3>
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
        <div className="tl-embed">
          <StravaEmbed activityId={entry.stravaId} />
        </div>
      );
    case 'book':
      return (
        <OutLink className="tl-card tl-book" href={entry.href}>
          {entry.cover ? (
            <img
              alt=""
              className="tl-image tl-cover"
              decoding="async"
              height={entry.cover.height}
              loading="lazy"
              src={entry.cover.src}
              width={entry.cover.width}
            />
          ) : null}
          <span>
            <span className="tl-title">{entry.title}</span>
            <span className="tl-text tl-author">{entry.author}</span>
          </span>
        </OutLink>
      );
  }
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

function Arrow() {
  return (
    <span aria-hidden="true" className="tl-arrow">
      ↗
    </span>
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

/** The year is the section heading, so entries only show month and day. */
function formatDate(date: string) {
  const [, month, day] = date.split('-');
  if (!month) {
    return '';
  }
  const name = MONTHS[Number(month) - 1];

  return day ? `${name} ${Number(day)}` : name;
}
