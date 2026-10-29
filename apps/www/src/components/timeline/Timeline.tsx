import { Link } from '@tanstack/react-router';
import type { TimelineEntry, TimelineYear } from '../../content/timeline';

const LABELS: Record<TimelineEntry['type'], string> = {
  post: 'Writing',
  project: 'Project',
  photo: 'Made',
  experiment: 'Experiment',
  link: 'Link',
  collection: 'Collection',
  note: 'Note',
};

export function Timeline({ years }: { years: TimelineYear[] }) {
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
              {entry.stars ? <span>★ {entry.stars.toLocaleString('en-US')}</span> : null}
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
