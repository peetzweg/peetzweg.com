import type { ComponentType } from 'react';

type PostModule = {
  default: ComponentType;
  frontmatter: {
    author?: string;
    date: string;
    title: string;
  };
};

const modules = import.meta.glob('../routes/posts/*.mdx', {
  eager: true,
}) as Record<string, PostModule>;

export type Post = {
  author?: string;
  Component: ComponentType;
  date: string;
  slug: string;
  title: string;
};

export const posts = Object.entries(modules)
  .map(([path, module]) => {
    const slug = path.split('/').pop()?.replace(/\.mdx$/, '') ?? '';

    return {
      author: module.frontmatter.author,
      Component: module.default,
      date: module.frontmatter.date,
      slug,
      title: module.frontmatter.title,
    };
  })
  .sort((a, b) => getPostTime(b.date) - getPostTime(a.date));

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}

export function getPostMeta(slug: string) {
  const post = getPost(slug);

  if (!post) {
    return undefined;
  }

  return {
    author: post.author,
    date: post.date,
    slug: post.slug,
    title: post.title,
  };
}

function getPostTime(date: string) {
  const [day, month, year] = date.split('.').map(Number);
  return new Date(year, month - 1, day).getTime();
}
