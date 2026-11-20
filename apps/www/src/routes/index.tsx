import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Timeline } from '../components/timeline/Timeline';
import {
  availableFilters,
  filterTimeline,
  groupByYear,
  parseFilters,
  serializeFilters,
  type FilterId,
  type Order,
} from '../content/timeline';
import { SITE, seo } from '../seo';

type Search = { filter?: string; order?: 'oldest' };

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): Search => {
    const filter = serializeFilters(parseFilters(search.filter));
    return { ...(filter ? { filter } : {}), ...(search.order === 'oldest' ? { order: 'oldest' } : {}) };
  },
  head: () => seo({ title: SITE.title, description: SITE.description, path: '/', video: SITE.video, type: 'profile' }),
  component: Home,
});

const PROFILES = [
  { label: 'X', href: 'https://x.com/peetzweg' },
  { label: 'Bluesky', href: 'https://bsky.app/profile/peet.sh' },
  { label: 'GitHub', href: 'https://github.com/peetzweg' },
  { label: 'Strava', href: 'https://www.strava.com/athletes/18353420' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/peetzweg/' },
  { label: 'Ko-fi', href: 'https://ko-fi.com/peetzweg' },
];

function Home() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: '/' });
  const filters = parseFilters(search.filter);
  const order: Order = search.order ?? 'newest';
  const entries = filterTimeline(filters, order);
  const years = groupByYear(entries);

  function update(next: { filters?: FilterId[]; order?: Order }) {
    navigate({
      search: {
        filter: serializeFilters(next.filters ?? filters),
        order: (next.order ?? order) === 'oldest' ? 'oldest' : undefined,
      },
      replace: true,
      resetScroll: false,
      viewTransition: true,
    });
  }

  function toggle(id: FilterId) {
    update({ filters: filters.includes(id) ? filters.filter((f) => f !== id) : [...filters, id] });
  }

  const first = years.at(0)?.year;
  const last = years.at(-1)?.year;

  return (
    <main className="tl">
      <header className="tl-intro">
        <h1>Philip Poloczek</h1>
        <p>
          Building software, interfaces, tools and small experiments. This is everything I made, wrote
          and saved, from my first side projects to today.
        </p>
        <nav aria-label="Profiles" className="tl-profiles">
          {PROFILES.map(({ href, label }) => (
            <a href={href} key={label} rel="noreferrer" target="_blank">
              {label}
            </a>
          ))}
        </nav>
      </header>

      <div className="tl-controls">
        <div aria-label="Show only" className="tl-filters" role="group">
          {availableFilters.map(({ count, id, label }) => (
            <button
              aria-pressed={filters.includes(id)}
              className="tl-chip"
              key={id}
              onClick={() => toggle(id)}
              type="button"
            >
              <span className="tl-chip-label">{label}</span>
              <span className="tl-chip-count">{count}</span>
              <span aria-hidden="true" className="tl-chip-x">
                <svg fill="none" height="10" viewBox="0 0 10 10" width="10">
                  <path d="M2.5 2.5l5 5m0-5l-5 5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
                </svg>
              </span>
            </button>
          ))}
        </div>

        <div className="tl-toolbar">
          <p aria-live="polite" className="tl-summary">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            {first && last && first !== last ? ` · ${order === 'oldest' ? `${first}–${last}` : `${last}–${first}`}` : ''}
            {filters.length ? (
              <button className="tl-clear" onClick={() => update({ filters: [] })} type="button">
                Show all
              </button>
            ) : null}
          </p>
          <button
            aria-label={order === 'newest' ? 'Newest first. Show oldest first' : 'Oldest first. Show newest first'}
            className="tl-sort"
            data-order={order}
            onClick={() => update({ order: order === 'newest' ? 'oldest' : 'newest' })}
            type="button"
          >
            {order === 'newest' ? 'Newest first' : 'Oldest first'}
            <svg aria-hidden="true" fill="none" height="12" viewBox="0 0 12 12" width="12">
              <path d="M6 2v8m0 0L3 7m3 3 3-3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </button>
        </div>
      </div>

      <Timeline years={years} />
    </main>
  );
}
