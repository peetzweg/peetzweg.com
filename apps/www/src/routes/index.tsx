import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <p className="home-kicker">peet.sh / Philip Poloczek</p>
        <h1 id="home-title">building software, interfaces, tools, and small experiments.</h1>
        <p className="home-copy">
          This is the new TanStack Start shell. The old feature blocks are still
          around, but the homepage is intentionally quiet while the site gets rebuilt
          piece by piece.
        </p>
      </section>

      <nav className="home-grid" aria-label="Site sections">
        <HomeLink to="/posts/" title="Posts" detail="MDX writing and notes" />
        <HomeLink to="/hyperlinks/" title="Hyperlinks" detail="Collected links" />
        <HomeLink to="/hardware" title="Hardware" detail="Objects and DIY archive" />
        <HomeLink to="/epub" title="EPUB Reader" detail="Feature playground" />
        <HomeLink to="/running" title="Running" detail="Stats experiment" />
        <HomeLink to="/p5" title="P5" detail="Sketch archive" />
      </nav>

      <section className="home-profile-links" aria-label="Profiles">
        <a href="https://bsky.app/profile/peet.sh" rel="noreferrer" target="_blank">
          bluesky
        </a>
        <a href="https://github.com/peetzweg" rel="noreferrer" target="_blank">
          github
        </a>
        <a href="https://www.linkedin.com/in/peetzweg/" rel="noreferrer" target="_blank">
          linkedin
        </a>
        <a href="https://www.strava.com/athletes/18353420" rel="noreferrer" target="_blank">
          strava
        </a>
      </section>
    </main>
  );
}

function HomeLink({
  detail,
  title,
  to,
}: {
  detail: string;
  title: string;
  to: string;
}) {
  return (
    <Link className="home-link" to={to}>
      <span>{title}</span>
      <small>{detail}</small>
    </Link>
  );
}
