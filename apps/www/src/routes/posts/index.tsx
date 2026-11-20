import { Link, createFileRoute } from '@tanstack/react-router';
import { useRef } from 'react';
import { Timeline } from '../../components/timeline/Timeline';
import { filterTimeline, groupByYear } from '../../content/timeline';
import { TIMELINE_TEXT, useJustify } from '../../justify/useJustify';
import { SITE, seo } from '../../seo';

export const Route = createFileRoute('/posts/')({
  head: () =>
    seo({
      title: `Writing · ${SITE.name}`,
      description: 'Posts and notes by Philip Poloczek, on software, tools and reading.',
      path: '/posts',
    }),
  component: PostsIndex,
});

/** The timeline's writing, on its own page. */
function PostsIndex() {
  const main = useRef<HTMLElement>(null);
  useJustify(main, TIMELINE_TEXT);

  return (
    <main className="tl tl-page" ref={main}>
      <nav className="tl-back">
        <Link to="/">
          <span aria-hidden="true">←</span> {SITE.name}
        </Link>
      </nav>
      <h1 className="tl-page-title">Writing</h1>
      <Timeline years={groupByYear(filterTimeline(['writing']))} />
    </main>
  );
}
