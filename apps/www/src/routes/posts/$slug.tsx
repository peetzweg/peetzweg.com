import { notFound, createFileRoute } from '@tanstack/react-router';
import { getPost, getPostMeta } from '../../content/posts';

export const Route = createFileRoute('/posts/$slug')({
  loader: ({ params }) => {
    const post = getPostMeta(params.slug);

    if (!post) {
      throw notFound();
    }

    return post;
  },
  component: PostPage,
});

function PostPage() {
  const postMeta = Route.useLoaderData();
  const post = getPost(postMeta.slug);

  if (!post) {
    throw notFound();
  }

  const Component = post.Component;

  return (
    <main className="content-page">
      <article>
        <h1>{postMeta.title}</h1>
        <Component />
        <hr />
        <a href="/posts/">Back</a>
      </article>
    </main>
  );
}
