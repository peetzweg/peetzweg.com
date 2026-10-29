import { posts } from '../posts';
import { entries } from './entries';
import type { TimelineEntry } from './types';

export type { Image, TimelineEntry, EntryType } from './types';

const postEntries: TimelineEntry[] = posts.map((post) => {
  const [day, month, year] = post.date.split('.');

  return {
    id: `post-${post.slug}`,
    type: 'post',
    date: `${year}-${month}-${day}`,
    title: post.title,
    slug: post.slug,
    excerpt: post.description ?? '',
  };
});

/** Newest first. Equal dates keep their authored order. */
export const timeline: TimelineEntry[] = [...entries, ...postEntries].sort((a, b) =>
  b.date.localeCompare(a.date),
);

export type TimelineYear = { year: string; entries: TimelineEntry[] };

export function groupByYear(list: TimelineEntry[]): TimelineYear[] {
  const years: TimelineYear[] = [];
  for (const entry of list) {
    const year = entry.date.slice(0, 4);
    const last = years.at(-1);
    if (last?.year === year) {
      last.entries.push(entry);
    } else {
      years.push({ year, entries: [entry] });
    }
  }
  return years;
}

