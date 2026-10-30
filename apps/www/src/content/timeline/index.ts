import { posts } from '../posts';
import { entries } from './entries';
import type { EntryType, TimelineEntry } from './types';

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

/** Filters above the timeline, each covering one or more entry types. */
export const FILTERS = [
  { id: 'writing', label: 'Writing', types: ['post', 'note'] },
  { id: 'projects', label: 'Projects', types: ['project'] },
  { id: 'made', label: 'Made', types: ['photo'] },
  { id: 'experiments', label: 'Experiments', types: ['experiment'] },
  { id: 'sport', label: 'Sport', types: ['activity'] },
  { id: 'books', label: 'Books', types: ['book'] },
  { id: 'links', label: 'Links', types: ['link', 'collection'] },
] as const satisfies ReadonlyArray<{ id: string; label: string; types: ReadonlyArray<EntryType> }>;

export type FilterId = (typeof FILTERS)[number]['id'];

export function isFilterId(value: unknown): value is FilterId {
  return FILTERS.some((filter) => filter.id === value);
}

/** Filters that match at least one entry; empty ones are not shown. */
export const availableFilters = FILTERS.filter(({ types }) =>
  timeline.some((entry) => (types as ReadonlyArray<EntryType>).includes(entry.type)),
);

export function filterTimeline(filter?: FilterId): TimelineEntry[] {
  const types = FILTERS.find(({ id }) => id === filter)?.types as ReadonlyArray<EntryType> | undefined;

  return types ? timeline.filter((entry) => types.includes(entry.type)) : timeline;
}

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

