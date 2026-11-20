import { MDXProvider } from '@mdx-js/react';
import { Link, notFound, createFileRoute } from '@tanstack/react-router';
import { useRef } from 'react';
import { EntryFooter } from '../../components/timeline/EntryFooter';
import { EntryMeta } from '../../components/timeline/Timeline';
import { getPost, getPostMeta } from '../../content/posts';
import { timeline } from '../../content/timeline';
import { Island } from '../../islands/Island';
import { useJustify } from '../../justify/useJustify';
import { SITE, seo } from '../../seo';

export const Route = createFileRoute('/posts/$slug')({
  loader: ({ params }) => {
    const post = getPostMeta(params.slug);

    if (!post) {
      throw notFound();
    }

    return post;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {};
    }
    const [day, month, year] = loaderData.date.split('.');
    const page = seo({
      title: `${loaderData.title} · ${SITE.name}`,
      description: loaderData.description ?? loaderData.title,
      path: `/posts/${loaderData.slug}`,
      type: 'article',
    });
    return {
      ...page,
      meta: [...page.meta, { property: 'article:published_time', content: `${year}-${month}-${day}` }],
    };
  },
  component: PostPage,
});

/**
 * What MDX posts can use besides Markdown: `<Island name="squiggle" />` puts a live piece
 * (src/islands) in the text, loaded only when it scrolls near.
 */
const components = { Island };

function PostPage() {
  const postMeta = Route.useLoaderData();
  const post = getPost(postMeta.slug);
  const entry = timeline.find((item) => item.id === `post-${postMeta.slug}`);
  const main = useRef<HTMLElement>(null);
  useJustify(main, '.tl-prose p, .tl-prose li');

  if (!post || !entry) {
    throw notFound();
  }

  const Component = post.Component;

  return (
    <main className="tl tl-page" ref={main}>
      <nav className="tl-back">
        <Link hash={entry.id} to="/">
          <span aria-hidden="true">←</span> {SITE.name}
        </Link>
      </nav>

      <article className="tl-single">
        <EntryMeta entry={entry} withYear />
        <h1 className="tl-title">{postMeta.title}</h1>
        <div className="tl-prose">
          <MDXProvider components={components}>
            <Component />
          </MDXProvider>
        </div>
      </article>

      <EntryFooter entry={entry} />
    </main>
  );
}
