import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <main className="home-page">
      <section className="arena-hero" aria-labelledby="home-title">
        <div className="arena-mark" aria-hidden="true">
          <img src="/set2/1.png" alt="" />
          <img src="/set2/2.png" alt="" />
          <img src="/set2/3.png" alt="" />
        </div>

        <div className="arena-corner">◠◠</div>

        <div className="arena-grid">
          <p className="arena-label">peet.sh /</p>

          <div className="arena-main">
            <p>Philip Poloczek</p>
            <h1 id="home-title">
              building software, interfaces, tools, and small experiments.
            </h1>
          </div>

          <nav aria-label="Site sections" className="arena-links">
            <Link to="/posts">posts</Link>
            <Link to="/hyperlinks">hyperlinks</Link>
            <Link to="/hardware">hardware</Link>
            <Link to="/epub">epub reader</Link>
            <Link to="/running">running</Link>
            <Link to="/p5">p5</Link>
          </nav>

          <nav aria-label="Profiles" className="arena-links arena-profiles">
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
          </nav>
        </div>

        <a className="arena-scroll" href="#site-index">
          scroll for rebuild map
          <span>↓</span>
        </a>
      </section>

      <section className="home-index" id="site-index" aria-label="Rebuild map">
        <HomeLink to="/posts/" title="Posts" detail="MDX writing is kept and moved first-class into Start." />
        <HomeLink to="/hyperlinks/" title="Hyperlinks" detail="The link archive is already part of the new shell." />
        <HomeLink to="/hardware" title="Hardware" detail="A separate visual page, free to keep its own look." />
        <HomeLink to="/epub" title="EPUB Reader" detail="Parked for a cleaner MDX block rebuild." />
        <HomeLink to="/running" title="Running" detail="Waiting for the database-backed stats path." />
        <HomeLink to="/p5" title="P5" detail="Future sketch workspace, not old bundle baggage." />
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
