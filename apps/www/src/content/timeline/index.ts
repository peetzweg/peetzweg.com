import { posts } from '../posts';
import { entries } from './entries';
import type { Tweet } from 'react-tweet/api';
import { FILTERS, typesOf, type FilterId, type Order } from './filters';
import type { Image, Media, TimelineEntry } from './types';

export type { Image, Media, TimelineEntry, EntryType } from './types';
export * from './filters';

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

/** Filters that match at least one entry, with how many they match. Empty ones are not shown. */
export const availableFilters = FILTERS.map((filter) => ({
  id: filter.id as FilterId,
  label: filter.label,
  count: timeline.filter((entry) => typesOf(filter.id).includes(entry.type)).length,
})).filter(({ count }) => count > 0);

/** Entries of any of the selected filters, or all of them when none is selected. */
export function filterTimeline(filters: ReadonlyArray<FilterId>, order: Order = 'newest'): TimelineEntry[] {
  const types = new Set(filters.flatMap(typesOf));
  const list = types.size ? timeline.filter((entry) => types.has(entry.type)) : timeline;

  return order === 'oldest' ? [...list].reverse() : list;
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

/* Permalinks. Posts, experiments and collections already have a page; every other
   entry gets one at `/<slug>`, short and dateless like sive.rs. */

/** Top-level paths taken by routes, which entry pages must not shadow. */
const RESERVED = new Set([
  'posts',
  'hyperlinks',
  'hardware',
  'models',
  'p5',
  'epub',
  'punchcard',
  'running',
  'strava',
  'vocabulary',
  'assets',
]);

function slugify(text: string) {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** The entry's own page: an existing route, or `/<slug>` for an entry page. */
export function entryPath(entry: TimelineEntry): string {
  switch (entry.type) {
    case 'post':
      return `/posts/${entry.slug}`;
    case 'experiment':
    case 'collection':
      return entry.to;
    default:
      return `/${entrySlug(entry)}`;
  }
}

function entrySlug(entry: TimelineEntry): string {
  switch (entry.type) {
    case 'work':
      return entry.id.replace(/^work-/, '');
    case 'photo':
      return entry.id.replace(/^hardware-/, '');
    case 'note':
    case 'tweet':
      return entry.id;
    case 'post':
      return entry.slug;
    case 'experiment':
    case 'collection':
      return entry.to.slice(1);
    default:
      return slugify(entry.title);
  }
}

/** Entries shown on their own page at `/<slug>`. */
export const entryPages = new Map<string, TimelineEntry>();

for (const entry of timeline) {
  const path = entryPath(entry);
  if (entry.type === 'post' || entry.type === 'experiment' || entry.type === 'collection') {
    continue;
  }
  const slug = path.slice(1);
  if (RESERVED.has(slug) || entryPages.has(slug)) {
    throw new Error(`Timeline slug "${slug}" (${entry.id}) is already taken; rename the entry.`);
  }
  entryPages.set(slug, entry);
}

/** Where `/#<anchor>` lands on the homepage: the entry's slug, or its id if it has a page elsewhere. */
export function entryAnchor(entry: TimelineEntry): string {
  const slug = entryPath(entry).slice(1);
  return entryPages.has(slug) ? slug : entry.id;
}

/** The heading an entry is known by. */
export function entryTitle(entry: TimelineEntry): string {
  switch (entry.type) {
    case 'work':
      return entry.client;
    case 'photo':
      return entry.caption;
    case 'note':
      return truncate(entry.text, 60);
    case 'tweet':
      return truncate(tweetText(entry.tweet), 60);
    default:
      return entry.title;
  }
}

function truncate(text: string, length: number) {
  return text.length > length ? `${text.slice(0, length - 1).trimEnd()}…` : text;
}

/** A tweet's own words, without the trailing t.co link to its media. */
function tweetText(tweet: Tweet) {
  const [start, end] = tweet.display_text_range;
  return [...tweet.text]
    .slice(start, end)
    .join('')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

/** One or two sentences about an entry, for search results and link previews. */
export function entrySummary(entry: TimelineEntry): string {
  switch (entry.type) {
    case 'post':
      return entry.excerpt;
    case 'project':
    case 'experiment':
    case 'collection':
      return entry.description;
    case 'work':
      return `${entry.role}. ${entry.description}`;
    case 'photo':
      return `${entry.caption}. Made by Philip Poloczek.`;
    case 'link':
      return entry.note ? `${entry.note}: ${entry.title}` : entry.title;
    case 'note':
      return entry.text;
    case 'tweet':
      return tweetText(entry.tweet);
    case 'video':
      return `${entry.title}. A video on YouTube.`;
    case 'book':
      return `${entry.title} by ${entry.author}`;
    case 'activity': {
      const kind = entry.sport === 'Run' ? 'run' : 'ride';
      return entry.stats
        ? `A ${entry.stats.distance} km ${kind} with ${entry.stats.elevation} m of climbing, in ${entry.stats.time}.`
        : `A ${kind}, on Strava.`;
    }
  }
}

function firstImage(media?: Media): Image | undefined {
  switch (media?.kind) {
    case 'image':
    case 'thumb':
      return media.image;
    case 'gallery':
    case 'row':
      return media.images[0];
    case 'video':
    case 'live':
    case 'scroll':
      return media.poster;
    default:
      return undefined;
  }
}

/** A picture for link previews, if the entry has one. */
export function entryImage(entry: TimelineEntry): Image | undefined {
  switch (entry.type) {
    case 'photo':
      return entry.image;
    case 'activity':
      return entry.map;
    case 'book':
      return entry.cover;
    case 'video':
      return entry.thumbnail;
    case 'tweet': {
      const media = entry.tweet.mediaDetails?.[0];
      return media
        ? {
            src: media.media_url_https,
            alt: tweetText(entry.tweet),
            width: media.original_info.width,
            height: media.original_info.height,
          }
        : undefined;
    }
    case 'project':
    case 'work':
    case 'experiment':
    case 'link':
      return firstImage(entry.media);
    default:
      return undefined;
  }
}

/** The entries before and after this one, oldest to newest. */
export function neighbours(entry: TimelineEntry): { older?: TimelineEntry; newer?: TimelineEntry } {
  const index = timeline.indexOf(entry);
  return { newer: timeline[index - 1], older: timeline[index + 1] };
}
