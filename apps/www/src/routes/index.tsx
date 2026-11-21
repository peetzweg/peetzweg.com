import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useRef } from 'react';
import { Timeline } from '../components/timeline/Timeline';
import { getFeatured, getTimeline } from '../content/timeline/api';
import { parseFilters, serializeFilters, type FilterId, type Order } from '../content/timeline/filters';
import { TIMELINE_TEXT, useJustify } from '../justify/useJustify';
import { SITE, seo } from '../seo';

type Search = { filter?: string; order?: 'oldest' };

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): Search => {
    const filter = serializeFilters(parseFilters(search.filter));
    return { ...(filter ? { filter } : {}), ...(search.order === 'oldest' ? { order: 'oldest' } : {}) };
  },
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const [index, featured] = await Promise.all([getTimeline({ data: deps }), getFeatured()]);
    return { index, featured };
  },
  staleTime: Infinity,
  head: () => seo({ title: SITE.title, description: SITE.description, path: '/', video: SITE.video, type: 'profile' }),
  component: Home,
});

const PROFILES = [
  { label: 'X', href: 'https://x.com/peetzweg' },
  { label: 'Bluesky', href: 'https://bsky.app/profile/peetzweg.com' },
  { label: 'GitHub', href: 'https://github.com/peetzweg' },
  { label: 'Strava', href: 'https://www.strava.com/athletes/18353420' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/peetzweg/' },
  { label: 'Ko-fi', href: 'https://ko-fi.com/peetzweg' },
];

const SPONSOR = 'https://github.com/sponsors/peetzweg';

const FEATURED_GROUPS = [
  { group: 'products', title: 'Products' },
  { group: 'upcoming', title: 'Upcoming Products' },
] as const;

function Home() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: '/' });
  const filters = parseFilters(search.filter);
  const order: Order = search.order ?? 'newest';
  const { featured, index } = Route.useLoaderData();
  const main = useRef<HTMLElement>(null);
  useJustify(main, TIMELINE_TEXT);

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

  const first = index.years.at(0)?.year;
  const last = index.years.at(-1)?.year;

  return (
    <main className="tl" ref={main}>
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
          <a className="tl-sponsor" href={SPONSOR} rel="noreferrer" target="_blank">
            <svg aria-hidden="true" fill="currentColor" height="12" viewBox="0 0 16 16" width="12">
              <path d="M8 14.25s-5.75-3.4-5.75-7.6A3.15 3.15 0 0 1 8 4.8a3.15 3.15 0 0 1 5.75 1.85c0 4.2-5.75 7.6-5.75 7.6Z" />
            </svg>
            Sponsor
          </a>
        </nav>
      </header>

      <div className="tl-featured">
        {FEATURED_GROUPS.map(({ group, title }) => (
          <section aria-labelledby={`tl-featured-${group}`} className="tl-featured-group" key={group}>
            <h2 id={`tl-featured-${group}`}>{title}</h2>
            <ul>
              {featured
                .filter((project) => project.group === group)
                .map(({ href, icon, tagline, title }) => (
                  <li key={title}>
                    <a
                      href={href}
                      rel={href.startsWith('/') ? undefined : 'noreferrer'}
                      target={href.startsWith('/') ? undefined : '_blank'}
                    >
                      <img alt="" height={icon.height} loading="lazy" src={icon.src} width={icon.width} />
                      <span className="tl-featured-name">{title}</span>
                      <span className="tl-featured-line">{tagline}</span>
                    </a>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="tl-controls">
        <div aria-label="Show only" className="tl-filters" role="group">
          {index.filters.map(({ count, id, label }) => (
            <button
              aria-pressed={filters.includes(id as FilterId)}
              className="tl-chip"
              key={id}
              onClick={() => toggle(id as FilterId)}
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
            {index.total} {index.total === 1 ? 'entry' : 'entries'}
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

      <Timeline index={index} query={search} />
    </main>
  );
}
