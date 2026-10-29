import { Link, createFileRoute } from '@tanstack/react-router';
import { Timeline } from '../components/timeline/Timeline';
import { groupByYear, timeline } from '../content/timeline';

export const Route = createFileRoute('/')({
  component: Home,
});

const PROFILES = [
  { label: 'X', href: 'https://x.com/peetzweg' },
  { label: 'Bluesky', href: 'https://bsky.app/profile/peet.sh' },
  { label: 'GitHub', href: 'https://github.com/peetzweg' },
  { label: 'Strava', href: 'https://www.strava.com/athletes/18353420' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/peetzweg/' },
];

/** Ongoing collections live on their own pages instead of in the timeline. */
const PAGES = [
  { label: 'Writing', to: '/posts' },
  { label: 'Hyperlinks', to: '/hyperlinks' },
  { label: 'Running', to: '/running' },
  { label: 'Made by hand', to: '/hardware' },
] as const;

const years = groupByYear(timeline);

function Home() {
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
        <nav aria-label="Pages" className="tl-profiles tl-pages">
          {PAGES.map(({ label, to }) => (
            <Link key={to} to={to}>
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <Timeline years={years} />
    </main>
  );
}
