import 'latex.css';
import { Link, createFileRoute } from '@tanstack/react-router';
import { posts } from '../../content/posts';

export const Route = createFileRoute('/posts/')({
  component: PostsIndex,
});

function PostsIndex() {
  return (
    <main className="latex-page">
      <article>
        <h1>Posts</h1>
        <ol className="text-lg">
          {posts.map((post) => (
            <li className="mb-2" key={post.slug}>
              <Link to="/posts/$slug" params={{ slug: post.slug }}>
                {post.title}
              </Link>
            </li>
          ))}
        </ol>
        <hr />
        <a href="/">Back</a>
      </article>
    </main>
  );
}
