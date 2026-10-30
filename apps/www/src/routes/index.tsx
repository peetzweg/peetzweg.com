import { Link, createFileRoute } from '@tanstack/react-router';
import { Timeline } from '../components/timeline/Timeline';
import {
  availableFilters,
  filterTimeline,
  groupByYear,
  isFilterId,
  type FilterId,
} from '../content/timeline';

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): { filter?: FilterId } =>
    isFilterId(search.filter) ? { filter: search.filter } : {},
  component: Home,
});

const PROFILES = [
  { label: 'X', href: 'https://x.com/peetzweg' },
  { label: 'Bluesky', href: 'https://bsky.app/profile/peet.sh' },
  { label: 'GitHub', href: 'https://github.com/peetzweg' },
  { label: 'Strava', href: 'https://www.strava.com/athletes/18353420' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/peetzweg/' },
];

function Home() {
  const { filter } = Route.useSearch();
  const years = groupByYear(filterTimeline(filter));

  return (
    <main className="tl">
      <header className="tl-intro">
        <h1>Philip Poloczek</h1>
        <p>
          Building software, interfaces, tools and small experiments. This is
          everything I made, wrote and saved, newest first.
        </p>
        <nav aria-label="Profiles" className="tl-profiles">
          {PROFILES.map(({ href, label }) => (
            <a href={href} key={label} rel="noreferrer" target="_blank">
              {label}
            </a>
          ))}
        </nav>
      </header>

      <nav aria-label="Filter the timeline" className="tl-filters">
        <FilterLink active={!filter} label="All" />
        {availableFilters.map(({ id, label }) => (
          <FilterLink active={filter === id} filter={id} key={id} label={label} />
        ))}
      </nav>

      <Timeline years={years} />
    </main>
  );
}

function FilterLink({ active, filter, label }: { active: boolean; filter?: FilterId; label: string }) {
  return (
    <Link
      aria-current={active ? 'page' : undefined}
      className="tl-filter"
      replace
      resetScroll={false}
      search={filter ? { filter } : {}}
      to="/"
    >
      {label}
    </Link>
  );
}
