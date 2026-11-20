import { Link, createFileRoute } from '@tanstack/react-router';
import { Island } from '../islands/Island';
import { SITE, seo } from '../seo';

export const Route = createFileRoute('/p5')({
  head: () =>
    seo({
      title: `Generative sketches · ${SITE.name}`,
      description: 'A DIY Chromie Squiggle and Subscape, drawn live in the browser with p5.js.',
      path: '/p5',
    }),
  component: P5Page,
});

const SOURCE = 'https://github.com/peetzweg/peetzweg.com/blob/main/apps/www/src/islands';

function P5Page() {
  return (
    <main className="tl tl-page">
      <nav className="tl-back">
        <Link hash="experiment-p5" to="/">
          <span aria-hidden="true">←</span> {SITE.name}
        </Link>
      </nav>
      <article className="tl-single">
        <p className="tl-meta">
          <time dateTime="2023-11-09">Nov 9, 2023</time>
          <span className="tl-kind">Experiment</span>
        </p>
        <h1 className="tl-title">Generative sketches</h1>
        <p className="tl-text">
          Two Art Blocks projects I liked, rebuilt in p5.js to see how they work: Snowfro’s Chromie
          Squiggle, drifting along Perlin noise, and Matt DesLauriers’ Subscapes, a block of noise
          terrain. Tap the Subscape for a new one.
        </p>
        <figure className="tl-figure">
          <Island className="tl-media" name="squiggle" />
          <figcaption className="tl-facts">
            <a className="tl-url" href={`${SOURCE}/ChromieSquiggle.tsx`} rel="noreferrer" target="_blank">
              ChromieSquiggle.tsx
            </a>
          </figcaption>
        </figure>
        <figure className="tl-figure">
          <Island className="tl-media" name="subscapes" />
          <figcaption className="tl-facts">
            <a className="tl-url" href={`${SOURCE}/Subscapes.tsx`} rel="noreferrer" target="_blank">
              Subscapes.tsx
            </a>
          </figcaption>
        </figure>
      </article>
    </main>
  );
}
