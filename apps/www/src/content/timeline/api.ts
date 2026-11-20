import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { setResponseHeader } from '@tanstack/react-start/server';
import {
  availableFilters,
  entryAnchor,
  entryImage,
  entryPages,
  entryPath,
  entrySummary,
  entryTitle,
  filterTimeline,
  neighbours,
  parseFilters,
  timeline,
  type Order,
} from '.';
import type { Neighbour, TimelineEntry, TimelineIndex, TimelineItem, TimelinePageRef } from './types';

/*
 * The timeline reaches the browser through these server functions, never as a bundle: the
 * homepage gets the years, counts and first page, and the rest comes a page at a time as it
 * scrolls near (see components/timeline/Timeline.tsx). Everything here is fixed at build
 * time, so the answers are cached like files.
 */

/** Entries per page. Each year starts a new page, so a page never spans two years. */
const PAGE_SIZE = 24;

export type TimelineQuery = { filter?: string; order?: Order };

type Paged = { index: Omit<TimelineIndex, 'pages'>; pages: Map<string, TimelineItem[]> };

const paged = new Map<string, Paged>();

/** The timeline for a filter and order, cut into pages. Worked out once per filter and order. */
function pagesFor(query: TimelineQuery): Paged {
  const filters = parseFilters(query.filter);
  const order: Order = query.order === 'oldest' ? 'oldest' : 'newest';
  const id = `${filters.join(',')}|${order}`;
  const cached = paged.get(id);
  if (cached) {
    return cached;
  }

  const pages = new Map<string, TimelineItem[]>();
  const years: Array<{ year: string; count: number; pages: TimelinePageRef[] }> = [];
  const list = filterTimeline(filters, order);
  for (const entry of list) {
    const year = entry.date.slice(0, 4);
    if (years.at(-1)?.year !== year) {
      years.push({ year, count: 0, pages: [] });
    }
    const current = years.at(-1)!;
    if (current.count % PAGE_SIZE === 0) {
      const key = `${year}.${current.pages.length}`;
      current.pages.push({ key, count: 0, height: 0 });
      pages.set(key, []);
    }
    const page = current.pages.at(-1)!;
    pages.get(page.key)!.push(item(entry));
    page.count++;
    page.height += estimateHeight(entry);
    current.count++;
  }

  const result = { index: { filters: availableFilters, total: list.length, years }, pages };
  paged.set(id, result);
  return result;
}

function item(entry: TimelineEntry): TimelineItem {
  return { ...entry, path: entryPath(entry), anchor: entryAnchor(entry) };
}

/** About how tall an entry is on screen, in rem: between phone and desktop, measured with pictures loaded. */
function estimateHeight(entry: TimelineEntry): number {
  switch (entry.type) {
    case 'photo':
      return 36;
    case 'tweet':
      return entry.tweet.mediaDetails?.length ? 32 : 14;
    case 'activity':
      return 32;
    case 'video':
      return 22;
    case 'collection':
      return 13;
    case 'post':
      return 9;
    case 'link':
    case 'book':
    case 'note':
      return 7;
    default:
      return 'media' in entry && entry.media && entry.media.kind !== 'thumb' ? 25 : 10;
  }
}

/** Fixed until the next deploy; browsers may keep it a few minutes. */
function cacheable() {
  setResponseHeader('Cache-Control', 'public, max-age=300');
}

function readQuery(input: unknown): TimelineQuery {
  const { filter, order } = (input ?? {}) as Record<string, unknown>;
  return {
    filter: typeof filter === 'string' ? filter : undefined,
    order: order === 'oldest' ? 'oldest' : undefined,
  };
}

/** Years, counts and filters, with the first pages: at least a page's worth of entries. */
export const getTimeline = createServerFn({ method: 'GET' })
  .validator(readQuery)
  .handler(({ data }): TimelineIndex => {
    cacheable();
    const { index, pages } = pagesFor(data);
    const first: TimelineIndex['pages'] = {};
    let count = 0;
    for (const page of index.years.flatMap((year) => year.pages)) {
      if (count >= PAGE_SIZE) break;
      first[page.key] = pages.get(page.key)!;
      count += page.count;
    }
    return { ...index, pages: first };
  });

/** More pages, by key. */
export const getTimelinePages = createServerFn({ method: 'GET' })
  .validator((input: unknown) => {
    const keys = (input as { keys?: unknown })?.keys;
    return { ...readQuery(input), keys: Array.isArray(keys) ? keys.filter((key) => typeof key === 'string').slice(0, 24) : [] };
  })
  .handler(({ data }) => {
    cacheable();
    const { pages } = pagesFor(data);
    return Object.fromEntries(data.keys.flatMap((key) => (pages.has(key) ? [[key, pages.get(key)!]] : []))) as Record<
      string,
      TimelineItem[]
    >;
  });

/** The page an entry is on, to open `/#<anchor>` when its page isn't loaded yet. */
export const findTimelineEntry = createServerFn({ method: 'GET' })
  .validator((input: unknown) => ({ ...readQuery(input), anchor: String((input as { anchor?: unknown })?.anchor ?? '') }))
  .handler(({ data }) => {
    cacheable();
    for (const [key, items] of pagesFor(data).pages) {
      if (items.some((entry) => entry.anchor === data.anchor || entry.id === data.anchor)) {
        return key;
      }
    }
    return null;
  });

/**
 * One entry with its neighbours, for its own page: by slug (`/papr`) or, for entries whose
 * page is elsewhere like posts, by id.
 */
export const getEntry = createServerFn({ method: 'GET' })
  .validator((input: unknown) => {
    const { id, slug } = (input ?? {}) as Record<string, unknown>;
    return { id: typeof id === 'string' ? id : undefined, slug: typeof slug === 'string' ? slug : undefined };
  })
  .handler(({ data }) => {
    const entry = data.slug ? entryPages.get(data.slug) : timeline.find((candidate) => candidate.id === data.id);
    if (!entry) {
      throw notFound();
    }
    cacheable();
    const { newer, older } = neighbours(entry);
    const image = entryImage(entry);
    return {
      entry: item(entry),
      newer: newer && neighbour(newer),
      older: older && neighbour(older),
      title: entryTitle(entry),
      summary: entrySummary(entry),
      image: image ? { ...image, alt: image.alt || entryTitle(entry) } : undefined,
    };
  });

function neighbour(entry: TimelineEntry): Neighbour {
  return { path: entryPath(entry), title: entryTitle(entry) };
}
