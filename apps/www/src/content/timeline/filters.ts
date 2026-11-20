import type { EntryType } from './types';

/*
 * The filters above the timeline. Kept apart from the entries so the browser can read and
 * write `?filter=` without loading any of them.
 */

/** Filters above the timeline, each covering one or more entry types. */
export const FILTERS = [
  { id: 'writing', label: 'Writing', types: ['post', 'note', 'tweet'] },
  { id: 'projects', label: 'Projects', types: ['project'] },
  { id: 'work', label: 'Client work', types: ['work'] },
  { id: 'made', label: 'Made', types: ['photo'] },
  { id: 'experiments', label: 'Experiments', types: ['experiment'] },
  { id: 'sport', label: 'Sport', types: ['activity'] },
  { id: 'videos', label: 'Videos', types: ['video'] },
  { id: 'books', label: 'Books', types: ['book'] },
  { id: 'links', label: 'Links', types: ['link', 'collection'] },
] as const satisfies ReadonlyArray<{ id: string; label: string; types: ReadonlyArray<EntryType> }>;

export type FilterId = (typeof FILTERS)[number]['id'];

export type Order = 'newest' | 'oldest';

export function typesOf(id: FilterId): ReadonlyArray<EntryType> {
  return FILTERS.find((filter) => filter.id === id)?.types ?? [];
}

/**
 * Selected filters live in the URL as `?filter=projects,work`. Unknown ids are dropped
 * and the rest are put in FILTERS order, so each selection has one URL.
 */
export function parseFilters(value: unknown): FilterId[] {
  const ids = typeof value === 'string' ? value.split(',') : Array.isArray(value) ? value : [];
  return FILTERS.map(({ id }) => id).filter((id) => ids.includes(id));
}

export function serializeFilters(filters: ReadonlyArray<FilterId>): string | undefined {
  return filters.length ? parseFilters(filters.join(',')).join(',') : undefined;
}
